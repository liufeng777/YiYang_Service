/**
 * 健康活动模块本地 mock 数据（设计稿：活动列表.png / 报名名单.png / 联系确认.png / 现场签到.png）
 * TODO: 协同工作台端健康活动接口（本机构承接活动/报名名单/联系确认/现场签到）
 *       API v0.1 未定义，待后端补充；当前页面以本地 mock 演示完整交互
 */

/** 活动列表行 */
export interface MockActivityRow {
  id: string
  name: string
  time: string
  place: string
  signed: number
  quota: number
  /** 待联系人数（>0 显示橙色 待联系 n，否则绿色 已确认 n） */
  pendingContact: number
  confirmed: number
  checkedIn: number
}

export const mockActivityStats = {
  upcoming30: 8,
  upcoming30Note: '报名 126人',
  today: 2,
  todayNote: '待签到 38人',
  pendingContact: 17,
  pendingContactNote: '需确认席位',
  leads: 24,
  leadsNote: '本月累计',
}

export const mockActivityList: MockActivityRow[] = [
  {
    id: 'AC01',
    name: '秋季慢病管理与科学用药讲座',
    time: '08-18 14:00–16:00',
    place: '月坛健康驿站',
    signed: 42,
    quota: 60,
    pendingContact: 8,
    confirmed: 30,
    checkedIn: 0,
  },
  {
    id: 'AC02',
    name: '居家血压监测公益课堂',
    time: '08-20 09:30–11:00',
    place: '西城健康驿站',
    signed: 28,
    quota: 40,
    pendingContact: 0,
    confirmed: 24,
    checkedIn: 0,
  },
  {
    id: 'AC03',
    name: '长者跌倒预防训练营',
    time: '08-25 14:00–15:30',
    place: '幸福颐养护理院',
    signed: 36,
    quota: 50,
    pendingContact: 5,
    confirmed: 26,
    checkedIn: 0,
  },
  {
    id: 'AC04',
    name: '糖尿病饮食管理沙龙',
    time: '09-02 09:30–11:00',
    place: '月坛健康驿站',
    signed: 20,
    quota: 30,
    pendingContact: 0,
    confirmed: 18,
    checkedIn: 0,
  },
]

/* ===== 报名名单（设计稿：报名名单.png，AC01） ===== */

/** 联系状态 */
export type RegContactStatus = 'confirmed' | 'pending' | 'unreachable'
/** 线索结果 */
export type RegLeadResult = 'none' | 'pending' | 'created' | 'linked'

export const REG_CONTACT_TEXT: Record<RegContactStatus, string> = {
  confirmed: '已确认',
  pending: '待联系',
  unreachable: '无法联系',
}

export const REG_LEAD_TEXT: Record<RegLeadResult, string> = {
  none: '无需建立',
  pending: '待判定',
  created: '已建立线索',
  linked: '已关联线索',
}

export interface MockRegistrationRow {
  id: string
  applicant: string
  participant: string
  accountType: '实名会员' | '注册会员'
  profileStatus: '已建档' | '待校验' | '未建档' | '未实名' | '档案待完善'
  contactStatus: RegContactStatus
  leadResult: RegLeadResult
  checkedIn: boolean
}

export const mockActivityInfo = {
  id: 'AC01',
  name: '秋季慢病管理与科学用药讲座',
  time: '08月18日 14:00–16:00',
  place: '月坛健康驿站',
  signed: 42,
  quota: 60,
  pendingContact: 8,
  confirmed: 30,
  declined: 4,
}

export const mockRegistrations: MockRegistrationRow[] = [
  {
    id: 'RG01',
    applicant: '张女士',
    participant: '本人',
    accountType: '实名会员',
    profileStatus: '已建档',
    contactStatus: 'confirmed',
    leadResult: 'none',
    checkedIn: false,
  },
  {
    id: 'RG02',
    applicant: '王先生',
    participant: '母亲王阿姨',
    accountType: '注册会员',
    profileStatus: '待校验',
    contactStatus: 'pending',
    leadResult: 'pending',
    checkedIn: false,
  },
  {
    id: 'RG03',
    applicant: '李女士',
    participant: '本人',
    accountType: '注册会员',
    profileStatus: '未建档',
    contactStatus: 'confirmed',
    leadResult: 'created',
    checkedIn: false,
  },
  {
    id: 'RG04',
    applicant: '赵先生',
    participant: '父亲赵叔叔',
    accountType: '注册会员',
    profileStatus: '未实名',
    contactStatus: 'unreachable',
    leadResult: 'linked',
    checkedIn: false,
  },
  {
    id: 'RG05',
    applicant: '陈女士',
    participant: '本人',
    accountType: '实名会员',
    profileStatus: '档案待完善',
    contactStatus: 'confirmed',
    leadResult: 'none',
    checkedIn: true,
  },
]

/* ===== 联系确认（设计稿：联系确认.png，RG02） ===== */

export const mockContactConfirm = {
  applicant: '王先生',
  phone: '136****5021',
  accountType: '注册会员',
  participantTypes: ['本人', '家人', '其他'],
  defaultType: '家人',
  defaultName: '王淑兰',
  defaultPhone: '138****2168',
  results: ['已确认参加', '不参加', '待再次联系', '无法联系'],
  defaultResult: '已确认参加',
  needs: ['慢病管理', '用药咨询', '护理院入住', '上门服务'],
  defaultNeeds: ['慢病管理'],
  defaultRecord: '已确认由母亲王淑兰参加，希望现场了解高血压与糖尿病的长期管理服务。',
  defaultNextContact: '2026-08-15 10:00',
  systemSteps: [
    { title: '按实际参与人校验', desc: '手机号 / 会员ID' },
    { title: '实名且已有档案', desc: '关联档案，不建立线索' },
    { title: '未实名或无档案', desc: '查找未完成线索' },
    { title: '已有线索', desc: '追加活动与联系记录' },
    { title: '没有线索', desc: '创建“待跟进”线索' },
  ],
  antiDuplicate:
    '同一手机号已有未完成线索时，不新建第二条；追加本次活动、联系记录和需求。\n\n工作人员不手动选择是否建线索，由系统自动判断。',
}

/* ===== 现场签到（设计稿：现场签到.png，AC01） ===== */

export const mockCheckinStats = {
  signed: 42,
  confirmed: 30,
  checkedIn: 18,
  notCheckedIn: 12,
  walkIn: 2,
}

export interface MockCheckinRow {
  id: string
  name: string
  phone: string
  accountType: '实名会员' | '注册会员' | '待校验'
  profileStatus: '已建档' | '待校验' | '未建档' | '未实名' | '档案待完善'
  confirmStatus: '已确认' | '待再次联系'
  /** 已签到时间（如 13:42），null 未签到 */
  checkedInAt: string | null
}

export const mockCheckinList: MockCheckinRow[] = [
  {
    id: 'CK01',
    name: '张女士',
    phone: '136****8219',
    accountType: '实名会员',
    profileStatus: '已建档',
    confirmStatus: '已确认',
    checkedInAt: '13:42',
  },
  {
    id: 'CK02',
    name: '王淑兰',
    phone: '138****2168',
    accountType: '待校验',
    profileStatus: '待校验',
    confirmStatus: '已确认',
    checkedInAt: null,
  },
  {
    id: 'CK03',
    name: '李女士',
    phone: '158****3806',
    accountType: '注册会员',
    profileStatus: '未建档',
    confirmStatus: '已确认',
    checkedInAt: null,
  },
  {
    id: 'CK04',
    name: '赵叔叔',
    phone: '137****9014',
    accountType: '注册会员',
    profileStatus: '未实名',
    confirmStatus: '待再次联系',
    checkedInAt: null,
  },
  {
    id: 'CK05',
    name: '陈女士',
    phone: '138****6721',
    accountType: '实名会员',
    profileStatus: '档案待完善',
    confirmStatus: '已确认',
    checkedInAt: '13:36',
  },
]
