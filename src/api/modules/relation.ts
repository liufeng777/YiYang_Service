import { http } from '@/utils/request'
import type { PageParams, PageResult } from '@/types/api'

/**
 * 会员-人员服务关系（协同工作台端，对齐 swagger member-staff-relations 模块）
 * 网关前缀：/api/v1/staff
 */

/** 服务关系列表项 */
export interface MemberStaffRelation {
  id: number
  member_id?: number
  member_name?: string
  staff_id?: number
  staff_name?: string
  staff_position_code?: string
  staff_position_name?: string
  comment?: string
  /** 1-生效中 0-已解绑 */
  active?: number
  is_active?: number
  created_at?: number
}

/** 服务关系分页列表（GET /member-staff-relations，active_only 默认 1） */
export function getMemberStaffRelations(
  params: PageParams & {
    member_id?: number
    staff_id?: number
    staff_position_code?: string
    /** 1-仅生效中 0-全部（默认 1） */
    active_only?: number
  },
) {
  return http.get<PageResult<MemberStaffRelation>>('/v1/staff/member-staff-relations', {
    ...params,
  })
}

/** 绑定服务关系（POST /member-staff-relations） */
export function bindMemberStaff(data: {
  member_id: number
  staff_id: number
  staff_position_code?: string
  comment?: string
}) {
  return http.post<{ id: number }>('/v1/staff/member-staff-relations', data)
}

/** 解绑服务关系（POST /member-staff-relations/{id}/unbind） */
export function unbindMemberStaff(id: number | string, data?: { reason?: string }) {
  return http.post<null>(`/v1/staff/member-staff-relations/${id}/unbind`, data)
}
