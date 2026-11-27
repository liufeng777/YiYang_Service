import { http } from '@/utils/request'
import type { PageParams, PageResult } from '@/types/api'

/** 服务简要信息；ListAllServiceSimp 按分类树返回时通过 children 挂载子级。 */
export interface ServiceSimpleItem {
  id: number
  name: string
  service_type: number | string
  children?: ServiceSimpleItem[]
}

export interface StaffItem {
  id: number
  institution_id: number
  position_code?: string
  position_name?: string
  staff_type: number
  name: string
  phone: string
  avatar_url: string
  title: string
  referral_code?: string
  status: number
  upcoming_credential_expire: boolean
}

export interface StaffDetail extends StaffItem {
  id_card?: string
  credentials?: CredentialItem[]
  schedule_count?: number
  /** 已授权服务，替代原 service_ids 数字数组。 */
  services?: ServiceSimpleItem[]
}

/** 按手机号查询人员结果。 */
export interface StaffSearchItem {
  id: number,
  id_card: string,
  name: string,
  phone: string,
  referral_code: string,
  title: string
  gender: number
}

type StaffSearchResponse = StaffSearchItem | StaffSearchItem[] | null

/** GET /api/v1/staff/staffs/by-phone：按完整手机号精确查找人员。 */
export async function searchStaffByPhone(phone: string) {
  const result = await http.get<StaffSearchResponse>('/v1/staff/staffs/by-phone', { phone: phone.trim() })
  if (!result) return []
  return Array.isArray(result) ? result : [result]
}

export interface CredentialItem {
  id: number
  staff_id: number
  credential_type: string
  file_urls: string[]
  valid_until: string
  audit_status: 0 | 1 | 2
  audited_by?: string
  audited_at?: string
}

export interface PositionItem {
  id: number
  position_code: string
  position_name: string
  description?: string
  status?: number
}

export function getStaffList(params: PageParams & {
  staff_type?: number
  status?: number
  position_code?: string
  keyword?: string
}) {
  return http.get<PageResult<StaffItem>>('/v1/staff/staffs', { ...params })
}

export function createStaff(data: Partial<StaffItem> & {
  password?: string
  gender?: number
  id_card?: string
  position_code?: string
}) {
  return http.post<StaffItem>('/v1/staff/staffs', data)
}

export function getStaffDetail(id: number | string) {
  return http.get<StaffDetail>(`/v1/staff/staffs/${id}`)
}

export function updateStaff(id: number | string, data: Partial<StaffItem>) {
  return http.put<null>(`/v1/staff/staffs/${id}`, data)
}

export function deleteStaff(id: number | string) {
  return http.delete<null>(`/v1/staff/staffs/${id}`)
}

export function getStaffCredentials(id: number | string) {
  return http.get<CredentialItem[]>(`/v1/staff/staffs/${id}/credentials`)
}

export function createCredential(id: number | string, data: Partial<CredentialItem>) {
  return http.post<CredentialItem>(`/v1/staff/staffs/${id}/credentials`, data)
}

export function updateCredential(id: number | string, data: Partial<CredentialItem>) {
  return http.put<null>(`/v1/staff/credentials/${id}`, data)
}

export function getPositions() {
  return http.get<PageResult<PositionItem>>('/v1/staff/positions')
}

/** ListAllServiceSimp：所有服务简要信息，按分类树状返回。 */
export function getAllServicesSimp() {
  return http.get<ServiceSimpleItem[]>('/v1/staff/services/simp')
}
