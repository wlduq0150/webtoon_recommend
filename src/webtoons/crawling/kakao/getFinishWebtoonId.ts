import * as cheerio from 'cheerio';
import puppeteer from "puppeteer"
import { UpdateDay } from '../../types';

async function getKakaoFinishWebtoonId(): Promise<string[]> {
  const webtoonIdList: string[] = [];
  const browser = await puppeteer.launch({
    args: [
      '--no-sandbox',
       '--disable-setuid-sandbox'
    ]
  });
  const page = await browser.newPage();

const rootSelector = '#__next > div > div.flex.w-full.grow.flex-col.px-122pxr > div > div.flex.grow.flex-col > div.mb-4pxr.flex-col > div > div.px-11pxr > div > div';

await page.goto(`https://page.kakao.com/menu/10010/screen/52?tab_uid=12`);
await page.waitForSelector(rootSelector);
await page.screenshot({ path: "example.png" });
while (true) {
    try {
    const scrollHeight = 'document.body.scrollHeight';
    let previousHeight = await page.evaluate(scrollHeight);
    await page.evaluate(`window.scrollTo(0, ${scrollHeight})`);
    await page.waitForFunction(`${scrollHeight} > ${previousHeight}`, {
        timeout: 6000
    });
    } catch (e) {
    break;
    }
}

const content = await page.content();
const $ = cheerio.load(content);
const rootElement = $(rootSelector);
$(rootElement)
.children()
.map((idx, element) => {
    const $data = cheerio.load(element);
    const id: string = $data("div a").attr("href").split("/")[2];
    webtoonIdList.push(id);
});
  await page.close();
  await browser.close();
  return webtoonIdList;
}

export default getKakaoFinishWebtoonId;