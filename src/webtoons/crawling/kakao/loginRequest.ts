import { Page } from "puppeteer";
const kakao_ID = "wlduq0150@naver.com";
const kakao_PW = "wlduq0160";

async function sendLoginRequest(page: Page): Promise<boolean> {
    const homeURL = "https://page.kakao.com/";
    
    const loginSelector = "#__next > div > div.sticky.inset-x-0.top-0.left-0.z-100.flex.w-full.flex-col.items-center.justify-center.bg-bg-a-10 > div > div.flex.h-pc_header_height_px.w-1200pxr.items-center.px-30pxr > div.mr-16pxr.flex.shrink-0.items-center.justify-end.space-x-24pxr > button.pr-16pxr";
    const submitSelector = "button[type=submit]";
    // 로그인 페이지 이동
    await page.goto(homeURL);
    await page.waitForSelector(loginSelector);
    await page.click(loginSelector);
    await page.waitForSelector(submitSelector);

    // 권한 요청 창 방지
    page.on('dialog', async (dialog) => {
        console.log(dialog.message());
        await dialog.accept();
    });

    // 로그인 아이디 비번 입력
    await page.type("#loginId--1", kakao_ID);
    await page.type("#password--2", kakao_PW);

    // 로그인 버튼 클릭
    await page.click(submitSelector);

    // 페이지 이동이 두번이기 때문에 waitFor
    await page.waitForNavigation();
    await page.waitForNavigation();

    // 로그인 성공 여부 체크
    if (page.url() === homeURL) {
        return true;
    }
    return false;
}

export default sendLoginRequest;