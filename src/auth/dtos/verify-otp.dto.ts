import { IsString } from 'class-validator';

export class VerifyOtpDto {
 
  @IsString()
  recoveryCode: string;  
}