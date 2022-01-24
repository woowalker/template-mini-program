// pages/ops-activate/ops-activate.js
import scanCode from '../../utils/scanCode'
import queryString from 'query-string'

const app = getApp()

Page({
  data: {
    // ACTIVATE_TYPE_DOING ACTIVATE_TYPE_DONE
    ...app.$consts['OPS/ACTIVATE_TYPE'],
    activates: [],
    autoLoaded: false,
    pagination: {
      pageIndex: 1,
      limit: 10
    }
  },

  onLoad() {
    app.$$EE.addListener(app.$consts['COMMON/EVENT_OPS_ACTIVATE_UPDATE'], this.handleSocketUpdate)
  },

  onShow() {
    if (this.data.autoLoaded) {
      const { pageIndex, limit } = this.data.pagination
      const pageParams = {
        pageIndex: 1,
        limit: pageIndex * limit
      }
      // 扫码激活返回后，更新列表数据
      this.getActivates(false, pageParams).then(res => {
        this.setData({ activates: res.Data })
      })
    }
  },

  onUnload() {
    app.$$EE.removeListener(app.$consts['COMMON/EVENT_OPS_ACTIVATE_UPDATE'], this.handleSocketUpdate)
  },

  handleSocketUpdate(msg) {
    wx.showModal({
      content: msg || '有新的激活工单',
      showCancel: false,
      confirmText: '立即刷新',
      complete: () => {
        this.selectComponent('.refOfScroller').refresh()
      }
    })
  },

  scanError() {
    app.showToast('未检测到桩号', 'error')
  },

  scanToActivate(evt) {
    const { value } = evt.currentTarget.dataset
    const activate = this.data.activates.find(item => item.code === value)
    scanCode().then(res => {
      if (res?.result) {
        const query = queryString.parseUrl(res.result).query
        if (query.sequence) {
          wx.navigateTo({
            url: `/pages/ops-scanactive/ops-scanactive?sequence=${query.sequence}&fromPage=ops-activate`
          }).then(evt => {
            evt.eventChannel.emit(app.$consts['COMMON/EVENT_NAV_PAGE'], { activate })
          })
        } else {
          this.scanError()
        }
      } else {
        this.scanError()
      }
    }).catch(() => {
      this.scanError()
    })
  },

  /**
   * 获取激活工单记录
   * @param {boolean} silent 静默获取数据
   * @param {Object} pagination 分页参数
   */
  getActivates(silent = true, pagination) {
    return app.getUserInfo().then(userinfo => {
      return new Promise((resolve, reject) => {
        !silent && app.showLoading()

        const pageParams = pagination || this.data.pagination
        app.$api['ops/getActivates'](
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
        this.getActivates()
          .then(res => {
            this.setData({ activates: res.Data })
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
        this.getActivates()
          .then(res => {
            this.setData({ activates: this.data.activates.concat(res.Data) })
            return res
          })
      )
    })
  }
})