// 加载框
const showLoading = () => {
  return new Promise((resolve, reject) => {
    wx.showLoading({
      title: '拼命加载中...',
      success () {
        resolve()
      },
      fail (err) {
        reject(err.message)
      }
    })
  })
}

// 关闭加载框
const hideLoading = () => {
  return new Promise((resolve) => {
    wx.hideLoading()
    resolve()
  })
}

module.exports = {
  showLoading,
  hideLoading
}
