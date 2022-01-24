// pages/ops-repair/ops-repair.js
import scanCode from '../../utils/scanCode'
import queryString from 'query-string'

const app = getApp()

Page({
  data: {
    // REPAIR_TYPE_DOING REPAIR_TYPE_DONE
    ...app.$consts['OPS/REPAIR_TYPE'],
    repairs: [],
    autoLoaded: false,
    pagination: {
      pageIndex: 1,
      limit: 10
    }
  },

  onLoad() {
    app.$$EE.addListener(app.$consts['COMMON/EVENT_OPS_REPAIR_UPDATE'], this.handleSocketUpdate)
  },

  onShow() {
    if (this.data.autoLoaded) {
      const { pageIndex, limit } = this.data.pagination
      const pageParams = {
        pageIndex: 1,
        limit: pageIndex * limit
      }
      // 扫码激活返回后，更新列表数据
      this.getRepairs(false, pageParams).then(res => {
        this.setData({ repairs: res.Data })
      })
    }
  },

  onUnload() {
    app.$$EE.removeListener(app.$consts['COMMON/EVENT_OPS_REPAIR_UPDATE'], this.handleSocketUpdate)
  },

  handleSocketUpdate(msg) {
    wx.showModal({
      content: msg || '有新的维修工单',
      showCancel: false,
      confirmText: '立即刷新',
      complete: () => {
        this.selectComponent('.refOfScroller').refresh()
      }
    })
  },

  navToRepair(evt) {
    const { value } = evt.currentTarget.dataset
    const repair = this.data.repairs.find(item => item.code === value)
    wx.navigateTo({ url: `/pages/ops-repairdetail/ops-repairdetail?code=${repair.code}&stakeCode=${repair.stakeCode}` })
  },

  scanError() {
    app.showToast('未检测到桩号', 'error')
  },

  scanToRepair() {
    scanCode().then(res => {
      if (res?.result) {
        const query = queryString.parseUrl(res.result).query
        if (query.code) {
          wx.navigateTo({ url: `/pages/ops-repairdetail/ops-repairdetail?stakeCode=${query.code}` })
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
   * 获取维修工单记录
   * @param {boolean} silent 静默获取数据
   * @param {Object} pagination 分页参数
   */
  getRepairs(silent = true, pagination) {
    return app.getUserInfo().then(userinfo => {
      return new Promise((resolve, reject) => {
        !silent && app.showLoading()

        const pageParams = pagination || this.data.pagination
        app.$api['ops/getRepairs'](
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
        this.getRepairs()
          .then(res => {
            this.setData({ repairs: res.Data })
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
        this.getRepairs()
          .then(res => {
            this.setData({ repairs: this.data.repairs.concat(res.Data) })
            return res
          })
      )
    })
  }
})