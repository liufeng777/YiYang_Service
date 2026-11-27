import type { ActivityItem } from '@/api/modules/activity'
import { formatDateTime } from '@/utils'

export function formatActivityDate(value?: number) {
  return value ? formatDateTime(value * 1000, 'YYYY-MM-DD') : '-'
}

export function formatActivityDateTime(value?: number) {
  return value ? formatDateTime(value * 1000) : '-'
}

/** 列表包含机构承接信息时，根节点统计为 0，需按机构汇总实际名额。 */
export function getActivityStats(activity: ActivityItem) {
  if (activity.institutions?.length) {
    return activity.institutions.reduce(
      (total, institution) => ({
        maxParticipants: total.maxParticipants + (institution.max_participants ?? 0),
        registeredCount: total.registeredCount + (institution.registered_count ?? 0),
        remainingQuota: total.remainingQuota + (institution.remaining_quota ?? 0),
      }),
      { maxParticipants: 0, registeredCount: 0, remainingQuota: 0 },
    )
  }

  return {
    maxParticipants: activity.max_participants ?? 0,
    registeredCount: activity.registered_count ?? 0,
    remainingQuota: activity.remaining_quota ?? 0,
  }
}
