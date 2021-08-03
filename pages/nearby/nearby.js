// pages/nearby/nearby.js
Page({
  data: {},
  onShow() {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({ current: 1 })
    }
  }
})