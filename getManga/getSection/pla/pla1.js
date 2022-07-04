// 漫画猫 获取章节
const { sleep } = require('../../../util')

const concatArr = (arr) => {
    const newArr = [];
    arr.map(items => {
        items.map(item => {
            newArr.push(item);
        })
    })
    return newArr
}

module.exports = {
    pla1GetSection: async (browser, plaObj, downloadUrl) => {
        console.log(`地址为：${ downloadUrl }`);

        const page = await browser.newPage();
        await page.goto(downloadUrl);

        const as = await page.$$eval('#comic-book-list .comic_version_title', as => {
            return as.map((item) => {
                const newAs = [];
                const comicVersionTitle = item.innerHTML;
                const element = item.parentElement.parentElement.parentElement.lastElementChild.querySelectorAll('li a');
                for (let i = 0; i < element.length; i += 1 ) {
                    newAs.push({
                        url: element[i].getAttribute('href'),
                        sectionName: `${ comicVersionTitle }----${ element[i].getAttribute('title') }`,
                    })
                }
                newAs.reverse();
                return newAs;
            })
        });

        await browser.close();

        return concatArr(as)
    }
}
