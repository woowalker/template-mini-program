// pages/ops-maintain/ops-maintain.js
import scanCode from '../../utils/scanCode'
import queryString from 'query-string'

const app = getApp()

Page({
  data: {
    // MAINTAIN_TYPE_WAIT MAINTAIN_TYPE_DOING MAINTAIN_TYPE_DONE
    ...app.$consts['OPS/MAINTAIN_TYPE'],
    maintains: [],
    autoLoaded: false,
    pagination: {
      pageIndex: 1,
      limit: 10
    }
  },

  onLoad() {
    app.$$EE.addListener(app.$consts['COMMON/EVENT_OPS_MAINTAIN_UPDATE'], this.handleSocketUpdate)
  },

  onShow() {
    if (this.data.autoLoaded) {
      const { pageIndex, limit } = this.data.pagination
      const pageParams = {
        pageIndex: 1,
        limit: pageIndex * limit
      }
      // 扫码激活返回后，更新列表数据
      this.getMaintains(false, pageParams).then(res => {
        this.setData({ maintains: res.Data })
      })
    }
  },

  onUnload() {
    app.$$EE.removeListener(app.$consts['COMMON/EVENT_OPS_MAINTAIN_UPDATE'], this.handleSocketUpdate)
  },

  handleSocketUpdate(msg) {
    wx.showModal({
      content: msg,
      showCancel: false,
      confirmText: '立即刷新',
      complete: () => {
        this.selectComponent('.refOfScroller').refresh()
      }
    })
  },

  navToMaintain(evt) {
    const { value } = evt.currentTarget.dataset
    const maintain = this.data.maintains.find(item => item.code === value)
    wx.navigateTo({ url: `/pages/ops-maintaindetail/ops-maintaindetail?code=${maintain.code}&stakeCode=${maintain.stakeCode}` })
  },

  scanToMaintain() {
    scanCode().then(res => {
      if (res?.result) {
        const query = queryString.parseUrl(res.result).query
        if (query.code) {
          wx.navigateTo({ url: `/pages/ops-maintaindetail/ops-maintaindetail?stakeCode=${query.code}` })
        } else {
          app.showToast('识别失败', 'error')
        }
      } else {
        app.showToast('识别失败', 'error')
      }
    }).catch(() => {
      app.showToast('识别失败', 'error')
    })
  },

  /**
   * 获取保养工单记录
   * @param {boolean} silent 静默获取数据
   * @param {Object} pagination 分页参数
   */
  getMaintains(silent = true, pagination) {
    return app.getUserInfo().then(userinfo => {
      return new Promise((resolve, reject) => {
        !silent && app.showLoading()

        const pageParams = pagination || this.data.pagination
        app.$api['ops/getMaintains'](
          { openid: userinfo.openid, ...pageParams },
          { fullData: true }
        ).then(res => {
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
      autoLoaded: true,
      pagination: evt.detail.pagination
    }, () => {
      evt.detail.promise(
        this.getMaintains()
          .then(res => {
            this.setData({ maintains: res.Data })
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
        this.getMaintains()
          .then(res => {
            this.setData({ maintains: this.data.maintains.concat(res.Data) })
            return res
          })
      )
    })
  }
})