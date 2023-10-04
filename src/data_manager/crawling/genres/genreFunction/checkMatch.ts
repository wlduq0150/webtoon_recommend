import * as fs from "fs";

interface matchObject {
    [key: string] : string;
}

async function checkGenre() {
    try {
        const kakaoKeyword: string[] = (await fs.readFileSync("/workspace/finding_restaurant/finding_rest/src/webtoons/crawling/genres/kakaoGenre.txt")).toString().split("\n");
        kakaoKeyword.map((v, idx) => {
            if (v.includes("\n")) kakaoKeyword[idx] = v.replaceAll("\n", "");
        });
        const matchList: matchObject = {};
        const unMatchList: matchObject = {};
        const matchResult: string = (await fs.readFileSync("/workspace/finding_restaurant/finding_rest/src/webtoons/crawling/genres/matchGenre.txt")).toString();
        matchResult
        .split("\n")
        .map((v) => {
            const key = v.split(": ")[0];
            const value = v.split(": ")[1];
            let newValue: string[] = [];
            let match = true;
            if (value.includes(",")) {
                value.split(", ")
                .map((genre) => {
                    if (kakaoKeyword.includes(genre)) newValue.push(genre);
                });
                if (newValue.length === 0) match = false;
            } else {
                if (!kakaoKeyword.includes(value)) match = false;
            }
            if (match) {
                matchList[key] = value;
            } else {
                unMatchList[key] = value;
            }
        });
        let matchData = "";
        let unMatchData = "";
        for (const key in matchList) {
            matchData += `${key} : ${matchList[key]}\n`;
        }
        for (const key in unMatchList) {
            unMatchData += `${key}\n`;
        }
        console.log("매치: ", matchData);
        console.log("언매치: ", unMatchData);
        await fs.writeFileSync("/workspace/finding_restaurant/finding_rest/src/webtoons/crawling/genres/match.txt", matchData);
        await fs.writeFileSync("/workspace/finding_restaurant/finding_rest/src/webtoons/crawling/genres/noMatch.txt", unMatchData);
    } catch (e) {
        console.log(e);
    }
}

export default checkGenre;