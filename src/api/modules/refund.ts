import { http } from '@/utils/request'
import type { PageParams, PageResult } from '@/types/api'

export const REFUND_STATUS_MAP: Record<number, string> = { 1: '待审批', 2: '已同意', 3: '已驳回', 4: '已退款' }

export interface RefundItem {
  id: number
  order_id?: number
  order_no?: string
  member_id?: number
  member_name?: string
  amount?: number
  reason?: string
  status?: number
  apply_time?: number
  created_at?: number
}

export interface RefundDetail extends RefundItem {
  images?: string[]
  opinion?: string
  [key: string]: unknown
}

export interface RefundLog {
  id: number
  refund_id?: number
  approver_type?: string
  approver_name?: string
  action?: string
  opinion?: string
  created_at?: number
}

export function getRefunds(params: PageParams & { status?: number; start_time?: number; end_time?: number }) {
  return http.get<PageResult<RefundItem>>('/v1/staff/refunds', { ...params })
}

export function getRefundDetail(id: number | string) {
  return http.get<RefundDetail>(`/v1/staff/refunds/${id}`)
}

/** staff.ReqStaffApproveRefund 仅包含 approve/opinion，不传运营端退款金额字段。 */
export function approveRefund(id: number | string, data: { approve: boolean; opinion?: string }) {
  return http.post<null>(`/v1/staff/refunds/${id}/approve`, data)
}

export function getRefundLogs(id: number | string, approverType?: 'staff' | 'finance') {
  return http.get<RefundLog[]>(`/v1/staff/refunds/${id}/logs`, { approver_type: approverType })
}
