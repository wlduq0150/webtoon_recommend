import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { AccessTokenGuard } from 'src/auth/guard/accessToken.guard';
import { WebtoonsService } from './webtoons.service';

@Controller('webtoons')
export class WebtoonsController {
    constructor(private webtoonService: WebtoonsService) {}

    @Get("/genreKeyWords")
    getAllGenreKeyWords() {
        return this.webtoonService.getAllWebtoonGenres();
    }

    @Get("/:day")
    getAllWebtoonForDay(@Param("day") day: string) {
        return this.webtoonService.getAllWebtoonForDay(day);
    }

    

    

    
}
