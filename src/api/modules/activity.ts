import { http } from '@/utils/request'
import type { PageParams, PageResult } from '@/types/api'

/** 活动状态：1-待参加 2-已签到 9-已取消。 */
export const ACTIVITY_STATUS_MAP: Record<number, string> = { 1: '待参加', 2: '已签到', 9: '已取消' }

/** 报名状态：1-待参加 2-已签到 3-已取消。 */
export const REG_STATUS_MAP: Record<number, string> = { 1: '待参加', 2: '已签到', 3: '已取消' }

export interface ActivityInstitution {
  id: number
  institution_id?: number
  institution_name?: string
  contact_name?: string
  contact_phone?: string
  start_time?: number
  end_time?: number
  max_participants?: number
  registered_count?: number
  remaining_quota?: number
  status?: number
}

export interface ActivityItem {
  id: number
  title?: string
  activity_name?: string
  activity_type?: number
  cover_url?: string
  description?: string
  target_crowd?: string
  status?: number
  start_date?: number
  end_date?: number
  location?: string
  address?: string
  max_participants?: number
  registered_count?: number
  remaining_quota?: number
  created_at?: number
  institutions?: ActivityInstitution[]
}

/** 报名/签到记录（GET /staff/activities/{id}/registrations 返回字段为下划线命名）。 */
export interface RegistrationItem {
  registration_id: number
  activity_id?: number
  activity_name?: string
  institution_id?: number
  member_id?: number
  member_name?: string
  member_phone?: string
  member_gender?: number
  member_age?: number
  participant_count?: number
  status?: number
  remark?: string
  /** 报名来源（后端暂未返回枚举值，仅原样展示） */
  registration_source?: string
  /** 报名时间（秒级时间戳，0 表示无） */
  registered_at?: number
  /** 签到时间（秒级时间戳，0 表示未签到） */
  signed_at?: number
  /** 取消报名时间（秒级时间戳，0 表示未取消） */
  unregistered_at?: number
  signin_code?: string
  /** 以下为历史命名字段，后端当前不返回，仅作兼容读取 */
  contact_name?: string
  contact_phone?: string
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
