// pages/ops-center/ops-center.js
const app = getApp()

Page({
  data: {
    userinfo: {
      UserInfo: {},
      isOperator: false
    },
    // TICKETS_TYPE_ACTIVATE TICKETS_TYPE_REPAIR TICKETS_TYPE_MAINTAIN
    ...app.$consts['OPS/TICKETS_TYPE'],
    tickets: [
      {
        text: '安装激活',
        value: app.$consts['OPS/TICKETS_TYPE_ACTIVATE'],
        icon: '/images/ops/activate.png',
        counts: 0
      },
      {
        text: '故障维修',
        icon: '/images/ops/repair.png',
        value: app.$consts['OPS/TICKETS_TYPE_REPAIR'],
        counts: 0
      },
      {
        text: '定时保养',
        value: app.$consts['OPS/TICKETS_TYPE_MAINTAIN'],
        icon: '/images/ops/maintain.png',
        counts: 0
      }
    ]
  },

  onLoad() {
    this.getUserinfo()
  },

  getUserinfo() {
    app.getUserInfo().then(userinfo => {
      app.$api['ops/getUserinfo']({
        openid: userinfo.openid
      }).then(res => {
        this.setData({ userinfo: res })
      })
    })
  },

  rechange() {
    wx.showModal({
      title: '温馨提示',
      content: '是否立即切换为普通用户？'
    }).then(res => {
      if (res.confirm) {
        wx.reLaunch({
          url: '/pages/index/index'
        })
      }
    })
  },

  navToOperator() { },

  navToTicket(evt) {
    console.log('evt', evt.currentTarget.dataset)
    const { isOperator } = this.data.userinfo
    if (!isOperator) {
      wx.showModal({
        title: '温馨提示',
        content: '您还不是运维人员，是否立即申请？'
      }).then(res => {
        if (res.confirm) {

        }
      })
      return
    }
  }
})