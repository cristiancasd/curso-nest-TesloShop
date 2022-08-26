import { Injectable } from '@nestjs/common';
import { ProductsService } from '../products/products.service';
import { initialData } from './data/seed-data';


@Injectable()
export class SeedService {

  constructor(
    private readonly productsService: ProductsService
  ){}


  async runSeed() {
    await this.insertNewProducts();
    return `Seed Excuted`;
  }

  private async insertNewProducts(){
    await this.productsService.deleteAllProductos();
    const seedProducts=initialData.products;
    const insertPromises=[];
    seedProducts.forEach(seedProduct=>{
      insertPromises.push(this.productsService.create(seedProduct));
    });
    await Promise.all(insertPromises)
    return true;
  }
}
