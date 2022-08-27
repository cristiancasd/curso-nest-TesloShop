
// La función tiene la estructura para que se permitido usar en el FileInterceptor
export const fileFilter=
    (req: Express.Request, file: Express.Multer.File, callback: Function)=>
{

    console.log('estoy en fileFiler');
    if(!file) return callback(new Error('File is empty'), false);
    const fileExtension=file.mimetype.split('/')[1];
    const validExtensions=['jpg','jpeg','png','gif'];
    
    console.log('fileFiler: Voy a validar extension');
    if(validExtensions.includes(fileExtension)){
        return callback(null, true)
    }

    callback(null,false);
         
}