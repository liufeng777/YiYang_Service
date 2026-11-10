import { http } from '@/utils/request'
import type { PageParams, PageResult } from '@/types/api'
import type { ApiData, Id } from './common'

export const HEALTH_ACCESS_STATUS_MAP: Record<number, string> = {
  1: '待处理', 2: '管理拒绝', 3: '待健管师确认', 4: '健管师拒绝', 5: '已接入',
}

export interface HealthAccessItem extends ApiData {
  id: number
  member_id: number
  member_name?: string
  member_phone?: string
  institution_id?: number
  staff_id?: number
  staff_name?: string
  status?: number
  source_type?: number
  demand_desc?: string
  demand_tags?: string
  health_intent?: string
  relation?: number
  remark?: string
  created_at?: number
}

export interface HealthAccessCreate extends ApiData {
  member_id: number
  institution_id?: number
  source_type?: number
  demand_desc?: string
  demand_tags?: string
  health_intent?: string
  relation?: number
  remark?: string
}

export function getHealthAccesses(params: PageParams & {
  status?: number
  source_type?: number
  key?: string
  days?: number
}) {
  return http.get<PageResult<HealthAccessItem>>('/v1/staff/health-accesses', { ...params })
}

export function createHealthAccess(data: HealthAccessCreate) {
  return http.post<ApiData>('/v1/staff/health-accesses', data)
}

export function getHealthAccessDetail(id: Id) {
  return http.get<HealthAccessItem>(`/v1/staff/health-accesses/${id}`)
}

export function assignHealthAccess(id: Id, data: { staff_id: number }) {
  return http.post<ApiData>(`/v1/staff/health-accesses/${id}/assign`, data)
}

export function confirmHealthAccess(id: Id, data: { relation?: number } = {}) {
  return http.post<ApiData>(`/v1/staff/health-accesses/${id}/confirm`, data)
}

export function followupHealthAccess(id: Id, data: { content: string }) {
  return http.post<ApiData>(`/v1/staff/health-accesses/${id}/followup`, data)
}

export function rejectHealthAccess(id: Id, data: { reason?: string } = {}) {
  return http.post<ApiData>(`/v1/staff/health-accesses/${id}/reject`, data)
}

export function transferHealthAccess(id: Id, data: { institution_id: number; reason?: string }) {
  return http.post<ApiData>(`/v1/staff/health-accesses/${id}/transfer`, data)
}
