import { http } from '@/utils/request'
import type { PageParams, PageResult } from '@/types/api'
import type { ApiData, Id } from './common'

// 健康档案列表
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

export interface ArchiveMemberInfo {
  age: number
  birthday: string
  gender: number
  phone: string
}

export interface ArchiveEnumOption {
  value: number
  label: string
}

export type ArchiveEnumOptions = Record<string, ArchiveEnumOption[]>

export interface HealthArchiveOverview extends ApiData {
  member?: ArchiveMemberInfo
  basic?: ArchiveBasic
  archive?: ArchiveBasic
  main?: ArchiveBasic
  lifestyle?: LifestyleRecord
  life_style?: LifestyleRecord
}

// 主档案
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

// 过敏史
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

// 既往疾病史
export interface DiseaseRecord extends ApiData {
  id?: number
  member_id: number
  diagnose_hospital?: string
  disease_name?: string
  disease_status?: number  // 疾病状态：1正在患病 2已治愈 3遗留后遗症
  onset_date?: number
  remark?: string
  treatment_desc?: string
}

// 家族史
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

// 手术史
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

// 生活习惯
export interface LifestyleRecord extends ApiData {
  id?: number
  member_id: number
  activity_level?: number // 活动强度:1卧床 2轻体力劳动 3中度体力劳动 4重体力劳动
  diet_desc?: string
  diet_habit?: number // 饮食口味:1清淡 2偏咸 3重油重糖
  drink_status?: number
  drink_type?: string // 饮酒情况:1不饮酒 2偶尔 3经常 4酗酒
  eating_mode?: number // 主进食方式:1自主进食 2部分协助 3完全协助 4管饲 5静脉营养
  exercise_duration?: number // 单次运动时长:1\u003c15分 2 15~30分 3 30~60分 4\u003e60分
  exercise_freq?: number // 运动频率:1几乎不 2每周1-2次 3每周≥3次
  exercise_habit?: number // 运动习惯:1规律运动 2偶尔运动 3不运动
  exercise_type?: string
  hearing_status?: number // 听力情况:1正常 2下降 3失聪
  mental_status?: number // 情绪状态自评:1稳定 2焦虑 3低落 4易怒
  occupational_hazard?: string
  oral_status?: number // 口腔情况:1正常 2缺牙 3义齿
  sleep_hour?: string
  sleep_medication?: number // 是否使用助眠药:1否 2是
  sleep_quality?: number // 睡眠质量:1好 2一般 3差
  smoke_daily?: number
  smoke_years?: number
  smoking_status?: number // 吸烟情况:1从不 2已戒烟 3当前吸烟
  staple_food?: string
  vision_status?: number // 视力情况:1正常 2下降 3失明
}

// 慢性专病
export interface ChronicArchive extends ApiData {
  archive_id: number
  assessment_count: number
  last_assess_date: number
  last_risk_level_label: string
  chronic_end_date: number
  chronic_status: number // 慢病状态：1管理中 2稳定 3未达标 4高风险 9终止
  created_at: number
  disease_code: string
  disease_status: number  // 疾病状态：1正在患病 2已治愈 3遗留后遗症
  disease_history_id: string
  member_id: number
  disease_name?: string
  remark: string
  treatment_desc: string
}

// 新建慢性病
export interface ChronicArchiveCreate extends ApiData {
  member_id: number
  disease_code: string
  disease_name?: string
  diagnose_date?: number
  assess_date?: number
  remark?: string
  source?: number // 档案数据来源：1-健管师/医生录入；2-会员 App 自填；3-线下导入
}

// 慢性病评估
export interface ChronicAssessment extends ApiData {
  assess_date?: number
  assessor_name: string
  batch_no?: string
  disease_history_id?: number
  source?: number // 档案数据来源：1-健管师/医生录入；2-会员 App 自填；3-线下导入
  metric_count: number
  summary_label: string
}

// 健康指标
export interface ArchiveMetric extends ApiData {
  created_at: number
  data_source: string
  id: number
  is_abnormal: number // 1-异常 2-正常
  measurement_time: number
  member_id: number
  metric_code: string
  metric_name: string
  metric_unit: string
  metric_value: string
  ref_lower: string
  ref_upper: string
  source_id: number
  source_name: string
}

export function getHealthArchiveList(params: PageParams & {
  key?: string // 会员姓名/档案号/联系电话
  status?: number 
}) {
  return http.get<PageResult<ArchiveListItem>>('/v1/staff/health-archives', { ...params })
}

export function getHealthArchiveOverview(memberId: Id) {
  return http.get<HealthArchiveOverview>('/v1/staff/health-archives/overview', { member_id: memberId })
}

export function getHealthArchiveEnumOptions() {
  return http.get<ArchiveEnumOptions>('/v1/staff/health-archives/enum-options')
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

export interface ChronicMetricDictItem {
  data_type?: number
  is_derived?: number | boolean
  is_from_metric_dict?: number | boolean
  is_multi?: number | boolean
  is_required?: number | boolean
  metric_code: string
  metric_group?: string
  metric_name: string
  metric_unit?: string
  ref_range_text?: string
  sort_order?: number
}

export interface ChronicMetricDictResult {
  definitions: ChronicMetricDictItem[]
}

export function getChronicMetricDict(code: string) {
  return http.get<ChronicMetricDictResult>(`/v1/staff/health-archives/chronic-diseases/dict/${encodeURIComponent(code)}`)
}

export function getChronicAssessments(id: Id, memberId: Id, params?: PageParams) {
  return http.get<PageResult<ChronicAssessment>>(`/v1/staff/health-archives/chronic-diseases/${id}/assessments`, { member_id: memberId, ...params })
}

export interface ChronicAssessmentMetric {
  is_abnormal: number
  metric_code: string
  metric_group: string
  metric_name: string
  metric_unit: string
  metric_value: number
  sort_order: number
}

export interface ChronicAssessmentDetail extends ApiData {
  assessment?: ChronicAssessment & { metrics?: ChronicAssessmentMetric[] }
}

export function getChronicAssessmentDetail(id: Id, batchNo: string, memberId: Id) {
  return http.get<ChronicAssessmentDetail>(`/v1/staff/health-archives/chronic-diseases/${id}/assessments/${encodeURIComponent(batchNo)}`, { member_id: memberId })
}

export interface ChronicAssessmentPayload {
  assess_date?: number
  source?: number
  metrics: Record<string, string>
  batch_no?: string
  disease_history_id?: number
}

export function updateChronicAssessment(id: Id, batchNo: string, memberId: Id, data: ChronicAssessmentPayload) {
  return http.put<ApiData>(`/v1/staff/health-archives/chronic-diseases/${id}/assessments/${encodeURIComponent(batchNo)}`, data, { params: { member_id: memberId } })
}

export function updateChronicStatus(id: Id, memberId: Id, data: { chronic_status: number; remark?: string }) {
  return http.put<ApiData>(`/v1/staff/health-archives/chronic-diseases/${id}/status`, data, { params: { member_id: memberId } })
}

export function terminateChronicArchive(id: Id, memberId: Id, data?: { end_date?: number; reason?: string }) {
  return http.post<ApiData>(`/v1/staff/health-archives/chronic-diseases/${id}/terminate`, data, { params: { member_id: memberId } })
}
