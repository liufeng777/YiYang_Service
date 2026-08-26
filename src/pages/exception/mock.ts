/**
 * 异常处理模块本地 mock 数据（设计稿：异常列表.png / 风险处置.png / 履约处置与闭环.png）
 * TODO: 履约异常上报与处置接口 API v0.1 未定义，待后端补充（见 api/modules/warning.ts TODO）
 */

/** 异常分类（健康异常 / 工单异常） */
export type ExceptionType = 'health' | 'wo'

/** 处理状态 */
export type ExceptionStatus = 'pending' | 'processing' | 'closed'

export const EXCEPTION_TYPE_TEXT: Record<ExceptionType, string> = {
  health: '健康异常',
  wo: '工单异常',
}

export const EXCEPTION_STATUS_TEXT: Record<ExceptionStatus, string> = {
  pending: '待受理',
  processing: '处理中',
  closed: '已闭环',
}

/** 异常列表行 */
export interface MockExceptionRow {
  id: string
  content: string
  woNo: string
  reporter: string
  reportedAt: string
  type: ExceptionType
  status: ExceptionStatus
}

export const mockExceptionStats = {
  pending: 6,
  pendingNote: '需确认责任人',
  processing: 4,
  processingNote: '今日到期 2',
  closed: 38,
  closedNote: '本月',
  timeout: 1,
  timeoutNote: '需优先处理',
}

export const mockExceptionList: MockExceptionRow[] = [
  {
    id: 'EX20260812006',
    content: '现场发现患者血压明显升高',
    woNo: 'WO20260812031',
    reporter: '张护士',
    reportedAt: '08-12 10:26',
    type: 'health',
    status: 'pending',
  },
  {
    id: 'EX20260812005',
    content: '用户临时拒绝本次服务',
    woNo: 'WO20260812027',
    reporter: '李护士',
    reportedAt: '08-12 09:42',
    type: 'wo',
    status: 'processing',
  },
  {
    id: 'EX20260811018',
    content: '服务耗材与订单不一致',
    woNo: 'WO20260811086',
    reporter: '王护理员',
    reportedAt: '08-11 16:18',
    type: 'wo',
    status: 'processing',
  },
  {
    id: 'EX20260811012',
    content: '到达后无法联系用户',
    woNo: 'WO20260811062',
    reporter: '赵护士',
    reportedAt: '08-11 14:05',
    type: 'wo',
    status: 'closed',
  },
  {
    id: 'EX20260810009',
    content: '服务地址现场无法进入',
    woNo: 'WO20260810044',
    reporter: '陈护理员',
    reportedAt: '08-10 11:32',
    type: 'wo',
    status: 'closed',
  },
]

/* ===== 健康异常处理（设计稿：风险处置.png，EX20260812006） ===== */

export const mockHealthException = {
  id: 'EX20260812006',
  banner: '紧急异常：现场发现患者血压明显升高，请优先电话确认现场情况；必要时按机构应急规范处置。',
  report: {
    type: '服务中发现健康异常',
    desc: '为张女士测量血压时读数为 182/106 mmHg，休息后复测仍偏高，患者诉轻微头晕。',
    reporter: '张敏（护士） 138****8271',
    reportedAt: '2026-08-12 10:26',
    attachments: ['现场照片 2 张', '测量记录 1 份'],
  },
  order: {
    orderNo: 'OD20260812018',
    woNo: 'WO20260812031',
    service: '上门生命体征监测',
    member: '张淑兰 女 67岁 139****2168',
    appointment: '2026-08-12 10:00–11:00',
    address: '北京市丰台区幸福里小区 3号楼',
    staff: '张敏（护士）',
  },
  riskLevels: ['紧急', '高', '中', '低'],
  transferTargets: ['王医生（审核医生）', '健康管理团队', '责任医生'],
  defaultDeadline: '2026-08-12 11:30',
  tips: ['紧急情况优先执行现场急救或拨打120', '处置结果同步患者健康档案', '可转交医生或患者管理团队继续跟进'],
}

/* ===== 工单异常处理（设计稿：履约处置与闭环.png，EX20260812005） ===== */

export const mockWoException = {
  id: 'EX20260812005',
  title: '用户临时拒绝本次服务',
  woNo: 'WO20260812027',
  service: '上门换药',
  reporter: '李护士',
  reportedAt: '2026-08-12 09:42',
  owner: '周敏',
  deadline: '今天 12:00',
  records: [
    { time: '09:42', title: '李护士上报异常', desc: '用户表示暂不接受本次上门换药服务' },
    { time: '09:55', title: '周敏受理', desc: '电话联系用户核实原因' },
    { time: '10:12', title: '周敏补充记录', desc: '用户因临时外出，希望改约至明日上午', current: true },
  ],
  resolutions: ['修改预约时间', '取消本次服务', '重新派单', '维持原安排'],
  woActions: ['同步更新工单并通知执行人员', '工单转入待重新派单', '工单标记取消', '仅记录不更新工单'],
  defaultNote: '用户已确认改约至 8月13日 10:00，工单已更新，原执行人员可继续服务。',
}
