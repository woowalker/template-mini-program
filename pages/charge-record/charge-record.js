// pages/charge-record/charge-record.js
const app = getApp()

Page({
  data: {
    // ORDER_STATUS_UNPAY ORDER_STATUS_PAYED
    ...app.$consts['CHARGE/ORDER_STATUS'],
    records: [],
    // 支付
    visible: false,
    currRecord: {},
    // 是否已经自动加载过
    autoLoaded: false,
    // 分页参数
    pagination: {
      pageIndex: 1,
      limit: 10
    }
  },

  onShow() {
    if (!this.data.autoLoaded) {
      this.setData({ autoLoaded: true })
      return
    }
    // 从充电中页面返回时，重新拉取充电桩的相关信息
    this.getChargeRecord(false).then(res => {
      this.setData({ records: res.Data })
    })
  },

  /**
   * 获取充电订单记录
   * @param {boolean} silent 静默获取数据
   */
  getChargeRecord(silent = true) {
    return app.getUserInfo().then(userinfo => {
      return new Promise((resolve, reject) => {
        !silent && app.showLoading()
        app.$api['charge/chargeRecord'](
          {
            openid: userinfo.openid,
            ...this.data.pagination
          },
          { fullData: true }
        ).then(res => {
          res.Data = res.Data.map(item => {
            let statusFont, statusBtnFont
            switch (item.orderStatus) {
              case app.$consts['CHARGE/ORDER_STATUS_UNPAY']:
                statusFont = '未付款'
                statusBtnFont = '去支付'
                break
              default:
                statusFont = '已完成'
                statusBtnFont = '查看订单'
                break
            }
            return {
              ...item,
              statusFont,
              statusBtnFont
            }
          })
          resolve(res)
        }).catch(err => {
          reject(err)
        }).finally(() => {
          !silent && app.hideLoading()
        })
      })
    })
  },

  /**
   * 下拉刷新
   * @param {Object} evt scroller 下拉刷新的回调参数
   */
  onRefresh(evt) {
    this.setData({
      pagination: evt.detail.pagination
    }, () => {
      evt.detail.promise(
        this.getChargeRecord()
          .then(res => {
            this.setData({ records: res.Data })
            return res
          })
      )
    })
  },

  /**
   * 加载更多
   * @param {Object} evt scroller 上拉加载更多的回调参数
   */
  onLoadMore(evt) {
    this.setData({
      pagination: evt.detail.pagination
    }, () => {
      evt.detail.promise(
        this.getChargeRecord()
          .then(res => {
            this.setData({ records: this.data.records.concat(res.Data) })
            return res
          })
      )
    })
  },

  pay(evt) {
    const { value } = evt.currentTarget.dataset
    const find = this.data.records.find(item => item.code === value)
    if (find.orderStatus === app.$consts['CHARGE/ORDER_STATUS_PAYED']) {
      wx.navigateTo({
        url: '/pages/charge-detail/charge-detail?code=' + find.code
      })
      return
    }
    this.setData({ visible: true, currRecord: find })
  },

  payed() {
    this.setData({ visible: false }, () => {
      app.showToast('支付成功').then(() => {
        this.getChargeRecord(false).then(res => {
          this.setData({ records: res.Data })
        })
      })
    })
  },

  navToDetail(evt) {
    const { value } = evt.currentTarget.dataset
    wx.navigateTo({
      url: '/pages/charge-detail/charge-detail?code=' + value
    })
  }
})