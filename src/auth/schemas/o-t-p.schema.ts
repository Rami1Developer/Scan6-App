import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';

@Schema({ versionKey: false, timestamps: true })
export class OTP extends Document {

    @Prop({ required: true })
    otp: string;

    @Prop({ required: true, type: mongoose.Types.ObjectId })
    userId: mongoose.Types.ObjectId;

    @Prop({ required: true })
    expiryDate: Date;
}

export const OTPSchema = SchemaFactory.createForClass(OTP);