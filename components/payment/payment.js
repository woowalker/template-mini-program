// components/payment/payment.js
const app = getApp()

Component({
  /**
   * 组件的属性列表
   */
  properties: {
    visible: {
      type: Boolean,
      value: false
    },
    // 订单号
    code: String,
    // 支付金额
    amount: Number,
    // 运营商编号
    tenantCode: String
  },

  options: {
    addGlobalClass: true,
    virtualHost: true
  },

  /**
   * 组件的初始数据
   */
  data: {
    // PAYMENT_TYPE_ECARD PAYMENT_TYPE_WECHAT
    ...app.$consts['CHARGE/PAYMENT_TYPE'],
    paymentType: app.$consts['CHARGE/PAYMENT_TYPE_ECARD'],
    eCard: null,
    reduces: ''
  },

  observers: {
    visible: function (visible) {
      visible && this.getData()
    }
  },

  pageLifetimes: {
    show: function () {
      this.data.visible && this.getData()
    }
  },

  /**
   * 组件的方法列表
   */
  methods: {
    getData: function () {
      app.getUserInfo().then(userinfo => {
        app.showLoading()
        Promise.all([
          app.$api['mine/eCardList']({
            isbuy: true,
            openid: userinfo.openid,
            pageIndex: 1,
            limit: 100000
          }),
          app.$api['mine/getChargeAmountOption']({ tenantCode: this.data.tenantCode })
        ]).then(datas => {
          const [cards, chargeAmounts] = datas
          if (cards.length) {
            const eCard = cards.find(item => item.tenantCode === this.data.tenantCode)
            eCard && this.setData({ eCard })
          }
          if (chargeAmounts) {
            const reduces = chargeAmounts
              .filter(item => item.reduce)
              .sort((a, b) => b.reduce / b.full - a.reduce / a.full)
              .map(item => `满${item.full}减${item.reduce}`)
              .join(' ')
            reduces.length && this.setData({ reduces })
          }
        }).finally(() => {
          app.hideLoading()
        })
      })
    },

    pay: function () {
      const { amount, paymentType, eCard } = this.data
      if (paymentType === app.$consts['CHARGE/PAYMENT_TYPE_ECARD']) {
        if (!eCard) {
          this.eCardBuy()
          return
        }
        if (eCard.balance < amount) {
          this.eCardCharge()
          return
        }
      }
      app.getUserInfo().then(userinfo => {
        app.showLoading()
        app.$api['charge/pay']({
          openid: userinfo.openid,
          code: this.data.code,
          payType: this.data.paymentType,
          payAmount: this.data.amount
        }).then(options => {
          if (this.data.paymentType === app.$consts['CHARGE/PAYMENT_TYPE_ECARD']) {
            this.triggerEvent('payed')
          } else {
            // 调起微信支付
            wx.requestPayment({
              ...options
            }).then(() => {
              this.triggerEvent('payed')
            }).catch(err => {
              app.showToast(err, 'error')
            })
          }
        }).finally(() => {
          app.hideLoading()
        })
      })
    },

    eCardBuy: function () {
      const { tenantCode, PAYMENT_TYPE_WECHAT } = this.data
      wx.showModal({
        title: '电卡购买',
        content: '暂无本站运营商电卡，是否立即购买？',
        confirmText: '立即购买',
        cancelText: '下次再说'
      }).then(res => {
        if (res.confirm) {
          app.getUserInfo().then(userinfo => {
            app.showLoading()
            app.$api['mine/eCardBuy']({
              openid: userinfo.openid,
              tenantCode
            }).then(res => {
              this.setData({
                eCard: res
              }, () => {
                app.showToast('购买成功', 'success', true).then(() => {
                  wx.navigateTo({
                    url: '/pages/ecard-charge/ecard-charge?tenantCode=' + tenantCode
                  })
                })
              })
            }).finally(() => {
              app.hideLoading()
            })
          })
        } else {
          this.setData({ paymentType: PAYMENT_TYPE_WECHAT })
        }
      })
    },

    eCardCharge: function () {
      const { tenantCode, PAYMENT_TYPE_WECHAT } = this.data
      wx.showModal({
        title: '电卡充值',
        content: '电卡余额不足，是否立即充值？',
        confirmText: '前往充值',
        cancelText: '下次再说'
      }).then(res => {
        if (res.confirm) {
          wx.navigateTo({
            url: '/pages/ecard-charge/ecard-charge?tenantCode=' + tenantCode
          })
        } else {
          this.setData({ paymentType: PAYMENT_TYPE_WECHAT })
        }
      })
    },

    checkPaymentType: function (evt) {
      const { value: paymentType } = evt.currentTarget.dataset
      this.setData({ paymentType })
    },
    /**
     * 绑定 page-container 的 bindenter 事件，必须绑定，否则 page-container 弹出无动画效果
     * BUG 跟踪：https://developers.weixin.qq.com/community/develop/doc/0006eae18b4cb86e4a0c36c8d50800?highLine=page-container
     */
    handlePopEnter: function () { }
  }
})
