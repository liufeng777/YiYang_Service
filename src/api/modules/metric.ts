import { http } from '@/utils/request'
import type { PageParams, PageResult } from '@/types/api'
import type { ApiData, Id } from './common'

export interface MetricCategory extends ApiData {
  id: number
  category_code?: string
  category_name: string
  category_level?: number
  parent_id?: number
  sort_order?: number
  status?: number
  children?: MetricCategory[]
}

export interface MetricItem extends ApiData {
  id: number
  category_id: number
  metric_code: string
  metric_name_cn: string
  metric_name_en?: string
  abbreviation?: string
  data_type?: number
  is_multi?: number
  metric_group?: string
  metric_scope?: number
  metric_unit?: string
  unit_symbol?: string
  option_json?: string
  remark?: string
  sort_order?: number
  status?: number
}

export interface RefRange extends ApiData {
  id?: number
  age_max?: number
  age_min?: number
  gender?: number
  is_default?: number
  ref_lower?: string
  ref_upper?: string
  sort_order?: number
}

export function getMetricCategories(params?: { level?: number; parent_id?: number }) {
  return http.get<MetricCategory[]>('/v1/staff/metric-categories', { ...params })
}

export function createMetricCategory(data: { category_name: string; category_code?: string; category_level?: number; parent_id?: number; sort_order?: number }) {
  return http.post<ApiData>('/v1/staff/metric-categories', data)
}

export function updateMetricCategory(id: Id, data: { category_code?: string; category_name?: string; sort_order?: number }) {
  return http.put<ApiData>(`/v1/staff/metric-categories/${id}`, data)
}

export function setMetricCategoryStatus(id: Id, data: { status: 1 | 9 }) {
  return http.put<ApiData>(`/v1/staff/metric-categories/${id}/status`, data)
}

export function getMetrics(params: PageParams & {
  category_id?: number
  status?: number
  keyword?: string
  metric_scope?: 0 | 1 | 2 | 3
}) {
  return http.get<PageResult<MetricItem>>('/v1/staff/metrics', { ...params })
}

export function createMetric(data: Omit<MetricItem, 'id' | 'status'>) {
  return http.post<ApiData>('/v1/staff/metrics', data)
}

export function getMetricDetail(code: string) {
  return http.get<MetricItem>(`/v1/staff/metrics/${encodeURIComponent(code)}`)
}

export function updateMetric(code: string, data: {
  category_id: number
  data_type?: number
  metric_group?: string
  metric_name_cn?: string
  metric_name_en?: string
  option_json?: string
  remark?: string
  unit_symbol?: string
}) {
  return http.put<ApiData>(`/v1/staff/metrics/${encodeURIComponent(code)}`, data)
}

export function deleteMetric(code: string) {
  return http.delete<null>(`/v1/staff/metrics/${encodeURIComponent(code)}`)
}

export function setMetricStatus(code: string, data: { status: 1 | 9 }) {
  return http.put<ApiData>(`/v1/staff/metrics/${encodeURIComponent(code)}/status`, data)
}

export function getMetricDiseases(code: string, diseaseCode?: string) {
  return http.get<ApiData[]>(`/v1/staff/metrics/${encodeURIComponent(code)}/diseases`, { disease_code: diseaseCode })
}

export function createMetricDisease(code: string, data: { disease_code: string; is_required?: number; sort_order?: number }) {
  return http.post<ApiData>(`/v1/staff/metrics/${encodeURIComponent(code)}/diseases`, data)
}

export function deleteMetricDisease(linkId: Id) {
  return http.delete<null>(`/v1/staff/disease-links/${linkId}`)
}

export function getRefRanges(code: string) {
  return http.get<RefRange[]>(`/v1/staff/metrics/${encodeURIComponent(code)}/ref-ranges`)
}

export function saveRefRange(code: string, data: RefRange) {
  return http.post<ApiData>(`/v1/staff/metrics/${encodeURIComponent(code)}/ref-ranges`, data)
}

export function deleteRefRange(refId: Id) {
  return http.delete<null>(`/v1/staff/ref-ranges/${refId}`)
}

export function setRefRangeDefault(refId: Id, data: { is_default: 0 | 1 }) {
  return http.put<ApiData>(`/v1/staff/ref-ranges/${refId}/status`, data)
}
