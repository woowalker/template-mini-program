// pages/error-report/error-report.js
import scanCode from '../../utils/scanCode'
import queryString from 'query-string'
import config from '../../plugins/api/config'

const app = getApp()

Page({
  data: {
    stakeCode: '',
    describe: '',
    tempFilePath: '',
    filePath: ''
  },

  onLoad(params) {
    if (params && params.stakeCode) {
      this.setData({ stakeCode: params.stakeCode })
    }
  },

  setDeviceNumber(evt) {
    this.setData({ stakeCode: evt.detail.value })
  },

  scanError() {
    app.showToast('未检测到桩号', 'error')
  },

  handleScancode() {
    scanCode().then(res => {
      if (res?.result) {
        const query = queryString.parseUrl(res.result).query
        if (query.code) {
          this.setData({ stakeCode: query.code })
        } else {
          this.scanError()
        }
      } else {
        this.scanError()
      }
    }).catch(() => {
      this.scanError()
    })
  },

  setDescribe(evt) {
    this.setData({ describe: evt.detail.value })
  },

  chooseImg() {
    wx.chooseImage({
      count: 1
    }).then(res => {
      const { tempFilePaths, tempFiles } = res
      this.setData({
        tempFilePath: tempFilePaths[0],
        filePath: tempFiles[0].path
      })
    })
  },

  handleSubmit() {
    const { stakeCode, describe: remark, filePath } = this.data
    if (!stakeCode) {
      app.showToast('请输入充电桩号', 'error')
      return
    }
    app.getUserInfo().then(userinfo => {
      if (filePath) {
        const { baseUrl, prefixPath } = config
        wx.uploadFile({
          url: `${baseUrl}${prefixPath}/SO/ChargInfo/TroubleShooting`,
          filePath: filePath,
          name: 'file',
          header: {
            Tenant: stakeCode.substring(0, 4)
          },
          formData: {
            openid: userinfo.openid,
            stakeCode,
            remark
          },
          success: (res) => {
            console.log(res)
          }
        })
      } else {
        app.$api['mine/errorReport']({
          openid: userinfo.openid,
          stakeCode,
          remark
        }, { header: { 'content-type': 'application/x-www-form-urlencoded' } }).then(res => {
          app.showToast('上报成功', null, true).then(() => {
            wx.navigateBack()
          })
        })
      }
    })
  }
})