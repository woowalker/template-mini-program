// custom-tab-bar/index.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {

  },

  options: {
    addGlobalClass: true
  },

  /**
   * 组件的初始数据
   */
  data: {
    current: -1,
    list: [
      {
        text: '首页',
        iconPath: '/images/tabbar/home.png',
        selectedIconPath: '/images/tabbar/home-on.png',
        pagePath: '/pages/index/index'
      },
      {
        text: '附近',
        iconPath: '/images/tabbar/nearby.png',
        selectedIconPath: '/images/tabbar/nearby-on.png',
        pagePath: '/pages/nearby/nearby'
      },
      {
        text: '我的',
        iconPath: '/images/tabbar/mine.png',
        selectedIconPath: '/images/tabbar/mine-on.png',
        pagePath: '/pages/mine/mine'
      }
    ]
  },

  /**
   * 组件的方法列表
   */
  methods: {
    onTabChange(evt) {
      const { value: index } = evt.currentTarget.dataset
      const find = this.data.list[index]
      wx.switchTab({ url: find.pagePath })
    }
  }
})
