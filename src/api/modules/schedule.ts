import { http } from '@/utils/request'
import type { PageParams, PageResult } from '@/types/api'

/**
 * 排班管理（协同工作台端，对齐 swagger schedules 模块）
 * 网关前缀：/api/v1/staff
 */

/** 排班列表项 */
export interface ScheduleItem {
  id: number
  staff_id?: number
  staff_name?: string
  institution_id?: number
  /** YYYY-MM-DD */
  schedule_date?: string
  start_time?: string
  end_time?: string
  shift_type?: number
  status?: number
  remark?: string
  created_at?: number
}

/** 排班分页列表（GET /schedules，view: day / week / month） */
export function getSchedules(
  params: PageParams & {
    view?: 'day' | 'week' | 'month'
    /** YYYY-MM-DD */
    date?: string
    staff_id?: number
    /** YYYY-MM-DD */
    end_date?: string
  },
) {
  return http.get<PageResult<ScheduleItem>>('/v1/staff/schedules', { ...params })
}

/** 新建排班（POST /schedules） */
export function createSchedule(data: Partial<ScheduleItem>) {
  return http.post<{ id: number }>('/v1/staff/schedules', data)
}

/** 排班详情（GET /schedules/{id}） */
export function getScheduleDetail(id: number | string) {
  return http.get<ScheduleItem>(`/v1/staff/schedules/${id}`)
}

/** 编辑排班（PUT /schedules/{id}） */
export function updateSchedule(id: number | string, data: Partial<ScheduleItem>) {
  return http.put<null>(`/v1/staff/schedules/${id}`, data)
}

/** 删除排班（DELETE /schedules/{id}） */
export function deleteSchedule(id: number | string) {
  return http.delete<null>(`/v1/staff/schedules/${id}`)
}
