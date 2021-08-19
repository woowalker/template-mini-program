// pages/ops-center/ops-center.js
import Socket from '../../utils/socket'
import config from '../../plugins/api/config'

const app = getApp()

Page({
  data: {
    // TICKETS_TYPE_ACTIVATE TICKETS_TYPE_REPAIR TICKETS_TYPE_MAINTAIN TICKETS_TYPE_AUDIT_STATUS
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
    // 更新工单数量
    const { openid } = this.data.operator
    openid && this.getTaskNumber(openid)
  },

  onUnload() {
    const { socketIns } = this.data
    socketIns && socketIns.close()
    app.$$EE.removeListener(app.$consts['COMMON/EVENT_SESSION_CHECK_DONE'], this.getData)
  },

  getData(socket = true) {
    app.getUserInfo().then(userinfo => {
      this.getOPSInfo(userinfo.openid)
      this.getTaskNumber(userinfo.openid)
      return userinfo
    }).then(userinfo => {
      if (!socket) return
      // socket 连接
      const socketIns = new Socket({
        url: config.socketUrl3242,
        onopen: (ins) => { this.handleSocketOpen(ins, userinfo) },
        onmessage: (data) => { this.handleSocketMsg(data) }
      })
      this.setData({ socketIns })
    })
  },

  getOPSInfo(openid) {
    return app.$api['ops/getOPSInfo']({ openid }).then(operator => {
      this.setData({ operator })
    })
  },

  getTaskNumber(openid) {
    app.$api['ops/getTaskNumber']({ openid }).then(res => {
      const tickets = this.data.tickets.map(item => {
        const find = res.find(resItem => resItem.orderType === item.orderType)
        return {
          ...item,
          count: find ? find.count : item.count
        }
      })
      this.setData({ tickets })
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
        // 当前页面为非列表页，则 toast 提醒
        let matchPage = false
        const pages = getCurrentPages()
        console.log('pages[pages.length - 1].route', pages[pages.length - 1].route)
        // 处理 socket 消息
        const { Description, Updates } = Data
        Updates.forEach(item => {
          switch (item.orderType) {
            case this.data.TICKETS_TYPE_ACTIVATE:
              matchPage = pages[pages.length - 1].route === 'pages/ops-activate/ops-activate'
              matchPage && app.$$EE.emit(app.$consts['COMMON/EVENT_OPS_ACTIVATE_UPDATE'], Description)
              break
            case this.data.TICKETS_TYPE_REPAIR:
              matchPage = pages[pages.length - 1].route === 'pages/ops-repair/ops-repair'
              matchPage && app.$$EE.emit(app.$consts['COMMON/EVENT_OPS_REPAIR_UPDATE'], Description)
              break
            case this.data.TICKETS_TYPE_MAINTAIN:
              matchPage = pages[pages.length - 1].route === 'pages/ops-maintain/ops-maintain'
              matchPage && app.$$EE.emit(app.$consts['COMMON/EVENT_OPS_MAINTAIN_UPDATE'], Description)
              break
            case this.data.TICKETS_TYPE_AUDIT_STATUS:
              matchPage = pages[pages.length - 1].route === 'pages/ops-operator/ops-operator'
              matchPage && app.$$EE.emit(app.$consts['COMMON/EVENT_OPS_AUDITSTATUS_UPDATE'], Description)
              break
          }
        })

        !matchPage && app.showToast(Description, 'none', false, 5000)
        // 强震动提醒
        wx.vibrateLong()
        // 更新首页数据
        this.getData(false)
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
          wx.navigateTo({
            url: '/pages/ops-repair/ops-repair'
          })
          break
        case this.data.TICKETS_TYPE_MAINTAIN:
          wx.navigateTo({
            url: '/pages/ops-maintain/ops-maintain'
          })
          break
      }
    })
  }
})