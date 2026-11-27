import { http } from '@/utils/request'
import type { PageParams, PageResult } from '@/types/api'

export const ORDER_STATUS_MAP: Record<number, string> = {
  1: '待支付', 2: '待确认', 3: '生效中', 4: '已完成', 5: '已取消', 6: '已退款', 7: '退款中', 8: '退款待审批',
}

export interface OrderItem {
  id: number
  order_no?: string
  member_id?: number
  member_name?: string
  service_id?: number
  service_name?: string
  service_count?: number
  institution_id?: number
  amount?: number
  paid_at?: number
  order_status?: number
  status?: number
  remark?: string
  created_at?: number
}

/** 按员工聚合的当日工单简要信息（GET /orders/by-staff）。 */
export interface StaffOrderBrief {
  id?: number
  work_order_id?: number
  order_no?: string
  work_order_no?: string
  member_name?: string
  service_name?: string
  wo_status?: number
  /** 计划服务起止时间（秒）。 */
  planned_start_at?: number
  planned_stop_at?: number
  /** 服务时长（分钟），缺少计划结束时间时用于补算。 */
  duration?: number
  remark?: string
}

export interface StaffOrdersItem {
  staff_id: number
  staff_name?: string
  work_orders?: StaffOrderBrief[]
}

export interface StaffOrdersResponse {
  date: string
  institution_id: number
  list: StaffOrdersItem[]
}

/** 按天查看上门服务人员的工单，date 格式为 YYYY-MM-DD。 */
export function getOrdersByStaff(date?: string) {
  return http.get<StaffOrdersResponse>('/v1/staff/orders/by-staff', date ? { date } : {})
}

export interface OrderDetail {
  address_detail: string
  address_region: string
  amount: string
  consumables: string[]
  contact_name?: string
  contact_phone?: string
  id: string
  institution_name: string
  member_age?: number
  member_chronic_disease: string[]
  member_gender?: number
  member_health_record: Array<{
    data_source: number
    is_abnormal: number
    metric_id: number
    metric_name: string
    metric_value: string
    record_time: number
    unit: string
  }>
  member_id: number
  member_name: string
  order_no: string
  order_status: number
  remark: string
  service_id: number
  service_name: string
  services: string[]
}

export function getPendingConfirmOrders(params: PageParams & { keyword?: string }) {
  return http.get<PageResult<OrderItem>>('/v1/staff/orders/pending-confirm', { ...params })
}

export function getOrderDetail(id: number | string) {
  return http.get<OrderDetail>(`/v1/staff/orders/${id}`)
}

export function confirmOrder(id: number | string, data: Record<string, unknown> = {}) {
  return http.post<null>(`/v1/staff/orders/${id}/confirm`, data)
}

export function rejectOrder(id: number | string, data: { reason?: string; opinion?: string } = {}) {
  return http.post<null>(`/v1/staff/orders/${id}/reject`, data)
}
