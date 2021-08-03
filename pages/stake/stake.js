// pages/stake/stake.js
import queryString from 'query-string'

const app = getApp()

/**
 * 扫充电桩上面的二维码进入，解析出的二维码信息是小程序页面路径加充电桩编号，
 * 进入小程序后，自动获取到用户信息，
 * 并且根据充电桩编号，获取当前充电桩的相关信息（编号，状态，以及相关联用户），
 * ======》》》》不存在用户信息《《《《======
 * 如果充电桩状态为：
 * 1、被预约：无法操作，此时页面按钮有一个[{text: '返回主页'}]
 * 2、充电中：无法操作，此时页面按钮有一个[{text: '返回主页'}]
 * 3、离线：无法操作，此时页面按钮有一个[{text: '返回主页'}]
 * 4、空闲：可充电，页面按钮有一个[{text: '立即充电'}]，点击要求登录
 * 
 * ======》》》》存在用户信息《《《《======
 * 一、用户存在进行中订单
 * 1、存在预约中订单
 *    a、预约订单与当前扫码充电桩不符合，提示不符合信息，此时页面按钮只有一个[{text: '取消预约'}]，可取消之前的预约订单
 *    b、预约订单与当前扫码充电桩相符合，此时页面按钮有两个[{text: '取消预约'}, {text: '立即充电'}]
 * 2、存在充电中订单
 *    a、充电订单与当前扫码充电桩不符合，提示不符合信息，此时页面按钮有一个[{text: '立即查看'}]，点击去到充电中页面
 *    b、充电订单与当前扫码充电桩相符合，此时页面按钮有一个[{text: '立即查看'}]，点击去到充电中页面
 * 
 * 二、用户不存在进行中订单
 * 如果此时充电桩的状态为：
 * 1、被预约：无法操作，此时页面按钮有一个[{text: '返回主页'}]
 * 2、充电中：无法操作，此时页面按钮有一个[{text: '返回主页'}]
 * 3、离线：无法操作，此时页面按钮有一个[{text: '返回主页'}]
 * 4、空闲：可充电，页面按钮有一个[{text: '立即充电'}]，点击跳转去到充电模式选择页面
 */
Page({
  data: {
    stakeCode: '',
    stake: null,
    userinfo: null,
    emptyOption: {
      loading: true,
      font: '加载中，请稍后...'
    }
  },

  onLoad(params) {
    // scene 是小程序码，普通二维码进来是带 code
    const scene = params.scene ? queryString.parse(decodeURIComponent(params.scene)) : { code: params.code }
    // 兼容带进来的属性是 id 情况
    this.setData({ stakeCode: scene.code || scene.id })
    if (!app.data.sessionCheckDone) {
      app.$$EE.addListener(app.$consts['COMMON/EVENT_SESSION_CHECK_DONE'], this.getData)
    }
  },

  onShow() {
    app.data.sessionCheckDone && this.getData()
  },

  onUnload() {
    app.$$EE.removeListener(app.$consts['COMMON/EVENT_SESSION_CHECK_DONE'], this.getData)
  },

  /**
   * 下拉刷新
   */
  onPullDownRefresh() {
    this.getData().finally(() => { wx.stopPullDownRefresh() })
  },

  getData() {
    return new Promise((resolve) => {
      app.getUserInfo({ navToLogin: false, silent: true })
        .then(res => {
          this.setData({ userinfo: res })
        })
        .finally(() => {
          Promise.all([
            this.getStakeDetail(),
            this.getUserOrdering()
          ]).then(datas => {
            const [stake, stakeOrdering] = datas
            if (!stake) {
              this.setData({
                emptyOption: {
                  loading: false,
                  font: '暂无设备信息'
                }
              })
              return
            }
            /**
             * 如果用户存在进行中订单，也就是 stakeOrdering 有值，
             * 那么以进行中订单返回的充电桩详情为准
             */
            this.setData({ stake: stakeOrdering || stake })
          }).finally(() => {
            resolve()
          })
        })
    })
  },

  /**
   * 获取充电桩的详情
   */
  getStakeDetail() {
    return app.$api['stake/getStakeDetail']({
      stakeCode: this.data.stakeCode
    }).then(res => {
      // 组装状态显示相关字段
      let statusFont, statusClass, statusImg, statusBtns
      switch (res.stakeStatus) {
        case app.$consts['STAKE/STATUS_BUSY']:
          statusFont = '设备已被预约，请使用其他设备'
          statusClass = 'busy'
          statusImg = '/images/stake/stake-busy.png'
          statusBtns = [{ text: '返回主页', type: 'backToHome' }]
          break
        case app.$consts['STAKE/STATUS_CHARGING']:
          statusFont = '设备正在充电中，请使用其他设备'
          statusClass = 'charging'
          statusImg = '/images/stake/stake-charging.png'
          statusBtns = [{ text: '返回主页', type: 'backToHome' }]
          break
        case app.$consts['STAKE/STATUS_OFF']:
          statusFont = '设备离线不可用，请使用其他设备'
          statusClass = 'off'
          statusImg = '/images/stake/stake-off.png'
          statusBtns = [{ text: '返回主页', type: 'backToHome' }]
          break
        default:
          statusFont = '欢迎使用充电桩'
          statusClass = 'on'
          statusImg = '/images/stake/stake-on.png'
          statusBtns = [{ text: '立即充电', type: 'navToChargeMode' }]
          break
      }
      return {
        ...res,
        statusFont,
        statusClass,
        statusImg,
        statusBtns
      }
    }).catch(() => {
      return false
    })
  },

  /**
   * 获取用户进行中的订单
   */
  getUserOrdering() {
    const { userinfo } = this.data
    if (!userinfo) return Promise.reject(false)

    return app.$api['home/getUserOrdering']({
      openid: userinfo.openid
    }).then(res => {
      const { orderStatus, stake } = res
      const matchTargetStake = stake.stakeCode === this.data.stakeCode
      // 组装状态显示相关字段
      let statusFont, statusClass, statusImg, statusBtns
      switch (orderStatus) {
        // 存在预约中订单
        case app.$consts['CHARGE/ORDER_STATUS_ORDERING']:
          statusFont = matchTargetStake ? '欢迎使用充电桩' : `您已预约充电桩【${stake.stakeCode}】`
          statusClass = 'busy'
          statusImg = '/images/stake/stake-busy.png'
          // code 预约中订单编号，用于取消预约
          statusBtns = matchTargetStake ? [{ text: '取消预约', type: 'cancelOrder', code: res.code }, { text: '立即充电', type: 'navToChargeMode' }] : [{ text: '取消预约', type: 'cancelOrder', code: res.code }]
          break
        // 存在充电中订单
        case app.$consts['CHARGE/ORDER_STATUS_CHARGING']:
          statusFont = matchTargetStake ? '设备正在充电中' : `您有一笔充电中订单，充电桩号【${stake.stakeCode}】`
          statusClass = 'charging'
          statusImg = '/images/stake/stake-charging.png'
          statusBtns = [{ text: '立即查看', type: 'navToCharging' }]
          break
        // 不存在进行中订单
        default:
          break
      }
      return statusFont ? { ...stake, statusFont, statusClass, statusImg, statusBtns } : false
    }).catch(() => {
      return false
    })
  },

  handleStakeAction(evt) {
    const { value } = evt.currentTarget.dataset
    switch (value.type) {
      case 'backToHome':
        wx.switchTab({
          url: '/pages/index/index',
        })
        break
      case 'navToChargeMode':
        app.getUserInfo().then(() => {
          wx.navigateTo({
            url: '/pages/charge-mode/charge-mode'
          }).then(evt => {
            evt.eventChannel.emit(app.$consts['COMMON/EVENT_NAV_PAGE'], { stake: this.data.stake })
          })
        })
        break
      case 'navToCharging':
        wx.redirectTo({
          url: '/pages/charging/charging'
        })
        break
      case 'cancelOrder':
        wx.showModal({
          title: '取消预约',
          content: `是否取消对充电桩【${this.data.stakeCode}】的预约`
        }).then(res => {
          if (res.confirm) {
            app.showLoading()
            app.$api['stake/cancelOrdering']({
              clientId: this.data.userinfo.id,
              openid: this.data.userinfo.openid,
              stakeCode: this.data.stakeCode,
              code: value.code
            }).then(() => {
              app.hideLoading()
              app.showToast('取消预约成功').then(() => {
                wx.switchTab({
                  url: '/pages/index/index',
                })
              })
            }).catch(err => {
              app.hideLoading()
              app.showToast('取消预约失败')
            })
          }
        })
        break
      default:
        break
    }
  }
})