import { commonFilter } from '../../../utils/common'

export default [
  {
    name: 'getDataByPost',
    method: 'POST',
    path: '/',
    params: {
      ...commonFilter
    },
    desc: '通用获取数据接口'
  }
]
