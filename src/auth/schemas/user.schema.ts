
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({timestamps: true})
export class User extends Document {

    @Prop({ required: true })
    name: string;

    @Prop({ required: true, unique: true })
    email: string;

    @Prop({ required: true })
    password: string;

    @Prop({ default: false })//default false
    isVerfied: Boolean;

    //@Prop({ default: false })
    //isBanned: Boolean;
}
export const UserSchema = SchemaFactory.createForClass(User);