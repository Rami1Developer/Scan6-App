import { IsEmail, IsString } from 'class-validator';

export class UpdateUserIndoDto {

  @IsString()
  name: string;
  
  @IsEmail()
  email: string;
 
  @IsString()
  userId : string;
}