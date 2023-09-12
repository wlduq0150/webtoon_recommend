import { trainingData, trainingResult } from "src/webtoons/types";
import * as fs from "fs";
import { genreToString } from "src/recommend/processing/genreToText";

async function resultFormatData(results: trainingResult[]): Promise<void> {
    const filePath: string = "/workspace/finding_restaurant/finding_rest/src/webtoons/translation/training/resultTrainingData.json";
    try {
        await fs.readFileSync(filePath);
    } catch (e) {
        console.log(e);
        fs.writeFileSync(filePath, "", { encoding: "utf-8" });
    }

    const dataArray: trainingData[] = []
    for (const result of results) {
        const { title, genres } = result; 
        const data: trainingData = {
            prompt: `장르: ${genreToString(genres)}\n해당 장르의 웹툰을 추천해줘`,
            completion: `${title}`,
        };
        dataArray.push(data);
    }

    fs.writeFileSync(filePath, JSON.stringify(dataArray), { encoding: "utf-8" });
} 

export default resultFormatData;