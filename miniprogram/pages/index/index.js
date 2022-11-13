//index.js
const app = getApp()
const config = app.globalData.config
const api = app.globalData.api
const loading = app.globalData.loading
const util = app.globalData.util
const COND_ICON_BASE_URL = config.COND_ICON_BASE_URL
const BG_IMG_BASE_URL = config.BG_IMG_BASE_URL
// 为了用`async await`
const regeneratorRuntime = require('../../lib/regenerator')
const wxCharts = require('../../lib/wxchart')

Page({
  data: {
    greetings: '', // 问候语
    bgColor: '#53619b', // 背景
    location: '', // 地理坐标
    geoDes: '定位中...', // 地理位置描述

    nowWeather: {
      // 实时天气数据
      tmp: 'N/A', // 温度
      condTxt: '', // 天气状况
      windDir: '', // 风向
      windSc: '', // 风力
      windSpd: '', // 风速
      pres: '', // 大气压
      hum: '', // 湿度
      pcpn: '', // 降水量
      condIconUrl: `${COND_ICON_BASE_URL}/999.png`, // 天气图标
      loc: '' // 当地时间
    },

    days: ['今天', '明天', '后天'],

    canvasWidth: 0,

    canvasSrc: '',

    dailyWeather: [], // 逐日天气数据

    hourlyWeather: [], // 逐三小时天气数据

    lifestyle: [] // 生活指数
  },

  // 加载提示
  ...loading,

  onShow() {
    this.init()
  },

  // 初始化
  init() {
    this.showLoading()
    this.initGreetings()
    this.initWeatherInfo()
  },

  // 允许分享
  onShareAppMessage() { },

  // 跳到搜索页
  toSearchPage() {
    wx.navigateTo({
      url: '/pages/searchGeo/searchGeo'
    })
  },

  // 下拉刷新
  onPullDownRefresh() {
    this.init()
    wx.stopPullDownRefresh()
  },

  // 初始化问候语
  initGreetings() {
    this.setData({
      greetings: util.getGreetings()
    })
  },

  // 初始化天气信息
  async initWeatherInfo() {
    // 获取地址信息
    await this.getLocation()

    // 获取实时天气
    await this.getNowWeather()

    // 获取逐三小时天气
    await this.getHourlyWeather()

    // 获取逐日天气
    await this.getDailyWeather()

    // 获取生活指数
    await this.getLifestyle()

    // 关闭加载框
    await this.hideLoading()
  },

  // 获取地理位置信息
  async getLocation() {
    let position = wx.getStorageSync('POSITION')
    position = position ? JSON.parse(position) : position

    if (position) {
      this.setData({
        location: `${position.longitude.toFixed(2)},${position.latitude.toFixed(2)}`,
        geoDes: position.title
      })
      return
    }

    await api
      .getLocation()
      .then((res) => {
        let { longitude, latitude } = res
        this.setData({
          location: `${longitude.toFixed(2)},${latitude.toFixed(2)}`
        })
        // 逆地址获取地址描述
        this.getGeoDes({
          longitude,
          latitude
        })
      })
      .catch((err) => {
        console.error(err)
      })
  },

  // 逆地址获取地址描述
  getGeoDes(option) {
    api.reverseGeocoder(option).then((res) => {
      let addressComponet = res.address_component
      let geoDes = `${addressComponet.city}${addressComponet.district}${addressComponet.street_number}`
      this.setData({
        geoDes
      })
    })
  },

  // 获取实时天气
  getNowWeather() {
    return new Promise((resolve, reject) => {
      api
        .getNowWeather({
          location: this.data.location
        })
        .then((res) => {
          this.formatNowWeather(res.now)
          resolve()
        })
        .catch((err) => {
          console.error(err)
          reject(err)
        })
    })
  },

  // 格式化实时天气数据
  formatNowWeather(data) {
    this.setData({
      nowWeather: {
        ...data,
        obsTime: new Date(data.obsTime).toTimeString().slice(0, 5)
      }
    })
    this.initBgImg(data.icon)
  },

  // 初始化背景（导航和内容）
  initBgImg(code) {
    let cur = config.bgImgList.find((item) => {
      return item.codes.includes(parseInt(code))
    })
    if (cur) {
      this.setData({
        bgColor: cur.color
      })
    }

    wx.setNavigationBarColor({
      frontColor: '#ffffff',
      backgroundColor: cur ? cur.color : '#53619b',
      animation: {
        duration: 400,
        timingFunc: 'easeIn'
      }
    })
  },

  // 获取逐日天气
  getDailyWeather() {
    return new Promise((resolve, reject) => {
      api
        .getDailyWeather({
          location: this.data.location
        })
        .then((res) => {
          // let data = res.HeWeather6[0].daily_forecast
          this.formatDailyWeather(res.daily)
          this.getDailyContainer()
          resolve()
        })
        .catch((err) => {
          console.error(err)
          reject(err)
        })
    })
  },

  // 格式化逐日天气数据
  formatDailyWeather(data) {
    let dailyWeather = data.reduce((pre, cur, index) => {
      let date = cur.fxDate.slice(5).replace(/-/, '/')

      pre.push({
        ...cur,
        date: date,
        parseDate: this.data.days[index] ? this.data.days[index] : date,
      })

      return pre
    }, [])

    this.setData({
      dailyWeather
    })
  },

  // 获取逐日天气容器宽
  getDailyContainer() {
    let temperatureData = this.formatTemperatureData(this.data.dailyWeather)

    wx.createSelectorQuery()
      .select('.forecast-day')
      .fields({
        size: true
      })
      .exec((res) => {
        this.drawTemperatureLine({
          temperatureData,
          diagramWidth: res[0].width * 7
        })
      })
  },

  // 绘制气温折线图
  drawTemperatureLine(data) {
    let { temperatureData, diagramWidth } = data
    let rate = wx.getSystemInfoSync().windowWidth / 375

    // 设置绘制 canvas 宽度
    this.setData({
      canvasWidth: diagramWidth
    })

    new wxCharts({
      canvasId: 'canvasWeather',
      type: 'line',
      categories: temperatureData.dateArr,
      animation: false,
      config: {
        fontSize: 16 * rate,
        color: '#ffffff',
        paddingX: 0,
        paddingY: 30 * rate
      },
      series: [
        {
          name: '最高气温',
          data: temperatureData.tempMaxArr,
          fontOffset: -8 * rate,
          format: function (val, name) {
            return val + '℃'
          }
        },
        {
          name: '最低气温',
          data: temperatureData.tempMinArr,
          fontOffset: -8 * rate,
          format: function (val, name) {
            return val + '℃'
          }
        }
      ],
      xAxis: {
        disableGrid: true
      },
      yAxis: {
        disabled: true
      },
      width: diagramWidth,
      height: 200,
      dataLabel: true,
      dataPointShape: true,
      extra: {
        lineStyle: 'curve'
      }
    })

    this.canvasToImg()
  },

  // 将 canvas 复制到图片
  canvasToImg() {
    setTimeout(() => {
      wx.canvasToTempFilePath({
        canvasId: 'canvasWeather',
        success: (res) => {
          var shareTempFilePath = res.tempFilePath
          this.setData({
            canvasSrc: shareTempFilePath
          })
        }
      })
    }, 500)
  },

  // 格式化气温数据用于绘制折线图
  formatTemperatureData(data) {
    return data.reduce(
      (pre, cur) => {
        let { date, tempMax, tempMin } = cur
        pre.dateArr.push(date)
        pre.tempMaxArr.push(tempMax)
        pre.tempMinArr.push(tempMin)
        return pre
      },
      { dateArr: [], tempMaxArr: [], tempMinArr: [] }
    )
  },

  // 获取逐小时天气
  getHourlyWeather() {
    return new Promise((resolve, reject) => {
      api
        .getHourlyWeather({
          location: this.data.location
        })
        .then((res) => {
          // let data = res.HeWeather6[0].hourly
          this.formaHourlyWeather(res.hourly)
          resolve()
        })
        .catch((err) => {
          console.error(err)
          reject(err)
        })
    })
  },

  // 格式化逐三小时天气
  formaHourlyWeather(data) {
    let formatData = data.reduce((pre, cur) => {
      pre.push({
        ...cur,
        date: new Date(cur.fxTime).toTimeString().slice(0, 2),
      })
      return pre
    }, [])

    let gap = 4
    let trip = Math.ceil(formatData.length / gap)
    let hourlyWeather = []
    for (let i = 0; i < trip; i++) {
      hourlyWeather.push(formatData.slice(i * gap, (i + 1) * gap))
    }

    this.setData({
      hourlyWeather
    })
  },

  // 获取生活指数
  getLifestyle() {
    return new Promise((resolve, reject) => {
      api
        .getLifestyle({
          location: this.data.location,
          type: '1,2,3,6,8,9,14'
        })
        .then((res) => {
          this.formatLifestyle(res.daily)
          resolve()
        })
        .catch((err) => {
          console.error(err)
          reject(err)
        })
    })
  },

  // 格式化生活指数数据
  formatLifestyle(data) {
    const lifestyleImgList = config.lifestyleImgList
    let lifestyle = data.reduce((pre, cur) => {
      pre.push({
        ...cur,
        iconName: lifestyleImgList[cur.type]
      })
      return pre
    }, [])
    this.setData({
      lifestyle
    })
  }
})
