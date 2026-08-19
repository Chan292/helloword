const config = require('../config.js');

// 统一的请求封装：把 wx.request 包装成 Promise，方便后续用 .then 串联
function request(url, params) {
  return new Promise(function (resolve, reject) {
    wx.request({
      url: url,
      data: Object.assign({ key: config.API_KEY }, params),
      success: function (res) {
        // 和风天气：业务成功时 code 为 "200"
        if (res.statusCode === 200 && res.data && res.data.code === '200') {
          resolve(res.data);
        } else {
          var msg = res.data && res.data.code
            ? '接口错误，错误码: ' + res.data.code
            : '请求失败，HTTP ' + res.statusCode;
          reject(new Error(msg));
        }
      },
      fail: function (err) {
        reject(err);
      }
    });
  });
}

// 格式化城市名称：区县展示为"城市-区县"（如"广州市-白云"），本身就是城市时直接显示
function formatCityName(item) {
  var name = item.name || '未知城市';
  var adm2 = item.adm2 || '';
  return adm2 && adm2 !== name ? adm2 + '-' + name : name;
}

// 城市搜索（多结果）：返回城市列表供用户选择
function lookupCities(name) {
  return request(config.GEO_BASE_URL + '/city/lookup', { location: name })
    .then(function (data) {
      console.log('城市搜索API响应:', data);
      var list = data.location || [];
      if (!list.length) {
        throw new Error('没有找到城市：' + name);
      }
      // 过滤掉没有 id 的无效数据和国家级别结果，只保留城市
      return list
        .filter(function (item) {
          console.log('城市类型:', item.type, item.name);
          return item && item.id && item.type !== 'country';
        })
        .map(function (item) {
          return {
            id: item.id,
            name: formatCityName(item),
            country: item.country || ''
          };
        });
    })
    .then(function (list) {
      if (!list.length) {
        throw new Error('没有找到城市：' + name);
      }
      return list;
    })
    .catch(function (err) {
      console.error('城市搜索错误:', err);
      // 400 错误统一返回空列表，让调用方显示友好提示
      if (err.message && (err.message.indexOf('400') >= 0 || err.message.indexOf('no such location') >= 0)) {
        throw new Error('没有找到城市：' + name);
      }
      throw err;
    });
}

// 城市搜索（单结果）：用于定位等只需要一个结果的场景
function lookupCity(name) {
  return lookupCities(name).then(function (list) {
    return list[0];
  });
}

// 实时天气（location 可以是 经纬度"116.41,39.92" 或 城市ID"101010100"）
function getNow(location) {
  return request(config.BASE_URL + '/weather/now', { location: location, lang: 'zh' }).then(function (data) {
    return data.now || {};
  });
}

// 未来 3 天预报
function getDaily(location) {
  return request(config.BASE_URL + '/weather/3d', { location: location, lang: 'zh' }).then(function (data) {
    return data.daily || [];
  });
}

module.exports = {
  lookupCity: lookupCity,
  lookupCities: lookupCities,
  getNow: getNow,
  getDaily: getDaily
};
