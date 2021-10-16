
# Minxiu Weather

Minxiu Weather 是个人开发的一款简单天气小程序。天气数据从[和风天气](https://dev.qweather.com/)，对个人开发者开放的一些接口获取的。有关地址搜索和城市选择功能对接的[腾讯位置服务-微信小程序JavaScript SDK](https://lbs.qq.com/qqmap_wx_jssdk/index.html)。这两者都需要注册获取相应的 key 才可以顺利使用，请使用时更改成自己账号的 key。

现在已发布小程序V1.0.6，后续功能会持续跟上，欢迎扫码体验哈~

![mina-qrcode](/images/mina-qrcode.jpg)

# 问题反馈

## 报错：key不能为空

由于位置服务使用的[腾讯位置服务-微信小程序JavaScript SDK](https://lbs.qq.com/qqmap_wx_jssdk/index.html)，请自行申请自己的密钥（`key`）。审核通过后授权给当前要使用的微信小程序（`APP ID`）,还需将微信小程序域名 `servicewechat.com` 添加到白名单。

![lbs-key](/images/lbs-key.png)

上述完成后，请到项目 `/miniprogram/util/config.js` 修改腾讯地图开发 `key` 字段。

## 报错：Cannot read property 'parent_city' of undefined;

天气 `API` 是[和风天气](https://dev.qweather.com/)提供，需要自行申请密钥（`key`）,请到项目 `/miniprogram/util/config.js` 修改和风天气个人开发 `key`。为了大家方便（申请个人开发者需要提供作品审核可能需要时间），我在这提供一个个人的开发 `key`：`d469334ef67548578d65268f148b046f` ，勿乱滥用哈~

## 报错：https://devapi.qweather.com 不在以下 request 合法域名列

请[小程序开发](https://mp.weixin.qq.com)，开发 -> 开发设置 -> request合法域名，添加 `https://devapi.qweather.com` `https://apis.map.qq.com` 者两个合法域名，目的是为了允许使用腾讯位置服务 `API` 和和风天气 `API`。

## 报错：未开通云服务

这块如果还没有开通小程序云开发的同学，可以把 `/miniprogram/app.js` 中 `onLaunch` 注释掉即可。