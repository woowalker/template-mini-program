// pages/ops-repairdetail/ops-repairdetail.js
import queryString from 'query-string'

const app = getApp()

Page({
  data: {
    // REPAIR_TYPE_DOING REPAIR_TYPE_DONE
    ...app.$consts['OPS/REPAIR_TYPE'],
    repair: {},
    stakeCode: ''
  },

  onLoad(params) {
    // scene 是小程序码，普通二维码进来是带 code
    const scene = params.scene ? queryString.parse(decodeURIComponent(params.scene)) : { code: params.code }
    // 兼容带进来的属性是 id 情况
    this.setData({ stakeCode: scene.code || scene.id })
  },

  onShow() {
    this.getRepairDetail()
  },

  getRepairDetail() {
    app.showLoading()
    app.$api['ops/getRepairDetail']({
      code: this.data.stakeCode
    }).then(res => {
      if (res) {
        this.setData({ repair: res })
      } else {
        wx.showModal({
          content: '暂无可维修信息',
          showCancel: false,
          complete: () => {
            wx.navigateBack()
          }
        })
      }
    }).finally(() => {
      app.hideLoading()
    })
  },

  handleSolve() {
    app.getUserInfo().then(userinfo => {
      app.showLoading()
      app.$api['ops/repairStake']({
        code: this.data.repair.code,
        openid: userinfo.openid
      }).then(() => {
        wx.showModal({
          content: '提交成功',
          showCancel: false,
          complete: () => {
            this.getRepairDetail()
          }
        })
      }).finally(() => {
        app.hideLoading()
      })
    })
  }
})