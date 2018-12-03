const getGreetings = () => {
  let h = new Date().getHours()
  let w = ''
  if (h > 0 && h <= 5) {
    w = '深夜'
  } else if (h > 5 && h <= 9) {
    w = '早上'
  } else if (h > 9 && h <= 11) {
    w = '上午'
  } else if (h > 11 && h <= 13) {
    w = '中午'
  } else if (h > 13 && h <= 17) {
    w = '下午'
  } else if (h > 17 && h <= 19) {
    w = '傍晚'
  } else {
    w = '晚上'
  }
  return `${w}好`
}

// 节流
const throttle = (fn,delay) => {
  let lastTime = 0
  return () => {
    let nowTime = Date.now()
    console.log('nowTime - lastTime:', nowTime - lastTime)
    if (nowTime - lastTime > delay || !lastTime) {
      lastTime = nowTime
      fn()
    }
  }
}

module.exports = {
  getGreetings,
  throttle
}