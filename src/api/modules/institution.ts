import { http } from '@/utils/request'

/**
 * 机构主数据（协同工作台端）
 * 网关前缀：/api/v1/staff
 *
 * 用途：登录返回 staff.institutions 仅含机构 id 与岗位信息，
 * 选择机构页需要逐个调用机构详情接口渲染机构卡片（名称 / 类型 / 地址等）。
 * 注意：该端点未出现在 swagger.json 路径清单中，路径按网关前缀约定
 * 推断为 GET /api/v1/staff/institutions/{id}，如后端实际路径不同仅需改此处。
 */

/** 机构详情（出参字段按服务端实际返回兼容读取，均为可选） */

/** 机构已启用服务项（GET /institutions/current 出参 services 元素，字段按服务端实际返回兼容读取） */
export interface InstitutionService {
  is_home_service: number
  price: string
  service_category_id: number
  service_category_name: string
  service_id: number
  service_name: string
  unit: string
}

export interface InstitutionDetail {
  address: string
  brief: string
  city: string
  contact_phone: string
  cover_url: string
  description: string
  district: string
  id: number
  images: string[]
  manager_name: string
  manager_phone: string
  name: string
  name_en: string
  province: string
  service_radius_km: number
  status: number
  type: number
}

/** 当前机构详情（含已启用服务列表） */
export interface CurrentInstitution {
  enabled_services: InstitutionService[]
  institution: InstitutionDetail
}

/** 当前登录机构详情 + 已启用服务列表（GET /api/v1/staff/institutions/current，所有岗位可见） */
export function getCurrentInstitution() {
  return http.get<CurrentInstitution>('/v1/staff/institutions/current')
}