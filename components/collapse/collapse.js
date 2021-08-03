// components/collapse/collapse.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    title: String,
    content: String,
    border: {
      type: Boolean,
      value: true
    }
  },

  options: {
    addGlobalClass: true
  },

  /**
   * 组件的初始数据
   */
  data: {
    visible: false
  },

  /**
   * 组件的方法列表
   */
  methods: {
    handleToggleVisible: function () {
      this.setData({ visible: !this.data.visible })
    }
  }
})
