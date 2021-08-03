// pages/charge-mode/charge-mode.js
const app = getApp()

Page({
  data: {
    stake: {},
    // CHARGE_MODE_FULL CHARGE_MODE_MONEY CHARGE_MODE_TIME
    ...app.$consts['CHARGE/CHARGE_MODE'],
    // 充电模式
    chargeMode: app.$consts['CHARGE/CHARGE_MODE_FULL'],
    // 固定金额
    chargeMoney: undefined,
    // 固定时长
    chargeTime: undefined,
    presetChargeTimes: [
      // {
      //   text: '3小时',
      //   value: 3
      // }
    ]
  },

  onLoad() {
    this.getOpenerEventChannel().on(
      app.$consts['COMMON/EVENT_NAV_PAGE'],
      ({ stake }) => this.setData({ stake })
    )
    // 获取可用的充电时长
    this.getChargeTimeOption()
  },

  getChargeTimeOption() {
    app.$api['charge/getChargeTimeOption']().then(data => {
      this.setData({ presetChargeTimes: data })
    })
  },

  checkChargeType(evt) {
    const { value: chargeMode } = evt.currentTarget.dataset
    this.setData({ chargeMode })
  },

  handleChargeMoneyFocus() {
    if (!this.data.chargeMoney) {
      this.setData({ chargeMoney: 100 })
    }
  },

  checkChargeMoney(evt) {
    this.setData({ chargeMoney: evt.detail.value })
  },

  checkChargeTime(evt) {
    this.setData({ chargeTime: evt.detail.value })
  },

  navToCharging() {
    const { stake, chargeMode, chargeMoney, chargeTime } = this.data

    let errMsg
    switch (chargeMode) {
      case app.$consts['CHARGE/CHARGE_MODE_MONEY']:
        !chargeMoney && (errMsg = '请输入充电金额')
        break;
      case app.$consts['CHARGE/CHARGE_MODE_TIME']:
        !chargeTime && (errMsg = '请选择充电时长')
        break
      default:
        break;
    }
    if (errMsg) {
      app.showToast(errMsg, 'error')
      return
    }

    app.getUserInfo().then(userinfo => {
      wx.requestSubscribeMessage({
        tmplIds: [app.$consts['COMMON/SUBSCRIBE_STOP_CHARGING']],
        complete: () => {
          app.$api['charge/charging'](
            {
              clientId: userinfo.id,
              openid: userinfo.openid,
              stakeCode: stake.stakeCode,
              chargeMode,
              chargeMoney,
              chargeTime
            },
            { fullData: true }
          ).then(data => {
            if (data.IsSuccessful) {
              wx.redirectTo({
                url: '/pages/charging/charging'
              })
            }
          })
        }
      })
    })
  },

  navToErrorReport() {
    wx.navigateTo({
      url: '/pages/error-report/error-report?stakeCode=' + this.data.stake.stakeCode
    })
  }
})