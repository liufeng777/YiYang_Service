/**
 * 健康档案模块 mock 数据（设计稿示例）
 * 接入后端后删除，页面改调 memberApi（GET /v1/staff/members 等）
 */

/** 档案列表行（聚合展示字段，对齐设计稿「健康档案列表」） */
export interface MockRecordRow {
  id: number
  name: string
  gender: '男' | '女'
  age: number
  phone: string
  diseases: string[]
  risk: 'high' | 'mid' | 'low'
  bp: string
  bpStatus: string
  glucose: string
  glucoseStatus: string
  metricTime: string
  completeness: number
  syncStatus: string
  syncOk: boolean
  org: string
  manager: string
  planStatus?: string
  nextTaskDate?: string
  nextTaskType?: string
}

export const mockRecordStats = {
  total: 1286,
  totalDelta: 42,
  highRisk: 36,
  highRiskDelta: 3,
  incomplete: 87,
  todaySync: 124,
  platformSync: 96,
}

export const mockRecordList: MockRecordRow[] = [
  {
    id: 1,
    name: '沈秀兰',
    gender: '女',
    age: 67,
    phone: '138****2168',
    diseases: ['高血压', '2型糖尿病'],
    risk: 'high',
    bp: '128/76',
    bpStatus: '正常',
    glucose: '6.8',
    glucoseStatus: '餐后偏高',
    metricTime: '今日 08:30 更新',
    completeness: 92,
    syncStatus: '医养平台同步 · 正常',
    syncOk: true,
    org: '城东颐养中心',
    manager: '周敏',
    planStatus: '方案已发布',
    nextTaskDate: '8月10日',
    nextTaskType: '糖尿病随访',
  },
  {
    id: 2,
    name: '王建国',
    gender: '男',
    age: 72,
    phone: '139****5520',
    diseases: ['冠心病'],
    risk: 'mid',
    bp: '136/82',
    bpStatus: '偏高',
    glucose: '5.6',
    glucoseStatus: '正常',
    metricTime: '今日 07:50 更新',
    completeness: 78,
    syncStatus: '本人上传 · 待核验',
    syncOk: false,
    org: '城东颐养中心',
    manager: '张敏',
    planStatus: '方案执行中',
    nextTaskDate: '8月12日',
    nextTaskType: '用药复核',
  },
  {
    id: 3,
    name: '李桂芳',
    gender: '女',
    age: 75,
    phone: '137****8834',
    diseases: ['慢阻肺'],
    risk: 'low',
    bp: '122/74',
    bpStatus: '正常',
    glucose: '5.2',
    glucoseStatus: '正常',
    metricTime: '昨日 18:20 更新',
    completeness: 64,
    syncStatus: '医养平台同步 · 正常',
    syncOk: true,
    org: '城西护理院',
    manager: '周敏',
    nextTaskDate: undefined,
    nextTaskType: undefined,
  },
  {
    id: 4,
    name: '赵德柱',
    gender: '男',
    age: 80,
    phone: '136****0907',
    diseases: ['高血压', '骨质疏松'],
    risk: 'high',
    bp: '152/90',
    bpStatus: '高于目标',
    glucose: '6.1',
    glucoseStatus: '正常',
    metricTime: '今日 06:40 更新',
    completeness: 85,
    syncStatus: '医养平台同步 · 异常',
    syncOk: false,
    org: '城东颐养中心',
    manager: '李强',
    planStatus: '方案待制定',
    nextTaskDate: '8月09日',
    nextTaskType: '高血压随访',
  },
  {
    id: 5,
    name: '陈美玲',
    gender: '女',
    age: 63,
    phone: '158****3342',
    diseases: ['2型糖尿病'],
    risk: 'mid',
    bp: '126/78',
    bpStatus: '正常',
    glucose: '7.4',
    glucoseStatus: '餐后偏高',
    metricTime: '今日 09:05 更新',
    completeness: 71,
    syncStatus: '医养平台同步 · 正常',
    syncOk: true,
    org: '健康驿站·东湖站',
    manager: '张敏',
    planStatus: '方案已发布',
    nextTaskDate: '8月15日',
    nextTaskType: '糖尿病随访',
  },
  {
    id: 6,
    name: '刘长海',
    gender: '男',
    age: 69,
    phone: '135****7716',
    diseases: [],
    risk: 'low',
    bp: '118/72',
    bpStatus: '正常',
    glucose: '5.0',
    glucoseStatus: '正常',
    metricTime: '昨日 20:10 更新',
    completeness: 58,
    syncStatus: '本人上传 · 待核验',
    syncOk: false,
    org: '健康驿站·东湖站',
    manager: '李强',
    nextTaskDate: undefined,
    nextTaskType: undefined,
  },
]

/** 档案概览 mock（对应设计稿「健康概览 / 专病档案Tab」沈秀兰） */
export const mockProfile = {
  id: 1,
  name: '沈秀兰',
  gender: '女',
  age: 67,
  profileNo: 'JK20260800021',
  diseases: ['高血压', '2型糖尿病'],
  risk: 'high' as const,
  doctor: '王医生',
  manager: '张敏',
  org: '城东颐养中心',
  overview: {
    completeness: 92,
    height: '156cm',
    weight: '62.4kg',
    bmi: '25.7',
    bmiStatus: '超重',
    bp: '148/86 mmHg',
    activity: '中度体力劳动',
    activityConfirm: '最近确认 08-12 · 随访',
    glucose: '6.8 mmol/L',
    allergy: '青霉素',
    riskText: '高风险',
  },
  metrics: [
    { code: 'bp', name: '血压', value: '148/86', unit: 'mmHg', status: '高于目标', level: 'high' as const },
    { code: 'glucose', name: '血糖', value: '6.8', unit: 'mmol/L', status: '餐后偏高', level: 'mid' as const },
    { code: 'hr', name: '心率', value: '72', unit: '次/分', status: '正常', level: 'low' as const },
    { code: 'spo2', name: '血氧', value: '97', unit: '%', status: '正常', level: 'low' as const },
  ],
  recentRecords: [
    {
      id: 1,
      dot: 'high' as const,
      date: '08月12日',
      title: '居家血压复测',
      summary: '血压 152/90 mmHg，高于管理目标，已提醒注意休息并复测',
      operator: '张敏',
    },
    {
      id: 2,
      dot: 'low' as const,
      date: '08月08日',
      title: '糖尿病随访',
      summary: '餐后血糖 6.8 mmol/L，饮食执行良好，继续当前方案',
      operator: '张敏',
    },
    {
      id: 3,
      dot: 'info' as const,
      date: '08月05日',
      title: '高血压随访',
      summary: '血压 148/86 mmHg，已完成用药核对，无不良反应',
      operator: '周敏',
    },
  ],
  diseaseProfiles: [
    {
      id: 1,
      key: 'hypertension',
      name: '高血压专病档案',
      dot: 'low' as const,
      summary: '2级 · 高危',
      updated: '最近更新 08月08日',
      status: '已确认',
      statusLevel: 'low' as const,
      done: true,
    },
    {
      id: 2,
      key: 'diabetes',
      name: '糖尿病专病档案',
      dot: 'info' as const,
      summary: '糖尿病 · 未达标',
      updated: '最近更新 07月28日',
      status: '管理中',
      statusLevel: 'info' as const,
      done: true,
    },
    {
      id: 3,
      key: 'chd',
      name: '冠心病专病档案',
      dot: 'mid' as const,
      summary: '稳定型冠心病 · 极高危',
      updated: '已预建，待补充诊断依据',
      status: '待完善',
      statusLevel: 'mid' as const,
      done: false,
    },
    {
      id: 4,
      key: 'copd',
      name: '慢阻肺专病档案',
      dot: 'mid' as const,
      summary: 'GOLD 2级 · B组',
      updated: '已预建，待补充肺功能依据',
      status: '待完善',
      statusLevel: 'mid' as const,
      done: false,
    },
  ],
  progress: {
    planTag: '方案V2生效中',
    goals: '3项',
    goalsDone: '2项达标',
    plan: '执行中',
    planWeek: '第2周',
    followups: '3/4次',
    nextFollowup: '下次08月12日',
    assessment: '高风险',
    assessmentDate: '08月08日',
  },
}

/** 新建建档页 mock：实名会员查询结果（对应设计稿「关联会员」） */
export const mockVerifiedMember = {
  name: '沈秀兰',
  gender: '女',
  age: 67,
  memberId: 'XFY-M-0001286',
  phone: '138****4628',
  birthday: '1959年3月12日',
  nation: '汉族',
  address: '北京市丰台区方庄芳城园一区 3 号楼 2 单元 502',
}

/** 建档成功页 mock（对应设计稿「进入完善档案」） */
export const mockCreateSuccess = {
  profileNo: 'XFY-HA-20260807-01286',
  name: '沈秀兰',
  gender: '女',
  age: 67,
  org: '城东颐养中心',
  identity: '实名会员',
  source: '机构新建',
  tags: ['高血压', '糖尿病', '中风险', '家庭重点关注'],
}

/** 批量导入 mock（对应设计稿「上传与校验 / 导入结果」） */
export const mockImportPreview = {
  fileName: '健康档案导入_城东护理院.xlsx',
  fileMeta: 'Excel · 120条记录 · 上传人赵海',
  scope: '当前机构数据',
  note: '导入前不会覆盖已有档案',
  total: 120,
  creatable: 108,
  linked: 7,
  failed: 5,
  realnameMatched: 108,
  pendingRealname: 12,
  requiredComplete: 115,
  phoneDuplicated: '2条待确认',
  summary: '108条可创建最小健康档案；7条关联已有档案；5条字段错误将跳过，并生成失败明细。',
}

export const mockImportResult = {
  batchNo: 'IMP20260817003',
  created: 108,
  linked: 7,
  failed: 5,
  pendingRealname: 12,
}

/* ===== 专病档案详情（设计稿：高血压/糖尿病/冠心病/慢阻肺/Drawer） ===== */

export type TagLevel = 'high' | 'mid' | 'low' | 'info'

export interface DiseaseBaseField {
  label: string
  value: string
  danger?: boolean
}

export interface DiseaseMetric {
  name: string
  value: string
  unit: string
  target: string
  status: '超出目标' | '达标'
  level: TagLevel
}

export interface DiseaseTimelineItem {
  id: number
  dot: TagLevel
  date: string
  title: string
  summary: string
  source: string
}

export interface DiseaseDrawerField {
  key: string
  label: string
  type: 'date' | 'select' | 'input'
  value: string
  options?: string[]
}

export interface DiseaseChipGroup {
  label: string
  tone: 'green' | 'yellow'
  options: string[]
  selected: string[]
}

export interface DiseaseDetail {
  key: string
  name: string
  title: string
  tags: string[]
  baseFields: DiseaseBaseField[]
  metrics: DiseaseMetric[]
  timeline: DiseaseTimelineItem[]
  goal: { planTag: string; period: string; core: string; coreNote: string }
  complications: { groupLabel: string; tags: { text: string; level: TagLevel }[] }[]
  quality: { completeness: number; rows: { label: string; value: string; warn?: boolean }[]; updated: string }
  drawer: {
    fields: DiseaseDrawerField[]
    chipGroups: DiseaseChipGroup[]
    note: string
  }
}

const commonTimelineSource = ['本人 / 智能血压计', '王医生', '北京市第三医院']

export const mockDiseaseDetails: Record<string, DiseaseDetail> = {
  hypertension: {
    key: 'hypertension',
    name: '高血压',
    title: '高血压专病档案',
    tags: ['高血压', '2型糖尿病'],
    baseFields: [
      { label: '确诊日期', value: '2018年3月12日' },
      { label: '高血压分级', value: '2级高血压' },
      { label: '危险分层', value: '高危', danger: true },
      { label: '诊断机构', value: '北京市第三医院' },
      { label: '诊断依据', value: '非同日3次血压 ≥ 140/90 mmHg' },
      { label: '当前状态', value: '持续管理中' },
    ],
    metrics: [
      { name: '收缩压', value: '148', unit: 'mmHg', target: '目标 120-139', status: '超出目标', level: 'high' },
      { name: '舒张压', value: '86', unit: 'mmHg', target: '目标 70-89', status: '达标', level: 'low' },
      { name: 'BMI', value: '25.7', unit: 'kg/m²', target: '目标 18.5-23.9', status: '超出目标', level: 'mid' },
      { name: 'LDL-C', value: '2.4', unit: 'mmol/L', target: '目标 < 2.6', status: '达标', level: 'low' },
    ],
    timeline: [
      { id: 1, dot: 'mid', date: '08月08日', title: '居家血压复测', summary: '148/86 mmHg，收缩压高于当前管理目标', source: commonTimelineSource[0] },
      { id: 2, dot: 'low', date: '07月28日', title: '高血压随访', summary: '用药依从性良好，建议保持低盐饮食与规律运动', source: commonTimelineSource[1] },
      { id: 3, dot: 'info', date: '06月15日', title: '门诊诊疗', summary: '确认2级高血压、高危分层，更新专病档案', source: commonTimelineSource[2] },
    ],
    goal: {
      planTag: '方案 V2 生效中',
      period: '2026.08.01 — 2026.10.31',
      core: '血压达标率 ≥ 80%',
      coreNote: '近30天达标率 67%',
    },
    complications: [
      {
        groupLabel: '靶器官损害 / 并发症',
        tags: [
          { text: '冠心病', level: 'high' },
          { text: '未见肾损害', level: 'low' },
          { text: '无脑卒中史', level: 'low' },
        ],
      },
      {
        groupLabel: '主要危险因素',
        tags: [
          { text: '高盐饮食', level: 'mid' },
          { text: '超重', level: 'mid' },
          { text: '家族史', level: 'info' },
        ],
      },
    ],
    quality: {
      completeness: 92,
      rows: [
        { label: '基本信息', value: '已完成' },
        { label: '诊断与分层', value: '已确认' },
        { label: '并发症筛查', value: '建议复查', warn: true },
        { label: '最近更新', value: '2026.08.08' },
      ],
      updated: '2026.08.08',
    },
    drawer: {
      fields: [
        { key: 'diagnosed_date', label: '确诊日期', type: 'date', value: '2018-03-12' },
        { key: 'grade', label: '高血压分级', type: 'select', value: '2级高血压', options: ['1级高血压', '2级高血压', '3级高血压'] },
        { key: 'risk_level', label: '危险分层', type: 'select', value: '高危', options: ['低危', '中危', '高危', '极高危'] },
        { key: 'status', label: '当前状态', type: 'select', value: '持续管理中', options: ['持续管理中', '已控制', '转诊治疗中'] },
        { key: 'org', label: '诊断机构', type: 'input', value: '北京市第三医院' },
        { key: 'basis', label: '诊断依据', type: 'input', value: '非同日3次血压 ≥ 140/90 mmHg' },
      ],
      chipGroups: [
        { label: '靶器官损害 / 并发症', tone: 'green', options: ['冠心病', '脑卒中', '慢性肾病', '视网膜病变'], selected: ['冠心病'] },
        { label: '主要危险因素', tone: 'yellow', options: ['高盐饮食', '超重', '吸烟', '高血压家族史'], selected: ['高盐饮食', '超重', '高血压家族史'] },
      ],
      note: '近期居家收缩压仍偏高，建议继续复测并评估方案。',
    },
  },
  diabetes: {
    key: 'diabetes',
    name: '糖尿病',
    title: '糖尿病专病档案',
    tags: ['糖尿病', '分型待确认'],
    baseFields: [
      { label: '确诊日期', value: '2018年3月12日' },
      { label: '糖尿病分型', value: '分型待确认' },
      { label: '控制状态', value: '未达标', danger: true },
      { label: '诊断机构', value: '北京市第三医院' },
      { label: '诊断依据', value: '空腹血糖 ≥ 7.0 mmol/L 或 HbA1c ≥ 6.5%' },
      { label: '当前状态', value: '持续管理中' },
    ],
    metrics: [
      { name: '空腹血糖', value: '7.8', unit: 'mmol/L', target: '目标 4.4-7.0', status: '超出目标', level: 'high' },
      { name: '糖化血红蛋白', value: '7.2', unit: 'mmol/L', target: '目标 < 7.0%', status: '达标', level: 'low' },
      { name: 'BMI', value: '25.7', unit: 'kg/m²', target: '目标 18.5-23.9', status: '超出目标', level: 'mid' },
      { name: 'LDL-C', value: '2.4', unit: 'mmol/L', target: '目标 < 2.6', status: '达标', level: 'low' },
    ],
    timeline: [
      { id: 1, dot: 'mid', date: '08月08日', title: '居家血糖复测', summary: '空腹血糖 7.8 mmol/L，高于当前管理目标', source: commonTimelineSource[0] },
      { id: 2, dot: 'low', date: '07月28日', title: '糖尿病随访', summary: '用药依从性良好，建议保持低盐饮食与规律运动', source: commonTimelineSource[1] },
      { id: 3, dot: 'info', date: '06月15日', title: '门诊诊疗', summary: '确认2型糖尿病，更新专病档案', source: commonTimelineSource[2] },
    ],
    goal: {
      planTag: '方案 V2 生效中',
      period: '2026.08.01 — 2026.10.31',
      core: '糖化血红蛋白达标率 ≥ 80%',
      coreNote: '最近一次 HbA1c 7.2%，暂未达标',
    },
    complications: [
      {
        groupLabel: '糖尿病并发症筛查',
        tags: [
          { text: '未见糖尿病肾病', level: 'high' },
          { text: '眼底筛查待复查', level: 'mid' },
          { text: '足部风险低', level: 'low' },
        ],
      },
      {
        groupLabel: '主要危险因素',
        tags: [
          { text: '高盐饮食', level: 'mid' },
          { text: '超重', level: 'mid' },
          { text: '家族史', level: 'info' },
        ],
      },
    ],
    quality: {
      completeness: 92,
      rows: [
        { label: '基本信息', value: '已完成' },
        { label: '诊断与分层', value: '已确认' },
        { label: '并发症筛查', value: '建议复查', warn: true },
        { label: '最近更新', value: '2026.08.08' },
      ],
      updated: '2026.08.08',
    },
    drawer: {
      fields: [
        { key: 'diagnosed_date', label: '确诊日期', type: 'date', value: '2018-03-12' },
        { key: 'subtype', label: '糖尿病分型', type: 'select', value: '分型待确认', options: ['1型糖尿病', '2型糖尿病', '分型待确认'] },
        { key: 'control', label: '控制状态', type: 'select', value: '未达标', options: ['达标', '未达标'] },
        { key: 'status', label: '当前状态', type: 'select', value: '持续管理中', options: ['持续管理中', '已控制', '转诊治疗中'] },
        { key: 'org', label: '诊断机构', type: 'input', value: '北京市第三医院' },
        { key: 'basis', label: '诊断依据', type: 'input', value: '空腹血糖 ≥ 7.0 mmol/L 或 HbA1c ≥ 6.5%' },
      ],
      chipGroups: [
        { label: '糖尿病并发症', tone: 'green', options: ['糖尿病肾病', '视网膜病变', '周围神经病变', '糖尿病足'], selected: [] },
        { label: '主要危险因素', tone: 'yellow', options: ['高盐饮食', '超重', '吸烟', '糖尿病家族史'], selected: ['高盐饮食', '超重'] },
      ],
      note: '空腹血糖持续偏高，建议复查 HbA1c 并评估用药方案。',
    },
  },
  chd: {
    key: 'chd',
    name: '冠心病',
    title: '冠心病专病档案',
    tags: ['冠心病', '2型糖尿病'],
    baseFields: [
      { label: '确诊日期', value: '2018年3月12日' },
      { label: '临床类型', value: '稳定型冠心病' },
      { label: '心血管风险', value: '极高危', danger: true },
      { label: '诊断机构', value: '北京市第三医院' },
      { label: '诊断依据', value: '冠脉CTA提示前降支狭窄约60%' },
      { label: '当前状态', value: '持续管理中' },
    ],
    metrics: [
      { name: 'LDL-C', value: '2.4', unit: 'mmol/L', target: '目标 < 1.8', status: '超出目标', level: 'high' },
      { name: '静息心率', value: '68', unit: 'mmol/L', target: '目标 55-70 次/分', status: '达标', level: 'low' },
      { name: 'BMI', value: '25.7', unit: 'kg/m²', target: '目标 18.5-23.9', status: '超出目标', level: 'mid' },
      { name: '心绞痛发作', value: '1', unit: '次/月', target: '目标 ≤ 1次/月', status: '达标', level: 'low' },
    ],
    timeline: [
      { id: 1, dot: 'mid', date: '08月08日', title: '症状随访', summary: '近30天心绞痛发作1次，无急诊就诊', source: commonTimelineSource[0] },
      { id: 2, dot: 'low', date: '07月28日', title: '冠心病随访', summary: '用药依从性良好，建议保持低盐饮食与规律运动', source: commonTimelineSource[1] },
      { id: 3, dot: 'info', date: '06月15日', title: '门诊诊疗', summary: '确认稳定型冠心病，更新专病档案', source: commonTimelineSource[2] },
    ],
    goal: {
      planTag: '方案 V2 生效中',
      period: '2026.08.01 — 2026.10.31',
      core: 'LDL-C 达标并控制心绞痛',
      coreNote: 'LDL-C 2.4 mmol/L，暂未达标',
    },
    complications: [
      {
        groupLabel: '心血管事件与并发症',
        tags: [
          { text: '无心肌梗死史', level: 'high' },
          { text: '无心力衰竭', level: 'low' },
          { text: '无脑卒中史', level: 'low' },
        ],
      },
      {
        groupLabel: '主要危险因素',
        tags: [
          { text: '高盐饮食', level: 'mid' },
          { text: '超重', level: 'mid' },
          { text: '家族史', level: 'info' },
        ],
      },
    ],
    quality: {
      completeness: 92,
      rows: [
        { label: '基本信息', value: '已完成' },
        { label: '诊断与分层', value: '已确认' },
        { label: '并发症筛查', value: '建议复查', warn: true },
        { label: '最近更新', value: '2026.08.08' },
      ],
      updated: '2026.08.08',
    },
    drawer: {
      fields: [
        { key: 'diagnosed_date', label: '确诊日期', type: 'date', value: '2018-03-12' },
        { key: 'clinical_type', label: '临床类型', type: 'select', value: '稳定型冠心病', options: ['稳定型冠心病', '不稳定型心绞痛', '心肌梗死后'] },
        { key: 'cv_risk', label: '心血管风险', type: 'select', value: '极高危', options: ['中危', '高危', '极高危'] },
        { key: 'status', label: '当前状态', type: 'select', value: '持续管理中', options: ['持续管理中', '已控制', '转诊治疗中'] },
        { key: 'org', label: '诊断机构', type: 'input', value: '北京市第三医院' },
        { key: 'basis', label: '诊断依据', type: 'input', value: '冠脉CTA提示前降支狭窄约60%' },
      ],
      chipGroups: [
        { label: '心血管事件与并发症', tone: 'green', options: ['心肌梗死史', '心力衰竭', '脑卒中史', '外周动脉疾病'], selected: [] },
        { label: '主要危险因素', tone: 'yellow', options: ['高盐饮食', '超重', '吸烟', '家族史'], selected: ['高盐饮食', '超重', '家族史'] },
      ],
      note: 'LDL-C 未达标，建议复查血脂并评估他汀剂量。',
    },
  },
  copd: {
    key: 'copd',
    name: '慢阻肺',
    title: '慢阻肺专病档案',
    tags: ['慢阻肺', '2型糖尿病'],
    baseFields: [
      { label: '确诊日期', value: '2018年3月12日' },
      { label: '气流受限分级', value: 'GOLD 2级' },
      { label: '综合评估分组', value: 'B组', danger: true },
      { label: '诊断机构', value: '北京市第三医院' },
      { label: '诊断依据', value: '肺功能检查 FEV1/FVC < 0.70' },
      { label: '当前状态', value: '持续管理中' },
    ],
    metrics: [
      { name: 'FEV1占预计值', value: '62', unit: '%', target: '目标 ≥ 60%', status: '超出目标', level: 'high' },
      { name: '静息血氧', value: '94', unit: '%', target: '目标 ≥ 93%', status: '达标', level: 'low' },
      { name: 'CAT评分', value: '14', unit: '分', target: '目标 < 10分', status: '超出目标', level: 'mid' },
      { name: '近一年急性加重', value: '1', unit: '次', target: '目标 ≤ 1次/年', status: '达标', level: 'low' },
    ],
    timeline: [
      { id: 1, dot: 'mid', date: '08月08日', title: '血氧复测', summary: '静息血氧94%，处于当前管理目标范围', source: commonTimelineSource[0] },
      { id: 2, dot: 'low', date: '07月28日', title: '慢阻肺随访', summary: '用药依从性良好，建议保持低盐饮食与规律运动', source: commonTimelineSource[1] },
      { id: 3, dot: 'info', date: '06月15日', title: '门诊诊疗', summary: '确认慢阻肺GOLD 2级B组，更新专病档案', source: commonTimelineSource[2] },
    ],
    goal: {
      planTag: '方案 V2 生效中',
      period: '2026.08.01 — 2026.10.31',
      core: '减少急性加重并改善症状',
      coreNote: 'CAT 14分，需继续干预',
    },
    complications: [
      {
        groupLabel: '并发症与急性加重风险',
        tags: [
          { text: '无呼吸衰竭', level: 'high' },
          { text: '无肺心病', level: 'low' },
          { text: '近一年急性加重1次', level: 'low' },
        ],
      },
      {
        groupLabel: '主要危险因素',
        tags: [
          { text: '高盐饮食', level: 'mid' },
          { text: '超重', level: 'mid' },
          { text: '家族史', level: 'info' },
        ],
      },
    ],
    quality: {
      completeness: 92,
      rows: [
        { label: '基本信息', value: '已完成' },
        { label: '诊断与分层', value: '已确认' },
        { label: '并发症筛查', value: '建议复查', warn: true },
        { label: '最近更新', value: '2026.08.08' },
      ],
      updated: '2026.08.08',
    },
    drawer: {
      fields: [
        { key: 'diagnosed_date', label: '确诊日期', type: 'date', value: '2018-03-12' },
        { key: 'gold', label: '气流受限分级', type: 'select', value: 'GOLD 2级', options: ['GOLD 1级', 'GOLD 2级', 'GOLD 3级', 'GOLD 4级'] },
        { key: 'group', label: '综合评估分组', type: 'select', value: 'B组', options: ['A组', 'B组', 'C组', 'D组'] },
        { key: 'status', label: '当前状态', type: 'select', value: '持续管理中', options: ['持续管理中', '已控制', '转诊治疗中'] },
        { key: 'org', label: '诊断机构', type: 'input', value: '北京市第三医院' },
        { key: 'basis', label: '诊断依据', type: 'input', value: '肺功能检查 FEV1/FVC < 0.70' },
      ],
      chipGroups: [
        { label: '并发症与急性加重风险', tone: 'green', options: ['呼吸衰竭', '肺心病', '气胸史', '近一年急性加重'], selected: ['近一年急性加重'] },
        { label: '主要危险因素', tone: 'yellow', options: ['吸烟', '职业粉尘暴露', '超重', '家族史'], selected: ['超重'] },
      ],
      note: 'CAT 评分偏高，建议加强吸入剂使用指导与肺康复训练。',
    },
  },
}

/* ===== 用药记录（设计稿：用药记录.png） ===== */

export interface MedicationItem {
  id: number
  name: string
  usage: string
  start: string
  source: string
  adherence: string
  level: TagLevel
}

export const mockMedications: Record<'current' | 'history' | 'pending', MedicationItem[]> = {
  current: [
    { id: 1, name: '苯磺酸氨氯地平片', usage: '每次5mg · 每日1次 · 早餐后', start: '2025-12-10', source: '北京朝阳医院处方', adherence: '规律', level: 'low' },
    { id: 2, name: '二甲双胍缓释片', usage: '每次0.5g · 每日2次 · 随餐', start: '2024-08-22', source: '幸福颐养护理院处方', adherence: '偶有漏服', level: 'mid' },
    { id: 3, name: '阿托伐他汀钙片', usage: '每次20mg · 每晚1次', start: '2023-11-28', source: '北京安贞医院出院记录', adherence: '规律', level: 'low' },
    { id: 4, name: '阿司匹林肠溶片', usage: '每次100mg · 每日1次', start: '2023-11-28', source: '北京安贞医院出院记录', adherence: '待确认', level: 'info' },
  ],
  history: [
    { id: 5, name: '缬沙坦胶囊', usage: '每次80mg · 每日1次', start: '2022-06-15', source: '北京市第三医院处方', adherence: '已停用', level: 'info' },
    { id: 6, name: '格列美脲片', usage: '每次2mg · 每日1次', start: '2021-03-02', source: '北京市第三医院处方', adherence: '已停用', level: 'info' },
  ],
  pending: [
    { id: 7, name: '阿司匹林肠溶片', usage: '每次100mg · 每日1次', start: '2023-11-28', source: '北京安贞医院出院记录', adherence: '待确认', level: 'info' },
  ],
}

export const mockMedicationSummary = {
  current: 4,
  regular: 3,
  pending: 1,
  lastCheck: '2026-08-05',
  checker: '健管师周敏',
}

/* ===== 档案详情新版 Tab（设计稿：3.健康档案详情/） ===== */

/** 基础信息 Tab（基础信息.png） */
export const mockBasicInfo = {
  identity: [
    { label: '姓名', value: '沈秀兰' },
    { label: '性别', value: '女' },
    { label: '出生日期 / 年龄', value: '1959-03-12 / 67岁' },
    { label: '会员ID', value: 'JK20260800021' },
    { label: '手机号', value: '138****8219' },
    { label: '身份证件', value: '1101**********24' },
    { label: '居住地址', value: '北京市西城区月坛街道18号院', span: true },
  ],
  emergency: [
    { label: '姓名 / 关系', value: '张女士 / 女儿' },
    { label: '联系电话', value: '139****2168' },
    { label: '联系优先级', value: '第一联系人' },
  ],
  relation: {
    target: '沈秀兰 · 本人',
    operator: '张女士 · 女儿',
    authorized: true,
  },
  belonging: [
    { label: '当前机构', value: '城东颐养中心' },
    { label: '管理团队', value: '心脑血管管理团队' },
    { label: '责任医生', value: '王医生' },
    { label: '健康管理师', value: '张敏' },
  ],
}

/** 健康史 Tab（健康史.png） */
export const mockHealthHistory = {
  past: [
    { label: '既往病史', value: '高血压、糖尿病', note: '2022年确诊' },
    { label: '手术史', value: '胆囊切除术', note: '2018年' },
    { label: '过敏史', value: '青霉素', note: '皮疹反应' },
    { label: '家族史', value: '父亲：高血压', note: '本人填写' },
  ],
  risks: [
    { label: '吸烟', value: '从不吸烟' },
    { label: '饮酒', value: '偶尔' },
    { label: '睡眠', value: '6-7小时 / 一般' },
  ],
  lifestyle: [
    { label: '主食', value: '米饭为主，每餐约1碗' },
    { label: '饮食口味', value: '偏咸' },
    { label: '运动频率', value: '每周3次' },
    { label: '单次运动时间', value: '约30分钟' },
    { label: '劳动 / 活动强度', value: '中度体力活动', affectsPlan: true },
  ],
  updated: '2026-08-08',
  updater: '张敏',
}

/** 健康指标 Tab（健康指标.png） */
export const mockMetricsTab = {
  cards: [
    { name: '血压', value: '148/86', unit: 'mmHg', status: '高于目标', level: 'high' as TagLevel },
    { name: '血糖', value: '6.8', unit: 'mmol/L', status: '餐后偏高', level: 'mid' as TagLevel },
    { name: '心率', value: '72', unit: '次/分', status: '正常', level: 'low' as TagLevel },
    { name: '血氧', value: '97', unit: '%', status: '正常', level: 'low' as TagLevel },
    { name: '体重', value: '62.4', unit: 'kg', status: '较上月 -0.6', level: 'low' as TagLevel },
  ],
  trend: {
    title: '近7日血压趋势',
    target: '目标范围：收缩压 120-139 / 舒张压 70-89 mmHg',
    days: ['8/2', '8/3', '8/4', '8/5', '8/6', '8/7', '8/8'],
    systolic: [146, 139, 151, 144, 150, 136, 142],
    diastolic: [88, 84, 90, 82, 86, 78, 83],
    summary: '平均 142/83　最高 151/88　异常 3 次',
  },
  latest: [
    { id: 1, time: '今日 08:30', source: '本人 / 智能血压计', text: '血压 148/86' },
    { id: 2, time: '昨日 19:20', source: '本人手动记录', text: '血压 132/78' },
    { id: 3, time: '08月06日', source: '健康管理师随访', text: '血糖 6.8' },
    { id: 4, time: '08月05日', source: '本人手动记录', text: '体重 62.4kg' },
  ],
}

/** 健康记录 Tab（健康记录.png） */
export const mockHealthEvents = [
  { id: 1, dot: 'high' as TagLevel, time: '08月08日 10:20', title: '高风险异常回访', summary: '健管师张敏完成回访：患者无头晕胸闷，已提醒复测血压并通知责任医生。', module: '随访记录' },
  { id: 2, dot: 'mid' as TagLevel, time: '08月08日 08:30', title: '居家血压异常', summary: '用户记录 148/86 mmHg，高于个人管理目标，系统触发健康状况预警。', module: '健康指标' },
  { id: 3, dot: 'low' as TagLevel, time: '08月02日 16:40', title: '糖尿病专病随访', summary: '完成饮食、运动、用药依从及低血糖事件采集，更新健康史与分层数据。', module: '随访记录' },
  { id: 4, dot: 'info' as TagLevel, time: '07月28日 14:00', title: '高血压管理目标更新', summary: '责任医生调整收缩压目标与监测要求，生成新版本管理目标。', module: '管理目标' },
  { id: 5, dot: 'low' as TagLevel, time: '07月20日 09:30', title: '上门护理服务完成', summary: '完成PICC维护服务，无工单异常；服务记录已归档。', module: '服务工单' },
]

/** 检查检验 Tab（检查检验记录.png） */
export interface ExamItem {
  id: number
  date: string
  name: string
  source: 'manual' | 'upload'
  org: string
  summary: string
  status: string
  statusLevel: TagLevel
  action: '查看详情' | '查看报告'
}

export const mockExamStats = { total: 18, manual: 11, upload: 7, abnormal: 3 }

export const mockExams: ExamItem[] = [
  { id: 1, date: '2026-08-10', name: '血脂检查', source: 'manual', org: '幸福颐养护理院', summary: 'LDL-C 3.42 mmol/L ↑；其余正常', status: '1项异常', statusLevel: 'mid', action: '查看详情' },
  { id: 2, date: '2026-08-06', name: '血常规检查', source: 'upload', org: '北京协和医院', summary: '报告原件 · 用户未录入结构化指标', status: '待查看', statusLevel: 'info', action: '查看报告' },
  { id: 3, date: '2026-07-28', name: '肾功能检查', source: 'manual', org: '幸福颐养护理院', summary: 'Cr 86；eGFR 92；UACR 18', status: '正常', statusLevel: 'low', action: '查看详情' },
  { id: 4, date: '2026-07-12', name: '胸部CT检查', source: 'upload', org: '北京胸科医院', summary: '报告原件 · 诊断：慢性支气管炎表现', status: '已查看', statusLevel: 'low', action: '查看报告' },
]

/** 检查检验报告详情（查看详情.png） */
export const mockExamReport = {
  source: '用户在 C 端上传 · 只读',
  fields: [
    { label: '报告类型', value: '血常规检查' },
    { label: '检查日期', value: '2026-08-06' },
    { label: '医疗机构', value: '北京协和医院' },
    { label: '上传人', value: '张女士（本人）' },
    { label: '上传时间', value: '2026-08-06 20:18' },
  ],
  original: {
    title: '北京协和医院检验报告单',
    subtitle: '血常规检查',
    rows: [
      { name: '白细胞计数', value: '6.2', unit: '10^9/L', abnormal: false },
      { name: '血红蛋白', value: '113 ↓', unit: 'g/L', abnormal: true },
      { name: '血小板计数', value: '226', unit: '10^9/L', abnormal: false },
      { name: '中性粒细胞', value: '58.4', unit: '%', abnormal: false },
    ],
  },
  userInfo: { name: '体检报告—血常规', remark: '复诊时医生建议补充检查' },
}

/** 手动录入向导（选择项目.png / 血脂检查.png） */
export const mockExamWizard = {
  categories: ['常用', '实验室检验', '临床生理检查', '影像学检查', '其他检查'],
  labItems: [
    { name: '血常规检查', count: 9 },
    { name: '血糖检查', count: 5 },
    { name: '血脂检查', count: 5 },
    { name: '肝功能检查', count: 14 },
    { name: '肾功能检查', count: 14 },
    { name: '尿常规检查', count: 15 },
    { name: '凝血功能', count: 5 },
    { name: '甲状腺功能', count: 6 },
  ],
  commonItems: ['心电心音检查', '心脏超声', '颈动脉超声', '胸部CT检查', '肺功能检查', '骨密度'],
  lipid: {
    name: '血脂检查',
    fields: ['TC', 'TG', 'LDL-C', 'HDL-C'],
    form: { date: '2026-08-12', org: '幸福颐养护理院', source: '健管师手动录入', operator: '周敏' },
    indicators: [
      { name: '总胆固醇（TC）', value: '5.12', unit: 'mmol/L', range: '2.84–5.68', judge: '正常', level: 'low' as TagLevel },
      { name: '甘油三酯（TG）', value: '1.56', unit: 'mmol/L', range: '0.56–1.70', judge: '正常', level: 'low' as TagLevel },
      { name: '低密度脂蛋白（LDL-C）', value: '3.42', unit: 'mmol/L', range: '2.10–3.10', judge: '偏高', level: 'mid' as TagLevel },
      { name: '高密度脂蛋白（HDL-C）', value: '1.28', unit: 'mmol/L', range: '1.14–1.76', judge: '正常', level: 'low' as TagLevel },
    ],
    abnormalCount: 1,
  },
}

/* ===== 健康档案处理（设计稿：4.健康档案处理/） ===== */

/** 分配管理团队（单个患者.png / 分配成功.png） */
export const mockAssign = {
  member: {
    name: '沈秀兰',
    gender: '女',
    age: 67,
    risk: '中风险',
    diseases: '高血压、糖尿病',
    status: '档案待完善',
  },
  teams: ['城东慢病管理一组', '城东慢病管理二组', '心脑血管管理团队'],
  doctors: ['王医生（在管18）', '刘医生（在管22）'],
  nurses: ['李护士（在管26）', '赵护士（在管19）'],
  managers: ['张敏（在管68｜待办12）', '周敏（在管55｜待办8）'],
}

/** 分层分级详情（分层分级详情.png） */
export const mockRiskLevel = {
  current: '橙色 · 高风险',
  tag: '较上次升高',
  time: '2026-08-13 09:10',
  rule: '一期固定阈值 V1.0',
  basis: [
    { label: '血压', value: '148/86 mmHg', note: '高于个人目标', level: 'mid' as TagLevel, tag: '橙色' },
    { label: '空腹血糖', value: '9.8 mmol/L', note: '超过固定阈值', level: 'high' as TagLevel, tag: '红色' },
    { label: '低血糖事件', value: '近30天 0次', note: '达标', level: 'low' as TagLevel, tag: '绿色' },
    { label: '用药依从', value: '偶有漏服', note: '需要干预', level: 'mid' as TagLevel, tag: '橙色' },
    { label: '重大安全事件', value: '近30天 0次', note: '达标', level: 'low' as TagLevel, tag: '绿色' },
  ],
  nextSteps: [
    { no: 1, text: '健管师核实异常', status: '今日内' },
    { no: 2, text: '生成医生复核待办', status: '已生成' },
    { no: 3, text: '判断是否调整管理目标', status: '待医生' },
    { no: 4, text: '判断是否重生成方案', status: '待医生' },
    { no: 5, text: '保留本次分层版本', status: '自动' },
  ],
  freshness:
    '最近有效数据：血压 08-13、血糖 08-13、HbA1c 07-28。每次关键数据更新重新计算，但历史结论不会被覆盖。',
}

/** 独立层级变化处理（分层变化处理.png） */
export const mockRiskChange = {
  from: { color: '绿色', date: '08-02' },
  to: { color: '橙色', date: '08-13' },
  reason: '空腹血糖升高 + 用药依从下降',
  source: '患者C端自录指标',
  options: [
    { key: 'keep', label: '保持现有目标与方案', desc: '分层变化不影响当前管理策略' },
    { key: 'adjust', label: '调整管理目标', desc: '进入V3目标调整并生成新版本' },
    { key: 'regenerate', label: '重生成健康管理方案', desc: '目标生效后进入V4生成新方案' },
    { key: 'followup', label: '仅增加健康预警回访', desc: '由健管师在V5创建一次高风险回访' },
  ],
  opinion: '近期血糖持续升高，建议调整血糖控制目标；目标生效后重新生成患者方案。',
  actions: [
    '关闭本次分层复核待办',
    '在V3生成“目标调整”任务',
    '原目标和方案继续有效',
    '新目标生效后提示重生成方案',
    '新方案终审通过后替换旧方案',
    '全程保留版本与操作人',
  ],
  principle: '原则：风险升高不会自动覆盖医生目标或已发布方案，必须经医生确认后形成新版本。',
}
