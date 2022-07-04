// 漫画猫 获取内容
const fs = require("fs");
const puppeteer = require("puppeteer-core");
const { config } = require("../../config");
const { createDir, moveFile, createFile, sleep } = require("../../util");


const openNewPage = async (browser,  mangaName, sectionName, mangaUrl) => {
    const page = await browser.newPage();
    // 监听浏览器response event
    await page.on('response', (response) => {
        const name  = response.url().substring(response.url().lastIndexOf('.') - 3);
        response.buffer().then(async buffer => {
            await createFile(`${name}`, buffer);
            await moveFile(`${name}`, `manga/${mangaName}/${sectionName}/${ name }`);
        })
    })
    await page.goto(mangaUrl);
    // 关闭窗口
    await page.close();
}

const getSingeContent = async (workUrl, plaObj, sectionObj, targetObj, page) => {
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
    const mangaName = targetObj[0].sectionName
    // 创建存放漫画的文件夹
    if (!await fs.existsSync('manga')) {
        await createDir('manga');
    }
    // 创建漫画名称的文件夹
    await createDir(mangaName);
    // 移动文件夹
    await moveFile(mangaName, `manga/${mangaName}`);
    // 创建单话文件夹
    await createDir(sectionObj.sectionName);
    // 移动文件夹
    await moveFile(sectionObj.sectionName, `manga/${mangaName}/${sectionObj.sectionName}`)
    // 循环打开页面获取内容
    for (let i = 0; i < mangaContent.length; i += 1) {
        await openNewPage(
            browser,
            mangaName,
            sectionObj.sectionName,
            `${plaObj.downloadUrl}${mangaContent[i]}`
        );
        await sleep(1500);
    }
    // 结束
    await browser.close();
    console.log('爬取完毕');
}

module.exports = {
    /**
     * 获取漫画内容
     * @param workUrl 作品地址
     * @param plaObj 平台基础信息
     * @param sectionObj 单话信息
     * @param targetObj
     * @param res
     * @returns {Promise<void>}
     */
    pla1GetManGa: async (workUrl, plaObj, sectionObj, targetObj, res) => {
        const browser = await (puppeteer.launch(config));
        const page = await browser.newPage();

        // 判断是否全部下载
        if (sectionObj.sectionName === '**全部下载**') {

            for (let i = 1; i < res.length; i += 1) {
                console.log(res[i]);
            }

        } else {
            await getSingeContent(workUrl, plaObj, sectionObj, targetObj, page);
        }
    }
}
