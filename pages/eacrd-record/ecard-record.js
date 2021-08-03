// pages/eacrd-record/ecard-record.js
const app = getApp()

Page({
  data: {
    // ECARD_RECORD_STATUS_ON ECARD_RECORD_STATUS_SUCCESS ECARD_RECORD_STATUS_FAIL
    ...app.$consts['MINE/ECARD_RECORD_STATUS'],
    records: []
  },

  getChargeRecord(pagination) {
    return app.getUserInfo().then(userinfo => {
      return app.$api['mine/eCardRecord'](
        {
          openid: userinfo.openid,
          ...pagination
        },
        { fullData: true }
      ).then(res => {
        res.Data = res.Data.map(item => {
          let statusFont
          switch (item.status) {
            case app.$consts['MINE/ECARD_RECORD_STATUS_ON']:
              statusFont = '充值中'
              break
            case app.$consts['MINE/ECARD_RECORD_STATUS_FAIL']:
              statusFont = '充值失败'
              break
            default:
              statusFont = '充值成功'
              break
          }
          return {
            ...item,
            statusFont
          }
        })
        return res
      })
    })
  },

  /**
   * 下拉刷新
   * @param {Object} evt scroller 下拉刷新的回调参数
   */
  onRefresh(evt) {
    evt.detail.promise(
      this.getChargeRecord(evt.detail.pagination)
        .then(res => {
          this.setData({ records: res.Data })
          return res
        })
    )
  },

  /**
   * 加载更多
   * @param {Object} evt scroller 上拉加载更多的回调参数
   */
  onLoadMore(evt) {
    evt.detail.promise(
      this.getChargeRecord(evt.detail.pagination)
        .then(res => {
          this.setData({ records: this.data.records.concat(res.Data) })
          return res
        })
    )
  }
})