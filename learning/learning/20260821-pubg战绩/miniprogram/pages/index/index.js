const app = getApp()

Page({
  data: {
    playerName: '',
    loading: false,
    recentSearches: [],
    showHistory: false
  },

  onLoad() {
    const recent = wx.getStorageSync('recentSearches') || []
    if (recent.length > 0) {
      this.setData({ recentSearches: recent, showHistory: true })
    }
  },

  onInput(e) {
    this.setData({ playerName: e.detail.value })
  },

  onSearchTap() {
    this.searchPlayer()
  },

  onSearchConfirm() {
    this.searchPlayer()
  },

  quickSearch(e) {
    const name = e.currentTarget.dataset.name
    this.setData({ playerName: name })
    this.saveRecent(name)
    this.searchPlayer(name)
  },

  searchPlayer(name) {
    const value = (name || this.data.playerName).trim()
    if (!value) {
      wx.showToast({ title: '请输入玩家名称', icon: 'none' })
      return
    }

    this.saveRecent(value)
    this.setData({ loading: true })
    wx.navigateTo({
      url: '/pages/player/player?name=' + encodeURIComponent(value),
      success: () => { this.setData({ loading: false }) },
      fail: () => { this.setData({ loading: false }) }
    })
  },

  saveRecent(name) {
    let list = wx.getStorageSync('recentSearches') || []
    list = list.filter(item => item !== name)
    list.unshift(name)
    if (list.length > 10) list = list.slice(0, 10)
    wx.setStorageSync('recentSearches', list)
    this.setData({ recentSearches: list, showHistory: true })
  },

  clearHistory() {
    wx.removeStorageSync('recentSearches')
    this.setData({ recentSearches: [], showHistory: false })
  }
})
