import { Body, Controller, Get, Post, Query, UseInterceptors } from '@nestjs/common';
import { Webtoon } from 'src/sequelize/entity/webtoon.model';
import { RecommendService } from './recommend.service';
import * as qs from "qs";
import { CacheInterceptor, CacheTTL } from '@nestjs/cache-manager';


@Controller('recommend')
export class RecommendController {
    constructor(private readonly recommendService: RecommendService) {}

    @Post("/test")
    async test(@Body() recommendBody: any): Promise<any> {
        const { userId, genres, newExcludeWebtoonIds } = recommendBody;
        const webtoons: Webtoon[] = await this.recommendService.recommendWebtoon(
            userId,
            genres,
            newExcludeWebtoonIds
        );
        return webtoons;
    }

    @CacheTTL(300)
    @UseInterceptors(CacheInterceptor)
    @Get("/webtoon")
    async recommendWebtoonForGenre(@Query() queryText): Promise<string> {
        const query = qs.parse(queryText, { comma: true });
        const genres = query.genres as string[];
        const webtoons: Webtoon[] = await this.recommendService.createRecommendWebtoons(genres);
        return JSON.stringify(webtoons);
    }
    

}
