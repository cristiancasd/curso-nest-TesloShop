//import { User } from 'src/auth/entities/user.entity';
import { User } from '../../auth/entities/user.entity';
import {BeforeInsert, BeforeUpdate, Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn, } from 'typeorm'
import { ProductImage } from './product-image.entity';
import { ApiProperty } from '@nestjs/swagger';

@Entity({name: 'products'})
export class Product {

    @ApiProperty({
        example:'1db34b69-7a41-42f4-8ab0-02911a12315e',
        description: 'Product ID',
        uniqueItems: true
    })
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ApiProperty({
        example:"Men's Quilted Shirt Jacket",
        description: 'Product Title',
        uniqueItems: true
    })
    @Column('text', {
        unique: true,
    })
    title: string;

    @ApiProperty({
        example:200.67,
        description: 'Product Price',
        default: 0
    })
    @Column('float',{
        default: 0
    })
    price:number;

    @ApiProperty({
        example:"The Men's Quilted Shirt Jacket features a uniquely fit ...",
        description: 'Product Description',
        default: null
    })
    @Column({
        type: 'text',
        nullable: true
    })
    description: string;

    @ApiProperty({
        example:'men_quilted_shirt_jacket',
        description: 'Product Slug',
        uniqueItems: true,
    })
    @Column('text',{
        unique: true
    })
    slug: string;

    @ApiProperty({
        example:10,
        description: 'Product Stock',
        default: 0
    })
    @Column('int',{
        default:0
    })
    stock: number;

    @ApiProperty({
        example:['M','XL'],
        description: 'Product Sizes',
    })
    @Column('text',{
        array: true
    })
    sizes: string[];

    @ApiProperty({
        example:['men'],
        description: 'Product Gender',
    })
    @Column('text')
    gender: string;

    @ApiProperty({
        example:['jacket'],
        description: 'Product Tags',
        default: []
    })
    @Column('text',{
        array: true,
        default: [],
    })
    tags: string[];

    //Un producto puede tener muchas imagenes
    @ApiProperty({
        example:['1740507-00-A_0_2000.jpg',
        '1740507-00-A_1.jpg',],
        description: 'Product Images',
    })
    @OneToMany(
        ()=>ProductImage,
        (productImage)=>productImage.product,
        {cascade: true, eager: true}
    ) 
    images?: ProductImage[];

    @ManyToOne(
        ()=>User,
        (user)=>user.product,
        {eager: true}
    )
    user: User

    @BeforeInsert()
    checkSlugInsert(){
        if(!this.slug){
            this.slug=this.title;
        }
        this.slug=this.slug 
            .toLowerCase()
            .replaceAll(' ','_')
            .replaceAll("'",'')
    }

    @BeforeUpdate()
    checkSlugUpdate(){        
        this.slug=this.slug 
            .toLowerCase()
            .replaceAll(' ','_')
            .replaceAll("'",'')
    }
}
