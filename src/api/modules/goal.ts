import { http } from '@/utils/request'

/**
 * 管理目标（协同工作台端 §5 Goal & Plan）
 * 网关前缀：/api/v1/staff
 *
 * 权限说明（§5.3）：
 * - health:goal：查看会员目标、发起目标制定（健管师）
 * - health:plan：制定/确认生效管理目标（医生）
 * 设计稿责任边界：健管师不能直接修改临床目标值，临床目标值由医生确认。
 */

/** 目标状态（设计稿枚举，待与后端字典确认） */
export const GOAL_STATUS_MAP: Record<number, string> = {
  1: '待制定',
  2: '待生效',
  3: '生效中',
  4: '已完成',
  5: '已终止',
}

/** 目标类型（API v0.1 §5.4 入参枚举） */
export const GOAL_TYPE_MAP: Record<string, string> = {
  metric: '关键指标',
  safety: '重大安全事件',
  medication: '用药依从',
  diet: '饮食',
  exercise: '运动',
}

/** 目标评价结果（health_goal_items.is_met，§5.4） */
export const GOAL_ITEM_MET_MAP: Record<number, string> = {
  1: '已达标',
  2: '未达标',
  9: '未评估',
}

/** 目标条目（health_goal_items，无 actual_value 列，实际值由指标记录推导） */
export interface HealthGoalItem {
  id: number
  metric_id: number
  metric_name?: string
  /** 目标值（单值或上限） */
  target_value?: string
  target_lower?: string
  target_upper?: string
  /** 评价周期说明（如 3 个月 / 每次随访） */
  eval_period?: string
  /** 1-已达标 2-未达标 9-未评估 */
  is_met: number
}

/** 会员管理目标（GET /members/:id/goals 出参，health_goal） */
export interface HealthGoal {
  id: number
  goal_name: string
  /** 见 GOAL_TYPE_MAP */
  goal_type: string
  start_date: string
  end_date: string
  /** 1-核心 2-底线 3-常规 */
  priority: number
  remark?: string
  /** 见 GOAL_STATUS_MAP */
  status: number
  items: HealthGoalItem[]
}

/** 会员目标列表（权限 health:goal） */
export function getMemberGoals(id: number | string) {
  return http.get<HealthGoal[]>(`/v1/staff/members/${id}/goals`)
}

/** 创建管理目标（权限 health:plan，入参对齐 §5.4 POST /members/:id/goals） */
export function createGoal(
  id: number | string,
  data: {
    goal_name: string
    goal_type: string
    start_date: string
    end_date: string
    priority: number
    remark?: string
    items: Array<{
      metric_id: number
      target_value?: string
      target_lower?: string
      target_upper?: string
    }>
  },
) {
  return http.post<{ goal_id: number; item_ids: number[] }>(`/v1/staff/members/${id}/goals`, data)
}

/** 批量更新目标条目评价（权限 health:plan，对齐 §5.4 POST /goals/:id/items） */
export function updateGoalItems(
  goalId: number | string,
  data: {
    items: Array<{
      id: number
      actual_value?: string
      /** 1-已达标 2-未达标 9-未评估 */
      is_met: number
    }>
  },
) {
  return http.post<null>(`/v1/staff/goals/${goalId}/items`, data)
}

/**
 * TODO: 跨会员目标列表 / 目标统计 / 目标库 / 发起目标制定 / 确认生效接口
 * API v0.1 未定义，设计稿（健管师目标列表、发起目标制定、制定管理目标向导）
 * 包含完整流程，路径与入参待后端补充。当前页面以本地 mock 演示完整交互。
 */
