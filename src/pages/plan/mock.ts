/**
 * 健康管理方案模块 mock 数据（设计稿：方案列表 / AI方案生成 / 方案概览 / 监测计划 / 进度状态）
 * TODO: 跨会员方案列表、方案模块结构化内容接口 API v0.1 未定义，
 * 接入后端后替换为 planApi 对应方法（见 @/api/modules/plan.ts 尾部 TODO）
 */

/** 方案列表行（健管师视角） */
export interface MockPlanRow {
  id: number
  name: string
  gender: string
  age: number
  diseases: string[]
  /** 方案周期（待生成时为 '—'） */
  period: string
  /** 方案内容摘要 */
  content: string
  /** 生成方式（待生成时为 '—'） */
  genMode: string
  /** draft-AI草稿 review-待医生审核 active-执行中 pending-待生成 */
  status: 'draft' | 'review' | 'active' | 'pending'
  /** 制定人 */
  creator: string
  /** 审核医生 */
  reviewer: string
}

export const PLAN_STATUS_TEXT: Record<MockPlanRow['status'], string> = {
  draft: 'AI草稿',
  review: '待医生审核',
  active: '执行中',
  pending: '待生成',
}

export const mockPlanStats = {
  pending: 15,
  draft: 6,
  review: 9,
  active: 268,
  total: 298,
}

export const mockPlanList: MockPlanRow[] = [
  {
    id: 1,
    name: '王淑兰',
    gender: '女',
    age: 67,
    diseases: ['高血压', '糖尿病'],
    period: '2026.08.11-11.11',
    content: '血压/血糖监测 · 饮食 · 运动 · 复诊复查',
    genMode: 'AI生成 · 健管师完善',
    status: 'draft',
    creator: '周敏',
    reviewer: '—',
  },
  {
    id: 2,
    name: '沈秀兰',
    gender: '女',
    age: 72,
    diseases: ['高血压'],
    period: '2026.08.05-11.05',
    content: '血压监测 · 低盐饮食 · 步行计划',
    genMode: 'AI生成',
    status: 'active',
    creator: '周敏',
    reviewer: '张医生',
  },
  {
    id: 3,
    name: '李建国',
    gender: '男',
    age: 70,
    diseases: ['糖尿病'],
    period: '—',
    content: '管理目标已生效，尚未生成方案',
    genMode: '—',
    status: 'pending',
    creator: '—',
    reviewer: '—',
  },
  {
    id: 4,
    name: '赵国华',
    gender: '男',
    age: 65,
    diseases: ['冠心病', '高血压'],
    period: '2026.08.01-11.01',
    content: '血压监测 · 心脏康复运动 · 复诊复查',
    genMode: 'AI生成 · 健管师完善',
    status: 'review',
    creator: '周敏',
    reviewer: '王医生',
  },
  {
    id: 5,
    name: '陈秀英',
    gender: '女',
    age: 69,
    diseases: ['慢阻肺'],
    period: '2026.07.20-10.20',
    content: '症状监测 · 呼吸训练 · 急性加重预警',
    genMode: 'AI生成',
    status: 'active',
    creator: '刘芳',
    reviewer: '周医生',
  },
]

/** 方案关联会员（AI 生成 / 方案详情共用） */
export const mockPlanMember = {
  id: 1,
  name: '王淑兰',
  gender: '女',
  age: 67,
  diseases: ['高血压', '糖尿病'],
  doctor: '李医生',
  manager: '周敏',
  periodStart: '2026-08-11',
  periodEnd: '2026-11-11',
  goalCount: 8,
  completeness: 82,
  /** AI 生成前置条件标签 */
  conditions: [
    { label: '健康档案完整', tone: 'green' },
    { label: '管理目标已生效', tone: 'green' },
    { label: '近期数据已同步', tone: 'blue' },
  ] as Array<{ label: string; tone: 'green' | 'blue' }>,
}

/** 方案模块（左栏导航） */
export interface MockPlanModule {
  key: string
  name: string
  /** generated-已生成 confirm-需确认 */
  status: 'generated' | 'confirm'
}

export const mockPlanModules: MockPlanModule[] = [
  { key: 'overview', name: '方案概览', status: 'generated' },
  { key: 'monitor', name: '监测计划', status: 'confirm' },
  { key: 'diet', name: '饮食指导', status: 'generated' },
  { key: 'exercise', name: '运动指导', status: 'generated' },
  { key: 'review', name: '复诊复查', status: 'confirm' },
]

/** 核心管理目标（只读，引用管理目标模块） */
export const mockPlanCoreGoals = [
  '血压 90–130 / 60–80 mmHg',
  '空腹血糖 4.4–7.0 mmol/L',
  'BMI 18.5–24.0 kg/m²',
  '糖化血红蛋白 ≤7.0%',
]

/** 方案内容卡（方案概览中栏） */
export const mockPlanOverviewCards = [
  { key: 'monitor', title: '监测计划', count: '4项任务', desc: '血压每日2次；空腹血糖每周3次；体重每周1次', status: 'confirm' as const },
  { key: 'diet', title: '饮食指导', count: '食谱3套', desc: '控盐、控总能量、规律三餐，结合中等体力活动', status: 'generated' as const },
  { key: 'exercise', title: '运动指导', count: '3项运动', desc: '步行与弹力带训练，每周5天，关注运动禁忌', status: 'generated' as const },
  { key: 'review', title: '复诊复查', count: '2项建议', desc: '建议2周内复诊；按医嘱复查血压、血糖相关指标', status: 'confirm' as const },
]

/** 居家监测安排（监测计划模块） */
export interface MockMonitorItem {
  id: string
  name: string
  frequency: string
  timePoint: string
  source: string
  alert: string
}

export const mockMonitorItems: MockMonitorItem[] = [
  { id: 'bp', name: '血压', frequency: '每日 2 次', timePoint: '起床后、睡前', source: '设备自动上传', alert: '异常时提示就医' },
  { id: 'fbg', name: '空腹血糖', frequency: '每周 3 次', timePoint: '周一/三/五 早餐前', source: '本人或家属录入', alert: '连续2次超标提醒' },
  { id: 'pbg', name: '餐后2小时血糖', frequency: '每周 2 次', timePoint: '周二/六 晚餐后', source: '本人或家属录入', alert: '超目标触发指导' },
  { id: 'weight', name: '体重', frequency: '每周 1 次', timePoint: '周日晨起', source: '设备/手动录入', alert: '较基线±2kg提醒' },
]

/** 待确认事项 */
export const mockPlanTodos = ['确认血压测量频次', '确认血糖监测时点', '确认复诊复查建议']

/** AI 生成说明 / 摘要 */
export const mockPlanAi = {
  overviewNote:
    '近期收缩压连续高于目标，因此提高血压监测频次并增加风险提示；空腹血糖总体达标，维持每周3次监测；结合BMI偏高和中度体力活动，推荐控盐控能量饮食及中等强度步行。',
  version: '慢病管理知识库 2026.08',
  generatedAt: '08-11 11:06',
  basis: ['高血压 + 糖尿病档案', '8项已生效管理目标', '近30天健康数据', '近90天检查检验'],
  riskNote: '近期收缩压 148 mmHg，连续高于目标；建议加强测量并按医嘱复诊。',
  confirmRecords: [
    { label: '生成', value: 'AI助手 11:06' },
    { label: '完善', value: '周敏 未提交' },
    { label: '审核', value: '李医生 待提交' },
  ],
}

/** AI 生成依据（生成页左栏） */
export const mockGenerateBasis = [
  { key: 'profile', name: '健康档案', desc: '基础信息、健康史、专病档案', meta: '更新于 08-10 16:20' },
  { key: 'goals', name: '已生效管理目标', desc: '血压、血糖、BMI等目标范围', meta: '有效期至 2026-11-11' },
  { key: 'recent', name: '近期健康数据', desc: '近30天血压、血糖、体重趋势', meta: '最后同步 今日 10:30' },
  { key: 'labs', name: '检查检验', desc: '近90天血脂、糖化血红蛋白等', meta: '最近报告 07-28' },
]

/** 方案模块选项（生成页右栏） */
export const mockGenerateModules = ['血压/血糖监测', '饮食指导', '运动指导', '复诊复查', '用药提醒']

/** AI 生成进度步骤（进度弹窗） */
export const mockGenerateSteps = [
  '读取健康档案与专病档案',
  '匹配已生效管理目标',
  '分析近期健康数据与检查检验',
  '生成监测、饮食、运动与复诊复查建议',
]

/* ===== 指导模块（饮食 / 运动 / 复诊复查与健康教育） ===== */

/** 各模块会员条差异信息 */
export const mockPlanModuleHeaders: Record<string, { sub: string; center: string }> = {
  overview: { sub: '高血压 / 糖尿病', center: '引用管理目标 8项' },
  monitor: { sub: '高血压 / 糖尿病', center: '引用管理目标 8项' },
  diet: { sub: '高血压 / 糖尿病 · BMI 24.7', center: '目标：BMI 18.5–24.0 · 血压及血糖控制' },
  exercise: { sub: '高血压 / 糖尿病 · 近期收缩压偏高', center: '活动基础：日常步行20分钟 · 无明确运动禁忌' },
  review: { sub: '高血压 / 糖尿病 · 目标异常1项', center: '责任健管师 周敏' },
}

/** 饮食指导 */
export const mockDiet = {
  params: [
    { label: '身高', value: '160 cm' },
    { label: '体重', value: '63.2 kg' },
    { label: 'BMI', value: '24.7' },
    { label: '活动强度', value: '中等体力' },
  ],
  daily: [
    { label: '总能量', value: '约 1500 kcal', warn: false },
    { label: '食盐', value: '< 5 g/日', warn: true },
    { label: '饮水', value: '1500–1700 ml', warn: false },
    { label: '进餐', value: '三餐规律', warn: false },
  ],
  meals: [
    { name: '早餐', content: '杂粮粥1碗、鸡蛋1个、低脂奶250ml', note: '避免咸菜与含糖饮品' },
    { name: '午餐', content: '杂粮饭约125g、清蒸鱼100g、蔬菜300g', note: '少油烹调，先菜后饭' },
    { name: '晚餐', content: '杂粮饭约100g、豆制品100g、蔬菜250g', note: '睡前3小时完成晚餐' },
  ],
  principles: [
    '控盐控油，优先蒸煮炖；减少加工肉、腌制品和高糖点心',
    '主食粗细搭配，定量进餐；监测餐后血糖并根据结果调整',
    '如出现低血糖症状，按医嘱处理并联系责任人员',
  ],
  aiBasis: 'BMI略高且合并高血压、糖尿病，建议控制总能量与钠摄入，同时保持规律碳水分配。',
  aiSource: '来源：健康档案 + 管理目标',
  confirms: [
    { label: '无吞咽困难', checked: true },
    { label: '无明确食物过敏', checked: true },
    { label: '家庭可完成备餐', checked: true },
    { label: '需营养师会诊', checked: false },
  ],
  specialNote: '该建议不替代医生或营养师处方；肾功能异常、低血糖频发时需重新评估。',
}

/** 运动指导 */
export const mockExercise = {
  safety: '无胸痛、明显气促或近期急性事件；无严重视网膜病变或足部溃疡。',
  safetyWarn: '如静息血压 ≥180/110 mmHg、血糖过低或身体不适，暂停运动并联系医生。',
  fitt: [
    { label: '频率', value: '每周 5 天', warn: false },
    { label: '强度', value: '中等强度', warn: true },
    { label: '时长', value: '30–45 分钟', warn: false },
    { label: '类型', value: '步行 + 弹力带', warn: false },
  ],
  week: [
    { day: '周一', content: '快走', duration: '30分钟' },
    { day: '周二', content: '弹力带', duration: '30分钟' },
    { day: '周三', content: '快走', duration: '30分钟' },
    { day: '周四', content: '弹力带', duration: '30分钟' },
    { day: '周五', content: '快走', duration: '30分钟' },
    { day: '周六', content: '快走', duration: '30分钟' },
    { day: '周日', content: '休息', duration: '' },
  ],
  contents: [
    { name: '热身', desc: '慢走与关节活动 5–10分钟' },
    { name: '有氧运动', desc: '快走，保持可说话但不能唱歌的强度' },
    { name: '抗阻运动', desc: '弹力带上肢与下肢训练，每组10–15次' },
    { name: '整理活动', desc: '慢走与拉伸 5–10分钟' },
  ],
  warning: '运动中出现胸痛、明显气促、头晕、心悸或异常出汗时立即停止，原地休息并联系医护人员。',
  aiBasis: '基于BMI略高、血压控制目标及既往步行习惯，优先推荐低冲击有氧运动并逐步增加抗阻训练。',
  aiSource: '来源：档案 + 目标 + 风险评估',
  confirms: [
    { label: '无活动性胸痛', checked: true },
    { label: '无急性并发症', checked: true },
    { label: '无足部溃疡', checked: true },
    { label: '无低血糖频发', checked: true },
    { label: '需要医生运动处方', checked: false },
  ],
  stageGoal: '2周内达到每周150分钟中等强度活动；无不适和异常事件。',
}

/** 复诊复查与健康教育 */
export const mockRevisit = {
  logic: '依据疾病、近期检查与管理目标提供复诊复查及健康教育建议；不展示机构内部随访安排。',
  items: [
    { name: '复诊复查建议', date: '2026-08-18', channel: '电话 / 视频', target: '患者端提醒', desc: '确认监测执行与方案理解', status: 'confirm' as const },
    { name: '健康教育要点', date: '每月第1个工作日', channel: '电话', target: '患者端内容', desc: '评估目标达成、饮食与运动', status: 'generated' as const },
    { name: '方案中期复核', date: '2026-09-25', channel: '线上 / 门诊', target: '责任医生 李医生', desc: '复核目标与方案适宜性', status: 'generated' as const },
    { name: '方案到期评估', date: '2026-11-08', channel: '电话 + 评估', target: '责任医生确认', desc: '完成总结并决定续期', status: 'generated' as const },
  ],
  risks: [
    '血压或血糖连续超出管理目标 → 建议尽快联系医生',
    '胸痛、严重低血糖或严重气促 → 立即就医',
    '未按医嘱完成复查 → 在患者端提示',
    '具体就医安排以医生意见为准',
  ],
  pageContent: { guide: 4, risk: 4, note: '生效后自动进入责任人员待办' },
  templates: ['建议复诊时间', '建议复查项目', '就医前准备', '疾病健康教育', '高风险症状提示'],
  channelNote: '电话优先；必要时视频或门诊。服务人员现场反馈同步记录至服务记录。',
  aiNote: 'AI已结合管理目标、近期检查和活动强度生成建议，最终内容须由医生审核。',
}

/* ===== 医生操作 ===== */

/** 执行详情（设计稿：详情.png） */
export const mockExecution = {
  version: 'V1.0',
  status: '执行中',
  dayIndex: 28,
  remaining: 64,
  completion: 64,
  goalsMet: '6 / 8项',
  weekAbnormal: 2,
  weekRange: '08月31日—09月06日',
  taskDone: 18,
  taskTotal: 24,
  taskRate: 75,
  tasks: [
    { name: '血压监测', plan: '每日2次', progress: '12 / 14 次', note: '完成良好', status: 'normal' as const },
    { name: '空腹血糖', plan: '每周3次', progress: '2 / 3 次', note: '周五待测', status: 'pending' as const },
    { name: '饮食打卡', plan: '每日1次', progress: '6 / 7 次', note: '周二未记录', status: 'pending' as const },
    { name: '运动计划', plan: '每周5次', progress: '4 / 5 次', note: '累计132分钟', status: 'normal' as const },
    { name: '下次复诊建议', plan: '09-01', progress: '已完成', note: '方案理解良好', status: 'done' as const },
  ],
  dataNote: '方案执行数据来自健康数据、用药记录和服务履约；随访记录仅用于更新档案，不作为患者方案模块。',
  metrics: [
    { name: '收缩压', value: '148 mmHg', status: '超出目标', tone: 'danger' as const },
    { name: '空腹血糖', value: '6.8 mmol/L', status: '达标', tone: 'success' as const },
    { name: 'BMI', value: '24.3 kg/m²', status: '接近目标', tone: 'success' as const },
  ],
  activities: [
    { date: '09-06', text: '血压148/86，触发风险提醒' },
    { date: '09-05', text: '完成30分钟快走' },
    { date: '09-04', text: '空腹血糖6.8，达标' },
    { date: '09-01', text: '完成居家监测' },
    { date: '08-28', text: '医生审核通过，方案生效' },
  ],
  exceptionNote: '收缩压连续2次高于目标，已提示尽快联系责任医生。',
}

/** 医生审核（设计稿：医生审核.png） */
export const mockPlanAudit = {
  version: 'V0.2',
  submitter: '周敏',
  submittedAt: '08-11 11:40',
  catalog: [
    { key: 'overview', name: '方案概览', state: 'pass' as const },
    { key: 'monitor', name: '监测计划', state: 'warn' as const },
    { key: 'diet', name: '饮食指导', state: 'pass' as const },
    { key: 'exercise', name: '运动指导', state: 'pass' as const },
    { key: 'review', name: '复诊复查', state: 'warn' as const },
  ],
  summary: [
    { label: '目标一致性', value: '通过' },
    { label: '方案完整性', value: '通过' },
    { label: '风险项', value: '2项' },
    { label: '禁忌冲突', value: '未发现' },
  ],
  items: [
    {
      key: 'goal',
      title: '管理目标一致性',
      tone: 'blue' as const,
      tag: '通过',
      content: '方案引用血压 90–130 / 60–80 mmHg、空腹血糖 4.4–7.0 mmol/L，与当前生效目标一致。',
    },
    {
      key: 'bp',
      title: '血压监测频次',
      tone: 'plain' as const,
      content: '方案内容：AI建议每日2次，近期收缩压连续高于目标。',
      opinion: '医生意见：建议保留每日2次，连续7天后根据趋势调整。',
      action: '确认通过',
    },
    {
      key: 'revisit',
      title: '建议复查时间',
      tone: 'orange' as const,
      content: '方案内容：建议患者于2周内完成复诊复查。',
      opinion: '医生意见：近期指标异常，建议调整为生效后3天内完成。',
      action: '建议修改',
    },
    {
      key: 'exercise',
      title: '运动强度',
      tone: 'plain' as const,
      content: '方案内容：中等强度步行30–45分钟，每周5天。',
      opinion: '医生意见：未发现禁忌；静息血压过高时暂停运动。',
      action: '确认通过',
    },
  ],
  opinion: '方案整体合理。建议2周内复查血压与空腹血糖，其余患者指导内容通过。',
  source: [
    'AI生成 V0.1',
    '健管师完善 V0.2',
    '知识库版本 2026.08',
    '生成时间 08-11 11:06',
  ],
  changes: [
    { time: '11:20', text: '调整血压监测频次' },
    { time: '11:25', text: '确认饮食指导' },
    { time: '11:31', text: '确认运动禁忌' },
    { time: '11:38', text: '确认复诊复查建议' },
    { time: '11:40', text: '提交医生审核' },
  ],
  effectNote: '审核通过后患者方案生效并推送C端；内部随访任务由V5按专病管理规则和风险等级独立生成。',
}

/** 方案已退回修改（设计稿：医生退回.png） */
export const mockPlanReturned = {
  doctor: '李医生',
  time: '08-13 10:20',
  opinion:
    '运动指导未充分考虑患者冠心病风险，请补充运动禁忌；复查建议需明确“出现胸痛立即就医”，并重新核对血糖监测频次。',
  modules: [
    { name: '运动指导', todo: '补充禁忌与停止条件' },
    { name: '复诊复查', todo: '增加胸痛就医提示' },
    { name: '监测计划', todo: '复核血糖监测频次' },
  ],
  versionNote: [
    '当前患者执行：V1.2（08-01生效）',
    '本次返修草稿：V1.3（未生效）',
    '退回不会中断V1.2，也不会重复推送C端。',
  ],
  flow: ['待医生审核', '待健管师修改', '待医生复审', '已生效并推送C端'],
  flowTransitions: ['医生退回', '重新提交', '审核通过'],
  assignee: { handler: '健管师周敏', deadline: '今日18:00', todo: '方案返修 1条' },
}

/** 返修并重新提交（设计稿：返修并重新提交.png） */
export const mockPlanRevise = {
  changes: [
    { name: '运动指导', desc: '已补充胸痛、明显气促、头晕时立即停止运动' },
    { name: '复诊复查', desc: '已增加出现胸痛立即就医及急诊提示' },
    { name: '监测计划', desc: '血糖监测调整为每周3天、每日2次' },
  ],
  note: '已按退回意见完成三项修改，并重新核对管理目标、近期风险和活动强度。',
  version: 'V1.3 · 健管师返修稿',
  checks: [
    '退回意见均已响应',
    '关键风险提示已补充',
    '未修改医生管理目标',
    '方案不包含内部随访任务',
    '旧版仍保持执行中',
  ],
  afterNote: '状态变为“待医生复审”；审核通过才替换旧版本并推送C端。',
}
