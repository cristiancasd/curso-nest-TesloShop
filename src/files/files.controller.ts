import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, UploadedFile, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { FilesService } from './files.service';
import { fileFilter } from './helpers/fileFilter.helper';
import { fileNamer } from './helpers/fileNamer';

@Controller('files')
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

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
    if(!file){
      throw new BadRequestException('Make sure that the file is an image')
    }

    return {
      fileName: file.originalname
    }
  }

}
