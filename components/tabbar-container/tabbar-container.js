// components/tabbar-container/tabbar-container.js
const app = getApp()

Component({
  /**
   * 组件的属性列表
   */
  properties: {
    style: String
  },

  /**
   * 组件的初始数据
   */
  data: {
    statusBarHeight: app.data.systemInfo.statusBarHeight
  },

  /**
   * 组件的方法列表
   */
  methods: {

  }
})
