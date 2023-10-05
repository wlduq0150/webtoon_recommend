import { Page } from "puppeteer";
import { NAVER_ID, NAVER_PW } from "./constatns";

const naver_ID = NAVER_ID;
const naver_PW = NAVER_PW;

// https://oxylabs.io/blog/puppeteer-bypass-captcha

async function loginRequest(page: Page): Promise<boolean> {
    const homeURL = "https://comic.naver.com/index";
    const loginURL = "https://nid.naver.com/nidlogin.login";
    const loginSelector = "#gnb_login_button";
    const submitSelector = "button[type=submit]";

    await page.goto(homeURL);
    await page.waitForSelector(loginSelector);

    await page.click(loginSelector);
    await page.waitForSelector(submitSelector);

    //await page.screenshot({path: "test.png"});

    await page.click("#id");
    await page.keyboard.type(naver_ID, { delay: 1000 });
    await page.click("#pw");
    await page.keyboard.type(naver_PW, { delay: 1000 });

    //await page.screenshot({ path: "test1.png" });

    await page.click(submitSelector);
    await page.waitForTimeout(1000);

    //await page.screenshot({ path: "test2.png" });
    
    if (page.url() === homeURL) {
        return true;
    }
    return false;
}

export default loginRequest;