import * as fs from "fs";
import { Webtoon } from "src/sequelize/entity/webtoon.model";
import { trainingData } from "src/webtoons/types";

async function formatData(webtoonList: Webtoon[]) {
    const filePath: string = "/workspace/finding_restaurant/finding_rest/src/webtoons/translation/training/trainingData.json";
    try {
        await fs.readFileSync(filePath, { encoding: "utf-8" });
    } catch {
        console.log("데이터 파일이 없으므로 생성합니다.");
        fs.open(filePath, 'w', () => {
            console.log("생성 완료");
        });
    }
    let resultData: trainingData[] = [];
    webtoonList
    .map((webtoon) => {
        let genres: string = "";
        const genreList: string[] = webtoon.genres.replaceAll(/[\[\]]/g, "").replaceAll('"', '').split(",")
        genreList.forEach((genre) => {
            genres += "#" + genre + " ";
        });
        const data: trainingData = {
            prompt: `title:${webtoon.title}\nsummary:${webtoon.description.replaceAll(/[=-]/g, "")}\n의 장르를 분석해줘\n\n`,
            completion: "장르: " + genres,
        };
        resultData.push(data);
    });
    try {
        fs.writeFileSync(filePath, JSON.stringify(resultData), {
            encoding: "utf-8",
        });
    } catch (e) {
        console.log(e);
    }
}

export default formatData;