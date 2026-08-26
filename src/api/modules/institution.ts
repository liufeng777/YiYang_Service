import { http } from '@/utils/request'
import type { PageParams, PageResult } from '@/types/api'

export interface InstitutionItem {
  id: number
  name: string
  contactName: string
  contactPhone: string
  status: number // 0 待审核 1 已通过 2 已驳回
  createdAt: string
}

export interface InstitutionDetail extends InstitutionItem {
  address: string
  description: string
  businessLicenseUrl: string
}

/** 机构分页列表 */
export function getInstitutionList(params: PageParams) {
  return http.get<PageResult<InstitutionItem>>('/institution/list', { ...params })
}

/** 机构详情 */
export function getInstitutionDetail(id: number) {
  return http.get<InstitutionDetail>(`/institution/${id}`)
}

/** 机构审核 */
export function auditInstitution(id: number, approved: boolean, remark?: string) {
  return http.post<null>(`/institution/${id}/audit`, { approved, remark })
}

/** 机构上下架 */
export function toggleInstitution(id: number, enabled: boolean) {
  return http.post<null>(`/institution/${id}/toggle`, { enabled })
}

/**
 * TODO: 协同工作台端机构主数据接口（平台管理员：机构列表/新增机构/编辑/同步运营平台/同步日志）
 * API v0.1（《协同工作台-API设计》）未定义，机构管理为运营后台域预留权限码（org:view），待后端补充；
 * 当前 src/pages/institution 页面以本地 mock 演示完整交互。
 * 注意：本模块上述接口与本端机构管理页面无对应关系，页面未调用。
 */
