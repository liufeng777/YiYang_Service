/**
 * 工作台数值读取器
 * 按配置中的 OverviewFieldKey 从 GET /dashboard/overview 取数，
 * 避免用指标文案标签做模糊匹配导致口径错乱（如「待审核服务订单」误匹配「订单」）
 */
import type { DashboardOverview } from '@/api/modules/workbench'
import type { OverviewFieldKey } from './types'

/** 字段键 → 取值函数（前端仅读取接口已返回的字段） */
const OVERVIEW_READERS: Record<OverviewFieldKey, (overview: DashboardOverview) => number> = {
  'today.pending_dispatch': (o) => o.today?.pending_dispatch ?? 0,
  'today.dispatch_confirming': (o) => o.today?.dispatch_confirming ?? 0,
  'today.wo_running': (o) => o.today?.wo_running ?? 0,
  'today.wo_completed': (o) => o.today?.wo_completed ?? 0,
  'today.scheduled_staff': (o) => o.today?.scheduled_staff ?? 0,
  'lead.new': (o) => o.lead?.new ?? 0,
  'lead.followup_due_today': (o) => o.lead?.followup_due_today ?? 0,
  'appointment.confirmed_today': (o) => o.appointment?.confirmed_today ?? 0,
  'appointment.arriving_today': (o) => o.appointment?.arriving_today ?? 0,
  'health.pending_assessment': (o) => o.health?.pending_assessment ?? 0,
  'health.warn_active': (o) => o.health?.warn_active ?? 0,
  'health.warn_high': (o) => o.health?.warn_high ?? 0,
  'health.followup_due_today': (o) => o.health?.followup_due_today ?? 0,
  'health.plan_pending_confirm': (o) => o.health?.plan_pending_confirm ?? 0,
  'visit.today_visit': (o) => o.visit?.today_visit ?? 0,
}

/**
 * 读取 overview 字段值
 * @returns 未配置 key 或接口数据未就绪时返回 undefined（展示为「-」）
 */
export function readOverviewField(
  key: OverviewFieldKey | undefined,
  overview?: DashboardOverview,
): number | undefined {
  if (!key || !overview) return undefined
  return OVERVIEW_READERS[key](overview)
}

/** 格式化展示值：无数据来源 / 未加载时统一显示「-」 */
export function formatOverviewValue(
  key: OverviewFieldKey | undefined,
  overview?: DashboardOverview,
): number | string {
  const value = readOverviewField(key, overview)
  return value === undefined ? '-' : value
}
