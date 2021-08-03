// components/nav-header/nav-header.js
const app = getApp()

Component({
  /**
   * 组件的属性列表
   */
  properties: {
    theme: {
      type: String,
      value: 'light'
    },
    title: {
      type: String,
      value: '小程序'
    },
    showBack: {
      type: Boolean,
      value: false
    },
    style: String
  },

  options: {
    addGlobalClass: true,
    multipleSlots: true
  },

  /**
   * 组件的初始数据
   */
  data: {
    statusBarHeight: app.data.systemInfo.statusBarHeight,
    backIcon: ''
  },

  lifetimes: {
    attached: function () {
      this.setData({ backIcon: this.data.theme === 'light' ? '/images/common/back.png' : '/images/common/back-light.png' })
    }
  },

  /**
   * 组件的方法列表
   */
  methods: {
    navBack: function () {
      wx.navigateBack()
    }
  }
})
