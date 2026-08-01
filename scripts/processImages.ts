import fs from 'fs/promises';
import path from 'path';
import sharp from 'sharp';
import { prisma } from '../src/config/prisma.js';
import dotenv from 'dotenv';

dotenv.config();

const GENERATED_IMAGES_DIR = path.join(process.cwd(), 'generated_images');
const UPLOADS_DIR = path.join(process.cwd(), 'public/uploads/products');

// La base URL de tu backend en producción. Si está local tomará el del env o localhost
// Cuando sepas el link exacto de Render, agrégalo a tu .env como API_BASE_URL=https://tu-api.onrender.com
const BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000';

async function processImages() {
  try {
    console.log('Iniciando el procesamiento de imágenes...');
    
    // 1. Crear el directorio de destino si no existe
    await fs.mkdir(UPLOADS_DIR, { recursive: true });

    // 2. Leer las imágenes originales
    const files = await fs.readdir(GENERATED_IMAGES_DIR);
    const imageFiles = files.filter(f => f.match(/\.(png|jpe?g|webp)$/i));

    if (imageFiles.length === 0) {
      console.log('No se encontraron imágenes en la carpeta generated_images.');
      return;
    }

    console.log(`Encontradas ${imageFiles.length} imágenes. Procesando (Optimizando y Redimensionando)...`);

    const processedImages: string[] = [];

    // 3. Procesar cada imagen con Sharp
    for (let i = 0; i < imageFiles.length; i++) {
      const file = imageFiles[i];
      const inputPath = path.join(GENERATED_IMAGES_DIR, file);
      const newFilename = `product-seed-${i + 1}.webp`;
      const outputPath = path.join(UPLOADS_DIR, newFilename);

      await sharp(inputPath)
        .resize(800, 800, { fit: 'inside', withoutEnlargement: true })
        .webp({ quality: 80 })
        .toFile(outputPath);
      
      const imageUrl = `${BASE_URL}/uploads/products/${newFilename}`;
      processedImages.push(imageUrl);
      console.log(`✅ Procesada: ${newFilename} -> Lista para web`);
    }

    // 4. Actualizar los productos en la base de datos
    console.log('\nActualizando base de datos...');
    const products = await prisma.product.findMany();
    
    if (products.length === 0) {
      console.log('No hay productos en la base de datos para actualizar. Agrega productos primero.');
      return;
    }

    let updatedCount = 0;
    for (let i = 0; i < products.length; i++) {
      // Asignar imágenes de forma cíclica (así si hay más de 10 productos, se repiten las imágenes)
      const assignedImageUrl = processedImages[i % processedImages.length];
      
      await prisma.product.update({
        where: { id: products[i].id },
        data: { imageUrl: assignedImageUrl }
      });
      updatedCount++;
    }

    console.log(`\n¡Éxito! Se actualizaron ${updatedCount} productos con las URLs de las imágenes procesadas.`);
    console.log('Ya puedes hacer git commit de la carpeta public/uploads/products para subirlas a producción.');
    
  } catch (error) {
    console.error('Error durante el procesamiento:', error);
  } finally {
    await prisma.$disconnect();
  }
}

processImages();
