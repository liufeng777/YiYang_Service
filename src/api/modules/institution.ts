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
export interface InstitutionDetail {
  id: number
  institution_id?: number
  name?: string
  institution_name?: string
  /** 机构类型，如 医养结合机构 / 护理院 / 健康驿站 */
  type?: string
  institution_type?: string
  address?: string
  contact_name?: string
  contact_phone?: string
  description?: string
  /** 数据范围说明（如接口提供） */
  scope?: string
  scope_detail?: string
  status?: number
  [key: string]: unknown
}

/** 机构详情（选择机构页卡片数据源） */
export function getInstitutionDetail(id: number | string) {
  return http.get<InstitutionDetail>(`/v1/staff/institutions/${id}`)
}

/**
 * TODO: 机构管理页面接口（机构列表/新增机构/编辑/同步运营平台/同步日志）
 * swagger 未定义，src/pages/institution 页面以本地 mock 演示完整交互。
 */
