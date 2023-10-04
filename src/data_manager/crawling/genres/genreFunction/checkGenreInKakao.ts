import * as fs from "fs";

interface MatchObjects {
    [key: string] : string[];
}

async function checkGenreInKakao() {
    try {
        const kakaoKeyword: string[] = (await fs.readFileSync("/workspace/finding_restaurant/finding_rest/src/webtoons/crawling/genres/kakaoGenre.txt")).toString().split("\n");
        kakaoKeyword.map((v, idx) => {
            if (v.includes("\n")) kakaoKeyword[idx] = v.replaceAll("\n", "");
        });
        const matchContent: string[] = (await fs.readFileSync("/workspace/finding_restaurant/finding_rest/src/webtoons/crawling/genres/completed.txt")).toString().split("\n");
        matchContent.map((v, idx) => {
            if (v.includes("\n")) matchContent[idx] = v.replaceAll("\n", "");
        });
        const matchGenre: MatchObjects = {};
        matchContent
        .map((match) => {
            if (match === "") return;
            const kvList = match.split(" : ");
            console.log(kvList);
            const value = kvList[1].split(", ");
            matchGenre[kvList[0]] = value;
        });
        let resultData: string = "";
        for (const key in matchGenre) {
            const values = matchGenre[key];
            const newValues = [];
            values.map((value) => {
                if (kakaoKeyword.includes(value)) {
                    newValues.push(value);
                }
            });
            matchGenre[key] = newValues;
            resultData += `${key} : ${newValues.join(", ")}\n`;
        }
        console.log(resultData);
        fs.writeFileSync(
            "/workspace/finding_restaurant/finding_rest/src/webtoons/crawling/genres/match.json",
            JSON.stringify(matchGenre),
            { encoding: "utf-8" },
        );
        fs.writeFileSync(
            "/workspace/finding_restaurant/finding_rest/src/webtoons/crawling/genres/completed.txt",
            resultData,
            { encoding: "utf-8" },
        );
    } catch (e) {
        console.log(e);
    }
}

export default checkGenreInKakao;