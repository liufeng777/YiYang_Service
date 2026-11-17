import { http } from '@/utils/request'
import type { PageParams, PageResult } from '@/types/api'
import type { ApiData, Id } from './common'

export type HealthPlanStatus = 1 | 2 | 3 | 9

export interface HealthPlanGoal extends ApiData {
  id?: Id
  name?: string
  goal_name?: string
  description?: string
  status?: number
}

export interface HealthPlanIntervention extends ApiData {
  id?: Id
  name?: string
  title?: string
  checkin_freq_type?: number
  checkin_freq_value?: number
}

export interface HealthPlanReview extends ApiData {
  id?: Id
  pass?: boolean
  status?: number
  created_at?: number
}

/** Swagger 响应为通用 object，保留扩展字段以完整呈现后端实际数据。 */
export interface HealthPlan extends ApiData {
  id: Id
  member_id?: Id
  name?: string
  plan_name?: string
  title?: string
  status?: HealthPlanStatus
  start_date?: string | number
  end_date?: string | number
  created_at?: number
  updated_at?: number
  goal_count?: number
  intervention_count?: number
  goals?: HealthPlanGoal[]
  interventions?: HealthPlanIntervention[]
}

export interface HealthPlanDetail extends ApiData {
  plan?: HealthPlan
  goals?: HealthPlanGoal[]
  interventions?: HealthPlanIntervention[]
  reviews?: HealthPlanReview[]
  review_history?: HealthPlanReview[]
  review_logs?: HealthPlanReview[]
}

export interface HealthPlanPayload {
  goals: HealthPlanGoal[]
  interventions: HealthPlanIntervention[]
}

export interface HealthPlanCheckin extends ApiData {
  id: Id
  plan_id?: Id
  intervention_id?: Id
  checkin_time?: number
  created_at?: number
  items?: ApiData
}

export interface PlanCheckinDateParams {
  start_date?: string
  end_date?: string
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

/** pass 的语义来自接口描述；当前 Swagger 尚未声明该请求的 body schema。 */
export function reviewHealthPlan(id: Id, data: { pass: boolean }) {
  return http.post<ApiData>(`/v1/staff/plans/${id}/review`, data)
}

export function abandonHealthPlan(id: Id) {
  return http.post<ApiData>(`/v1/staff/plans/${id}/abandon`)
}

export function createHealthPlanCheckin(id: Id, data: { items: ApiData }) {
  return http.post<ApiData>(`/v1/staff/plans/${id}/checkin`, data)
}

export function getHealthPlanCheckinDue(id: Id, params?: PlanCheckinDateParams) {
  return http.get<ApiData>(`/v1/staff/plans/${id}/checkin-dued`, { ...params })
}

export function getHealthPlanCheckinStats(id: Id, params?: PlanCheckinDateParams) {
  return http.get<ApiData>(`/v1/staff/plans/${id}/checkin-stats`, { ...params })
}

export function getHealthPlanCheckins(id: Id, params: PageParams & {
  intervention_id?: Id
  start_time?: number
  end_time?: number
}) {
  return http.get<PageResult<HealthPlanCheckin>>(`/v1/staff/plans/${id}/checkins`, { ...params })
}
