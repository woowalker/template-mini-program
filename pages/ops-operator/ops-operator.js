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

  getMyTenants() {
    return app.getUserInfo().then(userinfo => {
      return app.$api['ops/getOPSInfo']({
        openid: userinfo.openid
      }).then(res => {
        return {
          Data: res.TenantInfos,
          TotalCount: res.TenantInfos.length
        }
      })
    })
  },

  getApplyTenants(pagination = { pageIndex: 1, limit: 10 }) {
    return app.$api['ops/getTenants']({
      keyword: this.data.keyword,
      ...pagination
    }, { fullData: true })
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
    if (evt.detail.extraData === 'myTenants') {
      evt.detail.promise(
        this.getMyTenants(evt.detail.pagination)
          .then(res => {
            this.setData({ myTenants: res.Data })
            return res
          })
      )
    } else {
      evt.detail.promise(
        this.getApplyTenants(evt.detail.pagination)
          .then(res => {
            this.setData({ applyTenants: res.Data })
            return res
          })
      )
    }
  },

  /**
   * 加载更多
   * @param {Object} evt scroller 上拉加载更多的回调参数
   */
  onLoadMore(evt) {
    evt.detail.promise(
      this.getApplyTenants(evt.detail.pagination)
        .then(res => {
          this.setData({ applyTenants: this.data.applyTenants.concat(res.Data) })
          return res
        })
    )
  }
})