// pages/scan-code/scan-code.js
const app = getApp()

Page({
  data: {
    ready: false,
    permissionCamera: true,
    // 扫码成功
    scanSuccess: false,
    // 手输充电桩号
    customInput: false,
    customDeviceNum: undefined,
    buttons: [{ text: '取消', extClass: 'fz-32' }, { text: '确定', extClass: 'fz-32' }],
    // 闪光灯
    flash: 'off'
  },

  onShow() {
    if (this.data.permissionCamera !== true) {
      this.handleCameraAuthor()
    }
  },

  onReady() {
    // 定时提高导航的页面表现，因为调起 camera 会导致界面有些许卡顿
    setTimeout(() => {
      this.setData({ ready: true })
    }, 300)
  },

  handleCameraAuthor() {
    wx.authorize({ scope: 'scope.camera' })
      .then(() => {
        this.setData({ permissionCamera: true })
      })
      .catch(evt => {
        const { errMsg } = evt
        if (errMsg.indexOf('cancel') !== -1) {
          this.setData({ permissionCamera: 'canceled' })
          return
        }
        this.setData({ permissionCamera: false })
      })
  },

  handleScanCode(evt) {
    console.log(evt)
    if (this.data.scanSuccess) return

    const { type, result: url } = evt.detail
    if ((type === 'qrcode' || type === 'QR_CODE') && url.indexOf('stake') !== -1) {
      this.setData({ scanSuccess: true })
      const innerAudioContext = wx.createInnerAudioContext()
      innerAudioContext.autoplay = true
      innerAudioContext.src = '/images/scan-code/scan-success.mp3'
      innerAudioContext.onPlay(() => {
        wx.vibrateShort({ type: 'heavy' })
        wx.redirectTo({ url })
      })
    }
  },

  handleCameraError(evt) {
    const { errMsg } = evt.detail
    if (errMsg.indexOf('canceled') !== -1) {
      this.setData({ permissionCamera: 'canceled' })
      return
    }
    this.setData({ permissionCamera: false })
  },

  setCustomInput() {
    this.setData({ customInput: true })
  },

  handleCustomInput(evt) {
    console.log('handleCustomInput', evt.detail.value)
    this.setData({ customDeviceNum: evt.detail.value })
  },

  tapDialogButton(evt) {
    const { index } = evt.detail
    if (index === 0) {
      this.setData({ customInput: false })
      return
    }
    if (!this.data.customDeviceNum) {
      app.showToast('充电桩号不能为空', 'none')
      return
    }
    wx.redirectTo({
      url: '/pages/stake/stake?code=' + this.data.customDeviceNum
    })
  },

  toggleFlash() {
    this.setData({ flash: this.data.flash === 'on' ? 'off' : 'on' })
  },

  navBack() {
    wx.navigateBack()
  }
})