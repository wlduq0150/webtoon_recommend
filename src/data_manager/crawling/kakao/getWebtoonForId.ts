import puppeteer from "puppeteer";
import * as cheerio from "cheerio";
import { WebtoonInfo } from "src/webtoons/types";
import sendLoginRequest from "./loginRequest";
import { genreKakaoTransform } from "src/data_manager/genres/transform/genreTransform";

async function getKakaoWebtoonForId(idList: string[]): Promise<WebtoonInfo[]> {
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
        const thumbSelector = "#__next > div > div.flex.w-full.grow.flex-col.px-122pxr > div.flex.h-full.flex-1 > div.mb-28pxr.flex.w-320pxr.flex-col > div.rounded-t-12pxr.bg-bg-a-20 > div > div.relative.overflow-hidden.h-326pxr.w-320pxr.pt-86pxr > div.relative.h-full.min-h-\\[inherit\\] > div.mx-auto.w-160pxr > div > div > img";
        const titleSelector = "#__next > div > div.flex.w-full.grow.flex-col.px-122pxr > div.flex.h-full.flex-1 > div.mb-28pxr.flex.w-320pxr.flex-col > div.rounded-t-12pxr.bg-bg-a-20 > div > div.relative.px-18pxr.text-center.bg-bg-a-20.mt-24pxr > a > div";
        const genreSelector = "#__next > div > div.flex.w-full.grow.flex-col.px-122pxr > div.flex.h-full.flex-1 > div.mb-28pxr.ml-4px.flex.w-632pxr.flex-col.overflow-hidden.rounded-12pxr > div.flex.flex-1.flex-col > div > div:nth-child(1) > div:nth-child(3) > div.flex.w-full.flex-col.items-center.overflow-hidden > div";
        const descriptionSelector = "#__next > div > div.flex.w-full.grow.flex-col.px-122pxr > div.flex.h-full.flex-1 > div.mb-28pxr.ml-4px.flex.w-632pxr.flex-col.overflow-hidden.rounded-12pxr > div.flex.flex-1.flex-col > div > div:nth-child(1) > div:nth-child(2) > div.flex.w-full.flex-col.items-center.overflow-hidden > div > div > span";

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

        try {
            //타이틀 정보 크롤링
            let rootElement = $(titleSelector);
            rootElement
            .map((idx, element) => {
                const $data = cheerio.load(element);
        
                const title: string = $data("span").first().text();

                const category: string = $data("div > div:nth-child(1) > div > span").last().text();
        
                const fanCountToString: string = $data("div > div:nth-child(2) > span").last().text().replaceAll(",", "");
                const fanCount: number = (
                    fanCountToString.includes("억") ? (
                        parseInt((parseFloat(fanCountToString.replace("억", "")) * 100000000).toString())
                    ) : (
                        fanCountToString.includes("만") ? (
                            parseInt((parseFloat(fanCountToString.replace("만", "")) * 10000).toString()) 
                        ) : null
                    )
                );
        
                const updateDay: string = $data("div > div").last().text().charAt(0);
                
                const author: string[] = $data("span:nth-child(2)").first().text().split(",");
        
                webtoonInfo.title = title;
                webtoonInfo.category = category;
                webtoonInfo.fanCount = fanCount;
                webtoonInfo.updateDay = updateDay;
                webtoonInfo.author = author;
            });
        
            //썸네일 크롤링
            rootElement = $(thumbSelector);
            const thumbnail: string = rootElement.attr("src");
            webtoonInfo.thumbnail = thumbnail;
        
            //장르 목록 크롤링
            const genres: string[] = [ webtoonInfo.category ];
            rootElement = $(genreSelector);
            rootElement
            .children()
            .map((idx, element) => {
                const t_obj: string = $(element).attr("data-t-obj");
                const genre = (t_obj ? JSON.parse(t_obj).click.copy : null);
                if (genre) genres.push(genre);
            });

            console.log("before: ", genres);

            const transformedGenres: string[] = genreKakaoTransform(genres);
            const genreCount = transformedGenres ? transformedGenres.length : 0;

            console.log("after: ", transformedGenres);

            webtoonInfo.genres = transformedGenres;
            webtoonInfo.genreCount = genreCount;
        
            //줄거리 크롤링
            rootElement = $(descriptionSelector);
            const description: string = rootElement.text();
            webtoonInfo.description = description;
            
            //에피소드 개수 크롤링
            const clickSelector = "#__next > div > div.flex.w-full.grow.flex-col.px-122pxr > div.flex.h-full.flex-1 > div.mb-28pxr.ml-4px.flex.w-632pxr.flex-col.overflow-hidden.rounded-12pxr > div.relative.flex.w-full.flex-col.my-0.bg-bg-a-20.px-15pxr.pt-28pxr.pb-12pxr > div > div > div:nth-child(1)";
            const episodeSelector = "#__next > div > div.flex.w-full.grow.flex-col.px-122pxr > div.flex.h-full.flex-1 > div.mb-28pxr.ml-4px.flex.w-632pxr.flex-col.overflow-hidden.rounded-12pxr > div.flex-1.flex.flex-col > div.rounded-b-12pxr.bg-bg-a-20 > div.flex.h-44pxr.w-full.flex-row.items-center.justify-between.bg-bg-a-20.px-18pxr > div.flex.h-full.flex-1.items-center.space-x-8pxr > span";
            const episodeWaitSelector = "#__next > div > div.flex.w-full.grow.flex-col.px-122pxr > div.flex.h-full.flex-1 > div.mb-28pxr.ml-4px.flex.w-632pxr.flex-col.overflow-hidden.rounded-12pxr > div.flex-1.flex.flex-col > div.rounded-b-12pxr.bg-bg-a-20 > div.flex.min-h-\\[250px\\].flex-col.justify-center > div.min-h-364pxr > ul";
            await page.click(clickSelector);
            await page.waitForSelector(episodeWaitSelector);

            content = await page.content();        
            $ = cheerio.load(content);

            const episodeLength: number = parseInt($(episodeSelector).text().split(" ")[1]);
            webtoonInfo.episodeLength = episodeLength;

            webtoonInfo.fanCount = Math.floor(webtoonInfo.fanCount / webtoonInfo.episodeLength);
            webtoonList.push(webtoonInfo);
        } catch (e) {
            console.log(`webtoonId [${id}] is not crawled...`);
            errorIdList.push(id);
            continue;
        }
        console.log(id);
    }
    await page.close();
    await browser.close();

    return webtoonList;
}

export default getKakaoWebtoonForId;

