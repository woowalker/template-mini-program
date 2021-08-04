import { constMapToObj } from '../../../utils/common'

const ticketsType = [
  // 激活模块
  {
    name: 'TICKETS_TYPE_ACTIVATE',
    value: 0
  },
  // 维修模块
  {
    name: 'TICKETS_TYPE_REPAIR',
    value: 1
  },
  // 保养模块
  {
    name: 'TICKETS_TYPE_MAINTAIN',
    value: 2
  }
]

export default [
  {
    name: 'TICKETS_TYPE',
    value: constMapToObj(ticketsType)
  },
  ...ticketsType
]
