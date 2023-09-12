import { Injectable } from '@nestjs/common';
import { WebtoonsService } from 'src/webtoons/webtoons.service';
import * as fs from "fs";
import { RecommendService } from 'src/recommend/recommend.service';

@Injectable()
export class DataManagerService {
    constructor(
        private readonly webtoonService: WebtoonsService,
        private readonly recommendService: RecommendService,
    ) {}

    sleep(sec) {
        return new Promise(resolve => setTimeout(resolve, sec * 1000));
    }

    async test(genres) {
        const result = await this.recommendService.createRecommendWebtoons(genres);
        if (result) {
            result.map((result, index) => {
                if (index < 100) {
                    console.log(`${index+1}위: ${result.title}`);
                }
            })
        }
    }
    
    async updateEmbedding() {
        try {
            const filePath: string = "/workspace/finding_restaurant/finding_rest/src/webtoons/complete.json";
            const completeList: string[] = JSON.parse((await fs.readFileSync(filePath)).toString());
        
            const idList: string[] = (
                (await this.webtoonService.getAllWebtoonForOption({
                    genreCount: 0,
                    genre: "판타지",
                    service: "kakao",
                })).map(
                    (webtoon) => { return webtoon.webtoonId }
                )
            );
        
            console.log("complete count: ", completeList.length);
            for (const id of idList) {
                if (!completeList.includes(id)) {

                    const genres: string[] = JSON.parse(
                       (await this.webtoonService.getWebtoonForId(id)).genres
                    );

                    const embVector: number[] = await this.recommendService.genreToEmbedding(genres);

                    await this.webtoonService.patchWebtoonEmbedding(id, embVector);
                    completeList.push(id);
                    console.log(id);
                    await fs.writeFileSync(filePath, JSON.stringify(completeList));
                    await this.sleep(30);
                }
            }
        } catch (e) {
            console.log(e);
        }
    }
}
