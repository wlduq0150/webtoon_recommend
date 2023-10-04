import { IsArray, IsNumber, IsString } from "class-validator";

export class RecommendBodyDto {
    @IsString()
    userId: string;

    @IsString({ each: true })
    genres: string[];

    @IsNumber()
    episodeLength: number;

    @IsString({ each: true })
    newExcludeWebtoonIds: string[];
}