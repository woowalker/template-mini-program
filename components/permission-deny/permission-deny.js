// components/permission-deny/permission-deny.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    img: {
      type: String,
      value: '/images/common/permission-deny.png'
    },
    scope: String,
    scopeDesc: String,
    scopeFont: String,
    customTapEvt: {
      type: Boolean,
      value: false
    }
  },

  options: {
    addGlobalClass: true
  },

  /**
   * 组件的初始数据
   */
  data: {

  },

  /**
   * 组件的方法列表
   */
  methods: {
    openSetting: function () {
      if (this.data.customTapEvt) {
        this.triggerEvent('customtap')
        return
      }
      wx.openSetting().then(({ authSetting }) => {
        console.log('authSetting', authSetting)
        this.triggerEvent('change', { [this.data.scope]: authSetting[this.data.scope] })
      })
    }
  }
})
