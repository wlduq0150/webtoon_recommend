import { Controller, Get, Param, UseFilters } from '@nestjs/common';
import { AccessTokenGuard } from 'src/auth/guard/accessToken.guard';
import { WebtoonExceptionFilter } from 'src/exception/webtoonException/webtoonExceptionFilter';
import { WebtoonsService } from './webtoons.service';

@UseFilters(WebtoonExceptionFilter)
@Controller('webtoons')
export class WebtoonsController {
    constructor(private webtoonService: WebtoonsService) {}

    @Get("/finished")
    getAllFinishedWebtoon() {
        return this.webtoonService.getAllFinishedWebtoon();
    }

    @Get("/:day")
    getAllWebtoonForDay(@Param("day") day: string) {
        return this.webtoonService.getAllWebtoonForDay(day);
    }

    
}
