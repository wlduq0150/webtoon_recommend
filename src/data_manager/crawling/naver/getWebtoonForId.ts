import puppeteer from "puppeteer";
import * as cheerio from "cheerio";
import { WebtoonInfo } from "src/webtoons/types";
import { genreNaverTransform } from "src/data_manager/genres/transform/genreTransform";
import { categoryNaverTransform, TransformedData } from "src/data_manager/genres/transform/categoryTransform";
import loginRequest from "./loginRequest";

async function getNaverWebtoonForId(idList: string[]): Promise<WebtoonInfo[]> {
    const webtoonInfoList: WebtoonInfo[] = [];
    const errorIdList: string[] = [];

    const browser = await puppeteer.launch({
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();

    const loginResult: boolean = await loginRequest(page);
    console.log(loginResult ? "로그인 성공" : "로그인 실패");

    for (let id of idList) {
        const webtoonInfo = { webtoonId: id, service: "naver" } as WebtoonInfo;
        const thumbSelector = "#content > div.EpisodeListInfo__comic_info--yRAu0 > button";
        const titleSelector = "#content > div.EpisodeListInfo__comic_info--yRAu0 > div";
        const episodeSelector = "#content > div.EpisodeListView__episode_list_wrap--q0VYg > div.EpisodeListView__episode_list_head--PapRv > div.EpisodeListView__count--fTMc5";
        const fanSelector = "#content > div.EpisodeListView__user_wrap--S_pYn > div > button.EpisodeListUser__item--Fjp4R.EpisodeListUser__favorite--DzoPt > span.EpisodeListUser__count--fNEWK";

        try {
            await Promise.all([
                page.goto(`https://comic.naver.com/webtoon/list?titleId=${id}`),
                page.waitForSelector(episodeSelector, { timeout: 3000 }),
            ]);
        } catch (e) {
            console.log(`webtoonId [${id}] is not crawled...`);
            errorIdList.push(id);
            continue;
        }
        

        const content = await page.content();
        const $ = cheerio.load(content);

        // 썸네일
        let rootElement = $(thumbSelector);
        const thumbnail: string = rootElement.find("div > img").attr("src");
        webtoonInfo.thumbnail = thumbnail;

        // 에피소드 개수
        rootElement = $(episodeSelector);
        const reg = new RegExp(/[0-9]+/, "g")
        const episodeLength: number = parseInt(rootElement.text().match(reg)[0]);
        webtoonInfo.episodeLength = episodeLength;

        // 팬 카운트
        rootElement = $(fanSelector);
        const fanCount: number = parseInt(rootElement.text().replaceAll(",", ""));
        webtoonInfo.fanCount = fanCount;

        rootElement = $(titleSelector);
        
        // 제목
        const title: string = rootElement.find("h2").text();
        webtoonInfo.title = title;

        // 작가
        const author: string[] = [];
        rootElement
        .find("div.ContentMetaInfo__meta_info--GbTg4 > span.ContentMetaInfo__category--WwrCp")
        .map((idx, element) => {
            const $data = cheerio.load(element);
            const author_ = $data("a").text()
            author.push(author_);
        });
        webtoonInfo.author = author;

        // 업데이트 날짜
        const updateDayText: string = rootElement
        .find("div.ContentMetaInfo__meta_info--GbTg4 > em")
        .text();
        let updateDay: string = updateDayText.includes("완결") ? "완" : updateDayText.charAt(0);
        if (Number.isInteger(updateDay)) {
            updateDay = "휴";
        }
        webtoonInfo.updateDay = updateDay;

        // 줄거리
        const description: string = rootElement
        .find("div.EpisodeListInfo__summary_wrap--ZWNW5 > p")
        .text();
        webtoonInfo.description = description;

        // 장르, 장르 개수, 카테고리 
        let genres: string[] = [];
        rootElement
        .find("div.EpisodeListInfo__summary_wrap--ZWNW5 > div > div")
        .children()
        .map((idx, element) => {
            const $data = cheerio.load(element);
            const genre: string = $data("a").text().replace("#", "");
            genres.push(genre);
        });
        const category = genres.length ? genres[0] : null;

        const transforemdData: TransformedData = categoryNaverTransform(
            category,
            genres
        );

        console.log("before: ", transforemdData.transformedGenres);

        const transformedCategory = transforemdData.transformedCategory;
        const transformedGenres = genreNaverTransform(transforemdData.transformedGenres);

        console.log("after: ", transformedGenres);

        const genreCount: number = transformedGenres.length;
        webtoonInfo.genres = transformedGenres;
        webtoonInfo.category = transformedCategory;
        webtoonInfo.genreCount = genreCount;

        console.log(id);
        webtoonInfoList.push(webtoonInfo);
    }

    await page.close()
    await browser.close();
    return webtoonInfoList;
}

export default getNaverWebtoonForId;