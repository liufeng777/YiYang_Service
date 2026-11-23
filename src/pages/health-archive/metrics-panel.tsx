/** 指标记录与指标趋势。 */
import { useCallback, useEffect, useState } from 'react'
import {
  App, Button, Card, DatePicker, Drawer, Form, Input,
  Select, Space, Spin, Table, Tag,
} from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import dayjs, { type Dayjs } from 'dayjs'
import { memberApi, metricApi } from '@/api'
import FormDrawer from '@/components/FormDrawer'
import type { MetricItem } from '@/api/modules/metric'
import type { ArchiveMetric } from '@/api/modules/health-archive'
import { display, formatTimestamp, toDayjs } from './Plan/shared'
import TrendResult, { parseTrendSeries, type TrendSeries } from './trend-chart'

interface MetricFilters { metric_code?: string; is_abnormal?: 1 | 2 }
interface MetricFormValues {
  metric_code: string
  metric_value: string
  measurement_time: Dayjs
  source?: string
}
type TrendRange = [Dayjs, Dayjs]

const TREND_LIMIT = 20
const TREND_PRESETS = [{ days: 7, label: '最近一周' }, { days: 30, label: '最近 30 天' }, { days: 90, label: '最近 90 天' }]
const recentDays = (days: number): TrendRange => [dayjs().subtract(days - 1, 'day').startOf('day'), dayjs().endOf('day')]

export default function MetricsPanel({ memberId }: { memberId: string }) {
  const { message } = App.useApp()
  const [form] = Form.useForm<MetricFormValues>()
  const [metrics, setMetrics] = useState<MetricItem[]>([])
  const [records, setRecords] = useState<ArchiveMetric[]>([])
  const [filters, setFilters] = useState<MetricFilters>({})
  const [applied, setApplied] = useState<MetricFilters>({})
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [total, setTotal] = useState(0)
  const [editing, setEditing] = useState<ArchiveMetric | null>(null)
  const [editorOpen, setEditorOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [trendLoading, setTrendLoading] = useState(false)
  const [trendVisible, setTrendVisible] = useState(false)
  const [trendSeries, setTrendSeries] = useState<TrendSeries[]>([])
  const [trendCodes, setTrendCodes] = useState<string[]>([])
  const [trendRange, setTrendRange] = useState<TrendRange>(() => recentDays(7))
  const [trendDays, setTrendDays] = useState<number | undefined>(7)

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

  const openEditor = (record?: ArchiveMetric) => {
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

  const queryTrend = async (codes = trendCodes, range = trendRange) => {
    if (codes.length === 0) {
      message.warning('请至少选择一个指标')
      return
    }
    setTrendLoading(true)
    try {
      const result = await memberApi.getMetricTrend(memberId, {
        metric_codes: codes.join(','),
        limit: TREND_LIMIT,
        start_ts: range[0].startOf('day').unix(),
        end_ts: range[1].endOf('day').unix(),
      })
      setTrendSeries(parseTrendSeries(result, metrics))
    } catch { /* 保留当前图表和查询条件 */ } finally { setTrendLoading(false) }
  }

  const openTrend = (metricCode?: string) => {
    const range = recentDays(7)
    const defaultCode = metricCode || applied.metric_code
    const codes = defaultCode ? [defaultCode] : []
    setTrendCodes(codes)
    setTrendRange(range)
    setTrendDays(7)
    setTrendSeries([])
    setTrendVisible(true)
    if (codes.length > 0) void queryTrend(codes, range)
  }

  const applyTrendRange = (days?: number, range?: TrendRange) => {
    const nextRange = range ?? recentDays(days ?? 7)
    setTrendDays(range ? undefined : days)
    setTrendRange(nextRange)
    if (trendCodes.length > 0) void queryTrend(trendCodes, nextRange)
  }

  const columns = [
    {
      title: '指标', key: 'metric_name',
      render: (_: unknown, row: ArchiveMetric) => (
        <div className="archive-primary-cell">
          <strong>{display(row.metric_name_cn ?? row.metric_name)}</strong>
          <span>{display(row.metric_code)}</span>
        </div>
      ),
    },
    {
      title: '测量值', key: 'metric_value',
      render: (_: unknown, row: ArchiveMetric) => {
        const unit = display(row.metric_unit ?? row.unit_symbol)
        return (
          <div className={`archive-metric-value${Number(row.is_abnormal) === 1 ? ' is-abnormal' : ''}`}>
            <strong>{display(row.metric_value)}</strong>
            {unit !== '-' && <span>{unit}</span>}
          </div>
        )
      },
    },
    {
      title: '标准值', key: 'metric_normal',
      render: (_: unknown, row: ArchiveMetric) => {
        return `[${row.ref_lower}, ${row.ref_upper}]`
      },
    },
    {
      title: '结果', dataIndex: 'is_abnormal', key: 'is_abnormal', width: 100,
      render: (value: unknown) => value == null ? '-' : <Tag color={Number(value) === 1 ? 'red' : 'green'}>{Number(value) === 1 ? '异常' : '正常'}</Tag>,
    },
    {
      title: '测量时间', dataIndex: 'measurement_time', key: 'measurement_time',
      render: (value: unknown) => formatTimestamp(value),
    },
    {
      title: '操作', key: 'action', width: 180,
      render: (_: unknown, row: ArchiveMetric) => (
        <Space>
          <Button size="small" onClick={() => openTrend(String(row.metric_code ?? ''))}>趋势与历史</Button>
          <Button size="small" onClick={() => openEditor(row)}>编辑</Button>
        </Space>
      ),
    },
  ]

  return (
    <>
      <Card
        title="指标记录" className="archive-panel-card"
        extra={(
          <Space wrap>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => openEditor()}>新增指标记录</Button>
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
        <div className="archive-table-scroll">
          <Table<ArchiveMetric>
            rowKey={'id'} size="small"
            columns={columns} dataSource={records} loading={loading} scroll={{ y: '100%' }}
            pagination={{
              current: page, pageSize, total, showSizeChanger: true,
              showTotal: (value) => `共 ${value} 条`,
              onChange: (nextPage, nextSize) => { setPage(nextPage); setPageSize(nextSize) },
            }}
          />
        </div>
      </Card>

      <FormDrawer
        title={editing ? '编辑指标记录' : '新增指标记录'} open={editorOpen}
        onClose={() => setEditorOpen(false)} onSubmit={save} confirmLoading={saving}
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
      </FormDrawer>

      <Drawer
        title="健康指标趋势" width={1040} open={trendVisible} onClose={() => setTrendVisible(false)}
        className="archive-trend-drawer"
      >
        <div className="archive-trend__toolbar">
          <div className="archive-trend__control">
            <DatePicker.RangePicker
              className="archive-full-width" value={trendRange} allowClear={false}
              presets={TREND_PRESETS.map((item) => ({ label: item.label, value: recentDays(item.days) }))}
              onChange={(dates) => {
                if (!dates?.[0] || !dates[1]) return
                applyTrendRange(undefined, [dates[0].startOf('day'), dates[1].endOf('day')])
              }}
            />
            <Button type="primary" disabled={!trendCodes.length} loading={trendLoading} onClick={() => queryTrend()}>查询趋势</Button>
          </div>
          
          <Space.Compact className="archive-trend__presets">
            {TREND_PRESETS.map((item) => (
              <Button
                key={item.days} size="small" type={trendDays === item.days ? 'primary' : 'default'}
                onClick={() => applyTrendRange(item.days)}
              >{item.label}</Button>
            ))}
          </Space.Compact>
        </div>
        <Spin spinning={trendLoading} wrapperClassName="archive-trend__loading">
          <TrendResult series={trendSeries} />
        </Spin>
      </Drawer>
    </>
  )
}
