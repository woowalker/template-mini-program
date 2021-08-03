// import { commonFilter } from '../../../utils/common'

export default [
  {
    name: 'getStakeDetail',
    method: 'GET',
    path: '/SO/ChargInfo/StakeDetails',
    params: {
      stakeCode: ''
    },
    desc: '获取当前充电桩详情'
  },
  {
    name: 'ordering',
    method: 'POST',
    path: '/SO/Order/StakeBook',
    params: {
      clientId: '',
      openid: '',
      stakeCode: '',
      isbook: true
    },
    desc: '充电桩预约'
  },
  {
    name: 'cancelOrdering',
    method: 'POST',
    path: '/SO/Order/StakeBook',
    params: {
      clientId: '',
      openid: '',
      stakeCode: '',
      isbook: false,
      code: ''
    },
    desc: '充电桩取消预约'
  }
]
