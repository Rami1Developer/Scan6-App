import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import * as PDFDocument from 'pdfkit';
import { Response } from 'express'; // For returning a response with PDF in Express
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { OCRData } from './OCRData';
import { AuthService } from '../auth/auth.service'
import { GoogleAIFileManager } from "@google/generative-ai/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class OcrService {

  private fileManager: GoogleAIFileManager;
  private genAI: GoogleGenerativeAI;

  constructor(@InjectModel('OCRData') private ocrDataModel: Model<OCRData>,
    private readonly authService: AuthService) {
    this.fileManager = new GoogleAIFileManager(process.env.API_KEY);
    this.genAI = new GoogleGenerativeAI(process.env.API_KEY);

  }



  // Extract JSON from string
  extractJson(input: string): object | null {
    try {
      // Find the first '{' and the last '}' in the input
      const startIndex = input.indexOf("{");
      const endIndex = input.lastIndexOf("}");

      // If both are found, extract the substring and parse it as JSON
      if (startIndex !== -1 && endIndex !== -1 && startIndex < endIndex) {
        const jsonString = input.slice(startIndex, endIndex + 1);
        return JSON.parse(jsonString);
      }

      return null; // Return null if no valid JSON structure is found
    } catch (error) {
      console.error("Invalid JSON content:", error);
      return null;
    }
  }

  // Analyze image and extract JSON
  async analyzeImage(mediaPath: string, imageName: string) {
    try {
      // Upload the image
      const uploadResult = await this.fileManager.uploadFile(
        `${mediaPath}/${imageName}`,
        {
          mimeType: "image/jpeg",
          displayName: "Jetpack drawing",
        },
      );

      console.log(`Uploaded file ${uploadResult.file.displayName} as: ${uploadResult.file.uri}`);

      // Get the generative model and analyze the image
      const model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const result = await model.generateContent([
        "extract text from image and return a JSON object and provide a title for every document the key title is mantadory you should only retuen json like this {title:ftfty,....}  and try to extract all the keys of document i want many information extracted as a keys in the json or it is confidential document just give a title without analysing anything please and return json like this {title:documenttitle , description:de...}",
        {
          fileData: {
            fileUri: uploadResult.file.uri,
            mimeType: uploadResult.file.mimeType,
          },
        },
      ]);

      // Get the model response
      var model_response = await result.response.text(); // Ensure this is awaited if it's a promise
      console.log("there is the output of the primary model response :m:::::::::::")
      console.log(model_response)
      // Pass model_response into extractJson
      const extractedJson = this.extractJson(model_response);
      if (!extractedJson) {
        throw new Error("No valid JSON extracted from model response.");
      }

      // Return the extracted JSON
      return extractedJson;
    } catch (error) {
      console.error('Error analyzing image:', error);
      throw error;
    }
  }

  // Method to save extracted OCR data associated with a user
  async saveExtractedData(extractedFields: Record<string, any>, userId: string) {
    console.log("Attempting to save the data ...");

    var a = this.authService.findUserById(userId)
    try { console.log((await a)._id) }
    catch (error) {
      console.log(error)
    }
    if ((await a) == null) {
      console.log("user not found")
      return { "error": "user not found " }
    }
    // Include the userId in the OCR data
    const ocrData = new this.ocrDataModel({
      ...extractedFields,
      userId: new Types.ObjectId(userId), // Ensuring userId is stored as ObjectId
    });

    console.log(ocrData);
    return ocrData.save();
  }

  // Optional: Method to retrieve OCR data with populated user information
  async getOCRDataWithUser(ocrDataId: string) {
    return this.ocrDataModel
      .findById(ocrDataId)
      .populate('userId') // Populate user details
      .exec();
  }


  async findAllByUserId(userId: string) {
    try {
      var user = this.authService.findUserById(userId);
      if ((!user) == null) { return { "statuscode": 404, "message": "user not found " } }

      var a = (await user)._id
      a = String(a)




      const objectId = new Types.ObjectId(String(a)); // Convert to ObjectId if needed
      console.log(`Searching for documents with userId: ${objectId}`);
      if ((await user) == null) {
        return { "status_code": 404, "message": "user not found" }
      }
      const results = await this.ocrDataModel.find({ userId: objectId }).exec();
      console.log('Found documents:', results);

      return results;
    }
    catch {
      return { "message": "user not found or there is another error " }
    }
  }

  async getImageDetail(ocrDataId: string) {
    return this.ocrDataModel
      .findById(ocrDataId)
      .exec();
  }

  async generatePDFFromOCRData(userId: string, res: Response) {
    try {
      // Fetch OCR data for the user
      const ocrData = await this.ocrDataModel
        .find({ userId: new Types.ObjectId(userId) })
        .exec();

      if (!ocrData || ocrData.length === 0) {
        res.status(404).send('No OCR data found for the user.');
        return;
      }

      // Create a new PDF document
      const doc = new PDFDocument({ margin: 50 });

      // Set response headers for downloading PDF
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=ocr-data-${userId}.pdf`);

      // Pipe the PDF document to the response
      doc.pipe(res);
      const user = await this.authService.findUserById(userId);

      // Add a title to the PDF
      doc.fontSize(18).font('Helvetica-Bold').text(`OCR Data for User ${user.name}`, { align: 'center' });
      doc.moveDown(2); // Add some space after the title

      // Add some introductory text or description
      doc.fontSize(12).font('Helvetica').text('The following OCR data is retrieved for the user.', { align: 'center' });
      doc.moveDown(2);

      // Iterate over the OCR data and add it to the PDF
      ocrData.forEach((data, index) => {
        doc.fontSize(14).font('Helvetica-Bold').text(`OCR Data Entry #${index + 1}`, { underline: true });
        doc.moveDown(1);

        Object.entries(data.toObject()).forEach(([key, value]) => {
          if (key !== '_id' && key !== 'userId' && key !== '__v' && key !== 'image_name' ) {
            doc.fontSize(12).font('Helvetica').text(`${key}: ${value}`);
            doc.moveDown(0.5); // Add some space between fields
          }
        });

        if (index < ocrData.length - 1) {
          doc.addPage(); // Add a new page for each OCR data entry (except the last one)
        }
      });
      // Finalize the PDF
      doc.end();
    } catch (error) {
      console.error('Error generating PDF:', error);
      res.status(500).send('Error generating PDF');
    }
  }


  async deleteImages(ids: string[]): Promise<number> {
    try {
      // Retrieve the image records from the database
      const images = await this.ocrDataModel.find({ _id: { $in: ids } });

      // Delete the files from the filesystem
      for (const image of images) {
        const filePath = path.join(
          __dirname,
          '..',
          '..',
          'uploads',
          image.image_name,
        );
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }

      // Delete the records from the database
      const result = await this.ocrDataModel.deleteMany({ _id: { $in: ids } });
      return result.deletedCount || 0;
    } catch (error) {
      throw new HttpException(
        'Error while deleting images',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}