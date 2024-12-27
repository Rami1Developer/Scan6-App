import { Module } from '@nestjs/common';
import { OcrService } from './ocr.service';
import { MongooseModule } from '@nestjs/mongoose';
import { OCRDataSchema } from './entities/ocr.entity';
import { AuthModule } from 'src/auth/auth.module';
import { FileUploadController } from './ocr.controller';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'OCRData', schema: OCRDataSchema }]),
    AuthModule
     // Register OCRData model
  ],
  controllers: [FileUploadController],
  providers: [OcrService],
})
export class OcrModule {}
