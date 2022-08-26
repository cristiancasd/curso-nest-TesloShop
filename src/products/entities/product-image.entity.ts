import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Product } from './product.entity';

@Entity({name: 'product_images'})
export class ProductImage{
    @PrimaryGeneratedColumn() //se autoincrementa solo
    id: number;

    @Column('text')
    url: string;

    @ManyToOne(
        ()=>Product,
        (product)=>product.images,
        {onDelete: 'CASCADE'} //Si se borra el producto también la imagén
    )
    product: Product
}