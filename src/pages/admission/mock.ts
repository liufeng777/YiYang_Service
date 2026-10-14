/**
 * 入住协同 - 本地 mock 数据（设计稿：16.入住协同 / 意向列表.png）
 * swagger.json 无入住意向相关端点（列表 / 新增 / 跟进均无），
 * 页面以本地 mock 演示完整交互，接入后端后替换为对应 API。
 */

/** 跟进状态 */
export const FOLLOW_STATUS_MAP: Record<string, string> = {
  pending: '待跟进',
  invited: '已邀约',
  done: '已完成',
  paused: '暂缓',
}

/** 线下接待结果 */
export const RECEPTION_MAP: Record<string, string> = {
  none: '未到访',
  waiting: '待到访',
  arrived: '已到访',
}

/** 意向来源 */
export const INTENT_SOURCE_OPTIONS = ['健康咨询转运营', '会员主动', '活动登记', '健康咨询']

/** 入住时间意向 */
export const MOVE_IN_OPTIONS = ['1个月内', '3个月内', '半年内', '暂不确定']

/** 意向机构（mock，接入后可换机构列表接口） */
export const INSTITUTION_OPTIONS = ['西城护理院', '月坛健康驿站', '幸福护理院']

/** 跟进方式 */
export const FOLLOW_TYPE_OPTIONS = ['电话', '微信', '到店', '上门']

/** 跟进结果 */
export const FOLLOW_RESULT_OPTIONS = ['已邀约到访', '继续跟进', '暂缓', '无效意向']

/** 跟进记录 */
export interface FollowRecord {
  time: string
  title: string
  content: string
}

/** 入住意向 */
export interface AdmissionIntent {
  id: number
  /** 注册会员称呼（联系人视角，如 王先生） */
  memberName: string
  /** 联系人（含身份，如 王先生（家属）） */
  contactName: string
  /** 服务对象（实际入住老人） */
  targetName: string
  contactPhone: string
  institution: string
  source: string
  /** 最近跟进摘要，如 08-12 电话联系 */
  lastFollow: string
  followStatus: keyof typeof FOLLOW_STATUS_MAP
  reception: keyof typeof RECEPTION_MAP
  /** 登记时间展示文案 */
  createdAt: string
  followRecords: FollowRecord[]
}

export const mockIntents: AdmissionIntent[] = [
  {
    id: 1,
    memberName: '王先生',
    contactName: '王先生（家属）',
    targetName: '王淑兰',
    contactPhone: '138****2168',
    institution: '西城护理院',
    source: '健康咨询',
    lastFollow: '08-12 电话联系',
    followStatus: 'pending',
    reception: 'none',
    createdAt: '08-12 10:20',
    followRecords: [
      { time: '08-12 15:20', title: '电话沟通', content: '家属希望先到机构参观，了解护理环境与收费。' },
      { time: '08-13 09:30', title: '已发送机构地址', content: '约定 08-20 下午到访，由前台接待。' },
    ],
  },
  {
    id: 2,
    memberName: '李女士',
    contactName: '李女士（家属）',
    targetName: '李建国',
    contactPhone: '139****8831',
    institution: '月坛健康驿站',
    source: '会员主动',
    lastFollow: '08-11 已邀约',
    followStatus: 'invited',
    reception: 'waiting',
    createdAt: '08-11 14:05',
    followRecords: [
      { time: '08-11 14:30', title: '电话邀约', content: '已邀约本周六上午到店参观。' },
    ],
  },
  {
    id: 3,
    memberName: '赵先生',
    contactName: '赵先生（本人）',
    targetName: '赵先生',
    contactPhone: '136****5021',
    institution: '西城护理院',
    source: '活动登记',
    lastFollow: '08-09 现场接待',
    followStatus: 'done',
    reception: 'arrived',
    createdAt: '08-08 09:40',
    followRecords: [
      { time: '08-09 10:00', title: '现场接待', content: '已完成参观，对双人间与护理服务满意，回去与家人商量。' },
    ],
  },
  {
    id: 4,
    memberName: '陈女士',
    contactName: '陈女士（家属）',
    targetName: '陈玉兰',
    contactPhone: '137****6720',
    institution: '月坛健康驿站',
    source: '健康咨询',
    lastFollow: '08-08 电话联系',
    followStatus: 'paused',
    reception: 'none',
    createdAt: '08-08 16:12',
    followRecords: [
      { time: '08-08 16:40', title: '电话沟通', content: '老人近期住院，暂缓参观安排，出院后再联系。' },
    ],
  },
]

/** 统计卡（mock 汇总值） */
export const mockStats = [
  { label: '待跟进', value: 12, sub: '需尽快联系', tone: 'warn' as const },
  { label: '本周新增', value: 5, sub: '新增意向', tone: 'info' as const },
  { label: '已到访', value: 8, sub: '线下已接待', tone: 'success' as const },
]
