/** 健康目标、目标指标项、AI 方案及方案确认/放弃。 */
import { useCallback, useEffect, useState } from 'react'
import {
  App, Button, Card, Drawer, Form, Input, Popconfirm, Space, Table, Tabs, Tag,
} from 'antd'
import { memberApi, planApi } from '@/api'
import FormDrawer from '@/components/FormDrawer'
import type { ArchiveData } from './shared'
import { display, formatTimestamp, DataView, parseObject, pick } from './shared'

interface ListState { list: ArchiveData[]; total: number; page: number }
const PAGE_SIZE = 10

const validateObject = (_: unknown, value: string) => {
  try { parseObject(value || '{}'); return Promise.resolve() } catch { return Promise.reject(new Error('请输入有效的 JSON 对象')) }
}

function rowTitle(row: ArchiveData) {
  return display(pick(row, ['name', 'title', 'goal_name', 'plan_name', 'remark', 'description']))
}

function commonColumns(onItems?: (row: ArchiveData) => void) {
  return [
    {
      title: '名称 / 描述', key: 'title',
      render: (_: unknown, row: ArchiveData) => (
        <div className="archive-primary-cell"><strong>{rowTitle(row)}</strong><span>ID：{display(row.id)}</span></div>
      ),
    },
    {
      title: '状态', dataIndex: 'status', key: 'status', width: 120,
      render: (value: unknown) => value == null ? '-' : <Tag>{display(value)}</Tag>,
    },
    { title: '创建时间', dataIndex: 'created_at', key: 'created_at', width: 180, render: formatTimestamp },
    ...(onItems ? [{
      title: '操作', key: 'action', width: 130,
      render: (_: unknown, row: ArchiveData) => <Button size="small" onClick={() => onItems(row)}>维护指标项</Button>,
    }] : []),
  ]
}

function GoalsPanel({ memberId }: { memberId: string }) {
  const { message } = App.useApp()
  const [form] = Form.useForm()
  const [state, setState] = useState<ListState>({ list: [], total: 0, page: 1 })
  const [loading, setLoading] = useState(false)
  const [createOpen, setCreateOpen] = useState(false)
  const [itemsGoal, setItemsGoal] = useState<ArchiveData>()
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await memberApi.getHealthGoals(memberId, { page: state.page, page_size: PAGE_SIZE })
      setState((prev) => ({ ...prev, list: res.list ?? [], total: res.total ?? 0 }))
    } catch { /* 拦截器统一提示 */ } finally { setLoading(false) }
  }, [memberId, state.page])

  useEffect(() => { load() }, [load])

  const create = async () => {
    const values = await form.validateFields()
    setSaving(true)
    try {
      await memberApi.createHealthGoal(memberId, parseObject(values.payload))
      message.success('健康目标已创建')
      setCreateOpen(false)
      form.resetFields()
      await load()
    } catch { /* 保留输入 */ } finally { setSaving(false) }
  }

  const updateItems = async () => {
    if (!itemsGoal?.id) return
    const values = await form.validateFields()
    setSaving(true)
    try {
      await planApi.updateHealthGoalItems(itemsGoal.id as number, parseObject(values.payload))
      message.success('目标指标项已更新')
      setItemsGoal(undefined)
      form.resetFields()
      await load()
    } catch { /* 保留输入 */ } finally { setSaving(false) }
  }

  return (
    <Card className="archive-table-card" title="健康目标" extra={<Button type="primary" onClick={() => { form.setFieldValue('payload', '{}'); setCreateOpen(true) }}>新增健康目标</Button>}>
      <div className="archive-table-scroll">
        <Table<ArchiveData>
          size="small"
          rowKey={(row) => String(row.id ?? JSON.stringify(row))}
          columns={commonColumns(setItemsGoal)} dataSource={state.list} loading={loading} scroll={{ x: 900, y: '100%' }}
          expandable={{ expandedRowRender: (row) => <DataView value={row} /> }}
          pagination={{
            current: state.page, pageSize: PAGE_SIZE, total: state.total,
            showTotal: (value) => `共 ${value} 条`, onChange: (page) => setState((prev) => ({ ...prev, page })),
          }}
        />
      </div>
      <FormDrawer
        title="新增健康目标" open={createOpen} onClose={() => setCreateOpen(false)}
        onSubmit={create} confirmLoading={saving} width={640}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="payload" label="目标信息（JSON 对象）"
            extra="Swagger 未定义具体字段，请按后端目标模型填写。"
            rules={[{ required: true }, { validator: validateObject }]}
          >
            <Input.TextArea rows={10} className="archive-code-input" />
          </Form.Item>
        </Form>
      </FormDrawer>
      <FormDrawer
        title={`维护目标指标项 #${display(itemsGoal?.id)}`} open={itemsGoal != null}
        onClose={() => setItemsGoal(undefined)} onSubmit={updateItems} confirmLoading={saving} width={640}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="payload" label="目标指标项（JSON 对象）"
            extra="Swagger 未定义具体字段，请按后端目标指标项模型填写。"
            rules={[{ required: true }, { validator: validateObject }]}
          >
            <Input.TextArea rows={10} className="archive-code-input" />
          </Form.Item>
        </Form>
      </FormDrawer>
    </Card>
  )
}

function PlansPanel({ memberId }: { memberId: string }) {
  const { message } = App.useApp()
  const [form] = Form.useForm()
  const [state, setState] = useState<ListState>({ list: [], total: 0, page: 1 })
  const [loading, setLoading] = useState(false)
  const [generateOpen, setGenerateOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [actingId, setActingId] = useState<unknown>()
  const [detail, setDetail] = useState<unknown>()
  const [detailOpen, setDetailOpen] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await memberApi.getHealthPlans(memberId, { page: state.page, page_size: PAGE_SIZE })
      setState((prev) => ({ ...prev, list: res.list ?? [], total: res.total ?? 0 }))
    } catch { /* 拦截器统一提示 */ } finally { setLoading(false) }
  }, [memberId, state.page])

  useEffect(() => { load() }, [load])

  const generate = async () => {
    const values = await form.validateFields()
    setSaving(true)
    try {
      const result = await memberApi.generateHealthPlan(memberId, parseObject(values.payload))
      message.success('AI 健康方案草稿已生成')
      setGenerateOpen(false)
      form.resetFields()
      setDetail(result)
      setDetailOpen(true)
      await load()
    } catch { /* 保留输入 */ } finally { setSaving(false) }
  }

  const openDetail = async (row: ArchiveData) => {
    if (row.id == null) return
    setDetailOpen(true)
    setDetail(undefined)
    try { setDetail(await planApi.getHealthPlanDetail(row.id as number)) } catch { setDetailOpen(false) }
  }

  const act = async (row: ArchiveData, type: 'confirm' | 'abandon') => {
    if (row.id == null) return
    setActingId(row.id)
    try {
      if (type === 'confirm') await planApi.confirmHealthPlan(row.id as number)
      else await planApi.abandonHealthPlan(row.id as number)
      message.success(type === 'confirm' ? '健康方案已确认' : '健康方案已放弃')
      await load()
    } catch { /* 拦截器统一提示 */ } finally { setActingId(undefined) }
  }

  return (
    <Card className="archive-table-card" title="健康方案" extra={<Button type="primary" onClick={() => { form.setFieldValue('payload', '{}'); setGenerateOpen(true) }}>AI 生成方案</Button>}>
      <div className="archive-table-scroll">
        <Table<ArchiveData>
          size="small"
          rowKey={(row) => String(row.id ?? JSON.stringify(row))}
          dataSource={state.list} loading={loading} scroll={{ x: 900, y: '100%' }}
          columns={[
            ...commonColumns(),
            {
              title: '操作', key: 'action', width: 240, fixed: 'right' as const,
              render: (_: unknown, row: ArchiveData) => (
                <Space>
                  <Button size="small" onClick={() => openDetail(row)}>详情</Button>
                  <Popconfirm title="确认采用该健康方案？" onConfirm={() => act(row, 'confirm')}>
                    <Button size="small" type="primary" loading={actingId === row.id}>确认</Button>
                  </Popconfirm>
                  <Popconfirm title="确认放弃该健康方案？" onConfirm={() => act(row, 'abandon')}>
                    <Button size="small" danger loading={actingId === row.id}>放弃</Button>
                  </Popconfirm>
                </Space>
              ),
            },
          ]}
          pagination={{
            current: state.page, pageSize: PAGE_SIZE, total: state.total,
            showTotal: (value) => `共 ${value} 条`, onChange: (page) => setState((prev) => ({ ...prev, page })),
          }}
        />
      </div>
      <FormDrawer
        title="AI 生成健康方案" open={generateOpen} onClose={() => setGenerateOpen(false)}
        onSubmit={generate} confirmLoading={saving} width={640} okText="生成方案"
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="payload" label="方案信息（JSON 对象）"
            extra="Swagger 未定义具体字段；后端将结合会员档案生成草稿。"
            rules={[{ required: true }, { validator: validateObject }]}
          >
            <Input.TextArea rows={10} className="archive-code-input" />
          </Form.Item>
        </Form>
      </FormDrawer>
      <Drawer title="健康方案详情" width={680} open={detailOpen} onClose={() => setDetailOpen(false)}>
        <DataView value={detail} />
      </Drawer>
    </Card>
  )
}

export default function HealthPlansPanel({ memberId }: { memberId: string }) {
  return (
    <Tabs tabPosition="top" className="archive-secondary-tabs" items={[
      { key: 'goals', label: '健康目标', children: <GoalsPanel memberId={memberId} /> },
      { key: 'plans', label: '健康方案', children: <PlansPanel memberId={memberId} /> },
    ]} />
  )
}
