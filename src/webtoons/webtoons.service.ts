import { Inject, Injectable} from '@nestjs/common';
import { Webtoon } from 'src/sequelize/entity/webtoon.model';
import { SelectOption, UpdateDayList, WebtoonInfo } from './types';
import { Cache } from 'cache-manager';
import { WebtoonAlreadyExistException, WebtoonNotFoundException, WebtoonPropertyWrongException } from 'src/exception/webtoonException/webtoonExceptions';
import * as fs from "fs";

@Injectable()
export class WebtoonsService {
    constructor(
        @Inject("WEBTOON") 
        private readonly webtoonModel: typeof Webtoon,
        @Inject("REDIS")
        private readonly cacheManger: Cache,
    ) {}

    // get ~ for
    // get ~ for

    async getAllWebtoon(): Promise<Webtoon[]> {
        return this.webtoonModel.findAll();
    }

    async getWebtoonForId(id: string): Promise<Webtoon> {
        const webtoonCacheKey: string = `webtoonCache-${id}`;

        const webtoonCache: string = await this.cacheManger.get(webtoonCacheKey);
        if (webtoonCache) {
            const webtoonInfo = JSON.parse(webtoonCache);
            return new Webtoon(webtoonInfo);
        }

        const webtoon: Webtoon =  await this.webtoonModel.findOne({ where: { webtoonId: id }});
        if (!webtoon) {
            throw WebtoonNotFoundException(`webtoonId(${id}) not found`);
        }

        this.cacheManger.set(webtoonCacheKey, JSON.stringify(webtoon));

        return webtoon;
    }
    

    async getAllWebtoonForIds(ids: string[]): Promise<Webtoon[]> {
        const webtoons: Webtoon[] = [];
        for (const id of ids) {
            const webtoon: Webtoon = await this.getWebtoonForId(id);
            if (webtoon) webtoons.push(webtoon);
        }
        return webtoons;
    }

    async getAllWebtoonForDay(day: string): Promise<Webtoon[]> {
        const daywebtoonCacheKey: string = `webtoonCache-${day}`;

        const dayWebtoonCache: string = await this.cacheManger.get(daywebtoonCacheKey);
        if (dayWebtoonCache) {
            const dayWebtoon = JSON.parse(dayWebtoonCache);
            return dayWebtoon;
        }

        const webtoons: Webtoon[] =  await this.webtoonModel.findAll(
            {
                attributes: { exclude: ["embVector"] },
                where: { updateDay: day }
            }
        );
        if (!webtoons) {
            throw WebtoonNotFoundException(`webtoonDay(${day}) not found`);
        }

        this.cacheManger.set(daywebtoonCacheKey, JSON.stringify(webtoons));

        return webtoons;
    }

    async getAllFinishedWebtoon(): Promise<Webtoon[]> {
        const finishedWebtoonCacheKey: string = `webtoonCache-finished`;

        const finishedWebtoonCache: string = await this.cacheManger.get(finishedWebtoonCacheKey);
        if (finishedWebtoonCache) {
            const finishedWebtoon = JSON.parse(finishedWebtoonCache);
            return finishedWebtoon;
        }

        const webtoons: Webtoon[] =  await this.webtoonModel.findAll(
            {
                attributes: { exclude: ["embVector"] },
                where: { updateDay: "완" }
            }
        );
        if (!webtoons) {
            throw WebtoonNotFoundException(`webtoonDay(finished) not found`);
        }

        this.cacheManger.set(finishedWebtoonCacheKey, JSON.stringify(webtoons));

        return webtoons;
    };

    async getWebtoonForTitle(title: string): Promise<Webtoon> {
        const webtoon: Webtoon = await this.webtoonModel.findOne({ where: { title } });

        if (!webtoon) {
            throw WebtoonNotFoundException(`webtoonTitle(${title}) not found`);
        }

        return webtoon;
    }

    async getAllWebtoonForService(service: string): Promise<Webtoon[]> {
        const allWebtoon: Webtoon[] = await this.webtoonModel.findAll({ where: { service } });

        if (!allWebtoon) {
            throw WebtoonNotFoundException(`service(${service}) not exist`);
        }

        return allWebtoon;
    }

    async getAllWebtoonForCategory(category: string): Promise<Webtoon[]> {
        const allWebtoon: Webtoon[] = await this.webtoonModel.findAll({ where: { category } });

        if (!allWebtoon) {
            throw WebtoonNotFoundException(`category(${category}) not exist`);
        }

        return allWebtoon;
    }
	
    async getAllWebtoonForOption(option: SelectOption): Promise<Webtoon[]> {
        let selectQeury: string = "SELECT * FROM Webtoons WHERE ";

        if (option.genreCount) {
            selectQeury += `(LENGTH(genres) - LENGTH(REPLACE(genres, '"', ''))) / 2 < ${option.genreCount}`;
        } else {
            selectQeury += `(LENGTH(genres) - LENGTH(REPLACE(genres, '"', ''))) / 2 > 0`;
        }

        if (option.service) {
            selectQeury += ` AND service=\"${option.service}\"`;
        }

        if (option.category) {
            selectQeury += ` AND category=\"${option.category}\"`;
        }

        if (option.descriptionLength) {
            selectQeury += ` AND LENGTH(description) >= ${option.descriptionLength}`;
        }

        let data, webtoonList: Webtoon[];
        try {
            data = await this.webtoonModel.sequelize.query(
                selectQeury,
            ) as (Webtoon[])[];
            webtoonList = data[0];
        } catch (e) {
            console.log(e);
        }

        return webtoonList;
    }





    // get
    // get

	async getAllWebtoonId(service?: string, day?: string): Promise<string[]> {
        const serviceList: string[] = service ? [ service ] : [ "kakao", "naver" ];
        const updateDay: string[] = day ? [ day ] : UpdateDayList;
		const allId = (await this.webtoonModel.findAll({
            attributes: [ "webtoonId" ],
            where: {
                service: serviceList,
                updateDay,
            }
        }))
        .map((webtoon) => {
            return webtoon.dataValues.webtoonId;
        });
        return allId;
	}






    // insert
    // insert

    async insertWebtoon(webtoonInfo: WebtoonInfo): Promise<void> {
        const webtoon: Webtoon = await this.webtoonModel.findOne({
            where: { webtoonId: webtoonInfo.webtoonId },
        });

        if (webtoon) {
            throw WebtoonAlreadyExistException();
        }
        

        this.webtoonModel.create({
            ...webtoonInfo,
            author: typeof webtoonInfo.author !== "string" ? JSON.stringify(webtoonInfo.author) : webtoonInfo.author,
            genres: typeof webtoonInfo.genres !== "string" ? JSON.stringify(webtoonInfo.genres) : webtoonInfo.genres,
        })
        .then(() => {
            console.log(`webtoonId(${webtoonInfo.webtoonId}) is created`);
        })
        .catch((e) => {
            throw WebtoonPropertyWrongException(null, webtoonInfo);
        })
    }




    // Patch
    // Patch

    async patchWebtoonTitle(id: string, title: string): Promise<void> {
        await this.getWebtoonForId(id);

        await this.webtoonModel.update(
            { title },
            { where: { webtoonId: id } },
        );
    }

    async patchWebtoonUpdateDay(id: string, updateDay: string): Promise<void> {
        await this.getWebtoonForId(id);

        await this.webtoonModel.update(
            { updateDay },
            { where: { webtoonId: id } },
        );
    }

    async patchWebtoonCategory(id: string, category: string): Promise<void> {
        await this.getWebtoonForId(id);

        await this.webtoonModel.update(
            { category },
            { where: { webtoonId: id } },
        );
        
        const webtoon: Webtoon = await this.webtoonModel.findOne({ where: { webtoonId: id } });
        const genres: string[] = JSON.parse(webtoon.genres);
        genres[0] = category;

        await this.patchWebtoonGenre(id, genres);
    }

    async patchWebtoonEPL(id: string, episodeLength: number): Promise<void> {
        await this.getWebtoonForId(id);

        await this.webtoonModel.update(
            { episodeLength },
            { where: { webtoonId: id } },
        );
    }

    async patchWebtoonGenre(id: string, genres: string[]): Promise<void> {
        await this.getWebtoonForId(id);

        await this.webtoonModel.update(
            { genres: JSON.stringify(genres), genreCount: genres.length },
            { where: { webtoonId: id } },
        );
    }

    async patchWebtoonEmbedding(id: string, embVector: number[]): Promise<void> {
        await this.getWebtoonForId(id);

        await this.webtoonModel.update(
            { embVector: JSON.stringify(embVector) },
            { where: { webtoonId: id } },
        );
    }






    /// delete
    /// delete

    async deleteWebtoon(id: string): Promise<void> {
        await this.getWebtoonForId(id);

        this.webtoonModel.destroy(
            { where: { webtoonId: id }
        })
        .then(() => {
            console.log(`webtoonId(id) is removed`);
        });
    }
}
