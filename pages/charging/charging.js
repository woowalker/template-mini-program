// pages/charging/charging.js
import Socket from '../../utils/socket'
import config from '../../plugins/api/config'
import dayjs from 'dayjs'

const app = getApp()

Page({
  data: {
    // CHARGING_STATUS_ERROR CHARGING_STATUS_CHARGING CHARGING_STATUS_DONE
    ...app.$consts['CHARGE/CHARGING_STATUS'],
    // 充电详情
    detail: {
      code: '',
      tenantCode: '',
      stake: {
        stakeCode: '加载中...'
      },
      amount: 0.00, // 预估金额
      time: '', // 充电开始时间
      used: 0 // 用电量
    },
    // 已充时长
    chargingTime: null,
    // 充电模式与时长金额
    chargeModeFont: '充满',
    // 支付
    visible: false,
    // socket
    socketIns: null,
    // loading
    show: false,
    loadingText: '硬件通信中...'
  },

  timer: -1,

  onLoad() {
    const socketIns = new Socket({
      url: config.socketUrl,
      onopen: (ins) => { this.handleSocketOpen(ins) },
      onmessage: (data) => { this.handleSocketMsg(data) }
    })
    this.setData({ socketIns })
  },

  onShow() {
    const { socketIns } = this.data
    socketIns && this.handleSocketOpen(socketIns)
  },

  onUnload() {
    const { socketIns } = this.data
    socketIns && socketIns.close()
    this.stopTimeCount()
  },

  checkChargingTime(startTime) {
    if (!startTime) {
      this.setData({ chargingTime: '00:00:00' })
      return
    }

    const diff = dayjs().diff(startTime, 'second')
    const hours = Math.floor(diff / 3600)
    const minutes = Math.floor((diff - hours * 3600) / 60)
    const seconds = diff - hours * 3600 - minutes * 60
    const chargingTime = `${hours < 10 ? '0' + hours : hours}:${minutes < 10 ? '0' + minutes : minutes}:${seconds < 10 ? '0' + seconds : seconds}`
    this.setData({ chargingTime })
  },

  startTimeCount() {
    this.timer = setInterval(() => {
      this.checkChargingTime(this.data.detail.time)
    }, 1000)
  },

  stopTimeCount() {
    clearInterval(this.timer)
  },

  handleSocketOpen(ins) {
    app.getUserInfo().then(userinfo => {
      !this.data.detail.code && this.setData({ show: true })

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
      if (TypeCode === 'MQ01' && Data) {
        this.setData({ show: false })

        const { status, message, data: detail } = Data
        // 停止前端计时，并计算充电时长
        this.stopTimeCount()
        this.checkChargingTime(detail.time)

        // 检测订单状态
        if (detail && detail.orderStatus === app.$consts['CHARGE/ORDER_STATUS_UNPAY']) {
          wx.showModal({
            title: '充电已结束',
            content: `请支付本次充电费用：${detail.amount} 元`,
            showCancel: false,
            confirmText: '立即支付',
            complete: () => {
              this.setData({ detail, visible: true })
            }
          })
          return
        }
        if (status === this.data.CHARGING_STATUS_ERROR) {
          wx.showModal({
            title: '充电异常',
            content: message,
            showCancel: false,
            complete: () => {
              wx.navigateBack()
            }
          })
          return
        }
        if (status === this.data.CHARGING_STATUS_DONE) {
          wx.showModal({
            title: '充电已结束',
            content: '是否立即查看充电订单'
          }).then(res => {
            if (res.confirm) {
              wx.navigateTo({ url: '/pages/charge-detail/charge-detail?code=' + detail.code })
            } else {
              wx.navigateBack()
            }
          })
          return
        }

        // 充电中
        const { chargeMode, chargeMoney, chargeTime } = detail
        let chargeModeFont
        switch (chargeMode) {
          case app.$consts['CHARGE/CHARGE_MODE_MONEY']:
            chargeModeFont = `固定金额 ${chargeMoney} 元`
            break
          case app.$consts['CHARGE/CHARGE_MODE_TIME']:
            chargeModeFont = `固定时长 ${chargeTime}`
            break
          default:
            chargeModeFont = '充满模式'
            break
        }
        this.setData({
          detail,
          chargeModeFont
        }, this.startTimeCount)
      }
    }
  },

  handleChargingStop() {
    const { detail, socketIns } = this.data
    if (!detail.code) {
      app.showToast('订单不存在', 'error')
      return
    }
    app.getUserInfo().then(userinfo => {
      this.setData({ show: true })

      const stopPayload = {
        TypeCode: 'MQ02',
        Data: JSON.stringify({
          code: detail.code,
          openid: userinfo.openid
        })
      }
      socketIns.send({ data: JSON.stringify(stopPayload) })
    })
  },

  payed() {
    this.setData({ visible: false }, () => {
      wx.showModal({
        content: '支付成功',
        showCancel: false,
        complete: () => {
          wx.redirectTo({
            url: '/pages/charge-detail/charge-detail?code=' + this.data.detail.code
          })
        }
      })
    })
  }
})