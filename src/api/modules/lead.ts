import type { AxiosResponse } from 'axios'
import { http } from '@/utils/request'
import type { PageParams, PageResult } from '@/types/api'

/**
 * 线索管理（对齐最新 swagger.json：staff-线索）
 * 网关前缀：/api/v1/staff
 * 线索状态机（swagger leads/export 参数说明）：1-待跟进 2-跟进中 3-已转化 4-转化失败 9-流失
 */

/** 线索状态（swagger） */
export const LEAD_STATUS_MAP: Record<number, string> = {
  1: '待跟进',
  2: '跟进中',
  3: '已转化',
  4: '转化失败',
  9: '流失',
}

/** 线索来源（设计稿枚举，待与后端字典确认） */
export const LEAD_SOURCE_MAP: Record<number, string> = {
  1: '电话咨询',
  2: '线下活动',
  3: '到店咨询',
}

/** 意向类型（设计稿枚举，待与后端字典确认） */
export const LEAD_DEMAND_MAP: Record<number, string> = {
  1: '机构入住',
  2: '健康管理',
  3: '康复服务',
  4: '居家服务',
}

/** 跟进方式（swagger ReqStaffFollowupLead.followup_type） */
export const LEAD_FOLLOWUP_TYPE_MAP: Record<number, string> = {
  1: '语音',
  2: '文字',
  3: '视频',
  4: '在店',
  5: '上门',
}

/** 联系人身份（设计稿枚举：编辑/实名认证页展示用，待与后端字典确认） */
export const CONTACT_IDENTITY_MAP: Record<number, string> = {
  1: '本人',
  2: '家属',
  3: '其他',
}

/** 线索列表项（GET /leads 出参，含服务端实际别名字段） */
export interface LeadItem {
  id: number
  lead_no: string
  institution_id: number
  /** 来源类型，见 LEAD_SOURCE_MAP */
  source_type: number
  source_id?: number | null
  member_id?: number | null
  user_id?: number | null
  contact_name: string
  /** 脱敏手机号 */
  contact_phone: string
  /** 联系人身份，见 CONTACT_IDENTITY_MAP（设计稿字段） */
  contact_identity?: number
  /** 意向类型，见 LEAD_DEMAND_MAP */
  demand_type: number
  /** 需求摘要 */
  demand_detail: string
  /** 线索状态，见 LEAD_STATUS_MAP */
  status: number
  priority?: number
  owner_staff_id?: number | null
  owner_staff_name?: string
  /** UTC 秒 */
  assign_at?: number
  followup_count?: number
  last_followup_at?: number
  /** UTC 秒 */
  created_at: number
  /** 以下为服务端实际出参别名字段（与文档字段并存，前端兜底展示） */
  name?: string
  phone?: string
  task_type?: number
  assignee_name?: string
  remark?: string
}

/** 跟进记录（lead.followup_records JSON 数组元素） */
export interface LeadFollowupRecord {
  time: number
  staff_id: number
  staff_name: string
  content: string
}

/** 转派记录（lead.transfer_records JSON 数组元素） */
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

/** 线索详情（GET /leads/:id 出参 = 全字段 + 跟进/转派留痕） */
export interface LeadDetail extends LeadItem {
  followup_records: LeadFollowupRecord[]
  transfer_records: LeadTransferRecord[]
}

/** 线索列表查询参数（swagger） */
export interface LeadListParams extends PageParams {
  status?: number
  source_type?: number
  keyword?: string
}

/** 线索列表（本机构） */
export function getLeadList(params: LeadListParams) {
  return http.get<PageResult<LeadItem>>('/v1/staff/leads', { ...params })
}

/** 线索详情 */
export function getLeadDetail(id: number | string) {
  return http.get<LeadDetail>(`/v1/staff/leads/${id}`)
}

/** 新增线索（swagger ReqStaffCreateLead：name/phone 必填，remark/source_id/source_type 选填） */
export function createLead(data: {
  name: string
  phone: string
  remark?: string
  source_id?: number
  source_type?: number
}) {
  return http.post<{ id: number }>('/v1/staff/leads', data)
}

/** 线索认领（PUT，仅待跟进/转化失败状态可认领；remark 走 query） */
export function assignLead(id: number | string, data: { assignee: number }, remark?: string) {
  return http.put<null>(`/v1/staff/leads/${id}/assign`, data, { params: { remark } })
}

/** 线索转派（swagger ReqStaffTransferLead；remark 走 query） */
export function transferLead(
  id: number | string,
  data: { new_assignee: number; reason?: string },
  remark?: string,
) {
  return http.post<null>(`/v1/staff/leads/${id}/transfer`, data, { params: { remark } })
}

/** 线索批量转派（swagger ReqStaffBatchTransferLeads；remark 走 query） */
export function batchTransferLeads(
  data: { lead_ids: number[]; new_assignee: number; reason?: string },
  remark?: string,
) {
  return http.post<null>('/v1/staff/leads/batch-transfer', data, { params: { remark } })
}

/** 线索跟进记录（swagger ReqStaffFollowupLead：content 必填，followup_type 选填） */
export function followupLead(id: number | string, data: { content: string; followup_type?: number }) {
  return http.post<null>(`/v1/staff/leads/${id}/followup`, data)
}

/** 线索流失/无效（swagger ReqStaffMarkLeadLost：status 9-流失，无效可复用 4-转化失败） */
export function markLeadLost(
  id: number | string,
  data: { status: 9 | 4; reason?: string },
  remark?: string,
) {
  return http.post<null>(`/v1/staff/leads/${id}/lost`, data, { params: { remark } })
}

/** 线索转化刷新复核（无请求体；按任务类型复核转化条件，达成则置已转化） */
export function convertLead(id: number | string) {
  return http.post<{ converted?: boolean }>(`/v1/staff/leads/${id}/convert`)
}

/** 导出线索 CSV（UTF-8 BOM 文件流，按当前筛选条件全量导出） */
export function exportLeads(params: { keyword?: string; source_type?: number; status?: number }) {
  return http.get<AxiosResponse<Blob>>('/v1/staff/leads/export', { ...params }, { responseType: 'blob' })
}

/** 线索 CSV 导入（multipart；列：name/phone 必填，source_type 选填） */
export function importLeads(file: File) {
  const form = new FormData()
  form.append('file', file)
  return http.post<{ imported?: number; skipped?: number }>('/v1/staff/leads/import', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}
