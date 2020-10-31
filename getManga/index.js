const fs = require('fs');
const puppeteer = require('puppeteer-core');
const { autoScroll, createFile, createDir, moveFile } = require('../util');
const { config, baseUrl } = require('../config');

/**
 * 初始化浏览器
 * @param workUrl 作品URL
 * @returns {Promise<void>}
 */
const getManga = async (workUrl) => {
  const browser = await (puppeteer.launch(config));
  const page = await browser.newPage();
  await page.goto(baseUrl + workUrl);
  const mangaName = await page.$eval('.fed-part-layout h1', value => {
    return value.innerHTML;
  });
  if (!await fs.existsSync('manga')) {
    await createDir('manga');
  }
  await createDir(mangaName);
  await moveFile(mangaName, `manga/${mangaName}`);
  // 创建文件夹
  // 全部章节的URL
  const as = await page.$$eval('.all_data_list a', as => {
    return as.map(attr => ({
      url: attr.getAttribute('href'),
      sectionName: attr.getAttribute('title'),
    }));
  });

  console.log(`一共${as.length}个章节`);
  // 倒序
  as.reverse();
  // 使用 for await
   for (let i = 0; i < as.length; i += 1) {
     await openNewPage(browser, as[i], mangaName, workUrl);
   }
   // 结束
  await browser.close();
  console.log('爬取完毕');
}


/**
 * 获取单一章节的漫画
 * @param sectionName 章节名称
 * @param sectionUrl 章节URL
 * @param mangaUrl 漫画URL(编号)
 * @returns {Promise<void>}
 */
const getSingleSection = async (sectionName, sectionUrl, mangaUrl) => {
  const browser = await (puppeteer.launch(config));
  const page = await browser.newPage();
  if (!await fs.existsSync('manga')) {
    await createDir('manga');
  }
  // 创建文件夹
  await createDir(sectionName);
  // 移动文件夹
  await moveFile(`${sectionName}`, `manga/${sectionName}`)
  // 监听浏览器response event
  await page.on('response', (response) => {
    if (response.url().indexOf(`https://img.cocomanhua.com/comic${mangaUrl}`) !== -1) {
      // 由于懒加载机制，会有相同的url被监听到
      let sectionUrl = response.url().substring(response.url().length - 20);
      let index = sectionUrl.indexOf('/');
      let name = sectionUrl.substring(index + 1);
      response.buffer().then(async buffer => {
        await createFile(`${name}`, buffer);
        await moveFile(`${name}`, `manga/${sectionName}/${name}`);
      })
    }
  })
  await page.goto(baseUrl + sectionUrl);
  // 需要滚动到最底，才能获取到全部
  await autoScroll(page);
  // 关闭窗口
  await page.close();
  // 关闭浏览器
  await browser.close();

  console.log('下载完成...');
}


//
/**
 * 打开新页面
 * @param browser 浏览器对象
 * @param section 章节名称
 * @param mangaName 漫画名称
 * @param mangaUrl 作品URL(编号)
 * @returns {Promise<void>}
 */
const openNewPage = async (browser, section, mangaName, mangaUrl) => {
  const page = await browser.newPage();
  console.log(`开始爬取${section.sectionName}`);
  // 创建文件夹
  await createDir(section.sectionName);
  // 移动文件
  await moveFile(`${section.sectionName}`, `manga/${mangaName}/${section.sectionName}`)
  // 监听浏览器response event
  await page.on('response', (response) => {
    if (response.url().indexOf(`https://img.cocomanhua.com/comic${mangaUrl}`) !== -1) {
      // 由于懒加载机制，会有相同的url被监听到
      let sectionUrl = response.url().substring(response.url().length - 20);
      let index = sectionUrl.indexOf('/');
      let name = sectionUrl.substring(index + 1);
      response.buffer().then(async buffer => {
        await createFile(`${name}`, buffer);
        await moveFile(`${name}`, `manga/${mangaName}/${section.sectionName}/${name}`);
      })
    }
  })
  await page.goto(`${baseUrl}${section.url}`);
  // 需要滚动到最底，才能获取到全部
  await autoScroll(page);
  // 关闭窗口
  await page.close();
}

module.exports = {
  getManga,
  getSingleSection,
}
