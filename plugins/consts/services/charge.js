import { constMapToObj } from '../../../utils/common'

const chargeMode = [
  // 充电模式：充满
  {
    name: 'CHARGE_MODE_FULL',
    value: 0
  },
  // 充电模式：固定金额
  {
    name: 'CHARGE_MODE_MONEY',
    value: 1
  },
  // 充电模式：固定时长
  {
    name: 'CHARGE_MODE_TIME',
    value: 2
  }
]

const orderStatus = [
  // 订单状态：预约中
  {
    name: 'ORDER_STATUS_ORDERING',
    value: 0
  },
  // 订单状态：充电中
  {
    name: 'ORDER_STATUS_CHARGING',
    value: 1
  },
  // 订单状态：未付款
  {
    name: 'ORDER_STATUS_UNPAY',
    value: 2
  },
  // 订单状态：付款完成
  {
    name: 'ORDER_STATUS_PAYED',
    value: 3
  }
]

const paymentType = [
  // 支付方式：电卡支付
  {
    name: 'PAYMENT_TYPE_ECARD',
    value: 0
  },
  // 支付方式：微信支付
  {
    name: 'PAYMENT_TYPE_WECHAT',
    value: 1
  }
]

const chargingStatus = [
  // 充电状态：充电异常
  {
    name: 'CHARGING_STATUS_ERROR',
    value: 0
  },
  // 充电状态：充电中
  {
    name: 'CHARGING_STATUS_CHARGING',
    value: 1
  },
  // 充电状态：充电结束
  {
    name: 'CHARGING_STATUS_DONE',
    value: 2
  }
]

export default [
  {
    name: 'CHARGE_MODE',
    value: constMapToObj(chargeMode)
  },
  ...chargeMode,
  {
    name: 'ORDER_STATUS',
    value: constMapToObj(orderStatus)
  },
  ...orderStatus,
  {
    name: 'PAYMENT_TYPE',
    value: constMapToObj(paymentType)
  },
  ...paymentType,
  {
    name: 'CHARGING_STATUS',
    value: constMapToObj(chargingStatus)
  },
  ...chargingStatus
]
