const puppeteer = require('puppeteer-core');
const { config } = require('../../config');
const { sleep } = require('../../util')
const { pla1Search } = require('./pla/pla1');
const { pla2Search } = require('./pla/pla2');

// 获取漫画章节 输出到console

const main = async (works, plaObj) => {
  const browser = await (puppeteer.launch(config));
  const page = await browser.newPage();
  await page.goto(`${ plaObj.baseUrl }${ plaObj.searchUrl.replace('${works}', works) }`);
  // await sleep(5000);
  // 区分漫画平台爬取
  if (plaObj.palNum === 1) {
    // 漫画猫
    return pla1Search(browser, page, plaObj, works);
  } else if (plaObj.palNum === 2) {
    // cocomanga
    return pla2Search(browser, page, plaObj, works);
  }
}




module.exports = main;
