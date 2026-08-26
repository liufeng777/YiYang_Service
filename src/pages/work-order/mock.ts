/**
 * 服务工单模块本地 mock 数据（设计稿：状态Tab.png / 预约与联系.png / 医生审核.png 等）
 * TODO: 接入后端后替换为 workOrderApi（src/api/modules/work-order.ts，对齐 API §9）
 */

/** 工单状态（前端展示键） */
export type WoStatus =
  | 'pending_dispatch'
  | 'dispatched'
  | 'pending_contact'
  | 'pending_service'
  | 'in_service'
  | 'pending_receipt'
  | 'completed'
  | 'reschedule'
  | 'exception'

/** 联系状态（前端展示键，与工单状态分开管理） */
export type ContactStatus =
  | 'not_due'
  | 'pending'
  | 'confirmed'
  | 'unreachable'
  | 'reschedule_request'
  | 'cancelled'

export const WO_STATUS_TEXT: Record<WoStatus, string> = {
  pending_dispatch: '待派单',
  dispatched: '已派单',
  pending_contact: '待联系确认',
  pending_service: '待服务',
  in_service: '服务中',
  pending_receipt: '待回执',
  completed: '已完成',
  reschedule: '改期处理中',
  exception: '履约异常',
}

export const CONTACT_STATUS_TEXT: Record<ContactStatus, string> = {
  not_due: '未到联系日',
  pending: '待联系',
  confirmed: '已确认',
  unreachable: '未接通',
  reschedule_request: '用户要求改期',
  cancelled: '用户取消',
}

/** 状态 Tabs（全部 + 设计稿 9 个状态） */
export const WO_STATUS_TABS: { key: WoStatus | 'all'; label: string }[] = [
  { key: 'all', label: '全部' },
  { key: 'pending_dispatch', label: '待派单' },
  { key: 'dispatched', label: '已派单' },
  { key: 'pending_contact', label: '待联系确认' },
  { key: 'pending_service', label: '待服务' },
  { key: 'in_service', label: '服务中' },
  { key: 'pending_receipt', label: '待回执' },
  { key: 'completed', label: '已完成' },
  { key: 'reschedule', label: '改期待重派' },
  { key: 'exception', label: '履约异常' },
]

/** 工单列表行 */
export interface MockWorkOrderRow {
  id: string
  woNo: string
  orderNo: string
  memberName: string
  memberPhone: string
  serviceName: string
  /** 预约时间展示文本（如 8月13日 09:30） */
  appointment: string
  staffName: string | null
  contactStatus: ContactStatus
  status: WoStatus
}

/** 列表统计卡 */
export const mockWoStats = {
  todayPendingDispatch: 6,
  tomorrowContact: 8,
  pendingReceipt: 3,
  exception: 2,
}

export const mockWorkOrderList: MockWorkOrderRow[] = [
  {
    id: 'WO2608120036',
    woNo: 'WO2608120036',
    orderNo: 'OD2608121028',
    memberName: '张玉兰',
    memberPhone: '138****6612',
    serviceName: 'PICC维护',
    appointment: '8月13日 09:30',
    staffName: null,
    contactStatus: 'not_due',
    status: 'pending_dispatch',
  },
  {
    id: 'WO2608120031',
    woNo: 'WO2608120031',
    orderNo: 'OD2608121016',
    memberName: '李建国',
    memberPhone: '136****2048',
    serviceName: '上门采血',
    appointment: '8月13日 10:00',
    staffName: '杨静',
    contactStatus: 'pending',
    status: 'dispatched',
  },
  {
    id: 'WO2608120027',
    woNo: 'WO2608120027',
    orderNo: 'OD2608120998',
    memberName: '王秀英',
    memberPhone: '139****3320',
    serviceName: '导尿管维护',
    appointment: '8月12日 14:30',
    staffName: '刘晓敏',
    contactStatus: 'confirmed',
    status: 'pending_service',
  },
  {
    id: 'WO2608120025',
    woNo: 'WO2608120025',
    orderNo: 'OD2608120990',
    memberName: '赵国强',
    memberPhone: '137****8854',
    serviceName: '压疮护理',
    appointment: '8月12日 16:00',
    staffName: '孙宁',
    contactStatus: 'confirmed',
    status: 'in_service',
  },
  {
    id: 'WO2608120033',
    woNo: 'WO2608120033',
    orderNo: 'OD2608121021',
    memberName: '陈桂芳',
    memberPhone: '135****7761',
    serviceName: '康复训练',
    appointment: '8月14日 10:30',
    staffName: '陈蕾',
    contactStatus: 'reschedule_request',
    status: 'reschedule',
  },
  {
    id: 'WO2608120019',
    woNo: 'WO2608120019',
    orderNo: 'OD2608120955',
    memberName: '周德明',
    memberPhone: '150****2298',
    serviceName: '伤口换药',
    appointment: '8月11日 15:00',
    staffName: '杨静',
    contactStatus: 'confirmed',
    status: 'pending_receipt',
  },
]

/* ===== 工单详情（WO2608120031，设计稿：预约与联系.png） ===== */

export const mockWoDetail = {
  woNo: 'WO2608120031',
  orderNo: 'OD2608121016',
  source: 'C端预约',
  appointmentText: '8月13日 10:00—11:00',
  status: 'dispatched' as WoStatus,
  contactStatus: 'pending' as ContactStatus,
  statusTags: [
    { text: '已派单', tone: 'blue' },
    { text: '明日待联系', tone: 'orange' },
  ],
  steps: [
    { title: 'C端预约', desc: '8月12日下单', state: 'done' },
    { title: '机构派单', desc: '8月12日派单', state: 'done' },
    { title: '联系确认', desc: 'T-1待执行', state: 'doing' },
    { title: '待服务', desc: '—', state: 'todo' },
    { title: '履约回执', desc: '—', state: 'todo' },
  ],
  booking: {
    date: '2026年8月13日',
    slot: '10:00—11:00',
    orderedAt: '8月12日 08:46',
    address: '丰台区幸福里 22号 2单元 301',
  },
  assignee: {
    name: '杨静',
    title: '护士 · 护师',
    tags: ['证照有效', '上门采血授权'],
    dispatchedAt: '8月12日 09:12',
    slotHint: '当前无冲突',
  },
  contact: {
    pushedAt: '8月12日 09:00',
    target: '李建国 · 136****2048',
    result: '待联系',
  },
  member: {
    name: '李建国',
    gender: '男',
    age: 72,
    diseases: ['高血压', '糖尿病'],
    phone: '136****2048',
    address: '丰台区幸福里 22号 2单元 301',
  },
}

/* ===== 派单弹窗（设计稿：资质授权强校验.png） ===== */

export interface MockDispatchStaff {
  id: number
  name: string
  title: string
  credential: string
  authorization: string
  /** 时段提示（如 当前无冲突 / 相邻任务，间隔30分钟 / 重叠30分钟，请确认 / 当日已排3单） */
  slotHint: string
  slotTone: 'ok' | 'info' | 'warn'
  /** 近期任务 */
  recentTask: string
  /** 推荐标记 */
  recommended?: boolean
}

export const mockDispatchInfo = {
  woNo: 'WO2608120036',
  serviceName: 'PICC维护',
  appointmentText: '8月13日 09:30—10:30',
}

export const mockDispatchStaff: MockDispatchStaff[] = [
  {
    id: 1,
    name: '杨静',
    title: '护士 · 护师',
    credential: '证照有效',
    authorization: 'PICC维护已授权',
    slotHint: '当前无冲突',
    slotTone: 'ok',
    recentTask: '08:30 上门采血',
    recommended: true,
  },
  {
    id: 2,
    name: '刘晓敏',
    title: '护士 · 主管护师',
    credential: '证照有效',
    authorization: 'PICC维护已授权',
    slotHint: '相邻任务，间隔30分钟',
    slotTone: 'info',
    recentTask: '11:00 导管维护',
  },
  {
    id: 3,
    name: '陈蕾',
    title: '护士 · 主管护师',
    credential: '证照有效',
    authorization: 'PICC维护已授权',
    slotHint: '重叠30分钟，请确认',
    slotTone: 'warn',
    recentTask: '09:30 伤口换药',
  },
  {
    id: 4,
    name: '孙宁',
    title: '护士 · 护师',
    credential: '证照有效',
    authorization: 'PICC维护已授权',
    slotHint: '当日已排3单',
    slotTone: 'info',
    recentTask: '13:30 康复随访',
  },
]

/* ===== 修改预约弹窗（设计稿：原人员可保留.png / 时段冲突建议重派.png） ===== */

export const mockReschedule = {
  source: '服务人员联系结果"用户要求改期"',
  origin: '2026年8月13日 10:00—11:00',
  originStaff: '杨静',
  defaultDate: '2026年8月14日',
  defaultReason: '用户临时外出，希望顺延一天。',
  /** 触发时段冲突提醒的时段值 */
  conflictSlot: '14:00—15:00',
  slotOptions: ['09:00—10:00', '10:00—11:00', '14:00—15:00', '15:00—16:00'],
  checks: [
    { label: '资质有效', value: '符合' },
    { label: '服务授权', value: '符合' },
    { label: '新时段提示', value: '无冲突' },
  ],
  conflictStaff: '杨静',
}

/* ===== 医生审核（设计稿：医生审核.png） ===== */

export const mockWoAudit = {
  woNo: 'WO2608120031',
  member: {
    name: '李建国',
    gender: '男',
    age: 72,
    diseases: ['高血压', '糖尿病'],
  },
  service: '上门采血',
  appointment: '08-13 10:00',
  orderNo: 'OD2608121016',
  orderSource: 'C端下单',
  catalog: [
    { key: 'summary', name: '健康摘要', state: 'pass' },
    { key: 'applicability', name: '项目适用性', state: 'warn' },
    { key: 'advice', name: '医嘱依据', state: 'pass' },
    { key: 'safety', name: '上门安全', state: 'pass' },
    { key: 'auth', name: '服务授权', state: 'warn' },
  ] as { key: string; name: string; state: 'pass' | 'warn' }[],
  summary: [
    { label: '身份实名', value: '通过' },
    { label: '项目适用性', value: '通过' },
    { label: '风险项', value: '1项' },
    { label: '禁忌冲突', value: '未发现' },
  ],
  items: [
    {
      key: 'risk',
      tone: 'blue',
      title: '服务对象风险概览',
      tag: '通过',
      content: '当前血压 136/82 mmHg，空腹血糖 7.2 mmol/L；无发热、胸痛及严重低血糖记录。',
    },
    {
      key: 'applicability',
      tone: 'plain',
      title: '服务项目适用性',
      content:
        '申请项目：上门采血；订单已关联检验申请，患者已完成知情确认。医生判断：目前生命体征稳定，可按预约时间上门采血。',
      action: '确认通过',
    },
    {
      key: 'contra',
      tone: 'orange',
      title: '风险与禁忌核对',
      content:
        '系统核对：未见抗凝禁忌或严重出血风险；近7日无急性事件。医生意见：服务前再次询问抗凝药物及过敏史，异常时停止操作。',
      action: '建议修改',
    },
    {
      key: 'implement',
      tone: 'plain',
      title: '实施与回写要求',
      content:
        '由具备上门采血授权的护士执行；完成后上传服务回执并回写检查检验记录。医生意见：同意按标准流程实施，出现晕针或出血异常立即上报。',
      action: '确认通过',
    },
  ] as {
    key: string
    tone: 'blue' | 'orange' | 'plain'
    title: string
    tag?: string
    content: string
    action?: '确认通过' | '建议修改'
  }[],
  opinion: '符合上门采血条件；服务前复核抗凝用药与过敏史，按标准流程执行。',
  source: [
    { label: 'C端订单', value: 'OD2608121016' },
    { label: '服务项目编码', value: 'SV-BL-001' },
    { label: '关联检验申请', value: 'LAB26081208' },
    { label: '下单时间', value: '08-12 08:46' },
  ],
  records: [
    { time: '08:46', text: '用户提交订单' },
    { time: '08:47', text: '系统校验实名与档案' },
    { time: '08:48', text: '生成医生审核待办' },
    { time: '—', text: '等待医生处理' },
  ],
  effectNote: '审核通过后工单进入待派单；退回补充时保持未派单；审核不通过则记录原因并结束本次订单。',
}

/* ===== 审核通过结果页（设计稿：审核通过待派单.png） ===== */

export const mockWoAuditResult = {
  woNo: 'WO2608120031',
  member: {
    name: '李建国',
    meta: '男 · 72岁',
    org: '城东颐养中心 · 实名会员 · 订单来源：C端下单',
    tags: ['高血压', '糖尿病', '中风险', '家庭重点关注'],
  },
  syncNote: '医生审核已完成：已同步运营所需字段，医疗健康明细仍按专业权限管理。同步正常',
  tip: '工单状态已变更为"待派单"，可选择有服务授权的护士。',
}
