import { Descriptions, Empty } from 'antd'

export type ApiObject = Record<string, unknown>

export function asObject(value: unknown): ApiObject {
  return value != null && typeof value === 'object' && !Array.isArray(value) ? value as ApiObject : {}
}

export function displayValue(value: unknown): string {
  if (value == null || value === '') return '-'
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') return String(value)
  return JSON.stringify(value)
}

export function ObjectDescriptions({ value }: { value: unknown }) {
  const object = asObject(value)
  const entries = Object.entries(object)
  if (!entries.length) return <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="暂无响应数据" />
  return (
    <Descriptions bordered size="small" column={{ xs: 1, md: 2 }}>
      {entries.map(([key, fieldValue]) => (
        <Descriptions.Item key={key} label={key} span={typeof fieldValue === 'object' ? 2 : 1}>
          {displayValue(fieldValue)}
        </Descriptions.Item>
      ))}
    </Descriptions>
  )
}

export function JsonView({ value }: { value: unknown }) {
  if (value == null) return <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="暂无数据" />
  return <pre className="as-json">{JSON.stringify(value, null, 2)}</pre>
}
