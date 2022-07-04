// 漫画猫 获取内容
const puppeteer = require("puppeteer-core");
const { config, baseUrl} = require("../../config");
const fs = require("fs");
const { createDir, moveFile, createFile, autoScroll} = require("../../util");


const openNewPage = async (browser, sectionName, mangaName, mangaUrl) => {
    const page = await browser.newPage();
    // 监听浏览器response event
    await page.on('response', (response) => {
        // 由于懒加载机制，会有相同的url被监听到
        response.buffer().then(async buffer => {
            await createFile(`${name}`, buffer);
            await moveFile(`${name}`, `manga/${mangaName}/${section.sectionName}/${name}`);
        })
    })
    await page.goto(mangaUrl);
    // 关闭窗口
    await page.close();
}

module.exports = {
    /**
     * 获取漫画内容
     * @param workUrl 作品地址
     * @param plaObj 平台基础信息
     * @param sectionObj 单话信息
     * @param targetObj
     * @returns {Promise<void>}
     */
    pla1GetManGa: async (workUrl, plaObj, sectionObj, targetObj) => {
        const browser = await (puppeteer.launch(config));
        const page = await browser.newPage();

        // 判断是否全部下载
        if (sectionObj.sectionName === '**全部下载**') {

        } else {
            await page.goto(sectionObj.url);
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
            // 漫画名称
            const mangaName = targetObj.sectionName
            // 创建文件夹
            if (!await fs.existsSync('manga')) {
                await createDir('manga');
            }
            await createDir(mangaName);
            await moveFile(mangaName, `manga/${mangaName}`);
            // 循环打开页面获取内容
            for (let i = 0; i < mangaContent.length; i += 1) {
                await openNewPage(
                    browser,
                    sectionObj.sectionName,
                    mangaName,
                    `${plaObj.downloadUrl}${mangaContent[i]}`
                );
            }
        }
    }
}
