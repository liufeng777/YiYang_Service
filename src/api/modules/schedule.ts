import { http } from '@/utils/request'
import type { PageParams, PageResult } from '@/types/api'
import type { ReassignLog, WorkOrderPhoto } from './work-order'

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

/**
 * 服务排单详情（GET /schedules/{id} 出参）：派单创建的 service_schedules 记录
 * swagger 出参为通用 pkg.Response，扩展字段以后端实际返回为准，缺省降级展示为 -
 */
export interface ServiceScheduleDetail extends ScheduleItem {
  work_order_id?: number
  work_order_no?: string
  /** 服务人员岗位 / 职称 */
  position_name?: string
  title?: string
  /** 计划服务起止（秒） */
  planned_start_at?: number
  planned_stop_at?: number
  /** 派单人 / 派单时间 */
  assigned_by_name?: string
  assigned_at?: number
  /** 确认接单时间 */
  confirmed_at?: number
  /** 服务执行留痕：上门签到 / 开始 / 结束 */
  checkin_at?: number
  start_at?: number
  finish_at?: number
  /** 照片与凭证 */
  photos?: WorkOrderPhoto[]
  /** 改派记录 */
  reassign_logs?: ReassignLog[]
  [key: string]: unknown
}

/** 排班详情（GET /schedules/{id}） */
export function getScheduleDetail(id: number | string) {
  return http.get<ServiceScheduleDetail>(`/v1/staff/schedules/${id}`)
}

/** 编辑排班（PUT /schedules/{id}） */
export function updateSchedule(id: number | string, data: Partial<ScheduleItem>) {
  return http.put<null>(`/v1/staff/schedules/${id}`, data)
}

/** 删除排班（DELETE /schedules/{id}） */
export function deleteSchedule(id: number | string) {
  return http.delete<null>(`/v1/staff/schedules/${id}`)
}
