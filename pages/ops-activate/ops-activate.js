// pages/ops-activate/ops-activate.js
import scanCode from '../../utils/scanCode'

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

  scanToActivate(evt) {
    const { value } = evt.currentTarget.dataset
    const activate = this.data.activates.find(item => item.code === value)
    scanCode().then(res => {
      if (res.path) {
        const url = res.path.substring(0, 1) !== '/' ? `/${res.path}` : res.path
        wx.navigateTo({ url }).then(event => {
          event.eventChannel.emit(app.$consts['COMMON/EVENT_NAV_PAGE'], { activate })
        })
      } else {
        app.showToast('识别失败', 'error')
      }
    }).catch(() => {
      app.showToast('识别失败', 'error')
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