import { Empty } from 'antd'
import dayjs, { type Dayjs } from 'dayjs'
import type { ApiData } from '@/api/modules/common'

export type ArchiveData = ApiData

export function asObject(value: unknown): ArchiveData {
  return value != null && typeof value === 'object' && !Array.isArray(value) ? value as ArchiveData : {}
}

export function pick(source: ArchiveData | undefined, keys: string[]): unknown {
  if (!source) return undefined
  for (const key of keys) if (source[key] != null) return source[key]
  return undefined
}

export function display(value: unknown): string {
  if (value == null || value === '') return '-'
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') return String(value)
  return JSON.stringify(value)
}

export function formatTimestamp(value: unknown): string {
  if (typeof value !== 'number' || !value) return display(value)
  return dayjs(value * 1000).format('YYYY-MM-DD HH:mm')
}

export function toDayjs(value: unknown): Dayjs | null {
  return typeof value === 'number' && value > 0 ? dayjs(value * 1000) : null
}

export function parseObject(text: string): ArchiveData {
  const parsed: unknown = JSON.parse(text)
  if (parsed == null || typeof parsed !== 'object' || Array.isArray(parsed)) throw new Error('必须是 JSON 对象')
  return parsed as ArchiveData
}

export function parseStringRecord(text: string): Record<string, string> {
  const object = parseObject(text)
  return Object.fromEntries(Object.entries(object).map(([key, value]) => [key, String(value)]))
}

export function JsonView({ value }: { value: unknown }) {
  if (value == null) return <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="暂无数据" />
  return <pre className="archive-json">{JSON.stringify(value, null, 2)}</pre>
}
