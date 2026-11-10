import { http } from '@/utils/request'
import type { PageParams, PageResult } from '@/types/api'

export const WO_STATUS_MAP: Record<number, string> = {
  1: '待派单', 2: '待接单(已派单)', 3: '待服务', 4: '服务中', 5: '已完成', 8: '已取消', 9: '服务终止',
}
export const WO_CONTACT_STATUS_MAP: Record<number, string> = {
  1: '未到联系日', 2: '待联系', 3: '已确认', 4: '未接通', 5: '用户要求改期', 6: '用户取消',
}

export interface WorkOrderItem {
  assigned_at: number
  assigned_staff_id: number
  assigned_staff_name: string
  category: number
  contact_name: string
  contact_phone: string
  expect_staff: number
  expect_staff_name: string
  expected_start_at: number
  id: number
  work_order_no: string
  member_id: number
  member_name: string
  member_phone: string
  order_id: number
  order_no: string
  remark: string
  schedule_id: number
  service_address: string
  service_id: number
  duration: number
  service_name: string
  wo_status: number
  stages: Array<{ name: string; time: number }>
}

export interface WorkOrderPhoto {
  title?: string
  type?: string
  url?: string
  key?: string
  uploaded_at?: number
}

export interface ReassignLog {
  time?: number
  from_staff_name?: string
  to_staff_name?: string
  reason?: string
}

export interface WorkOrderDetail extends WorkOrderItem {
  institution_name?: string
  created_at?: number
  audit_staff_name?: string
  audit_status?: number
  audit_at?: number
  assigned_by_name?: string
  confirmed_at?: number
  checkin_at?: number
  start_at?: number
  finish_at?: number
  photos?: WorkOrderPhoto[]
  reassign_logs?: ReassignLog[]
}

export interface WorkOrderListParams extends PageParams {
  wo_status?: number
  staff_id?: number
  service_date?: string
  member_id?: number
  keyword?: string
  work_order_no?: string
}

export function getWorkOrders(params: WorkOrderListParams) {
  return http.get<PageResult<WorkOrderItem>>('/v1/staff/work-orders', { ...params })
}

export function getWorkOrderDetail(id: number | string) {
  return http.get<WorkOrderDetail>(`/v1/staff/work-orders/${id}`)
}

export function getPendingDispatch(params: PageParams) {
  return http.get<PageResult<WorkOrderItem>>('/v1/staff/work-orders/pending-dispatch', { ...params })
}

export interface DispatchWorkOrderReq {
  assigned_staff_id: number
  service_date: string
  planned_start_at: number
  planned_stop_at: number
  remark?: string
}

export function dispatchWorkOrder(id: number | string, data: DispatchWorkOrderReq) {
  return http.post<{ schedule_id: number; schedule_no: string }>(`/v1/staff/work-orders/${id}/dispatch`, data)
}

export function batchDispatchWorkOrders(data: Record<string, unknown>) {
  return http.post<Record<string, unknown>>('/v1/staff/work-orders/batch-dispatch', data)
}

export function reassignSchedule(id: number | string, data: {
  new_staff_id: number
  reason: string
  planned_start_at?: number
  planned_stop_at?: number
}) {
  return http.post<null>(`/v1/staff/service-schedules/${id}/reassign`, data)
}

export function cancelSchedule(id: number | string, data: { reason: string }) {
  return http.post<null>(`/v1/staff/service-schedules/${id}/cancel`, data)
}

export function cancelWorkOrder(id: number | string, data?: { reason?: string }) {
  return http.post<null>(`/v1/staff/work-orders/${id}/cancel`, data)
}
