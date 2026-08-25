import { http } from '@/utils/request'

/** 经营指标总览 */
export interface OverviewData {
  todayOrderCount: number
  todayOrderAmount: number
  todayRefundCount: number
  totalInstitution: number
}

/** 获取运营首页总览数据 */
export function getOverview() {
  return http.get<OverviewData>('/dashboard/overview')
}
