const app = getApp()

const BETTER_LOWER = ['deaths', 'avgRank']

Page({
  data: {
    player1: '',
    player2: '',
    currentMode: 'squad',
    loading: false,
    error: '',
    player1Data: null,
    player2Data: null,
    compareStats: [],
    season1: '',
    season2: '',
    seasons1: [],
    seasons2: []
  },

  onLoad(options) {
    if (options.player1) {
      this.setData({ player1: options.player1 })
    }
  },

  onInput1(e) {
    this.setData({ player1: e.detail.value })
  },

  onInput2(e) {
    this.setData({ player2: e.detail.value })
  },

  switchMode(e) {
    const mode = e.currentTarget.dataset.mode
    this.setData({ currentMode: mode })
  },

  quickSearch1(e) {
    const name = e.currentTarget.dataset.name
    this.setData({ player1: name })
    this.doCompare()
  },

  quickSearch2(e) {
    const name = e.currentTarget.dataset.name
    this.setData({ player2: name })
    this.doCompare()
  },

  doCompare() {
    const p1 = this.data.player1.trim()
    const p2 = this.data.player2.trim()
    if (!p1 || !p2) {
      wx.showToast({ title: '请输入两个玩家名称', icon: 'none' })
      return
    }
    if (p1 === p2) {
      wx.showToast({ title: '请选择不同的玩家', icon: 'none' })
      return
    }
    this.fetchCompare(p1, p2)
  },

  fetchCompare(p1, p2) {
    this.setData({ loading: true, error: '', player1Data: null, player2Data: null, compareStats: [] })
    const baseUrl = app.globalData.proxyUrl || 'http://localhost:3000'

    Promise.all([
      this.fetchPlayer(p1, baseUrl, 'player1Data', 'seasons1', 'season1'),
      this.fetchPlayer(p2, baseUrl, 'player2Data', 'seasons2', 'season2')
    ]).then(() => {
      const mode = this.data.currentMode
      const p1Stats = this.data.player1Data?.modes?.[mode] || {}
      const p2Stats = this.data.player2Data?.modes?.[mode] || {}
      this.buildCompareStats(p1Stats, p2Stats)
      this.setData({ loading: false })
    }).catch((err) => {
      this.setData({ error: '获取数据失败，请稍后重试', loading: false })
    })
  },

  fetchPlayer(name, baseUrl, dataKey, seasonsKey, seasonKey) {
    return new Promise((resolve) => {
      const cacheKey = 'player_' + name
      const cached = this.getCache(cacheKey)
      const cacheSeasonsKey = 'seasons_' + name
      const cachedSeasons = this.getCache(cacheSeasonsKey)

      if (cached && cachedSeasons) {
        this.setData({ [dataKey]: cached, [seasonsKey]: cachedSeasons })
        if (cachedSeasons.length > 0) this.setData({ [seasonKey]: cachedSeasons[0].id })
        resolve()
        return
      }

      wx.request({
        url: baseUrl + '/api/player/' + encodeURIComponent(name) + '/seasons',
        method: 'GET',
        timeout: 15000,
        success: (res) => {
          const seasons = res.statusCode === 200 && res.data && res.data.seasons ? res.data.seasons : []
          this.setCache(cacheSeasonsKey, seasons)
          this.setData({ [seasonsKey]: seasons })
          if (seasons.length > 0) this.setData({ [seasonKey]: seasons[0].id })
          this.fetchPlayerData(name, baseUrl, dataKey).then(resolve).catch(resolve)
        },
        fail: () => {
          this.setDemoData(dataKey, name)
          resolve()
        }
      })
    })
  },

  fetchPlayerData(name, baseUrl, dataKey) {
    return new Promise((resolve) => {
      const cacheKey = 'player_' + name
      const cached = this.getCache(cacheKey)
      if (cached) {
        this.setData({ [dataKey]: cached })
        return resolve()
      }

      wx.request({
        url: baseUrl + '/api/player/' + encodeURIComponent(name),
        method: 'GET',
        timeout: 20000,
        success: (res) => {
          if (res.statusCode === 200 && res.data && res.data.modes) {
            this.setCache(cacheKey, res.data)
            this.setData({ [dataKey]: res.data })
          } else {
            this.setDemoData(dataKey, name)
          }
          resolve()
        },
        fail: () => {
          this.setDemoData(dataKey, name)
          resolve()
        }
      })
    })
  },

  setDemoData(dataKey, name) {
    const demoData = {
      name: name, avatar: 'https://pubg.plus/favicon.ico', level: 268,
      seasonName: '2026 Season 2', seasonId: 'division.bro.official.2026-02',
      modes: {
        solo: { roundsPlayed: 45, wins: 3, top10s: 12, kills: 98, deaths: 42, assists: 15,
          kdRatio: '2.33', adr: '185.6', winRate: '6.7', top10Rate: '26.7',
          avgRank: '18.4', avgDamage: '185.6', maxKills: 11, longestTime: '28:45', totalDamage: 8352,
          revives: 12, headshotKills: 25, dBNOs: 30 },
        duo: { roundsPlayed: 128, wins: 15, top10s: 48, kills: 325, deaths: 113, assists: 67,
          kdRatio: '2.88', adr: '215.3', winRate: '11.7', top10Rate: '37.5',
          avgRank: '12.8', avgDamage: '215.3', maxKills: 14, longestTime: '32:10', totalDamage: 27558,
          revives: 45, headshotKills: 85, dBNOs: 120 },
        squad: { roundsPlayed: 256, wins: 38, top10s: 112, kills: 689, deaths: 218, assists: 156,
          kdRatio: '3.16', adr: '245.8', winRate: '14.8', top10Rate: '43.8',
          avgRank: '9.6', avgDamage: '245.8', maxKills: 17, longestTime: '34:22', totalDamage: 62925,
          revives: 98, headshotKills: 175, dBNOs: 280 }
      }
    }
    this.setData({ [dataKey]: demoData })
  },

  getCache(key) {
    try {
      const cache = wx.getStorageSync(key)
      if (cache && cache.data && cache.timestamp) {
        if (Date.now() - cache.timestamp < 10 * 60 * 1000) return cache.data
      }
    } catch(e) {}
    return null
  },

  setCache(key, data) {
    try { wx.setStorageSync(key, { data, timestamp: Date.now() }) } catch(e) {}
  },

  buildCompareStats(p1Stats, p2Stats) {
    const stats = [
      { label: '场次', key: 'roundsPlayed' },
      { label: '吃鸡', key: 'wins' },
      { label: '前10', key: 'top10s' },
      { label: 'K/D', key: 'kdRatio' },
      { label: '淘汰', key: 'kills' },
      { label: '死亡', key: 'deaths', invert: true },
      { label: '助攻', key: 'assists' },
      { label: '胜率', key: 'winRate', suffix: '%' },
      { label: 'ADR', key: 'adr' },
      { label: '平均排名', key: 'avgRank', invert: true },
      { label: '救援', key: 'revives' },
      { label: '爆头击杀', key: 'headshotKills' },
      { label: '击倒', key: 'dBNOs' }
    ]

    const compareStats = stats.map(s => {
      const v1 = parseFloat(p1Stats[s.key] ?? 0) || 0
      const v2 = parseFloat(p2Stats[s.key] ?? 0) || 0
      let p1Winner = v1 > v2
      if (s.invert) p1Winner = v1 < v2
      if (v1 === v2) p1Winner = null

      return {
        label: s.label, key: s.key,
        v1: s.suffix ? (v1 + s.suffix) : v1,
        v2: s.suffix ? (v2 + s.suffix) : v2,
        p1Winner,
        p2Winner: p1Winner === null ? null : !p1Winner
      }
    })

    this.setData({ compareStats })
    this.drawCompareRadar(p1Stats, p2Stats)
  },

  drawCompareRadar(p1Stats, p2Stats) {
    setTimeout(() => {
      const ctx = wx.createCanvasContext('compareRadarCanvas', this)
      const query = wx.createSelectorQuery().in(this)
      query.select('#compareRadarCanvas').boundingClientRect((rect) => {
        if (!rect) return
        const width = rect.width
        const height = rect.height
        const centerX = width / 2
        const centerY = height / 2
        const radius = Math.min(width, height) / 2 - 50

        const labels = ['胜率', 'K/D', 'ADR', '救援', '平均排名']
        
        const getValues = (stats) => {
          const avgRank = parseFloat(stats.avgRank) || 25
          return [
            parseFloat(stats.winRate) || 0,
            parseFloat(stats.kdRatio) || 0,
            parseFloat(stats.adr) || 0,
            stats.revives || 0,
            25 - avgRank
          ]
        }
        
        const p1Values = getValues(p1Stats)
        const p2Values = getValues(p2Stats)
        const maxValues = [20, 5, 400, 60, 24]
        
        const normalize = (values) => values.map((v, i) => Math.min(v / maxValues[i], 1))
        const p1Normalized = normalize(p1Values)
        const p2Normalized = normalize(p2Values)

        const angles = []
        for (let i = 0; i < 5; i++) {
          angles.push((Math.PI * 2 * i) / 5 - Math.PI / 2)
        }

        ctx.clearRect(0, 0, width, height)

        for (let level = 1; level <= 5; level++) {
          const r = (radius * level) / 5
          ctx.beginPath()
          for (let i = 0; i < 5; i++) {
            const x = centerX + r * Math.cos(angles[i])
            const y = centerY + r * Math.sin(angles[i])
            if (i === 0) ctx.moveTo(x, y)
            else ctx.lineTo(x, y)
          }
          ctx.closePath()
          ctx.setStrokeStyle('rgba(255, 255, 255, 0.1)')
          ctx.setLineWidth(1)
          ctx.stroke()
        }

        for (let i = 0; i < 5; i++) {
          ctx.beginPath()
          ctx.moveTo(centerX, centerY)
          ctx.lineTo(centerX + radius * Math.cos(angles[i]), centerY + radius * Math.sin(angles[i]))
          ctx.setStrokeStyle('rgba(255, 255, 255, 0.15)')
          ctx.setLineWidth(1)
          ctx.stroke()
        }

        // 玩家1数据（红色）
        ctx.beginPath()
        for (let i = 0; i < 5; i++) {
          const r = radius * p1Normalized[i]
          const x = centerX + r * Math.cos(angles[i])
          const y = centerY + r * Math.sin(angles[i])
          if (i === 0) ctx.moveTo(x, y)
          else ctx.lineTo(x, y)
        }
        ctx.closePath()
        ctx.setFillStyle('rgba(233, 69, 96, 0.2)')
        ctx.fill()
        ctx.setStrokeStyle('rgba(233, 69, 96, 0.8)')
        ctx.setLineWidth(2)
        ctx.stroke()

        // 玩家2数据（蓝色）
        ctx.beginPath()
        for (let i = 0; i < 5; i++) {
          const r = radius * p2Normalized[i]
          const x = centerX + r * Math.cos(angles[i])
          const y = centerY + r * Math.sin(angles[i])
          if (i === 0) ctx.moveTo(x, y)
          else ctx.lineTo(x, y)
        }
        ctx.closePath()
        ctx.setFillStyle('rgba(99, 132, 255, 0.2)')
        ctx.fill()
        ctx.setStrokeStyle('rgba(99, 132, 255, 0.8)')
        ctx.setLineWidth(2)
        ctx.stroke()

        // 玩家1数据点
        for (let i = 0; i < 5; i++) {
          const r = radius * p1Normalized[i]
          const x = centerX + r * Math.cos(angles[i])
          const y = centerY + r * Math.sin(angles[i])
          ctx.beginPath()
          ctx.arc(x, y, 4, 0, Math.PI * 2)
          ctx.setFillStyle('#e94560')
          ctx.fill()
        }

        // 玩家2数据点
        for (let i = 0; i < 5; i++) {
          const r = radius * p2Normalized[i]
          const x = centerX + r * Math.cos(angles[i])
          const y = centerY + r * Math.sin(angles[i])
          ctx.beginPath()
          ctx.arc(x, y, 4, 0, Math.PI * 2)
          ctx.setFillStyle('#6384ff')
          ctx.fill()
        }

        // 标签
        ctx.setFontSize(12)
        ctx.setFillStyle('#8899aa')
        ctx.setTextAlign('center')
        for (let i = 0; i < 5; i++) {
          const labelR = radius + 30
          const x = centerX + labelR * Math.cos(angles[i])
          let y = centerY + labelR * Math.sin(angles[i])
          if (i === 0) y -= 5
          else if (i === 4) y += 5
          ctx.fillText(labels[i], x, y)
        }

        ctx.draw()
      }).exec()
    }, 300)
  },

  goBack() {
    wx.navigateBack()
  }
})