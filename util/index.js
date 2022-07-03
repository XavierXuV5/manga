const fs = require('fs');
const inquirer = require("inquirer");
const { urls } = require('../config');

module.exports = {
  /**
   * 自动滚动页面
   * @param page
   * @returns {Promise<*>}
   */
  autoScroll: async (page) => {
    return page.evaluate(async () => {
      return await new Promise((resolve, reject) => {
        let totalHeight = 0;
        let distance = 100;
        let timer = setInterval(() => {
          let scrollHeight = document.body.scrollHeight;
          window.scrollBy(0, distance);
          totalHeight += distance;

          if(totalHeight >= scrollHeight){
            clearInterval(timer);
            resolve();
          }
          // 往下滚的速度
        }, 200);
      });
    })
  },
  /**
   * 创建文件夹
   * @param name
   * @returns {Promise<unknown>}
   */
  createDir: (name) => {
    return new Promise((resolve, reject) => {
      fs.mkdir(name, (err) => {
        if (err) {
          console.log('创建文件夹失败');
          reject('创建文件夹失败', err);
        }
        resolve();
      });
    })
  },
  /**
   * 创建文件
   * @param path
   * @param buffer
   * @returns {Promise<unknown>}
   */
  createFile: (path, buffer) => {
    return new Promise((resolve, reject) => {
      fs.writeFile(path, buffer, (err) => {
        if (err) {
          reject('创建文件失败', err)
        }
        resolve();
      });
    })
  },
  /**
   * 移动文件
   * @param oldPath
   * @param newPath
   * @returns {Promise<unknown>}
   */
  moveFile: (oldPath, newPath) => {
    return new Promise((resolve, reject) => {
      fs.rename(oldPath, newPath, (err) => {
        if (err) {
          console.log('移动文件失败');
          reject('移动文件失败', err);
        }
        resolve();
      })
    })
  },
  // 选择平台进行选择
  selectPla: async () => {
     let palName = await inquirer.prompt([
      {
        type: 'list',
        message: '请选择其中一个网站',
        name: 'manga',
        choices: [
          '漫画猫',
          'cocomanga'
        ],
        filter: (val) => {
          return val;
        }
      },
    ])
    return urls.filter((item) => (item.siteName === palName.manga ))[0];
  },
  sleep: (time) => {
    return new Promise((resolve) => setTimeout(resolve, time));
  }
}
