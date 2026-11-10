import { http } from '@/utils/request'
import type { PageParams, PageResult } from '@/types/api'
import type { ApiData, Id } from './common'

export interface ArchiveListItem {
  access_id: number;
  access_status: number;
  age: number;
  archive_updated_at: number;
  editor_name: string;
  gender: number;
  member_id: number;
  member_name: string;
  phone: string
}

export interface ArchiveBasic extends ApiData {
  member_id: number
  archive_no?: string
  blood_type?: number
  height?: string
  marital_status?: number
  nation?: string
  occupation?: string
  remark?: string
  weight?: string
}

export interface AllergyRecord extends ApiData {
  id?: number
  member_id: number
  allergen_code?: string
  allergen_name?: string
  allergy_type?: number
  onset_date?: number
  reaction?: string
  remark?: string
  severity?: number
}

export interface DiseaseRecord extends ApiData {
  id?: number
  member_id: number
  diagnose_hospital?: string
  disease_name?: string
  disease_status?: number
  onset_date?: number
  remark?: string
  treatment_desc?: string
}

export interface FamilyRecord extends ApiData {
  id?: number
  member_id: number
  disease_name?: string
  icd10_code?: string
  is_dead?: number
  onset_age?: number
  relation?: number
  remark?: string
}

export interface OperationRecord extends ApiData {
  id?: number
  member_id: number
  op_code?: string
  op_date?: number
  op_hospital?: string
  op_name?: string
  op_type?: number
  outcome?: number
  remark?: string
}

export interface LifestyleRecord extends ApiData {
  id?: number
  member_id: number
  activity_level?: number
  diet_desc?: string
  diet_habit?: number
  drink_status?: number
  drink_type?: string
  eating_mode?: number
  exercise_duration?: number
  exercise_freq?: number
  exercise_habit?: number
  exercise_type?: string
  hearing_status?: number
  mental_status?: number
  occupational_hazard?: string
  oral_status?: number
  sleep_hour?: string
  sleep_medication?: number
  sleep_quality?: number
  smoke_daily?: number
  smoke_years?: number
  smoking_status?: number
  staple_food?: string
  vision_status?: number
}

export interface ChronicArchive extends ApiData {
  id: number
  member_id: number
  disease_code: string
  disease_name?: string
  chronic_status?: number
  diagnose_date?: number
  remark?: string
}

export interface ChronicArchiveCreate extends ApiData {
  member_id: number
  disease_code: string
  disease_name?: string
  diagnose_date?: number
  assess_date?: number
  metrics: Record<string, string>
  remark?: string
  source?: number
}

export interface ChronicAssessment extends ApiData {
  assess_date?: number
  batch_no?: string
  disease_history_id?: number
  metrics: Record<string, string>
  source?: number
}

export function getHealthArchiveList(params: PageParams & {
  key?: string // 会员姓名/档案号/联系电话
  status?: number 
}) {
  return http.get<PageResult<ArchiveListItem>>('/v1/staff/health-archives', { ...params })
}

export function getHealthArchiveOverview(memberId: Id) {
  return http.get<ApiData>('/v1/staff/health-archives/overview', { member_id: memberId })
}

export function upsertHealthArchiveBasic(data: ArchiveBasic) {
  return http.put<ApiData>('/v1/staff/health-archives/basic', data)
}

export function getAllergies(memberId: Id) {
  return http.get<PageResult<AllergyRecord>>('/v1/staff/health-archives/allergy', { member_id: memberId })
}
export function createAllergy(data: AllergyRecord) {
  return http.post<ApiData>('/v1/staff/health-archives/allergy', data)
}
export function updateAllergy(data: AllergyRecord & { id: number }) {
  return http.put<ApiData>('/v1/staff/health-archives/allergy', data)
}
export function deleteAllergy(memberId: Id, id: Id) {
  return http.delete<null>('/v1/staff/health-archives/allergy', { member_id: memberId, id })
}

export function getDiseaseHistories(memberId: Id) {
  return http.get<PageResult<DiseaseRecord>>('/v1/staff/health-archives/disease', { member_id: memberId })
}
export function createDiseaseHistory(data: DiseaseRecord) {
  return http.post<ApiData>('/v1/staff/health-archives/disease', data)
}
export function updateDiseaseHistory(data: DiseaseRecord & { id: number }) {
  return http.put<ApiData>('/v1/staff/health-archives/disease', data)
}
export function deleteDiseaseHistory(memberId: Id, id: Id) {
  return http.delete<null>('/v1/staff/health-archives/disease', { member_id: memberId, id })
}

export function getFamilyHistories(memberId: Id) {
  return http.get<PageResult<FamilyRecord>>('/v1/staff/health-archives/family', { member_id: memberId })
}
export function createFamilyHistory(data: FamilyRecord) {
  return http.post<ApiData>('/v1/staff/health-archives/family', data)
}
export function updateFamilyHistory(data: FamilyRecord & { id: number }) {
  return http.put<ApiData>('/v1/staff/health-archives/family', data)
}
export function deleteFamilyHistory(memberId: Id, id: Id) {
  return http.delete<null>('/v1/staff/health-archives/family', { member_id: memberId, id })
}

export function getLifestyle(memberId: Id) {
  return http.get<LifestyleRecord>('/v1/staff/health-archives/lifestyle', { member_id: memberId })
}
export function saveLifestyle(data: LifestyleRecord) {
  return http.post<ApiData>('/v1/staff/health-archives/lifestyle', data)
}

export function getOperations(memberId: Id) {
  return http.get<PageResult<OperationRecord>>('/v1/staff/health-archives/operation', { member_id: memberId })
}
export function createOperation(data: OperationRecord) {
  return http.post<ApiData>('/v1/staff/health-archives/operation', data)
}
export function updateOperation(data: OperationRecord & { id: number }) {
  return http.put<ApiData>('/v1/staff/health-archives/operation', data)
}
export function deleteOperation(memberId: Id, id: Id) {
  return http.delete<null>('/v1/staff/health-archives/operation', { member_id: memberId, id })
}

export function getChronicArchives(memberId: Id, params?: { chronic_status?: number; include_ended?: boolean }) {
  return http.get<PageResult<ChronicArchive>>('/v1/staff/health-archives/chronic-diseases', { member_id: memberId, ...params })
}

export function createChronicArchive(data: ChronicArchiveCreate) {
  return http.post<ApiData>('/v1/staff/health-archives/chronic-diseases', data)
}

export function getChronicMetricDict(code: string) {
  return http.get<ApiData>(`/v1/staff/health-archives/chronic-diseases/dict/${encodeURIComponent(code)}`)
}

export function getChronicAssessments(id: Id, memberId: Id, params?: PageParams) {
  return http.get<PageResult<ApiData>>(`/v1/staff/health-archives/chronic-diseases/${id}/assessments`, { member_id: memberId, ...params })
}

export function getChronicAssessmentDetail(id: Id, batchNo: string, memberId: Id) {
  return http.get<ApiData>(`/v1/staff/health-archives/chronic-diseases/${id}/assessments/${encodeURIComponent(batchNo)}`, { member_id: memberId })
}

export function updateChronicAssessment(id: Id, batchNo: string, memberId: Id, data: ChronicAssessment) {
  return http.put<ApiData>(`/v1/staff/health-archives/chronic-diseases/${id}/assessments/${encodeURIComponent(batchNo)}`, data, { params: { member_id: memberId } })
}

export function updateChronicStatus(id: Id, memberId: Id, data: { chronic_status: number; remark?: string }) {
  return http.put<ApiData>(`/v1/staff/health-archives/chronic-diseases/${id}/status`, data, { params: { member_id: memberId } })
}

export function terminateChronicArchive(id: Id, memberId: Id, data?: { end_date?: number; reason?: string }) {
  return http.post<ApiData>(`/v1/staff/health-archives/chronic-diseases/${id}/terminate`, data, { params: { member_id: memberId } })
}
