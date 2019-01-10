// miniprogram/pages/searchGeo/searchGeo.js
const app = getApp()
const config = app.globalData.config
const api = app.globalData.api
const util = app.globalData.util
const loading = app.globalData.loading
const regeneratorRuntime = require('../../lib/regenerator')
const indexBar = config.indexBar

Page({
  /**
   * 页面的初始数据
   */
  data: {
    initValue: '', // 搜索框初始值
    cityList: [], // 城市列表
    filterCities: [], // 想查找城市列表
    filterLine1: [],
    filterLine2: [],
    indexList: indexBar, // 右侧索引条数据
    scrollIntoViewId: 'title_0', // 滚动到可视区索引标题id
    barIndex: 0, // 右边索引条索引值
    suggList: [], // 搜索提示列表
    isShowSugg: false, // 是否显示搜索遮罩
    searchCls: 'no-sugg', // 没有提示的样式
    title: null
  },

  // 加载提示
  ...loading,

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad () {
    this.init()
  },

  // 初始化
  async init () {
    await this.showLoading()
    await this.getCityList()
    await this.filterGuess()
    await this.hideLoading()
  },

  // 获取城市列表
  getCityList () {
    return new Promise((resolve, reject) => {
      api.getCityList().then((res) => {
        this.setData({
          cityList: res
        })
        resolve()
      })
        .catch((err) => {
          console.error(err)
          reject(err)
        })
    })
  },

  // 过滤出想查找的城市信息
  filterGuess () {
    return new Promise((resolve) => {
      // 没有找到`北京市`和`上海市`，分别用`东城区`和`黄浦区`代替
      const filterName = ['北京市', '上海市', '广州市', '深圳市', '武汉市']
      const cityName = ['东城区', '黄浦区', '广州市', '深圳市', '武汉市']
      let filterCities = []
      let num = 0

      this.data.cityList.forEach((item) => {
        if (cityName.includes(item.fullname)) {
          let c = { ...item, fullname: filterName[num] }
          filterCities.push(c)
          num++
        }
      })
      this.setData({
        filterLine1: filterCities.slice(0, 2),
        filterLine2: filterCities.slice(2),
        filterCities
      })
      resolve()
    })
  },

  // 城市列表滚动
  scroll: util.throttle(function () {
    wx.createSelectorQuery().selectAll('.city-list-title')
      .boundingClientRect((rects) => {
        let index = rects.findIndex((item) => {
          return item.top >= 0
        })
        if (index === -1) {
          index = rects.length
        }
        this.setIndex(index - 1)
      }).exec()
  }, 20),

  // 点击索引条
  tapIndexItem (event) {
    let id = event.currentTarget.dataset.item
    this.setData({
      scrollIntoViewId: `title_${id === '#' ? 0 : id}`
    })

    // 延时设置索引条焦点
    setTimeout(() => {
      this.setData({
        barIndex: this.data.indexList.findIndex((item) => item === id)
      })
    }, 500)
  },

  // 取消
  cancelSearch () {
    this.setData({
      initValue: '',
      isShowSugg: false,
      searchCls: 'no-sugg',
      suggList: []
    })
  },

  // 搜索输入框聚焦
  focus () {
    this.setData({
      isShowSugg: true
    })
  },

  // 输入搜索关键字
  input: util.throttle(function () {
    let val = arguments[0].detail.value
    if (val === '') {
      this.setData({
        suggList: []
      })
      this.changeSearchCls()
      return false
    }

    api.getSuggestion({
      keyword: val
    })
      .then((res) => {
        this.setData({
          suggList: res
        })
        this.changeSearchCls()
      })
      .catch((err) => {
        console.error(err)
      })
  }, 500),

  // 改变提示样式
  changeSearchCls () {
    this.setData({
      searchCls: this.data.suggList.length ? 'has-sugg' : 'no-sugg'
    })
  },

  // 点击提示单元项，缓存选择的经纬度
  tapSuggItem (event) {
    let { title, location } = event.currentTarget.dataset.item

    wx.setStorageSync(
      'POSITION',
      JSON.stringify({
        title: title,
        longitude: location.lat,
        latitude: location.lng
      })
    )
    this.navigateToIndex()
  },

  // 跳转到首页
  navigateToIndex () {
    wx.navigateBack({
      url: '/pages/index/index'
    })
  },

  // 设置索引号
  setIndex (index) {
    if (this.data.barIndex === index) {
      return false
    } else {
      this.setData({
        barIndex: index
      })
    }
  },

  // 获取当前定位
  tapSetCurPos () {
    wx.removeStorageSync('POSITION')
    this.navigateToIndex()
  },

  // 点击城市项
  tapCityItem (event) {
    let { fullname, location } = event.currentTarget.dataset.item

    wx.setStorageSync(
      'POSITION',
      JSON.stringify({
        title: fullname,
        longitude: location.lat,
        latitude: location.lng
      })
    )
    this.navigateToIndex()
  }
})