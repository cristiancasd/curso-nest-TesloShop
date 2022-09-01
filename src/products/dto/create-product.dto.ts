import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsIn, IsNumber, IsOptional, IsPositive, IsString, MinLength } from "class-validator";

export class CreateProductDto {

    @ApiProperty({
        description: 'Product Title'
    })
    @IsString()
    @MinLength(1)
    title: string;
    
    @ApiProperty({
        description: 'Price, it is a float number'
    })
    @IsNumber()
    @IsPositive()
    @IsOptional()
    price?: number;
    
    @ApiProperty({
        description: 'Product description'
    })
    @IsString()
    @IsOptional()
    description?: string;

    @ApiProperty({
        description: 'Product Slug'
    })
    @IsString()
    @IsOptional()
    slug?: string;

    @ApiProperty({
        description: 'Stock: it is a number'
    })
    @IsNumber()
    @IsPositive()
    @IsOptional()
    stock?: number;

    @ApiProperty({
        description: 'Product size, it is array string'
    })
    @IsString({each: true}) //Cada elemento del arreglo debe ser string
    @IsArray()
    sizes: string[];

    @ApiProperty({
        description: 'Product gender'
    })
    @IsIn(['men','women','kid','unisex'])
    gender: string;

    @ApiProperty({
        description: 'Product tags, it is array string'
    })
    @IsString({each: true}) //Cada elemento del arreglo debe ser string
    @IsArray()
    @IsOptional()
    tags: string[];

    @ApiProperty({
        description: 'Product images, it is array strings'
    })
    @IsString({each: true}) 
    @IsArray()
    @IsOptional()
    images?: string[];
}
