// components/tabs/tabs.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    tabs: {
      type: Array,
      value: []
    },
    activeTab: {
      type: Number,
      value: 0
    }
  },

  options: {
    addGlobalClass: true
  },

  /**
   * 组件的初始数据
   */
  data: {
    currActive: 0
  },

  observers: {
    activeTab: function (activeTab) {
      this.setData({ currActive: activeTab })
    }
  },

  /**
   * 组件的方法列表
   */
  methods: {
    onChange: function (e) {
      const index = e.detail.index
      this.setData({ currActive: index }, () => {
        this.triggerEvent('change', { value: index })
      })
    }
  }
})
