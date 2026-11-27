import dayjs, { type Dayjs } from 'dayjs'
import type { ApiData } from '@/api/modules/common'
import type { FollowupDetailResponse, FollowupItem } from '@/api/modules/followup'

export interface FollowupOption {
  value: string
  label: string
}

export interface FollowupField {
  key: string
  label: string
  value: unknown
  unit?: string
  dataType?: number
  options: FollowupOption[]
}

export interface FollowupFieldGroup {
  key: string
  label: string
  fields: FollowupField[]
}

const CHILD_KEYS = ['items', 'children', 'subitems', 'followup_items']
const FIELD_CODE_KEYS = ['item_code', 'code', 'field_code', 'item_key', 'item_id', 'id']
const FIELD_VALUE_KEYS = ['value', 'item_value', 'answer', 'result']

export function asObject(value: unknown): ApiData {
  return value != null && typeof value === 'object' && !Array.isArray(value) ? value as ApiData : {}
}

export function pick(source: ApiData, keys: string[]): unknown {
  for (const key of keys) if (source[key] != null) return source[key]
  return undefined
}

export function display(value: unknown) {
  if (value == null || value === '') return '-'
  return typeof value === 'object' ? JSON.stringify(value) : String(value)
}

function parseDayjs(value: unknown): Dayjs | undefined {
  if (value == null || value === '') return undefined
  if (typeof value === 'number' || (typeof value === 'string' && /^\d+$/.test(value))) {
    const timestamp = Number(value)
    // 后端以 0 表示未填写，不能渲染为 1970 年。
    if (!Number.isFinite(timestamp) || timestamp <= 0) return undefined
    const parsed = dayjs(timestamp < 1_000_000_000_000 ? timestamp * 1000 : timestamp)
    return parsed.isValid() ? parsed : undefined
  }
  if (typeof value === 'string') {
    const parsed = dayjs(value)
    return parsed.isValid() ? parsed : undefined
  }
  return undefined
}

export function toDayjs(value: unknown) {
  return parseDayjs(value)
}

export function formatDateTime(value: unknown) {
  return parseDayjs(value)?.format('YYYY-MM-DD HH:mm') ?? '-'
}

export function formatDate(value: unknown) {
  return parseDayjs(value)?.format('YYYY-MM-DD') ?? '-'
}

export function getFollowupMain(detail: FollowupDetailResponse): FollowupItem {
  const nested = pick(detail, ['followup', 'main', 'record'])
  return { ...detail, ...asObject(nested) } as unknown as FollowupItem
}

function hasChildren(source: ApiData) {
  return pick(source, CHILD_KEYS) != null
}

function isField(source: ApiData) {
  // 分组自身也可能有 id，必须优先识别其子项集合，避免把分组当成字段。
  if (hasChildren(source)) return false
  if (pick(source, FIELD_CODE_KEYS) != null) return true
  if (source.item_name != null) return true
  return pick(source, ['name', 'label', 'title']) != null
    && pick(source, [...FIELD_VALUE_KEYS, 'data_type', 'options', 'option_json']) != null
}

function parseOptions(value: unknown): FollowupOption[] {
  let source = value
  if (typeof source === 'string') {
    if (!source) return []
    try { source = JSON.parse(source) } catch { return [] }
  }
  if (Array.isArray(source)) {
    return source.flatMap((item) => {
      if (typeof item === 'string' || typeof item === 'number') {
        return [{ value: String(item), label: String(item) }]
      }
      const option = asObject(item)
      const optionValue = pick(option, ['value', 'code', 'key'])
      if (optionValue == null) return []
      return [{
        value: String(optionValue),
        label: display(pick(option, ['label', 'name', 'text']) ?? optionValue),
      }]
    })
  }
  if (source != null && typeof source === 'object') {
    return Object.entries(source as ApiData).map(([value, label]) => ({ value, label: display(label) }))
  }
  return []
}

function toField(source: ApiData, index: number, prefix: string): FollowupField {
  const code = pick(source, FIELD_CODE_KEYS) ?? `${prefix}_${index}`
  const label = pick(source, ['item_name', 'name', 'title', 'label', 'content']) ?? code
  return {
    key: String(code),
    label: String(label),
    value: pick(source, FIELD_VALUE_KEYS),
    unit: pick(source, ['unit', 'unit_symbol', 'metric_unit']) as string | undefined,
    dataType: Number(pick(source, ['data_type', 'type']) ?? 0) || undefined,
    options: parseOptions(pick(source, ['options', 'option_json', 'enum_options'])),
  }
}

function normalizeFields(source: unknown, prefix = 'item'): FollowupField[] {
  if (Array.isArray(source)) {
    return source.flatMap((item, index) => {
      const raw = asObject(item)
      const children = pick(raw, CHILD_KEYS)
      if (children != null && !isField(raw)) return normalizeFields(children, `${prefix}_${index}`)
      if (!isField(raw)) return []
      return [toField(raw, index, prefix)]
    })
  }
  const object = asObject(source)
  if (!Object.keys(object).length) return []
  if (isField(object)) return [toField(object, 0, prefix)]
  return Object.entries(object).flatMap(([key, value]) => {
    if (value == null || typeof value !== 'object') return []
    return normalizeFields(value, `${prefix}_${key}`)
  })
}

function groupLabel(source: ApiData, fallback: string) {
  const explicit = pick(source, ['item_type_name', 'group_name', 'name', 'title'])
  if (explicit != null) return String(explicit)
  const type = pick(source, ['item_type', 'group_type'])
  return type != null ? `子项分组 ${String(type)}` : fallback
}

/** 实际响应使用 groups；同时兼容数组分组、对象分组及直接子项数组。 */
export function getFollowupGroups(detail: FollowupDetailResponse): FollowupFieldGroup[] {
  const source = pick(detail, ['groups', 'item_groups', 'items', 'followup_items', 'subitems'])
  if (Array.isArray(source)) {
    const groups: FollowupFieldGroup[] = []
    const directFields: FollowupField[] = []
    source.forEach((item, index) => {
      const raw = asObject(item)
      const children = pick(raw, CHILD_KEYS)
      if (children != null && !isField(raw)) {
        const fields = normalizeFields(children, `group_${index}`)
        if (fields.length) {
          groups.push({ key: `group_${index}`, label: groupLabel(raw, `子项分组 ${index + 1}`), fields })
        }
      } else if (isField(raw)) {
        directFields.push(toField(raw, index, 'item'))
      }
    })
    if (directFields.length) groups.unshift({ key: 'items', label: '随访子项', fields: directFields })
    return groups
  }

  const object = asObject(source)
  if (!Object.keys(object).length) return []
  if (isField(object)) {
    return [{ key: 'items', label: '随访子项', fields: [toField(object, 0, 'item')] }]
  }
  const children = pick(object, CHILD_KEYS)
  if (children != null) {
    const fields = normalizeFields(children, 'group')
    return fields.length ? [{ key: 'group', label: groupLabel(object, '随访子项'), fields }] : []
  }
  return Object.entries(object).flatMap(([key, value], index) => {
    const fields = normalizeFields(value, `group_${key}`)
    if (!fields.length) return []
    const label = /^\d+$/.test(key) ? `子项分组 ${key}` : key
    return [{ key: `group_${key}_${index}`, label, fields }]
  })
}

export function followupSource(sourceType: unknown, sourceId?: unknown) {
  if (sourceType == null) return '-'
  const source = Number(sourceType) === 9 ? '手动创建' : '系统创建'
  return sourceId != null ? `${source} · #${String(sourceId)}` : source
}
