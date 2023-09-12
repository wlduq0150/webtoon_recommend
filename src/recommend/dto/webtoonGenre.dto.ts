import { IsArray, IsString } from "class-validator";


export class WebtoonGenreDto {
    @IsArray()
    @IsString({ each: true })
    gernes: string[];
}