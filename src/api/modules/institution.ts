import { http } from '@/utils/request'

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

export interface CurrentInstitution {
  enabled_services: InstitutionService[]
  institution: InstitutionDetail
}

/** 当前登录机构详情及已启用服务；Swagger 未提供机构新增/列表接口。 */
export function getCurrentInstitution() {
  return http.get<CurrentInstitution>('/v1/staff/institutions/current')
}
