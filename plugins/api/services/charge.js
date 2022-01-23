// import { commonFilter } from '../../../utils/common'

export default [
  {
    name: 'charging',
    method: 'POST',
    path: '/SO/Order/ChargeImmediately',
    params: {
      clientId: '',
      openid: '',
      stakeCode: '',
      chargeMode: 0,
      chargeMoney: '',
      chargeTime: ''
    },
    desc: '立即充电'
  },
  {
    name: 'chargingStop',
    method: 'POST',
    path: '/SO/Order/EndCharging',
    params: {
      orderCode: ''
    },
    desc: '停止充电'
  },
  {
    name: 'chargingDetail',
    method: 'GET',
    path: '/SO/Order/GetStakeOrder',
    params: {
      clientId: ''
    },
    desc: '充电中详情'
  },
  {
    name: 'chargeRecord',
    method: 'POST',
    path: '/SO/Order/GetOrderRecord',
    params: {
      openid: '',
      pageIndex: 1,
      limit: 10
    },
    desc: '充电订单记录'
  },
  {
    name: 'delRecord',
    method: 'DELETE',
    path: '/SO/Order/DeleteOrderRecord',
    params: {
      code: ''
    },
    desc: '删除订单记录'
  },
  {
    name: 'recordDetail',
    method: 'GET',
    path: '/SO/Order/GetOrderRecordDetail',
    params: {
      code: ''
    },
    desc: '充电订单详情'
  },
  {
    name: 'getChargeTimeOption',
    method: 'GET',
    path: '/SO/ChargInfo/OptionalTime',
    params: {},
    desc: '获取可用的充电时长'
  },
  {
    name: 'pay',
    method: 'POST',
    path: '/OP/Client/Payment',
    params: {
      openid: '',
      code: '',
      payType: 0,
      payAmount: ''
    },
    desc: '充电订单支付'
  }
]
