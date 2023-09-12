import { Transform } from "class-transformer";
import { IsDate, IsEmpty, IsNumber, IsOptional, IsString } from "class-validator";

export class CreateUserDataDto {
    @IsString()
    userId: string;

    @IsString()
    password: string;

    @IsString()
    name: string;

    @IsNumber()
    age: number;

    @IsString()
    sex: string;

    @IsString()
    address: string;

    @IsOptional()
    @IsString()
    currentRefreshToken: string;

    @IsOptional()
    @IsDate()
    currentRefreshTokenExp: Date;
}