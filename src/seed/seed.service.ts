import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../auth/entities/user.entity';
import { Repository } from 'typeorm';
import { ProductsService } from '../products/products.service';
import { initialData } from './data/seed-data';


@Injectable()
export class SeedService {

  constructor(
    private readonly productsService: ProductsService,
    
    @InjectRepository(User) //Inyectamos repositorio para poder borrar los usuarios
    private readonly userRepository: Repository<User>
  ){}


  async runSeed() {
    await this.deleteTables();
    const firstUser=await this.insertUsers();
    await this.insertNewProducts(firstUser);
    return `Seed Excuted`;
  }

  private async deleteTables(){
    await this.productsService.deleteAllProductos();
    //En userRepository no está implementado borrar todos los users, lo implementamos aquí
    const queryBuilder=this.userRepository.createQueryBuilder()
    await queryBuilder
      .delete()
      .where({}) // Borra todo
      .execute()
  }

  private async insertUsers(){
    const seedUsers=initialData.users;
    const users: User[]=[];
    seedUsers.forEach(user=>{
      users.push(this.userRepository.create(user))
    });
    const dbUsers=await this.userRepository.save(seedUsers)
    return dbUsers[0]
  }

  private async insertNewProducts(user: User){
    await this.productsService.deleteAllProductos();
    const seedProducts=initialData.products;
    const insertPromises=[];
    seedProducts.forEach(seedProduct=>{
      insertPromises.push(this.productsService.create(seedProduct, user));
    });
    await Promise.all(insertPromises)
    return true;
  } 
}
