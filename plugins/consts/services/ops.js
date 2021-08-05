import { constMapToObj } from '../../../utils/common'

// 运维中心模块分类
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

// 申请为运维人员审核状态
const auditType = [
  // 未审核
  {
    name: 'AUDIT_TYPE_UNAPPLY',
    value: 0
  },
  // 待审核
  {
    name: 'AUDIT_TYPE_APPLYING',
    value: 1
  },
  // 审核通过
  {
    name: 'AUDIT_TYPE_APPLYED',
    value: 2
  }
]

export default [
  {
    name: 'TICKETS_TYPE',
    value: constMapToObj(ticketsType)
  },
  ...ticketsType,
  {
    name: 'AUDIT_TYPE',
    value: constMapToObj(auditType)
  },
  ...auditType
]
