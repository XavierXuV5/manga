const puppeteer = require("puppeteer-core");
const dayjs = require('dayjs');
const {config} = require("./config");
const fs = require("fs");
const fsEX = require('fs-extra');
const {sleep, createFile, createDir, moveFile,} = require("./util");

const start = async (url) => {
    let time = null;
    const browser = await (puppeteer.launch(config));
    const page = await browser.newPage();


    // 监听request事件，筛选一开始加载的图片
    await page.on('requestfinished', async (request) => {
        if (request.url().indexOf('img') !== -1) {
            const name  = request.url().substring(request.url().lastIndexOf('.') - 3);
            // 判断是否有重复复的请求被监听到
            if (!fs.existsSync(`test/${ name }`)) {
                await createFile(`${name}`, await request.response().buffer());
                await moveFile(`${name}`, `test/${ name }`);
            }
        }
    })

    // 监听dailog事件，到最后一页就跳转到下页
    await page.on('dialog', async dialog => {
        clearInterval(time);
        await start('https://www.maofly.com/manga/10127/450390_4.html');
    });

    await page.goto(url);
    await page.content();

    time = setInterval(async () => {
        await page.click('#all > .next',);
    }, 5000)

}

// start('https://www.maofly.com/manga/10127/70600.html');


// console.log(fs.existsSync('manga'));


const sortFilePath = async () => {
    const files = fs.readdirSync('test');
// console.log(files);
    const newFilesPath = [];

    files.map( filePath => {
        fs.stat(`test/${filePath}`, (err, stats) => {
            if (err) throw err;
            let cTime = dayjs(stats.ctime).format('YYYY-MM-DD HH:mm:ss:SSS');
            newFilesPath.push({
                cTime,
                filePath
            })
        })
    })
    await sleep(2000);
    return newFilesPath;
}



sortFilePath().then( async (res) => {
    // console.log(res);
    const newSortFile = res.sort((a, b) => {
        return new Date(a.cTime) > new Date(b.cTime) ? 1 : -1
    })
    // await createDir('test/01');
    for (let i = 0; i < newSortFile.length; i++) {
        let len = newSortFile.length;
        let fileExtension = newSortFile[i].filePath.substring(newSortFile[i].filePath.lastIndexOf('.') + 1);
        console.log(fileExtension);
        // await fsEX.copy(`test/${newSortFile[i].filePath}`, `test/01/${i}.${fileExtension}`)
    }
    // console.log(newSortFile);
})













