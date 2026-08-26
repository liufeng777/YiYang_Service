/**
 * 服务人员管理 API
 * 对齐《协同工作台-API设计》§7（staffmgr:view / staffmgr:manage）
 * 当前 src/pages/staff 页面以本地 mock 演示完整交互，待后端联调后接入
 */
import { http } from '@/utils/request'
import type { PageParams, PageResult } from '@/types/api'

/** 人员列表项（§7.1） */
export interface StaffItem {
  id: number
  institution_id: number
  /** 1-本端协同人员 2-小程序服务人员 */
  staff_type: 1 | 2
  name: string
  phone: string
  avatar_url: string
  position_id: number
  position_name: string
  title: string
  service_categories: number[]
  /** 0-停用 1-启用 */
  status: 0 | 1
  /** 是否有即将到期资质 */
  upcoming_credential_expire: boolean
}

/** 人员详情（含资质/服务分类/排班次数） */
export interface StaffDetail extends StaffItem {
  id_card?: string
  credentials?: CredentialItem[]
  schedule_count?: number
}

/** 执业资质 */
export interface CredentialItem {
  id: number
  staff_id: number
  /** 资质类型，如 护士执业证 / 专业技术资格证 */
  credential_type: string
  file_urls: string[]
  valid_until: string
  /** 0-待审核 1-已通过 2-已驳回 */
  audit_status: 0 | 1 | 2
  audited_by?: string
  audited_at?: string
}

/** 岗位配置 */
export interface PositionItem {
  id: number
  name: string
  staff_type: 1 | 2
}

/** 人员分页列表 */
export function getStaffList(
  params: PageParams & {
    staff_type?: number
    status?: number
    position_id?: number
    keyword?: string
  },
) {
  return http.get<PageResult<StaffItem>>('/staff/staffs', { ...params })
}

/** 人员详情 */
export function getStaffDetail(id: number) {
  return http.get<StaffDetail>(`/staff/staffs/${id}`)
}

/** 新增人员（phone 唯一，新增时设定初始密码，首次登录强制改密） */
export function createStaff(data: Partial<StaffItem> & { password?: string }) {
  return http.post<StaffItem>('/staff/staffs', data)
}

/** 编辑人员 */
export function updateStaff(id: number, data: Partial<StaffItem>) {
  return http.put<null>(`/staff/staffs/${id}`, data)
}

/** 资质列表 */
export function getStaffCredentials(id: number) {
  return http.get<CredentialItem[]>(`/staff/staffs/${id}/credentials`)
}

/** 资质新增 */
export function createCredential(id: number, data: Partial<CredentialItem>) {
  return http.post<CredentialItem>(`/staff/staffs/${id}/credentials`, data)
}

/** 资质状态/到期更新 */
export function updateCredential(id: number, data: Partial<CredentialItem>) {
  return http.put<null>(`/staff/credentials/${id}`, data)
}

/** 岗位配置列表 */
export function getPositions() {
  return http.get<PositionItem[]>('/staff/positions')
}
