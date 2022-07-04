#! /usr/bin/env node

const { Command } = require('commander');
const inquirer = require('inquirer');
const { getManga } = require('./getManga');
const searchManga = require('./getManga/searchManga');
const getSection = require('./getManga/getSection');
const { baseUrl } = require('./config');
const { selectPla } = require('./util');
const program = new Command();




program
  .option('-s, --search [漫画名称]', '搜索漫画')
  .option('-d, --download [下载地址]', '下载漫画')
  .version('0.1.0', '-v, --version')


program.on('--help', () => {
  console.log('  \nExamples:')
  console.log('')
  console.log('$ manga -s 总之就是这么可爱')
  console.log('$ manga -d https://www.cocomanhua.com/15006/')
  console.log('')
})
program.parse(process.argv);

if (program.search) {
  selectPla().then((plaObj) => {
    searchManga(program.search, plaObj).then((res) => {
      let mangaList = [];
      if (res.data.length !== 0) {
        res.data.forEach(item => {
          mangaList.push(...item);
        })
        console.log(`搜索结束，一共有${mangaList.length}本相关作品`);

        const promptList = [
          {
            type: 'rawlist',
            message: '请选择其中一本漫画',
            name: 'manga',
            pageSize: 15,
            choices: mangaList.map((item) => (item.sectionName)),
            filter: (val) => {
              return val;
            }
          },
        ];
        inquirer.prompt(promptList).then(answers => {
          let targetObj = mangaList.filter((item) => item.sectionName === answers.manga);
          // 爬取漫画
          getSection(targetObj[0].url, plaObj).then((res) => {
            console.log(`一共有${res.length}个章节`);
            res.unshift({
              url: targetObj[0].url,
              sectionName: '**全部下载**',
            });
            const promptList = [
              {
                type: 'rawlist',
                message: '请选择需要下载的章节',
                name: 'manga',
                pageSize: 15,
                choices: res.map((item, index) => (`${index} - ${item.sectionName}`)),
                filter: (val) => {
                  return val;
                }
              },
            ];
            inquirer.prompt(promptList).then(answers => {
              let sectionObj = res.filter((item, index) => `${index} - ${ item.sectionName}` === answers.manga)
              getManga(targetObj[0].url, plaObj, sectionObj[0], targetObj, res);
            })
          })
        });
      } else {
        console.log('没有找到相关的作品，请重新搜索');
      }
    })
  });
} else if (program.search === '') {
  console.log(`请输入漫画名称`);
}

if (program.download) {
  // 防止没有输入下载地址
  if (program.download.toString() === 'true') {
    console.log(`请输入需要下载的漫画地址`);
  } else if (program.download.indexOf('cocomanhua') !== -1) {
    console.log(`地址为： ${program.download}, 第一个为全部下载`);
    getSection(program.download).then((res) => {
      console.log(`一共有${res.length}个章节`);
      res.unshift({
        url: program.download,
        sectionName: '**全部下载**',
      });
      const promptList = [
        {
          type: 'rawlist',
          message: '请选择需要下载的章节',
          name: 'manga',
          pageSize: 15,
          choices: res.map((item, index) => (`${index} - ${item.sectionName}`)),
          filter: (val) => {
            return val;
          }
        },
      ];
      inquirer.prompt(promptList).then(answers => {
        let targetObj = res.filter((item, index) => `${index} - ${ item.sectionName}` === answers.manga);
        if (targetObj[0].sectionName === '**全部下载**') {
          getManga(program.download);
        } else {
          // 单一下载章节
          getSingleSection(targetObj[0].sectionName, targetObj[0].url, program.download.replace(baseUrl, ''));
        }
      })
    })
  } else {
    console.log(`请检查该地址输入是否有误！`);
  }
}
