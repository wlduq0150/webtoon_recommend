import { WebtoonEPLength } from "src/webtoons/types";
import puppeteer from "puppeteer";
import * as cheerio from "cheerio";
import sendLoginRequest from "./loginRequest";

async function getKakaoWebtoonEPLengthForId(idList: string[], retryCount?: number): Promise<WebtoonEPLength[]> {
    let webtoonEPLengthList: WebtoonEPLength[] = [];
    const failedIdList: string[] = [];
    const browser = await puppeteer.launch({
        args: [
          '--no-sandbox',
           '--disable-setuid-sandbox'
        ]
    });
    const page = await browser.newPage();

    const result = await sendLoginRequest(page);
    console.log("로그인", result ? "성공" : "실패");

    const waitSelector: string = "#__next > div > div.flex.w-full.grow.flex-col.px-122pxr > div.flex.h-full.flex-1 > div.mb-28pxr.ml-4px.flex.w-632pxr.flex-col.overflow-hidden.rounded-12pxr > div.flex-1.flex.flex-col > div.rounded-b-12pxr.bg-bg-a-20 > div.flex.min-h-\\[250px\\].flex-col.justify-center > div.min-h-364pxr > ul";
    const episodeSelector: string = "#__next > div > div.flex.w-full.grow.flex-col.px-122pxr > div.flex.h-full.flex-1 > div.mb-28pxr.ml-4px.flex.w-632pxr.flex-col.overflow-hidden.rounded-12pxr > div.flex-1.flex.flex-col > div.rounded-b-12pxr.bg-bg-a-20 > div.flex.h-44pxr.w-full.flex-row.items-center.justify-between.bg-bg-a-20.px-18pxr > div.flex.h-full.flex-1.items-center.space-x-8pxr > span";

    for (let id of idList) {
        try {
            await Promise.all([
                page.goto(`https://page.kakao.com/content/${id}`),
                page.waitForSelector(waitSelector, { timeout: 3000 })
            ]);

            const content = await page.content();
            const $ = cheerio.load(content);
            
            const rootElement = $(episodeSelector);
            const episodeLength: number = parseInt(rootElement.text().split(" ")[1]);

            console.log(`${id} ${episodeLength}`);
            
            webtoonEPLengthList.push({ webtoonId: id, service: "kakao", episodeLength });
        } catch (e) {
            console.log(`webtoonId ${id}'s episodeLength is not crawled..`);
            failedIdList.push(id);
            continue;
        }
    }

    await page.close();
    await browser.close();
    
    if (failedIdList.length && retryCount < 2) {
        const retryWebtoonEPLengthList = await getKakaoWebtoonEPLengthForId(failedIdList, ++retryCount);
        webtoonEPLengthList = webtoonEPLengthList.concat(retryWebtoonEPLengthList);
    }

    return webtoonEPLengthList;
}

export default getKakaoWebtoonEPLengthForId;