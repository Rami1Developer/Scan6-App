// schemas/ocr-data.schema.ts
import { Schema, Document, Types } from 'mongoose';

// Define an interface for OCRData with a dynamic structure
export interface OCRData extends Document {
  userId: Types.ObjectId; // Reference to the User document
  // Other dynamic fields can go here
}

// Define the schema with `strict: false` for flexibility
export const OCRDataSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true }, // Reference to User
  },
  { strict: false } // Allow dynamic fields
);