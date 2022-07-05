const puppeteer = require("puppeteer-core");
const {config} = require("./config");
const fs = require("fs");
const {sleep} = require("./util");

const start = async () => {
    const browser = await (puppeteer.launch(config));

    const page = await browser.newPage();
    await page.goto('https://www.maofly.com/manga/10127/70600.html');


    await page.on('response',async (response) => {
        if (response.ok()) {
            if (response.url().indexOf('img') !== -1) {
                console.log(response.url());
            }
        }
    })

   await page.on('dialog', async dialog => {
        console.log(dialog.type());
    });

    await sleep(5000);
    await page.click('#all > .next',{
        clickCount: 5000,
    });


}

start();
