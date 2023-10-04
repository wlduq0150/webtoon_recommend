import puppeteer from "puppeteer";
import * as cheerio from "cheerio";

async function getNaverGenres(): Promise<string[]> {
    const browser = await puppeteer.launch({
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();

    const genreList: string[] = [];

    const rootSelector = "#container > div.GenreListView__tag_wrap--HrxE5 > div";
    await page.goto("https://comic.naver.com/webtoon?tab=genre");
    await page.waitForSelector(rootSelector);
    const content = await page.content();
    const $ = cheerio.load(content);

    const rootElement = $(rootSelector);
    rootElement
    .children()
    .map((idx, element) => {
        const $data = cheerio.load(element);
        const genre = $data.text();
        genreList.push(genre);
    });

    return genreList;
}

export default getNaverGenres;