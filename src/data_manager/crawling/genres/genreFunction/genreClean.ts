import * as fs from "fs";

export async function cleanGenres(gPath: string) {
    try {
        const genreData: string = (await fs.readFileSync(gPath)).toString();
        const fixedData: string = genreData.replaceAll("\n", " ");
        fs.writeFileSync("/workspace/finding_restaurant/finding_rest/src/webtoons/crawling/genres/genreList.txt", fixedData);
    } catch (e) {
        console.error(e);
    }
}

export default cleanGenres;