import { http } from '@/utils/request'
import type { PageParams, PageResult } from '@/types/api'
import type { ApiData, Id } from './common'

export const FOLLOWUP_STATUS_MAP: Record<number, string> = { 1: '待回访', 2: '已回访' }
export const FOLLOWUP_TYPE_MAP: Record<number, string> = { 1: '日常随访', 2: '健康预警回访' }
export const FOLLOWUP_RESULT_MAP: Record<number, string> = { 1: '已完成', 2: '未接通', 3: '需跟进' }

/** 随访列表及详情主记录。文档未声明的扩展字段保留在 ApiData 中。 */
export interface FollowupItem extends ApiData {
  id: number
  member_id: number
  member_name: string
  member_gender?: number
  member_age?: number
  /** 实际详情响应使用 gender / age。 */
  gender?: number
  age?: number
  institution_id: number
  staff_id?: number | null
  staff_name?: string | null
  source_type?: number
  source_id?: number | null
  source_name?: string
  warning_id?: number | null
  followup_type: number
  followup_time?: number | null
  /** 实际详情响应的完成时间字段。 */
  finish_time?: number | null
  last_followup_time?: number | null
  start_time?: number | null
  plan_time?: string | number | null
  followup_name?: string | null
  status: number
  severity?: number | null
  next_followup_date?: string | null
  result?: number | null
  remark?: string | null
  respond_relation?: number
  respond_relation_name?: string
  created_at?: number
  updated_at?: number
}

export interface FollowupListParams extends PageParams {
  /** 1 待回访，2 已回访；0 或不传为全部。 */
  status?: number
  /** 1 日常随访，2 健康预警回访；0 或不传为全部。 */
  followup_type?: number
  member_id?: number
  /** 计划时间起止，UTC 秒。 */
  start_time?: number
  end_time?: number
}

/** 详情主记录直接位于根节点，groups 按 item_type 分组；同时兼容旧包装结构。 */
export interface FollowupDetailResponse extends ApiData {
  followup?: FollowupItem
  main?: FollowupItem
  record?: FollowupItem
  groups?: unknown
  items?: unknown
  item_groups?: unknown
  followup_items?: unknown
  subitems?: unknown
}

export interface CreateFollowupPayload {
  followup_type: number
  /** 健康预警回访必传，且预警必须属于该会员。 */
  warning_id?: number
  next_followup_date: string
}

/** 保存草稿不改变状态，也不写完成时间。 */
export interface FollowupSavePayload {
  start_time: number
  remark?: string
  next_followup_date?: string
  items: Record<string, unknown>
}

export interface FollowupCompletePayload extends FollowupSavePayload {
  /** 1 已完成，2 未接通，3 需跟进。 */
  result: number
}

export function getFollowups(params: FollowupListParams) {
  return http.get<PageResult<FollowupItem>>('/v1/staff/followups', { ...params })
}

export function getFollowupDetail(id: Id) {
  return http.get<FollowupDetailResponse>(`/v1/staff/followups/${id}`)
}

export function createFollowup(memberId: Id, data: CreateFollowupPayload) {
  return http.post<{ id: number }>(`/v1/staff/members/${memberId}/followups`, data)
}

export function saveFollowup(id: Id, data: FollowupSavePayload) {
  return http.post<null>(`/v1/staff/followups/${id}/save`, data)
}

export function completeFollowup(id: Id, data: FollowupCompletePayload) {
  return http.post<null>(`/v1/staff/followups/${id}/complete`, data)
}
