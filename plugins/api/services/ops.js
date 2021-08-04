// import { commonFilter } from '../../../utils/common'

export default [
  {
    name: 'getOPSInfo',
    method: 'GET',
    path: '/OP/Client/GetOperatorInfo',
    params: {
      openid: ''
    },
    desc: '运维人员信息'
  },
  {
    name: 'getTenants',
    method: 'GET',
    path: '/OP/Client/GetTenant',
    params: {
      keyword: '',
      pageIndex: 1,
      limit: 10
    },
    desc: '获取可用运营商'
  }
]
