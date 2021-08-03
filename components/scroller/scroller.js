// components/scroller/scroller.js
const app = getApp()

Component({
  /**
   * 组件的属性列表
   */
  properties: {
    autoLoad: {
      type: Boolean,
      value: true
    },
    // extraData 会在刷新和加载更多的回调中传回去
    extraData: {
      type: String,
      optionalTypes: [Boolean]
    },
    scrollX: {
      type: Boolean,
      value: false
    },
    scrollY: {
      type: Boolean,
      value: true
    },
    refresherEnabled: {
      type: Boolean,
      value: true
    },
    loadmoreEnabled: {
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
    /**
     * 是否开启增强滚动特性，在 ios 上不开启，是因为开启了之后，一些页面的底部会莫名出现大量空白（21.06.16）
     * BUG 跟踪：https://developers.weixin.qq.com/community/develop/doc/0000eec3ba0ce0dd932b7c96d56400?highLine=enhanced
     */
    enhanced: app.data.systemInfo.brand !== 'iPhone',
    // refresh 刷新中
    refresh: false,
    // loadMore 加载中
    loadMore: false,
    // 搜索时，要重置滚动位置
    scrollTop: undefined,
    // 分页
    pageIndex: 1,
    limit: 10,
    // 空数据
    emptyData: false,
    // 暂无更多数据
    fullData: false
  },

  lifetimes: {
    ready: function () {
      // setTimeout 提高转场动画表现
      this.data.autoLoad && setTimeout(() => { this.onRefresh() }, 200)
    }
  },

  /**
   * 组件的方法列表
   */
  methods: {
    /**
     * 下拉刷新
     */
    onRefresh: function () {
      if (!this.data.refresherEnabled || this.data.refresh || this.data.loadMore) return

      this.setData({
        refresh: true,
        pageIndex: 1,
        limit: 10
      }, () => {
        this.triggerEvent('refresh', {
          extraData: this.data.extraData,
          pagination: { pageIndex: this.data.pageIndex, limit: this.data.limit },
          /**
           * 直接处理接口请求函数
           * @param {Promise} promise 直接传入获取数据的 Promise 函数，网络请求需要包括整个返回体
           */
          promise: (promise) => {
            promise
              .then((res) => {
                this.setData({
                  emptyData: !res.TotalCount || res.TotalCount <= 0,
                  fullData: res.TotalCount && res.TotalCount <= this.data.pageIndex * this.data.limit
                })
              })
              .catch(() => {
                this.setData({ emptyData: true, fullData: false })
              })
              .finally(() => {
                this.setData({ refresh: false })
              })
          },
          /**
           * 自定义通知接口请求完成，并传入是否数据为空参数
           * @param {boolean} emptyData 是否空数据
           */
          done: (emptyData = false, fullData = false) => {
            this.setData({ refresh: false, emptyData, fullData })
          }
        })
      })
    },

    /**
     * 加载更多
     */
    onLoadMore: function () {
      if (!this.data.loadmoreEnabled || this.data.refresh || this.data.loadMore || this.data.fullData) return

      this.setData({
        loadMore: true,
        pageIndex: this.data.pageIndex + 1,
        limit: 10
      }, () => {
        this.triggerEvent('loadmore', {
          pagination: { pageIndex: this.data.pageIndex, limit: this.data.limit },
          /**
           * 直接处理接口请求函数
           * @param {Promise} promise 直接传入获取数据的 Promise 函数，网络请求需要包括整个返回体
           */
          promise: (promise) => {
            promise
              .then((res) => {
                this.setData({ fullData: this.data.pageIndex * this.data.limit >= res.TotalCount })
              })
              .catch(() => {
                this.setData({ fullData: false })
              })
              .finally(() => {
                this.setData({ loadMore: false })
              })
          },
          /**
           * 自定义通知接口请求完成，并传入是否数据全部加载完成参数
           * @param {boolean} fullData 是否数据全部加载完成
           */
          done: (fullData = false) => {
            this.setData({ loadMore: false, fullData })
          }
        })
      })
    },

    /**
     * alias for onRefresh
     * ref 调用的语义化接口
     */
    refresh: function () {
      this.onRefresh()
    }
  }
})
