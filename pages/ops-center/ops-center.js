// pages/ops-center/ops-center.js
import Socket from '../../utils/socket'
import config from '../../plugins/api/config'

const app = getApp()

Page({
  data: {
    // TICKETS_TYPE_ACTIVATE TICKETS_TYPE_REPAIR TICKETS_TYPE_MAINTAIN
    ...app.$consts['OPS/TICKETS_TYPE'],
    operator: {
      UserInfo: {},
      openid: '',
      isOperator: false
    },
    tickets: [
      {
        text: '安装激活',
        orderType: app.$consts['OPS/TICKETS_TYPE_ACTIVATE'],
        icon: '/images/ops/activate.png',
        count: 0
      },
      {
        text: '故障维修',
        icon: '/images/ops/repair.png',
        orderType: app.$consts['OPS/TICKETS_TYPE_REPAIR'],
        count: 0
      },
      {
        text: '定时保养',
        orderType: app.$consts['OPS/TICKETS_TYPE_MAINTAIN'],
        icon: '/images/ops/maintain.png',
        count: 0
      }
    ],
    socketIns: null
  },

  onLoad() {
    if (!app.data.sessionCheckDone) {
      app.$$EE.addListener(app.$consts['COMMON/EVENT_SESSION_CHECK_DONE'], this.getData)
    } else {
      this.getData()
    }
  },

  onShow() {
    const { openid } = this.data.operator
    if (openid) {
      // 更新工单数量
      app.$api['ops/getTaskNumber']({ openid }).then(res => {
        const tickets = this.data.tickets.map(item => {
          const find = res.find(task => task.orderType === item.orderType)
          return {
            ...item,
            count: find ? find.count : item.count
          }
        })
        this.setData({ tickets })
      })
    }
  },

  onUnload() {
    const { socketIns } = this.data
    socketIns && socketIns.close()
    app.$$EE.removeListener(app.$consts['COMMON/EVENT_SESSION_CHECK_DONE'], this.getData)
  },

  getData() {
    app.getUserInfo().then(userinfo => {
      Promise.all([
        app.$api['ops/getOPSInfo']({ openid: userinfo.openid }),
        app.$api['ops/getTaskNumber']({ openid: userinfo.openid })
      ]).then(datas => {
        // socket 连接
        const socketIns = new Socket({
          url: config.socketUrl3242,
          onopen: (ins) => { this.handleSocketOpen(ins, userinfo) },
          onmessage: (data) => { this.handleSocketMsg(data) }
        })
        const [operator, tasks] = datas
        const tickets = this.data.tickets.map(item => {
          const find = tasks.find(task => task.orderType === item.orderType)
          return {
            ...item,
            count: find ? find.count : item.count
          }
        })
        this.setData({ operator, tickets, socketIns })
      })
    })
  },

  handleSocketOpen(ins, userinfo) {
    const openedPayload = {
      TypeCode: 'P0001',
      Data: JSON.stringify({
        userid: userinfo.id,
        openid: userinfo.openid
      })
    }
    ins.send({ data: JSON.stringify(openedPayload) })
  },

  handleSocketMsg(data) {
    if (data) {
      const { TypeCode, Data } = JSON.parse(data)
      if (TypeCode === 'MT001' && Data) {
        const { Description, Updates } = Data

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

  navToOperator(activeTab = 0) {
    app.getUserInfo().then(() => {
      wx.navigateTo({
        url: '/pages/ops-operator/ops-operator?activeTab=' + activeTab
      })
    })
  },

  navToTicket(evt) {
    const { isOperator } = this.data.operator
    if (!isOperator) {
      wx.showModal({
        title: '温馨提示',
        content: '您还不是运维人员，是否立即申请？'
      }).then(res => {
        if (res.confirm) {
          this.navToOperator(1)
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