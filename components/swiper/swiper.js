// components/swiper.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    vertical: {
      type: Boolean,
      calue: false
    },
    indicatorDots: {
      type: Boolean,
      value: true
    },
    autoplay: {
      type: Boolean,
      value: true
    },
    circular: {
      type: Boolean,
      value: true
    },
    interval: {
      type: Number,
      value: 5000
    },
    duration: {
      type: Number,
      value: 500
    },
    list: {
      type: Array,
      value: [
        // {
        //   key: '',
        //   src: '只显示图片',
        //   font: '只显示文字'
        // }
      ]
    }
  },

  options: {
    addGlobalClass: true
  },

  /**
   * 组件的初始数据
   */
  data: {
    showDots: true
  },

  lifetimes: {
    attached: function () {
      this.checkDotsShow()
    }
  },

  observers: {
    'indicatorDots, list': function () {
      this.checkDotsShow()
    }
  },

  /**
   * 组件的方法列表
   */
  methods: {
    checkDotsShow: function () {
      const { indicatorDots, list } = this.data
      this.setData({ showDots: !indicatorDots ? false : list.length > 1 })
    }
  }
})
