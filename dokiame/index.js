const fs = require('fs-extra');
const puppeteer = require('puppeteer-core');
const _ = require('lodash');
const { config } = require('../config');

const mainUrl = 'https://www.sigure.tw/';
const baseUrl = 'https://www.sigure.tw/learn-japanese/vocabulary/n5/';
// const tessUrl = 'https://www.sigure.tw/learn-japanese/mix/knowledge/';


const getData = async () => {
    const browser = await (puppeteer.launch(config));
    const page = await browser.newPage();
    await page.goto(baseUrl);
    // 注入 lodash
    await page.addScriptTag({ url: "https://cdn.bootcdn.net/ajax/libs/lodash.js/4.17.21/lodash.min.js" });

    // 获取总页面数量
    let pageTotal =  await page.$$eval('#myTable_paginate > span > a', value => {
        return value.length
    });

    let currentPageTitle = [];

    await sleep(3000);

    for (let i = 1; i <= pageTotal; i ++) {
        await page.click(`#myTable_paginate > span > a:nth-child(${i})`);
        currentPageTitle.push(await getPageTitle(page));
        await sleep(1000);
    }

    for (let i = 0; i < currentPageTitle.length; i ++) {
        for (let j = 0; j < currentPageTitle[i].length; j ++) {
            await openNewPage(browser, currentPageTitle[i][j]);
        }
    }

    // currentPageTitle.map(async (items) => {
    //     await items.map(async item => {
    //     })
    // })

    // 结束
    // await browser.close();
    console.log('爬取完毕');
}


const openNewPage = async (browser, section) => {
    const page = await browser.newPage();

    console.log(`开始爬取${section.sectionName}`);
    // 监听浏览器response event
    await page.on('response', async (response) => {
        if (response.url().indexOf(`.wav`) !== -1) {
            let strReplace = 'https://data.sigure.tw/audio/';
            let fileName = _.replace(response.url(), strReplace, '');
            try {
                await fs.outputFile(`${__dirname}/${section.sectionName}/${fileName}`, await response.buffer());
            } catch (err) {
                console.log('保存文件出错:' + err);
            }
        }
    })
    // console.log(`${mainUrl}${section.url}`);
    await page.goto(`${mainUrl}${section.url}`, {
        waitUntil: 'networkidle0',
        timeout: 0
    });
    // 关闭窗口
    await page.close();
}


const sleep = (time) => {
    return new Promise((resolve) => setTimeout(resolve, time));
}

const getPageTitle = async ( page ) => {
    // 获取当前页的条数
    return await page.$$eval('#myTable > tbody > tr > td > a', value => {
        return value.map(attr => ({
            url: attr.getAttribute('href'),
            sectionName: _.trim(attr.innerHTML),
        }));
    });
}


getData();
