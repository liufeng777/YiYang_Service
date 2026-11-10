import type { AxiosResponse } from 'axios'
import { http } from '@/utils/request'
import type { PageParams, PageResult } from '@/types/api'

export const LEAD_STATUS_MAP: Record<number, string> = { 1: '待跟进', 2: '跟进中', 3: '已转化', 4: '转化失败', 9: '流失' }
export const LEAD_SOURCE_MAP: Record<number, string> = { 1: '电话咨询', 2: '线下活动', 3: '到店咨询' }
export const LEAD_DEMAND_MAP: Record<number, string> = { 1: '机构入住', 2: '健康管理', 3: '康复服务', 4: '居家服务' }
export const LEAD_FOLLOWUP_TYPE_MAP: Record<number, string> = { 1: '语音', 2: '文字', 3: '视频', 4: '在店', 5: '上门' }
export const CONTACT_IDENTITY_MAP: Record<number, string> = { 1: '本人', 2: '家属', 3: '其他' }

export interface LeadItem {
  id: number
  lead_no: string
  institution_id: number
  source_type: number
  source_id?: number | null
  member_id?: number | null
  user_id?: number | null
  contact_name: string
  contact_phone: string
  contact_identity?: number
  demand_type: number
  demand_detail: string
  status: number
  priority?: number
  owner_staff_id?: number | null
  owner_staff_name?: string
  assign_at?: number
  followup_count?: number
  last_followup_at?: number
  created_at: number
  name?: string
  phone?: string
  task_type?: number
  assignee_name?: string
  remark?: string
}

export interface LeadFollowupRecord { time: number; staff_id: number; staff_name: string; content: string }
export interface LeadTransferRecord {
  from_staff_id: number
  from_staff_name: string
  to_staff_id: number
  to_staff_name: string
  operator_id: number
  operator_name: string
  reason: string
  time: number
}

export interface LeadDetail extends LeadItem {
  followup_records: LeadFollowupRecord[]
  transfer_records: LeadTransferRecord[]
}

export interface LeadListParams extends PageParams { status?: number; source_type?: number; keyword?: string }

export function getLeadList(params: LeadListParams) {
  return http.get<PageResult<LeadItem>>('/v1/staff/leads', { ...params })
}

export function getLeadDetail(id: number | string) {
  return http.get<LeadDetail>(`/v1/staff/leads/${id}`)
}

/** staff.ReqStaffCreateLead；本机构接口不传 institution_id。 */
export function createLead(data: { name: string; phone: string; remark?: string; source_id?: number; source_type?: number }) {
  return http.post<{ id: number }>('/v1/staff/leads', data)
}

export function assignLead(id: number | string, data: { assignee: number }, remark?: string) {
  return http.put<null>(`/v1/staff/leads/${id}/assign`, data, { params: { remark } })
}

export function transferLead(id: number | string, data: { new_assignee: number; reason?: string }, remark?: string) {
  return http.post<null>(`/v1/staff/leads/${id}/transfer`, data, { params: { remark } })
}

export function batchTransferLeads(data: { lead_ids: number[]; new_assignee: number; reason?: string }, remark?: string) {
  return http.post<null>('/v1/staff/leads/batch-transfer', data, { params: { remark } })
}

export function followupLead(id: number | string, data: { content: string; followup_type?: number }) {
  return http.post<null>(`/v1/staff/leads/${id}/followup`, data)
}

export function markLeadLost(id: number | string, data: { status: 9 | 4; reason?: string }, remark?: string) {
  return http.post<null>(`/v1/staff/leads/${id}/lost`, data, { params: { remark } })
}

export function convertLead(id: number | string) {
  return http.post<{ converted?: boolean }>(`/v1/staff/leads/${id}/convert`)
}

export function exportLeads(params: { keyword?: string; source_type?: number; status?: number }) {
  return http.get<AxiosResponse<Blob>>('/v1/staff/leads/export', { ...params }, { responseType: 'blob' })
}

export function importLeads(file: File) {
  const form = new FormData()
  form.append('file', file)
  return http.post<{ imported?: number; skipped?: number }>('/v1/staff/leads/import', form, { headers: { 'Content-Type': 'multipart/form-data' } })
}
