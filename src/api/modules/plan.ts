import { http } from '@/utils/request'
import type { PageParams, PageResult } from '@/types/api'

/**
 * 健康管理方案（协同工作台端 §5 AI 健康方案生成与健康目标）
 * 网关前缀：/api/v1/staff
 *
 * 流程：健管师发起 AI 生成（health:plan-ai）→ AI 草稿（status=1-created）→
 * 健管师逐项核对完善 → 提交责任医生审核确认（confirm，status=3-confirmed）→ 执行中。
 * AI 内容仅为草稿，所有内容均需人工确认，生效前须经医生审核。
 */

/** 方案状态（health_plans.status，对齐 §0.6 / §6.8） */
export const PLAN_STATUS_MAP: Record<number, string> = {
  1: 'AI草稿',
  2: '待医生审核',
  3: '执行中',
  9: '已废弃',
}

/** 健康方案（health_plans） */
export interface HealthPlan {
  id: number
  member_id: number
  plan_name: string
  plan_type: number
  duration_days?: number
  start_date: string
  end_date: string
  /** AI 生成内容（Markdown 文本） */
  plan_content?: string
  /** 见 PLAN_STATUS_MAP */
  status: number
  created_by?: number
  created_by_name?: string
}

/** 会员方案分页列表（权限 health:plan） */
export function getMemberPlans(id: number | string, params?: PageParams) {
  return http.get<PageResult<HealthPlan>>(`/v1/staff/members/${id}/plans`, { ...params })
}

/** AI 生成方案（权限 health:plan-ai，对齐 §5.1，生成后为 1-created 草稿） */
export function aiGeneratePlan(id: number | string, data: { plan_name: string; plan_type: number }) {
  return http.post<HealthPlan>(`/v1/staff/members/${id}/plans/ai-generate`, data)
}

/** 方案详情（权限 health:plan） */
export function getPlanDetail(id: number | string) {
  return http.get<HealthPlan>(`/v1/staff/plans/${id}`)
}

/** 方案确认（权限 health:plan，对齐 §5.2，可先人工修订 plan_content 再确认） */
export function confirmPlan(
  id: number | string,
  data: { confirmed_by: number; confirmed_by_name: string; edits?: Record<string, unknown> },
) {
  return http.post<null>(`/v1/staff/plans/${id}/confirm`, data)
}

/** 方案废弃（权限 health:plan，status=9-abandon） */
export function abandonPlan(id: number | string) {
  return http.post<null>(`/v1/staff/plans/${id}/abandon`)
}

/**
 * TODO: 跨会员方案列表（健管师方案工作台）、方案模块结构化内容
 * （监测计划/饮食指导/运动指导/复诊复查分项）、重新生成接口
 * API v0.1 未定义，设计稿含完整流程，路径与入参待后端补充。
 * 当前页面以本地 mock 演示完整交互。
 */
