// pages/ops-operator/ops-operator.js
const app = getApp()

Page({
  data: {
    keyword: '',
    myTenants: [],
    applyTenants: [],
    tabs: [{ title: '我的运营商', applyed: true }, { title: '加入运营商', applyed: false }],
    activeTab: 0
  },

  handleSearch(evt) {
    this.setData({
      keyword: evt.detail.value
    }, () => {
      this.selectComponent('.scrollerMyTenants').refresh()
      this.selectComponent('.scrollerApplyTenants').refresh()
    })
  },

  getTenants(isApplyed = true, pagination = { pageIndex: 1, limit: 10 }) {
    return app.getUserInfo().then(userinfo => {
      return app.$api['ops/getTenants']({
        isApplyed,
        openid: userinfo.openid,
        keyword: this.data.keyword,
        ...pagination
      }, { fullData: true })
    })
  },

  handleApply(evt) {
    console.log(evt.currentTarget.dataset)
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
    const isApplyed = evt.detail.extraData === 'myTenants'
    evt.detail.promise(
      this.getTenants(isApplyed, evt.detail.pagination)
        .then(res => {
          isApplyed ? this.setData({ myTenants: res.Data }) : this.setData({ applyTenants: res.Data })
          return res
        })
    )
  },

  /**
   * 加载更多
   * @param {Object} evt scroller 上拉加载更多的回调参数
   */
  onLoadMore(evt) {
    const isApplyed = evt.detail.extraData === 'myTenants'
    evt.detail.promise(
      this.getTenants(isApplyed, evt.detail.pagination)
        .then(res => {
          isApplyed ? this.setData({ myTenants: this.data.myTenants.concat(res.Data) }) : this.setData({ applyTenants: this.data.applyTenants.concat(res.Data) })
          return res
        })
    )
  }
})