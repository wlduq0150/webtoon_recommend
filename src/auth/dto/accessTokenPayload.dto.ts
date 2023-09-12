import { IsNumber, IsString } from "class-validator";

export class AccessTokenPayloadDto {
    @IsString()
    userId: string;
    
    @IsString()
    userName: string;

    @IsNumber()
    userAge: number;

    @IsString()
    userSex: string;
}