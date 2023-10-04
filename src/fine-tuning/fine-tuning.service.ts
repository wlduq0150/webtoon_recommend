import { Injectable } from '@nestjs/common';
import { genreToString } from 'src/recommend/processing/genreToText';
import { Webtoon } from 'src/sequelize/entity/webtoon.model';
import { WebtoonsService } from 'src/webtoons/webtoons.service';
import { FINE_TUNE_API_KEY, FINE_TUNE_BABBAGE_MODEL, FINE_TUNE_GPT_3_5_MODEL, FINE_TUNE_RESULT_PATH } from './constatns/constants';
import { trainingData } from 'src/webtoons/types';
import { FileObject, FileObjectsPage, FineTune, FineTunesPage } from 'openai/resources';
import { FineTuningJob, FineTuningJobsPage } from 'openai/resources/fine-tuning';
import OpenAI from 'openai';
import * as fs from "fs";


// https://www.npmjs.com/package/openai

@Injectable()
export class FineTuningService {

    private openai: OpenAI;

    constructor(private readonly webtoonService: WebtoonsService) {
        const API_KEY = FINE_TUNE_API_KEY;

        const configuration = { apiKey: API_KEY };

        this.openai = new OpenAI(configuration);
    }

    async createFineTuneDataToJsonFile(categorys: string[]): Promise<void> {
        const webtoons: Webtoon[] = [];
        const date: Date = new Date();
        const fileTitle: string = `fineTuneData${date.getMonth()}${date.getDate()}.json`;
        const filePath: string = FINE_TUNE_RESULT_PATH;
        const fineTuneData: trainingData[] = [];

        for (let category of categorys) {
            const webtoonsForCategory: Webtoon[] = await this.webtoonService.getAllWebtoonForOption({
                genreCount: 7,
                category,
                descriptionLength: 300,
            });
            webtoons.push(...webtoonsForCategory);
        }

        for (let webtoon of webtoons) {
            const { title, description, category, genres } = webtoon;

            const prompt: string = `제목: ${title}\n분류: ${category}\n줄거리: ${description}`;
            const completion: string = `장르: ${genreToString(JSON.parse(genres))}`;
            const fineTuneDataLine: trainingData = {prompt, completion};
            
            fineTuneData.push(fineTuneDataLine);
        }

        fs.writeFileSync(filePath+fileTitle, JSON.stringify(fineTuneData), { encoding: "utf-8" });
    }

    async createFileUpload(): Promise<FileObject> {
        const filePath: string = "/workspace/finding_restaurant/finding_rest/src/fine-tuning/result/fineTuneData830.jsonl";
        const file: fs.ReadStream = fs.createReadStream(filePath);
        const upload = await this.openai.files.create(
            {
                file,
                purpose: "fine-tune"
            }
        );
        return upload;
    }

    async createFineTuneModel(): Promise<FineTuningJob> {
        try {
            const trainingFile: string = "file-l6MWLg4dZwIR2zPYZWbTWorI";
            const trainingModel: string = FINE_TUNE_BABBAGE_MODEL;
            const fineTune: FineTuningJob =  await this.openai.fineTuning.jobs.create(
                {
                    training_file: trainingFile,
                    model: trainingModel,
                    hyperparameters: { n_epochs: 6 }
                }
            )
            return fineTune;
        } catch (e) {
            if (e instanceof OpenAI.APIError) {
                console.log(e.status); // 400
                console.log(e.name); // BadRequestError
                console.log(e.headers); // {server: 'nginx', ...}
                console.log(e);
              } else {
                throw e;
              }
        }
    }



    async getUploadFileList(): Promise<FileObject[]> {
        const uploadFileData: FileObjectsPage = await this.openai.files.list();
        const uploadFileList: FileObject[] = uploadFileData.data;
        return uploadFileList;
    }

    async getFineTuningList(): Promise<any> {
        const fineTuningData: FineTuningJobsPage = await this.openai.fineTuning.jobs.list();
        const fineTuningList: FineTuningJob[] = fineTuningData.data;
        return fineTuningList;
    }

    async getFineTuneList(): Promise<any> {
        const fineTuneData: FineTuningJobsPage = await this.openai.fineTuning.jobs.list();
        const fineTuneList: FineTuningJob[] = fineTuneData.data;
        return fineTuneList;
    }




    async searchFineTuning(id: string): Promise<FineTuningJob> {
        try {
            return await this.openai.fineTuning.jobs.retrieve(id);
        } catch (e) {
            if (e instanceof OpenAI.APIError) {
                console.log(e.status); // 400
                console.log(e.name); // BadRequestError
                console.log(e.headers); // {server: 'nginx', ...}
              } else {
                throw e;
              }
        }
    }

    async searchFineTune(id: string): Promise<FineTune> {
        try {
            return await this.openai.fineTunes.retrieve(id);
        } catch (e) {
            if (e instanceof OpenAI.APIError) {
                console.log(e.status); // 400
                console.log(e.name); // BadRequestError
                console.log(e.headers); // {server: 'nginx', ...}
              } else {
                throw e;
              }
        }
    }






    async deleteUploadFile(id: string): Promise<void> {
        try {
            await this.openai.files.del(id);
        } catch (e) {
            if (e instanceof OpenAI.APIError) {
                console.log(e.status); // 400
                console.log(e.name); // BadRequestError
                console.log(e.headers); // {server: 'nginx', ...}
              } else {
                throw e;
              }
        }
    }

    

    async cancleFineTuning(id: string): Promise<void> {
        try {
            await this.openai.fineTuning.jobs.cancel(id);
        } catch (e) {
            if (e instanceof OpenAI.APIError) {
                console.log(e.status); // 400
                console.log(e.name); // BadRequestError
                console.log(e.headers); // {server: 'nginx', ...}
              } else {
                throw e;
              }
        }
    }
}
