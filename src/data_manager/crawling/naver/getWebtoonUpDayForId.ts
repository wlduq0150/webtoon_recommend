import puppeteer from "puppeteer";
import * as cheerio from "cheerio";
import { WebtoonUpdateDay } from "src/webtoons/types";

async function getNaverWebtoonUpdateDayForId(idList: string[], retryCount?: number): Promise<WebtoonUpdateDay[]> {
    let webtoonuUpdateDayList: WebtoonUpdateDay[] = [];
    const failedIdList: string[] = [];
    const browser = await puppeteer.launch({
        args: [
          '--no-sandbox',
           '--disable-setuid-sandbox'
        ]
    });
    const page = await browser.newPage();

    const daySelector: string = "#content > div.EpisodeListInfo__comic_info--yRAu0 > div > div.ContentMetaInfo__meta_info--GbTg4 > em";

    for (let id of idList) {
        try {
            await Promise.all([
                page.goto(`https://comic.naver.com/webtoon/list?titleId=${id}`),
                page.waitForSelector(daySelector, { timeout: 3000 })
            ]);

            const content = await page.content();
            const $ = cheerio.load(content);
    
            const rootElement = $(daySelector);
            const crawlingText: string = rootElement.text();
            let updateDay: string = crawlingText.includes("완결") ? "완" : crawlingText.charAt(0);
            if (Number.isInteger(updateDay)) {
                updateDay = "휴";
            }
            console.log(`${id} ${updateDay}`);

            webtoonuUpdateDayList.push({ webtoonId: id, service: "naver", updateDay });
        } catch(e) {
            console.log(`webtoonId ${id}'s episodeLength is not crawled..`);
            failedIdList.push(id);
            continue;
        }
    }

    await page.close();
    await browser.close();

    if (failedIdList.length && retryCount < 2) {
        const retryWebtoonEPLengthList = await getNaverWebtoonUpdateDayForId(failedIdList, ++retryCount);
        webtoonuUpdateDayList = webtoonuUpdateDayList.concat(retryWebtoonEPLengthList);
    }

    return webtoonuUpdateDayList;
}

export default getNaverWebtoonUpdateDayForId;