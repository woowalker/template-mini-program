// pages/ops-repairdetail/ops-repairdetail.js
import queryString from 'query-string'

const app = getApp()

Page({
  data: {
    // REPAIR_TYPE_DOING REPAIR_TYPE_DONE
    ...app.$consts['OPS/REPAIR_TYPE'],
    repair: {},
    code: '', // 工单号
    stakeCode: '' // 充电桩编码
  },

  onLoad(params) {
    if (params.scene) {
      const scene = queryString.parse(decodeURIComponent(params.scene))
      this.setData({ stakeCode: scene.code })
    } else {
      this.setData({ code: params.code, stakeCode: params.stakeCode })
    }
  },

  onShow() {
    this.getRepairDetail()
  },

  getRepairDetail() {
    app.getUserInfo().then(userinfo => {
      app.showLoading()
      app.$api['ops/getRepairDetail']({
        code: this.data.code,
        stakeCode: this.data.stakeCode,
        openid: userinfo.openid
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