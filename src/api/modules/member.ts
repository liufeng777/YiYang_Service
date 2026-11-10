import { http } from '@/utils/request'
import type { PageParams, PageResult } from '@/types/api'

export const RISK_LEVEL_MAP: Record<number, string> = { 1: '低风险', 2: '中风险', 3: '高风险' }
export const MEMBER_STATUS_MAP: Record<number, string> = { 1: '待完善', 2: '待分配', 3: '管理中', 4: '已结案' }
export const MEMBER_ACTIVE_STATUS_MAP: Record<number, string> = { 1: '非活跃', 2: '活跃', 3: '挂起', 4: '拉黑', 5: '注销' }

export interface MemberItem {
  id: number
  name: string
  gender: number
  birthday: string
  phone: string
  nursing_home_id?: number | null
  station_id?: number | null
  status: number
  risk_level?: {
    level_type: string | number
    level_value: number
    level_name: string
    prev_level_value?: number
  } | null
  care_level?: {
    level_type: string | number
    level_value: number
    level_name: string
    prev_level_value?: number
  } | null
  chronic_disease_count: number
  assessment_count: number
  last_assessment_time?: number
}

export interface ChronicDisease {
  disease_id: number
  disease_name: string
  diagnosed_date?: string
  diagnosis_source?: string
  is_active: boolean
}

export interface LatestMetric {
  metric_id: number
  metric_code: string
  metric_name_cn: string
  metric_value: string
  metric_unit: string
  measurement_time: number
  is_abnormal: boolean
}

export interface HealthProfile {
  member: Partial<MemberItem> & {
    id: number
    name: string
    id_card?: string
    emergency_contact?: string
    emergency_phone?: string
  }
  contact?: { name?: string; phone?: string; relation?: string; emergency_contact?: string; emergency_phone?: string }
  addresses?: Array<{ type: string; detail: string }>
  levels?: { care_level?: number; risk_level?: number } | Array<{ level_type: string; level_value: number; level_name: string }>
  risk_tags?: Array<{ tag: string; source: string }>
  chronic_diseases: ChronicDisease[]
  latest_metrics: LatestMetric[]
  recent_plans?: Array<{ id: number; name: string; status: number }>
  recent_goals?: Array<{ id: number; name: string; status: number }>
}

export interface MemberListParams extends PageParams {
  keyword?: string
  risk_level?: number
  care_level?: number
  institution_id?: number
}

export function getMemberList(params: MemberListParams) {
  return http.get<PageResult<MemberItem>>('/v1/staff/members', { ...params })
}

export function createMember(data: {
  name: string
  gender: number
  birthday: string
  phone: string
  id_card?: string
  emergency_contact?: string
  emergency_phone?: string
  nursing_home_id?: number | null
  station_id?: number | null
}) {
  return http.post<{ id: number }>('/v1/staff/members', data)
}

export function setMemberActiveStatus(data: { member_id: number; active_status: number }) {
  return http.put<null>('/v1/staff/members/active-status', data)
}

export function getHealthProfile(id: number | string) {
  return http.get<HealthProfile>(`/v1/staff/members/${id}/health-profile`)
}

export interface AssessmentItem extends Record<string, unknown> {
  id: number
  type?: string
  created_at?: number
}

/** 发起评估的请求体在 Swagger 中仅为 object，具体字段由后端评估模板决定。 */
export function getAssessments(id: number | string, params?: PageParams) {
  return http.get<PageResult<AssessmentItem>>(
    `/v1/staff/members/${id}/assessments`,
    { ...params },
  )
}

export function createAssessment(id: number | string, data: Record<string, unknown>) {
  return http.post<{ id: number }>(`/v1/staff/members/${id}/assessments`, data)
}

export function getAssessmentDetail(id: number | string) {
  return http.get<Record<string, unknown>>(`/v1/staff/assessments/${id}`)
}

export function confirmAssessment(id: number | string, data: Record<string, unknown> = {}) {
  return http.post<null>(`/v1/staff/assessments/${id}/confirm`, { id: Number(id), ...data })
}

export interface MetricRecordPayload {
  metric_code: string
  metric_value: string
  measurement_time: number
  source?: string
  [key: string]: unknown
}

/** 批量录入对应 /metric-records/batch；旧 /health-records 路径已移除。 */
export function recordHealthMetrics(id: number | string, data: { metrics: MetricRecordPayload[] }) {
  return http.post<null>(`/v1/staff/members/${id}/metric-records/batch`, data)
}

export function getMetricRecords(id: number | string, params: PageParams & {
  metric_code?: string
  is_abnormal?: 1 | 2
  start_ts?: number
  end_ts?: number
}) {
  return http.get<PageResult<Record<string, unknown>>>(`/v1/staff/members/${id}/metric-records`, { ...params })
}

export function createMetricRecord(id: number | string, data: MetricRecordPayload) {
  return http.post<null>(`/v1/staff/members/${id}/metric-records`, data)
}

export function updateMetricRecord(id: number | string, rid: number | string, data: Partial<MetricRecordPayload>) {
  return http.put<null>(`/v1/staff/members/${id}/metric-records/${rid}`, data)
}

export function getMetricTrend(id: number | string, params: {
  metric_codes: string
  limit?: number
  start_ts?: number
  end_ts?: number
}) {
  return http.get<Record<string, unknown>>(`/v1/staff/members/${id}/metric-records/trend`, { ...params })
}

export function getHealthGoals(id: number | string, params?: PageParams) {
  return http.get<PageResult<Record<string, unknown>>>(`/v1/staff/members/${id}/goals`, { ...params })
}

export function createHealthGoal(id: number | string, data: Record<string, unknown>) {
  return http.post<{ id: number }>(`/v1/staff/members/${id}/goals`, data)
}

export function getHealthPlans(id: number | string, params?: PageParams) {
  return http.get<PageResult<Record<string, unknown>>>(`/v1/staff/members/${id}/plans`, { ...params })
}

export function generateHealthPlan(id: number | string, data: Record<string, unknown>) {
  return http.post<Record<string, unknown>>(`/v1/staff/members/${id}/plans/ai-generate`, data)
}
