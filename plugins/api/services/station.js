// import { commonFilter } from '../../../utils/common'

export default [
  {
    name: 'getStakes',
    method: 'POST',
    path: '/SO/Collection/stationDetails',
    params: {
      openid: '',
      stationId: ''
    },
    desc: '获取站点所有充电桩'
  },
  {
    name: 'favoriteStation',
    method: 'POST',
    path: '/SO/Collection/CollectStation',
    params: {
      openid: '',
      stationId: '',
      favorite: true
    },
    desc: '收藏站点'
  }
]
