// 和风天气 API 配置
// 免费申请地址：https://dev.qweather.com/（控制台 -> 项目管理 -> 创建项目 -> 拿到 Key）
const API_KEY = '2a44a22dd16e4c52847159bf0faee6b4';

// 专属 API Host：以和风控制台对应项目显示的“专属 Host”为准（形如 xxxx.re.qweatherapi.com）
const HOST = 'https://np5khxqe4q.re.qweatherapi.com';

module.exports = {
  API_KEY: API_KEY,
  // 天气 API（v7 接口）
  BASE_URL: HOST + '/v7',
  // 城市搜索 GeoAPI（同一个专属 Host 下用 /geo/v2）
  GEO_BASE_URL: HOST + '/geo/v2'
};
