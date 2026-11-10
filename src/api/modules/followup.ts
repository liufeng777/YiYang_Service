import { http } from '@/utils/request'
import type { PageParams, PageResult } from '@/types/api'
import type { ApiData, Id } from './common'

export const FOLLOWUP_STATUS_MAP: Record<number, string> = { 1: '待回访', 2: '已回访' }
export const FOLLOWUP_TYPE_MAP: Record<number, string> = { 1: '日常随访', 2: '健康预警回访' }
export const FOLLOWUP_RESULT_MAP: Record<number, string> = { 1: '已完成', 2: '未接通', 3: '需跟进' }

export interface FollowupItem extends ApiData {
  id: number
  member_id: number
  member_name: string
  member_gender?: number
  member_age?: number
  institution_id: number
  staff_id?: number | null
  source_type: number
  source_id?: number | null
  warning_id?: number
  followup_type: number
  followup_time?: number | null
  last_followup_time?: number | null
  plan_time?: string | number | null
  followup_name?: string | null
  status: number
  severity?: number
  next_followup_date?: string
  result?: number
  remark?: string
}

export interface FollowupListParams extends PageParams {
  status?: number
  followup_type?: number
  member_id?: number
}

export function getFollowups(params: FollowupListParams) {
  return http.get<PageResult<FollowupItem>>('/v1/staff/followups', { ...params })
}

export function getFollowupDetail(id: Id) {
  return http.get<ApiData>(`/v1/staff/followups/${id}`)
}

export function getFollowupTemplate(id: Id, params: { followup_type: number; warning_id?: number }) {
  return http.get<ApiData>(`/v1/staff/members/${id}/followup-template`, { ...params })
}

export function createFollowup(id: Id, data: {
  followup_type: number
  warning_id?: number
  next_followup_date: string
}) {
  return http.post<{ id: number }>(`/v1/staff/members/${id}/followups`, data)
}

/** 草稿只保存填写内容，不改变状态；请求体字段由后端通用 object 模型定义。 */
export function saveFollowup(id: Id, data: ApiData) {
  return http.post<ApiData>(`/v1/staff/followups/${id}/save`, data)
}

/** 完成随访并提交结果、补充说明和子项值。 */
export function completeFollowup(id: Id, data: ApiData) {
  return http.post<ApiData>(`/v1/staff/followups/${id}/complete`, data)
}
