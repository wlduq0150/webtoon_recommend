// import puppeteer, { Page } from "puppeteer";
// import * as cheerio from "cheerio";
// import getKakaoWeeklyWebtoonId from "../../kakao/getWeeklyWebtoonId";
// import getKakaoFinishWebtoonId from "../../kakao/getFinishWebtoonId";

// async function getGenres(page: Page, id: string) {
//     const genreSelector = "#__next > div > div.flex.w-full.grow.flex-col.px-122pxr > div.flex.h-full.flex-1 > div.mb-28pxr.ml-4px.flex.w-632pxr.flex-col > div.flex-1.bg-bg-a-20 > div:nth-child(1) > div.flex.flex-wrap.px-32pxr";
//     try {
//         await page.goto(`https://page.kakao.com/content/${id}?tab_type=about`);
//         await page.waitForSelector(genreSelector, { timeout: 2000 });
//     } catch (e) {
//         console.log(`webtoonId [${id}] is not crawled...`);
//     }

//     const content = await page.content();
//     const $ = cheerio.load(content);
//     const genres: string[] = [];
//     const rootElement = $(genreSelector);
//     rootElement
//     .children()
//     .map((idx, element) => {
//         const t_obj: string = $(element).find("button").attr("data-t-obj");
//         const genre = (t_obj ? JSON.parse(t_obj).click.copy : null);
//         genres.push(genre);
//     });
//     return genres;
// }

// async function getKakaoGenres(): Promise<Set<string>> {
//     const weeklyIdList: string[] = await getKakaoWeeklyWebtoonId();
//     console.log("weekly: ", weeklyIdList);
//     const finishIdList: string[] = await getKakaoFinishWebtoonId();
//     console.log("finish: ", finishIdList);
//     const idList: string[] = weeklyIdList.concat(finishIdList);
//     console.log("all: ", idList);

//     const browser = await puppeteer.launch({
//         args: ['--no-sandbox', '--disable-setuid-sandbox']
//     });
//     const page = await browser.newPage();

//     const kakaoGenres: Set<string> = new Set<string>;
//     for (let id of idList) {
//         const genres: string[] = await getGenres(page, id);
//         genres.map((genre) => {
//             kakaoGenres.add(genre);
//         });
//         console.log(`id: ${id}\ngenres: ${kakaoGenres.size}\n`);
//     }
    
//     await page.close();
//     await browser.close();
//     return kakaoGenres;
// }

// export default getKakaoGenres;

