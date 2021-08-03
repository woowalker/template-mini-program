// pages/mine/mine.js
const app = getApp()

Page({
  data: {
    userinfo: null,
    eCard: null,
    menus: [
      {
        text: '故障报修',
        value: 'fix',
        icon: '/images/mine/fix.png',
        pagePath: '/pages/error-report/error-report'
      },
      {
        text: '联系客服',
        value: 'contacts',
        icon: '/images/mine/contacts.png',
        pagePath: '/pages/contacts/contacts'
      },
      {
        text: '意见反馈',
        value: 'feedback',
        icon: '/images/mine/feedback.png'
      },
      {
        text: '我要分享',
        value: 'share',
        icon: '/images/mine/share.png'
      }
    ]
  },

  onShow() {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({ current: 2 })
    }
    this.getECardList()
  },

  getECardList() {
    app.getUserInfo({ navToLogin: false, silent: true }).then(userinfo => {
      this.setData({ userinfo })
      app.$api['mine/eCardList']({
        openid: userinfo.openid
      }).then(res => {
        res && res[0] && this.setData({ eCard: res[0] })
      })
    })
  },

  navToLogin() {
    !this.data.userinfo && wx.navigateTo({
      url: '/pages/login/login'
    })
  },

  handleECardBuy() {
    app.getUserInfo().then(() => {
      wx.navigateTo({
        url: '/pages/ecard-manage/ecard-manage?activeTab=1'
      })
    })
  },

  handleECardManage() {
    app.getUserInfo().then(() => {
      wx.navigateTo({
        url: '/pages/ecard-manage/ecard-manage'
      })
    })
  },

  handleECardCharge() {
    app.getUserInfo().then(() => {
      wx.navigateTo({
        url: '/pages/ecard-charge/ecard-charge?tenantCode=' + this.data.eCard.tenantCode
      })
    })
  },

  navToPage(evt) {
    app.getUserInfo().then(() => {
      const { value } = evt.currentTarget.dataset
      const find = this.data.menus.find(item => item.value === value)
      if (!find.pagePath) {
        wx.showModal({
          content: '敬请期待'
        })
        return
      }
      wx.navigateTo({ url: find.pagePath })
    })
  }
})