const { lookupCities, getNow, getDaily } = require('../../utils/weather.js');

// 和风天气 icon 编号 -> 表情符号（只列常见天气，缺省用兜底）
const ICON_MAP = {
  '100': '☀️', '101': '⛅', '102': '🌤️', '103': '⛅', '104': '☁️',
  '150': '🌙', '151': '🌙', '152': '🌙', '153': '🌙', '154': '🌙',
  '300': '🌦️', '301': '⛈️', '302': '⛈️', '303': '⛈️', '304': '🌪️',
  '305': '🌧️', '306': '🌧️', '307': '🌧️', '308': '🌧️', '309': '🌧️',
  '310': '🌧️', '311': '🌧️', '312': '🌨️', '313': '🌨️', '314': '🌨️',
  '315': '❄️', '316': '❄️', '317': '❄️', '318': '🌨️', '399': '🌧️',
  '400': '🌨️', '401': '🌨️', '402': '❄️', '403': '❄️', '404': '🌧️',
  '405': '🌨️', '406': '🌧️', '407': '❄️',
  '456': '🌫️', '457': '🌫️', '458': '🌪️', '459': '🌪️', '460': '🌫️',
  '461': '🌫️', '462': '🌫️', '463': '🌫️', '464': '🌫️', '465': '🌫️',
  '466': '🌫️', '467': '🌫️',
  '500': '🌫️', '501': '🌧️', '502': '🌪️', '503': '🌫️', '504': '🌫️',
  '507': '🌪️', '508': '🌫️', '509': '🌫️', '510': '❄️', '511': '🌫️',
  '512': '🌫️', '513': '🌫️', '514': '🌫️', '515': '🌫️', '900': '🥵'
};
const DEFAULT_ICON = '🌤️';

// 外文天气描述 -> 中文翻译
const TEXT_MAP = {
  // 英文
  'Sunny': '晴', 'Clear': '晴', 'Partly cloudy': '多云', 'Cloudy': '阴',
  'Overcast': '阴', 'Light rain': '小雨', 'Moderate rain': '中雨',
  'Heavy rain': '大雨', 'Torrential rain': '暴雨', 'Rainstorm': '暴雨',
  'Light snow': '小雪', 'Moderate snow': '中雪', 'Heavy snow': '大雪',
  'Blizzard': '暴雪', 'Fog': '雾', 'Haze': '霾', 'Light shower': '小阵雨',
  'Shower': '阵雨', 'Heavy shower': '大阵雨', 'Thundershower': '雷阵雨',
  'Light rain shower': '小阵雨', 'Rain shower': '阵雨',
  'Light snow shower': '小阵雪', 'Snow shower': '阵雪',
  // 日文
  '晴れ': '晴', 'くもり': '多云', '雨': '雨', '雪': '雪',
  '大雨': '大雨', '小雨': '小雨', '雷雨': '雷阵雨', '霧': '雾',
  '晴時々曇': '晴转多云', '曇り': '阴', '曇時々雨': '多云转雨',
  // 韩文
  '맑음': '晴', '흐림': '阴', '비': '雨', '눈': '雪',
  '구름조금': '少云', '구름많음': '多云', '소나기': '阵雨',
  '안개': '雾'
};

// 外国城市名 -> 中文翻译
const CITY_MAP = {
  // 日本
  'Tokyo': '东京', 'Osaka': '大阪', 'Kyoto': '京都', 'Nagoya': '名古屋',
  'Yokohama': '横滨', 'Kobe': '神户', 'Fukuoka': '福冈', 'Sapporo': '札幌',
  'Sendai': '仙台', 'Hiroshima': '广岛', 'Naha': '那霸', 'Kagoshima': '鹿儿岛',
  '東京': '东京', '大阪': '大阪', '京都': '京都', '名古屋': '名古屋',
  '横浜': '横滨', '神戸': '神户', '福岡': '福冈', '札幌': '札幌',
  '仙台': '仙台', '広島': '广岛', '那覇': '那霸', '鹿児島': '鹿儿岛',
  // 韩国
  'Seoul': '首尔', 'Busan': '釜山', 'Incheon': '仁川', 'Daegu': '大邱',
  'Daejeon': '大田', 'Gwangju': '光州', 'Ulsan': '蔚山', 'Jeju': '济州',
  '서울': '首尔', '부산': '釜山', '인천': '仁川', '대구': '大邱',
  '대전': '大田', '광주': '光州', '울산': '蔚山', '제주': '济州',
  // 首尔地区
  'Gangnam': '江南', 'Gangdong': '江东', 'Gangbuk': '江北', 'Gangseo': '江西',
  'Gwanak': '冠岳', 'Gwangjin': '广津', 'Guro': '九老', 'Geumcheon': '衿川',
  'Nowon': '芦原', 'Dobong': '道峰', 'Dongdaemun': '东大门', 'Dongjak': '铜雀',
  'Mapo': '麻浦', 'Seodaemun': '西大门', 'Seocho': '瑞草', 'Seongdong': '城东',
  'Seongbuk': '城北', 'Songpa': '松坡', 'Yangcheon': '阳川', 'Yeongdeungpo': '永登浦',
  'Yongsan': '龙山', 'Eunpyeong': '恩平', 'Jongno': '钟路', 'Jung': '中区',
  'Jungnang': '中浪', '강남': '江南', '강동': '江东', '강북': '江北', '강서': '江西',
  '관악': '冠岳', '광진': '广津', '구로': '九老', '금천': '衿川',
  '노원': '芦原', '도봉': '道峰', '동대문': '东大门', '동작': '铜雀',
  '마포': '麻浦', '서대문': '西大门', '서초': '瑞草', '성동': '城东',
  '성북': '城北', '송파': '松坡', '양천': '阳川', '영등포': '永登浦',
  '용산': '龙山', '은평': '恩平', '종로': '钟路', '중': '中区', '중랑': '中浪',
  // 韩文带구后缀的地区
  '강남구': '江南区', '강동구': '江东区', '강북구': '江北区', '강서구': '江西区',
  '관악구': '冠岳区', '광진구': '广津区', '구로구': '九老区', '금천구': '衿川区',
  '노원구': '芦原区', '도봉구': '道峰区', '동대문구': '东大门区', '동작구': '铜雀区',
  '마포구': '麻浦区', '서대문구': '西大门区', '서초구': '瑞草区', '성동구': '城东区',
  '성북구': '城北区', '송파구': '松坡区', '양천구': '阳川区', '영등포구': '永登浦区',
  '용산구': '龙山区', '은평구': '恩平区', '종로구': '钟路区', '중구': '中区', '중랑구': '中浪区',
  '서울특별시': '首尔特别市', '서울시': '首尔市', '서울': '首尔',
  // 釜山地区
  'Haeundae': '海云台', 'Suyeong': '水营', 'Yeongdo': '影岛', 'Seo': '西区',
  'Dong': '东区', 'Nam': '南区', 'Buk': '北区', 'Jung': '中区',
  'Sasang': '沙上', 'Saha': '沙下', 'Geumjeong': '金井', 'Gangseo': '江西',
  '해운대': '海云台', '수영': '水营', '영도': '影岛', '서구': '西区',
  '동구': '东区', '남구': '南区', '북구': '北区', '중구': '中区',
  '사상': '沙上', '사하': '沙下', '금정': '金井', '강서': '江西',
  // 泰国
  'Bangkok': '曼谷', 'Chiang Mai': '清迈', 'Phuket': '普吉',
  // 新加坡
  'Singapore': '新加坡',
  // 马来西亚
  'Kuala Lumpur': '吉隆坡', 'Penang': '槟城',
  // 越南
  'Hanoi': '河内', 'Ho Chi Minh City': '胡志明市', 'Da Nang': '岘港',
  // 印度
  'New Delhi': '新德里', 'Mumbai': '孟买', 'Bangalore': '班加罗尔',
  // 澳大利亚
  'Sydney': '悉尼', 'Melbourne': '墨尔本', 'Brisbane': '布里斯班',
  'Perth': '珀斯', 'Adelaide': '阿德莱德',
  // 英国
  'London': '伦敦', 'Manchester': '曼彻斯特', 'Birmingham': '伯明翰',
  'Liverpool': '利物浦', 'Edinburgh': '爱丁堡',
  // 法国
  'Paris': '巴黎', 'Marseille': '马赛', 'Lyon': '里昂',
  // 德国
  'Berlin': '柏林', 'Munich': '慕尼黑', 'Hamburg': '汉堡',
  // 美国
  'New York': '纽约', 'Los Angeles': '洛杉矶', 'Chicago': '芝加哥',
  'Houston': '休斯顿', 'Phoenix': '凤凰城', 'Philadelphia': '费城',
  'San Antonio': '圣安东尼奥', 'San Diego': '圣迭戈', 'Dallas': '达拉斯',
  'San Francisco': '旧金山', 'Seattle': '西雅图', 'Boston': '波士顿',
  'Washington': '华盛顿', 'Miami': '迈阿密', 'Las Vegas': '拉斯维加斯',
  // 加拿大
  'Toronto': '多伦多', 'Vancouver': '温哥华', 'Montreal': '蒙特利尔',
  // 其他常见城市
  'Dubai': '迪拜', 'Abu Dhabi': '阿布扎比', 'Moscow': '莫斯科',
  'Rome': '罗马', 'Milan': '米兰', 'Madrid': '马德里', 'Barcelona': '巴塞罗那',
  'Amsterdam': '阿姆斯特丹', 'Brussels': '布鲁塞尔', 'Vienna': '维也纳',
  'Zurich': '苏黎世', 'Istanbul': '伊斯坦布尔', 'Cairo': '开罗',
  'Rio de Janeiro': '里约热内卢', 'São Paulo': '圣保罗', 'Buenos Aires': '布宜诺斯艾利斯',
  'Mexico City': '墨西哥城', 'Honolulu': '檀香山'
};

function icon(key) {
  return ICON_MAP[key] || DEFAULT_ICON;
}

function translateText(text) {
  if (!text) return '';
  // 先尝试精确匹配
  if (TEXT_MAP[text]) return TEXT_MAP[text];
  // 尝试模糊匹配
  for (var key in TEXT_MAP) {
    if (text.indexOf(key) >= 0) return TEXT_MAP[key];
  }
  return text;
}

function translateCity(name) {
  if (!name) return '';
  // 先尝试精确匹配
  if (CITY_MAP[name]) return CITY_MAP[name];
  
  // 处理"adm2-name"格式（如"서울특별시-강남구"）
  if (name.indexOf('-') >= 0) {
    var parts = name.split('-');
    var translatedParts = parts.map(function(part) {
      if (CITY_MAP[part]) return CITY_MAP[part];
      // 去掉韩文后缀再匹配
      var cleanPart = part.replace(/구$|시$|도$|군$|읍$|면$|동$|로$|길$/i, '');
      if (CITY_MAP[cleanPart]) return CITY_MAP[cleanPart];
      return part;
    });
    return translatedParts.join('-');
  }
  
  // 去掉常见后缀再匹配（如 "Gangnam-gu" -> "Gangnam"， "강남구" -> "강남"）
  var cleanName = name.replace(/-gu$|-si$|-do$|-gun$|-eup$|-myeon$|-dong$|-ro$|-gil$|구$|시$|도$|군$|읍$|면$|동$|로$|길$/i, '');
  if (CITY_MAP[cleanName]) return CITY_MAP[cleanName];
  // 尝试模糊匹配
  for (var key in CITY_MAP) {
    if (name.indexOf(key) >= 0 || key.indexOf(name) >= 0) return CITY_MAP[key];
  }
  return name;
}

function formatTime(timeStr) {
  // 2026-08-18T12:30+08:00 -> 12:30
  var match = timeStr.match(/T(\d{2}:\d{2})/);
  return match ? match[1] : timeStr;
}

function formatDay(dateStr) {
  var date = new Date(dateStr.replace(/-/g, '/'));
  var weeks = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
  return weeks[date.getDay()];
}

Page({
  data: {
    loading: true,
    error: '',
    errorIcon: '',
    city: '定位中…',
    country: '',
    now: null,
    nowIcon: '',
    daily: [],
    updateTime: '',
    cityList: [],
    showCityPicker: false
  },

  onLoad() {
    // 进入页面：优先用定位拿当前城市天气
    this.loadByLocation();
  },

  onPullDownRefresh() {
    // 下拉刷新
    this.reload().then(function () {
      wx.stopPullDownRefresh();
    });
  },

  reload() {
    if (this.data.location) {
      return this.fetchWeather(this.data.location, this.data.city, this.data.country);
    }
    return this.loadByLocation();
  },

  // 定位：把回调风格的 wx.getLocation 包装成 Promise
  loadByLocation() {
    this.setData({ loading: true, error: '' });
    return new Promise((resolve) => {
      wx.getLocation({
        type: 'gcj02',
        success: (res) => {
          var location = res.longitude + ',' + res.latitude;
          this.setData({ location: location });
          // 用坐标反查城市名；失败时退化为"当前位置"
          lookupCities(location)
            .then((list) => {
              var result = list[0];
              this.fetchWeather(location, result.name, result.country);
            })
            .catch(() => {
              this.fetchWeather(location, '当前位置');
            });
          resolve();
        },
        fail: () => {
          this.setData({
            loading: false,
            error: '无法获取当前位置',
            errorIcon: '📍'
          });
          resolve();
        }
      });
    });
  },

  onCityInput(e) {
    this.cityName = e.detail.value;
  },

  onCitySearch() {
    var city = (this.cityName || '').trim();
    if (!city) {
      wx.showToast({ title: '请输入城市名', icon: 'none' });
      return;
    }
    // 先把城市名转成城市 ID，天气接口不认中文名（直接传"北京"会返回 400）
    this.setData({ loading: true, error: '' });
    lookupCities(city)
      .then((list) => {
        console.log('搜索结果:', list);
        // 翻译城市名，保留原名
        var translatedList = list.map(function(item) {
          var translated = translateCity(item.name);
          console.log('翻译:', item.name, '->', translated);
          return {
            id: item.id,
            name: translated,
            originalName: item.name,
            showBoth: translated !== item.name,
            country: item.country || ''
          };
        });
        if (translatedList.length === 1) {
          // 只有一个结果，直接使用
          var result = translatedList[0];
          this.fetchWeather(result.id, result.name, result.country);
        } else {
          // 多个结果，弹出选择
          this.setData({
            loading: false,
            cityList: translatedList,
            showCityPicker: true
          });
        }
      })
      .catch((err) => {
        console.error('城市查询失败: ', err);
        this.setData({
          loading: false,
          error: '找不到该地区',
          errorIcon: '🔍'
        });
      });
  },

  // 从列表中选择城市
  onPickCity(e) {
    var index = e.currentTarget.dataset.index;
    var item = this.data.cityList[index];
    this.setData({ showCityPicker: false, cityList: [] });
    this.fetchWeather(item.id, item.name, item.country);
  },

  // 关闭城市选择弹窗
  onCloseCityPicker() {
    this.setData({ showCityPicker: false, cityList: [], loading: false });
  },

  // 同时请求实时天气和三日预报
  fetchWeather(location, city, country) {
    this.setData({ loading: true, error: '' });
    var translatedCity = translateCity(city);
    return Promise.all([getNow(location), getDaily(location)])
      .then((results) => {
        var now = results[0];
        var daily = results[1].map(function (item, index) {
          return {
            fxDate: item.fxDate,
            dateLabel: index === 0 ? '今天' : index === 1 ? '明天' : formatDay(item.fxDate),
            icon: icon(item.iconDay),
            textDay: translateText(item.textDay),
            tempMin: item.tempMin,
            tempMax: item.tempMax
          };
        });
        this.setData({
          loading: false,
          location: location,
          city: translatedCity,
          // 国内城市不重复显示国家，国外城市（如日本海南市）用标签标注
          country: country && country !== '中国' ? country : '',
          now: now,
          nowText: translateText(now.text),
          nowIcon: icon(now.icon),
          daily: daily,
          updateTime: formatTime(now.obsTime || now.updateTime)
        });
      })
      .catch((err) => {
        console.error('天气接口出错: ', err);
        this.setData({
          loading: false,
          error: '暂无该地区天气数据',
          errorIcon: '🌧️'
        });
      });
  }
});
