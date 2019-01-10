//app.js
const config = require('./util/config')
const util = require('./util/util')
const loading = require('./util/loading')
const api = require('./api/index')

App({
  onLaunch: function () {
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力')
    } else {
      wx.cloud.init({
        traceUser: true,
        env: 'demo-57510e'
      })
    }
  },
  // 暴露在全局数据
  globalData: {
    config,
    api,
    util,
    loading
  }
})
