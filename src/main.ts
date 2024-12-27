import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';
import { join } from 'path';  // Importe join pour le chemin
import * as express from 'express';  // Importe express



async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: '*', // Allows all origins to make requests
  });
  dotenv.config();
  // Rendre le dossier accessible pour les téléchargements
  app.use('../upload', express.static(join(__dirname, '..', 'upload')));

  await app.listen(3000);
}
bootstrap();
