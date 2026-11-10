/** 指标记录与指标趋势。 */
import { useCallback, useEffect, useState } from 'react'
import {
  App, Button, Card, DatePicker, Drawer, Form, Input, InputNumber, Modal,
  Select, Space, Table, Tag,
} from 'antd'
import type { Dayjs } from 'dayjs'
import { memberApi, metricApi } from '@/api'
import type { MetricItem } from '@/api/modules/metric'
import type { ArchiveData } from './shared'
import { display, formatTimestamp, JsonView, toDayjs } from './shared'

interface MetricFilters { metric_code?: string; is_abnormal?: 1 | 2 }
interface MetricFormValues {
  metric_code: string
  metric_value: string
  measurement_time: Dayjs
  source?: string
}
interface DrawerState { title: string; content: React.ReactNode }

export default function MetricsPanel({ memberId }: { memberId: string }) {
  const { message } = App.useApp()
  const [form] = Form.useForm<MetricFormValues>()
  const [trendForm] = Form.useForm()
  const [metrics, setMetrics] = useState<MetricItem[]>([])
  const [records, setRecords] = useState<ArchiveData[]>([])
  const [filters, setFilters] = useState<MetricFilters>({})
  const [applied, setApplied] = useState<MetricFilters>({})
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [total, setTotal] = useState(0)
  const [editing, setEditing] = useState<ArchiveData | null>(null)
  const [editorOpen, setEditorOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [trendOpen, setTrendOpen] = useState(false)
  const [trendLoading, setTrendLoading] = useState(false)
  const [drawer, setDrawer] = useState<DrawerState>()

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await memberApi.getMetricRecords(memberId, {
        page, page_size: pageSize, ...applied,
      })
      setRecords(res.list ?? [])
      setTotal(res.total ?? 0)
    } catch { /* 拦截器统一提示 */ } finally { setLoading(false) }
  }, [memberId, page, pageSize, applied])

  useEffect(() => { load() }, [load])
  useEffect(() => {
    metricApi.getMetrics({ page: 1, page_size: 200, status: 1 })
      .then((res) => setMetrics(res.list ?? []))
      .catch(() => undefined)
  }, [])

  const options = metrics.map((item) => ({
    value: item.metric_code,
    label: `${item.metric_name_cn}（${item.metric_code}）${item.metric_unit || item.unit_symbol || ''}`,
  }))

  const openEditor = (record?: ArchiveData) => {
    setEditing(record ?? null)
    form.setFieldsValue({
      metric_code: String(record?.metric_code ?? ''),
      metric_value: String(record?.metric_value ?? ''),
      measurement_time: toDayjs(record?.measurement_time) ?? undefined,
      source: record?.source == null ? undefined : String(record.source),
    })
    setEditorOpen(true)
  }

  const save = async () => {
    const values = await form.validateFields()
    setSaving(true)
    const data = {
      metric_code: values.metric_code,
      metric_value: values.metric_value,
      measurement_time: values.measurement_time.unix(),
      source: values.source || undefined,
    }
    try {
      if (editing?.id != null) {
        await memberApi.updateMetricRecord(memberId, editing.id as number, data)
      } else {
        await memberApi.createMetricRecord(memberId, data)
      }
      message.success('指标记录已保存')
      setEditorOpen(false)
      form.resetFields()
      await load()
    } catch { /* 保留输入 */ } finally { setSaving(false) }
  }

  const queryTrend = async () => {
    const values = await trendForm.validateFields()
    setTrendLoading(true)
    try {
      const range = values.range as [Dayjs, Dayjs] | undefined
      const result = await memberApi.getMetricTrend(memberId, {
        metric_codes: (values.metric_codes as string[]).join(','),
        limit: values.limit,
        start_ts: range?.[0]?.startOf('day').unix(),
        end_ts: range?.[1]?.endOf('day').unix(),
      })
      setTrendOpen(false)
      setDrawer({ title: '健康指标趋势', content: <JsonView value={result} /> })
    } catch { /* 保留查询条件 */ } finally { setTrendLoading(false) }
  }

  const columns = [
    { title: '指标编码', dataIndex: 'metric_code', key: 'metric_code' },
    {
      title: '指标名称', key: 'metric_name',
      render: (_: unknown, row: ArchiveData) => display(row.metric_name_cn ?? row.metric_name),
    },
    {
      title: '测量值', key: 'metric_value',
      render: (_: unknown, row: ArchiveData) => `${display(row.metric_value)} ${display(row.metric_unit ?? row.unit_symbol) === '-' ? '' : display(row.metric_unit ?? row.unit_symbol)}`,
    },
    {
      title: '测量时间', dataIndex: 'measurement_time', key: 'measurement_time',
      render: (value: unknown) => formatTimestamp(value),
    },
    {
      title: '结果', dataIndex: 'is_abnormal', key: 'is_abnormal',
      render: (value: unknown) => value == null ? '-' : <Tag color={Number(value) === 1 ? 'red' : 'green'}>{Number(value) === 1 ? '异常' : '正常'}</Tag>,
    },
    { title: '来源', dataIndex: 'source_name', key: 'source_name', render: display },
    {
      title: '操作', key: 'action', width: 90, fixed: 'right' as const,
      render: (_: unknown, row: ArchiveData) => <Button size="small" onClick={() => openEditor(row)}>编辑</Button>,
    },
  ]

  return (
    <>
      <Card
        title="指标记录"
        extra={(
          <Space wrap>
            <Button onClick={() => setTrendOpen(true)}>趋势查询</Button>
            <Button type="primary" onClick={() => openEditor()}>新增指标记录</Button>
          </Space>
        )}
      >
        <div className="archive-inline-filter">
          <Select
            showSearch optionFilterProp="label" allowClear placeholder="全部指标"
            value={filters.metric_code} options={options}
            onChange={(value) => setFilters((prev) => ({ ...prev, metric_code: value }))}
          />
          <Select
            allowClear placeholder="全部结果" value={filters.is_abnormal}
            options={[{ value: 1, label: '异常' }, { value: 2, label: '正常' }]}
            onChange={(value) => setFilters((prev) => ({ ...prev, is_abnormal: value }))}
          />
          <Button onClick={() => { setFilters({}); setApplied({}); setPage(1) }}>重置</Button>
          <Button type="primary" onClick={() => { setApplied({ ...filters }); setPage(1) }}>查询</Button>
        </div>
        <Table<ArchiveData>
          rowKey={(row) => String(row.id ?? JSON.stringify(row))}
          columns={columns} dataSource={records} loading={loading} scroll={{ x: 1050 }}
          pagination={{
            current: page, pageSize, total, showSizeChanger: true,
            showTotal: (value) => `共 ${value} 条`,
            onChange: (nextPage, nextSize) => { setPage(nextPage); setPageSize(nextSize) },
          }}
        />
      </Card>

      <Modal
        title={editing ? '编辑指标记录' : '新增指标记录'} open={editorOpen}
        onCancel={() => setEditorOpen(false)} onOk={save} confirmLoading={saving} destroyOnHidden
      >
        <Form form={form} layout="vertical">
          <Form.Item name="metric_code" label="指标" rules={[{ required: true, message: '请选择指标' }]}>
            <Select showSearch optionFilterProp="label" options={options} disabled={editing != null} />
          </Form.Item>
          <Form.Item name="metric_value" label="测量值" rules={[{ required: true, whitespace: true, message: '请输入测量值' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="measurement_time" label="测量时间" rules={[{ required: true, message: '请选择测量时间' }]}>
            <DatePicker showTime className="archive-full-width" />
          </Form.Item>
          <Form.Item name="source" label="来源"><Input /></Form.Item>
        </Form>
      </Modal>

      <Modal
        title="健康指标趋势查询" open={trendOpen} onCancel={() => setTrendOpen(false)}
        onOk={queryTrend} confirmLoading={trendLoading} destroyOnHidden
      >
        <Form form={trendForm} layout="vertical" initialValues={{ limit: 30 }}>
          <Form.Item name="metric_codes" label="指标（可多选）" rules={[{ required: true, message: '请至少选择一个指标' }]}>
            <Select mode="multiple" showSearch optionFilterProp="label" options={options} />
          </Form.Item>
          <Form.Item name="range" label="测量时间范围"><DatePicker.RangePicker className="archive-full-width" /></Form.Item>
          <Form.Item name="limit" label="每个指标返回条数"><InputNumber min={1} max={200} precision={0} /></Form.Item>
        </Form>
      </Modal>

      <Drawer title={drawer?.title} width={680} open={drawer != null} onClose={() => setDrawer(undefined)}>
        {drawer?.content}
      </Drawer>
    </>
  )
}
