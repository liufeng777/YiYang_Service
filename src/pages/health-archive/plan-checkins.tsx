/** 健康方案打卡统计、应打卡清单、历史与健管师代录。 */
import { useCallback, useEffect, useState } from 'react'
import {
  App, Button, DatePicker, Drawer, Form, Input, InputNumber,
  Space, Spin, Table, Tabs,
} from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import type { Dayjs } from 'dayjs'
import { planApi } from '@/api'
import FormDrawer from '@/components/FormDrawer'
import type { HealthPlan, HealthPlanCheckin } from '@/api/modules/plan'
import { DataView, display, formatTimestamp, parseObject } from './shared'

const PAGE_SIZE = 10
type DateRange = [Dayjs, Dayjs]

export default function PlanCheckins({ plan, onClose }: {
  plan?: HealthPlan
  onClose: () => void
}) {
  const { message } = App.useApp()
  const [form] = Form.useForm<{ items: string }>()
  const [range, setRange] = useState<DateRange | null>(null)
  const [interventionId, setInterventionId] = useState<number>()
  const [stats, setStats] = useState<unknown>()
  const [due, setDue] = useState<unknown>()
  const [overviewLoading, setOverviewLoading] = useState(false)
  const [history, setHistory] = useState<HealthPlanCheckin[]>([])
  const [historyLoading, setHistoryLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [checkinOpen, setCheckinOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const planId = plan?.id

  const dateParams = () => range ? {
    start_date: range[0].format('YYYY-MM-DD'),
    end_date: range[1].format('YYYY-MM-DD'),
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
    setCheckinOpen(false)
    form.resetFields()
  }, [planId, form])

  useEffect(() => { if (planId) void loadOverview() }, [planId, loadOverview])
  useEffect(() => { if (planId) void loadHistory() }, [planId, loadHistory])

  const saveCheckin = async () => {
    if (!planId) return
    const values = await form.validateFields()
    setSaving(true)
    try {
      await planApi.createHealthPlanCheckin(planId, { items: parseObject(values.items) })
      message.success('打卡记录已保存')
      setCheckinOpen(false)
      form.resetFields()
      await Promise.all([loadOverview(), loadHistory()])
    } catch { /* 保留输入 */ } finally { setSaving(false) }
  }

  return (
    <>
      <Drawer
        title={plan ? `方案打卡 · ${plan.plan_name || plan.name || plan.title || `#${plan.id}`}` : '方案打卡'}
        width={1080} open={plan != null} onClose={onClose} className="plan-checkin-drawer"
        extra={<Button type="primary" icon={<PlusOutlined />} onClick={() => { form.setFieldValue('items', '{}'); setCheckinOpen(true) }}>代录打卡</Button>}
      >
        <div className="plan-checkin-toolbar">
          <Space wrap>
            <DatePicker.RangePicker
              value={range} allowClear
              onChange={(dates) => setRange(dates?.[0] && dates[1] ? [dates[0], dates[1]] : null)}
            />
            <Button type="primary" loading={overviewLoading} onClick={() => { void loadOverview(); void loadHistory() }}>查询</Button>
          </Space>
          <span>不选择日期时，统计与应打卡清单按方案起止日期计算。</span>
        </div>
        <Tabs
          items={[
            {
              key: 'stats', label: '打卡统计',
              children: <Spin spinning={overviewLoading}><DataView value={stats} /></Spin>,
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
                    <InputNumber
                      min={1} precision={0} placeholder="干预 ID" value={interventionId}
                      onChange={(value) => setInterventionId(value ?? undefined)}
                    />
                    <Button onClick={() => { setInterventionId(undefined); setPage(1) }}>重置</Button>
                    <Button type="primary" onClick={() => { setPage(1); void loadHistory() }}>查询历史</Button>
                  </div>
                  <Table<HealthPlanCheckin>
                    rowKey={(row) => String(row.id)} size="small" loading={historyLoading}
                    dataSource={history} scroll={{ x: 720 }}
                    columns={[
                      { title: '记录 ID', dataIndex: 'id', width: 110, render: display },
                      { title: '干预 ID', dataIndex: 'intervention_id', width: 110, render: display },
                      {
                        title: '打卡时间', key: 'checkin_time', width: 180,
                        render: (_, row) => formatTimestamp(row.checkin_time ?? row.created_at),
                      },
                      { title: '方案 ID', dataIndex: 'plan_id', width: 110, render: display },
                    ]}
                    expandable={{ expandedRowRender: (row) => <DataView value={row.items ?? row} /> }}
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
        title="健管师代录打卡" open={checkinOpen} onClose={() => setCheckinOpen(false)}
        onSubmit={saveCheckin} confirmLoading={saving} width={640}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="items" label="打卡内容（items JSON 对象）"
            extra="按干预字段填写本次打卡内容；plan_id 由路径自动携带。"
            rules={[
              { required: true, message: '请输入打卡内容' },
              { validator: (_, value: string) => { try { parseObject(value || '{}'); return Promise.resolve() } catch { return Promise.reject(new Error('请输入有效的 JSON 对象')) } } },
            ]}
          >
            <Input.TextArea rows={14} className="archive-code-input" />
          </Form.Item>
        </Form>
      </FormDrawer>
    </>
  )
}
