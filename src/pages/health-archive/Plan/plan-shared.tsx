import Tag from '@/components/StatusTag'
import dayjs from 'dayjs'
import type {
  HealthPlan, HealthPlanDetail, HealthPlanIntervention, HealthPlanReview,
} from '@/api/modules/plan'
import { display } from './shared'

export const PLAN_STATUS_META: Record<number, { label: string; color: string }> = {
  1: { label: '草稿', color: 'default' },
  2: { label: '健管师通过', color: 'processing' },
  3: { label: '已定稿', color: 'success' },
  9: { label: '已中止', color: 'error' },
}

export const FIELD_TYPE_META: Record<number, string> = {
  1: '数值', 2: '文本', 3: '布尔', 4: '枚举', 5: '多选',
}

export const PLAN_TYPE_META: Record<number, string> = {
  1: '健康方案',
}

export const GOAL_CATEGORY_META: Record<number, { label: string; color: string }> = {
  1: { label: '关键指标', color: 'blue' },
  2: { label: '用药依从', color: 'purple' },
  3: { label: '饮食', color: 'green' },
  4: { label: '运动', color: 'orange' },
  5: { label: '睡眠', color: 'cyan' },
  6: { label: '急性事件与安全', color: 'red' },
  7: { label: '心理情绪', color: 'magenta' },
}

export const GOAL_CATEGORY_OPTIONS = Object.entries(GOAL_CATEGORY_META).map(([value, meta]) => ({
  value: Number(value), label: meta.label,
}))

export const REVIEW_ACTION_META: Record<number, { label: string; color: string }> = {
  1: { label: '生成方案', color: 'blue' },
  2: { label: '健管师通过', color: 'processing' },
  3: { label: '医生通过', color: 'green' },
  4: { label: '医生驳回', color: 'red' },
  9: { label: '中止方案', color: 'default' },
}

export function planTypeText(value: unknown) {
  const numericValue = typeof value === 'string' && value.trim() !== '' ? Number(value) : value
  return typeof numericValue === 'number' && PLAN_TYPE_META[numericValue]
    ? PLAN_TYPE_META[numericValue]
    : display(value)
}

export function goalCategoryTag(category?: number) {
  const meta = GOAL_CATEGORY_META[category ?? 0]
  return <Tag color={meta?.color}>{meta?.label ?? display(category)}</Tag>
}

export function planTitle(plan?: HealthPlan) {
  if (!plan) return '-'
  const customTitle = plan.plan_name ?? plan.name ?? plan.title
  if (customTitle != null && customTitle !== '') return display(customTitle)
  return plan.plan_type != null ? planTypeText(plan.plan_type) : `方案 #${plan.id}`
}

export function planDate(value?: number) {
  return value && value > 0 ? dayjs(value * 1000).format('YYYY-MM-DD') : '-'
}

export function planStatusTag(status?: number) {
  const meta = PLAN_STATUS_META[status ?? 0]
  return <Tag color={meta?.color}>{meta?.label ?? display(status)}</Tag>
}

export function detailParts(detail?: HealthPlanDetail) {
  const plan = (detail?.plan ?? detail ?? {}) as HealthPlan
  const goals = detail?.goals ?? plan.goals ?? []
  const interventions = detail?.interventions ?? plan.interventions ?? []
  const audit_reviews = detail?.audit_reviews ?? plan.audit_reviews ?? []
  return { plan, goals, interventions, audit_reviews }
}

export function reviewActionTag(review: HealthPlanReview) {
  const meta = REVIEW_ACTION_META[review.action ?? 0]
  return <Tag color={meta?.color}>{meta?.label ?? display(review.action)}</Tag>
}

export function reviewRoleText(role?: string) {
  return ({ ai: 'AI', healthmgr: '健管师', doctor: '医生' } as Record<string, string>)[role ?? ''] ?? display(role)
}

export function interventionLabel(intervention?: HealthPlanIntervention) {
  if (!intervention) return '-'
  return intervention.interv_name || intervention.interv_code || `干预 #${intervention.id}`
}

export function frequencyText(intervention: HealthPlanIntervention) {
  if (intervention.checkin_freq_type === 1) return '每日 1 次'
  if (intervention.checkin_freq_type === 2) {
    return intervention.checkin_freq_value != null
      ? `每周 ${intervention.checkin_freq_value} 次`
      : '每周（次数未设置）'
  }
  return '-'
}

export function executionText(plan: HealthPlan) {
  if (plan.status !== 3) return null
  const now = dayjs()
  const start = plan.start_date && plan.start_date > 0 ? dayjs(plan.start_date * 1000) : null
  const end = plan.end_date && plan.end_date > 0 ? dayjs(plan.end_date * 1000) : null
  if (start?.isValid() && now.isBefore(start, 'day')) return '待生效'
  if (end?.isValid() && now.isAfter(end, 'day')) return '已完成'
  return '执行中'
}
