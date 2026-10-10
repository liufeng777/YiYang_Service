/**
 * 健康会员 - mock 数据（设计稿：2.健康会员/）
 * TODO: 接入后端后对齐「协同工作台-API设计.md」§4.1 会员列表 GET /api/v1/staff/members（权限 health:view）；
 * 关联注册会员、健康管理团队、最近随访等聚合字段 API v0.1 未覆盖，待补充
 */

/** 健康档案状态 */
export type ProfileStatus = '已建档' | '档案待完善'
/** 风险分层 */
export type RiskLayer = 'high' | 'mid' | 'low'
/** 团队状态 */
export type TeamStatus = 'managed' | 'unassigned'

export interface MemberItem {
  id: string
  name: string
  /** 脱敏手机号 */
  phone: string
  /** 关联注册会员（本人 / 张女士（女儿）） */
  linkedUser: string
  profile: ProfileStatus
  risk: RiskLayer
  /** 健康管理团队；未分配时为 null */
  team: string | null
  /** 最近随访时间；未随访为 null */
  lastFollowup: string | null
  /** 建档日期 */
  profileDate: string
  /** 实名校验 */
  verifyTime: string
  verifyChannel: string
  /** 当前健康目标 */
  goal: string
}

export const RISK_LAYER: Record<RiskLayer, { text: string; cls: string }> = {
  high: { text: '高风险', cls: 'mb-tag--risk-high' },
  mid: { text: '中风险', cls: 'mb-tag--risk-mid' },
  low: { text: '低风险', cls: 'mb-tag--risk-low' },
}

export const mockMembers: MemberItem[] = [
  {
    id: 'M20260812001',
    name: '张建国',
    phone: '138****8219',
    linkedUser: '张女士（女儿）',
    profile: '已建档',
    risk: 'high',
    team: '周敏团队',
    lastFollowup: '08-26 09:30',
    profileDate: '2026-08-12',
    verifyTime: '2026-08-12 10:35',
    verifyChannel: '后端实名认证接口',
    goal: '稳定血压并提升用药依从性，减少异常波动。',
  },
  {
    id: 'M20260812002',
    name: '陈秀兰',
    phone: '138****6721',
    linkedUser: '本人',
    profile: '档案待完善',
    risk: 'mid',
    team: null,
    lastFollowup: null,
    profileDate: '2026-08-12',
    verifyTime: '2026-08-12 11:02',
    verifyChannel: '后端实名认证接口',
    goal: '完善健康档案后制定首期管理目标。',
  },
  {
    id: 'M20260810003',
    name: '王淑兰',
    phone: '136****5021',
    linkedUser: '王先生（儿子）',
    profile: '已建档',
    risk: 'high',
    team: '李医生团队',
    lastFollowup: '08-25 16:40',
    profileDate: '2026-08-10',
    verifyTime: '2026-08-10 15:20',
    verifyChannel: '后端实名认证接口',
    goal: '控制血糖波动，建立居家血糖监测习惯。',
  },
  {
    id: 'M20260808004',
    name: '李国强',
    phone: '158****1840',
    linkedUser: '本人',
    profile: '已建档',
    risk: 'low',
    team: '周敏团队',
    lastFollowup: '08-24 14:10',
    profileDate: '2026-08-08',
    verifyTime: '2026-08-08 09:48',
    verifyChannel: '后端实名认证接口',
    goal: '保持规律运动，每季度复查血脂。',
  },
]

/** 列表统计（设计稿：共 126 位健康会员 1/7） */
export const mockMemberTotal = 126
