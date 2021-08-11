// pages/ops-maintaindetail/ops-maintaindetail.js
import queryString from 'query-string'

const app = getApp()

Page({
  data: {
    // MAINTAIN_TYPE_WAIT MAINTAIN_TYPE_DOING MAINTAIN_TYPE_DONE
    ...app.$consts['OPS/MAINTAIN_TYPE'],
    maintain: {
      projs: []
    },
    solved: false,
    code: '', // 工单号
    stakeCode: '' // 充电桩编码
  },

  onLoad(params) {
    if (params.q) {
      const q = queryString.parseUrl(decodeURIComponent(params.q)).query
      this.setData({ stakeCode: q.stakeCode })
    } else {
      this.setData({ code: params.code, stakeCode: params.stakeCode })
    }
  },

  onShow() {
    this.getMaintainDetail()
  },

  getMaintainDetail() {
    app.getUserInfo().then(userinfo => {
      app.showLoading()
      app.$api['ops/getMaintainDetail']({
        code: this.data.code,
        stakeCode: this.data.stakeCode,
        openid: userinfo.openid
      }).then(res => {
        if (res) {
          const maintain = {
            ...res,
            projs: res.projs.map(item => {
              return {
                ...item,
                checked: item.status === this.data.MAINTAIN_TYPE_DONE
              }
            })
          }
          this.setData({
            maintain,
            solved: !maintain.projs.filter(item => !item.checked).length
          })
        } else {
          wx.showModal({
            content: '暂无可保养信息',
            showCancel: false,
            complete: () => {
              wx.navigateBack()
            }
          })
        }
      }).finally(() => {
        app.hideLoading()
      })
    })
  },

  checkboxChange(e) {
    const { value } = e.detail
    const { projs } = this.data.maintain
    projs.forEach(item => {
      item.checked = value.indexOf(item.projId) !== -1
    })
    const maintain = { ...this.data.maintain, projs }
    this.setData({
      maintain,
      solved: !maintain.projs.filter(item => !item.checked).length
    }, () => {
      this.handleMaintain()
    })
  },

  handleMaintain() {
    return app.getUserInfo().then(userinfo => {
      return new Promise((resolve, reject) => {
        app.showLoading()
        app.$api['ops/maintainStake']({
          code: this.data.maintain.code,
          openid: userinfo.openid,
          projs: this.data.maintain.projs.filter(item => item.checked).map(item => item.projId)
        }).then(res => {
          resolve(res)
        }).catch(err => {
          reject(err)
        }).finally(() => {
          app.hideLoading()
        })
      })
    })
  },

  handleSolve() {
    this.handleMaintain().then(() => {
      wx.showModal({
        content: '提交成功',
        showCancel: false,
        complete: () => {
          this.getMaintainDetail()
        }
      })
    })
  }
})