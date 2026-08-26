import { http } from '@/utils/request'
import type { PageParams, PageResult } from '@/types/api'

/**
 * 咨询管理（协同工作台端 §10.4 咨询记录与人工回复）
 * 网关前缀：/api/v1/staff
 *
 * 规则（设计稿交互说明）：
 * - 本期咨询入口统一为机构电话：护理院/驿站介绍页展示机构电话；
 *   AI 健康管家无法回答时展示对应机构电话；用户拨打后由接听机构登记咨询
 * - 保存后系统自动关联档案或生成线索：实名且有档案→关联档案；
 *   未发现相同手机号未完成线索→创建“待跟进”线索；线索自动带入来电人/来源/需求摘要等
 */

/** 咨询记录（GET /consultations 出参，对齐 §10.4，AI/人工） */
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
  /** 状态：1-待回复 2-已回复 */
  status: number
  created_at: number
  institution_id?: number
}

/** 咨询记录列表查询参数（§10.4） */
export interface ConsultationListParams extends PageParams {
  status?: number
  institution_id?: number
}

/** 咨询记录列表（权限 consult:view） */
export function getConsultations(params: ConsultationListParams) {
  return http.get<PageResult<ConsultationItem>>('/v1/staff/consultations', { ...params })
}

/** 人工回复（权限 consult:reply，对齐 §10.4，服务端注入回复人，status=2-replied） */
export function replyConsultation(id: number | string, data: { answer: string }) {
  return http.post<null>(`/v1/staff/consultations/${id}/reply`, data)
}

/**
 * TODO: 电话咨询登记接口（来电信息/实际服务对象/咨询内容与处理结果/下次跟进、
 * 保存后自动校验身份并创建或合并线索）API v0.1 未定义，待后端补充。
 * 当前 src/pages/consultation 页面以本地 mock 演示完整交互。
 */
