import { Document } from 'mongoose';

export interface OCRData extends Document {
  [key: string]: any; // Allows dynamic fields
}