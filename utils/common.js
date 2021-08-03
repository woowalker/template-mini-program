import { random } from 'lodash'
import gcoord from 'gcoord'

export function uuid(placeholder) {
  const RFC4122_TEMPLATE = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'
  return RFC4122_TEMPLATE.replace(/[xy]/g, function () {
    let value = random(15)
    value = placeholder === 'x' ? value : (value & 0x3 | 0x8)
    return value.toString(16)
  })
}

export const commonFilter = {
  Keyword: '',
  Parameter1: '',
  Parameter2: '',
  Parameter3: '',
  Parameter4: '',
  Parameter5: '',
  Parameter6: '',
  OrgId: '',
  PageIndex: 1,
  Limit: 10,
  Start: 0,
  Sort: '',
  Order: 0,
  RuleCount: 0,
  IncludeCount: 0,
  OrderCount: 0,
  FilterGroupCount: 0,
  Include: [],
  Orders: [],
  FilterGroup: { Rules: [], Groups: [] }
}

export function initFilter(
  OrgId,
  Keyword = '',
  Sort,
  Order,
  PageIndex = 1,
  Parameter1,
  Parameter2,
  Parameter3,
  Parameter4,
  Parameter5,
  Parameter6
) {
  return {
    Keyword,
    Parameter1,
    Parameter2,
    Parameter3,
    Parameter4,
    Parameter5,
    Parameter6,
    OrgId,
    PageIndex,
    Limit: 10,
    Start: (PageIndex - 1) * 10,
    Sort,
    Order: (Order === '' ? 0 : Order),
    RuleCount: 0,
    IncludeCount: 0,
    OrderCount: 0,
    FilterGroupCount: 0,
    Include: [],
    Orders: [],
    FilterGroup: { Rules: [], Groups: [] }
  }
}

export function flatTree(data, result = []) {
  if (Array.isArray(data) && data.length) {
    data.forEach(item => {
      result.push(item)
      flatTree(item.children, result)
    })
  }
  return result
}

export function constMapToObj(arr, obj = {}) {
  arr.forEach(item => {
    obj[item.name] = item.value
  })
  return obj
}

/**
 * 百度坐标系转国测局坐标系
 * @param {Array} coordinate 经纬度数组 [经度, 纬度]
 */
export function bd09ToGcj02(coordinate) {
  return gcoord.transform(
    coordinate, // 经纬度坐标
    gcoord.BD09, // 当前坐标系
    gcoord.GCJ02 // 目标坐标系
  )
}

/**
 * 国测局坐标系转百度坐标系
 * @param {Array} coordinate 经纬度数组 [经度, 纬度]
 */
export function gcj02ToBd09(coordinate) {
  return gcoord.transform(
    coordinate, // 经纬度坐标
    gcoord.GCJ02, // 当前坐标系
    gcoord.BD09 // 目标坐标系
  )
}