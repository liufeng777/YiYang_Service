/**
 * 咨询管理模块本地 mock 数据（设计稿：电话咨询列表.png / 来电登记.png）
 * TODO: 接入后端后列表替换为 consultApi.getConsultations（API §10.4）；
 *       电话咨询登记接口 API v0.1 未定义，待后端补充
 */

/** 线索结果 */
export type ConsultLeadResult = 'created' | 'linked' | 'none'

export const CONSULT_LEAD_TEXT: Record<ConsultLeadResult, string> = {
  created: '已建立线索',
  linked: '已关联线索',
  none: '无需建立',
}

/** 电话咨询列表行 */
export interface MockConsultRow {
  id: string
  time: string
  caller: string
  target: string
  source: string
  content: string
  /** 身份校验（如 注册会员 / 待实名） */
  identity: string
  leadResult: ConsultLeadResult
}

export const mockConsultStats = {
  today: 12,
  todayNote: '已登记',
  followup: 5,
  followupNote: '已形成线索',
  linkedProfile: 4,
  linkedProfileNote: '实名服务对象',
  merged: 2,
  mergedNote: '追加联系记录',
}

export const mockConsultList: MockConsultRow[] = [
  {
    id: 'CS01',
    time: '10:26',
    caller: '张女士',
    target: '母亲',
    source: '护理院介绍页',
    content: '咨询入住条件、费用和床位',
    identity: '注册会员 / 待实名',
    leadResult: 'created',
  },
  {
    id: 'CS02',
    time: '09:48',
    caller: '李先生',
    target: '本人',
    source: 'AI健康管家',
    content: '咨询血糖管理和健康方案',
    identity: '实名 / 已建档',
    leadResult: 'none',
  },
  {
    id: 'CS03',
    time: '09:15',
    caller: '王女士',
    target: '父亲',
    source: '驿站介绍页',
    content: '咨询慢病讲座和上门护理',
    identity: '注册会员 / 未实名',
    leadResult: 'linked',
  },
  {
    id: 'CS04',
    time: '昨天 16:40',
    caller: '陈女士',
    target: '本人',
    source: '机构电话',
    content: '咨询术后康复服务',
    identity: '实名 / 档案待完善',
    leadResult: 'none',
  },
]

/* ===== 来电登记（设计稿：来电登记.png） ===== */

export const mockConsultRegister = {
  sources: ['护理院介绍页', '驿站介绍页', 'AI健康管家', '其他'],
  defaultSource: '护理院介绍页',
  targetTypes: ['来电人本人', '家人', '尚未明确'],
  defaultTargetType: '家人',
  defaultCallerPhone: '139****2168',
  defaultCallerName: '张女士',
  defaultTargetName: '王淑兰',
  defaultTargetPhone: '138****8219',
  topics: ['护理院入住', '健康管理', '上门服务', '康复服务', '健康活动'],
  defaultTopic: '护理院入住',
  defaultContent: '希望了解护理院入住条件、费用和是否可以预约参观。',
  defaultResult: '已介绍基础信息，需要机构养老顾问后续联系确认床位和费用。',
  defaultNextFollowup: '2026-08-14 10:00',
  preview: {
    callerAccount: '注册会员 · 未实名',
    target: '王淑兰 · 手机号待校验',
    steps: [
      '未发现实名会员或健康档案',
      '未发现相同手机号未完成线索',
      '保存后创建“待跟进”线索',
      '来源：电话咨询 / 护理院介绍页',
    ],
  },
  leadFields: [
    '来电人和实际服务对象',
    '咨询机构及电话来源',
    '咨询类型与需求摘要',
    '本次处理结果和下次跟进时间',
    '登记人员及登记时间',
  ],
  boundary:
    '本期咨询入口统一为机构电话。\n\n用户可从护理院/驿站介绍页获取电话；AI无法回答时也展示对应机构电话，来电由该机构登记。',
}
