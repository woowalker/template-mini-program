// pages/charging/charging.js
import dayjs from 'dayjs'

const app = getApp()

Page({
  data: {
    // CHARGING_STATUS_ERROR CHARGING_STATUS_CHARGING CHARGING_STATUS_DONE
    ...app.$consts['CHARGE/CHARGING_STATUS'],
    // 用户信息
    userinfo: {},
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
    // loading
    show: false,
    loadingText: '硬件通信中...'
  },

  // 初次建立连接时展现 loading，之后的轮询不再显示 loading
  initLoadingShow: false,

  // 是否被卸载
  isUnload: false,

  // 获取详情定时器
  detailTimer: -1,

  // 本地计时时长定时器
  timer: -1,

  onLoad() {
    app.getUserInfo().then(userinfo => {
      this.initLoadingShow = true
      this.setData({
        userinfo,
        show: true
      }, this.getChargingDetail)
    })
  },

  onUnload() {
    this.isUnload = true
    this.stopDetailCount()
    this.stopTimeCount()
  },

  // 获取充电详情
  getChargingDetail() {
    if (this.isUnload) return

    app.$api['charge/chargingDetail']({
      clientId: this.data.userinfo.id
    }).then(data => {
      // 更新充电详情
      const detail = data.data
      const { chargeMode, chargeMoney, chargeTime, time } = detail
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
        chargingTime: this.getChargingTime(time),
        chargeModeFont
      })
      this.initLoadingShow && this.setData({ show: false }, () => { this.initLoadingShow = false })
      return data
    }).then(data => {
      // 检查订单状态
      const { status, message, data: detail } = data
      // 订单状态未支付
      if (detail && detail.orderStatus === app.$consts['CHARGE/ORDER_STATUS_UNPAY']) {
        wx.showModal({
          title: '充电已结束',
          content: `请支付本次充电费用：${detail.amount} 元`,
          showCancel: false,
          confirmText: '立即支付',
          complete: () => {
            this.setData({ visible: true })
          }
        })
        return true
      }
      // 订单错误
      if (status === this.data.CHARGING_STATUS_ERROR) {
        wx.showModal({
          title: '充电异常',
          content: message,
          showCancel: false,
          complete: () => {
            wx.navigateBack()
          }
        })
        return true
      }
      // 充电结束
      if (status === this.data.CHARGING_STATUS_DONE) {
        wx.showModal({
          title: '充电已结束',
          content: '是否立即查看充电订单'
        }).then(res => {
          if (res.confirm) {
            wx.redirectTo({ url: '/pages/charge-detail/charge-detail?code=' + detail.code })
          } else {
            wx.navigateBack()
          }
        })
        return true
      }
      // 订单未完成
      return false
    }).then(isComplete => {
      // 未完成则继续发起接口请求
      if (!isComplete) {
        // 只在接口成功后，启动本地计时
        this.timer === -1 && this.startTimeCount()
        this.startDetailCount()
      } else {
        this.data.show && this.setData({ show: false })
        this.stopTimeCount()
      }
    }).catch(() => {
      // 接口报错则继续发起接口请求
      this.startDetailCount()
    })
  },

  // 定时获取充电详情
  startDetailCount() {
    this.detailTimer = setTimeout(() => {
      this.getChargingDetail()
    }, 3000)
  },

  // 停止充电详情获取计时器
  stopDetailCount() {
    clearTimeout(this.detailTimer)
  },

  // 本地充电时长计算
  getChargingTime(startTime) {
    if (!startTime) return '00:00:00'

    const diff = dayjs().diff(startTime, 'second')
    const hours = Math.floor(diff / 3600)
    const minutes = Math.floor((diff - hours * 3600) / 60)
    const seconds = diff - hours * 3600 - minutes * 60
    return `${hours < 10 ? '0' + hours : hours}:${minutes < 10 ? '0' + minutes : minutes}:${seconds < 10 ? '0' + seconds : seconds}`
  },

  // 定时更新本地充电时长
  startTimeCount() {
    this.timer = setInterval(() => {
      this.setData({
        chargingTime: this.getChargingTime(this.data.detail.time)
      })
    }, 1000)
  },

  // 停止充电时长计时器
  stopTimeCount() {
    clearInterval(this.timer)
  },

  // 停止充电
  handleChargingStop() {
    const { detail } = this.data
    if (!detail.code) {
      app.showToast('订单不存在', 'error')
      return
    }

    // 接口会继续轮询，订单状态更新时，show 会被置为 false
    this.setData({ show: true })
    app.$api['charge/chargingStop']({
      orderCode: detail.code
    })
  },

  // 支付
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