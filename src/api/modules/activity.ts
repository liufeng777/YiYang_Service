import { http } from '@/utils/request'
import type { PageParams, PageResult } from '@/types/api'

/** 报名状态：1-待参加 2-已签到 3-已取消。 */
export const REG_STATUS_MAP: Record<number, string> = { 1: '待参加', 2: '已签到', 3: '已取消' }

export interface ActivityItem {
  id: number
  title?: string
  activity_name?: string
  cover_url?: string
  status?: number
  start_date?: number
  end_date?: number
  location?: string
  address?: string
  quota?: number
  registered_count?: number
  [key: string]: unknown
}

export interface RegistrationItem {
  id: number
  member_id?: number
  member_name?: string
  contact_name?: string
  contact_phone?: string
  participant_count?: number
  status?: number
  remark?: string
  created_at?: number
  [key: string]: unknown
}

/** staff.ReqStaffActivityRegister */
export interface ActivityRegisterReq {
  contact_name?: string
  contact_phone?: string
  member_id?: number
  participant_count?: number
  remark?: string
}

export function getActivities(params: PageParams) {
  return http.get<PageResult<ActivityItem>>('/v1/staff/activities', { ...params })
}

export function getActivityDetail(id: number | string) {
  return http.get<ActivityItem>(`/v1/staff/activities/${id}`)
}

export function getActivityRegistrations(
  id: number | string,
  params: PageParams & { status?: number; keyword?: string },
) {
  return http.get<PageResult<RegistrationItem>>(`/v1/staff/activities/${id}/registrations`, { ...params })
}

export function registerActivity(id: number | string, data: ActivityRegisterReq) {
  return http.post<null>(`/v1/staff/activities/${id}/registrations`, data)
}

export function cancelRegistration(id: number | string, registrationId: number | string) {
  return http.post<null>(`/v1/staff/activities/${id}/registrations/${registrationId}/cancel`)
}

export function checkinRegistration(id: number | string, registrationId: number | string) {
  return http.post<null>(`/v1/staff/activities/${id}/registrations/${registrationId}/checkin`)
}
