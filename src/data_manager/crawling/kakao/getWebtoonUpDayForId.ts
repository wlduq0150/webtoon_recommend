import puppeteer from "puppeteer";
import * as cheerio from "cheerio";
import sendLoginRequest from "./loginRequest";
import { WebtoonUpdateDay } from "src/webtoons/types";

async function getKakaoWebtoonUpdateDayForId(idList: string[], retryCount?: number): Promise<WebtoonUpdateDay[]> {
    let webtoonuUpdateDayList: WebtoonUpdateDay[] = [];
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

    const daySelector: string = "#__next > div > div.flex.w-full.grow.flex-col.px-122pxr > div.flex.h-full.flex-1 > div.mb-28pxr.flex.w-320pxr.flex-col > div.rounded-t-12pxr.bg-bg-a-20 > div > div.relative.px-18pxr.text-center.bg-bg-a-20.mt-24pxr > a > div > div.mt-6pxr.flex.items-center > span";

    for (let id of idList) {
        try {
            await Promise.all([
                page.goto(`https://page.kakao.com/content/${id}`),
                page.waitForSelector(daySelector, { timeout: 3000 })
            ]);

            const content = await page.content();
            const $ = cheerio.load(content);

            const rootElement = $(daySelector);
            const updateDay: string = rootElement.text().charAt(0);

            console.log(id);

            webtoonuUpdateDayList.push({ webtoonId: id, service: "kakao", updateDay });
        } catch (e) {
            console.log(`webtoonId ${id}'s updateDay is not crawled..`);
            failedIdList.push(id);
            continue;
        }
    }

    await page.close();
    await browser.close();
    
    if (failedIdList.length && retryCount < 2) {
        const retryWebtoonEPLengthList = await getKakaoWebtoonUpdateDayForId(failedIdList, ++retryCount);
        webtoonuUpdateDayList = webtoonuUpdateDayList.concat(retryWebtoonEPLengthList);
    }

    return webtoonuUpdateDayList;
}

export default getKakaoWebtoonUpdateDayForId;