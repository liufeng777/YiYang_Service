/**
 * 管理目标模块 mock 数据（设计稿：目标列表 / 发起目标制定 / 制定管理目标三步向导）
 * TODO: 跨会员目标列表、目标库、发起制定、确认生效接口 API v0.1 未定义，
 * 接入后端后替换为 goalApi 对应方法（见 @/api/modules/goal.ts 尾部 TODO）
 */

/** 目标列表行（健管师视角） */
export interface MockGoalRow {
  id: number
  memberName: string
  gender: string
  age: number
  /** active-生效中 pending-待医生制定 */
  status: 'active' | 'pending'
  /** 目标组合条目 */
  goals: string[]
  /** 生效周期（pending 时为 '—'） */
  period: string
  /** 当前评价摘要（pending 时为空） */
  evaluation?: string
  /** 待办事项 */
  todo: string
  doctor: string
  disease: string
}

export const mockGoalStats = {
  pending: 4,
  active: 36,
  weekReview: 8,
  needFollow: 5,
}

export const mockGoalList: MockGoalRow[] = [
  {
    id: 1,
    memberName: '张女士',
    gender: '女',
    age: 67,
    status: 'active',
    goals: ['HbA1c达标', '空腹血糖达标', '安全事件为0', '规律用药', '饮食行动', '运动计划'],
    period: '2026-08-12 至 2026-11-12',
    evaluation: '达标2 · 改善1 · 未达标1',
    todo: '复查HbA1c',
    doctor: '王医生',
    disease: '糖尿病',
  },
  {
    id: 2,
    memberName: '李先生',
    gender: '男',
    age: 72,
    status: 'active',
    goals: ['SBP达标', 'DBP达标', '安全事件为0', '规律用药', '限盐饮食', '规律运动'],
    period: '2026-08-01 至 2026-10-30',
    evaluation: '达标3 · 未达标2',
    todo: '医生复核血压',
    doctor: '李医生',
    disease: '高血压',
  },
  {
    id: 3,
    memberName: '赵女士',
    gender: '女',
    age: 70,
    status: 'active',
    goals: ['急性加重次数', '住院为0', 'CAT评分', '吸入依从性', '肺康复'],
    period: '2026-07-20 至 2026-10-20',
    evaluation: '稳定2 · 资料过期1',
    todo: '补做CAT评估',
    doctor: '周医生',
    disease: '慢阻肺',
  },
  {
    id: 4,
    memberName: '陈先生',
    gender: '男',
    age: 69,
    status: 'pending',
    goals: ['LDL-C达标', '心绞痛控制', '再事件为0', '规律用药', '心脏饮食'],
    period: '—',
    todo: '等待医生制定',
    doctor: '陈医生',
    disease: '冠心病',
  },
]

/** 目标制定关联会员（发起制定 / 制定向导共用） */
export const mockGoalMember = {
  id: 1,
  name: '张女士',
  gender: '女',
  age: 67,
  diseases: [
    { name: '高血压', color: 'green' },
    { name: '糖尿病', color: 'blue' },
    { name: '骨质疏松', color: 'orange' },
  ] as Array<{ name: string; color: 'green' | 'blue' | 'orange' }>,
  level: '橙色',
  doctor: '王医生',
  manager: '周敏',
  periodStart: '2026-08-12',
  periodEnd: '2026-11-12',
  recentAbnormal: ['HbA1c 8.6%', '空腹血糖 9.8 mmol/L'],
  dataSources: ['检查检验', '用药记录', '饮食运动问卷'],
}

/** 发起目标制定 - 发起原因选项 */
export const mockGoalReasons = [
  { key: 'first', label: '新建档案后首次制定', desc: '会员建档完成，需要制定首个管理周期目标' },
  { key: 'level', label: '分层分级发生变化', desc: '风险分层调整，目标需要相应更新' },
  { key: 'abnormal', label: '关键指标异常', desc: '近期关键指标超出目标范围，需要重新评估' },
  { key: 'expire', label: '目标周期到期', desc: '当前管理周期即将结束，制定下一周期目标' },
] as const

/** 目标库分类（制定向导步骤 1 左栏） */
export const mockGoalLibrary = [
  { key: 'recommended', name: '推荐组合', count: 6 },
  { key: 'metric', name: '关键指标', count: 18 },
  { key: 'safety', name: '重大安全事件', count: 4 },
  { key: 'medication', name: '用药依从', count: 2 },
  { key: 'diet', name: '饮食', count: 1 },
  { key: 'exercise', name: '运动', count: 1 },
] as const

/** 目标优先级（core-核心 bottom-底线 normal-常规） */
export type GoalPriority = 'core' | 'bottom' | 'normal'

export const GOAL_PRIORITY_TEXT: Record<GoalPriority, string> = {
  core: '核心',
  bottom: '底线',
  normal: '常规',
}

/** 目标模板（推荐组合，步骤 1 中栏） */
export interface MockGoalTemplate {
  id: string
  name: string
  category: string
  baseline: string
  priority: GoalPriority
}

export const mockGoalTemplates: MockGoalTemplate[] = [
  { id: 'hba1c', name: 'HbA1c达到个体目标', category: '关键指标', baseline: '基线 8.6% · 3个月', priority: 'core' },
  { id: 'fbg', name: '空腹血糖达到个体目标', category: '关键指标', baseline: '基线 9.8 mmol/L · 按监测方案', priority: 'core' },
  { id: 'safety', name: '管理周期重大安全事件为0', category: '重大安全事件', baseline: '急诊 / 住院 / 严重低血糖', priority: 'bottom' },
  { id: 'medication', name: '按当前有效医嘱规律用药', category: '用药依从', baseline: '每2周 / 每次随访', priority: 'normal' },
  { id: 'diet', name: '完成个体饮食行动计划', category: '饮食', baseline: '7-30天', priority: 'normal' },
  { id: 'exercise', name: '完成个体化运动/康复计划', category: '运动', baseline: '7-30天', priority: 'normal' },
]

/** 目标编辑表单配置（步骤 2，按目标 id 提供个体化字段） */
export interface MockGoalDetail {
  goalId: string
  /** 目标编码 */
  code: string
  categoryTag: string
  priorityTag: string
  baselineValue: string
  unit: string
  baselineDate: string
  dataSource: string
  /** 目标上限 / 目标值 */
  target: string
  evalPeriod: string
  planEvalDate: string
  minData: string
  autoRule: string
  patientAction: string
  managerTask: string
}

export const mockGoalDetails: MockGoalDetail[] = [
  {
    goalId: 'hba1c',
    code: 'DM-A1C-01',
    categoryTag: '关键检查检验',
    priorityTag: '核心目标',
    baselineValue: '8.6',
    unit: '%',
    baselineDate: '2026-08-01',
    dataSource: '检查检验 · 北京协和医院',
    target: '7.0',
    evalPeriod: '3个月',
    planEvalDate: '2026-11-12',
    minData: '有效HbA1c 1次',
    autoRule: '评价周期内最近一次有效 HbA1c 检测值 ≤ 目标上限，判定为达标；无有效数据时标记为资料过期',
    patientAction: '按医嘱规律用药，每 3 个月复查一次 HbA1c',
    managerTask: '复查前 7 天提醒会员预约检测，结果回来后 3 天内录入系统',
  },
  {
    goalId: 'fbg',
    code: 'DM-FBG-01',
    categoryTag: '关键指标',
    priorityTag: '核心目标',
    baselineValue: '9.8',
    unit: 'mmol/L',
    baselineDate: '2026-08-01',
    dataSource: '居家监测 · 血糖仪',
    target: '4.4 – 7.0',
    evalPeriod: '按监测方案',
    planEvalDate: '2026-11-12',
    minData: '每周 ≥ 3 次空腹血糖',
    autoRule: '评价周期内空腹血糖达标次数占比 ≥ 70% 判定为达标',
    patientAction: '每周一 / 三 / 五晨起空腹测量血糖并记录',
    managerTask: '每周随访时核对监测记录，数据缺失时及时提醒',
  },
  {
    goalId: 'safety',
    code: 'SAFE-01',
    categoryTag: '重大安全事件',
    priorityTag: '底线目标',
    baselineValue: '0',
    unit: '次',
    baselineDate: '2026-08-12',
    dataSource: '预警工单 · 就诊记录',
    target: '0',
    evalPeriod: '整个管理周期',
    planEvalDate: '2026-11-12',
    minData: '无（事件驱动）',
    autoRule: '评价周期内发生急诊 / 住院 / 严重低血糖任一事件即判定未达标，单独评价',
    patientAction: '出现明显不适及时联系健管师或就医',
    managerTask: '发生安全事件后 24 小时内上报并跟进处理',
  },
  {
    goalId: 'medication',
    code: 'MED-01',
    categoryTag: '用药依从',
    priorityTag: '常规目标',
    baselineValue: '规律',
    unit: '',
    baselineDate: '2026-08-12',
    dataSource: '用药记录 · 随访核对',
    target: '近2周规律用药',
    evalPeriod: '每次随访',
    planEvalDate: '2026-11-12',
    minData: '每次随访核对用药记录',
    autoRule: '近 2 周无漏服 / 自行停药记录判定为达标',
    patientAction: '按当前有效医嘱按时按量服药',
    managerTask: '每次随访核对用药记录，发现漏服及时干预',
  },
  {
    goalId: 'diet',
    code: 'DIET-01',
    categoryTag: '饮食',
    priorityTag: '常规目标',
    baselineValue: '待评估',
    unit: '',
    baselineDate: '2026-08-12',
    dataSource: '饮食运动问卷',
    target: '过去7天完成约定饮食行动 ≥ 5天',
    evalPeriod: '每 7 天',
    planEvalDate: '2026-11-12',
    minData: '每周 1 次饮食记录',
    autoRule: '过去 7 天完成约定饮食行动 ≥ 5 天判定为达标',
    patientAction: '控制主食总量，低盐低糖，每日记录饮食',
    managerTask: '每周查看饮食记录，未达标时进行饮食指导',
  },
  {
    goalId: 'exercise',
    code: 'EXER-01',
    categoryTag: '运动',
    priorityTag: '常规目标',
    baselineValue: '待评估',
    unit: '',
    baselineDate: '2026-08-12',
    dataSource: '饮食运动问卷',
    target: '每周散步 5 次，每次 30 分钟',
    evalPeriod: '每 7 天',
    planEvalDate: '2026-11-12',
    minData: '每周 1 次运动记录',
    autoRule: '过去 7 天完成约定运动计划 ≥ 5 天判定为达标',
    patientAction: '每周散步 5 次，每次 30 分钟，量力而行',
    managerTask: '每周查看运动记录，未达标时了解原因并调整计划',
  },
]

/** 发起目标制定 - 右栏说明 */
export const mockCreateGuidelines = {
  canDo: [
    '发起目标制定任务并选择责任医生',
    '补充会员近期情况与发起原因',
    '查看目标状态与跟进任务',
    '在随访中记录目标相关数据',
  ],
  canNotDo: [
    '不能直接修改临床目标值',
    '不能替代医生确认目标生效',
    '不能修改评价周期与评价规则',
  ],
  afterSubmit: '提交后将在医生工作台生成「制定管理目标」待办；医生确认生效后，目标将返回健管师目标列表并开始跟踪',
}
