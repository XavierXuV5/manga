// 漫画猫 获取内容
const fs = require("fs");
const puppeteer = require("puppeteer-core");
const { config } = require("../../config");
const { createDir, moveFile, createFile, sleep } = require("../../util");


const openNewPage = async (browser,  mangaName, sectionName, mangaUrl) => {
    const page = await browser.newPage();
    // 监听浏览器response event
    await page.on('response',async (response) => {
        if (response.ok()) {
            if (response.url().indexOf('img') !== -1) {
                const name  = response.url().substring(response.url().lastIndexOf('.') - 3);
                await response.buffer().then(async buffer => {
                    await createFile(`${name}`, buffer);
                    await moveFile(`${name}`, `manga/${mangaName}/${sectionName}/${ name }`);
                })
            }
            // 关闭窗口
            await page.close();
        } else {
            console.log('出现异常情况...');
            console.log(response.url());
            fs.appendFileSync('errLog.txt', `出现异常的URL: ${response.url()}\n`,);
            // await openNewPage(browser,  mangaName, sectionName, mangaUrl);
        }
    })
    await page.goto(mangaUrl);
}

const getSingeContent = async (workUrl, plaObj, sectionObj, targetObj) => {
    const browser = await (puppeteer.launch(config));
    const page = await browser.newPage();

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
    // 判断是否爬取相同的漫画
    if (fs.existsSync(`manga/${mangaName}`)) {
        // 创建单话文件夹
        await createDir(sectionObj.sectionName);
        // 移动文件夹
        await moveFile(sectionObj.sectionName, `manga/${mangaName}/${sectionObj.sectionName}`)
    } else {
        // 创建漫画名称的文件夹
        await createDir(mangaName);
        // 移动文件夹
        await moveFile(mangaName, `manga/${mangaName}`);
        // 创建单话文件夹
        await createDir(sectionObj.sectionName);
        // 移动文件夹
        await moveFile(sectionObj.sectionName, `manga/${mangaName}/${sectionObj.sectionName}`)
    }
    // 循环打开页面获取内容
    for (let i = 0; i < mangaContent.length; i += 1) {
        await openNewPage(
            browser,
            mangaName,
            sectionObj.sectionName,
            `${plaObj.downloadUrl}${mangaContent[i]}`
        );
        await sleep(8000);
    }
    // 结束
    await browser.close();
    console.log(`${sectionObj.sectionName}--->爬取完毕`);
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
        // 判断是否全部下载
        if (sectionObj.sectionName === '**全部下载**') {

            for (let i = 1; i < res.length; i += 1) {
                // console.log(res[i]);
                await getSingeContent(workUrl, plaObj, res[i], targetObj);
            }

        } else {
            await getSingeContent(workUrl, plaObj, sectionObj, targetObj);
        }
    }
}
