// cocoMaGa 获取章节

module.exports = {
    pla2GetSection: async (browser, plaObj, downloadUrl) => {
        console.log(`地址为：${ plaObj.baseUrl } ${ downloadUrl }`);

        const page = await browser.newPage();
        await page.goto(plaObj.baseUrl + downloadUrl);

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
}
