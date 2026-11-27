/**
 * 各岗位工作台模板配置
 * - 模板按登录用户的 positionCode 选择（见 user store POSITIONS：
 *   Admin 医护管理员 / Doctor 执业医师 / HealthMgr 健管师 / Caregiver 照护人员）
 * - 数值统一取自 GET /api/v1/staff/dashboard/overview（今日工作概览）：
 *   配置里的 key 指定 overview 字段，见 fields.ts；未配置 key 表示接口无该口径，显示「-」
 * - 列表面板取 GET /api/v1/staff/dashboard/warnings（首页预警快捷清单）
 * - 每一项都按 permissions 过滤（对齐《协同工作台-API设计》权限码模型）：
 *   用户没有对应页面的权限时该指标 / 入口不展示，避免「进入处理」跳到 403 页面
 * - 指标体系与跳转路由一一对应：指标指向承载该类待办的列表页
 */
import { POSITIONS, type PositionCode } from '@/store/modules/user'
import { PERMISSIONS } from '@/router/routes'
import type { WorkbenchConfig } from './types'

/** 医护管理员（设计稿：机构管理员.png） */
const orgAdmin: WorkbenchConfig = {
  greeting: true,
  subtitle: '关注今日派单、工单履约与健康预警处置',
  banner: {
    title: '待派单工单',
    count: 0,
    desc: '存在待派单与派单确认中的工单，请及时安排服务人员',
    actionText: '进入处理',
    path: '/work-order',
    key: 'today.pending_dispatch',
    permissions: [PERMISSIONS.WO_VIEW],
  },
  metrics: [
    { label: '待派单', value: 0, key: 'today.pending_dispatch', linkText: '进入处理', path: '/work-order', permissions: [PERMISSIONS.WO_VIEW] },
    { label: '派单确认中', value: 0, key: 'today.dispatch_confirming', linkText: '进入处理', path: '/work-order', permissions: [PERMISSIONS.WO_VIEW] },
    { label: '服务中工单', value: 0, key: 'today.wo_running', linkText: '进入处理', path: '/work-order', permissions: [PERMISSIONS.WO_VIEW] },
    { label: '活跃预警', value: 0, key: 'health.warn_active', danger: true, linkText: '进入处理', path: '/warning', permissions: [PERMISSIONS.WARN_VIEW] },
  ],
  main: {
    title: '健康预警待处置',
    variant: 'dot',
    items: [],
    emptyText: '暂无待处置预警',
    permissions: [PERMISSIONS.WARN_VIEW],
  },
  side: {
    type: 'stats',
    title: '今日运营概况',
    permissions: [PERMISSIONS.WO_VIEW, PERMISSIONS.APPT_VIEW, PERMISSIONS.FOLLOWUP, PERMISSIONS.HEALTH_ASSESS],
    items: [
      { label: '今日完成工单', value: '-', key: 'today.wo_completed', permissions: [PERMISSIONS.WO_VIEW] },
      { label: '今日到访', value: '-', key: 'appointment.arriving_today', permissions: [PERMISSIONS.APPT_VIEW] },
      { label: '今日到期随访', value: '-', key: 'health.followup_due_today', permissions: [PERMISSIONS.FOLLOWUP] },
      { label: '待确认评估', value: '-', key: 'health.pending_assessment', permissions: [PERMISSIONS.HEALTH_ASSESS] },
    ],
  },
  quickLinksTitle: '管理快捷入口',
  quickLinks: [
    { label: '人员管理', path: '/staff', permissions: [PERMISSIONS.STAFFMGR_VIEW] },
    { label: '机构信息', path: '/organization', permissions: [PERMISSIONS.ORG_VIEW] },
    { label: '订单审核', path: '/order-audit', permissions: [PERMISSIONS.ORDER_VIEW, PERMISSIONS.WO_VIEW] },
    { label: '健康预警', path: '/warning', permissions: [PERMISSIONS.WARN_VIEW] },
  ],
}

/**
 * 执业医师（设计稿：审核医生.png）
 * 待办优先级：工单（订单）审核 → 方案复核 → 健康预警 → 健康评估确认
 */
const reviewDoctor: WorkbenchConfig = {
  greeting: true,
  subtitle: '优先处理服务订单审核、健康方案复核与健康预警',
  banner: {
    title: '高风险健康预警',
    count: 0,
    desc: '当前高风险健康预警，等待医生核实处置',
    actionText: '进入预警管理',
    path: '/warning',
    key: 'health.warn_high',
    permissions: [PERMISSIONS.WARN_VIEW],
  },
  metrics: [
    // 订单审核接口未提供待审核数量（overview 无该口径），仅保留进入入口
    { label: '待审核服务订单', value: '-', linkText: '进入处理', path: '/order-audit', permissions: [PERMISSIONS.ORDER_VIEW, PERMISSIONS.WO_VIEW] },
    { label: '待复核方案', value: 0, key: 'health.plan_pending_confirm', linkText: '进入处理', path: '/health-record', permissions: [PERMISSIONS.HEALTH_VIEW] },
    { label: '活跃健康预警', value: 0, key: 'health.warn_active', danger: true, linkText: '进入处理', path: '/warning', permissions: [PERMISSIONS.WARN_VIEW] },
    { label: '待确认健康评估', value: 0, key: 'health.pending_assessment', linkText: '进入处理', path: '/health-record', permissions: [PERMISSIONS.HEALTH_ASSESS] },
  ],
  main: {
    title: '健康预警待处置',
    variant: 'dot',
    items: [],
    emptyText: '暂无待处置预警',
    permissions: [PERMISSIONS.WARN_VIEW],
  },
  side: {
    type: 'stats',
    title: '今日健康待办',
    permissions: [PERMISSIONS.WARN_VIEW, PERMISSIONS.FOLLOWUP, PERMISSIONS.HEALTH_ASSESS],
    items: [
      { label: '活跃预警', value: '-', key: 'health.warn_active', permissions: [PERMISSIONS.WARN_VIEW] },
      { label: '高风险预警', value: '-', key: 'health.warn_high', danger: true, permissions: [PERMISSIONS.WARN_VIEW] },
      { label: '今日到期随访', value: '-', key: 'health.followup_due_today', permissions: [PERMISSIONS.FOLLOWUP] },
      { label: '待确认评估', value: '-', key: 'health.pending_assessment', permissions: [PERMISSIONS.HEALTH_ASSESS] },
    ],
  },
  quickLinksTitle: '专业信息快捷入口',
  quickLinks: [
    { label: '健康档案', path: '/health-record', tone: 'info', permissions: [PERMISSIONS.HEALTH_VIEW] },
    { label: '健康会员', path: '/member', tone: 'info', permissions: [PERMISSIONS.HEALTH_VIEW] },
    { label: '健康预警', path: '/warning', tone: 'info', permissions: [PERMISSIONS.WARN_VIEW] },
    { label: '随访管理', path: '/followup', tone: 'info', permissions: [PERMISSIONS.FOLLOWUP] },
  ],
}

/** 健管师（默认模板，设计稿：健康管理师.png） */
const healthManager: WorkbenchConfig = {
  greeting: true,
  subtitle: '今日优先处理健康预警和到期随访',
  banner: {
    title: '高风险健康预警',
    count: 0,
    desc: '当前高风险健康预警，需立即核实并提交团队医生',
    actionText: '立即处理',
    path: '/warning',
    key: 'health.warn_high',
    permissions: [PERMISSIONS.WARN_VIEW],
  },
  metrics: [
    { label: '待完善档案', value: '-', linkText: '进入处理', path: '/health-record', permissions: [PERMISSIONS.HEALTH_VIEW] },
    { label: '待回复咨询', value: '-', linkText: '进入处理', path: '/consultation', permissions: [PERMISSIONS.CONSULT_VIEW] },
    { label: '今日随访', value: 0, key: 'health.followup_due_today', linkText: '进入处理', path: '/followup', permissions: [PERMISSIONS.FOLLOWUP] },
    { label: '活跃健康预警', value: 0, key: 'health.warn_active', danger: true, linkText: '进入处理', path: '/warning', permissions: [PERMISSIONS.WARN_VIEW] },
  ],
  main: {
    title: '健康预警待处置',
    variant: 'dot',
    items: [],
    emptyText: '暂无待处置预警',
    permissions: [PERMISSIONS.WARN_VIEW],
  },
  side: {
    type: 'stats',
    title: '今日健康待办',
    permissions: [PERMISSIONS.WARN_VIEW, PERMISSIONS.FOLLOWUP, PERMISSIONS.HEALTH_ASSESS],
    items: [
      { label: '活跃预警', value: '-', key: 'health.warn_active', permissions: [PERMISSIONS.WARN_VIEW] },
      { label: '高风险预警', value: '-', key: 'health.warn_high', danger: true, permissions: [PERMISSIONS.WARN_VIEW] },
      { label: '今日到期随访', value: '-', key: 'health.followup_due_today', permissions: [PERMISSIONS.FOLLOWUP] },
      { label: '待确认评估', value: '-', key: 'health.pending_assessment', permissions: [PERMISSIONS.HEALTH_ASSESS] },
    ],
  },
  quickLinksTitle: '快捷入口',
  quickLinks: [
    { label: '健康档案', path: '/health-record', permissions: [PERMISSIONS.HEALTH_VIEW] },
    { label: '健康会员', path: '/member', permissions: [PERMISSIONS.HEALTH_VIEW] },
    { label: '随访管理', path: '/followup', permissions: [PERMISSIONS.FOLLOWUP] },
    { label: '健康预警', path: '/warning', permissions: [PERMISSIONS.WARN_VIEW] },
  ],
}

/** 照护人员（Caregiver：上门照护 / 工单执行为主） */
const caregiver: WorkbenchConfig = {
  greeting: true,
  subtitle: '关注今日服务工单与上门安排',
  banner: {
    title: '待派单工单',
    count: 0,
    desc: '存在待派单与派单确认中的工单，请关注本人服务安排',
    actionText: '进入处理',
    path: '/work-order',
    key: 'today.pending_dispatch',
    permissions: [PERMISSIONS.WO_VIEW],
  },
  metrics: [
    { label: '服务中工单', value: 0, key: 'today.wo_running', linkText: '进入处理', path: '/work-order', permissions: [PERMISSIONS.WO_VIEW] },
    { label: '待派单', value: 0, key: 'today.pending_dispatch', linkText: '进入处理', path: '/work-order', permissions: [PERMISSIONS.WO_VIEW] },
    { label: '派单确认中', value: 0, key: 'today.dispatch_confirming', linkText: '进入处理', path: '/work-order', permissions: [PERMISSIONS.WO_VIEW] },
    { label: '今日完成工单', value: 0, key: 'today.wo_completed', linkText: '进入处理', path: '/work-order', permissions: [PERMISSIONS.WO_VIEW] },
  ],
  // 今日服务安排 / 本周服务概况无对应接口，不展示空面板
  quickLinksTitle: '快捷入口',
  quickLinks: [
    { label: '服务工单', path: '/work-order', permissions: [PERMISSIONS.WO_VIEW] },
    { label: '患者档案', path: '/member', permissions: [PERMISSIONS.HEALTH_VIEW] },
    { label: '咨询记录', path: '/consultation', permissions: [PERMISSIONS.CONSULT_VIEW] },
  ],
}

/** 岗位 → 工作台模板映射（未知岗位回退到健管师模板） */
export const workbenchConfigs: Record<PositionCode, WorkbenchConfig> = {
  [POSITIONS.ADMIN]: orgAdmin,
  [POSITIONS.DOCTOR]: reviewDoctor,
  [POSITIONS.HEALTH_MANAGER]: healthManager,
  [POSITIONS.CARE_GIVER]: caregiver,
}

export const defaultWorkbenchConfig = healthManager
