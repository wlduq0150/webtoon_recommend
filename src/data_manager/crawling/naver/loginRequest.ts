import { Page } from "puppeteer";
const naver_ID = "wlduq0150";
const naver_PW = "jiyup1578";

async function loginRequest(page: Page) {
    const result = require('child_process').spawn('python', [ 'login.py' ]);
    result.stdout.on('data', function(data) {
        console.log(data.toString());
    });
    // const homeURL = "https://comic.naver.com/webtoon";
    // const loginSelector = "#gnb_login_button";
    // const submitSelector = "button[type=submit]";

    // await page.goto(homeURL);
    // await page.waitForSelector(loginSelector);
    // await page.click(loginSelector);
    // await page.waitForSelector(submitSelector);
    // await page.screenshot({path: "example1.png"});

    // // await page.evaluate((id, pw) => {
    // //     (document.getElementById("id") as HTMLInputElement).value = id;
    // //     (document.getElementById("pw") as HTMLInputElement).value = pw;
    // // }, naver_ID, naver_PW)
    // await page.click("#id");
    // await page.keyboard.type(naver_ID, { delay: 1000 });
    // await page.click("#pw");
    // await page.keyboard.type(naver_PW, { delay: 1000 });
    // await page.click(submitSelector);
    // await page.waitForTimeout(1000);
    // await page.screenshot({path: "example2.png", fullPage: true});
    
    // console.log(page.url());
}

export default loginRequest;