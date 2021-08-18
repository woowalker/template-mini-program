// pages/ecard-manage/ecard-manage.js
import { uuid } from '../../utils/common'

const app = getApp()

Page({
  data: {
    keyword: '',
    myCards: [],
    salesCards: [],
    tabs: [{ title: '我的电卡', isbuy: true }, { title: '电卡购买', isbuy: false }],
    activeTab: 0
  },

  onLoad(params) {
    params?.activeTab && this.setData({ activeTab: Number(params.activeTab) })
  },

  handleSearch(evt) {
    this.setData({
      keyword: evt.detail.value
    }, () => {
      this.selectComponent('.scrollerMyCards').refresh()
      this.selectComponent('.scrollerSalesCard').refresh()
    })
  },

  getCards(isbuy = true, pagination = { pageIndex: 1, limit: 10 }) {
    return app.getUserInfo().then(userinfo => {
      return app.$api['mine/eCardList']({
        isbuy,
        openid: userinfo.openid,
        keyword: this.data.keyword,
        ...pagination
      }, { fullData: true })
    })
  },

  handleECardCharge(evt) {
    const { value } = evt.currentTarget.dataset
    wx.navigateTo({
      url: '/pages/ecard-charge/ecard-charge?tenantCode=' + value
    })
  },

  handleECardBuy(evt) {
    const { value } = evt.currentTarget.dataset
    const find = this.data.salesCards.find(card => card.tenantCode === value)
    wx.showModal({
      title: '电卡购买',
      content: `确定购买电卡：${find.tenantName}？`
    }).then(res => {
      if (res.confirm) {
        app.getUserInfo().then(userinfo => {
          app.showLoading()
          app.$api['mine/eCardBuy']({
            openid: userinfo.openid,
            tenantCode: find.tenantCode
          }).then(() => {
            this.setData({
              activeTab: 0
            }, () => {
              app.showToast('购买成功')
              // 定时提高动画表现
              setTimeout(() => {
                this.selectComponent('.scrollerMyCards').refresh()
                this.selectComponent('.scrollerSalesCard').refresh()
              }, 200)
            })
          }).finally(() => {
            app.hideLoading()
          })
        })
      }
    })
  },

  checkData(data) {
    return data.map(item => {
      const { cardNo = uuid(), fullminus, useRange } = item
      return {
        ...item,
        cardNo,
        discounts: fullminus?.length ? fullminus.map(dis => `满${dis.full}减${dis.reduce}`).join(' ') : '',
        useRange: useRange?.length ? useRange.join(' ') : ''
      }
    })
  },

  onChange(e) {
    const { value: activeTab } = e.detail
    this.setData({ activeTab })
  },

  /**
   * 下拉刷新
   * @param {Object} evt scroller 下拉刷新的回调参数
   */
  onRefresh(evt) {
    const isbuy = evt.detail.extraData === 'myCards'
    evt.detail.promise(
      this.getCards(isbuy, evt.detail.pagination)
        .then(res => {
          isbuy ? this.setData({ myCards: this.checkData(res.Data) }) : this.setData({ salesCards: this.checkData(res.Data) })
          return res
        })
    )
  },

  /**
   * 加载更多
   * @param {Object} evt scroller 上拉加载更多的回调参数
   */
  onLoadMore(evt) {
    const isbuy = evt.detail.extraData === 'myCards'
    evt.detail.promise(
      this.getCards(isbuy, evt.detail.pagination)
        .then(res => {
          isbuy ? this.setData({ myCards: this.data.myCards.concat(this.checkData(res.Data)) }) : this.setData({ salesCards: this.data.salesCards.concat(this.checkData(res.Data)) })
          return res
        })
    )
  }
})