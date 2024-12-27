import { IsString, MinLength } from 'class-validator';

export class ChangePasswordDto {
  
  @IsString()
  oldPassword: string;
  
  @IsString()
  userId:string
 
  @IsString()
  @MinLength(6)
  //@Matches(/^(?=.*[0-9])/, { message: 'Password must contain at least one number' })
  newPassword: string;
}