// pages/ops-center/ops-center.js
import Socket from '../../utils/socket'
import config from '../../plugins/api/config'

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
    ],
    socketIns: null
  },

  onLoad() {
    app.getUserInfo().then(userinfo => {
      app.$api['ops/getOPSInfo']({
        openid: userinfo.openid
      }).then(res => {
        this.setData({ userinfo: res })
      })
    })
    // socket 连接
    const socketIns = new Socket({
      url: config.socketUrl3242,
      onopen: (ins) => { this.handleSocketOpen(ins) },
      onmessage: (data) => { this.handleSocketMsg(data) }
    })
    this.setData({ socketIns })
  },

  onUnload() {
    const { socketIns } = this.data
    socketIns && socketIns.close()
  },

  handleSocketOpen(ins) {
    app.getUserInfo().then(userinfo => {
      const openedPayload = {
        TypeCode: 'P0001',
        Data: JSON.stringify({
          userid: userinfo.id,
          openid: userinfo.openid
        })
      }
      ins.send({ data: JSON.stringify(openedPayload) })
    })
  },

  handleSocketMsg(data) {
    if (data) {
      const { TypeCode, Data } = JSON.parse(data)
      if (TypeCode === 'MT001' && Data) {
        console.log('operator Data', Data)
      }
    }
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

  navToOperator() {
    app.getUserInfo().then(() => {
      wx.navigateTo({
        url: '/pages/ops-operator/ops-operator'
      })
    })
  },

  navToTicket(evt) {
    const { isOperator } = this.data.userinfo
    if (!isOperator) {
      wx.showModal({
        title: '温馨提示',
        content: '您还不是运维人员，是否立即申请？'
      }).then(res => {
        if (res.confirm) {
          this.navToOperator()
        }
      })
      return
    }
    app.getUserInfo().then(() => {
      const { value } = evt.currentTarget.dataset
      switch (value) {
        case this.data.TICKETS_TYPE_ACTIVATE:
          wx.navigateTo({
            url: '/pages/ops-activate/ops-activate'
          })
          break
        case this.data.TICKETS_TYPE_REPAIR:
          break
        case this.data.TICKETS_TYPE_MAINTAIN:
          break
      }
    })
  }
})