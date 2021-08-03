// import { commonFilter } from '../../../utils/common'

export default [
  {
    name: 'eCardList',
    method: 'POST',
    path: '/OP/Client/GetElectricCard',
    params: {
      isbuy: true,
      openid: '',
      pageIndex: 1,
      limit: 10,
      keyword: ''
    },
    desc: '电卡列表'
  },
  {
    name: 'eCardBuy',
    method: 'POST',
    path: '/OP/Client/BuyMemberCard',
    params: {
      openid: '',
      tenantCode: ''
    },
    desc: '电卡列表'
  },
  {
    name: 'eCardCharge',
    method: 'POST',
    path: '/OP/Client/Recharge',
    params: {
      openid: '',
      fullAmount: '',
      rechargeAmount: '',
      tenantCode: ''
    },
    desc: '电卡充值'
  },
  {
    name: 'eCardRecord',
    method: 'POST',
    path: '/OP/Client/GetRechargeRecord',
    params: {
      openid: '',
      pageIndex: 1,
      limit: 10
    },
    desc: '充值记录'
  },
  {
    name: 'questions',
    method: 'GET',
    path: '/OP/Client/GetCommonQuestion',
    params: {},
    desc: '常见问题'
  },
  {
    name: 'errorReport',
    method: 'post',
    path: '/SO/ChargInfo/TroubleShooting',
    params: {
      openid: '',
      stakeCode: '',
      remark: ''
    },
    desc: '故障报修'
  },
  {
    name: 'getChargeAmountOption',
    method: 'GET',
    path: '/OP/Client/GetRechargeAmount',
    params: {
      tenantCode: ''
    },
    desc: '获取可用的充值金额'
  }
]
