import { Inject, Injectable } from '@nestjs/common';
import { Cache } from 'cache-manager';
import OpenAI from 'openai';
import { Webtoon } from 'src/sequelize/entity/webtoon.model';
import { recommendExcludeCacheTTL } from 'src/caching/constants';
import { UsersService } from 'src/users/users.service';
import { WebtoonsService } from 'src/webtoons/webtoons.service';
import calcSimilarityFromEmbedding from './processing/calcEmbedding';
import { genreToString } from './processing/genreToText';
import { RecommendBodyDto } from './dto/recommend.dto';
import { FINE_TUNE_API_KEY } from 'src/fine-tuning/constatns/constants';

@Injectable()
export class RecommendService {

    private openai: OpenAI;

    constructor(
        private readonly webtoonService: WebtoonsService,
        private readonly usersSerivce: UsersService,
        @Inject("REDIS")
        private readonly cacheManager: Cache,
    ) {
        const API_KEY: string = FINE_TUNE_API_KEY;
        const configuration = { apiKey: API_KEY };
        this.openai = new OpenAI(configuration);  
    }

    async createPromptFromWebtoonId(id: string): Promise<string> {
        const webtoon: Webtoon = await this.webtoonService.getWebtoonForId(id);

        const { title, description, category } = webtoon;

        const prompt: string = `제목: ${title}\n분류: ${category}\n줄거리: ${description}\n\n###\n\n`;
        
        return prompt;
    }

    async createCompletion(model: string, prompt: string, temperature: number, maxTokens: number): Promise<any> {
        try {
            const completion = await this.openai.completions.create({
                model,
                prompt,
                temperature,
                max_tokens: maxTokens,
            });
            return completion.choices;
        } catch (e) {
            console.log(e);
        }
    }

    async createEmbedding(model: string, input: string): Promise<any> {
        try {
            const response = await this.openai.embeddings.create({
                model,
                input,
            });

            const embedding: number[] = response.data[0]?.embedding;
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
                "ft:babbage-002:personal::85dmj5zi",
                prompt,
                0.8,
                60,
            );

            console.log(`[completion]\n${completion[0].text}\n`);

            let genres: string[] = (
                completion[0].text
                .trim()
                .replace("장르: ", "")
                .replaceAll("#", "")
                .split(" ")
            );

            return genres;
        } catch (e) {
            console.log(e);
        }
        return null;
    }

    async createRecommendWebtoons(genres: string[], episodeLength?: number): Promise<Webtoon[]> {
        try {
            // 장르 리스트를 텍스트로 변환
            const genreText: string = genreToString(genres);

            // 캐싱
            const genreRecommendCache: string = await this.cacheManager.get(genreText);
            if (genreRecommendCache) {
                return JSON.parse(genreRecommendCache);
            }

            // 장르 텍스트를 기반으로 embedding 생성
            const genreEmbVector = await this.createEmbedding(
                "text-embedding-ada-002",
                genreText,
            );

            if (!genreEmbVector) return null;

            // 해당 카테고리와 총 편수에 적합한 웹툰 불러오기
            let webtoons: Webtoon[] = (
                await this.webtoonService.getAllWebtoonForCategory(genres[0])
            ).filter(
                (webtoon) => {
                    if (episodeLength && webtoon.episodeLength < episodeLength) {
                        return false;
                    }
                    return webtoon.service === "kakao" && webtoon.embVector !== null;
                }
            );
            
            // embedding 값 유사도 비교 저장
            const similarityCompare: { [title: string]: number } = {};
            for (const webtoon of webtoons) {
                similarityCompare[webtoon.title] = calcSimilarityFromEmbedding(
                    genreEmbVector,
                    JSON.parse(webtoon.embVector),
                );
            }

            // 저장된 embedding 값 유사도를 기준으로 내림차순 정렬
            webtoons.sort(
                (a, b) => {
                    return similarityCompare[a.title] - similarityCompare[b.title];
                }
            );

            // 제일 유사도가 높은 50개만 반환
            webtoons = webtoons.slice(0, 50);

            // 캐싱
            await this.cacheManager.set(genreText, JSON.stringify(webtoons));
            
            return webtoons;
        } catch (e) {
            console.log(e);
        }
        return null;
    }

    async recommendWebtoon(
        recommendBody: RecommendBodyDto
    ): Promise<Webtoon[]> {
        const { userId, genres, episodeLength, newExcludeWebtoonIds } = recommendBody;
        // cache-key
        const recommendExcludeCacheKey: string = `recommendExcludeCache-${userId}`;

        // genres를 통해 전체 웹툰 추천 목록 생성
        let recommendWebtoons: Webtoon[] = await this.createRecommendWebtoons(genres, episodeLength);

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
