import { http } from '@/utils/request'
import type { PageParams, PageResult } from '@/types/api'
import type { ApiData, Id } from './common'

export interface ChronicDiseaseDict extends ApiData {
  id: number
  icd10_code: string
  disease_name_cn: string
  disease_name_en?: string
  parent_disease_id?: number
  level?: number
  sort_order?: number
  status?: number
}

export function getChronicDiseases(params: PageParams & { keyword?: string; parent_id?: number; level?: number }) {
  return http.get<PageResult<ChronicDiseaseDict>>('/v1/staff/chronic-diseases', { ...params })
}

export function createChronicDisease(data: {
  icd10_code: string
  disease_name_cn: string
  disease_name_en?: string
  parent_disease_id?: number
  level?: number
  sort_order?: number
}) {
  return http.post<ApiData>('/v1/staff/chronic-diseases', data)
}

export function getChronicDiseaseDetail(id: Id) {
  return http.get<ChronicDiseaseDict>(`/v1/staff/chronic-diseases/${id}`)
}

export function updateChronicDisease(id: Id, data: { disease_name_cn?: string; disease_name_en?: string; sort_order?: number }) {
  return http.put<ApiData>(`/v1/staff/chronic-diseases/${id}`, data)
}

export function deleteChronicDisease(id: Id) {
  return http.delete<null>(`/v1/staff/chronic-diseases/${id}`)
}

export function setChronicDiseaseStatus(id: Id, data: { status: 1 | 9 }) {
  return http.put<ApiData>(`/v1/staff/chronic-diseases/${id}/status`, data)
}
