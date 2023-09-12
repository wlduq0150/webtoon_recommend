import { IsString } from "class-validator";

export class loginTokenDataDto {
    @IsString()
    accessToken: string;

    @IsString()
    refreshToken: string;
}