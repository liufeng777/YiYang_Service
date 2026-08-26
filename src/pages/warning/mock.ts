/**
 * 预警管理模块本地 mock 数据（设计稿：预警列表.png / 医生处置.png / 关闭与回写.png）
 * TODO: 接入后端后替换为 warningApi（src/api/modules/warning.ts，对齐 API §6.1/6.2）
 */

/** 预警类型（健康异常预警 / 层级变更） */
export type WarningType = 'health' | 'level'

/** 处理状态 */
export type WarningStatus = 'pending' | 'reviewing' | 'closed'

export const WARNING_TYPE_TEXT: Record<WarningType, string> = {
  health: '健康异常预警',
  level: '层级变更',
}

export const WARNING_STATUS_TEXT: Record<WarningStatus, string> = {
  pending: '待处理',
  reviewing: '医生复核',
  closed: '已关闭',
}

/** 预警列表行 */
export interface MockWarningRow {
  id: string
  content: string
  source: string
  currentLevel: string
  triggeredAt: string
  type: WarningType
  status: WarningStatus
}

export const mockWarningStats = {
  pending: 6,
  pendingNote: '健康异常 2',
  reviewing: 4,
  reviewingNote: '层级变更 3',
  closed: 38,
  closedNote: '本月',
  highRisk: 1,
  highRiskNote: '优先判断',
}

export const mockWarningList: MockWarningRow[] = [
  {
    id: 'HW20260817005',
    content: '空腹血糖异常 · 已关联层级中→高',
    source: '检查检验 / 健康指标',
    currentLevel: '高风险',
    triggeredAt: '08-12 10:26',
    type: 'health',
    status: 'pending',
  },
  {
    id: 'LW20260817003',
    content: '独立层级变更：中风险→高风险',
    source: '分层分级重算',
    currentLevel: '高风险',
    triggeredAt: '08-12 09:42',
    type: 'level',
    status: 'reviewing',
  },
  {
    id: 'HW20260816012',
    content: '血压连续3次超过管理目标',
    source: '随访数据',
    currentLevel: '中风险',
    triggeredAt: '08-11 16:18',
    type: 'health',
    status: 'reviewing',
  },
  {
    id: 'LW20260816008',
    content: '分层由低风险调整为中风险',
    source: '分层分级重算',
    currentLevel: '中风险',
    triggeredAt: '08-11 14:05',
    type: 'level',
    status: 'closed',
  },
  {
    id: 'HW20260815009',
    content: '体重7日增长2.1kg',
    source: '患者C端健康指标',
    currentLevel: '高风险',
    triggeredAt: '08-10 11:32',
    type: 'health',
    status: 'closed',
  },
]

/* ===== 医生处置（设计稿：医生处置.png，HW20260813002） ===== */

export const mockWarningHandle = {
  id: 'HW20260813002',
  metric: '空腹血糖异常',
  value: '9.8 mmol/L',
  meta: '来源：患者C端手动记录　测量：今日08:10　固定阈值：≥9.0　分层影响：中风险→高风险',
  verification:
    '今日09:05电话联系患者：无意识障碍、无呕吐，无明显口渴加重；昨晚漏服一次二甲双胍。建议复测并提交医生判断。',
  riskOptions: ['紧急就医', '尽快门诊/复查', '继续居家监测', '数据错误/无需处置'],
  defaultRisk: '尽快门诊/复查',
  defaultOpinion:
    '建议今日复测空腹及餐后2小时血糖；恢复规律用药。若复测持续≥10 mmol/L或出现明显不适，尽快就医。',
  actions: [
    '创建一次健康预警回访',
    '确认层级：中风险→高风险',
    '创建管理目标调整待办；目标生效后自动生成方案返修待办',
  ],
  closeConditions: [
    '已完成患者情况核实',
    '已记录医生判断',
    '要求的复测/就医结果已回传',
    '后续随访任务已完成或明确取消',
    '处置结论已回写健康档案',
  ],
  currentState: ['医生意见待提交', '复测结果待回传', '暂不可关闭'],
}

/* ===== 关闭与回写（设计稿：关闭与回写.png，HW20260813002） ===== */

export const mockWarningClose = {
  id: 'HW20260813002',
  timeline: [
    { time: '08:10', text: '患者记录空腹血糖 9.8，触发橙色预警' },
    { time: '09:05', text: '健管师完成电话核实并提交医生' },
    { time: '09:32', text: '医生建议复测、规律用药并创建回访' },
    { time: '16:20', text: '患者复测 7.6 mmol/L，无不适' },
    { time: '16:45', text: '健管师完成预警回访，确认已恢复用药' },
  ],
  defaultConclusion: '复测指标下降且无不适，患者已恢复规律用药；本次风险解除，继续按原管理目标监测。',
  reasons: ['风险已解除', '已转诊就医', '误报/数据错误', '合并其他预警'],
  checks: [
    '健管师核实已完成',
    '医生意见已记录',
    '复测结果已回传',
    '预警回访已完成',
    '健康档案已更新',
    '派生层级变化已随本预警确认',
  ],
  afterActions: ['状态变为“已关闭”', '健康记录增加处置事件', '保留医生意见与关闭人', '不删除原始异常数据'],
  footer: '关闭人：张敏　关闭时间：提交时记录　关联健康档案：沈秀兰 JK20260800021',
}
