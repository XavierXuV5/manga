const puppeteer = require('puppeteer-core');
const { config } = require('../../config');

/**
 * 获取全部章节
 * @param downloadUrl
 * @returns {Promise<unknown>}
 */
const getSection = async (downloadUrl) => {
  const browser = await (puppeteer.launch(config));
  const page = await browser.newPage();
  await page.goto(downloadUrl);

  const as = await page.$$eval('.all_data_list a', as => {
    return as.map(attr => ({
      url: attr.getAttribute('href'),
      sectionName: attr.getAttribute('title'),
    }));
  });
  await browser.close();
  // 倒序
  as.reverse();
  return as;
}

module.exports = getSection;
