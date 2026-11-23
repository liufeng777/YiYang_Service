import { Card, Descriptions, Empty, Tag } from 'antd'
import dayjs, { type Dayjs } from 'dayjs'
import type { ApiData } from '@/api/modules/common'

export type ArchiveData = ApiData

const FIELD_LABELS: Record<string, string> = {
  id: 'ID', member_id: '会员 ID', name: '名称', title: '标题', goal_name: '目标名称',
  plan_name: '方案名称', status: '状态', created_at: '创建时间', updated_at: '更新时间',
  remark: '备注', description: '描述', metrics: '指标项', items: '子项', batch_no: '评估批次',
  assess_date: '评估时间', source: '来源', source_name: '来源', disease_code: '病种编码',
  disease_name: '病种名称', diagnose_date: '诊断日期', chronic_status: '控制状态',
  end_date: '终止日期', reason: '原因', metric_code: '指标编码', metric_name_cn: '指标名称',
  metric_value: '测量值', metric_unit: '单位', measurement_time: '测量时间', is_abnormal: '是否异常',
  content: '内容', summary: '摘要', start_date: '开始日期', target_date: '目标日期',
  target_value: '目标值', current_value: '当前值', assessor_name: '评估人',
  metric_count: '指标数', summary_label: '评估摘要', assessment_count: '评估次数',
  last_assess_date: '最近评估时间', last_risk_level_label: '最近风险摘要',
  treatment_desc: '治疗情况', disease_history_id: '专病条目 ID',
  goals: '健康目标', interventions: '干预措施', audit_reviews: '审核履历',
  checkin_freq_type: '打卡频率类型', checkin_freq_value: '打卡频率值',
  intervention_id: '干预 ID', plan_id: '方案 ID', checkin_time: '打卡时间',
  completion_rate: '完成率', pass: '是否通过', reviewer_name: '审核人',
  plan_type: '方案类型', health_intent: '健康管理意向', duration_days: '执行周期（天）',
  review_remark: '最近审批意见', goal_code: '目标编码', goal_label: '目标名称',
  goal_basis: '目标依据', interv_code: '干预编码', interv_name: '干预名称',
  action_desc: '干预说明', interv_basis: '干预依据', field_type: '字段类型',
  field_unit: '数值单位', field_value: '打卡数值', value_text: '打卡内容',
  expected_count: '应打卡次数', actual_count: '实打卡次数', missing_count: '缺失次数',
  consecutive_days: '连续打卡天数', interv_stats: '按干预统计', operated_at: '操作时间',
  operator_name: '操作人', role: '角色', result: '审核结果', error_msg: '失败原因',
}

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

function isNested(value: unknown): value is ArchiveData | unknown[] {
  return value != null && typeof value === 'object'
}

function ScalarValue({ field, value }: { field: string; value: unknown }) {
  if (typeof value === 'boolean') return <>{value ? '是' : '否'}</>
  if (typeof value === 'number' && /(_at|_time|_date|_ts)$/.test(field)) return <>{formatTimestamp(value)}</>
  return <>{display(value)}</>
}

/** 通用响应以结构化字段展示；字段标签仅影响显示，不改变接口原值。 */
export function DataView({ value }: { value: unknown }) {
  if (value == null || value === '') return <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="暂无数据" />
  if (Array.isArray(value)) {
    if (value.length === 0) return <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="暂无数据" />
    if (value.every((item) => !isNested(item))) {
      return <div className="archive-data-tags">{value.map((item, index) => <Tag key={`${display(item)}-${index}`}>{display(item)}</Tag>)}</div>
    }
    return (
      <div className="archive-data-list">
        {value.map((item, index) => (
          <Card size="small" key={index} title={`第 ${index + 1} 项`}><DataView value={item} /></Card>
        ))}
      </div>
    )
  }
  if (typeof value === 'object') {
    const entries = Object.entries(value as ArchiveData).filter(([, item]) => item !== undefined)
    if (entries.length === 0) return <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="暂无数据" />
    return (
      <Descriptions className="archive-data-view" bordered size="small" column={{ xs: 1, sm: 2 }}>
        {entries.map(([field, item]) => (
          <Descriptions.Item key={field} label={FIELD_LABELS[field] ?? field} span={isNested(item) || field === 'remark' || field === 'description' ? 2 : 1}>
            {isNested(item) ? <DataView value={item} /> : <ScalarValue field={field} value={item} />}
          </Descriptions.Item>
        ))}
      </Descriptions>
    )
  }
  return <div className="archive-data-value">{display(value)}</div>
}
