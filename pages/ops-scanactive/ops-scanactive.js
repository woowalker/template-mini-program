// pages/ops-scanactive/ops-scanactive.js
import queryString from 'query-string'

const app = getApp()

Page({
  data: {
    activate: {},
    sequence: ''
  },

  onLoad(params) {
    // scene 是小程序码，普通二维码进来是带 code
    const scene = params.scene ? queryString.parse(decodeURIComponent(params.scene)) : { sequence: params.sequence }
    // 兼容带进来的属性是 id 情况
    this.setData({ sequence: scene.sequence || scene.id })

    this.getOpenerEventChannel().on(
      app.$consts['COMMON/EVENT_NAV_PAGE'],
      ({ activate }) => this.setData({ activate })
    )
  },

  handleActiveCancel() {
    wx.navigateBack()
  },

  handleActive() {
    if (!this.data.sequence) {
      app.showToast('未检测到序列号', 'error')
      return
    }

    app.getUserInfo().then(userinfo => {
      app.showLoading()
      app.$api['ops/activateStake']({
        code: this.data.activate.code,
        openid: userinfo.openid,
        sequence: this.data.sequence
      }).then(() => {
        wx.showModal({
          content: '激活成功',
          showCancel: false,
          complete: () => {
            wx.navigateBack()
          }
        })
      }).finally(() => {
        app.hideLoading()
      })
    })
  }
})