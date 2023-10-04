import puppeteer from "puppeteer";
import * as cheerio from "cheerio";
import { UpdateDay } from "src/webtoons/types";

async function getNaverWeeklyWebtoonId(): Promise<string[]> {
    const webtoonIdList: string[] = [];
    const browser = await puppeteer.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();


    const rootSelector = "#container > div.component_wrap.type2 > div.WeekdayMainView__daily_all_wrap--UvRFc";
    await page.goto("https://comic.naver.com/webtoon");
    await page.waitForSelector(rootSelector);

    const content = await page.content();
    const $ = cheerio.load(content);

    const rootElement = $(rootSelector);
    rootElement
    .children()
    .map((idx, element) => {
        const $data = cheerio.load(element);
        const dayElement = $data("ul > li");
        dayElement
        .map((idx_, element_) => {
            const $$data = cheerio.load(element_);
            const reg = new RegExp(/[0-9]+/, "g");
            const webtoonId = $$data("a").attr("href").match(reg)[0];
            webtoonIdList.push(webtoonId);
        });
    });

    await page.close();
    await browser.close();

    return webtoonIdList;
}

export default getNaverWeeklyWebtoonId;