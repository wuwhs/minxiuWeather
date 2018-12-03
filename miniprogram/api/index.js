const config = require('../util/config')
const QQMapWX = require('../lib/qqmap-wx-jssdk.min')

// 腾讯地图实例
const qqMapWX = new QQMapWX({
  key: config.qqMapKey
})

// 公用请求参数
const commonParam = {
  key: config.weatherKey,
  location: 'beijing',
  lang: 'zh-cn',
  unit: 'm'
}

// 获取地理位置信息
const getLocation = () => {
  return new Promise((resolve, reject) => {
    wx.getLocation({
      type: 'gcj02',
      success (res) {
        resolve(res)
      },
      fail (err) {
        reject(err)
      }
    })
  })
}

// 逆地址 坐标->描述
const reverseGeocoder = (option) => {
  return new Promise((resolve, reject) => {
    qqMapWX.reverseGeocoder({
      location: {
        latitude: option.latitude,
        longitude: option.longitude
      },
      success (res) {
        resolve(res.result)
      },
      fail (err) {
        reject(err)
      }
    })
  })
}

// 实时天气
const getNowWeather = (option) => {
  return new Promise((resolve, reject) => {
    wx.request({
      url: config.nowWeatherUrl,
      method: 'GET',
      data: {
        ...commonParam,
        ...option
      },
      success (res) {
        resolve(res.data)
      },
      fail (err) {
        reject(err)
      }
    })
  })
}

// 逐日天气
const getDailyWeather = (option) => {
  return new Promise((resolve, reject) => {
    wx.request({
      url: config.dailyWeatherUrl,
      method: 'GET',
      data: {
        ...commonParam,
        ...option
      },
      success (res) {
        resolve(res.data)
      },
      fail (err) {
        reject(err)
      }
    })
  })
}

// 逐三小时天气
const getHourlyWeather = (option) => {
  return new Promise((resolve, reject) => {
    wx.request({
      url: config.hourlyWeatherUrl,
      method: 'GET',
      data: {
        ...commonParam,
        ...option
      },
      success (res) {
        resolve(res.data)
      },
      fail (err) {
        reject(err)
      }
    })
  })
}

// 生活指数
const getLifestyle = (option) => {
  return new Promise((resolve, reject) => {
    wx.request({
      url: config.lifestyleUrl,
      method: 'GET',
      data: {
        ...commonParam,
        ...option
      },
      success (res) {
        resolve(res.data)
      },
      fail (err) {
        reject(err)
      }
    })
  })
}

// 此时根据拼音字母排序
const sortCityList = (data) => {
  if (!Array.isArray(data)) {
    return []
  }

  let d = data.reduce((pre, cur) => {
    let { pinyin, ...attr } = cur
    pre.push({
      initial: pinyin.join('').toUpperCase(),
      ...attr
    })
    return pre
  }, [])

  d.sort((a, b) => {
    return (a.initial > b.initial) ? 1 : -1
  })

  return d
}

// 获取全国城市列表
const getCityList = () => {
  // 从缓存取
  let CITY_LIST = wx.getStorageSync('CITY_LIST')
  if (CITY_LIST) {
    return Promise.resolve(CITY_LIST)
  }

  return new Promise((resolve, reject) => {
    qqMapWX.getCityList({
      success (res) {
        let cityList = sortCityList(res.result[1] || [])
        wx.setStorage({
          key: 'CITY_LIST',
          data: cityList
        })
        resolve(cityList)
      },
      fail (err) {
        reject(err)
      }
    })
  })
}

// 获取关键字补充提示
const getSuggestion = (option) => {
  return new Promise((resolve, reject) => {
    qqMapWX.getSuggestion({
      ...option,
      success (res) {
        resolve(res.data)
      },
      fail (err) {
        reject(err)
      }
    })
  })
}

module.exports = {
  getLocation,
  reverseGeocoder,
  getNowWeather,
  getDailyWeather,
  getHourlyWeather,
  getLifestyle,
  getCityList,
  getSuggestion
}