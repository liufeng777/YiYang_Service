import type { ArchiveEnumOptions } from '@/api/modules/health-archive'
import { display } from './Plan/shared'

export function archiveEnumLabel(options: ArchiveEnumOptions | undefined, field: string, value: unknown) {
  if (value == null || value === '') return '-'
  const option = options?.[field]?.find((item) => item.value === Number(value))
  return option?.label ?? display(value)
}

const FIELD_COLORS: Record<string, string[]> = {
  severity: ['green', 'orange', 'red', 'volcano'],
  disease_status: ['red', 'green', 'orange'],
  outcome: ['green', 'cyan', 'orange', 'red'],
  allergy_type: ['blue', 'purple', 'magenta', 'geekblue'],
  op_type: ['blue', 'cyan', 'geekblue', 'purple'],
  relation: ['blue', 'cyan', 'geekblue', 'purple', 'magenta'],
}
const DEFAULT_COLORS = ['blue', 'cyan', 'geekblue', 'purple', 'orange']

/** 优先使用字段语义色；其他枚举按数值稳定区分，未知值也有明确颜色。 */
export function archiveEnumColor(field: string, value: unknown, label: string) {
  if (/死亡|无效|恶化|严重|重度|危急/.test(label)) return 'red'
  if (/治愈|康复|正常|恢复|良好|轻微|轻度/.test(label)) return 'green'
  if (/好转|稳定|部分|中度|后遗症/.test(label)) return 'orange'
  const numeric = Number(value)
  const colors = FIELD_COLORS[field] ?? DEFAULT_COLORS
  const index = Number.isFinite(numeric) ? Math.max(0, Math.trunc(numeric) - 1) : 0
  return colors[index % colors.length]
}
