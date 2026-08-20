const app = getApp()

const CACHE_TTL = 10 * 60 * 1000 // 缓存有效期 10 分钟

Page({
  data: {
    playerName: '',
    loading: true,
    error: '',
    playerData: null,
    currentMode: 'squad',
    currentStats: {},
    detailStats: [],
    seasons: [],
    currentSeason: '',
    seasonLoading: false
  },

  // --- 数据缓存 ---
  getCache(key) {
    try {
      const cache = wx.getStorageSync(key)
      if (cache && cache.data && cache.timestamp) {
        if (Date.now() - cache.timestamp < CACHE_TTL) {
          return cache.data
        }
      }
    } catch(e) {}
    return null
  },

  setCache(key, data) {
    try {
      wx.setStorageSync(key, { data, timestamp: Date.now() })
    } catch(e) {}
  },

  onLoad(options) {
    if (options.name) {
      this.setData({ playerName: options.name })
      wx.setNavigationBarTitle({ title: options.name + ' - PUBG 战绩' })
      this.fetchSeasons(options.name)
    }
  },

  fetchSeasons(name) {
    const cachedSeasons = this.getCache('seasons_' + name)
    if (cachedSeasons) {
      this.setData({ seasons: cachedSeasons, seasonLoading: false })
      if (cachedSeasons.length > 0) {
        this.setData({ currentSeason: cachedSeasons[0].id })
      }
      this.fetchPlayerData(name)
      return
    }

    this.setData({ seasonLoading: true })
    const baseUrl = app.globalData.proxyUrl || 'http://localhost:3000'
    wx.request({
      url: baseUrl + '/api/player/' + encodeURIComponent(name) + '/seasons',
      method: 'GET',
      timeout: 15000,
      success: (res) => {
        if (res.statusCode === 200 && res.data && res.data.seasons) {
          const seasons = res.data.seasons
          this.setCache('seasons_' + name, seasons)
          this.setData({ seasons, seasonLoading: false })
          if (seasons.length > 0) {
            this.setData({ currentSeason: seasons[0].id })
          }
          this.fetchPlayerData(name)
        } else {
          const msg = (res.data && (res.data.message || res.data.error)) || '获取数据失败，请稍后重试'
          this.setData({ seasonLoading: false, seasons: [], error: msg, loading: false })
        }
      },
      fail: () => {
        this.setData({ seasonLoading: false, seasons: [] })
        this.fetchPlayerData(name)
      }
    })
  },

  fetchPlayerData(name, season) {
    const seasonParam = season || this.data.currentSeason || ""
    const cacheKey = 'player_' + name + '_' + (seasonParam || 'latest')
    const cachedData = this.getCache(cacheKey)
    if (cachedData) {
      this.setData({ playerData: cachedData, loading: false })
      const modes = cachedData.modes
      const defaultMode = modes.squad ? 'squad' : (modes.duo ? 'duo' : 'solo')
      this.setData({ currentMode: defaultMode })
      this.updateStatsForMode(defaultMode)
      return
    }

    this.setData({ loading: true, error: '' })
    const baseUrl = app.globalData.proxyUrl || 'http://localhost:3000'
    const url = baseUrl + '/api/player/' + encodeURIComponent(name) + (seasonParam ? '?season=' + encodeURIComponent(seasonParam) : '')

    wx.request({
      url: url,
      method: 'GET',
      timeout: 20000,
      success: (res) => {
        if (res.statusCode === 200 && res.data && res.data.modes) {
          this.setCache(cacheKey, res.data)
          this.setData({ playerData: res.data, loading: false })
          const modes = res.data.modes
          const defaultMode = modes.squad ? 'squad' : (modes.duo ? 'duo' : 'solo')
          this.setData({ currentMode: defaultMode })
          this.updateStatsForMode(defaultMode)
        } else {
          const msg = (res.data && (res.data.message || res.data.error)) || '获取数据失败，请稍后重试'
          this.setData({ error: msg, loading: false })
        }
      },
      fail: () => {
        this.setData({ error: '网络请求失败，请检查网络或代理服务器', loading: false })
        this.loadDemoData()
      }
    })
  },

  switchMode(e) {
    const mode = e.currentTarget.dataset.mode
    if (this.data.playerData && this.data.playerData.modes && this.data.playerData.modes[mode]) {
      this.updateStatsForMode(mode)
    }
  },

  switchSeason(e) {
    const seasonId = e.currentTarget.dataset.season
    this.setData({ currentSeason: seasonId })
    this.fetchPlayerData(this.data.playerName, seasonId)
  },

  updateStatsForMode(mode) {
    const modeData = this.data.playerData?.modes?.[mode] || {}
    const currentStats = {
      matches: modeData.roundsPlayed ?? 0,
      wins: modeData.wins ?? 0,
      top10: modeData.top10s ?? 0,
      kdRatio: modeData.kdRatio ?? '0',
      kills: modeData.kills ?? 0,
      deaths: modeData.deaths ?? 0,
      assists: modeData.assists ?? 0,
      adr: modeData.adr ?? '0',
      winRate: modeData.winRate ?? '0',
      top10Rate: modeData.top10Rate ?? '0',
      avgRank: modeData.avgRank ?? '-',
      avgDamage: modeData.avgDamage ?? '0',
      revives: modeData.revives ?? 0
    }

    const detailStats = [
      { label: '场次', value: currentStats.matches },
      { label: '吃鸡', value: currentStats.wins },
      { label: '前10', value: currentStats.top10 },
      { label: '淘汰', value: currentStats.kills },
      { label: '死亡', value: currentStats.deaths },
      { label: '助攻', value: currentStats.assists },
      { label: 'K/D', value: currentStats.kdRatio },
      { label: '胜率', value: currentStats.winRate + '%' },
      { label: '前10率', value: currentStats.top10Rate + '%' },
      { label: '平均排名', value: currentStats.avgRank },
      { label: 'ADR', value: currentStats.adr },
      { label: '平均伤害', value: currentStats.avgDamage },
      { label: '最高淘汰', value: modeData.maxKills ?? 0 },
      { label: '最长存活', value: modeData.longestTime ?? '0:00' },
      { label: '总伤害', value: modeData.totalDamage ?? 0 },
      { label: '爆头击杀', value: modeData.headshotKills ?? 0 },
      { label: '击倒', value: modeData.dBNOs ?? 0 },
      { label: '救援', value: modeData.revives ?? 0 },
      { label: '治疗', value: modeData.heals ?? 0 },
      { label: '能量', value: modeData.boosts ?? 0 },
      { label: '队友击杀', value: modeData.teamKills ?? 0 },
      { label: '载具击杀', value: modeData.roadKills ?? 0 },
      { label: '步行距离', value: (modeData.walkDistance ?? 0) + 'm' },
      { label: '载具距离', value: (modeData.rideDistance ?? 0) + 'm' },
      { label: '游泳距离', value: (modeData.swimDistance ?? 0) + 'm' },
      { label: '武器获取', value: modeData.weaponsAcquired ?? 0 }
    ]

    this.setData({ currentMode: mode, currentStats, detailStats })
    this.drawRadarChart(currentStats)
  },

  drawRadarChart(stats) {
    const ctx = wx.createCanvasContext('radarCanvas', this)
    const query = wx.createSelectorQuery().in(this)
    query.select('.radar-canvas').boundingClientRect((rect) => {
      if (!rect) return
      const width = rect.width
      const height = rect.height
      const centerX = width / 2
      const centerY = height / 2
      const radius = Math.min(width, height) / 2 - 40

      const labels = ['胜率', 'K/D', 'ADR', '救援', '平均排名']
      const avgRank = parseFloat(stats.avgRank) || 25
      const values = [
        parseFloat(stats.winRate) || 0,
        parseFloat(stats.kdRatio) || 0,
        parseFloat(stats.adr) || 0,
        stats.revives || 0,
        25 - avgRank  // 4排TPP共25支队伍，排名越小越好，用25-排名标准化
      ]
      // 基于PUBG 4排TPP全服统计数据设定的参考最大值
      // 胜率: 全服平均约4%（25支队伍），顶级玩家15-20%
      // K/D: 全服平均约1.0-1.5，顶级玩家3-5
      // ADR: 全服平均约120-180，顶级玩家300-400
      // 救援: 全服平均约1-2次/局，赛季累计约30-60
      // 平均排名: 25支队伍，全服平均约12-13名，顶级玩家5-8名
      const maxValues = [20, 5, 400, 60, 24]
      const normalizedValues = values.map((v, i) => Math.min(v / maxValues[i], 1))

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

      ctx.beginPath()
      for (let i = 0; i < 5; i++) {
        const r = radius * normalizedValues[i]
        const x = centerX + r * Math.cos(angles[i])
        const y = centerY + r * Math.sin(angles[i])
        if (i === 0) ctx.moveTo(x, y)
        else ctx.lineTo(x, y)
      }
      ctx.closePath()
      ctx.setFillStyle('rgba(233, 69, 96, 0.25)')
      ctx.fill()
      ctx.setStrokeStyle('rgba(233, 69, 96, 0.8)')
      ctx.setLineWidth(2)
      ctx.stroke()

      for (let i = 0; i < 5; i++) {
        const r = radius * normalizedValues[i]
        const x = centerX + r * Math.cos(angles[i])
        const y = centerY + r * Math.sin(angles[i])
        ctx.beginPath()
        ctx.arc(x, y, 4, 0, Math.PI * 2)
        ctx.setFillStyle('#e94560')
        ctx.fill()
      }

      ctx.setFontSize(12)
      ctx.setFillStyle('#8899aa')
      ctx.setTextAlign('center')
      for (let i = 0; i < 5; i++) {
        const labelR = radius + 25
        const x = centerX + labelR * Math.cos(angles[i])
        let y = centerY + labelR * Math.sin(angles[i])
        if (i === 0) y -= 5
        else if (i === 4) y += 5
        ctx.fillText(labels[i], x, y)
      }

      ctx.draw()
    }).exec()
  },

  loadDemoData() {
    const demoData = {
      name: 'CCChan_292',
      avatar: 'https://pubg.plus/favicon.ico',
      level: 268,
      seasonName: '2026 Season 2',
      seasonId: 'division.bro.official.2026-02',
      modes: {
        solo: {
          roundsPlayed: 45, wins: 3, top10s: 12, kills: 98, deaths: 42, assists: 15,
          kdRatio: '2.33', adr: '185.6', winRate: '6.7', top10Rate: '26.7',
          avgRank: '18.4', avgDamage: '185.6', maxKills: 11, longestTime: '28:45', totalDamage: 8352
        },
        duo: {
          roundsPlayed: 128, wins: 15, top10s: 48, kills: 325, deaths: 113, assists: 67,
          kdRatio: '2.88', adr: '215.3', winRate: '11.7', top10Rate: '37.5',
          avgRank: '12.8', avgDamage: '215.3', maxKills: 14, longestTime: '32:10', totalDamage: 27558
        },
        squad: {
          roundsPlayed: 256, wins: 38, top10s: 112, kills: 689, deaths: 218, assists: 156,
          kdRatio: '3.16', adr: '245.8', winRate: '14.8', top10Rate: '43.8',
          avgRank: '9.6', avgDamage: '245.8', maxKills: 17, longestTime: '34:22', totalDamage: 62925
        }
      }
    }
    this.setData({ playerData: demoData, loading: false })
    this.updateStatsForMode('squad')
  },

  goBack() {
    wx.navigateBack()
  },

  goCompare() {
    wx.navigateTo({
      url: '/pages/compare/compare?player1=' + encodeURIComponent(this.data.playerName)
    })
  },

  retry() {
    this.fetchPlayerData(this.data.playerName)
  }
})



