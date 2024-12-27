import { IsString } from "class-validator";

export class CreateOcrDto {
    @IsString()
    id:string
}