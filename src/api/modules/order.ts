import { http } from '@/utils/request'
import type { PageParams, PageResult } from '@/types/api'

/**
 * 服务订单（协同工作台端，对齐 swagger orders 模块）
 * 网关前缀：/api/v1/staff
 * order_status：2-待确定（审核通过待派单确认）3-已确认
 */

/** 订单状态 */
export const ORDER_STATUS_MAP: Record<number, string> = {
  1: '待支付',
  2: '待确认',
  3: '生效中',
  4: '已完成',
  5: '已取消',
  6: '已退款',
  7: '退款中',
  8: '退款待审批'
}

/** 订单列表项 */
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
  /** 见 ORDER_STATUS_MAP */
  order_status?: number
  status?: number
  remark?: string
  created_at?: number
}

/** 订单详情 */

export interface OrderDetail {
  address_detail: string
  address_region: string
  amount: string
  consumables: string[]
  // 联系人
  contact_name?: string
  contact_phone?: string
  id: string;
  institution_name: string;
  member_age?: number
  member_chronic_disease: string[] // 如 ["高血脂症", "2型糖尿病", "高血压"]
  member_gender?: number
  member_health_record: {
    data_source: number
    is_abnormal: number
    metric_id: number
    metric_name: string
    metric_value: string
    record_time: number
    unit: string
  }[]
  // 如 [{
  //   data_source: 2,
  //   is_abnormal: 1,
  //   metric_id: 3,
  //   metric_name: "空腹血糖",
  //   metric_value: "6.40",
  //   record_time: 1788350400,
  //   unit: "mmol/L"
  // }]
  member_id: number
  member_name: string
  order_no: string
  order_status: number
  remark: string
  service_id: number
  service_name: string
  services: string[]
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
