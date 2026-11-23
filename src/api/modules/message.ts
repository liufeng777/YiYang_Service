import { http } from '@/utils/request'
import type { PageParams, PageResult } from '@/types/api'
import type { ApiData, Id } from './common'

export type StaffMessageType = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13
export type MessageReadStatus = 1 | 2

/** Swagger 响应为通用 object，保留扩展字段以兼容后端实际返回的消息内容。 */
export interface StaffMessage extends ApiData {
  id: Id
  title?: string
  subject?: string
  content?: string
  summary?: string
  body?: string
  message_type?: StaffMessageType
  is_read?: MessageReadStatus
  entity_type?: string
  entity_id?: Id
  created_at?: number
  read_at?: number
}

export interface StaffMessageListParams extends PageParams {
  message_type?: StaffMessageType
  is_read?: MessageReadStatus
  entity_type?: string
}

export interface StaffUnreadCount extends ApiData {
  unread_count?: number
  total?: number
  count?: number
  total_unread?: number
}

export interface StaffNotifyPrefs extends ApiData {
  category_off?: StaffMessageType[]
  night_silent?: 0 | 1
  sms_enabled?: 0 | 1
  wechat_enabled?: 0 | 1
}

export interface StaffNotifySubscription extends ApiData {
  tpl_code: string
  expire_at?: number
  remain_count?: number
  subscribe_type?: 0 | 1 | 2
}

/** 未读数响应未声明具体 schema，优先读取总数字段，缺失时兼容按分类汇总。 */
export function unreadTotal(result: StaffUnreadCount): number {
  for (const key of ['unread_count', 'total_unread', 'total', 'count'] as const) {
    const value = result[key]
    if (typeof value === 'number' && Number.isFinite(value)) return value
  }
  for (const key of ['by_type', 'categories', 'type_counts', 'items']) {
    const value = result[key]
    if (Array.isArray(value)) {
      return value.reduce((sum, item) => {
        if (typeof item === 'number') return sum + item
        if (item == null || typeof item !== 'object') return sum
        const data = item as ApiData
        const count = data.unread_count ?? data.count ?? data.total
        return sum + (typeof count === 'number' ? count : 0)
      }, 0)
    }
    if (value != null && typeof value === 'object') {
      return Object.values(value).reduce<number>((sum, item) => {
        if (typeof item === 'number') return sum + item
        if (item == null || typeof item !== 'object') return sum
        const data = item as ApiData
        const count = data.unread_count ?? data.count ?? data.total
        return sum + (typeof count === 'number' ? count : 0)
      }, 0)
    }
  }
  return 0
}

export function getMessages(params: StaffMessageListParams) {
  return http.get<PageResult<StaffMessage>>('/v1/staff/messages', { ...params })
}

export function getMessageDetail(id: Id) {
  return http.get<StaffMessage>(`/v1/staff/messages/${id}`)
}

export function markMessagesRead(ids: Id[]) {
  return http.post<ApiData>('/v1/staff/messages/mark-read', { ids })
}

export function markAllMessagesRead(messageType?: StaffMessageType) {
  return http.post<ApiData>('/v1/staff/messages/read-all', messageType ? { message_type: messageType } : {})
}

export function getUnreadMessageCount() {
  return http.get<StaffUnreadCount>('/v1/staff/messages/unread-count')
}

export function getNotifyPrefs() {
  return http.get<StaffNotifyPrefs>('/v1/staff/notify-prefs')
}

export function saveNotifyPrefs(data: StaffNotifyPrefs) {
  return http.put<ApiData>('/v1/staff/notify-prefs', data)
}

export function getNotifySubscription(tplCode: string) {
  return http.get<StaffNotifySubscription>('/v1/staff/notify-subscriptions', { tpl_code: tplCode })
}

export function saveNotifySubscription(data: StaffNotifySubscription) {
  return http.put<ApiData>('/v1/staff/notify-subscriptions', data)
}
