import { http } from '@/utils/request'

/**
 * 工作台首页概览（协同工作台端 §2 Dashboard）
 * 网关前缀：/api/v1/staff
 */

/** 今日工作概览（GET /dashboard/overview 出参） */
export interface DashboardOverview {
  institution_id: number
  today: {
    /** 待派单工单数 */
    pending_dispatch: number
    /** 派单确认中 */
    dispatch_confirming: number
    /** 服务中工单 */
    wo_running: number
    /** 今日已完成工单 */
    wo_completed: number
    /** 今日排班人员数 */
    scheduled_staff: number
  }
  lead: {
    /** 新增线索 */
    new: number
    /** 今日待跟进线索 */
    followup_due_today: number
  }
  appointment: {
    /** 今日已确认预约 */
    confirmed_today: number
    /** 今日到访 */
    arriving_today: number
  }
  health: {
    /** 待评估 */
    pending_assessment: number
    /** 预警中 */
    warn_active: number
    /** 高等级预警 */
    warn_high: number
    /** 今日到期随访 */
    followup_due_today: number
    /** 待确认方案 */
    plan_pending_confirm: number
  }
  visit: {
    /** 今日到院登记 */
    today_visit: number
  }
}

/** 首页预警快捷清单项（health_warnings 精简字段） */
export interface DashboardWarningItem {
  id: number
  member_id: number
  member_name: string
  /** 严重等级 */
  severity: number
  title: string
  warning_status: number
}

import type { PageResult } from '@/types/api'

/** 今日工作概览 */
export function getOverview() {
  return http.get<DashboardOverview>('/v1/staff/dashboard/overview')
}

/** 异常健康预警待处置（首页预警快捷清单） */
export function getWarnings(params?: { start?: string; end?: string; severity?: number }) {
  return http.get<PageResult<DashboardWarningItem>>('/v1/staff/dashboard/warnings', { ...params })
}
