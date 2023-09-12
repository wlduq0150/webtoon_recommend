import { Module, Scope } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Webtoon } from 'src/sequelize/entity/webtoon.model';
import { WebtoonsController } from './webtoons.controller';
import { WebtoonsService } from './webtoons.service';
import { redisCacheModule } from 'src/caching/redisCacheModule';
import { redisCacheProvider } from 'src/caching/redisCacheProvider';

const webtoonProvider = {
  provide: "WEBTOON",
  useValue: Webtoon,
  scope: Scope.DEFAULT
}

@Module({
  imports: [
    SequelizeModule.forFeature([Webtoon]),
    redisCacheModule,
  ],
  exports: [
    WebtoonsService,
    webtoonProvider,
    redisCacheModule,
    redisCacheProvider,
  ],
  controllers: [WebtoonsController],
  providers: [
    WebtoonsService,
    webtoonProvider,
    redisCacheProvider,
  ]
})
export class WebtoonsModule {
  constructor(private readonly webtoonSerivce: WebtoonsService) {}

  // sleep(sec) {
  //   return new Promise(resolve => setTimeout(resolve, sec * 1000));
  // }

  // async updateEmbedding() {
  //   try {
  //     const filePath: string = "/workspace/finding_restaurant/finding_rest/src/webtoons/complete.json";
  //     const completeList: string[] = JSON.parse((await fs.readFileSync(filePath)).toString());

  //     const idList: string[] = (
  //       (await this.webtoonSerivce.getAllWebtoonForOption({
  //         genreCount: 0,
  //         genre: "판타지",
  //         service: "kakao",
  //       })).map(
  //         (webtoon) => { return webtoon.webtoonId }
  //       )
  //     );

  //     console.log("complete count: ", completeList.length);
  //     for (const id of idList) {
  //       if (!completeList.includes(id)) {
  //         await this.webtoonSerivce.patchWebtoonEmbedding(id);
  //         completeList.push(id);
  //         console.log(id);
  //         await fs.writeFileSync(filePath, JSON.stringify(completeList));
  //         await this.sleep(30);
  //       }
  //     }
  //   } catch (e) {
  //     console.log(e);
  //   }
  // }

  // async changeDbGenres(dataArray: trainingResult[]) {
  //   for (const data of dataArray) {
  //     const { title, genres } = data;
  //     const webtoonId: string = (await this.webtoonSerivce.getWebtoonForTitle(title)).webtoonId;
  //     await this.webtoonSerivce.patchWebtoonGenre(webtoonId, genres);
  //   }
  // }

  // async resultTrainingData() {
  //   try {
  //     const fileData: string = (await fs.readFileSync("/workspace/finding_restaurant/finding_rest/src/webtoons/translation/training/trainingResult.json")).toString();
  //     let resultData: trainingResult[] = JSON.parse(fileData);
  //     console.log(resultData);
  //     await this.changeDbGenres(resultData);

  //     resultData = (await this.webtoonSerivce.getAllWebtoonForOption({
  //       genreCount: 0,
  //       genre: "판타지",
  //       service: "kakao",
  //     })).map(
  //       (webtoon) => {
  //         return { 
  //           title: webtoon.title,
  //           genres: JSON.parse(webtoon.genres),
  //         }
  //       }
  //     );

  //     await resultFormatData(resultData);
  //     console.log("완료!");
  //   } catch (e) {
  //     console.log(e);
  //   }
  // }

  // async trainingData() {
  //   try {
  //     const fileData: string = (await fs.readFileSync("/workspace/finding_restaurant/finding_rest/src/webtoons/translation/training/trainingData.json")).toString();
  //     const webtoonData: trainingData[] = JSON.parse(fileData);

  //     const fileResultData: string = (await fs.readFileSync("/workspace/finding_restaurant/finding_rest/src/webtoons/translation/training/trainingResult.json")).toString();
      
  //     const trainingResult: trainingResult[] = JSON.parse(fileResultData);
  //     console.log("length: ", trainingResult.length);
  //     const titleArray: string[] = trainingResult.map(
  //       (tr) => {
  //         return tr.title;
  //       }
  //     );
  //     let cnt = 0;
  //     for (const webtoon of webtoonData) {
  //       const title: string = webtoon.prompt.split("\n")[0].replace("title:", "");
  //       if (!titleArray.includes(title)) {
  //         const genres: string[] = await this.recommendService.recommendWebtoonGenre(webtoon.prompt);
  //         const result: trainingResult = { title, genres };
  //         console.log(result);
  //         trainingResult.push(result);
  //         await fs.writeFileSync("/workspace/finding_restaurant/finding_rest/src/webtoons/translation/training/trainingResult.json", JSON.stringify(trainingResult), { encoding: "utf-8" });
  //         await this.sleep(25);
  //       } else {
  //         cnt += 1;
  //         continue;
  //       }
  //     }
  //     console.log("include: ", cnt);
  //     fs.writeFileSync("/workspace/finding_restaurant/finding_rest/src/webtoons/translation/training/trainingResult.json", JSON.stringify(trainingResult), { encoding: "utf-8" });
  //   } catch (e) {
  //     console.log(e);
  //   }
  // }

  // async createBackup() {
  //   try {
  //     const webtoons: Webtoon[] = await this.webtoonSerivce.getAllWebtoonForOption({
  //       genreCount: 0,
  //     });

  //     const filePath: string = "/workspace/finding_restaurant/finding_rest/src/webtoons/backup";
  //     fs.writeFileSync(
  //       filePath + "/backup.json",
  //       JSON.stringify(webtoons),
  //       { encoding: "utf-8" }
  //     );
  //   } catch (e) {
  //     console.log(e);
  //   }
  // }

  // async BackupData() {
  //   try {
  //     const filePath: string = "/workspace/finding_restaurant/finding_rest/src/webtoons/backup/backup.json";
  //     const content: string = (await fs.readFileSync(filePath)).toString();

  //     const webtoons: Webtoon[] = JSON.parse(content);
  //     const webtoonInfos: WebtoonInfo[] = webtoons.map(
  //       (webtoon) => {
  //         const genres: string[] = JSON.parse(webtoon.genres);
  //         return {
  //           ...webtoon,
  //           genres,
  //           genreCount: genres.length,
  //           category: genres[0], 
  //           embVector: null,
  //         }
  //       }
  //     );

  //     let count = 0;
  //     for (const webtoonInfo of webtoonInfos) {
  //       await this.webtoonSerivce.insertWebtoon(webtoonInfo);
  //       console.log(`title(${count++}): ${webtoonInfo.title}`);
  //     }
  //   } catch (e) {
  //     console.log(e);
  //   }
  // }

  // async getWebtoon(read: boolean) {
  //   let idList: string[];
  //   try {
  //     if (read) {
  //       idList = JSON.parse(await fs.readFileSync("idList.json").toString());
  //     } else {
  //       idList = await getKakaoWeeklyWebtoonId();
  //     }
  //     fs.writeFileSync("idList.json", JSON.stringify(idList));
  //   } catch (e) {
  //     console.log(e);
  //     fs.writeFileSync("idList.json", "");
  //     idList = await getKakaoWeeklyWebtoonId();
  //   }
  //   console.log(idList);
  //   console.log(idList.length);
  //   const existIdList: string[] = await this.webtoonSerivce.getAllWebtoonId();
  //   idList = idList.filter((id) => {
  //     return (!existIdList.includes(id));
  //   });
  //   console.log(idList);
  //   console.log(idList.length);
  //   const webtoonInfoList: WebtoonInfo[] = await saveKakaoWebtoonForId(idList, async (webtoonInfo) => {
  //     await this.webtoonSerivce.insertWebtoon(webtoonInfo);
  //   });
  //   // webtoonInfoList
  //   // .map(async (webtoonInfo) => {
  //   //     const result = await this.webtoonSerivce.insertWebtoon(webtoonInfo);
  //   //     if (result) {
  //   //       console.log(`id: ${webtoonInfo.webtoonId}`);
  //   //     } else {
  //   //       console.log("저장 실패");
  //   //     }
  //   // });
  // }

  // createTrainingFile(
  //   genreCount: number = null,
  //   genre: string = null,
  //   service: string = null,
  // ) {
  //   this.webtoonSerivce.getAllWebtoonForOption({genreCount, genre, service})
  //   .then((webtoonList) => {
  //     console.log("수량: ", webtoonList.length);
  //     formatData(webtoonList);
  //   });
  // }
}
