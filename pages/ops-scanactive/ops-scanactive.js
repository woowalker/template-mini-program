// pages/ops-scanactive/ops-scanactive.js
import queryString from 'query-string'

const app = getApp()

Page({
  data: {
    activate: {},
    sequence: '',
    // 是否从激活工单列表跳转过来，否则跳回运维中心首页
    fromPage: ''
  },

  onLoad(params) {
    // 解析路由参数
    const q = params.q ? queryString.parseUrl(decodeURIComponent(params.q)).query : { sequence: params.sequence }
    this.setData({ sequence: q.sequence, fromPage: params.fromPage })
    // 接收激活列表工单参数
    this.getOpenerEventChannel().on(
      app.$consts['COMMON/EVENT_NAV_PAGE'],
      ({ activate }) => this.setData({ activate })
    )
  },

  onShow() {
    // 不是从激活工单跳转过来，而是直接微信扫码跳转的，重定向到运维首页
    if (this.data.fromPage !== 'ops-activate') {
      wx.showModal({
        title: '错误',
        content: '未检测到工单编码，请从运维中心首页进入',
        showCancel: false,
        confirmText: '返回首页',
        complete: () => {
          wx.reLaunch({
            url: '/pages/ops-center/ops-center'
          })
        }
      })
    }
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