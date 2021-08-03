// components/expand-text/expand-text.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    text: String,
    style: String
  },

  options: {
    addGlobalClass: true
  },

  /**
   * 组件的初始数据
   */
  data: {
    expanded: false
  },

  /**
   * 组件的方法列表
   */
  methods: {
    toggleExpand: function () {
      this.setData({ expanded: !this.data.expanded })
    }
  }
})
