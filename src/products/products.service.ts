import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { DataSource, Repository } from 'typeorm';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product } from './entities/product.entity';
import { validate as isUUID } from 'uuid'
import { ProductImage } from './entities/product-image.entity';
import { User } from 'src/auth/entities/user.entity';

@Injectable()
export class ProductsService {
  private readonly logger = new Logger('ProductsService');

  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(ProductImage)
    private readonly productImageRepository: Repository<ProductImage>,
    
    private readonly dataSource: DataSource,
    ){}

  async create(createProductDto: CreateProductDto, user: User) {
    try{
      const {images=[], ...productDetails} = createProductDto;
      //const product= this.productRepository.create(createProductDto);
      const product= this.productRepository.create({
        ...productDetails,
        images: images.map(image=>this.productImageRepository.create({url: image})),
        user,
      });
      
      await this.productRepository.save(product);
      return { ...product, images};

    }catch(error){
      this.logger.error(error)
      this.handleDBExceptions(error);
    }
  }

  async findAll(paginationDto: PaginationDto ) {
    const {limit=10, offset=0}=paginationDto;
    // return this.productRepository.find({

    const products=await this.productRepository.find({
      take: limit,
      skip: offset,
      relations: {
        images: true
      }
    });
    
    // Puedo retornar solo products, pero así es más ordenado 
    return products.map(product=>({
      ...product,
      images: product.images.map(img=>img.url)
    }))
  }

  async findOne(term: string) {
    
    let product: Product;
    const queryBuilder=this.productRepository.createQueryBuilder('prod');
    
    isUUID(term)
      ? product=await this.productRepository.findOneBy({id: term})
      : product=await queryBuilder.where('UPPER(title) =:title or slug =:slug',{
          title: term.toUpperCase(),
          slug: term.toLowerCase(),
        }).leftJoinAndSelect('prod.images','pordImages') //Para poder ver las imagenes
        .getOne();  
    
    if(!product) 
      throw new NotFoundException(`Product with ${term} not found`)
    
    return product;
  }
  
  
  //Sirve para hacer la busqueda
  async findOnePlain(term: string){
    const {images=[], ...rest}=await this.findOne(term);
    return{
      ...rest,
      images: images.map(image=>image.url)
    }
  }

  async update(id: string, updateProductDto: UpdateProductDto, user: User) {
    
    const {images, ...toUpdate}=updateProductDto;

    const product=await this.productRepository.preload({
      id,
      ...toUpdate,      
    });

    if(!product) throw new NotFoundException(`Product with id ${id} not found`);
    
    //Inicio transacción
    const queryRunner=this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try{
      if(images){

        //Trnsacción: eliminar las imagenes anteriores y generar el arreglo de las nuevas img
        await queryRunner.manager.delete(ProductImage, {product: {id}})
        product.images=images.map(
          image=>this.productImageRepository.create({url: image})
        )
      }
      
      ////await this.productRepository.save(product);
      product.user=user;
      //Transacción: Guardar datos
      await queryRunner.manager.save(product); // Intenta guardar. aún no impácta la base de datos
      await queryRunner.commitTransaction();   // Si nmo hubo errores, aplica los cambios
      await queryRunner.release();             // Cerrar

      return this.findOnePlain(id);
      
    }catch(error){
      
      //Transacción: Devolver transacci+pm
      await queryRunner.rollbackTransaction(); // Si guardar o eliminar falla, devuelve transacción
      await queryRunner.release();  // Cerrar

      this.logger.error(error)
      this.handleDBExceptions(error)
    }
  }

  async remove(id: string) {
    const product=await this.findOne(id);
    await this.productRepository.remove(product);    
  }

  private handleDBExceptions(error: any){
    if(error.code==='23505')
      throw new BadRequestException(error.detail);

    throw new InternalServerErrorException('Unexpected error, check server logs');
  }


  async deleteAllProductos(){
    const query=this.productRepository.createQueryBuilder('product');
    try{
      return await query
        .delete()
        .where({})
        .execute();
    }catch(error){
      this.handleDBExceptions(error);
    }
  }

}
