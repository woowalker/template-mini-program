// import { commonFilter } from '../../../utils/common'

export default [
  {
    name: 'login',
    method: 'GET',
    path: '/OP/Login/WxLogin',
    params: {
      code: ''
    },
    desc: '服务端登录，获取openid'
  },
  {
    name: 'getUserInfo',
    method: 'GET',
    path: '/OP/Client/GetClient',
    params: {
      openid: ''
    },
    desc: '获取用户信息'
  },
  {
    name: 'getUserPhone',
    method: 'POST',
    path: '/OP/Client/GetPhone',
    params: {
      openid: '',
      encryptedData: '',
      iv: ''
    },
    desc: '获取用户手机号'
  },
  {
    name: 'getVerifyCode',
    method: 'POST',
    path: '/OP/Client/PhoneVerifyCode',
    params: {
      openid: '',
      phone: ''
    },
    desc: '获取手机号验证码'
  },
  {
    name: 'checkVerifyCode',
    method: 'POST',
    path: '/OP/Client/CheckPhoneCode',
    params: {
      openid: '',
      code: ''
    },
    desc: '验证手机验证码'
  },
  {
    name: 'updateUserInfo',
    method: 'POST',
    path: '/OP/Client/UpdateClient',
    params: {
      openid: '',
      UserInfo: {}
    },
    desc: '更新用户信息'
  },
  {
    name: 'getHomePage',
    method: 'GET',
    path: '/OP/Client/GetHomePage',
    params: {},
    desc: '获取首页数据'
  },
  {
    name: 'getUserOrdering',
    method: 'GET',
    path: '/SO/Order/GetChargingOrder',
    params: {
      openid: ''
    },
    desc: '获取用户进行中的订单'
  },
  {
    name: 'nearbyStations',
    method: 'POST',
    path: '/SO/Nearby/GetNearbyStations',
    params: {
      lng: '', // 经度
      lat: '', // 纬度
      keyword: '',
      openid: undefined,
      favorite: false,
      pageIndex: 1,
      limit: 10
    },
    desc: '获取用户附近的充电站点'
  }
]
