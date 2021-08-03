import './utils/preLodash'
import EventEmitter from 'eventemitter3'
import api from './plugins/api/index'
import consts from './plugins/consts/index'

App({
  data: {
    /**
     * 用户 openid，获取用户 openid 请通过 this.getOpenid() 获取
     */
    openid: null,
    /**
     * 用户信息，获取用户信息请通过 this.getUserInfo() 获取，getUserInfo 方法包含登录逻辑
     * 注意：默认不从缓存中取用户信息，必须通过服务端获取用户信息，
     * 后续以此作为用户是否登录的依据，没有用户信息，则代表用户未登录
     */
    userinfo: null,
    // onShow 时检查的登陆状态是否检查完成
    sessionCheckDone: false,
    // wx.showLoading 是否展示
    loading: false,
    loadingTimer: -1,
    // 系统信息
    systemInfo: wx.getSystemInfoSync()
  },

  // api 接口
  $api: api,

  // const 常量
  $consts: consts,

  // 缓存各页面实例
  $$instance: {},

  // 事件广播监听机制
  $$EE: new EventEmitter(),

  /**
   * 每次 onShow 时，检查 session（主要用于服务端获取用户数据以及加解密）是否过期
   * 过期，则调用 wx.login 重新更新服务端 session
   * 未过期，则至少获取一次服务端的用户信息
   */
  onShow() {
    wx.checkSession()
      .then(() => {
        if (!this.data.openid) {
          const openid = wx.getStorageSync(this.$consts['COMMON/CACHE_OPENID'])
          this.setData({ openid })
          this.getServerUserInfo(openid, true).finally(() => {
            this.emitSessionCheckDoneEvt()
          })
        }
      })
      .catch(() => {
        this.fullLogin().finally(() => {
          this.emitSessionCheckDoneEvt()
        })
      })
  },

  /**
   * 微信本地登录 -> 获取用户 openid -> 获取用户信息 userinfo
   */
  async fullLogin() {
    const loginCode = await this.wxLogin().catch(() => false)
    const openid = await this.getServerOpenid(loginCode).catch(() => false)
    const userinfo = await this.getServerUserInfo(openid, true).catch(() => false)
    return userinfo ? Promise.resolve(userinfo) : Promise.reject('暂无用户信息')
  },

  /**
   * 微信端登录
   */
  wxLogin() {
    return new Promise((resolve, reject) => {
      wx.login({
        success: (res) => {
          res.code ? resolve(res.code) : reject(res.errMsg)
        },
        fail: () => {
          reject('调用失败')
        }
      })
    })
  },

  /**
   * 服务端获取用户openid
   * @param {string} code 微信登陆凭证
   */
  getServerOpenid(code) {
    if (!code) return Promise.reject('无法获取登录凭证')

    return new Promise((resolve, reject) => {
      this.$api['home/login']({ code })
        .then((res) => {
          if (res && res.openid) {
            // 持久化存储 openid，用于登录状态下直接获取服务端用户信息
            wx.setStorage({
              key: this.$consts['COMMON/CACHE_OPENID'],
              data: res.openid
            })
            this.setData({ openid: res.openid })
            resolve(res.openid)
          } else {
            reject('无法获取openid')
          }
        })
        .catch(err => { reject(err) })
    })
  },

  /**
   * 服务端获取用户信息
   * @param {string} openid 用户openid
   * @param {boolean} silent 静默获取
   */
  getServerUserInfo(openid, silent = false) {
    if (!openid) return Promise.reject('无法获取openid')

    !silent && this.showLoading()
    return new Promise((resolve, reject) => {
      this.$api['home/getUserInfo']({ openid })
        .then(res => {
          if (res && res.UserInfo && res.UserInfo.nickName) {
            const userinfo = {
              ...res.UserInfo,
              openid
            }
            this.setData({ userinfo })
            resolve(userinfo)
          } else {
            reject('暂无用户信息')
          }
        })
        .catch(err => { reject(err) })
        .finally(() => {
          !silent && this.hideLoading()
        })
    })
  },

  /**
   * 获取用户 openid，
   * 请不要直接通过 app.data.openid 获取，
   * 必须通过 app.getOpenid 获取，以便在 openid 没有的情况下通过服务端获取到
   * @param {Object} options 
   * @param {boolean} options.silent 静默获取 openid
   * @param {boolean} options.forceUpdate 强制重新从服务器拉取用户 openid
   */
  async getOpenid(options = {}) {
    const { silent = false, forceUpdate = false } = options
    if (this.data.openid && !forceUpdate) {
      return Promise.resolve(this.data.openid)
    }
    const loginCode = await this.wxLogin().catch(() => false)
    const openid = await this.getServerOpenid(loginCode).catch(() => false)
    if (openid) {
      return Promise.resolve(openid)
    }
    !silent && this.showToast('网络错误', 'error')
    return Promise.reject('无法获取openid')
  },

  /**
   * 获取用户信息，以此作为用户是否登录的依据，没有用户信息，则代表用户未登录
   * 请不要直接通过 app.data.userinfo 获取用户信息，
   * 必须通过 app.getUserInfo 获取，以便在未登录状态下调起登录并获取到用户信息
   * @param {Object} options 配置选项
   * @param {boolean} options.navToLogin 默认调起登陆页面
   * @param {boolean} options.silent 静默获取用户信息
   * @param {boolean} options.forceUpdate 强制重新从服务器拉取最新用户信息
   */
  async getUserInfo(options = {}) {
    const { navToLogin = true, silent = false, forceUpdate = false } = options
    /** 存在用户信息则直接返回用户信息 */
    if (this.data.userinfo && !forceUpdate) {
      return Promise.resolve(this.data.userinfo)
    }
    /** 存在 openid，那么直接获取服务端用户信息 */
    if (this.data.openid) {
      const userinfo = await this.getServerUserInfo(this.data.openid, silent).catch(() => false)
      if (!userinfo) {
        navToLogin && this.authorUserInfo()
        return Promise.reject('暂无用户信息')
      }
      return Promise.resolve(userinfo)
    }
    /** 不存在 openid，则获取 openid，并登录 */
    const openid = await this.getOpenid().catch(() => false)
    if (!openid) {
      return Promise.reject('无法获取openid')
    }
    const userinfo = await this.getServerUserInfo(openid, silent).catch(() => false)
    if (!userinfo) {
      navToLogin && this.authorUserInfo()
      return Promise.reject('暂无用户信息')
    }
    return Promise.resolve(userinfo)
  },

  /**
   * 微信授权获取用户信息，成功获取并更新到服务端后，
   * 视作用户注册并登录成功
   */
  authorUserInfo() {
    wx.showModal({
      title: '用户未登录',
      content: '您还未登录小程序，是否前去登录以继续使用小程序'
    }).then(res => {
      res.confirm && wx.navigateTo({ url: '/pages/login/login' })
    })
  },

  /**
   * 获取用户进行中的订单
   * @param {Object} options getUserInfo 的配置选项
   * @param {boolean} silent 静默获取用户信息
   */
  async getUserOrdering(options, silent = false) {
    const userinfo = await this.getUserInfo(options || undefined).catch(() => false)
    if (!userinfo) {
      return Promise.reject('用户未登录')
    }
    !silent && this.showLoading()
    return new Promise((resolve, reject) => {
      this.$api['home/getUserOrdering']({
        openid: userinfo.openid
      }).then(res => {
        // 存在预约中订单
        if (res.orderStatus === this.$consts['CHARGE/ORDER_STATUS_ORDERING']) {
          wx.showModal({
            title: '温馨提示',
            content: '存在预约中订单，是否立即查看'
          }).then(resModal => {
            resModal.confirm && wx.navigateTo({ url: `/pages/stake/stake?code=${res.stake.stakeCode}` })
          })
          reject('存在预约中订单')
        }
        // 存在充电中订单
        else if (res.orderStatus === this.$consts['CHARGE/ORDER_STATUS_CHARGING']) {
          wx.showModal({
            title: '温馨提示',
            content: '存在充电中订单，是否立即查看'
          }).then(resModal => {
            resModal.confirm && wx.navigateTo({ url: '/pages/charging/charging' })
          })
          reject('存在充电中订单')
        }
        // 存在未付款订单
        else if (res.orderStatus === this.$consts['CHARGE/ORDER_STATUS_UNPAY']) {
          wx.showModal({
            title: '温馨提示',
            content: '存在未付款订单，是否立即查看'
          }).then(resModal => {
            resModal.confirm && wx.navigateTo({ url: '/pages/charge-detail/charge-detail?code=' + res.code })
          })
          reject('存在未付款订单')
        }
        // 没有进行中订单
        else {
          resolve()
        }
      }).finally(() => {
        !silent && this.hideLoading()
      })
    })
  },

  /**
   * app onShow 会检查登陆状态，完成本地和服务端登录，并获取用户信息
   * 这个方法就是这一系列动作完成后调用，广播这个系列动作的完成
   */
  emitSessionCheckDoneEvt() {
    this.setData({ sessionCheckDone: true })
    this.$$EE.emit(this.$consts['COMMON/EVENT_SESSION_CHECK_DONE'])
  },

  /**
   * app.js 是没有 setData 方法的，因此自定义一个
   * @param {Object} data 更新的对象
   * @param {Function} callback 回调函数
   */
  setData(data, callback) {
    Object.keys(data).forEach(key => {
      this.data[key] = data[key]
    })
    callback instanceof Function && callback()
  },

  /**
   * Toast 提示
   * @param {string} msg 文字
   * @param {('error'|'none'|'success')} status 状态，默认状态 success
   * @param {boolean} mask 是否显示遮罩
   * @param {number} duration 持续时间
   */
  showToast(msg, status, mask = false, duration = 1500) {
    switch (status) {
      case 'error':
        return wx.showToast({
          title: msg,
          icon: 'error',
          mask: !!mask,
          duration
        }).then(() => new Promise((resolve) => setTimeout(() => { resolve() }, duration)))
      case 'none':
        return wx.showToast({
          title: msg,
          icon: 'none',
          mask: !!mask,
          duration
        }).then(() => new Promise((resolve) => setTimeout(() => { resolve() }, duration)))
      default:
        return wx.showToast({
          title: msg,
          mask: !!mask,
          duration
        }).then(() => new Promise((resolve) => setTimeout(() => { resolve() }, duration)))
    }
  },

  /**
   * 加载中提示
   * @param {string} title loading 标题
   * @param {boolean} mask 是否显示遮罩
   */
  showLoading(title = '请稍后...', mask = true, delay = 200) {
    if (this.data.loading) return

    const timer = setTimeout(() => {
      this.setData({ loading: true })
      wx.showLoading({ title, mask })
    }, delay)
    this.setData({ loadingTimer: timer })
  },

  /**
   * 隐藏加载中提示
   * @param {Object} options 配置
   */
  hideLoading(options) {
    clearTimeout(this.data.loadingTimer)
    this.setData({ loading: false })
    wx.hideLoading(options)
  },

  /**
   * Form 表单字段数据校验
   * @param {Object} data 待校验的数据, 一维json对象
   * @param {Object} validation 待校验的字段, 格式 [{fields: 'mobile', msg: '请填写手机号码', is_can_zero: 1(是否可以为0)}, ...]
   */
  fieldsCheck(data, validation) {
    for (var i in validation) {
      var temp_value = data[validation[i]['fields']]
      var temp_no_zero = validation[i]['no_zero']

      if ((temp_value == undefined || temp_value.length == 0 || temp_value == -1) || (temp_no_zero && temp_value == 0)) {
        this.showToast(validation[i]['msg'], 'error')
        return false
      }
    }
    return true
  },

  /**
   * 存储页面实例
   * @param {(Object|string)} pageModel  page 实例，一般指 this
   */
  setPageInstance(pageModel) {
    const pagePath = this._getPageModelPath(pageModel)
    this.$$instance[pagePath] = pageModel
  },

  /**
   * 获取页面实例
   * @param {string} pagePath 页面路径，例如 pages/index/index
   */
  getPageInstance(pagePath) {
    return this.$$instance[pagePath]
  },

  /**
   * 移除页面实例
   * @param {(Object|string)} pageModel page 实例，一般指 this
   */
  removePageInstance(pageModel) {
    try {
      delete this.$$instance[this._getPageModelPath(pageModel)]
    } catch (e) {
      console.error(e)
    }
  },

  /**
   * 取实例的 __route__ 属性值
   * @param {Object} page page 实例，一般指 this
   * @param {string} key 直接指定key值，取 this.$$instance[key]
   */
  _getPageModelPath(page, key) {
    return key || page.__route__;
  }
})
