import { Injectable } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { WebtoonsService } from 'src/webtoons/webtoons.service';

@Injectable()
export class UserWebtoonService {
    constructor(
        private readonly userService: UsersService,
        private readonly webtoonService: WebtoonsService,
    ) {}

    async addReadWebtoon(userId: string, webtoonIds: string[]): Promise<void> {
        const user = await this.userService.getUser(userId);

        const webtoons = await this.webtoonService.getAllWebtoonForIds(webtoonIds);

        await user.$add("readWebtoons", webtoons);
    }

    async delReadWebtoon(userId: string, webtoonIds: string[]): Promise<void> {
        const user = await this.userService.getUser(userId);

        const webtoons = await this.webtoonService.getAllWebtoonForIds(webtoonIds);

        await user.$remove("readWebtoons", webtoons);
    }
}
