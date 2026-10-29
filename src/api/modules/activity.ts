import { http } from '@/utils/request'
import type { PageParams, PageResult } from '@/types/api'

/**
 * 健康活动（协同工作台端，对齐 swagger「staff-健康活动」模块）
 * 网关前缀：/api/v1/staff
 * 说明：swagger 出参均为通用 pkg.Response（data: {}），未定义字段 schema，
 * 以下出参字段按业务命名预定义并做可选兼容，如后端实际字段名有出入仅需调整此处。
 */

/** 报名状态：1-待参加 2-已签到 3-已取消 */
export const REG_STATUS_MAP: Record<number, string> = {
  1: '待参加',
  2: '已签到',
  3: '已取消',
}

/** 健康活动列表项 */
export interface ActivityItem {
  id: number
  title?: string
  activity_name?: string
  cover_url?: string
  /** 活动状态（枚举未定义，原样展示） */
  status?: number
  start_date?: number | string
  end_date?: number | string
  location?: string
  address?: string
  quota?: number
  registered_count?: number
  [key: string]: unknown
}

/** 活动报名记录 */
export interface RegistrationItem {
  id: number
  member_id?: number
  member_name?: string
  contact_name?: string
  contact_phone?: string
  participant_count?: number
  /** 见 REG_STATUS_MAP */
  status?: number
  remark?: string
  created_at?: number
  [key: string]: unknown
}

/** 代报名入参（staff.ReqStaffActivityRegister） */
export interface ActivityRegisterReq {
  contact_name?: string
  contact_phone?: string
  member_id?: number
  participant_count?: number
  remark?: string
}

/** 健康活动分页列表（GET /activities） */
export function getActivities(params: PageParams) {
  return http.get<PageResult<ActivityItem>>('/v1/staff/activities', { ...params })
}

/** 健康活动详情（GET /activities/{id}） */
export function getActivityDetail(id: number | string) {
  return http.get<ActivityItem>(`/v1/staff/activities/${id}`)
}

/** 活动报名记录分页列表（GET /activities/{id}/registrations） */
export function getActivityRegistrations(
  id: number | string,
  params: PageParams & { status?: number; keyword?: string },
) {
  return http.get<PageResult<RegistrationItem>>(`/v1/staff/activities/${id}/registrations`, {
    ...params,
  })
}

/** 活动代报名（POST /activities/{id}/registrations） */
export function registerActivity(id: number | string, data: ActivityRegisterReq) {
  return http.post<null>(`/v1/staff/activities/${id}/registrations`, data)
}

/** 取消活动报名（POST /activities/{id}/registrations/{rid}/cancel） */
export function cancelRegistration(id: number | string, rid: number | string) {
  return http.post<null>(`/v1/staff/activities/${id}/registrations/${rid}/cancel`)
}

/** 活动报名签到（POST /activities/{id}/registrations/{rid}/checkin） */
export function checkinRegistration(id: number | string, rid: number | string) {
  return http.post<null>(`/v1/staff/activities/${id}/registrations/${rid}/checkin`)
}
