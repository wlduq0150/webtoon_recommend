import { IsString } from "class-validator";

export class RefreshTokenPayloadDto {
    @IsString()
    userId: string;
}