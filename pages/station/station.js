// pages/station/station.js
const app = getApp()

Page({
  data: {
    // STATUS_ON STATUS_BUSY STATUS_CHARGING STATUS_OFF
    ...app.$consts['STAKE/STAKE_STATUS'],
    // 站点信息
    station: {},
    stakes: [],
    favorite: false,
    // 是否已经自动加载过
    autoLoaded: false,
    // 用户唯一标识
    openid: ''
  },

  onLoad() {
    const cacheNearbyPageData = wx.getStorageSync(app.$consts['COMMON/CACHE_NEARBY_PAGE_DATA'])
    cacheNearbyPageData && this.setData({
      station: cacheNearbyPageData.station,
      favorite: cacheNearbyPageData.station.favorite
    })
  },

  onShow() {
    if (this.data.autoLoaded) {
      // 从充电中页面返回时，重新拉取充电桩的相关信息
      this.getStakes(false).then(({ favorite, stakes }) => {
        this.setData({
          favorite,
          stakes: stakes.sort((a, b) => a.stakeStatus - b.stakeStatus)
        })
      })
    }
  },

  onUnload() {
    wx.removeStorage({ key: app.$consts['COMMON/CACHE_NEARBY_PAGE_DATA'] })
  },

  /**
   * 获取充电桩相关信息
   * @param {boolean} silent 静默加载
   */
  getStakes(silent = true) {
    return new Promise((resolve, reject) => {
      !silent && app.showLoading()
      app.getOpenid()
        .then(openid => { this.setData({ openid }) })
        .finally(() => {
          app.$api['station/getStakes']({
            openid: this.data.openid,
            stationId: this.data.station.stationId
          }).then(res => {
            const { favorite, stakes } = res
            resolve({
              favorite,
              stakes: stakes.map(item => {
                // 组装状态显示相关字段
                let statusFont, statusClass, statusImg
                switch (item.stakeStatus) {
                  case app.$consts['STAKE/STATUS_BUSY']:
                    statusFont = '被预约'
                    statusClass = 'busy'
                    statusImg = '/images/station/status-busy.png'
                    break
                  case app.$consts['STAKE/STATUS_CHARGING']:
                    statusFont = '充电中'
                    statusClass = 'charging'
                    statusImg = '/images/station/status-charging.png'
                    break
                  case app.$consts['STAKE/STATUS_OFF']:
                    statusFont = '已离线'
                    statusClass = 'off'
                    statusImg = '/images/station/status-off.png'
                    break
                  default:
                    statusFont = '空闲中'
                    statusClass = 'on'
                    statusImg = '/images/station/status-on.png'
                    break
                }
                return {
                  ...item,
                  statusFont,
                  statusClass,
                  statusImg
                }
              })
            })
          }).catch(err => {
            reject(err)
          }).finally(() => {
            !silent && app.hideLoading()
          })
        })
    })
  },

  onRefresh(evt) {
    this.setData({ autoLoaded: true })
    this.getStakes()
      .then(({ favorite, stakes }) => {
        this.setData({
          favorite,
          stakes: stakes.sort((a, b) => a.stakeStatus - b.stakeStatus)
        })
      })
      .finally(() => {
        // 通知 c-scroller，加载完成，传参为是否数据为空的参数
        evt.detail.done(!this.data.stakes.length)
      })
  },

  handleFavorite() {
    app.getUserInfo().then(res => {
      app.$api['station/favoriteStation']({
        openid: res.openid,
        stationId: this.data.station.stationId,
        favorite: !this.data.favorite
      }).then(() => {
        this.setData({ favorite: !this.data.favorite })
      })
    })
  },

  navToStakeDetail(evt) {
    const { value } = evt.currentTarget.dataset
    wx.navigateTo({
      url: '/pages/stake/stake?code=' + value
    })
  },

  navToPreOrder(evt) {
    app.getUserOrdering().then(() => {
      app.getUserInfo().then(userinfo => {
        const { value } = evt.currentTarget.dataset
        app.$api['stake/ordering']({
          clientId: userinfo.id,
          openid: userinfo.openid,
          stakeCode: value
        }).then(() => {
          app.showToast('预约成功', null, true).then(() => {
            wx.navigateTo({
              url: '/pages/stake/stake?code=' + value
            })
          })
        })
      })
    })
  },

  navToChargeMode(evt) {
    app.getUserOrdering().then(() => {
      const { value } = evt.currentTarget.dataset
      const find = this.data.stakes.find(item => item.stakeCode === value)
      wx.navigateTo({
        url: '/pages/charge-mode/charge-mode'
      }).then(evt => {
        evt.eventChannel.emit(app.$consts['COMMON/EVENT_NAV_PAGE'], { stake: find })
      })
    })
  }
})