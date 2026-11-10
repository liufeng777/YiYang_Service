import { http } from '@/utils/request'
import type { PageResult } from '@/types/api'

export interface DashboardOverview {
  institution_id: number
  today: {
    pending_dispatch: number
    dispatch_confirming: number
    wo_running: number
    wo_completed: number
    scheduled_staff: number
  }
  lead: { new: number; followup_due_today: number }
  appointment: { confirmed_today: number; arriving_today: number }
  health: {
    pending_assessment: number
    warn_active: number
    warn_high: number
    followup_due_today: number
    plan_pending_confirm: number
  }
  visit: { today_visit: number }
}

export interface DashboardWarningItem {
  id: number
  member_id: number
  member_name: string
  severity: number
  title: string
  warning_status: number
}

export function getOverview(params?: { staff_id?: number }) {
  return http.get<DashboardOverview>('/v1/staff/dashboard/overview', { ...params })
}

export function getWarnings(params?: { page?: number; page_size?: number; severity?: number }) {
  return http.get<PageResult<DashboardWarningItem>>('/v1/staff/dashboard/warnings', {
    page: 1,
    page_size: 5,
    ...params,
  })
}
