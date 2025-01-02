import { Body, Controller, Get, Post, Param, Res, UploadedFile, UseInterceptors, HttpException, HttpStatus } from '@nestjs/common';
import { Response } from 'express';
import { OcrService } from './ocr.service';
import { diskStorage } from 'multer';
import * as fs from 'fs';
import { CreateOcrDto } from './dto/create-ocr.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { extname } from 'path';



@Controller('files')
export class FileUploadController {
  constructor(private readonly ocrService: OcrService) { }

  oldImageName: string = ""

  @Get()
  async analyzeImage(imageName: string) {
    try {
      var mediaPath = "upload";
      const analysisResult = await this.ocrService.analyzeImage(mediaPath, imageName);

      return analysisResult;
    } catch (error) {
      return { error: 'Image analysis failed', details: error.message };
    }
  }


  @Post('upload')
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: (req, file, callback) => {
        const uploadDir = './upload';  // Local folder to store files
        // Ensure the upload directory exists
        if (!fs.existsSync(uploadDir)) {
          fs.mkdirSync(uploadDir, { recursive: true });
        }
        callback(null, uploadDir);
      },
      filename: (req, file, callback) => {

        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);

        const extension = extname(file.originalname);

        callback(null, `${file.fieldname}-${uniqueSuffix}${extension}`);
      },
    }),
  }))
  async uploadFile(@UploadedFile() file: Express.Multer.File, @Body('userId') userId: string
  ) {
    try {
      if (!file) {
        throw new Error('No file uploaded');
      }
      if (!userId) {
        throw new Error('User ID is required');
      }
      console.log('File info:', file.filename); // Log file details for debugging
      console.log('User ID:', userId); // Log user ID for debugging

      const extractedData = await this.analyzeImage(file.filename); // Implement your OCR logic here
      console.log(extractedData)
      extractedData["image_name"] = file.filename
      await this.ocrService.saveExtractedData(extractedData, userId);

      return { message: 'File uploaded successfully and saved', filePath: file.path };
    } catch (error) {
      console.error('File upload error:', error); // Log the error
      return { message: 'File upload failed', error: error.message };
    }
  }

  @Post('getAllImages')
  async forgotPassword(@Body() forgotPasswordDto: CreateOcrDto) {
    console.log("this fuction of get all omages called")
    return this.ocrService.findAllByUserId(forgotPasswordDto.id);
  }

  @Post('getImageDetails')
  async getImageDeatails(@Body() forgotPasswordDto: CreateOcrDto) {
    console.log("get image details function invocked");
    return this.ocrService.getImageDetail(forgotPasswordDto.id);
  }


  // Route to generate PDF from OCR data
  @Get('generate-pdf/:userId')
  async generatePDF(@Param('userId') userId: string, @Res() res: Response) {
    try {


      // Generate the PDF based on the extracted data
      await this.ocrService.generatePDFFromOCRData(userId, res);
    } catch (error) {
      res.status(500).send('Error generating PDF');
    }
  }

  @Post('deleteImages')
  async deleteImages(@Body() body: { userId: string[] }) {
    console.log("_______________");
    return await this.ocrService.deleteImages(body.userId);
  }
}

