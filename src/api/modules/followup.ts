import { http } from '@/utils/request'
import type { PageParams, PageResult } from '@/types/api'

/**
 * 随访回访（协同工作台端 §6 健康预警与随访回访）
 * 网关前缀：/api/v1/staff
 *
 * 规则（设计稿交互说明）：
 * - 系统按专病类型＋当前风险层级固定规则生成：高风险每周1次、中风险每2周1次、低风险每月1次；
 *   服务后回访由服务完成触发；健康预警回访由健管师手动创建
 * - 状态仅保留「待回访 / 已回访」；联系失败保留联系记录，完成有效问卷后才计入有效随访
 */

/** 随访状态（health_followups.status） */
export const FOLLOWUP_STATUS_MAP: Record<number, string> = {
  1: '待回访',
  2: '已分配',
  3: '已回访',
}

/** 随访类型（设计稿枚举，待与后端字典确认） */
export const FOLLOWUP_TYPE_MAP: Record<number, string> = {
  1: '专病随访',
  2: '健康预警回访',
  3: '日常随访',
  4: '服务后回访',
}

/** 随访任务（GET /followups 出参，对齐 §6.3） */
export interface FollowupItem {
  id: number
  member_id: number
  member_name: string
  institution_id: number
  staff_id?: number | null
  /** 来源类型：1-专病规则 3-评估 5-线索 9-手动 等 */
  source_type: number
  source_id?: number | null
  followup_type: number
  followup_time?: number | null
  followup_name?: string | null
  status: number
  severity?: number
  next_followup_date?: string
}

/** 随访列表查询参数（§6.3） */
export interface FollowupListParams extends PageParams {
  status?: number
  member_id?: number
  staff_id?: number
  institution_id?: number
  next_followup_date?: string
}

/** 随访列表（权限 staff:followup，仅返回本机构随访，含系统与手动） */
export function getFollowups(params: FollowupListParams) {
  return http.get<PageResult<FollowupItem>>('/v1/staff/followups', { ...params })
}

/** 手动创建随访（权限 staff:followup，对齐 §6.4，建 status=2-assigned 或 1-planned） */
export function createFollowup(
  id: number | string,
  data: {
    source_type: number
    source_id?: number | null
    followup_type: number
    next_followup_date: string
    staff_id?: number
  },
) {
  return http.post<{ id: number }>(`/v1/staff/members/${id}/followups`, data)
}

/**
 * 随访完成（权限 staff:followup，对齐 swagger：仅路径参数，无请求体）
 * 问卷结构化内容接口待后端补充；body 参数保留兼容，默认不发送
 */
export function completeFollowup(
  id: number | string,
  data?: {
    followup_time?: number
    followup_content?: string
    vital_signs?: number[]
    risk_flag?: string[]
    severity?: number
    suggestions?: string
    next_followup_date?: string
    adjust_risk_level?: number | null
    adjust_care_level?: number | null
  },
) {
  return http.post<null>(`/v1/staff/followups/${id}/complete`, data)
}

/**
 * TODO: 随访执行向导相关接口（问卷模板按病种加载 / 目标证据检查 / 结果处置结构化入参）
 * 设计稿含通用电话模块、饮食运动、按病加载问卷、结果处置四步流程，
 * API v0.1 仅有 completeFollowup 汇总入参，问卷结构化定义待后端补充。
 * 当前页面以本地 mock 演示完整交互。
 */
