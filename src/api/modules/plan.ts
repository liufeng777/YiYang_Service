import { http } from '@/utils/request'
import type { ApiData, Id } from './common'

export function getHealthPlanDetail(id: Id) {
  return http.get<ApiData>(`/v1/staff/plans/${id}`)
}

export function confirmHealthPlan(id: Id) {
  return http.post<ApiData>(`/v1/staff/plans/${id}/confirm`)
}

export function abandonHealthPlan(id: Id) {
  return http.post<ApiData>(`/v1/staff/plans/${id}/abandon`)
}

export function updateHealthGoalItems(id: Id, data: ApiData) {
  return http.post<ApiData>(`/v1/staff/goals/${id}/items`, data)
}
