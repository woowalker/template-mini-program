// components/frame-animation/frame-animation.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    show: {
      type: Boolean,
      value: false
    },
    text: {
      type: String,
      value: '加载中...'
    },
    assets: {
      type: String,
      value: [
        '/images/frames/car/Bus_00000.png',
        '/images/frames/car/Bus_00004.png',
        '/images/frames/car/Bus_00012.png',
        '/images/frames/car/Bus_00016.png',
        '/images/frames/car/Bus_00024.png',
        '/images/frames/car/Bus_00028.png',
        '/images/frames/car/Bus_00036.png',
        '/images/frames/car/Bus_00040.png',
      ]
    },
    delay: {
      type: Number,
      value: 200
    },
    duration: {
      type: Number,
      value: 800
    },
    style: {
      type: String,
      value: 'width: 344rpx; height: 258rpx;'
    }
  },

  options: {
    addGlobalClass: true
  },

  /**
   * 组件的初始数据
   */
  data: {
    curr: 0,
    visible: false,
    delayTimer: -1,
    timer: -1
  },

  observers: {
    show: function (show) {
      if (show) {
        if (this.data.visible) return
        clearTimeout(this.data.delayTimer)
        const delayTimer = setTimeout(() => { this.start() }, this.data.delay)
        this.setData({ delayTimer })
      } else {
        this.stop()
      }
    }
  },

  lifetimes: {
    detached: function () {
      clearTimeout(this.data.delayTimer)
      clearInterval(this.data.timer)
    }
  },

  /**
   * 组件的方法列表
   */
  methods: {
    start: function () {
      const timer = setInterval(() => {
        let newCurr = this.data.curr + 1
        newCurr > this.data.assets.length - 1 && (newCurr = 0)
        this.setData({ curr: newCurr })
      }, this.data.duration / this.data.assets.length)
      this.setData({ timer, visible: new Date().getTime() })
    },
    stop: function () {
      clearTimeout(this.data.delayTimer)
      // 加载动画至少存在 500ms
      const timestamp = new Date().getTime()
      if (this.data.visible && timestamp - this.data.visible <= 300) {
        setTimeout(() => {
          clearInterval(this.data.timer)
          this.setData({ curr: 0, visible: false })
        }, 1000)
      } else {
        clearInterval(this.data.timer)
        this.setData({ curr: 0, visible: false })
      }
    }
  }
})
