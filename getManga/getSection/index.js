const puppeteer = require('puppeteer-core');
const { config } = require('../../config');
const { pla1GetSection } = require("./pla/pla1");
const { pla2GetSection } = require("./pla/pla2");

/**
 * 获取全部章节
 * @param downloadUrl
 * @param plaObj
 * @returns {Promise<unknown>}
 */
const getSection = async (downloadUrl, plaObj) => {
  const browser = await (puppeteer.launch(config));

  // 区分漫画平台爬取
  if (plaObj.palNum === 1) {
    // 漫画猫
    return pla1GetSection(browser, plaObj, downloadUrl);
  } else if (plaObj.palNum === 2) {
    // cocomanga
    return pla2GetSection(browser, plaObj, downloadUrl);
  }
}

module.exports = getSection;
