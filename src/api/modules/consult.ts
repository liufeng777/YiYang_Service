import { http } from '@/utils/request'
import type { PageParams, PageResult } from '@/types/api'

/**
 * 咨询管理（对齐最新 swagger.json：staff-预约咨询）
 * 网关前缀：/api/v1/staff
 */

/** 咨询记录（GET /consultations 出参） */
export interface ConsultationItem {
  id: number
  member_id?: number | null
  /** 咨询类型（AI / 人工 / 电话等，待后端字典确认） */
  consultation_type: number
  /** 咨询问题 */
  question: string
  /** 回复内容 */
  answer?: string | null
  responder_name?: string
  /** 咨询人姓名 / 电话（服务端实际出参） */
  contact_name?: string
  contact_phone?: string
  satisfaction_score?: number
  /** 状态：1-待回复 2-已回复 */
  status: number
  created_at: number
  institution_id?: number
}

/** 咨询创建入参（swagger staff.consultationCreateReq） */
export interface ConsultationCreateReq {
  contact_name: string
  contact_phone: string
  question: string
  consultation_type?: number
  answer?: string
  institution_id?: number
  satisfaction_score?: number
}

/** 咨询列表查询参数（swagger：status / keyword / page / page_size） */
export interface ConsultationListParams extends PageParams {
  status?: number
  keyword?: string
}

/** 咨询记录列表 */
export function getConsultations(params: ConsultationListParams) {
  return http.get<PageResult<ConsultationItem>>('/v1/staff/consultations', { ...params })
}

/** 咨询创建（staff 端，登记电话咨询） */
export function createConsultation(data: ConsultationCreateReq) {
  return http.post<{ id: number }>('/v1/staff/consultations', data)
}

/** 咨询详情 */
export function getConsultationDetail(id: number | string) {
  return http.get<ConsultationItem>(`/v1/staff/consultations/${id}`)
}

/** 咨询更新（人工回复 / 补充信息；swagger：PUT /consultations/{id}） */
export function updateConsultation(
  id: number | string,
  data: Partial<ConsultationCreateReq> & { status?: number },
) {
  return http.put<null>(`/v1/staff/consultations/${id}`, data)
}

/** 咨询删除 */
export function deleteConsultation(id: number | string) {
  return http.delete<null>(`/v1/staff/consultations/${id}`)
}
