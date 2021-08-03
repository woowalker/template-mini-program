// components/nearby-park/nearby-park.js
import { bd09ToGcj02, gcj02ToBd09 } from '../../utils/common'

const app = getApp()

Component({
  /**
   * 组件的属性列表
   */
  properties: {
    favorite: {
      type: Boolean,
      value: false
    }
  },

  options: {
    addGlobalClass: true
  },

  /**
   * 组件的初始数据
   */
  data: {
    searchKey: '',
    openid: '',
    chargePoses: [],
    permissionScope: 'scope.userLocation',
    permissionLocaiton: true,
    // 百度坐标系的经纬度
    location: {
      longitude: '', // 经度
      latitude: '' // 纬度
    }
  },

  /**
   * 组件的方法列表
   */
  methods: {
    /**
     * 获取用户位置信息权限
     */
    checkLocationPermission: function () {
      return wx.authorize({ scope: this.data.permissionScope })
        .then(() => {
          this.setData({ permissionLocaiton: true })
          return true
        })
        .catch(() => {
          this.setData({ permissionLocaiton: false })
          return false
        })
    },

    /**
     * 获取用户位置信息，
     * 正式环境中，微信对接口调用频率做了限制，30s内多次调用，只返回第一次调用的数据
     * 开发版和体验版中，30s内多次调用，仅第一次有效，剩余返回fail
     */
    getUserLocation: async function () {
      const permissionLocaiton = await this.checkLocationPermission()
      if (permissionLocaiton) {
        return wx.getLocation({
          type: 'gcj02',
          isHighAccuracy: true,
          highAccuracyExpireTime: 3000
        }).then(({ longitude, latitude }) => {
          const bd09Location = gcj02ToBd09([longitude, latitude])
          const location = { longitude: bd09Location[0], latitude: bd09Location[1] }
          this.setData({ location })
          return location
        }).catch(() => false)
      }
      return Promise.reject().catch(() => false)
    },

    /**
     * 发起搜索，搜索时直接判断用户是否有位置权限，
     * 没有权限则不进行搜索
     */
    handleSearch: function (evt) {
      this.setData({ searchKey: evt.detail.value })

      if (!this.data.permissionLocaiton) return
      this.selectComponent('.refOfScroller').refresh()
    },

    /**
     * 获取用户位置附近充电桩点，
     * @param {Object} location 用户位置信息
     * @param {Object} pagination 分页参数
     */
    getData: function (location, pagination = { pageIndex: 1, limit: 10 }) {
      return new Promise((resolve, reject) => {
        app.getOpenid()
          .then(openid => { this.setData({ openid }) })
          .finally(() => {
            app.$api['home/nearbyStations'](
              {
                keyword: this.data.searchKey,
                favorite: this.data.favorite,
                openid: this.data.openid,
                lng: location.longitude, // 经度
                lat: location.latitude, // 纬度
                ...pagination
              },
              { fullData: true }
            ).then(res => {
              resolve(res)
            }).catch(err => {
              reject(err)
            })
          })
      })
    },

    /**
     * 获取用户位置附近充电桩点，
     * 刷新调用时，重新获取用户的位置信息 
     * @param {boolean} refresh 是否刷新调用
     * @param {Object} pagination 分页参数
     */
    getChargePoses: async function (refresh = true, pagination) {
      const { longitude, latitude } = this.data.location
      const newLocation = refresh ? await this.getUserLocation() : false
      // 实时获取用户信息位置失败时，用先前保存的位置信息
      if (newLocation || (longitude && latitude)) {
        return this.getData(newLocation || this.data.location, pagination)
      }

      app.showToast('位置信息获取失败', 'none')
      return Promise.reject('位置信息获取失败')
    },

    /**
     * 下拉刷新
     * @param {Object} evt scroller 下拉刷新的回调参数
     */
    onRefresh: function (evt) {
      evt.detail.promise(
        this.getChargePoses(true, evt.detail.pagination)
          .then(res => {
            this.setData({ chargePoses: res.Data })
            return res
          })
      )
    },

    /**
     * 加载更多
     * @param {Object} evt scroller 上拉加载更多的回调参数
     */
    onLoadMore: function (evt) {
      evt.detail.promise(
        this.getChargePoses(false, evt.detail.pagination)
          .then(res => {
            this.setData({ chargePoses: this.data.chargePoses.concat(res.Data) })
            return res
          })
      )
    },

    /**
     * wx.openSetting 打开权限设置界面后，用户的回调
     * @param {Object} evt 授权回调参数
     */
    handlePermissonChange: function (evt) {
      this.setData({ permissionLocaiton: evt.detail[this.data.permissionScope] })
    },

    navToDetail: function (evt) {
      const { value } = evt.currentTarget.dataset
      const find = this.data.chargePoses.find(item => item.stationId === value)
      wx.setStorageSync(app.$consts['COMMON/CACHE_NEARBY_PAGE_DATA'], { station: find })
      wx.navigateTo({ url: '/pages/station/station' })
    },

    navToMap: function (evt) {
      const { value } = evt.currentTarget.dataset
      const find = this.data.chargePoses.find(item => item.stationId === value)
      wx.showModal({
        title: find.stationName,
        content: '是否导航到该地点'
      }).then(res => {
        if (res.confirm) {
          const { stationName, address, lng, lat } = find
          const gcj02Location = bd09ToGcj02([lng, lat])
          wx.openLocation({
            longitude: gcj02Location[0],
            latitude: gcj02Location[1],
            name: stationName,
            address: address
          })
        }
      })
    }
  }
})
