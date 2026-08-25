/**
 * 各岗位工作台模板配置
 * - 模板按登录用户的 positionCode 选择（见 user store POSITIONS）
 * - 数据当前为设计稿示例 mock；接入后端后替换为：
 *   GET /api/v1/staff/dashboard/overview（今日工作概览）
 *   GET /api/v1/staff/dashboard/warnings（首页预警快捷清单）
 *   见 src/api/modules/workbench.ts
 * - 快捷入口「受目录权限控制」：配置 permissions 权限码后按用户权限过滤
 */
import { POSITIONS, type PositionCode } from '@/store/modules/user'
import { PERMISSIONS } from '@/router/routes'
import type { WorkbenchConfig } from './types'

/** 健康管理师（默认模板，设计稿：健康管理师.png） */
const healthManager: WorkbenchConfig = {
  greeting: true,
  subtitle: '今日优先处理健康告警和到期随访',
  banner: {
    title: '红色健康告警',
    count: 3,
    desc: '其中1例来自上门服务现场上报，需立即核实并提交团队医生',
    actionText: '立即处理',
    path: '/warning',
  },
  metrics: [
    { label: '待完善档案', value: 8, linkText: '查看待办', path: '/health-record' },
    { label: 'AI方案待初审', value: 6, linkText: '查看待办', path: '/plan' },
    { label: '今日随访', value: 12, linkText: '查看待办', path: '/followup' },
    { label: '医生意见待跟进', value: 4, linkText: '查看待办', path: '/warning' },
  ],
  main: {
    title: '今日核心任务',
    variant: 'dot',
    items: [
      { title: '患者健康告警', info: '张女士 · 血压186/106mmHg', tag: '立即核实', tone: 'danger' },
      { title: '专病档案待完善', info: '李先生 · 糖尿病档案', tag: '今天 10:30', tone: 'muted' },
      { title: 'AI方案初审', info: '陈女士 · 第2周期方案', tag: '今天 12:00', tone: 'muted' },
      { title: '专病随访', info: '周先生 · 高血压随访', tag: '今天 15:00', tone: 'muted' },
      { title: '医生意见待跟进', info: '王女士 · 建议今日复诊', tag: '今天完成', tone: 'muted' },
    ],
  },
  side: {
    type: 'stats',
    title: '在管患者概况',
    items: [
      { label: '在管患者', value: '126人' },
      { label: '高风险患者', value: '18人', danger: true },
      { label: '本周新接管', value: '7人' },
      { label: '7日未联系', value: '5人' },
    ],
  },
  quickLinksTitle: '快捷入口（受目录权限控制）',
  quickLinks: [
    { label: '新建健康档案', path: '/health-record', permissions: [PERMISSIONS.HEALTH_VIEW] },
    { label: '随访记录', path: '/followup', permissions: [PERMISSIONS.FOLLOWUP] },
    { label: '健康指标', path: '/health-record', permissions: [PERMISSIONS.HEALTH_VIEW] },
    { label: '用药记录', path: '/health-record', permissions: [PERMISSIONS.HEALTH_VIEW] },
    { label: '检查检验', path: '/health-record', permissions: [PERMISSIONS.HEALTH_VIEW] },
  ],
}

/** 护理院养老顾问（设计稿：护理院养老顾问.png） */
const careConsultant: WorkbenchConfig = {
  title: '护理院养老顾问工作台',
  subtitle: '关注活动线索、入住意向、预约到访及跟进转化',
  banner: {
    title: '待处理工单异常',
    count: 5,
    desc: '其中2单临近超时；患者健康相关告警已同步健管师和医生',
    actionText: '进入异常处理',
    path: '/exception',
  },
  metrics: [
    { label: '未来30日活动', value: 8, suffix: '场', linkText: '查看详情', path: '/health-activity' },
    { label: '今日待跟进', value: 42, suffix: '人', linkText: '查看详情', path: '/leads' },
    { label: '预约到访', value: 31, suffix: '人', linkText: '查看详情', path: '/leads' },
    { label: '入住意向', value: 18, suffix: '条', linkText: '查看详情', path: '/leads' },
  ],
  main: {
    title: '近期活动与入住跟进',
    variant: 'plain',
    items: [
      { title: '高血压健康讲堂', info: '今天 09:30', tag: '报名25 / 签到18', tone: 'muted' },
      { title: '糖尿病营养课堂', info: '今天 14:00', tag: '报名17 / 待签到', tone: 'muted' },
      { title: '长者体适能评估', info: '8月16日 10:00', tag: '报名32', tone: 'muted' },
      { title: '家庭照护技能培训', info: '8月20日 14:00', tag: '报名19', tone: 'muted' },
      { title: '秋季健康义诊', info: '8月28日 09:00', tag: '报名46', tone: 'muted' },
    ],
  },
  side: {
    type: 'stats',
    title: '入住意向漏斗',
    items: [
      { label: '新增入住意向', value: '12' },
      { label: '今日待跟进', value: '9' },
      { label: '预约到访', value: '5' },
      { label: '已转化', value: '4', danger: false },
    ],
  },
  quickLinksTitle: '快捷入口（受目录权限控制）',
  quickLinks: [
    { label: '入住意向列表', path: '/leads', permissions: [PERMISSIONS.LEAD_VIEW] },
    { label: '预约到访', path: '/leads', permissions: [PERMISSIONS.LEAD_VIEW] },
    { label: '登记线索', path: '/leads', permissions: [PERMISSIONS.LEAD_VIEW] },
    { label: '转化登记', path: '/health-record', permissions: [PERMISSIONS.HEALTH_VIEW] },
    { label: '工单异常', path: '/exception', tone: 'warn', permissions: [PERMISSIONS.WO_DISPATCH] },
  ],
}

/** 机构管理员（设计稿：机构管理员.png） */
const orgAdmin: WorkbenchConfig = {
  title: '机构运营总览',
  subtitle: '当前机构：幸福护理院 · 关注人员负荷、订单趋势与未来30日活动',
  banner: {
    title: '运营异常待监督',
    count: 7,
    desc: '工单异常5条、人员资质即将到期1人、团队缺员1组',
    actionText: '查看负责人进度',
    path: '/exception',
  },
  metrics: [
    { label: '今日订单', value: 86, linkText: '查看详情', path: '/work-order' },
    { label: '完成率', value: '94.2%', linkText: '查看详情', path: '/work-order' },
    { label: '超负荷人员', value: 4, danger: true, linkText: '查看详情', path: '/staff' },
    { label: '未来30日活动', value: 8, suffix: '场', linkText: '查看详情', path: '/health-activity' },
  ],
  main: {
    title: '人员负荷',
    variant: 'plain',
    items: [
      { title: '王医生', info: '在管68 · 待办12', tag: '高', tone: 'danger' },
      { title: '李护士', info: '工单9 · 待办6', tag: '高', tone: 'danger' },
      { title: '张健管师', info: '在管42 · 待办15', tag: '高', tone: 'danger' },
      { title: '陈护士', info: '工单5 · 待办3', tag: '正常', tone: 'success' },
      { title: '刘健管师', info: '在管31 · 待办7', tag: '正常', tone: 'success' },
    ],
  },
  side: {
    type: 'trend',
    title: '机构订单趋势（近30日）',
    bars: [42, 55, 48, 62, 58, 70, 66, 78, 82, 76, 90],
    stats: [
      { label: '订单量', value: '2,418' },
      { label: '完成率', value: '94.2%' },
      { label: '取消', value: '38' },
      { label: '异常', value: '27', danger: true },
    ],
    footnote: '近期活动：未来30日共8场 · 报名214人 · 当前平均报名率71%',
  },
  quickLinksTitle: '管理快捷入口（受目录权限控制）',
  quickLinks: [
    { label: '新增人员', path: '/staff', permissions: [PERMISSIONS.STAFFMGR_VIEW] },
    { label: '团队管理', path: '/team', permissions: [PERMISSIONS.TEAM_VIEW] },
    { label: '角色分配', path: '/role', permissions: [PERMISSIONS.ROLE_VIEW] },
    { label: '人员管理', path: '/staff', permissions: [PERMISSIONS.STAFFMGR_VIEW] },
    { label: '异常监督', path: '/exception', tone: 'warn', permissions: [PERMISSIONS.WO_DISPATCH] },
  ],
}

/** 健康驿站运营专员（设计稿：健康驿站运营专员.png） */
const stationOperator: WorkbenchConfig = {
  title: '健康驿站运营工作台',
  subtitle: '关注未来30日活动、报名签到、用户线索和工单异常',
  banner: {
    title: '待处理工单异常',
    count: 5,
    desc: '其中2单临近超时；患者健康相关告警已同步健管师和医生',
    actionText: '进入异常处理',
    path: '/exception',
  },
  metrics: [
    { label: '未来30日活动', value: 8, suffix: '场', linkText: '查看详情', path: '/health-activity' },
    { label: '今日健康活动', value: 42, suffix: '人', linkText: '查看详情', path: '/health-activity' },
    { label: '今日待签到', value: 31, suffix: '人', linkText: '查看详情', path: '/health-activity' },
    { label: '待跟进线索', value: 18, suffix: '条', linkText: '查看详情', path: '/leads' },
  ],
  main: {
    title: '近期健康活动',
    variant: 'plain',
    items: [
      { title: '高血压健康讲堂', info: '今天 09:30', tag: '报名25 / 签到18', tone: 'muted' },
      { title: '糖尿病营养课堂', info: '今天 14:00', tag: '报名17 / 待签到', tone: 'muted' },
      { title: '长者体适能评估', info: '8月16日 10:00', tag: '报名32', tone: 'muted' },
      { title: '家庭照护技能培训', info: '8月20日 14:00', tag: '报名19', tone: 'muted' },
      { title: '秋季健康义诊', info: '8月28日 09:00', tag: '报名46', tone: 'muted' },
    ],
  },
  side: {
    type: 'stats',
    title: '线索转化',
    items: [
      { label: '新增线索', value: '12' },
      { label: '今日待跟进', value: '9' },
      { label: '高意向', value: '5' },
      { label: '待转健康档案', value: '4' },
    ],
  },
  quickLinksTitle: '快捷入口（受目录权限控制）',
  quickLinks: [
    { label: '健康活动名单', path: '/health-activity', permissions: [PERMISSIONS.ACTIVITY_VIEW] },
    { label: '现场签到', path: '/health-activity', permissions: [PERMISSIONS.ACTIVITY_VIEW] },
    { label: '登记线索', path: '/leads', permissions: [PERMISSIONS.LEAD_VIEW] },
    { label: '线索转档', path: '/leads', permissions: [PERMISSIONS.LEAD_VIEW] },
    { label: '工单异常', path: '/exception', tone: 'warn', permissions: [PERMISSIONS.WO_DISPATCH] },
  ],
}

/** 平台管理员（设计稿：平台管理员.png） */
const platformAdmin: WorkbenchConfig = {
  title: '平台运营总览',
  subtitle: '全平台视角 · 关注跨机构订单趋势、机构人员负荷、机构状态与重大异常',
  banner: {
    title: '跨机构重大异常',
    count: 12,
    desc: '涉及4家机构；重大健康事件2条、工单超时6条、资质风险4条',
    actionText: '查看负责人进度',
    path: '/exception',
  },
  metrics: [
    { label: '全平台今日订单', value: 86, linkText: '查看详情', path: '/work-order' },
    { label: '完成率', value: '94.2%', linkText: '查看详情', path: '/work-order' },
    { label: '高负荷机构', value: 4, danger: true, linkText: '查看详情', path: '/organization' },
    { label: '未来30日活动', value: 8, suffix: '场', linkText: '查看详情', path: '/health-activity' },
  ],
  main: {
    title: '机构人员负荷',
    variant: 'plain',
    items: [
      { title: '幸福护理院', info: '在管68 · 待办12', tag: '高', tone: 'danger' },
      { title: '城北康复机构', info: '工单9 · 待办6', tag: '高', tone: 'danger' },
      { title: '滨江护理院', info: '在管42 · 待办15', tag: '高', tone: 'danger' },
      { title: '东湖护理院', info: '工单5 · 待办3', tag: '正常', tone: 'success' },
      { title: '西城康复机构', info: '在管31 · 待办7', tag: '正常', tone: 'success' },
    ],
  },
  side: {
    type: 'trend',
    title: '跨机构订单趋势（近30日）',
    bars: [42, 55, 48, 62, 58, 70, 66, 78, 82, 76, 90],
    stats: [
      { label: '订单量', value: '2,418' },
      { label: '完成率', value: '94.2%' },
      { label: '取消', value: '38' },
      { label: '异常', value: '27', danger: true },
    ],
    footnote: '近期活动：未来30日共8场 · 报名214人 · 当前平均报名率71%',
  },
  quickLinksTitle: '管理快捷入口（受目录权限控制）',
  quickLinks: [
    { label: '新建机构', path: '/organization', permissions: [PERMISSIONS.ORG_VIEW] },
    { label: '机构管理', path: '/organization', permissions: [PERMISSIONS.ORG_VIEW] },
    { label: '系统角色', path: '/role', permissions: [PERMISSIONS.ROLE_VIEW] },
    { label: '人员概况', path: '/staff', permissions: [PERMISSIONS.STAFFMGR_VIEW] },
    { label: '重大异常', path: '/exception', tone: 'warn', permissions: [PERMISSIONS.WO_DISPATCH] },
  ],
}

/** 审核医生（设计稿：审核医生.png） */
const reviewDoctor: WorkbenchConfig = {
  title: '审核医生工作台',
  subtitle: '优先处理健康预警、服务订单审核、管理目标与健康管理方案',
  banner: {
    title: '高风险健康预警',
    count: 2,
    desc: '健康异常 1 条 · 层级升高 1 条，等待医生判断',
    actionText: '进入预警管理',
    path: '/warning',
  },
  metrics: [
    { label: '待审核服务订单', value: 7, linkText: '进入处理', path: '/work-order' },
    { label: '待制定管理目标', value: 9, linkText: '进入处理', path: '/goal' },
    { label: '待审核健康管理方案', value: 6, linkText: '进入处理', path: '/plan' },
    { label: '待处理预警', value: 5, danger: true, linkText: '进入处理', path: '/warning' },
  ],
  main: {
    title: '医生待办队列',
    variant: 'plain',
    items: [
      { title: '健康异常预警', info: '张女士 · 突发胸闷', tag: '红色 · 立即', tone: 'danger' },
      { title: '服务订单审核', info: 'PICC维护 · 王先生', tag: '服务时间 14:00', tone: 'muted' },
      { title: '管理目标制定', info: '李女士 · 高血压高风险', tag: '今天 11:00', tone: 'muted' },
      { title: '健康管理方案终审', info: '周先生 · 第3周期方案', tag: '今天 15:00', tone: 'muted' },
      { title: '层级变更复核', info: '赵女士 · 中风险升为高风险', tag: '待医生复核', tone: 'muted' },
    ],
  },
  side: {
    type: 'stats',
    title: '今日审核概况',
    items: [
      { label: '已完成审核', value: '14' },
      { label: '待审核订单', value: '7' },
      { label: '待终审方案', value: '6' },
      { label: '高风险预警', value: '2', danger: true },
    ],
  },
  quickLinksTitle: '专业信息快捷入口（受目录权限控制）',
  quickLinks: [
    { label: '患者健康摘要', path: '/health-record', tone: 'info', permissions: [PERMISSIONS.HEALTH_VIEW] },
    { label: '检查检验', path: '/health-record', tone: 'info', permissions: [PERMISSIONS.HEALTH_VIEW] },
    { label: '用药记录', path: '/health-record', tone: 'info', permissions: [PERMISSIONS.HEALTH_VIEW] },
    { label: '分层分级', path: '/assessment', tone: 'info', permissions: [PERMISSIONS.HEALTH_ASSESS] },
    { label: '历史审核', path: '/plan', tone: 'info', permissions: [PERMISSIONS.HEALTH_PLAN] },
  ],
}

/** 岗位 → 工作台模板映射（未知岗位回退到健康管理师模板） */
export const workbenchConfigs: Record<PositionCode, WorkbenchConfig> = {
  [POSITIONS.HEALTH_MANAGER]: healthManager,
  [POSITIONS.CARE_CONSULTANT]: careConsultant,
  [POSITIONS.ORG_ADMIN]: orgAdmin,
  [POSITIONS.STATION_OPERATOR]: stationOperator,
  [POSITIONS.PLATFORM_ADMIN]: platformAdmin,
  [POSITIONS.REVIEW_DOCTOR]: reviewDoctor,
}

export const defaultWorkbenchConfig = healthManager
