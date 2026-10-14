import { http } from '@/utils/request'
import type { PageParams, PageResult } from '@/types/api'

/**
 * 退款审批（协同工作台端，对齐 swagger refunds 模块）
 * 网关前缀：/api/v1/staff
 */

/** 退款状态 */
export const REFUND_STATUS_MAP: Record<number, string> = {
  1: '待审批',
  2: '已同意',
  3: '已驳回',
  4: '已退款',
}

/** 退款申请列表项 */
export interface RefundItem {
  id: number
  order_id?: number
  order_no?: string
  member_id?: number
  member_name?: string
  amount?: number
  reason?: string
  status?: number
  /** UTC 秒 */
  apply_time?: number
  created_at?: number
}

/** 退款详情 */
export interface RefundDetail extends RefundItem {
  images?: string[]
  opinion?: string
  [key: string]: unknown
}

/** 审批日志 */
export interface RefundLog {
  id: number
  refund_id?: number
  approver_type?: string
  approver_name?: string
  action?: string
  opinion?: string
  created_at?: number
}

/** 退款申请分页列表（GET /refunds，start_time/end_time 为 UTC 秒） */
export function getRefunds(
  params: PageParams & { status?: number; start_time?: number; end_time?: number },
) {
  return http.get<PageResult<RefundItem>>('/v1/staff/refunds', { ...params })
}

/** 退款详情（GET /refunds/{id}） */
export function getRefundDetail(id: number | string) {
  return http.get<RefundDetail>(`/v1/staff/refunds/${id}`)
}

/** 退款审批（POST /refunds/{id}/approve） */
export function approveRefund(id: number | string, data: { approve: boolean; opinion?: string }) {
  return http.post<null>(`/v1/staff/refunds/${id}/approve`, data)
}

/** 退款审批日志（GET /refunds/{id}/logs，approver_type: staff / finance） */
export function getRefundLogs(id: number | string, approverType?: 'staff' | 'finance') {
  return http.get<RefundLog[]>(`/v1/staff/refunds/${id}/logs`, {
    approver_type: approverType,
  })
}
