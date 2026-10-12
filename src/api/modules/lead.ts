import { http } from '@/utils/request'
import type { PageParams, PageResult } from '@/types/api'

/**
 * 线索管理（协同工作台端 §3 Lead）
 * 网关前缀：/api/v1/staff
 * 线索状态机见共通 §6.5：1-待分配 2-跟进中 3-有意向 5-已转化 6-已流失 9-无效
 */

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

/** 咨询人身份（设计稿字段，API v0.1 未定义，待后端补充） */
export const CONTACT_IDENTITY_MAP: Record<number, string> = {
  1: '本人',
  2: '家属',
}

/** 线索状态（对齐共通 §6.5） */
export const LEAD_STATUS_MAP: Record<number, string> = {
  1: '待分配',
  2: '跟进中',
  3: '有意向',
  5: '已转化',
  6: '已流失',
  9: '无效',
}

/** 线索列表项（GET /leads 出参） */
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
  /** 咨询人身份：1-本人 2-家属（设计稿字段，待后端补充） */
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
  /** 备注（设计稿新增/编辑表单字段，待后端确认落库列） */
  remark?: string
}

/** 线索列表查询参数 */
export interface LeadListParams extends PageParams {
  status?: number
  source_type?: number
  owner_staff_id?: number
  priority?: number
  keyword?: string
  start_date?: string
  end_date?: string
}

/** 线索列表 */
export function getLeadList(params: LeadListParams) {
  return http.get<PageResult<LeadItem>>('/v1/staff/leads', { ...params })
}

/** 线索详情 */
export function getLeadDetail(id: number | string) {
  return http.get<LeadDetail>(`/v1/staff/leads/${id}`)
}

/**
 * 新增线索（手动补录）
 * TODO: API v0.1 未定义手动补录接口（线索默认由线上咨询/线下活动产生），
 * 设计稿支持手动登记，路径与入参待与后端确认
 */
export function createLead(data: Partial<LeadItem> & { remark?: string }) {
  return http.post<{ id: number }>('/v1/staff/leads', data)
}

/** 领取/分配负责人 */
export function assignLead(id: number | string, data: { owner_staff_id: number; reason?: string }) {
  return http.post<null>(`/v1/staff/leads/${id}/assign`, data)
}

/** 转派 */
export function transferLead(id: number | string, data: { to_staff_id: number; reason: string }) {
  return http.post<{ transfer_records: LeadTransferRecord[] }>(`/v1/staff/leads/${id}/transfer`, data)
}

/** 跟进 */
export function followupLead(
  id: number | string,
  data: {
    contact_time: number
    content: string
    next_action_at?: number
    status: number
    demand_type?: number
    demand_detail?: string
  },
) {
  return http.post<null>(`/v1/staff/leads/${id}/followup`, data)
}

/** 标记流失/无效（status：6-lost / 9-ignore） */
export function markLeadLost(
  id: number | string,
  data: { status: 6 | 9; lost_reason: string; remark?: string },
) {
  return http.post<null>(`/v1/staff/leads/${id}/lost`, data)
}

/** 转化建档：创建会员健康档案并置线索为已转化（API §3.7） */
export function convertLead(
  id: number | string,
  data: {
    member: {
      name: string
      gender: number
      birthday: string
      phone: string
      id_card?: string
      emergency_contact?: string
      emergency_phone?: string
      nursing_home_id?: number | null
      station_id?: number | null
    }
    user_id?: number
    initial_status?: number
  },
) {
  return http.post<{ member_id: number }>(`/v1/staff/leads/${id}/convert`, data)
}
