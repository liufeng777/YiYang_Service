/**
 * 随访管理模块 mock 数据（设计稿：待回访 / 已回访 / 手动创建回访 / 执行随访四步）
 * TODO: 问卷模板与执行向导结构化接口 API v0.1 未定义，
 * 接入后端后列表替换为 followupApi.getFollowups（§6.3）
 */

/** 随访类型（标签色） */
export type FollowupTypeKey = 'disease' | 'warning' | 'daily' | 'service'

export const FOLLOWUP_TYPE_LABEL: Record<FollowupTypeKey, string> = {
  disease: '专病随访',
  warning: '健康预警回访',
  daily: '日常随访',
  service: '服务后回访',
}

/** 待回访任务行 */
export interface MockFollowupPendingRow {
  id: number
  planTime: string
  memberName: string
  age: number
  type: FollowupTypeKey
  disease: string
  source: string
  lastFollowup: string
}

/** 已回访记录行 */
export interface MockFollowupDoneRow {
  id: number
  doneTime: string
  memberName: string
  age: number
  type: FollowupTypeKey
  disease: string
  /** 随访结果（颜色前缀：绿/橙/蓝） */
  result: string
  resultTone: 'green' | 'orange' | 'blue' | 'plain'
  nextFollowup: string
}

export const mockFollowupCounts = { pending: 12, done: 48 }

export const mockFollowupStats = {
  todayPending: 6,
  todayWarning: 2,
  next7Days: 12,
  monthDone: 48,
  monthEffective: 45,
}

export const mockFollowupPending: MockFollowupPendingRow[] = [
  {
    id: 1,
    planTime: '今天 09:30',
    memberName: '张女士',
    age: 67,
    type: 'disease',
    disease: '高血压 · 糖尿病',
    source: '来源：高血压＋糖尿病 / 中风险规则 · 第4周',
    lastFollowup: '7月29日',
  },
  {
    id: 2,
    planTime: '今天 10:30',
    memberName: '李先生',
    age: 72,
    type: 'warning',
    disease: '血糖异常 · 患者自录',
    source: '来源：健康异常预警 · 健管师手动创建',
    lastFollowup: '今天 08:12',
  },
  {
    id: 3,
    planTime: '今天 14:00',
    memberName: '王女士',
    age: 69,
    type: 'daily',
    disease: '日常管理规则',
    source: '来源：系统日常管理规则 · 每两周',
    lastFollowup: '7月31日',
  },
  {
    id: 4,
    planTime: '明天 09:00',
    memberName: '周先生',
    age: 75,
    type: 'service',
    disease: '上门采血',
    source: '来源：服务完成事件 · 服务后1天',
    lastFollowup: '—',
  },
  {
    id: 5,
    planTime: '8月14日 15:00',
    memberName: '赵女士',
    age: 71,
    type: 'disease',
    disease: '慢阻肺',
    source: '来源：慢阻肺 / 高风险规则 · 第8周',
    lastFollowup: '8月1日',
  },
]

export const mockFollowupDone: MockFollowupDoneRow[] = [
  {
    id: 11,
    doneTime: '今天 08:45',
    memberName: '陈女士',
    age: 70,
    type: 'disease',
    disease: '冠心病',
    result: '绿色 · 继续原方案',
    resultTone: 'green',
    nextFollowup: '9月12日',
  },
  {
    id: 12,
    doneTime: '8月11日 16:20',
    memberName: '孙先生',
    age: 73,
    type: 'warning',
    disease: '血压异常',
    result: '橙色 · 已提交医生复核',
    resultTone: 'orange',
    nextFollowup: '8月14日',
  },
  {
    id: 13,
    doneTime: '8月11日 14:05',
    memberName: '刘女士',
    age: 68,
    type: 'daily',
    disease: '日常管理规则',
    result: '绿色 · 方案执行良好',
    resultTone: 'green',
    nextFollowup: '8月25日',
  },
  {
    id: 14,
    doneTime: '8月10日 10:30',
    memberName: '钱先生',
    age: 76,
    type: 'disease',
    disease: '慢阻肺',
    result: '蓝色 · 安排补测血氧',
    resultTone: 'blue',
    nextFollowup: '8月17日',
  },
  {
    id: 15,
    doneTime: '8月9日 15:10',
    memberName: '吴女士',
    age: 66,
    type: 'service',
    disease: '上门护理',
    result: '无健康异常 · 已完成',
    resultTone: 'plain',
    nextFollowup: '—',
  },
]

/** 创建健康预警回访 - 关联预警 */
export const mockWarningForCreate = {
  level: '橙色预警',
  title: '李先生 · 空腹血糖异常',
  desc: '患者于今天 08:12 在 C 端记录空腹血糖 9.8 mmol/L，固定阈值触发。',
  meta: '数据来源：患者手动记录　测量时间：今天 08:10　最近一次专病随访：今天 08:45',
  duplicateTip: '系统提示：健管师今天已完成一次随访，请先判断该异常是否已经了解并处理。',
}

export const mockCreateRules = {
  whenCreate: ['患者在 C 端新录入异常指标', '异常未在刚完成的随访中处理', '健管师判断需要再次联系确认'],
  whenNotCreate: ['健管师刚回访且已知该异常', '已完成处置并形成医生待办', '明显重复或错误数据'],
  rule: '阈值由系统固定；预警只提供判断依据，不自动生成重复随访任务。是否追加回访由健管师人工确认。',
  ownership: '仅创建给当前健管师管理的用户；医生只接收回访结果触发的复核待办。',
}

/** 执行随访 - 服务对象 */
export const mockExecuteMember = {
  id: 1,
  name: '张女士',
  age: 67,
  phone: '139****2168',
  diseases: ['高血压', '糖尿病'],
  typeLabel: '专病随访 · 高血压 / 糖尿病',
  goals: ['血压 < 140/90 mmHg', 'HbA1c < 7.0%'],
}

/** 步骤 1：通用电话模块 */
export const mockStep1 = {
  contactResults: ['本人接通', '授权照护者接通', '未接听', '拒接'],
  identityChecks: ['通过', '未通过', '无法完成'],
  consents: ['同意', '不同意', '无法表达'],
  answerers: ['患者本人', '配偶', '子女', '其他授权照护者'],
  reliabilities: ['可靠', '部分可靠', '无法可靠获得'],
  emergencies: ['均无', '明显胸痛', '突发神经异常', '严重气促', '意识改变'],
  events: ['均无', '急诊', '住院', '手术/介入', '调整治疗'],
  compliance: ['规律', '偶尔遗漏', '经常遗漏', '自行停用', '不清楚'],
}

/** 步骤 2：饮食与运动 */
export const mockStep2 = {
  stapleTypes: ['米饭为主', '面食为主', '粗杂粮为主', '混合', '其他'],
  tastes: ['清淡', '适中', '偏咸', '偏甜', '偏油'],
  intensities: ['卧床', '轻体力劳动', '中度体力劳动', '重体力劳动'],
  frequencies: ['不运动', '1–2次/周', '3–4次/周', '5次及以上/周', '每天'],
  durations: ['少于15分钟', '15–30分钟', '31–60分钟', '60分钟以上'],
  notes: [
    { title: '通用问卷只收集一次', desc: '多病患者不在高血压、糖尿病、慢阻肺、冠心病问卷中重复填写饮食与运动。' },
    { title: '主食', desc: '记录主食类型及食用量；如患者无法准确估算，可选择常用档位。' },
    { title: '饮食口味', desc: '采集总体倾向，不要求健管师逐项计算营养成分。' },
    { title: '运动频率', desc: '按每周实际运动次数结构化记录。' },
    { title: '运动时间', desc: '记录通常每次持续时间，便于评估方案执行程度。' },
  ],
  rule: '默认带入上次答案；健管师只需确认是否有变化。患者无法准确回答时允许选择“不清楚”，不强制估算。',
}

/** 步骤 3：专病问卷（按病种加载） */
export interface MockDiseaseQuestion {
  /** 分组标题（如 固定安全项 / 目标：血压达标） */
  group: string
  question: string
  options: string[]
  answer: string
}

export interface MockDiseaseQuiz {
  key: string
  name: string
  index: string
  questions: MockDiseaseQuestion[]
  /** 读数行（仅高血压问卷有） */
  reading?: { value: string; time: string; source: string }
  followUp: string
  nextDiseaseTip?: string
}

export const mockDiseaseQuizList: MockDiseaseQuiz[] = [
  {
    key: 'hypertension',
    name: '高血压',
    index: '1/2',
    questions: [
      {
        group: '固定安全项',
        question: '现在有没有血压相关的严重不适',
        options: ['均无', '剧烈头痛/视物异常', '胸痛', '明显气促', '神经异常'],
        answer: '均无',
      },
      {
        group: '目标：血压达标',
        question: '近7天有没有测过血压',
        options: ['有且记得读数', '测过但不记得', '没有测', '没有血压计'],
        answer: '有且记得读数',
      },
      {
        group: '目标：重大安全事件为0',
        question: '近两周是否有异常事件或不适',
        options: ['均无', '头晕', '头痛', '心悸', '胸闷/胸痛', '气促'],
        answer: '均无',
      },
      {
        group: '目标：限盐与运动行动',
        question: '约定完成情况',
        options: ['完成', '大部分完成', '少部分完成', '未执行', '不适用'],
        answer: '大部分完成',
      },
    ],
    reading: { value: '128 / 76 mmHg', time: '今天 08:30', source: '患者口述' },
    followUp: '血压、测量时间和来源已有记录时自动带入；缺失或数值≥160/100 mmHg时，才追问复测及处置情况。',
    nextDiseaseTip: '下一病种：糖尿病 · 读取5项生效目标：将按HbA1c、空腹血糖、重大安全事件、饮食及运动目标检查证据，只加载缺失问题。',
  },
  {
    key: 'diabetes',
    name: '糖尿病',
    index: '2/2',
    questions: [
      {
        group: '固定安全项',
        question: '现在有没有血糖相关的严重不适',
        options: ['均无', '心慌/出汗/手抖', '意识模糊', '明显口渴多尿', '视物模糊'],
        answer: '均无',
      },
      {
        group: '目标：HbA1c达标',
        question: '近3个月有没有复查 HbA1c',
        options: ['有且记得结果', '查过但不记得', '没有查'],
        answer: '有且记得结果',
      },
      {
        group: '目标：空腹血糖达标',
        question: '近7天空腹血糖监测完成情况',
        options: ['按计划完成', '部分完成', '未监测'],
        answer: '按计划完成',
      },
      {
        group: '目标：饮食与运动行动',
        question: '约定完成情况',
        options: ['完成', '大部分完成', '少部分完成', '未执行', '不适用'],
        answer: '大部分完成',
      },
    ],
    followUp: '空腹血糖 9.8 mmol/L 高于目标（< 7.0），已记录测量情境与读数，进入结果处置。',
  },
]

/** 步骤 3 右栏：生效目标与已有证据 */
export const mockGoalEvidence = {
  ready: '目标证据 3/5 已具备',
  goals: [
    { name: '目标1｜血压 < 140/90 mmHg', evidence: '已有：128/76 mmHg · 患者端 08:30' },
    { name: '目标2｜重大安全事件为0', evidence: '待确认：近两周急诊、住院及高危症状' },
    { name: '目标3｜限盐与运动行动', evidence: '待确认：过去7天完成天数及执行障碍' },
  ],
  medicationNote: '读取独立“用药记录”；仅确认漏服/停药变化，不重复登记药品。',
  preview: { title: '血压目标：达成', sub: '安全事件：待回答 · 行动目标：待回答', note: '提交前每个生效目标必须形成“达成 / 未达成 / 数据不足”；健管师不能修改医生设定的目标值。' },
  diseaseMapping: ['高血压', '糖尿病', '慢阻肺', '冠心病'],
  dynamicRules: [
    '高血压：血压 / 安全事件 / 依从 / 限盐 / 运动',
    '糖尿病：HbA1c / 血糖 / 低血糖 / 饮食 / 运动',
    '慢阻肺：急性加重 / CAT / 血氧 / 吸入依从 / 康复',
    '冠心病：LDL-C / 心绞痛 / 再事件 / 依从 / 饮食运动',
  ],
}

/** 步骤 4：结果处置 */
export const mockStep4 = {
  suggestion: {
    level: '橙色',
    text: '血糖连续未达标，建议医生复核；其余信息稳定',
    basis: '依据：空腹血糖 9.8 mmol/L、个人目标 < 7.0 mmol/L',
  },
  results: ['强化随访', '补测/补检', '安排面访', '医生复核', '普通转诊'],
  understands: ['理解并同意', '基本理解', '不理解', '拒绝'],
  nextDate: '2026-08-19（系统建议，可确认）',
  method: '电话随访',
  summary:
    '患者本人接听并完成身份核验。近期无急症表现，血压达标；空腹血糖偏高，已说明加强监测并提交管理团队医生复核。',
  autoUpdate: '随访记录写入健康档案；新数据触发分层分级；生成下次待回访任务及医生复核待办。',
  summaryCard: [
    { label: '通用急症筛查', value: '均无', tone: 'plain' as const },
    { label: '高血压血压目标', value: '达标', tone: 'plain' as const },
    { label: '糖尿病血糖目标', value: '未达标', tone: 'warn' as const },
    { label: '方案执行', value: '大部分完成', tone: 'plain' as const },
    { label: '建议标签', value: '橙色', tone: 'warn' as const },
    { label: '医生复核', value: '待生成', tone: 'plain' as const },
  ],
  qualityCheck: ['必答项已完成', '自报指标均有测量时间和来源'],
}
