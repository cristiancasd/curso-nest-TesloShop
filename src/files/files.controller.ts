import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, UploadedFile, BadRequestException, Res } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { diskStorage } from 'multer';
import { FilesService } from './files.service';
import { fileFilter } from './helpers/fileFilter.helper';
import { fileNamer } from './helpers/fileNamer';

@Controller('files')
export class FilesController {
  constructor(
    private readonly filesService: FilesService,
    private readonly configService: ConfigService,) {}

  @Get('product/:imageName')
  findProductImage(
    @Res() res: Response, //Mostrar la iamgen, yo me encargo de la respuesta, no NEST
    @Param('imageName') imageName: string
  ){
    const path=this.filesService.getStaticProductImage(imageName)
    res.sendFile(path);
  }


  @Post('product')
  @UseInterceptors(FileInterceptor('file',{
    fileFilter: fileFilter, // Si viene un file. Reviso si el file es una imagen
    storage: diskStorage({
      destination: './static/products',
      filename: fileNamer, // Renombro el archivo guardado
    })
  }))

  uploadPorductImage(
    @UploadedFile() file: Express.Multer.File,
  ){

    console.log(' estoy en uploadPorductImage')
    if(!file){
      throw new BadRequestException('Make sure that the file is an image')
    }
    //const secureUrl=`${file.filename}`

    //return {fileName: file.originalname}
    //return {secureUrl}
    const secureUrl=this.configService.get('HOST_API') +'/files/product/'+file.filename
    return {secureUrl}
  }
}
