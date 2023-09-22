import { Inject, Injectable } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { Configuration, OpenAIApi } from 'openai';
import { Webtoon } from 'src/sequelize/entity/webtoon.model';
import { recommendExcludeCacheTTL } from 'src/caching/constants';
import { UsersService } from 'src/users/users.service';
import { WebtoonsService } from 'src/webtoons/webtoons.service';
import calcSimilarityFromEmbedding from './processing/calcEmbedding';
import { genreToString } from './processing/genreToText';

@Injectable()
export class RecommendService {

    private openai: OpenAIApi;

    constructor(
        private readonly webtoonService: WebtoonsService,
        private readonly usersSerivce: UsersService,
        @Inject("REDIS")
        private readonly cacheManager: Cache,
    ) {
        const API_KEY: string = "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";
        //const API_KEY: string = "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";
        const configuration = new Configuration({
            apiKey: API_KEY,
        })
        this.openai = new OpenAIApi(configuration);  
    }

    async createCompletion(model: string, prompt: string, temperature: number, maxTokens: number): Promise<any> {
        try {
            const response = await this.openai.createCompletion({
                model,
                prompt,
                temperature,
                max_tokens: maxTokens,
            });
            return response.data.choices;
        } catch (e) {
            console.log(e);
        }
    }

    async createEmbedding(model: string, input: string): Promise<any> {
        try {
            const response = await this.openai.createEmbedding({
                model,
                input,
            });

            const embedding: number[] = response.data.data[0]?.embedding;
            return embedding;
        } catch (e) {
            console.log(e);
        }
    }

    async genreToEmbedding(genres: string[]): Promise<number[]> {
        try {
            const genreText: string = genreToString(genres);
            const embVector = await this.createEmbedding(
                "text-embedding-ada-002",
                genreText,
            );
            return embVector;
        } catch (e) {
            console.log(e);
        }
    }

    async recommendWebtoonGenre(prompt: string): Promise<string[]> {
        try {
            const completion = await this.createCompletion(
                "curie:ft-personal-2023-08-02-16-01-24",
                prompt,
                0.1,
                70,
            );

            let genres: string[] = (
                completion[0].text
                .trim()
                .replace("장르: ", "")
                .replaceAll("#", "")
                .split(" ")
            );
            
            genres = genres.length > 7 ? genres.slice(0, 7) : genres.slice(0, genres.length);
            return genres;
        } catch (e) {
            console.log(e);
        }
        return null;
    }

    async createRecommendWebtoons(genres: string[]): Promise<Webtoon[]> {
        try {
            const genreText: string = genreToString(genres);

            const genreRecommendCache: string = await this.cacheManager.get(genreText);
            if (genreRecommendCache) {
                return JSON.parse(genreRecommendCache);
            }

            const genreEmbVector = await this.createEmbedding(
                "text-embedding-ada-002",
                genreText,
            );

            if (!genreEmbVector) return null;

            let webtoons: Webtoon[] = (
                await this.webtoonService.getAllWebtoonForCategory(genres[0])
            ).filter(
                (webtoon) => {
                    return webtoon.service === "kakao" && webtoon.embVector !== null;
                }
            ); 
                
            webtoons.map(
                (webtoon) => {
                    if (webtoon.embVector === null) {
                        console.log(webtoon.title);
                    }
                }
            );
            
            const similarityCompare: { [title: string]: number } = {};
            for (const webtoon of webtoons) {
                similarityCompare[webtoon.title] = calcSimilarityFromEmbedding(
                    genreEmbVector,
                    JSON.parse(webtoon.embVector),
                );
            }

            webtoons.sort(
                (a, b) => {
                    return similarityCompare[a.title] - similarityCompare[b.title];
                }
            );

            webtoons = webtoons.slice(0, 50);

            await this.cacheManager.set(genreText, JSON.stringify(webtoons));
            
            return webtoons;
        } catch (e) {
            console.log(e);
        }
        return null;
    }

    async recommendWebtoon(
        userId: string,
        genres: string[],
        newExcludeWebtoonIds: string[]
    ): Promise<Webtoon[]> {
        // cache-key
        const recommendExcludeCacheKey: string = `recommendExcludeCache-${userId}`;

        // genres를 통해 전체 웹툰 추천 목록 생성
        let recommendWebtoons: Webtoon[] = await this.createRecommendWebtoons(genres);

        // 사용자가 추천 받지 않는 제외 웹툰 목록 불러오기 및 업데이트
        const recommendExcludeCache: string = await this.cacheManager.get(recommendExcludeCacheKey);
        let excludeWebtoonIds: string[] = recommendExcludeCache ? JSON.parse(recommendExcludeCache) : [];

        if (newExcludeWebtoonIds.length) {
            newExcludeWebtoonIds.map(
                (newExcludeWebtoonId) => {
                    if (!(excludeWebtoonIds.includes(newExcludeWebtoonId))) {
                        excludeWebtoonIds.push(newExcludeWebtoonId);
                    }
                }
            );
        }

        // 사용자가 이미 읽었던 웹툰 목록 불러오기
        let userReadWebtoonIds: string[] = await this.usersSerivce.getUserReadWebtoonIds(userId);

        // 전체 웹툰 추천 목록에서 읽은 웹툰과 제외 웹툰을 필터링
        recommendWebtoons = recommendWebtoons.filter(
            (recommendWebtoon) => {
                const webtoonId: string = recommendWebtoon.webtoonId;
                if (userReadWebtoonIds.includes(webtoonId) || excludeWebtoonIds.includes(webtoonId)) {
                    return false;
                }
                return true;
            }
        );

        // 캐싱
        this.cacheManager.set(
            recommendExcludeCacheKey,
            JSON.stringify(excludeWebtoonIds),
            recommendExcludeCacheTTL,
        );
        
        return recommendWebtoons.slice(0, 3);
    }
}
