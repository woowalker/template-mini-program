// pages/charge-detail/charge-detail.js
const app = getApp()

Page({
  data: {
    // ORDER_STATUS_UNPAY ORDER_STATUS_PAYED
    ...app.$consts['CHARGE/ORDER_STATUS'],
    recordCode: '',
    record: {},
    // 支付
    visible: false
  },

  onLoad(params) {
    this.setData({ recordCode: params.code })
    this.getRecordDetail()
  },

  /**
   * 下拉刷新
   */
  onPullDownRefresh() {
    this.getRecordDetail().finally(() => { wx.stopPullDownRefresh() })
  },

  getRecordDetail() {
    return app.$api['charge/recordDetail']({
      code: this.data.recordCode
    }).then(record => {
      this.setData({
        record: {
          ...record,
          statusFont: record.orderStatus === app.$consts['CHARGE/ORDER_STATUS_UNPAY'] ? '未付款' : '已完成',
          payTypeFont: record.payType === app.$consts['CHARGE/PAYMENT_TYPE_ECARD'] ? '电卡支付' : '微信支付'
        }
      })
    })
  },

  contacts() {
    wx.navigateTo({
      url: '/pages/contacts/contacts'
    })
  },

  delRecord() {
    wx.showModal({
      title: '删除订单',
      content: `确定删除该订单【${this.data.recordCode}】？`
    }).then(res => {
      if (res.confirm) {
        app.$api['charge/delRecord']({
          code: this.data.recordCode
        }).then(res => {
          app.showToast('删除成功').then(() => {
            wx.navigateBack()
          })
        })
      }
    })
  },

  pay() {
    this.setData({ visible: true })
  },

  payed() {
    this.setData({ visible: false }, () => {
      app.showToast('支付成功').then(() => {
        app.showLoading()
        this.getRecordDetail().finally(() => { app.hideLoading() })
      })
    })
  }
})