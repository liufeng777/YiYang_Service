import { http } from '@/utils/request'
import type { PageParams, PageResult } from '@/types/api'
import type { ApiData, Id } from './common'

export type HealthPlanStatus = 1 | 2 | 3 | 9
export type InterventionFieldType = 1 | 2 | 3 | 4 | 5

export interface HealthPlanGoal extends ApiData {
  id?: Id
  category?: number // 1关键指标   2用药依从  3饮食  4运动  5睡眠  6急性事件与安全  7心理情绪
  goal_code?: string
  goal_label?: string
  goal_basis?: string
  status?: number
  sort_order?: number
}

export interface HealthPlanIntervention extends ApiData {
  id?: Id
  interv_code?: string
  interv_name?: string
  action_desc?: string
  interv_basis?: string
  field_type?: InterventionFieldType // 1数值/2文本/3布尔/4枚举/5多选
  field_unit?: string
  metric_code?: string
  option_json?: string
  checkin_freq_type?: 1 | 2 // 1每日 / 2每周N次
  checkin_freq_value?: number // 每周N时的N (每日恒1)
  required?: number
  status?: number
  sort_order?: number
}

export interface HealthPlanReview extends ApiData {
  id?: Id
  action?: 1 | 2 | 3 | 4 | 9
  operator_id?: Id
  operator_name?: string
  role?: string
  remark?: string
  operated_at?: number
}

/** 通用 object 响应保留扩展字段，核心字段与设计 v2.3 中的 v2.4/v2.5 决策对齐。 */
export interface HealthPlan extends ApiData {
  id: Id
  member_id?: Id
  plan_type?: number // 1 健康方案
  health_intent?: string
  duration_days?: number
  review_remark?: string
  status?: HealthPlanStatus
  /** 方案开始日期，UTC 秒级时间戳。 */
  start_date?: number
  /** 方案结束日期，UTC 秒级时间戳。 */
  end_date?: number
  created_at?: number
  updated_at?: number
  goal_count?: number
  intervention_count?: number
  goals?: HealthPlanGoal[]
  interventions?: HealthPlanIntervention[]
  audit_reviews?: HealthPlanReview[]
  confirmed_by_name: string
  created_by_name: string
}

export interface HealthPlanDetail extends ApiData {
  plan?: HealthPlan
  goals?: HealthPlanGoal[]
  interventions?: HealthPlanIntervention[]
  audit_reviews?: HealthPlanReview[]
}

export interface HealthPlanPayload {
  plan_type: number
  health_intent?: string
  duration_days: number
  start_date?: number
  end_date?: number
  goals: HealthPlanGoal[]
  interventions: HealthPlanIntervention[]
}

export interface HealthPlanDraft {
  plan_type?: number
  health_intent?: string
  duration_days?: number
  goals: HealthPlanGoal[]
  interventions: HealthPlanIntervention[]
}

export interface HealthPlanDraftResult extends ApiData {
  task_no?: string
  status?: 1 | 2 | 3
  error_msg?: string
  goals?: HealthPlanGoal[]
  interventions?: HealthPlanIntervention[]
  draft?: HealthPlanDraft
}

export interface HealthPlanCheckinItem {
  intervention_id: number
  field_value?: number
  value_text?: string
  is_abnormal?: number
}

export interface HealthPlanCheckin extends HealthPlanCheckinItem, ApiData {
  id: Id
  plan_id?: Id
  member_id?: Id
  checkin_time?: number
  created_at?: number
}

export interface HealthPlanInterventionStat extends ApiData {
  intervention_id?: Id
  interv_name?: string
  expected_count?: number
  actual_count?: number
  completion_rate?: number
  missing_count?: number
  consecutive_days?: number
}

export interface HealthPlanCheckinStats extends ApiData {
  completion_rate?: number
  consecutive_days?: number
  expected_count?: number
  actual_count?: number
  missing_count?: number
  interv_stats?: HealthPlanInterventionStat[]
}

/** checkin-dued / checkin-stats 的日期参数均为 UTC 秒。 */
export interface PlanCheckinDateParams {
  start_date?: number
  end_date?: number
}

export function getHealthPlans(memberId: Id, params: PageParams & { status?: HealthPlanStatus }) {
  return http.get<PageResult<HealthPlan>>(`/v1/staff/members/${memberId}/plans`, { ...params })
}

export function createHealthPlan(memberId: Id, data: HealthPlanPayload) {
  return http.post<HealthPlanDetail>(`/v1/staff/members/${memberId}/plans`, data)
}

export function getHealthPlanDetail(id: Id) {
  return http.get<HealthPlanDetail>(`/v1/staff/plans/${id}`)
}

export function updateHealthPlan(id: Id, data: HealthPlanPayload) {
  return http.put<HealthPlanDetail>(`/v1/staff/plans/${id}`, data)
}

export function createHealthPlanDraft(memberId: Id, data: {
  requirement: string
  plan_type?: number
  duration_days?: number
  use_health_record?: boolean
}) {
  return http.post<{ task_no: string; poll_url?: string }>(`/v1/staff/members/${memberId}/plan-drafts`, data)
}

export function getHealthPlanDraft(taskNo: string) {
  return http.get<HealthPlanDraftResult>(`/v1/staff/plan-drafts/${encodeURIComponent(taskNo)}`)
}

/** 审核意见随履历追加，并回写方案的 review_remark。 */
export function reviewHealthPlan(id: Id, data: { pass: boolean; remark?: string }) {
  return http.post<ApiData>(`/v1/staff/plans/${id}/review`, data)
}

export function abandonHealthPlan(id: Id) {
  return http.post<ApiData>(`/v1/staff/plans/${id}/abandon`)
}

export function createHealthPlanCheckin(id: Id, data: { items: HealthPlanCheckinItem[] }) {
  return http.post<ApiData>(`/v1/staff/plans/${id}/checkin`, data)
}

export function updateHealthPlanCheckin(id: Id, checkinId: Id, data: HealthPlanCheckinItem) {
  return http.put<ApiData>(`/v1/staff/plans/${id}/checkins/${checkinId}`, data)
}

export function deleteHealthPlanCheckin(id: Id, checkinId: Id) {
  return http.delete<ApiData>(`/v1/staff/plans/${id}/checkins/${checkinId}`)
}

export function getHealthPlanCheckinDue(id: Id, params?: PlanCheckinDateParams) {
  return http.get<ApiData>(`/v1/staff/plans/${id}/checkin-dued`, { ...params })
}

export function getHealthPlanCheckinStats(id: Id, params?: PlanCheckinDateParams) {
  return http.get<HealthPlanCheckinStats>(`/v1/staff/plans/${id}/checkin-stats`, { ...params })
}

export function getHealthPlanCheckins(id: Id, params: PageParams & {
  intervention_id?: Id
  start_time?: number
  end_time?: number
}) {
  return http.get<PageResult<HealthPlanCheckin>>(`/v1/staff/plans/${id}/checkins`, { ...params })
}
