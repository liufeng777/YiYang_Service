/** 按干预记录打卡，并提供统计、应打卡、历史修改与删除。 */
import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  App, Button, DatePicker, Drawer, Form, Input, InputNumber, Popconfirm,
  Select, Space, Spin, Table, Tabs,
} from 'antd'
import Tag from '@/components/StatusTag'
import { PlusOutlined } from '@ant-design/icons'
import type { Dayjs } from 'dayjs'
import { planApi } from '@/api'
import FormDrawer from '@/components/FormDrawer'
import type {
  HealthPlan, HealthPlanCheckin, HealthPlanCheckinItem,
  HealthPlanCheckinStats, HealthPlanIntervention,
} from '@/api/modules/plan'
import { DataView, display, formatTimestamp } from './shared'
import { detailParts, interventionLabel, planTitle } from './plan-shared'

const PAGE_SIZE = 10
type DateRange = [Dayjs, Dayjs]
interface CheckinFormValues {
  intervention_id: number
  field_value?: number
  value_text?: string | string[]
  is_abnormal?: number
}

function optionsFromJson(value?: string) {
  if (!value) return []
  try {
    const parsed: unknown = JSON.parse(value)
    if (!Array.isArray(parsed)) return []
    return parsed.map((item) => {
      if (item != null && typeof item === 'object') {
        const data = item as Record<string, unknown>
        const optionValue = String(data.value ?? data.label ?? data.name ?? '')
        return { value: optionValue, label: String(data.label ?? data.name ?? optionValue) }
      }
      return { value: String(item), label: String(item) }
    }).filter((item) => item.value)
  } catch { return [] }
}

function multiValue(value?: string): string[] {
  if (!value) return []
  try {
    const parsed: unknown = JSON.parse(value)
    return Array.isArray(parsed) ? parsed.map(String) : [value]
  } catch { return value.split(',').filter(Boolean) }
}

function rateText(value: unknown) {
  if (typeof value !== 'number') return display(value)
  return `${value >= 0 && value <= 1 ? value * 100 : value}%`
}

export default function PlanCheckins({ plan, onClose }: {
  plan?: HealthPlan
  onClose: () => void
}) {
  const { message } = App.useApp()
  const [form] = Form.useForm<CheckinFormValues>()
  const [range, setRange] = useState<DateRange | null>(null)
  const [interventionId, setInterventionId] = useState<number>()
  const [interventions, setInterventions] = useState<HealthPlanIntervention[]>([])
  const [detailLoading, setDetailLoading] = useState(false)
  const [stats, setStats] = useState<HealthPlanCheckinStats>()
  const [due, setDue] = useState<unknown>()
  const [overviewLoading, setOverviewLoading] = useState(false)
  const [history, setHistory] = useState<HealthPlanCheckin[]>([])
  const [historyLoading, setHistoryLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [checkinOpen, setCheckinOpen] = useState(false)
  const [editing, setEditing] = useState<HealthPlanCheckin>()
  const [saving, setSaving] = useState(false)
  const planId = plan?.id
  const selectedInterventionId = Form.useWatch('intervention_id', form)
  const selectedIntervention = interventions.find((item) => Number(item.id) === Number(selectedInterventionId))
  const interventionOptions = interventions.map((item) => ({ value: Number(item.id), label: interventionLabel(item) }))
  const interventionMap = useMemo(() => new Map(interventions.map((item) => [Number(item.id), item])), [interventions])

  const dateParams = () => range ? {
    start_date: range[0].startOf('day').unix(),
    end_date: range[1].endOf('day').unix(),
  } : undefined

  const loadOverview = useCallback(async () => {
    if (!planId) return
    setOverviewLoading(true)
    try {
      const [statsResult, dueResult] = await Promise.all([
        planApi.getHealthPlanCheckinStats(planId, dateParams()),
        planApi.getHealthPlanCheckinDue(planId, dateParams()),
      ])
      setStats(statsResult)
      setDue(dueResult)
    } catch { /* 拦截器统一提示 */ } finally { setOverviewLoading(false) }
  }, [planId, range])

  const loadHistory = useCallback(async () => {
    if (!planId) return
    setHistoryLoading(true)
    try {
      const result = await planApi.getHealthPlanCheckins(planId, {
        page,
        page_size: PAGE_SIZE,
        intervention_id: interventionId,
        start_time: range?.[0].startOf('day').unix(),
        end_time: range?.[1].endOf('day').unix(),
      })
      setHistory(result.list ?? [])
      setTotal(result.total ?? 0)
    } catch { /* 拦截器统一提示 */ } finally { setHistoryLoading(false) }
  }, [planId, page, interventionId, range])

  useEffect(() => {
    setRange(null)
    setInterventionId(undefined)
    setPage(1)
    setStats(undefined)
    setDue(undefined)
    setHistory([])
    setInterventions([])
    setCheckinOpen(false)
    setEditing(undefined)
    form.resetFields()
    if (!planId) return
    setDetailLoading(true)
    planApi.getHealthPlanDetail(planId)
      .then((result) => setInterventions(detailParts(result).interventions.filter((item) => item.status !== 9)))
      .catch(() => undefined)
      .finally(() => setDetailLoading(false))
  }, [planId, form])

  useEffect(() => { if (planId) void loadOverview() }, [planId, loadOverview])
  useEffect(() => { if (planId) void loadHistory() }, [planId, loadHistory])

  const openCreate = () => {
    setEditing(undefined)
    form.resetFields()
    form.setFieldsValue({ is_abnormal: 2 })
    setCheckinOpen(true)
  }

  const openEdit = (row: HealthPlanCheckin) => {
    const intervention = interventionMap.get(Number(row.intervention_id))
    setEditing(row)
    form.setFieldsValue({
      intervention_id: Number(row.intervention_id),
      field_value: row.field_value,
      value_text: intervention?.field_type === 5 ? multiValue(row.value_text) : row.value_text,
      is_abnormal: row.is_abnormal,
    })
    setCheckinOpen(true)
  }

  const saveCheckin = async () => {
    if (!planId || !selectedIntervention) return
    const values = await form.validateFields()
    const payload: HealthPlanCheckinItem = {
      intervention_id: Number(values.intervention_id),
      is_abnormal: values.is_abnormal,
    }
    if (selectedIntervention.field_type === 1) payload.field_value = values.field_value
    else payload.value_text = selectedIntervention.field_type === 5
      ? JSON.stringify(values.value_text ?? [])
      : String(values.value_text ?? '')
    setSaving(true)
    try {
      if (editing) await planApi.updateHealthPlanCheckin(planId, editing.id, payload)
      else await planApi.createHealthPlanCheckin(planId, { items: [payload] })
      message.success(editing ? '打卡记录已修改' : '打卡记录已追加')
      setCheckinOpen(false)
      form.resetFields()
      await Promise.all([loadOverview(), loadHistory()])
    } catch { /* 保留输入 */ } finally { setSaving(false) }
  }

  const removeCheckin = async (row: HealthPlanCheckin) => {
    if (!planId) return
    try {
      await planApi.deleteHealthPlanCheckin(planId, row.id)
      message.success('打卡记录已删除')
      await Promise.all([loadOverview(), loadHistory()])
    } catch { /* 拦截器统一提示 */ }
  }

  const checkinValue = (row: HealthPlanCheckin) => {
    const intervention = interventionMap.get(Number(row.intervention_id))
    if (intervention?.field_type === 1) return `${display(row.field_value)}${intervention.field_unit ? ` ${intervention.field_unit}` : ''}`
    if (intervention?.field_type === 3) {
      if (row.value_text === 'true' || row.value_text === '1') return '是'
      if (row.value_text === 'false' || row.value_text === '0') return '否'
    }
    if (intervention?.field_type === 5) return multiValue(row.value_text).join('、') || '-'
    return display(row.value_text ?? row.field_value)
  }

  const overallStats = Object.fromEntries(Object.entries(stats ?? {}).filter(([key]) => key !== 'interv_stats'))

  return (
    <>
      <Drawer
        title={plan ? `方案打卡 · ${planTitle(plan)}` : '方案打卡'}
        width={1100} open={plan != null} onClose={onClose} className="plan-checkin-drawer"
        extra={<Button type="primary" icon={<PlusOutlined />} loading={detailLoading} disabled={!interventions.length} onClick={openCreate}>代录打卡</Button>}
      >
        <div className="plan-checkin-toolbar">
          <Space wrap>
            <DatePicker.RangePicker
              value={range} allowClear
              onChange={(dates) => setRange(dates?.[0] && dates[1] ? [dates[0], dates[1]] : null)}
            />
            <Button type="primary" loading={overviewLoading} onClick={() => { void loadOverview(); void loadHistory() }}>查询</Button>
          </Space>
          <span>每次打卡按干预追加记录；频次仅用于统计应打卡与缺失情况。</span>
        </div>
        <Tabs
          items={[
            {
              key: 'stats', label: '打卡统计',
              children: (
                <Spin spinning={overviewLoading}>
                  <DataView value={overallStats} />
                  <Table
                    title={() => '按干预统计'} rowKey={(row) => String(row.intervention_id ?? JSON.stringify(row))}
                    size="small" pagination={false} dataSource={stats?.interv_stats ?? []} scroll={{ x: 850 }}
                    columns={[
                      { title: '干预', key: 'name', render: (_, row) => row.interv_name || interventionLabel(interventionMap.get(Number(row.intervention_id))) },
                      { title: '应打卡', dataIndex: 'expected_count', width: 100, render: display },
                      { title: '实打卡', dataIndex: 'actual_count', width: 100, render: display },
                      { title: '缺失次数', dataIndex: 'missing_count', width: 100, render: display },
                      { title: '达成率', dataIndex: 'completion_rate', width: 110, render: rateText },
                      { title: '连续天数', dataIndex: 'consecutive_days', width: 100, render: display },
                    ]}
                  />
                </Spin>
              ),
            },
            {
              key: 'due', label: '应打卡清单',
              children: <Spin spinning={overviewLoading}><DataView value={due} /></Spin>,
            },
            {
              key: 'history', label: '打卡历史',
              children: (
                <>
                  <div className="archive-inline-filter">
                    <Select
                      allowClear showSearch optionFilterProp="label" placeholder="全部干预"
                      value={interventionId} options={interventionOptions}
                      onChange={(value) => { setInterventionId(value); setPage(1) }}
                    />
                    <Button onClick={() => { setInterventionId(undefined); setPage(1) }}>重置</Button>
                    <Button type="primary" onClick={() => { setPage(1); void loadHistory() }}>查询历史</Button>
                  </div>
                  <Table<HealthPlanCheckin>
                    rowKey={(row) => String(row.id)} size="small" loading={historyLoading}
                    dataSource={history} scroll={{ x: 980 }}
                    columns={[
                      { title: '干预', key: 'intervention', width: 180, render: (_, row) => interventionLabel(interventionMap.get(Number(row.intervention_id))) },
                      { title: '打卡值', key: 'value', width: 160, render: (_, row) => checkinValue(row) },
                      {
                        title: '结果', dataIndex: 'is_abnormal', width: 90,
                        render: (value) => value == null ? '-' : <Tag color={Number(value) === 1 ? 'red' : 'green'}>{Number(value) === 1 ? '异常' : '正常'}</Tag>,
                      },
                      { title: '打卡时间', key: 'checkin_time', width: 170, render: (_, row) => formatTimestamp(row.checkin_time ?? row.created_at) },
                      {
                        title: '操作', key: 'action', width: 150, fixed: 'right',
                        render: (_, row) => (
                          <Space>
                            <Button size="small" onClick={() => openEdit(row)}>编辑</Button>
                            <Popconfirm title="确认删除该打卡记录？" description="关联的监测记录将按接口规则同步处理。" onConfirm={() => removeCheckin(row)}>
                              <Button size="small" danger>删除</Button>
                            </Popconfirm>
                          </Space>
                        ),
                      },
                    ]}
                    expandable={{ expandedRowRender: (row) => <DataView value={row} /> }}
                    pagination={{
                      current: page, pageSize: PAGE_SIZE, total,
                      showTotal: (value) => `共 ${value} 条`,
                      onChange: (nextPage) => setPage(nextPage),
                    }}
                  />
                </>
              ),
            },
          ]}
        />
      </Drawer>

      <FormDrawer
        title={editing ? '修改打卡记录' : '健管师代录打卡'} open={checkinOpen}
        onClose={() => setCheckinOpen(false)} onSubmit={saveCheckin} confirmLoading={saving} width={640}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="intervention_id" label="干预" rules={[{ required: true, message: '请选择干预' }]}>
            <Select
              showSearch optionFilterProp="label" options={interventionOptions} disabled={editing != null}
              onChange={() => form.setFieldsValue({ field_value: undefined, value_text: undefined })}
            />
          </Form.Item>
          {selectedIntervention?.field_type === 1 && (
            <Form.Item name="field_value" label={`数值${selectedIntervention.field_unit ? `（${selectedIntervention.field_unit}）` : ''}`} rules={[{ required: true, message: '请输入打卡数值' }]}>
              <InputNumber className="archive-full-width" />
            </Form.Item>
          )}
          {selectedIntervention?.field_type === 2 && (
            <Form.Item name="value_text" label="文本内容" rules={[{ required: true, whitespace: true, message: '请输入打卡内容' }]}><Input.TextArea rows={4} /></Form.Item>
          )}
          {selectedIntervention?.field_type === 3 && (
            <Form.Item name="value_text" label="完成情况" rules={[{ required: true, message: '请选择完成情况' }]}>
              <Select options={[{ value: 'true', label: '是' }, { value: 'false', label: '否' }]} />
            </Form.Item>
          )}
          {selectedIntervention?.field_type === 4 && (
            <Form.Item name="value_text" label="枚举值" rules={[{ required: true, message: '请选择打卡值' }]}>
              <Select options={optionsFromJson(selectedIntervention.option_json)} />
            </Form.Item>
          )}
          {selectedIntervention?.field_type === 5 && (
            <Form.Item name="value_text" label="多选值" rules={[{ required: true, message: '请选择打卡值' }]}>
              <Select mode="multiple" options={optionsFromJson(selectedIntervention.option_json)} />
            </Form.Item>
          )}
          <Form.Item name="is_abnormal" label="结果标记">
            <Select allowClear placeholder="未标记" options={[{ value: 1, label: '异常' }, { value: 2, label: '正常' }]} />
          </Form.Item>
        </Form>
      </FormDrawer>
    </>
  )
}
