import puppeteer from "puppeteer";
import * as cheerio from "cheerio";
import { WebtoonEPLength } from "src/webtoons/types";

async function getNaverWebtoonEPLengthForId(idList: string[], retryCount?: number): Promise<WebtoonEPLength[]> {
    let webtoonEPLengthList: WebtoonEPLength[] = [];
    const failedIdList: string[] = [];
    const browser = await puppeteer.launch({
        args: [
          '--no-sandbox',
           '--disable-setuid-sandbox'
        ]
    });
    const page = await browser.newPage();

    const episodeSelector: string = "#content > div.EpisodeListView__episode_list_wrap--q0VYg > div.EpisodeListView__episode_list_head--PapRv > div.EpisodeListView__count--fTMc5";

    for (let id of idList) {
        try {
            await Promise.all([
                page.goto(`https://comic.naver.com/webtoon/list?titleId=${id}`),
                page.waitForSelector(episodeSelector)
            ]);

            const content = await page.content();
            const $ = cheerio.load(content);
    
            const rootElement = $(episodeSelector);
            const reg = new RegExp(/[0-9]+/, "g");
            const episodeLength: number = parseInt(rootElement.text().match(reg)[0]);

            console.log(`${id} ${episodeLength}`);

            webtoonEPLengthList.push({ webtoonId: id, service: "naver", episodeLength });
        } catch(e) {
            console.log(`webtoonId ${id}'s episodeLength is not crawled..`);
            failedIdList.push(id);
            continue;
        }
    }

    await page.close();
    await browser.close();

    if (failedIdList.length && retryCount < 2) {
        const retryWebtoonEPLengthList = await getNaverWebtoonEPLengthForId(failedIdList, ++retryCount);
        webtoonEPLengthList = webtoonEPLengthList.concat(retryWebtoonEPLengthList);
    }

    return webtoonEPLengthList;
}

export default getNaverWebtoonEPLengthForId;