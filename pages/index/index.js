// pages/index/index.js
import scanCode from '../../utils/scanCode'

const app = getApp()

Page({
  data: {
    swiperHeader: [
      {
        key: 'swiperHeader__1',
        src: '/images/placeholder/bgpicture.png'
      }
    ],
    navOrders: [
      {
        text: '进行中订单',
        value: 'ordering',
        icon: '/images/home/ording.png'
      },
      {
        text: '收藏站点',
        value: 'favorite',
        icon: '/images/home/remark.png',
        pagePath: '/pages/favorite-park/favorite-park'
      },
      {
        text: '订单记录',
        value: 'record',
        icon: '/images/home/record.png',
        pagePath: '/pages/charge-record/charge-record'
      }
    ],
    msgNotices: [
      {
        key: 'msgNotice__1',
        font: '数据加载中...'
      }
    ],
    swiperAttach: [
      {
        key: 'swiperAttach__1',
        src: '/images/placeholder/bgpicture.png'
      }
    ],
    // 输入桩号充电
    visible: false,
    stakeCode: '',
    buttons: [{ text: '取消', extClass: 'fz-32' }, { text: '确定', extClass: 'fz-32' }]
  },

  onShow() {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({ current: 0 })
    }
    this.getData()
  },

  getData() {
    app.$api['home/getHomePage']().then(res => {
      const { topPs, lowPs, notices } = res
      this.setData({
        swiperHeader: topPs.map((item, index) => ({ key: `swiperHeader__${index}`, src: `data:image/png;base64,${item}` })),
        swiperAttach: lowPs.map((item, index) => ({ key: `swiperAttach__${index}`, src: `data:image/png;base64,${item}` })),
        msgNotices: notices.map((item, index) => ({ key: `msgNotice__${index}`, font: item }))
      })
    })
  },

  navToPage(evt) {
    const { value } = evt.currentTarget.dataset
    const find = this.data.navOrders.find(item => item.value === value)
    if (value === 'ordering') {
      app.getUserOrdering().then(() => {
        wx.showModal({
          title: '温馨提示',
          content: '暂无进行中订单',
          showCancel: false
        })
      })
      return
    }
    app.getUserInfo().then(() => {
      wx.navigateTo({ url: find.pagePath })
    })
  },

  charging() {
    app.getUserOrdering().then(() => {
      scanCode().then(res => {
        if (res.path) {
          const url = res.path.substring(0, 1) !== '/' ? `/${res.path}` : res.path
          wx.navigateTo({ url })
        } else {
          app.showToast('未检测到桩号', 'error').then(() => {
            this.setData({ visible: true })
          })
        }
      }).catch(() => {
        app.showToast('未检测到桩号', 'error').then(() => {
          this.setData({ visible: true })
        })
      })
    })
  },

  showCustomDialog() {
    app.getUserOrdering().then(() => {
      this.setData({ visible: true })
    })
  },

  handleCustomInput(evt) {
    this.setData({ stakeCode: evt.detail.value })
  },

  customCharing(evt) {
    const { index } = evt.detail
    if (index === 0) {
      this.setData({ visible: false })
      return
    }
    if (!this.data.stakeCode) {
      app.showToast('充电桩号不能为空', 'none')
      return
    }
    this.setData({ visible: false }, () => {
      wx.navigateTo({
        url: '/pages/stake/stake?code=' + this.data.stakeCode
      })
    })
  }
})
