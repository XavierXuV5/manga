// 漫画猫 爬取代码
const { sleep } = require('../../../util')

// 获取当前页的漫画
const getCurrentMangaList = async (page) => {
    return await page.$$eval('.comicbook-index > a', works => {
        return works.map(attr => ({
            url: attr.getAttribute('href'),
            sectionName: attr.title,
        }));
    })
}

module.exports = {
    pla1Search: async (browser, page, plaObj, works) => {
        const mangas = [];
        // 如果有多个页数，需要调转下一页
        // count为0 就代表没有分数，如果不为0就代表有分页，需要获取总页数
        const count = await page.$$eval('.pagination > a', count => {
            return count.length === 0 ? 0 : parseInt(count[count.length - 1].innerHTML);
        })

        if (count > 1) {
            // 表示有分页
            for (let i = 1; i < count; i += 1) {
                // 先把第一页爬取
                if (i === 1) {
                    await mangas.push(await getCurrentMangaList(page));
                } else {
                    const newPage = await browser.newPage();
                    await newPage.goto(`${plaObj.baseUrl}${plaObj.searchUrl.replace('${works}', works)}&page=${i}`)
                    await mangas.push(await getCurrentMangaList(newPage));
                    await newPage.close();
                }
            }
            await browser.close();
            return {
                data: mangas,
            }
        } else if (count === 0) {
            // 获取到当前页数的全部作品名称和URL
            await mangas.push(await getCurrentMangaList(page));
            await browser.close();
            return {
                data: mangas
            }

        } else {
            //
            await browser.close();
            return {
                data: [],
            }
        }
    }
}
