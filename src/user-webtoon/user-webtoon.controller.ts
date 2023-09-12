import { Controller, Get } from '@nestjs/common';
import { UserWebtoonService } from './user-webtoon.service';

@Controller('user-webtoon')
export class UserWebtoonController {
    constructor(private readonly userWebtoonService: UserWebtoonService) {}

    @Get("test")
    test() {
        this.userWebtoonService.addReadWebtoon("test", ["60708678"]);  
    }
}
