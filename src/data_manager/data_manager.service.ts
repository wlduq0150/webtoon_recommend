import { Injectable } from '@nestjs/common';
import { WebtoonsService } from 'src/webtoons/webtoons.service';
import { RecommendService } from 'src/recommend/recommend.service';
import { SelectOption, WebtoonEPLength, WebtoonInfo, WebtoonUpdateDay } from 'src/webtoons/types';
import { Webtoon } from 'src/sequelize/entity/webtoon.model';
import { ServiceList } from './service/constants';
import * as fs from "fs";

import getKakaoWebtoonForId from './crawling/kakao/getWebtoonForId';
import getKakaoWeeklyWebtoonId from './crawling/kakao/getWeeklyWebtoonId';
import getKakaoWebtoonUpdateDayForId from './crawling/kakao/getWebtoonUpDayForId';
import getKakaoWebtoonEPLengthForId from './crawling/kakao/getWebtoonEPLForId';
import getKakaoFinishedWebtoonId from './crawling/kakao/getFinishedWebtoonId';

import getNaverWeeklyWebtoonId from './crawling/naver/getWeeklyWebtoonId';
import getNaverWebtoonForId from './crawling/naver/getWebtoonForId';
import getNaverWebtoonUpdateDayForId from './crawling/naver/getWebtoonUpDayForId';
import getNaverWebtoonEPLengthForId from './crawling/naver/getWebtoonEPLForId';
import getNaverFinishedWebtoonId from './crawling/naver/getFinishedWebtoonId';
import { FineTuningService } from 'src/fine-tuning/fine-tuning.service';
import { genreRecommendTransform } from './genres/transform/genreTransform';
import { gpt_3_5_prompt } from 'src/recommend/types/iindex';




@Injectable()
export class DataManagerService {
    constructor(
        private readonly webtoonService: WebtoonsService,
        private readonly recommendService: RecommendService,
        private readonly fineTuningService: FineTuningService
    ) {}

    sleep(sec) {
        return new Promise(resolve => setTimeout(resolve, sec * 1000));
    }

    async test() {
        // this.fineTuningService.searchFineTuning("ftjob-1WpsYWm6Jz4lWL5ZvENgYIRu")
        // .then((data) => { console.log(data) });

        //this.fineTuningService.createFineTune_3_5_DataToJsonFile(["로판"])
        
        //this.fineTuningService.createFileUpload("/workspace/finding_restaurant/finding_rest/src/fine-tuning/result/fineTune_3_5_Data95.jsonl");

        //this.fineTuningService.deleteUploadFile("file-8WVi2Vje8AdDlFhOyslyV1EU");

        // this.fineTuningService.getUploadFileList()
        // .then((data) => { console.log(data) });

        // this.fineTuningService.createFineTune_3_5_Model(
        //     "file-yLRFwYzoOLxXzZV2Op2Y36qe",
        //     "ft:gpt-3.5-turbo-0613:personal::866sUesF",
        // )
        // .then((data) => { console.log(data) });

        this.fineTuningService.getFineTuningList()
        .then((data) => { console.log(data) });
    }

    getAllCategoryKeyword(): Promise<string[]> {
        const filePath: string = "/workspace/finding_restaurant/finding_rest/src/data_manager/genres/constants/kakaoCategoryKeyword.json";
        const genres = require(filePath);
        return genres;
    }

    getAllGenreKeyword(): Promise<string[]> {
        const filePath = "/workspace/finding_restaurant/finding_rest/src/data_manager/genres/constants/kakaoGenreKeyword.json";
        const genres = require(filePath);
        return genres;
    }

    async loadingCategoryKeyword(fileName: string, service?: string) {
        const filePath: string = `/workspace/finding_restaurant/finding_rest/src/data_manager/genres/constants/${fileName}.json`;
        const service_ = service ? service : null;
        const webtoons = await this.webtoonService.getAllWebtoonForOption(
            {
                genreCount: 0,
                service: service_,
            }
        );
        
        const categoryKeywords: string[] = [];
        webtoons.forEach(
            (webtoon) => {
                const category: string = webtoon.category;
                if (!categoryKeywords.includes(category)) categoryKeywords.push(category);
            }
        );
        
        fs.writeFileSync(filePath, JSON.stringify(categoryKeywords), { encoding: "utf-8" });
    }

    async loadingGenreKeyword(fileName: string, service?: string) {
        const filePath: string = `/workspace/finding_restaurant/finding_rest/src/data_manager/genres/constants/${fileName}.json`;
        const service_ = service ? service : null;
        const webtoons = await this.webtoonService.getAllWebtoonForOption(
            {
                genreCount: 0,
                service: service_,
            }
        );
        
        const genreKeywords: string[] = [];
        webtoons.forEach(
            (webtoon) => {
                const genres: string[] = JSON.parse(webtoon.genres);
                genres.forEach(
                    (genre) => {
                        if (!genreKeywords.includes(genre)) genreKeywords.push(genre);
                    }
                )
            }
        );
        
        fs.writeFileSync(filePath, JSON.stringify(genreKeywords), { encoding: "utf-8" });
    }

    async loadingWeeklyWebtoon(): Promise<void> {
        const currentIdList: string[] = await this.webtoonService.getAllWebtoonId();
        const kakaoWeeklyIdList: string[] = await getKakaoWeeklyWebtoonId();
        const naverWeeklyIdList: string[] = await getNaverWeeklyWebtoonId();

        const KakaoWeeklyNewIdList: string[] = kakaoWeeklyIdList.filter(
            (id) => {
                return !currentIdList.includes(id);
            }
        );
        const naverWeeklyNewIdList: string[] = naverWeeklyIdList.filter(
            (id) => {
                return !currentIdList.includes(id);
            }
        );

        const kakaoWeeklyNewWebtoonInfo: WebtoonInfo[] = await getKakaoWebtoonForId(KakaoWeeklyNewIdList);
        const naverWeeklyNewWebtoonInfo: WebtoonInfo[] = await getNaverWebtoonForId(naverWeeklyNewIdList);
        const weeklyNewWebtoonInfo: WebtoonInfo[] = kakaoWeeklyNewWebtoonInfo.concat(naverWeeklyNewWebtoonInfo);

        for (let webtoonInfo of weeklyNewWebtoonInfo) {
            try {
                await this.webtoonService.insertWebtoon(webtoonInfo);
            } catch (e) {
                console.log(`${webtoonInfo.webtoonId} is not saved..`);
                continue;
            }
        }
    }

    async loadingFinishedWebtoon(): Promise<void> {
        const currentIdList: string[] = await this.webtoonService.getAllWebtoonId();
        const kakaoFinishedIdList: string[] = await getKakaoFinishedWebtoonId();
        const naverFinishedIdList: string[] = await getNaverFinishedWebtoonId();

        const kakaoFinishedNewIdList: string[] = kakaoFinishedIdList.filter(
            (id) => {
                return !currentIdList.includes(id);
            }
        );
        const naverFinishedNewIdList: string[] = naverFinishedIdList.filter(
            (id) => {
                return !currentIdList.includes(id);
            }
        );

        const kakaoFinishedNewWebtoonInfo: WebtoonInfo[] = await getKakaoWebtoonForId(kakaoFinishedNewIdList);
        const naverFinishedNewWebtoonInfo: WebtoonInfo[] = await getNaverWebtoonForId(naverFinishedNewIdList);
        const finishedNewWebtoonInfo: WebtoonInfo[] = kakaoFinishedNewWebtoonInfo.concat(naverFinishedNewWebtoonInfo);

        for (let webtoonInfo of finishedNewWebtoonInfo) {
            try {
                await this.webtoonService.insertWebtoon(webtoonInfo);
            } catch (e) {
                console.log(`${webtoonInfo.webtoonId} is not saved..`);
                continue;
            }
        }
    }

    async updateWeeklyEpisodeLength() {
        let webtoonEPLengthList: WebtoonEPLength[] = [];
        for (let service of ServiceList) {
            const idList: string[] = await this.webtoonService.getAllWebtoonId(service);

            if (service === "kakao") {
                const kakaoWebtoonEPL = await getKakaoWebtoonEPLengthForId(idList);
                webtoonEPLengthList = webtoonEPLengthList.concat(kakaoWebtoonEPL);
            } else if (service === "naver") {
                const naverWebtoonEPL = await getNaverWebtoonEPLengthForId(idList);
                webtoonEPLengthList = webtoonEPLengthList.concat(naverWebtoonEPL);
            }
        }

        for (let webtoonEPL of webtoonEPLengthList) {
            try {
                await this.webtoonService.patchWebtoonEPL(webtoonEPL.webtoonId, webtoonEPL.episodeLength);
            } catch (e) {
                console.log(`${webtoonEPL.webtoonId}'s episodeLength is not patched..`);
                continue;
            }
        }
    }

    async updateDay() {
        let webtoonUpdateDayList: WebtoonUpdateDay[] = [];
        for (let service of ServiceList) {
            const idList: string[] = await this.webtoonService.getAllWebtoonId(service);

            if (service === "kakao") {
                const kakaoWebtoonUpdateDay = await getKakaoWebtoonUpdateDayForId(idList, 3);
                webtoonUpdateDayList = webtoonUpdateDayList.concat(kakaoWebtoonUpdateDay);
            } else if (service === "naver") {
                const naverWebtoonUpdateDay = await getNaverWebtoonUpdateDayForId(idList, 3);
                webtoonUpdateDayList = webtoonUpdateDayList.concat(naverWebtoonUpdateDay);
            }
        }

        for (let webtoonUpdateDay of webtoonUpdateDayList) {
            try {
                await this.webtoonService.patchWebtoonUpdateDay(webtoonUpdateDay.webtoonId, webtoonUpdateDay.updateDay);
            } catch (e) {
                console.log(`${webtoonUpdateDay.webtoonId}'s updateDay is not patched..`);
                continue;
            }
        }
    }

    async updateWebtoonCategoryIsNull(): Promise<void> {
        const webtoons: Webtoon[] = await this.webtoonService.getAllWebtoonForCategory(null);
        
        const kakaoWebtoonIds: string[] = [];
        const naverWebtoonIds: string[] = [];

        webtoons.forEach(
            (webtoon) => {
                if (webtoon.service === "kakao") {
                    kakaoWebtoonIds.push(webtoon.webtoonId);
                } else {
                    naverWebtoonIds.push(webtoon.webtoonId);
                }
            }
        );

        const kakaoWebtoons: WebtoonInfo[] = await getKakaoWebtoonForId(kakaoWebtoonIds);
        const naverWebtoons: WebtoonInfo[] = await getNaverWebtoonForId(naverWebtoonIds);
        const newWebtoons: WebtoonInfo[] = kakaoWebtoons.concat(naverWebtoons);

        for (let webtoon of newWebtoons) {
            const webtoonId: string = webtoon.webtoonId;
            const genres: string[] = webtoon.genres;
            const category: string = webtoon.category;

            await this.webtoonService.patchWebtoonCategory(
                webtoon.webtoonId,
                webtoon.category,
            );
            
            if (category !== genres[0]) {
                const newGenres: string[] = [category, ...genres];
                await this.webtoonService.patchWebtoonGenre(webtoonId, newGenres);
                console.log(`${webtoonId} ${newGenres}`);
            }
        }
    }

    async updateWebtoonGenre(option: SelectOption): Promise<void> {
        let webtoons: Webtoon[] = await this.webtoonService.getAllWebtoonForOption(option);
        webtoons = webtoons.slice(0, 10);
        console.log("length: ", webtoons.length);

        for (let webtoon of webtoons) {
            const webtoonId: string = webtoon.webtoonId;
            const genres: string[] = JSON.parse(webtoon.genres);

            const prompt: string = await this.recommendService.createPromptFromWebtoonId(webtoonId);

            const recommendGenres: string[] = await this.recommendService.recommendWebtoonGenre(prompt);

            const tsRecommendGenres: string[] = genreRecommendTransform(recommendGenres);
            console.log(`id: ${webtoonId}\ngenres: ${genres}\ndescription: ${webtoon.description}\nrecommend: ${recommendGenres}\ntransformed: ${tsRecommendGenres}`);

            await (this.sleep(5));
        }
    }

    async updateWebtoonGenre_3_5(option: SelectOption): Promise<void> {
        let webtoons: Webtoon[] = await this.webtoonService.getAllWebtoonForOption(option);
        webtoons = webtoons.slice(0, 10);
        console.log("length: ", webtoons.length);

        for (let webtoon of webtoons) {
            const webtoonId: string = webtoon.webtoonId;
            const genres: string[] = JSON.parse(webtoon.genres);

            const prompt: gpt_3_5_prompt = await this.recommendService.createPrompt_3_5_FromWebtoonId(webtoonId);

            const recommendGenres: string[] = await this.recommendService.recommend_3_5_WebtoonGenre(prompt);

            const tsRecommendGenres: string[] = genreRecommendTransform(recommendGenres);
            console.log(`id: ${webtoonId}\ngenres: ${genres}\ndescription: ${webtoon.description}\nrecommend: ${recommendGenres}\ntransformed: ${tsRecommendGenres}`);

            await (this.sleep(5));
        }
    }

    async updateToTransformGenreKeyword(option: SelectOption): Promise<void> {
        const webtoons: Webtoon[] = await this.webtoonService.getAllWebtoonForOption(option);
        const kakaoWebtoonIds: string[] = [];
        const naverWebtoonIds: string[] = [];

        webtoons.forEach(
            (webtoon) => {
                if (webtoon.service === "kakao") {
                    kakaoWebtoonIds.push(webtoon.webtoonId);
                } else {
                    naverWebtoonIds.push(webtoon.webtoonId);
                }
            }
        );

        const kakaoWebtoons: WebtoonInfo[] = await getKakaoWebtoonForId(kakaoWebtoonIds);
        const naverWebtoons: WebtoonInfo[] = await getNaverWebtoonForId(naverWebtoonIds);
        const transformWebtoons: WebtoonInfo[] = kakaoWebtoons.concat(naverWebtoons);

        for (let webtoon of transformWebtoons) {
            try {
                const webtoonId: string = webtoon.webtoonId;
                const category: string = webtoon.category;
                const genres: string[] = webtoon.genres;
                await this.webtoonService.patchWebtoonCategory(webtoonId, category);
                await this.webtoonService.patchWebtoonGenre(webtoonId, genres);
            } catch (e) {
                console.log(e);
                continue;
            }
        }
    }
    
    async updateEmbedding() {
        try {
            const filePath: string = "/workspace/finding_restaurant/finding_rest/src/webtoons/complete.json";
            const completeList: string[] = JSON.parse((await fs.readFileSync(filePath)).toString());
        
            const idList: string[] = (
                (await this.webtoonService.getAllWebtoonForOption({
                    genreCount: 0,
                    category: "판타지",
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
