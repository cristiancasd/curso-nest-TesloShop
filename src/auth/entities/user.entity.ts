//import { Product } from "src/products/entities/product.entity";
import { Product } from "../../products/entities/product.entity";

import { BeforeInsert, BeforeUpdate, Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { ApiProperty } from "@nestjs/swagger";

@Entity('users')
export class User {

    @ApiProperty({
        example:'1db34b69-7a41-42f4-8ab0-02911a12315e',
        description: 'User ID',
        uniqueItems: true
    })
    @PrimaryGeneratedColumn('uuid')
    id: string;
    
    @ApiProperty({
        example:'admin@mail.co',
        description: 'User email',
        uniqueItems: true
    })
    @Column('text',{
        unique: true
    })
    email: string;
    
    @ApiProperty({
        example:'Abc123',
        description: 'Password email',
    })
    @Column('text',{
        select: false, //En find y querybuilder no se incluye
    })
    password: string;
    
    @ApiProperty({
        example:'Cristian Salazar',
        description: 'User FullName',
    })
    @Column('text')
    fullName: string;
    
    @ApiProperty({
        example:true,
        description: 'User Active state',
        default: true,
    })
    @Column('bool',{
        default: true,
    })
    isActive: boolean;
    
    @ApiProperty({
        example:['admin', 'super-user','user'],
        description: 'User roles',
    })
    @Column('text',{
        array: true,
        default: ['user']
    })
    roles: string[];

    @OneToMany(
        ()=>Product,
        (product)=>product,
    ) 
    product: Product;

    @BeforeInsert()
    checkFieldsBeforeInsert(){
        this.email=this.email.toLowerCase().trim();
    }
    @BeforeUpdate()
    checkFieldsBeforeUpdate(){
        this.checkFieldsBeforeInsert()
    }
}
