import { http } from '@/utils/request'
import type { PageParams, PageResult } from '@/types/api'

/**
 * 服务订单（协同工作台端，对齐 swagger orders 模块）
 * 网关前缀：/api/v1/staff
 * order_status：2-待确定（审核通过待派单确认）3-已确认
 */

/** 订单状态 */
export const ORDER_STATUS_MAP: Record<number, string> = {
  1: '待审核',
  2: '待确定',
  3: '已确认',
  4: '已完成',
  9: '已取消',
}

/** 订单列表项 */
export interface OrderItem {
  id: number
  order_no?: string
  member_id?: number
  member_name?: string
  service_id?: number
  service_name?: string
  institution_id?: number
  amount?: number
  /** 见 ORDER_STATUS_MAP */
  order_status?: number
  status?: number
  remark?: string
  created_at?: number
}

/** 订单详情 */
export interface OrderDetail extends OrderItem {
  contact_name?: string
  contact_phone?: string
  address?: string
  assignee?: number
  assignee_name?: string
  [key: string]: unknown
}

/** 待确定订单列表（GET /orders/pending-confirm，order_status=2） */
export function getPendingConfirmOrders(params: PageParams & { keyword?: string }) {
  return http.get<PageResult<OrderItem>>('/v1/staff/orders/pending-confirm', { ...params })
}

/** 订单详情（GET /orders/{id}） */
export function getOrderDetail(id: number | string) {
  return http.get<OrderDetail>(`/v1/staff/orders/${id}`)
}

/** 确认订单（POST /orders/{id}/confirm，2→3） */
export function confirmOrder(id: number | string, data?: Record<string, unknown>) {
  return http.post<null>(`/v1/staff/orders/${id}/confirm`, data)
}

/** 驳回订单（POST /orders/{id}/reject） */
export function rejectOrder(id: number | string, data?: { reason?: string; opinion?: string }) {
  return http.post<null>(`/v1/staff/orders/${id}/reject`, data)
}
