// cocomanga 爬取代码

// 获取当前页的漫画
const getCurrentMangaList = async (page) => {
    return await page.$$eval('.theiaStickySidebar .fed-deta-info h1 a', works => {
        return works.map(attr => ({
            url: attr.getAttribute('href'),
            sectionName: attr.innerHTML,
        }));
    })
}

module.exports = {
    pla2Search: async (browser, page, plaObj, works) => {
        const mangas = [];
        // 如果有多个页数，需要调转下一页
        const count = await page.$eval('#fed-count', count => {
            return parseInt(count.innerHTML);
        })

        if (count > 10) {
            // 表示有分页
            for (let i = 1; i < Math.ceil(count / 10) + 1; i += 1) {
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
            //
            await browser.close();
            return {
                data: [],
            }
        } else {
            // 获取到当前页数的全部作品名称和URL
            await mangas.push(await getCurrentMangaList(page));
            await browser.close();
            return {
                data: mangas
            }
        }
    }
}
