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
    name: 'getTaskNumber',
    method: 'GET',
    path: '/OP/Client/GetTaskNumber',
    params: {
      openid: ''
    },
    desc: '运维中心各模块任务量'
  },
  {
    name: 'getTenants',
    method: 'POST',
    path: '/OP/Client/GetTenant',
    params: {
      isApplyed: true,
      openid: '',
      keyword: '',
      pageIndex: 1,
      limit: 10
    },
    desc: '获取可用运营商'
  },
  {
    name: 'applyForOPS',
    method: 'POST',
    path: '/OP/Client/ApplyMaintain',
    params: {
      openid: '',
      tenantCode: '',
      orgId: '',
      remark: ''
    },
    desc: '申请成为运维人员'
  },
  {
    name: 'getActivates',
    method: 'POST',
    path: '/SO/ChargInfo/ActivateList',
    params: {
      openid: '',
      pageIndex: 1,
      limit: 10
    },
    desc: '获取激活工单列表'
  },
  {
    name: 'activateStake',
    method: 'POST',
    path: '/SO/ChargInfo/ActivateStake',
    params: {
      code: '',
      openid: '',
      sequence: ''
    },
    desc: '激活充电桩'
  },
  {
    name: 'getRepairs',
    method: 'POST',
    path: '/SO/ChargInfo/RepairList',
    params: {
      openid: '',
      pageIndex: 1,
      limit: 10
    },
    desc: '获取维修工单列表'
  },
  {
    name: 'getRepairDetail',
    method: 'POST',
    path: '/SO/ChargInfo/ScanRepairDetail',
    params: {
      code: '', // 订单编号
      openid: '',
      stakeCode: ''
    },
    desc: '获取待维修充电桩详情'
  },
  {
    name: 'repairStake',
    method: 'POST',
    path: '/SO/ChargInfo/RepairStake',
    params: {
      code: '',
      openid: ''
    },
    desc: '充电桩维修提交'
  },
  {
    name: 'getMaintains',
    method: 'POST',
    path: '/SO/ChargInfo/MaintainList',
    params: {
      openid: '',
      pageIndex: 1,
      limit: 10
    },
    desc: '获取保养工单列表'
  },
  {
    name: 'getMaintainDetail',
    method: 'POST',
    path: '/SO/ChargInfo/ScanMaintainDetail',
    params: {
      code: '', // 订单编号
      openid: '',
      stakeCode: ''
    },
    desc: '获取待保养充电桩详情'
  },
]
