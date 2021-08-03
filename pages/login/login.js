// pages/login/login.js
import { pick } from 'lodash'

const app = getApp()

Page({
  data: {
    userinfo: null,
    phoneNumber: null,
    verifyCode: null,
    // 弹框认证
    visible: false,
    customPhone: false,
    countDown: 0,
    buttons: [{ text: '立即绑定', extClass: 'fz-32' }]
  },

  timer: -1,

  onUnload() {
    clearInterval(this.timer)
  },

  getUserProfile() {
    wx.getUserProfile({
      desc: '注册登录'
    }).then(res => {
      this.setData({
        userinfo: res.userInfo,
        visible: true
      })
    }).catch(err => {
      app.showToast('授权失败', 'error')
    })
  },

  /**
   * 获取用户手机号
   * getPhoneNumber 会返回 encryptedData（加密数据）和 iv（加密算法的初始向量），
   * 将这两个值传到后端，后端根据这两个值并结合 session_key 解密出用户的手机号，并返回给前端
   * 参考：https://developers.weixin.qq.com/miniprogram/dev/framework/open-ability/signature.html
   * @param {Oject} param0 
   */
  getPhoneNumber({ detail }) {
    const { encryptedData, iv } = detail
    if (!encryptedData || !iv) {
      app.showToast('获取失败', 'error')
      this.setData({ customPhone: true })
      return
    }
    app.getOpenid().then(openid => {
      app.showLoading()
      app.$api['home/getUserPhone']({
        openid,
        encryptedData,
        iv
      }).then(res => {
        if (res && res.UserInfo && res.UserInfo.tel) {
          app.$api['home/updateUserInfo']({
            openid,
            UserInfo: {
              ...pick(this.data.userinfo, ['nickName', 'avatarUrl']),
              ...res.UserInfo
            }
          }).then(({ UserInfo: userinfo }) => {
            app.setData({ ...userinfo, openid })
            app.hideLoading()
            app.showToast('登录成功', null, true).then(() => {
              wx.navigateBack()
            })
          }).catch(() => {
            app.hideLoading()
            app.showToast('登录失败', 'error')
          })
        } else {
          app.hideLoading()
          app.showToast('获取手机号失败', 'error')
        }
      }).catch(() => {
        app.hideLoading()
        app.showToast('获取手机号失败', 'error')
      })
    })
  },

  checkPhoneNumber(evt) {
    this.setData({ phoneNumber: evt.detail.value })
  },

  checkVerifyCode(evt) {
    this.setData({ verifyCode: evt.detail.value })
  },

  getVerifyCode() {
    if (app.$consts['COMMON/REG_PHONE'].test(this.data.phoneNumber)) {
      app.getOpenid().then(openid => {
        app.$api['home/getVerifyCode']({
          openid,
          phone: this.data.phoneNumber
        }).then(() => {
          app.showToast('验证码发送成功')

          this.setData({ countDown: 60 })
          this.timer = setInterval(() => {
            if (this.data.countDown > 0) {
              this.setData({ countDown: this.data.countDown - 1 })
            } else {
              clearInterval(this.timer)
            }
          }, 1000)
        }).catch(() => {
          app.showToast('获取验证码失败', 'error')
        })
      })
    } else {
      app.showToast('手机号码错误', 'error')
    }
  },

  tapDialogButton() {
    const { phoneNumber, customPhone, verifyCode } = this.data
    if (!phoneNumber || !app.$consts['COMMON/REG_PHONE'].test(phoneNumber)) {
      app.showToast('手机号码错误', 'none')
      return
    }
    if (customPhone && !verifyCode) {
      app.showToast('验证码不能为空', 'none')
      return
    }
    app.getOpenid().then(openid => {
      app.showLoading()
      app.$api['home/checkVerifyCode']({
        openid,
        code: verifyCode
      }).then(() => {
        app.$api['home/updateUserInfo']({
          openid,
          UserInfo: {
            ...pick(this.data.userinfo, ['nickName', 'avatarUrl']),
            tel: phoneNumber
          }
        }).then(({ UserInfo: userinfo }) => {
          app.setData({ userinfo })
          app.hideLoading()
          app.showToast('登录成功', null, true).then(() => {
            wx.navigateBack()
          })
        }).catch(() => {
          app.hideLoading()
          app.showToast('登录失败', 'error')
        })
      }).catch(() => {
        app.hideLoading()
        app.showToast('验证码错误', 'error')
      })
    })
  }
})