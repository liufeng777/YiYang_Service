/**
 * AI长者健康力测评 - mock 数据（设计稿：15.AI长者健康力测评/）
 * TODO: 接入后端后对齐「协同工作台-API设计.md」§4 健康评估与建档
 * （评估列表/详情/发起/确认：/api/v1/staff/assessments*，权限码 health:assess）；
 * AI 分析、六维结果、模板版本等字段为新版扩展，API v0.1 未覆盖，待补充
 */

/** 评测状态：pending-待确认 in-progress-评测中 done-已完成 */
export type AssessStatus = 'pending' | 'in-progress' | 'done'
/** 综合风险：good-状态良好 attention-需要关注 high-较高风险 insufficient-信息不足 */
export type RiskLevel = 'good' | 'attention' | 'high' | 'insufficient'
/** 评测类型 */
export type AssessType = '居家快速测评' | '专业健康力评测'
/** 评测来源 */
export type AssessSource = 'C端自主测评' | '面访问答' | '电话访谈' | '纸质问卷录入' | '现场专业评测'

export interface AssessRecord {
  id: string
  name: string
  gender: '男' | '女'
  age: number
  org: string
  type: AssessType
  source: AssessSource
  status: AssessStatus
  risk: RiskLevel
  riskText: string
  assessor: string
  updatedAt: string
}

export const ASSESS_STATUS: Record<AssessStatus, { text: string; cls: string }> = {
  pending: { text: '待确认', cls: 'as-tag--pending' },
  'in-progress': { text: '评测中', cls: 'as-tag--doing' },
  done: { text: '已完成', cls: 'as-tag--done' },
}

export const RISK_LEVEL: Record<RiskLevel, { text: string; cls: string }> = {
  good: { text: '状态良好', cls: 'as-label--good' },
  attention: { text: '需要关注', cls: 'as-label--attention' },
  high: { text: '较高风险', cls: 'as-label--high' },
  insufficient: { text: '信息不足', cls: 'as-label--insufficient' },
}

export const mockAssessList: AssessRecord[] = [
  {
    id: 'A20260819001',
    name: '张桂芳',
    gender: '女',
    age: 67,
    org: '城东护理院',
    type: '专业健康力评测',
    source: '纸质问卷录入',
    status: 'done',
    risk: 'high',
    riskText: '营养与行动能力较高风险',
    assessor: '李静（健管师）',
    updatedAt: '2026-08-19 11:20',
  },
  {
    id: 'A20260818007',
    name: '王建国',
    gender: '男',
    age: 72,
    org: '幸福里健康驿站',
    type: '居家快速测评',
    source: 'C端自主测评',
    status: 'pending',
    risk: 'attention',
    riskText: '需要关注',
    assessor: 'C端用户自主完成',
    updatedAt: '2026-08-18 16:42',
  },
  {
    id: 'A20260818003',
    name: '刘淑珍',
    gender: '女',
    age: 80,
    org: '城东护理院',
    type: '专业健康力评测',
    source: '面访问答',
    status: 'in-progress',
    risk: 'insufficient',
    riskText: '信息不足',
    assessor: '周敏（健管师）',
    updatedAt: '2026-08-18 10:15',
  },
  {
    id: 'A20260815011',
    name: '陈德海',
    gender: '男',
    age: 69,
    org: '康宁护理院',
    type: '居家快速测评',
    source: 'C端自主测评',
    status: 'done',
    risk: 'good',
    riskText: '状态良好',
    assessor: 'C端用户自主完成',
    updatedAt: '2026-08-15 09:30',
  },
  {
    id: 'A20260812005',
    name: '赵秀英',
    gender: '女',
    age: 75,
    org: '幸福里健康驿站',
    type: '专业健康力评测',
    source: '电话访谈',
    status: 'pending',
    risk: 'attention',
    riskText: '认知与情绪需要关注',
    assessor: '李静（健管师）',
    updatedAt: '2026-08-12 14:08',
  },
  {
    id: 'A20260810002',
    name: '孙立军',
    gender: '男',
    age: 63,
    org: '城东护理院',
    type: '专业健康力评测',
    source: '现场专业评测',
    status: 'done',
    risk: 'insufficient',
    riskText: '信息不足',
    assessor: '赵医生',
    updatedAt: '2026-08-10 11:52',
  },
]

/** 测评模板（P1-01A 下载 / P1-06 模板页共用） */
export interface AssessTemplate {
  id: string
  name: string
  version: string
  desc: string
  applicable: string
  mainSource: string
  updatedAt: string
}

export const mockTemplates: AssessTemplate[] = [
  {
    id: 'T-HOME',
    name: '居家快速测评表',
    version: 'V1.0',
    desc: '面向居家场景的快速筛查，由患者或家属居家填写，覆盖六维基础问题。',
    applicable: '居家快速测评',
    mainSource: 'C端自主测评',
    updatedAt: '2026-08-15',
  },
  {
    id: 'T-PRO',
    name: '专业健康力评测表',
    version: 'V1.0',
    desc: '由医护人员或健康管理师通过面访问答、电话访谈或现场评测完成的专业版评测。',
    applicable: '专业健康力评测',
    mainSource: '面访问答 / 电话访谈 / 纸质问卷录入 / 现场专业评测',
    updatedAt: '2026-08-15',
  },
]

/** 六维目录与结果 */
export interface AssessDimension {
  key: string
  name: string
  level: RiskLevel
  summary: string
}

export const mockDimensions: AssessDimension[] = [
  { key: 'living', name: '生活能力与独立性', level: 'attention', summary: '部分日常活动需要少量协助' },
  { key: 'sensory', name: '感官功能', level: 'good', summary: '视力听力基本正常' },
  { key: 'quality', name: '生活质量', level: 'attention', summary: '社交参与度偏低' },
  { key: 'nutrition', name: '营养与衰弱', level: 'high', summary: '近3个月体重下降，存在营养不良风险' },
  { key: 'mobility', name: '行动能力与跌倒风险', level: 'high', summary: '起立行走测试偏慢，近一年有跌倒史' },
  { key: 'cognition', name: '认知、情绪与精神状态', level: 'insufficient', summary: '认知筛查题目未完整作答' },
]

/** 录入页 - 维度目录（含完成状态） */
export interface EntrySection {
  key: string
  name: string
  done: boolean
  active?: boolean
}

export const mockEntrySections: EntrySection[] = [
  { key: 'living', name: '生活能力与独立性', done: true },
  { key: 'sensory', name: '感官功能', done: true },
  { key: 'quality', name: '生活质量', done: false},
  { key: 'nutrition', name: '营养与衰弱', done: false },
  { key: 'mobility', name: '行动能力与跌倒风险', done: false },
  { key: 'cognition', name: '认知、情绪与精神状态', done: false },
]

/** 录入页 - 当前维度题目 */
export interface EntryQuestion {
  id: string
  title: string
  options: string[]
  answer?: string
  remark?: boolean
}

export const mockEntryQuestions: EntryQuestion[] = [
  {
    id: 'q1',
    title: '1. 过去一周，您参与社交或娱乐活动的频率是？',
    options: ['每天参与', '每周 3 次以上', '每周 1-2 次', '很少参与', '无法评测'],
    answer: '每周 1-2 次',
  },
  {
    id: 'q2',
    title: '2. 您对目前的生活状态总体满意度如何？',
    options: ['非常满意', '比较满意', '一般', '不太满意', '无法评测'],
    answer: '一般',
  },
  {
    id: 'q3',
    title: '3. 您是否感到孤独或情绪低落？',
    options: ['从未', '偶尔', '有时', '经常', '无法评测'],
  },
  {
    id: 'q4',
    title: '4. 补充备注（选填）',
    options: [],
    remark: true,
  },
]

/** 录入页 - 完成情况 */
export const mockEntryProgress = {
  finished: 18,
  total: 36,
  unfinished: 18,
  requiredMissing: 2,
  source: '纸质问卷录入',
  assessor: '李静（健管师）',
  version: 'V1.0',
  autoSaved: '刚刚已保存',
  issues: '2项必填未录入、1项答案存在逻辑冲突',
}

/** 完成检查 Modal（P1-03A） */
export const mockEntryCheck = {
  passed: false,
  requiredMissing: {
    count: 2,
    items: ['营养与衰弱 - 近3个月体重变化', '行动能力与跌倒风险 - 近一年跌倒次数'],
  },
  logicConflict: {
    count: 1,
    items: ['选择“无法独立行走”，但起立行走测试填写为 9 秒，请确认'],
  },
}

/** AI 初步分析（P1-04） */
export const mockAiAnalysis = {
  version: 'Health-AI 1.0.3',
  generatedAt: '2026-08-19 11:02',
  sections: [
    {
      title: '健康能力画像',
      content:
        '张桂芳女士整体生活自理能力尚可，感官功能保持较好；但营养摄入与行动能力方面出现较为明显的下降信号，认知筛查信息不完整，建议补充评测。',
    },
    {
      title: '主要风险提示',
      content:
        '① 近3个月非自愿体重下降约 3kg，合并食欲下降，提示营养不良风险；② 起立行走测试 14 秒，且近一年有 1 次跌倒史，跌倒风险较高。',
    },
    {
      title: '风险关联分析',
      content:
        '营养状态下降可能进一步加剧肌少症与衰弱进展，与行动能力下降相互影响，形成“营养-衰弱-跌倒”风险链，需优先干预。',
    },
    {
      title: '建议进一步确认',
      content:
        '认知、情绪维度作答不完整，建议由专业人员补充 MMSE 简版筛查与情绪量表，明确是否存在认知下降或抑郁倾向。',
    },
    {
      title: '健康管理与医养服务方向',
      content:
        '建议纳入营养干预与居家防跌倒管理；可安排营养师随访、居家环境适老化评估，并设定 3 个月复查周期。',
    },
  ],
  disclaimer:
    '本内容由AI根据评测信息辅助生成，仅作为健康管理参考，不能替代医师诊断或专业医疗意见。',
}

/** 专业确认（P1-04 右侧 / P1-05 详情） */
export const mockProConfirm = {
  doctor: '赵医生',
  confirmedAt: '2026-08-19 11:20',
  fields: [
    { label: '专业判断', value: '同意 AI 分析的主要结论，营养不良与跌倒风险需优先干预' },
    { label: '风险等级调整', value: '保持AI建议（较高风险）' },
    { label: '重点关注问题', value: '体重下降趋势、居家跌倒隐患、认知筛查待补充' },
    { label: '健康管理建议', value: '营养干预 + 防跌倒训练，纳入健康管理方案' },
    { label: '进一步检查转诊', value: '建议 1 个月内完成认知功能专科评估' },
    { label: '面向患者的说明', value: '我们会优先协助改善营养状态与居家防跌倒' },
    { label: '内部工作备注', value: '已与家属电话沟通，同意配合营养随访' },
  ],
}

/** 测评详情（P1-05） */
export const mockAssessDetail = {
  name: '张桂芳',
  gender: '女' as const,
  age: 67,
  status: 'done' as AssessStatus,
  type: '专业健康力评测' as AssessType,
  source: '纸质问卷录入' as AssessSource,
  version: 'V1.0',
  assessor: '李静（健管师）',
  confirm: '赵医生 · 08-19 11:20',
  aiVersion: 'Health-AI 1.0.3',
  attachment: '专业评测表_张桂芳_0819.pdf',
  archived: '已归入健康档案',
}

/** 健康档案详情「健康力测评」Tab（P1-07） */
export const mockProfileAssessTab = {
  latest: {
    tag: '已专业确认',
    meta: '专业健康力评测 · 纸质问卷录入 · 2026-08-19 · 评测：李静（健管师） · 确认：赵医生',
  },
  history: [
    {
      id: 'A20260819001',
      date: '2026-08-19',
      type: '专业健康力评测',
      source: '纸质问卷录入',
      risk: 'high' as RiskLevel,
      riskText: '较高风险',
      confirm: '赵医生确认',
    },
    {
      id: 'A20260512004',
      date: '2026-05-12',
      type: '居家快速测评',
      source: 'C端自主测评',
      risk: 'attention' as RiskLevel,
      riskText: '需要关注',
      confirm: '周医生确认',
    },
  ],
}
