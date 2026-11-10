/** 将专病字典返回的表单定义转换为 antd 表单项。 */
import { Alert, Form, Input, InputNumber, Select } from 'antd'
import type { ArchiveData } from './shared'
import { asObject, display, parseStringRecord, pick } from './shared'

export interface ChronicMetricOption { value: string; label: string }
export interface ChronicMetricDefinition {
  code: string
  label: string
  unit?: string
  dataType?: number
  isMulti?: boolean
  required?: boolean
  sortOrder?: number
  group?: string
  options: ChronicMetricOption[]
  raw: ArchiveData
}

function parseOptions(value: unknown): ChronicMetricOption[] {
  let source = value
  if (typeof source === 'string') {
    if (!source.trim()) return []
    try { source = JSON.parse(source) } catch { return [] }
  }
  if (Array.isArray(source)) {
    return source.map((item) => {
      if (typeof item === 'string' || typeof item === 'number') return { value: String(item), label: String(item) }
      const option = asObject(item)
      const optionValue = pick(option, ['value', 'code', 'option_value', 'key'])
      return { value: display(optionValue), label: display(pick(option, ['label', 'name', 'option_name', 'text']) ?? optionValue) }
    }).filter((item) => item.value !== '-')
  }
  if (source != null && typeof source === 'object') {
    return Object.entries(source as ArchiveData).map(([key, item]) => ({ value: key, label: display(item) }))
  }
  return []
}

function isDefinition(value: ArchiveData) {
  return pick(value, ['metric_code', 'code', 'field_code', 'item_code']) != null
}

function extractDefinitions(source: unknown, depth = 0): ChronicMetricDefinition[] {
  if (depth > 4 || source == null) return []
  if (Array.isArray(source)) {
    const definitions: ChronicMetricDefinition[] = []
    source.forEach((item, index) => {
      const raw = asObject(item)
      const code = pick(raw, ['metric_code', 'code', 'field_code', 'item_code'])
      if (code == null || code === '') return
      definitions.push({
        code: String(code),
        label: display(pick(raw, ['metric_name_cn', 'metric_name', 'item_name', 'name_cn', 'label', 'name']) ?? code),
        unit: pick(raw, ['metric_unit', 'unit_symbol', 'unit']) as string | undefined,
        dataType: Number(pick(raw, ['data_type', 'type']) ?? 0) || undefined,
        isMulti: Number(pick(raw, ['is_multi', 'multiple']) ?? 0) === 1,
        required: pick(raw, ['required', 'is_required']) === true || Number(pick(raw, ['is_required', 'required']) ?? 0) === 1,
        sortOrder: Number(pick(raw, ['sort_order', 'sort']) ?? index),
        group: pick(raw, ['metric_group', 'group', 'group_name']) as string | undefined,
        options: parseOptions(pick(raw, ['options', 'option_json', 'optionJson', 'enum_options'])),
        raw,
      })
    })
    return definitions.sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
  }

  const object = asObject(source)
  if (isDefinition(object)) return extractDefinitions([object], depth + 1)
  for (const key of ['metrics', 'items', 'fields', 'list', 'metric_list', 'form_items']) {
    const candidate = object[key]
    if (Array.isArray(candidate)) {
      const result = extractDefinitions(candidate, depth + 1)
      if (result.length) return result
    }
    if (candidate != null && typeof candidate === 'object') {
      const entries = Object.entries(candidate as ArchiveData).map(([code, value]) => ({ code, ...asObject(value) }))
      const result = extractDefinitions(entries, depth + 1)
      if (result.length) return result
    }
  }
  for (const key of ['form', 'dict', 'definition', 'data']) {
    if (object[key] != null) {
      const result = extractDefinitions(object[key], depth + 1)
      if (result.length) return result
    }
  }
  return []
}

export function getChronicMetricDefinitions(source: unknown) {
  return extractDefinitions(source)
}

export function metricFormValues(source: unknown, definitions: ChronicMetricDefinition[]) {
  const metrics = asObject(source)
  if (!definitions.length) return { metrics_text: JSON.stringify(metrics, null, 2) }
  const values = Object.fromEntries(definitions.map((definition) => {
    let value = metrics[definition.code]
    if (definition.isMulti && typeof value === 'string') {
      const textValue = value
      try {
        const parsed: unknown = JSON.parse(textValue)
        value = Array.isArray(parsed) ? parsed : textValue.split(',').filter(Boolean)
      } catch { value = textValue.split(',').filter(Boolean) }
    }
    if (definition.dataType === 1 && typeof value === 'string' && value !== '') {
      const numeric = Number(value)
      value = Number.isNaN(numeric) ? value : numeric
    }
    return [definition.code, value]
  }))
  return { metrics: values }
}

export function serializeMetricValues(values: ArchiveData, definitions: ChronicMetricDefinition[]) {
  if (!definitions.length) return parseStringRecord(String(values.metrics_text || '{}'))
  const metrics = asObject(values.metrics)
  return Object.fromEntries(definitions.map((definition) => {
    const value = metrics[definition.code]
    if (Array.isArray(value)) return [definition.code, JSON.stringify(value)]
    return [definition.code, value == null ? '' : String(value)]
  }))
}

export function validateMetricJson(_: unknown, value: string) {
  try { parseStringRecord(value || '{}'); return Promise.resolve() } catch { return Promise.reject(new Error('请输入有效的 JSON 对象')) }
}

export function ChronicMetricFields({ definitions }: { definitions: ChronicMetricDefinition[] }) {
  if (!definitions.length) {
    return (
      <>
        <Alert
          type="info" showIcon className="archive-section"
          title="该病种未返回可用的指标表单定义，请使用 JSON 对象录入指标编码和测量值。"
        />
        <Form.Item
          name="metrics_text" label="评估指标（JSON 对象）"
          rules={[{ required: true }, { validator: validateMetricJson }]}
        >
          <Input.TextArea rows={8} className="archive-code-input" />
        </Form.Item>
      </>
    )
  }

  return (
    <div className="chronic-metric-grid">
      {definitions.map((definition) => (
        <Form.Item
          key={definition.code}
          name={['metrics', definition.code]}
          label={`${definition.label}${definition.unit ? `（${definition.unit}）` : ''}`}
          rules={definition.required ? [{ required: true, message: `请填写${definition.label}` }] : undefined}
        >
          {definition.options.length ? (
            <Select
              mode={definition.isMulti ? 'multiple' : undefined}
              options={definition.options}
              placeholder={`请选择${definition.label}`}
              allowClear
            />
          ) : definition.dataType === 1 ? (
            <InputNumber placeholder={`请输入${definition.label}`} />
          ) : (
            <Input placeholder={`请输入${definition.label}`} />
          )}
        </Form.Item>
      ))}
    </div>
  )
}
