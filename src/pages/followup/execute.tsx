/** 随访详情、结构化子项、草稿保存与完成提交。 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  App, Button, Card, DatePicker, Descriptions, Empty, Form, Input, InputNumber,
  Select, Space, Spin,
} from 'antd'
import { ArrowLeftOutlined, CheckOutlined, SaveOutlined } from '@ant-design/icons'
import dayjs, { type Dayjs } from 'dayjs'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import PageContainer from '@/components/PageContainer'
import { followupApi } from '@/api'
import {
  FOLLOWUP_RESULT_MAP, FOLLOWUP_STATUS_MAP, FOLLOWUP_TYPE_MAP, type FollowupItem,
} from '@/api/modules/followup'
import type { ApiData } from '@/api/modules/common'
import './index.less'

interface FollowupLocationState { followup?: FollowupItem }
interface FollowupField {
  key: string
  label: string
  value: unknown
  unit?: string
  dataType?: number
  options: Array<{ value: string; label: string }>
}

function asObject(value: unknown): ApiData {
  return value != null && typeof value === 'object' && !Array.isArray(value) ? value as ApiData : {}
}

function pick(source: ApiData, keys: string[]): unknown {
  for (const key of keys) if (source[key] != null) return source[key]
  return undefined
}

function display(value: unknown) {
  if (value == null || value === '') return '-'
  return typeof value === 'object' ? JSON.stringify(value) : String(value)
}

function parseOptions(value: unknown) {
  let source = value
  if (typeof source === 'string') {
    if (!source) return []
    try { source = JSON.parse(source) } catch { return [] }
  }
  if (Array.isArray(source)) {
    return source.map((item) => {
      if (typeof item === 'string' || typeof item === 'number') return { value: String(item), label: String(item) }
      const option = asObject(item)
      const optionValue = pick(option, ['value', 'code', 'key'])
      return { value: display(optionValue), label: display(pick(option, ['label', 'name', 'text']) ?? optionValue) }
    }).filter((item) => item.value !== '-')
  }
  if (source != null && typeof source === 'object') {
    return Object.entries(source as ApiData).map(([value, label]) => ({ value, label: display(label) }))
  }
  return []
}

function extractFields(source: unknown, prefix = 'item'): FollowupField[] {
  if (Array.isArray(source)) {
    return source.flatMap((item, index) => {
      const raw = asObject(item)
      const children = pick(raw, ['items', 'children', 'subitems', 'followup_items'])
      if (children != null) return extractFields(children, `${prefix}_${index}`)
      const code = pick(raw, ['item_code', 'code', 'field_code', 'item_key', 'item_id', 'id']) ?? `${prefix}_${index}`
      const label = pick(raw, ['item_name', 'name', 'title', 'label', 'content']) ?? code
      return [{
        key: String(code), label: String(label),
        value: pick(raw, ['value', 'item_value', 'answer', 'result']),
        unit: pick(raw, ['unit', 'unit_symbol', 'metric_unit']) as string | undefined,
        dataType: Number(pick(raw, ['data_type', 'type']) ?? 0) || undefined,
        options: parseOptions(pick(raw, ['options', 'option_json', 'enum_options'])),
      }]
    })
  }
  const object = asObject(source)
  if (pick(object, ['item_code', 'field_code', 'item_key']) != null) return extractFields([object], prefix)
  return Object.entries(object).flatMap(([key, value]) => {
    if (value == null || (typeof value !== 'object' && !Array.isArray(value))) return []
    return extractFields(value, `${prefix}_${key}`)
  })
}

function toDayjs(value: unknown): Dayjs | undefined {
  if (typeof value === 'number' && value > 0) return dayjs(value * 1000)
  if (typeof value === 'string' && value) {
    const parsed = dayjs(value)
    return parsed.isValid() ? parsed : undefined
  }
  return undefined
}

export default function FollowupExecute() {
  const { id } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const { message } = App.useApp()
  const [form] = Form.useForm()
  const initial = (location.state as FollowupLocationState | null)?.followup
  const [detail, setDetail] = useState<ApiData>({})
  const [template, setTemplate] = useState<ApiData>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [completing, setCompleting] = useState(false)
  const startTimeRef = useRef<number | undefined>(undefined)

  const load = useCallback(async () => {
    if (!id) return
    setLoading(true)
    try {
      const result = await followupApi.getFollowupDetail(id)
      setDetail(result)
      const main = { ...initial, ...asObject(pick(result, ['followup', 'main', 'record']) ?? result) }
      const hasItems = extractFields(pick(result, ['items', 'followup_items', 'item_groups', 'subitems', 'template'])).length > 0
      if (!hasItems && main.member_id && main.followup_type) {
        const templateResult = await followupApi.getFollowupTemplate(main.member_id, {
          followup_type: main.followup_type,
          warning_id: main.warning_id ?? main.source_id ?? undefined,
        })
        setTemplate(templateResult)
      } else setTemplate({})
    } catch { /* 拦截器统一提示 */ } finally { setLoading(false) }
  }, [id])

  useEffect(() => { load() }, [load])

  const followup = useMemo(() => ({
    ...initial,
    ...asObject(pick(detail, ['followup', 'main', 'record']) ?? detail),
  }), [detail, initial])
  const fields = useMemo(() => {
    const detailFields = extractFields(pick(detail, ['items', 'followup_items', 'item_groups', 'subitems', 'template']))
    if (detailFields.length) return detailFields
    return extractFields(pick(template, ['items', 'followup_items', 'item_groups', 'subitems', 'template']) ?? template)
  }, [detail, template])
  const readOnly = followup.status === 2

  useEffect(() => {
    form.setFieldsValue({
      items: Object.fromEntries(fields.map((field) => [field.key, field.value])),
      remark: pick(followup, ['remark', 'summary', 'supplement']),
      result: followup.result,
      next_followup_date: toDayjs(followup.next_followup_date),
    })
    startTimeRef.current = Number(pick(followup, ['start_time', 'started_at']) ?? 0) || dayjs().unix()
  }, [fields, followup, form])

  const payload = (values: ApiData) => ({
    start_time: startTimeRef.current,
    remark: values.remark,
    next_followup_date: (values.next_followup_date as Dayjs | undefined)?.format('YYYY-MM-DD'),
    items: asObject(values.items),
  })

  const save = async () => {
    if (!id) return
    const values = await form.validateFields()
    setSaving(true)
    try {
      await followupApi.saveFollowup(id, payload(values))
      message.success('随访草稿已保存')
      await load()
    } catch { /* 保留输入 */ } finally { setSaving(false) }
  }

  const complete = async () => {
    if (!id) return
    const values = await form.validateFields()
    if (values.result == null) {
      message.warning('请选择本次随访结果')
      return
    }
    setCompleting(true)
    try {
      await followupApi.completeFollowup(id, { ...payload(values), result: values.result })
      message.success('随访已完成')
      navigate('/followup')
    } catch { /* 保留输入 */ } finally { setCompleting(false) }
  }

  return (
    <div className="fu-page">
      <PageContainer
        title={readOnly ? '随访记录' : '执行随访'}
        description="填写随访子项与补充说明，可多次保存草稿，完成后由服务端写入完成时间"
        extra={<Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/followup')}>返回随访列表</Button>}
      >
        <Spin spinning={loading}>
          <Card variant="borderless" className="fu-card">
            <Descriptions title="随访任务" column={{ xs: 1, sm: 2, lg: 3 }} bordered>
              <Descriptions.Item label="任务 ID">{id ?? '-'}</Descriptions.Item>
              <Descriptions.Item label="服务对象">{display(followup.member_name)}</Descriptions.Item>
              <Descriptions.Item label="会员 ID">{display(followup.member_id)}</Descriptions.Item>
              <Descriptions.Item label="随访类型">{FOLLOWUP_TYPE_MAP[Number(followup.followup_type)] ?? display(followup.followup_type)}</Descriptions.Item>
              <Descriptions.Item label="计划日期">{display(followup.next_followup_date ?? followup.plan_time)}</Descriptions.Item>
              <Descriptions.Item label="当前状态">{FOLLOWUP_STATUS_MAP[Number(followup.status)] ?? display(followup.status)}</Descriptions.Item>
            </Descriptions>

            <Form form={form} layout="vertical" className="fu-execute-form">
              <Card size="small" title="随访子项" className="fu-execute-section">
                {fields.length ? (
                  <div className="fu-followup-items">
                    {fields.map((field) => (
                      <Form.Item
                        key={field.key} name={['items', field.key]}
                        label={`${field.label}${field.unit ? `（${field.unit}）` : ''}`}
                      >
                        {field.options.length ? (
                          <Select options={field.options} disabled={readOnly} allowClear placeholder={`请选择${field.label}`} />
                        ) : field.dataType === 1 ? (
                          <InputNumber disabled={readOnly} placeholder={`请输入${field.label}`} />
                        ) : (
                          <Input disabled={readOnly} placeholder={`请输入${field.label}`} />
                        )}
                      </Form.Item>
                    ))}
                  </div>
                ) : <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="该随访暂无子项" />}
              </Card>

              <div className="fu-execute-grid">
                <Form.Item name="result" label="随访结果" rules={readOnly ? undefined : [{ required: true, message: '请选择随访结果' }]}>
                  <Select
                    disabled={readOnly}
                    options={Object.entries(FOLLOWUP_RESULT_MAP).map(([value, label]) => ({ value: Number(value), label }))}
                  />
                </Form.Item>
                <Form.Item name="next_followup_date" label="下次随访日期">
                  <DatePicker disabled={readOnly} />
                </Form.Item>
              </div>
              <Form.Item name="remark" label="补充说明">
                <Input.TextArea rows={5} disabled={readOnly} placeholder="记录沟通情况、异常说明或后续注意事项" />
              </Form.Item>
            </Form>

            {!readOnly && (
              <Space wrap className="fu-execute-actions">
                <Button icon={<SaveOutlined />} loading={saving} onClick={save}>保存草稿</Button>
                <Button type="primary" icon={<CheckOutlined />} loading={completing} onClick={complete}>完成随访</Button>
              </Space>
            )}
          </Card>
        </Spin>
      </PageContainer>
    </div>
  )
}
