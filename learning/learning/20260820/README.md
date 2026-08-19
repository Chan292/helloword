# 微信小程序：天气助手（教学示例）

一个最小可运行的天气预报小程序：自动定位 + 城市搜索 + 实时天气 + 未来三天预报 + 下拉刷新。

## 项目结构

| 文件 | 作用 |
| --- | --- |
| app.js / app.json / app.wxss | 全局：启动逻辑、页面注册、窗口配置、全局样式 |
| pages/index/index.js / .wxml / .wxss / .json | 首页：逻辑、结构、样式、页面配置 |
| utils/weather.js | 请求封装：把 wx.request 包装成 Promise |
| config.js | 和风天气 API Key 与域名配置 |

## 三步跑起来

1. **申请天气 API Key**
   - 打开 https://dev.qweather.com/ 免费注册
   - 控制台 -> 项目管理 -> 创建项目 -> 复制 API Key
   - 把 Key 填到 `config.js` 的 `API_KEY` 里
2. **用微信开发者工具导入**
   - 打开微信开发者工具 -> 导入项目 -> 选择 `weixin-miniprogram-demo` 目录
   - AppID 可以直接用测试号，也可以填你自己的
3. **勾选“不校验合法域名”**
   - 详情 -> 本地设置 -> 勾选“不校验合法域名、web-view（业务域名）、TLS 版本以及 HTTPS 证书”
   - 因为开发版用的是和风的“专属 API Host”，本地开发需要跳过域名校验

## 代码怎么工作

- `onLoad` 里调用 `wx.getLocation` 拿到经纬度，失败时降级为手输城市名
- 城市搜索：`onCitySearch` 先调 GeoAPI（`config.js` 里的 `GEO_BASE_URL`）把城市名转成城市 ID，再用 ID 请求天气，避免直接传中文名导致 400
- `fetchWeather` 用 `Promise.all` 同时请求“实时天气”和“三日预报”两个接口
- 数据拿到后用 `this.setData` 更新界面；`wx:if` / `wx:for` 控制渲染
- 页面 `index.json` 开启 `enablePullDownRefresh`，下拉触发 `onPullDownRefresh` 刷新

## 上线前必须做的三件事

1. `config.js` 里的 `HOST` 换成控制台显示的项目专属 Host（`BASE_URL`、`GEO_BASE_URL` 自动跟随）
2. 在小程序后台「开发管理 -> 服务器域名」里把项目专属 Host 加入 request 合法域名（如 `https://np5khxqe4q.re.qweatherapi.com`）
3. 真机调试需要在后台配置「用户隐私保护指引」，声明用到位置信息

## 常见问题

- **一直提示“获取天气失败”**：多半是 API Key 没填、填错，或域名校验未关闭
- **定位失败**：小程序的定位接口需要用户授权；开发工具里用“模拟定位”即可
- **接口报 “Invalid Host”**：请求域名不是该项目授权的专属 Host；在控制台确认新 Key 所在项目的专属 Host 并同步到 `config.js` 的 `HOST`
- **搜索同名城市不准**（如“朝阳区”有多个）：目前取 GeoAPI 返回的第一个结果；如果想要更准，可以在页面上给候选城市列表让用户自己选

## 扩展练习

- 输入即时联想：调 GeoAPI 的 `/city/lookup` 在下拉列表展示候选城市（支持拼音），用户点选后查询
- 用 `wx.cloud` 把城市列表和请求结果做成缓存，减少重复请求
- 加一页“7 天预报”（和风 `/weather/7d` 接口字段和 3d 完全一致）
- 用 `canvas` 或 `echarts` 画未来几天的温度折线图
- 分享时带上当前城市天气（`onShareAppMessage`）
