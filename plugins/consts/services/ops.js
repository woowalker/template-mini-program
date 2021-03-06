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
  },
  // 审核状态变更模块
  {
    name: 'TICKETS_TYPE_AUDIT_STATUS',
    value: 3
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

// 激活状态
const activateType = [
  // 待完成
  {
    name: 'ACTIVATE_TYPE_DOING',
    value: 0
  },
  // 已完成
  {
    name: 'ACTIVATE_TYPE_DONE',
    value: 1
  }
]

// 维修状态
const repairType = [
  // 待完成
  {
    name: 'REPAIR_TYPE_DOING',
    value: 0
  },
  // 已完成
  {
    name: 'REPAIR_TYPE_DONE',
    value: 1
  }
]

// 保养状态
const maintainType = [
  // 待保养
  {
    name: 'MAINTAIN_TYPE_WAIT',
    value: 0
  },
  // 保养中
  {
    name: 'MAINTAIN_TYPE_DOING',
    value: 1
  },
  // 保养完成
  {
    name: 'MAINTAIN_TYPE_DONE',
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
  ...auditType,
  {
    name: 'ACTIVATE_TYPE',
    value: constMapToObj(activateType)
  },
  ...activateType,
  {
    name: 'REPAIR_TYPE',
    value: constMapToObj(repairType)
  },
  ...repairType,
  {
    name: 'MAINTAIN_TYPE',
    value: constMapToObj(maintainType)
  },
  ...maintainType
]
