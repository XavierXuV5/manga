const puppeteer = require("puppeteer-core");
const {config} = require("./config");
const fs = require("fs");
const {sleep} = require("./util");

const start = async (url) => {
    let time = null;
    const browser = await (puppeteer.launch(config));
    const page = await browser.newPage();

    // 监听request事件，筛选一开始加载的图片
    await page.on('requestfinished', (request) => {
        if (request.url().indexOf('img') !== -1) {
            console.log(request.url());
        }
    })

    // 监听dailog事件，到最后一页就跳转到下页
    await page.on('dialog', async dialog => {
        clearInterval(time);
        await start('https://www.maofly.com/manga/10127/450390_4.html');
    });

    await page.goto(url);
    await page.content();

    time = setInterval(async () => {
        await page.click('#all > .next',);
    }, 5000)

    /*

     // 注入代码
     await page.addScriptTag({
         content: `
                 let mangaDataArr = img_data_arr;
                 `,
     })
     // 获取里面的页数内容
     const mangaContent = await page.$$eval('div', divs => {
         return mangaDataArr;
     })

     await sleep(3000);

 */
}

start('https://www.maofly.com/manga/10127/70600.html');
