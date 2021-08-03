// components/imager/imager.js
const app = getApp()

Component({
  /**
   * 组件的属性列表
   */
  properties: {
    src: String,
    mode: {
      type: String,
      value: 'scaleToFill'
    },
    allowPreview: {
      type: Boolean,
      value: false
    },
    style: String
  },
  externalClasses: ['class'],

  options: {
    virtualHost: true
  },

  /**
   * 组件的初始数据
   */
  data: {
    autoSrc: ''
  },

  observers: {
    src: function (src) {
      this.setAutoSrc(src)
    }
  },

  lifetimes: {
    attached: function () {
      this.setAutoSrc(this.data.src)
    }
  },

  /**
   * 组件的方法列表
   */
  methods: {
    setAutoSrc: function (src) {
      if (src.indexOf('http') !== -1) {
        this.setData({ autoSrc: src })
        return
      }

      const { pixelRatio } = app.data.systemInfo

      let autoSrc = src
      const srcArr = src.split('.')
      if (srcArr.length >= 2) {
        if (pixelRatio > 2) {
          srcArr[srcArr.length - 2] = `${srcArr[srcArr.length - 2]}@3x`
          autoSrc = srcArr.join('.')
        } else if (pixelRatio > 1) {
          srcArr[srcArr.length - 2] = `${srcArr[srcArr.length - 2]}@2x`
          autoSrc = srcArr.join('.')
        }
      }
      this.setData({ autoSrc })
    },
    handlePreview: function () {
      this.data.allowPreview && wx.previewImage({
        urls: [this.data.autoSrc]
      })
    },
    handleLoadError: function () {
      if (this.data.autoSrc !== this.data.src) {
        // 可能没有配倍图，所以用原图
        this.setData({ autoSrc: this.data.src })
      }
    }
  }
})
