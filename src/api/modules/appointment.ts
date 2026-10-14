import { http } from '@/utils/request'
import type { PageParams, PageResult } from '@/types/api'

/**
 * 预约管理（协同工作台端，对齐 swagger appointments 模块）
 * 网关前缀：/api/v1/staff
 */

/** 预约类型：1-咨询 2-体检 3-参观 4-服务 */
export const APPOINTMENT_TYPE_MAP: Record<number, string> = {
  1: '咨询',
  2: '体检',
  3: '参观',
  4: '服务',
}

/** 预约列表项 */
export interface AppointmentItem {
  id: number
  member_id?: number
  member_name?: string
  contact_name?: string
  contact_phone?: string
  /** YYYY-MM-DD */
  appointment_date?: string
  time_slot?: string
  /** 见 APPOINTMENT_TYPE_MAP */
  appointment_type?: number
  appoint_type?: number
  status?: number
  assigned_staff_id?: number
  assigned_staff_name?: string
  institution_id?: number
  service_interest?: string
  remark?: string
  created_at?: number
}

/** 创建预约入参（appointmentCreateReq） */
export interface AppointmentCreateReq {
  /** YYYY-MM-DD */
  appointment_date: string
  /** 1-咨询 2-体检 3-参观 4-服务 */
  appointment_type: number
  assigned_staff_id?: number
  contact_name?: string
  contact_phone?: string
  institution_id?: number
  remark?: string
  service_interest?: string
  status?: number
  time_slot?: string
  member_id?: number
}

/** 预约分页列表（GET /appointments） */
export function getAppointments(
  params: PageParams & {
    appoint_type?: number
    status?: number
    member_id?: number
    keyword?: string
  },
) {
  return http.get<PageResult<AppointmentItem>>('/v1/staff/appointments', { ...params })
}

/** 新建预约（POST /appointments） */
export function createAppointment(data: AppointmentCreateReq) {
  return http.post<{ id: number }>('/v1/staff/appointments', data)
}

/** 预约详情（GET /appointments/{id}） */
export function getAppointmentDetail(id: number | string) {
  return http.get<AppointmentItem>(`/v1/staff/appointments/${id}`)
}

/** 编辑预约（PUT /appointments/{id}） */
export function updateAppointment(id: number | string, data: Partial<AppointmentCreateReq>) {
  return http.put<null>(`/v1/staff/appointments/${id}`, data)
}

/** 删除预约（DELETE /appointments/{id}） */
export function deleteAppointment(id: number | string) {
  return http.delete<null>(`/v1/staff/appointments/${id}`)
}

/** 取消预约（POST /appointments/{id}/cancel） */
export function cancelAppointment(id: number | string, data?: { reason?: string }) {
  return http.post<null>(`/v1/staff/appointments/${id}/cancel`, data)
}

/** 更新预约状态（POST /appointments/{id}/status） */
export function updateAppointmentStatus(id: number | string, data: { status: number }) {
  return http.post<null>(`/v1/staff/appointments/${id}/status`, data)
}

/** 预约到店/到访确认（POST /appointments/{id}/visit） */
export function visitAppointment(id: number | string, data?: Record<string, unknown>) {
  return http.post<null>(`/v1/staff/appointments/${id}/visit`, data)
}
