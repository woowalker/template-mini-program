// pages/ops-operator/ops-operator.js
import { cloneDeep } from 'lodash'

const app = getApp()

Page({
  data: {
    // AUDIT_TYPE_UNAPPLY AUDIT_TYPE_APPLYING AUDIT_TYPE_APPLYED
    ...app.$consts['OPS/AUDIT_TYPE'],
    myTenants: [],
    applyTenants: [],
    tabs: [{ title: '我的运营商', applyed: true }, { title: '加入运营商', applyed: false }],
    activeTab: 0,
    // 搜索
    keyword: '',
    pagination: {
      pageIndex: 1,
      limit: 10
    }
  },

  onLoad(params) {
    params?.activeTab && this.setData({ activeTab: Number(params.activeTab) })
  },

  handleSearch(evt) {
    this.setData({
      keyword: evt.detail.value
    }, () => {
      this.selectComponent('.scrollerMyTenants').refresh()
      this.selectComponent('.scrollerApplyTenants').refresh()
    })
  },

  getTenants(isApplyed = true) {
    return app.getUserInfo().then(userinfo => {
      return app.$api['ops/getTenants']({
        isApplyed,
        openid: userinfo.openid,
        keyword: this.data.keyword,
        ...this.data.pagination
      }, { fullData: true })
    })
  },

  handleApply(evt) {
    const { value } = evt.currentTarget.dataset
    const copyTenants = cloneDeep(this.data.applyTenants)
    const findIndex = copyTenants.findIndex(item => item.tenantCode === value)
    app.getUserInfo().then(userinfo => {
      wx.requestSubscribeMessage({
        tmplIds: [
          app.$consts['COMMON/SUBSCRIBE_OPS_NEWJOB'],
          app.$consts['COMMON/SUBSCRIBE_OPS_APPLY_RESULT']
        ],
        complete: () => {
          app.$api['ops/applyForOPS']({
            openid: userinfo.openid,
            tenantCode: copyTenants[findIndex].tenantCode,
            orgId: copyTenants[findIndex].orgId
          }).then(() => {
            wx.showModal({
              content: '申请成功，请等待审核',
              showCancel: false,
              complete: () => {
                copyTenants[findIndex].status = app.$consts['OPS/AUDIT_TYPE_APPLYING']
                this.setData({ applyTenants: copyTenants })
              }
            })
          })
        }
      })
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
    this.setData({
      pagination: evt.detail.pagination
    }, () => {
      const isApplyed = evt.detail.extraData === 'myTenants'
      evt.detail.promise(
        this.getTenants(isApplyed).then(res => {
          isApplyed ? this.setData({ myTenants: res.Data }) : this.setData({ applyTenants: res.Data })
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
      const isApplyed = evt.detail.extraData === 'myTenants'
      evt.detail.promise(
        this.getTenants(isApplyed).then(res => {
          isApplyed ? this.setData({ myTenants: this.data.myTenants.concat(res.Data) }) : this.setData({ applyTenants: this.data.applyTenants.concat(res.Data) })
          return res
        })
      )
    })
  }
})