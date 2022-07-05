const puppeteer = require("puppeteer-core");
const {config} = require("./config");
const fs = require("fs");
const {sleep, createFile, createDir, moveFile,} = require("./util");

const start = async (url) => {
    let time = null;
    const browser = await (puppeteer.launch(config));
    const page = await browser.newPage();


    // 监听request事件，筛选一开始加载的图片
    await page.on('requestfinished', async (request) => {
        if (request.url().indexOf('img') !== -1) {
            const name  = request.url().substring(request.url().lastIndexOf('.') - 3);
            // 判断是否有重复复的请求被监听到
            if (!fs.existsSync(`test/${ name }`)) {
                await createFile(`${name}`, await request.response().buffer());
                await moveFile(`${name}`, `test/${ name }`);
            }
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

}

start('https://www.maofly.com/manga/10127/70600.html');


// console.log(fs.existsSync('manga'));




