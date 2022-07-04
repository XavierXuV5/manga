const fs = require('fs');
const puppeteer = require('puppeteer-core');
const { autoScroll, createFile, createDir, moveFile } = require('../util');
const { config, baseUrl } = require('../config');
const { pla1GetManGa } = require('./getManga/pla1');
const { pla2GetManGa, getSingleSection} = require('./getManga/pla2');

/**
 * 初始化浏览器
 * @param workUrl 作品URL
 * @param plaObj
 * @param sectionObj
 * @param targetObj
 * @returns {Promise<void>}
 */
const getManga = async (workUrl, plaObj, sectionObj, targetObj) => {
  // 区分漫画平台爬取
  if (plaObj.palNum === 1) {
    // 漫画猫
    await pla1GetManGa(workUrl, plaObj, sectionObj, targetObj);

  } else if (plaObj.palNum === 2) {
    // cocomanga
    if (sectionObj.sectionName === '**全部下载**') {
      await pla2GetManGa(workUrl);
    } else {
      // 单一下载章节
      await getSingleSection(sectionObj.sectionName, sectionObj.url, workUrl.replace(baseUrl, ''));
    }
  }
}







module.exports = {
  getManga,
}
