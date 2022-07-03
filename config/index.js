/**
 * 判断OS
 * @returns {string}
 */
const getChromePath = () => {
  if (process.platform === 'win32') {
    return 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
  } else {
    return '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
  }
}

module.exports = {
  config: {
    //设置超时时间
    timeout: 15000,
    //如果是访问https页面 此属性会忽略https错误
    ignoreHTTPSErrors: true,
    // 打开开发者工具, 当此值为true时, headless总为false
    devtools: false,
    // 关闭headless模式, 不会打开浏览器
    headless: false,
    // 启动本地的chrome
    executablePath: getChromePath(),
    defaultViewport: {
      width: 1400,
      height: 1000
    }
  },
  baseUrl: 'https://www.cocomanhua.com',
  searchUrl: '/search?searchString=${works}',
}
