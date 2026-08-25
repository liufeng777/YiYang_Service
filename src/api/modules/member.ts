import { http } from '@/utils/request'
import type { PageParams, PageResult } from '@/types/api'

/**
 * 健康档案 / 会员（协同工作台端 §4 Member & Health）
 * 网关前缀：/api/v1/staff
 */

/** 风险等级（对齐 §4 risk_level） */
export const RISK_LEVEL_MAP: Record<number, string> = {
  1: '低风险',
  2: '中风险',
  3: '高风险',
}

/** 会员状态（设计稿枚举，待与后端字典确认） */
export const MEMBER_STATUS_MAP: Record<number, string> = {
  1: '待完善',
  2: '待分配',
  3: '管理中',
  4: '已结案',
}

/** 会员列表项（GET /members 出参） */
export interface MemberItem {
  id: number
  name: string
  /** 1-男 2-女 */
  gender: number
  /** YYYY-MM-DD */
  birthday: string
  /** 脱敏手机号 */
  phone: string
  nursing_home_id?: number | null
  station_id?: number | null
  /** 见 MEMBER_STATUS_MAP */
  status: number
  risk_level?: {
    level_type: string
    level_value: number
    level_name: string
  } | null
  care_level?: string
  chronic_disease_count: number
  assessment_count: number
  /** UTC 秒 */
  last_assessment_time?: number
}

/** 慢病（健康档案聚合出参） */
export interface ChronicDisease {
  disease_id: number
  disease_name: string
  diagnosed_date?: string
  diagnosis_source?: string
  is_active: boolean
}

/** 最新健康指标（健康档案聚合出参） */
export interface LatestMetric {
  metric_id: number
  metric_code: string
  metric_name_cn: string
  metric_value: string
  metric_unit: string
  /** UTC 秒 */
  measurement_time: number
  is_abnormal: boolean
}

/** 健康档案聚合详情（GET /members/:id/health-profile 出参） */
export interface HealthProfile {
  member: MemberItem & {
    id_card?: string
    emergency_contact?: string
    emergency_phone?: string
  }
  contact?: {
    name: string
    phone: string
    relation: string
  }
  addresses?: Array<{ type: string; detail: string }>
  levels?: Array<{ level_type: string; level_value: number; level_name: string }>
  risk_tags?: Array<{ tag: string; source: string }>
  chronic_diseases: ChronicDisease[]
  latest_metrics: LatestMetric[]
  recent_plans?: Array<{ id: number; name: string; status: number }>
  recent_goals?: Array<{ id: number; name: string; status: number }>
}

/** 会员列表查询参数 */
export interface MemberListParams extends PageParams {
  keyword?: string
  status?: number
  risk_level?: number
  nursing_home_id?: number
  station_id?: number
}

/** 会员（健康档案）分页列表（权限 health:view） */
export function getMemberList(params: MemberListParams) {
  return http.get<PageResult<MemberItem>>('/v1/staff/members', { ...params })
}

/** 健康档案聚合详情（权限 health:view） */
export function getHealthProfile(id: number | string) {
  return http.get<HealthProfile>(`/v1/staff/members/${id}/health-profile`)
}

/** 新建健康档案 / 建档（权限 health:profile） */
export function createMember(data: {
  name: string
  gender: number
  birthday: string
  phone: string
  id_card?: string
  emergency_contact?: string
  emergency_phone?: string
  nursing_home_id?: number | null
  station_id?: number | null
}) {
  return http.post<{ id: number }>('/v1/staff/members', data)
}

/** 健康指标录入（权限 health:record） */
export function recordHealthMetrics(
  id: number | string,
  data: {
    metrics: Array<{
      metric_code: string
      metric_value: string
      measurement_time: number
      source?: string
    }>
  },
) {
  return http.post<null>(`/v1/staff/members/${id}/health-records`, data)
}

/** 评估列表 / 发起评估（权限 health:assess） */
export function getAssessments(id: number | string, params?: PageParams) {
  return http.get<PageResult<{ id: number; type: string; created_at: number }>>(
    `/v1/staff/members/${id}/assessments`,
    { ...params },
  )
}

export function createAssessment(id: number | string, data: { type: string; answers: unknown }) {
  return http.post<{ id: number }>(`/v1/staff/members/${id}/assessments`, data)
}

/**
 * TODO: 批量导入相关接口（模板下载 / 上传校验 / 确认导入 / 导入结果）
 * API v0.1 未定义，设计稿含完整流程，路径与入参待后端补充。
 * 当前页面以本地 mock 演示完整交互。
 */

/**
 * TODO: 专病档案相关接口（按病种详情 / 编辑提交 / 版本记录）
 * 设计稿含高血压 / 糖尿病 / 冠心病 / 慢阻肺四类专病档案与编辑抽屉，
 * API v0.1 仅在健康档案聚合出参中含 chronic_diseases 列表，详情与编辑接口待后端补充。
 * 用药记录接口（当前/历史/待确认 + 依从性）同样待后端补充。
 */
