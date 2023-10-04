
import puppeteer from "puppeteer";
import * as cheerio from "cheerio";
import { WebtoonInfo } from "src/webtoons/types";
import sendLoginRequest from "./loginRequest";

async function saveKakaoWebtoonForId(idList: string[], callback: Function): Promise<WebtoonInfo[]> {
    const webtoonList: WebtoonInfo[] = [];
    const errorIdList: string[] = [];
    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();

    const result = await sendLoginRequest(page) ? "로그인 성공" : "로그인 실패";
    console.log(result);

    for (const id of idList) {
        const webtoonInfo = { webtoonId: id, service: "kakao" } as WebtoonInfo;
        const thumbSelector = "#__next > div > div.flex.w-full.grow.flex-col.px-122pxr > div.flex.h-full.flex-1 > div.mb-28pxr.flex.w-320pxr.flex-col > div:nth-child(1) > div.jsx-1469927737.jsx-1458499084.jsx-2778911690.w-320pxr > div > div:nth-child(3) > div.mx-auto > div > div > img";
        const titleSelector = "#__next > div > div.flex.w-full.grow.flex-col.px-122pxr > div.flex.h-full.flex-1 > div.mb-28pxr.flex.w-320pxr.flex-col > div:nth-child(1) > div.jsx-1469927737.jsx-1458499084.jsx-2778911690.w-320pxr > div > div:nth-child(3) > div.relative.text-center.mx-32pxr.py-24pxr";
        const genreSelector = "#__next > div > div.flex.w-full.grow.flex-col.px-122pxr > div.flex.h-full.flex-1 > div.mb-28pxr.ml-4px.flex.w-632pxr.flex-col > div.flex-1.bg-bg-a-20 > div:nth-child(1) > div.flex.flex-wrap.px-32pxr";
        const descriptionSelector = "#__next > div > div.flex.w-full.grow.flex-col.px-122pxr > div.flex.h-full.flex-1 > div.mb-28pxr.ml-4px.flex.w-632pxr.flex-col > div.flex-1.bg-bg-a-20 > div.text-el-60.break-keep.py-20pxr.pt-31pxr.pb-32pxr > span";

        try {
            await page.goto(`https://page.kakao.com/content/${id}?tab_type=about`);
            await page.waitForSelector(descriptionSelector);
        } catch (e) {
            console.log(`webtoonId [${id}] is not crawled...`);
            errorIdList.push(id);
            continue;
        }
        

        let content = await page.content();
    
        let $ = cheerio.load(content);
    
        //타이틀 정보 크롤링
        const genres: string[] = [];
        let rootElement = $(titleSelector);
        rootElement
        .map((idx, element) => {
            const $data = cheerio.load(element);
    
            const title: string = $data("span").first().text();
            const genre: string = $data("div > div:nth-child(1) > span").last().text();
            console.log("장르: ", genre);
            genres.push(genre);
    
            const fanCountToString: string = $data("div > div:nth-child(1) > span").first().text().replaceAll(",", "");
            const fanCount: number = (
                fanCountToString.includes("억") ? (
                    parseInt((parseFloat(fanCountToString.replace("억", "")) * 100000000).toString())
                ) : (
                    fanCountToString.includes("만") ? (
                        parseInt((parseFloat(fanCountToString.replace("만", "")) * 10000).toString()) 
                    ) : null
                )
            );
    
            const updateDay: string = $data("div > div:nth-child(2) > span").first().text().charAt(0);
            
            const author: string[] = $data("div > div:nth-child(2) > span").last().text().split(",");
    
            webtoonInfo.title = title;
            webtoonInfo.fanCount = fanCount;
            webtoonInfo.updateDay = updateDay;
            webtoonInfo.author = author;
        });
    
        //썸네일 크롤링
        rootElement = $(thumbSelector);
        const thumbnail: string = rootElement.attr("src");
        webtoonInfo.thumbnail = thumbnail;
    
        //장르 목록 크롤링
        rootElement = $(genreSelector);
        rootElement
        .children()
        .map((idx, element) => {
            const t_obj: string = $(element).find("button").attr("data-t-obj");
            const genre = (t_obj ? JSON.parse(t_obj).click.copy : null);
            genres.push(genre);
        });
        webtoonInfo.genres = genres;
    
        //줄거리 크롤링
        rootElement = $(descriptionSelector);
        const description: string = rootElement.text();
        webtoonInfo.description = description;
        
        //에피소드 개수 크롤링
        const clickSelector = "#__next > div > div.flex.w-full.grow.flex-col.px-122pxr > div.flex.h-full.flex-1 > div.mb-28pxr.ml-4px.flex.w-632pxr.flex-col > div.relative.flex.w-full.flex-col.my-0.bg-bg-a-20.px-15pxr.pt-28pxr.pb-12pxr > div > div > div:nth-child(1) > a > div";
        const episodeSelector = "#__next > div > div.flex.w-full.grow.flex-col.px-122pxr > div.flex.h-full.flex-1 > div.mb-28pxr.ml-4px.flex.w-632pxr.flex-col > div:nth-child(2) > div:nth-child(1) > div.flex.h-44pxr.w-full.flex-row.items-center.justify-between.px-15pxr.bg-bg-a-20 > div.flex.h-full.flex-1.items-center.space-x-8pxr > span";
        const episodeWaitSelector = "#__next > div > div.flex.w-full.grow.flex-col.px-122pxr > div.flex.h-full.flex-1 > div.mb-28pxr.ml-4px.flex.w-632pxr.flex-col > div:nth-child(2) > div:nth-child(1) > div.min-h-360pxr > ul";
        try {
            await page.click(clickSelector);
            await page.waitForSelector(episodeWaitSelector);
        } catch (e) {
            console.log(`webtoonId [${id}] is not crawled...`);
            continue;
        }

        content = await page.content();        
        $ = cheerio.load(content);

        const episodeLength: number = parseInt($(episodeSelector).text().split(" ")[1]);
        webtoonInfo.episodeLength = episodeLength;

        webtoonInfo.fanCount = Math.floor(webtoonInfo.fanCount / webtoonInfo.episodeLength);
        console.log(id);
        callback(webtoonInfo);
        webtoonList.push(webtoonInfo);
    }
    await page.close();
    await browser.close();

    return webtoonList;
}

export default saveKakaoWebtoonForId;

