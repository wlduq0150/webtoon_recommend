import puppeteer from "puppeteer";
import * as cheerio from "cheerio";

function sleep(sec) {
    return new Promise(resolve => setTimeout(resolve, sec * 1000));
}

async function getNaverFinishedWebtoonId(): Promise<string[]> {
    const webtoonIdList: string[] = [];
    const browser = await puppeteer.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();


    const rootSelector = "#content > div:nth-child(1) > ul";
    const sunClickSelector = "#wrap > header > div.SubNavigationBar__snb_wrap--A5gfM > nav > ul > li:nth-child(8) > a";
    const finishClickSelector = "#wrap > header > div.SubNavigationBar__snb_wrap--A5gfM > nav > ul > li:nth-child(11) > a";
    
    await page.goto("https://comic.naver.com/webtoon?tab=finish");
    await page.waitForSelector(rootSelector);
    
    while (true) {
        try {
            // 네이버 자동 스크롤링 방지 뚫기 (다른 페이지를 갔다가 다시 돌아온다.)
            await page.click(finishClickSelector);
            await page.waitForSelector(rootSelector, { timeout: 30000 });

            // 스크롤
            const scrollHeight = 'document.body.scrollHeight';
            const previousHeight = await page.evaluate(scrollHeight);
            await page.evaluate(`window.scrollTo(0, ${scrollHeight})`);
            await page.waitForFunction(`${scrollHeight} > ${previousHeight}`, {
                timeout: 30000
            });

            if (parseInt(previousHeight as string) > 80000) {
                break;
            }
            console.log(previousHeight);

            // 네이버 자동 스크롤링 방지 뚫기 (다른 페이지를 갔다가 다시 돌아온다.)
            await page.click(sunClickSelector);
            await page.waitForSelector(rootSelector);
        } catch (e) {
            break;
        }
    }

    const content = await page.content();
    const $ = cheerio.load(content);

    const rootElement = $(rootSelector);
    rootElement
    .children()
    .map((idx, element) => {
        const $data = cheerio.load(element);
        const reg = new RegExp(/[0-9]+/, "g");
        const webtoonId = $data("a").attr("href").match(reg)[0];
        webtoonIdList.push(webtoonId);
    });

    await page.close();
    await browser.close();

    return webtoonIdList;
}

export default getNaverFinishedWebtoonId;