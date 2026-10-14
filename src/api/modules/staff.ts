/**
 * 服务人员管理 API
 * 对齐《协同工作台-API设计》§7（staffmgr:view / staffmgr:manage）
 * 当前 src/pages/staff 页面以本地 mock 演示完整交互，待后端联调后接入
 */
import { http } from '@/utils/request'
import type { PageParams, PageResult } from '@/types/api'

/** 人员列表项（§7.1，字段对齐服务端实际出参） */
export interface StaffItem {
  id: number
  institution_id: number
  institutions: {
    institution_id: number;
    position_code: string;
    position_name: string;
  }[]
  /** 1-本端协同人员 2-小程序服务人员 */
  staff_type: number
  name: string
  phone: string
  avatar_url: string
  title: string
  service_ids?: number[]
  referral_code?: string
  /** 0-停用 1-启用 */
  status: number
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

/** 岗位配置（对齐服务端实际出参） */
export interface PositionItem {
  id: number
  position_code: string
  position_name: string
  description?: string
  status?: number
}

/** 人员分页列表（swagger：staff_type / status / position_code / keyword / 分页） */
export function getStaffList(
  params: PageParams & {
    staff_type?: number
    status?: number
    /** 岗位编码（Admin / Doctor / HealthMgr / Caregiver） */
    position_code?: string
    keyword?: string
  },
) {
  return http.get<PageResult<StaffItem>>('/v1/staff/staffs', { ...params })
}

/** 人员详情 */
export function getStaffDetail(id: number) {
  return http.get<StaffDetail>(`/v1/staff/staffs/${id}`)
}

/** 新增人员（phone 唯一，新增时设定初始密码，首次登录强制改密） */
export function createStaff(
  data: Partial<StaffItem> & {
    password?: string
    /** 1-男 2-女（服务端入参，StaffItem 出参不含） */
    gender?: number
    id_card?: string
    /** 岗位编码（Admin / Doctor / HealthMgr / Caregiver） */
    position_code?: string
  },
) {
  return http.post<StaffItem>('/v1/staff/staffs', data)
}

/** 编辑人员 */
export function updateStaff(id: number, data: Partial<StaffItem>) {
  return http.put<null>(`/v1/staff/staffs/${id}`, data)
}

/** 资质列表 */
export function getStaffCredentials(id: number) {
  return http.get<CredentialItem[]>(`/v1/staff/staffs/${id}/credentials`)
}

/** 资质新增 */
export function createCredential(id: number, data: Partial<CredentialItem>) {
  return http.post<CredentialItem>(`/v1/staff/staffs/${id}/credentials`, data)
}

/** 资质状态/到期更新 */
export function updateCredential(id: number, data: Partial<CredentialItem>) {
  return http.put<null>(`/v1/staff/credentials/${id}`, data)
}

/** 岗位配置列表 */
export function getPositions() {
  return http.get<PageResult<PositionItem>>('/v1/staff/positions')
}
