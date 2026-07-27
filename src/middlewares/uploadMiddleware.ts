import multer from 'multer';
import path from 'path';

// Usamos almacenamiento en memoria para poder pasar la imagen a `sharp` antes de guardarla en disco.
const storage = multer.memoryStorage();

// Filtro para asegurarnos de que solo se suban imágenes
const fileFilter = (req: Express.Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Formato de archivo no válido. Solo se permiten imágenes (JPEG, PNG, WEBP, GIF).'));
  }
};

// Middleware configurado (límite de 5MB)
export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
});
