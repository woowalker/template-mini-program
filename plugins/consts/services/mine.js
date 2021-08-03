import { constMapToObj } from '../../../utils/common'

const ecardRecordStatus = [
  // 电卡充值状态：充值中
  {
    name: 'ECARD_RECORD_STATUS_ON',
    value: 0
  },
  // 电卡充值状态：充值成功
  {
    name: 'ECARD_RECORD_STATUS_SUCCESS',
    value: 1
  },
  // 电卡充值状态：充值失败
  {
    name: 'ECARD_RECORD_STATUS_FAIL',
    value: 2
  }
]

export default [
  {
    name: 'ECARD_RECORD_STATUS',
    value: constMapToObj(ecardRecordStatus)
  },
  ...ecardRecordStatus
]
