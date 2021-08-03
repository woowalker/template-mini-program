import { constMapToObj } from '../../../utils/common'

const stakeStatus = [
  // 充电桩空闲状态
  {
    name: 'STATUS_ON',
    value: 0
  },
  // 充电桩被预约状态
  {
    name: 'STATUS_BUSY',
    value: 1
  },
  // 充电桩充电中状态
  {
    name: 'STATUS_CHARGING',
    value: 2
  },
  // 充电桩离线状态
  {
    name: 'STATUS_OFF',
    value: 3
  }
]

export default [
  {
    name: 'STAKE_STATUS',
    value: constMapToObj(stakeStatus)
  },
  ...stakeStatus
]
