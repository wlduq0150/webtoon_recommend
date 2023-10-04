import { Body, Controller, Post } from '@nestjs/common';
import { Webtoon } from 'src/sequelize/entity/webtoon.model';
import { RecommendService } from './recommend.service';
import { RecommendBodyDto } from './dto/recommend.dto';


@Controller('recommend')
export class RecommendController {
    constructor(private readonly recommendService: RecommendService) {}

    @Post("/webtoons")
    async test(@Body() recommendBody: RecommendBodyDto): Promise<Webtoon[]> {
        const webtoons: Webtoon[] = await this.recommendService.recommendWebtoon(
            recommendBody
        );
        return webtoons;
    }
}
