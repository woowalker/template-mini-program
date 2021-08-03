// pages/ecard-charge/ecard-charge.js
const app = getApp()

Page({
  data: {
    tenantCode: '',
    chargeIndex: -1,
    chargeAmounts: [
      // {
      //   text: '10元',
      //   value: 50,
      //   full: 100, // 满
      //   reduce: 50 // 减
      // }
    ]
  },

  onLoad(params) {
    this.setData({ tenantCode: params.tenantCode }, () => {
      this.getChargeAmountOptions(params.tenantCode)
    })
  },

  getChargeAmountOptions(tenantCode) {
    app.$api['mine/getChargeAmountOption']({ tenantCode }).then(data => {
      const reduces = data.filter(item => item.reduce).sort(function (a, b) {
        return b.reduce / b.full - a.reduce / a.full
      })
      const findIndex = data.findIndex(item => item.text === reduces[0]?.text)
      // space-between 的布局，补几个项目
      if (data.length % 3 > 0) {
        let leftCounts = 3 - data.length % 3
        while (leftCounts > 0) {
          data.push({ text: '', value: '', disabled: true })
          leftCounts--
        }
      }
      this.setData({
        chargeAmounts: data,
        chargeIndex: findIndex !== -1 ? findIndex : 3
      })
    })
  },

  handleSetChargeAmount(evt) {
    const { value: chargeIndex } = evt.currentTarget.dataset
    if (this.data.chargeAmounts[chargeIndex].disabled) return
    this.setData({ chargeIndex })
  },

  handleChargeECard() {
    const { chargeIndex, chargeAmounts } = this.data
    const chargeTarget = chargeAmounts[chargeIndex]
    const chargeAmount = chargeTarget.reduce ? `(实际支付${(chargeTarget.full - chargeTarget.reduce).toFixed(2)}元)` : ''
    wx.showModal({
      title: '电卡充值',
      content: `本次充值${chargeTarget.text}${chargeAmount}，是否确认充值`
    }).then(res => {
      if (res.confirm) {
        app.getUserInfo().then(userinfo => {
          app.showLoading()
          app.$api['mine/eCardCharge']({
            openid: userinfo.openid,
            fullAmount: chargeTarget.full,
            rechargeAmount: chargeTarget.value,
            tenantCode: this.data.tenantCode
          }).then(options => {
            app.hideLoading()
            // 调起微信支付
            wx.requestPayment({
              ...options
            }).then(() => {
              app.showToast('充值成功', null, true).then(() => {
                wx.navigateBack()
              })
            }).catch(err => {
              app.showToast(err, 'error')
            })
          }).catch(err => {
            app.hideLoading()
            app.showToast(err, 'error')
          })
        })
      }
    })
  },

  navToChargeRecord() {
    wx.navigateTo({
      url: '/pages/eacrd-record/ecard-record'
    })
  }
})