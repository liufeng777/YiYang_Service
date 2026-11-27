import { hasAnyPermission } from '@/router/menu'
import { PERMISSIONS } from '@/router/routes'

export type RefundApprovalStage = 'business' | 'finance'

/** 1 待一级业务审批，2 待二级财务审批。 */
export function getRefundApprovalStage(status?: number): RefundApprovalStage | null {
  if (status === 1) return 'business'
  if (status === 2) return 'finance'
  return null
}

/** 审批能力仅由权限码决定，与角色或岗位名称无关；all:manage 由统一权限函数放行。 */
export function canApproveRefund(stage: RefundApprovalStage | null, permissions: string[]) {
  if (stage === 'business') return hasAnyPermission([PERMISSIONS.PAYMENT_EDIT], permissions)
  if (stage === 'finance') return hasAnyPermission([PERMISSIONS.PAYMENT_MANAGE], permissions)
  return false
}

export function getApprovalStageText(stage: RefundApprovalStage | null) {
  if (stage === 'business') return '业务审批'
  if (stage === 'finance') return '财务审批'
  return '审批'
}
