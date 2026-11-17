/** 健康方案列表、目标/干预编辑、两轮审核、中止与详情。 */
import { useCallback, useEffect, useState } from 'react'
import {
  Alert, App, Button, Card, Descriptions, Drawer, Form, Input, Modal,
  Popconfirm, Radio, Select, Space, Spin, Table, Tabs, Tag,
} from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'
import { planApi } from '@/api'
import FormDrawer from '@/components/FormDrawer'
import type {
  HealthPlan, HealthPlanDetail, HealthPlanGoal, HealthPlanIntervention,
  HealthPlanReview, HealthPlanStatus,
} from '@/api/modules/plan'
import { DataView, display, formatTimestamp, pick } from './shared'
import PlanCheckins from './plan-checkins'

const PAGE_SIZE = 10
const STATUS_META: Record<number, { label: string; color: string }> = {
  1: { label: '草稿', color: 'default' },
  2: { label: '健管师通过', color: 'processing' },
  3: { label: '医生确认', color: 'success' },
  9: { label: '已中止', color: 'error' },
}

interface EditorValues { goals: string; interventions: string }

function planTitle(plan?: HealthPlan) {
  return display(pick(plan ?? {}, ['plan_name', 'name', 'title']) ?? (plan ? `方案 #${plan.id}` : '-'))
}

function planDate(value: unknown) {
  return typeof value === 'number' && value > 0 ? dayjs(value * 1000).format('YYYY-MM-DD') : display(value)
}

function statusTag(status?: number) {
  const meta = STATUS_META[status ?? 0]
  return <Tag color={meta?.color}>{meta?.label ?? display(status)}</Tag>
}

function detailParts(detail?: HealthPlanDetail) {
  const plan = (detail?.plan ?? detail ?? {}) as HealthPlan
  const goals = detail?.goals ?? plan.goals ?? []
  const interventions = detail?.interventions ?? plan.interventions ?? []
  const reviews = detail?.reviews ?? detail?.review_history ?? detail?.review_logs
    ?? (plan.reviews as HealthPlanReview[] | undefined) ?? []
  return { plan, goals, interventions, reviews }
}

function parseArray(text: string): HealthPlanGoal[] | HealthPlanIntervention[] {
  const parsed: unknown = JSON.parse(text)
  if (!Array.isArray(parsed)) throw new Error('必须是 JSON 数组')
  return parsed
}

const validateArray = (_: unknown, value: string) => {
  try { parseArray(value || '[]'); return Promise.resolve() } catch { return Promise.reject(new Error('请输入有效的 JSON 数组')) }
}

export default function HealthPlansPanel({ memberId }: { memberId: string }) {
  const { message } = App.useApp()
  const [editorForm] = Form.useForm<EditorValues>()
  const [list, setList] = useState<HealthPlan[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [filters, setFilters] = useState<{ status?: HealthPlanStatus }>({})
  const [applied, setApplied] = useState<{ status?: HealthPlanStatus }>({})
  const [editorOpen, setEditorOpen] = useState(false)
  const [editorPlan, setEditorPlan] = useState<HealthPlan>()
  const [editorLoading, setEditorLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [detailOpen, setDetailOpen] = useState(false)
  const [detailLoading, setDetailLoading] = useState(false)
  const [detail, setDetail] = useState<HealthPlanDetail>()
  const [reviewPlan, setReviewPlan] = useState<HealthPlan>()
  const [reviewPass, setReviewPass] = useState(true)
  const [reviewing, setReviewing] = useState(false)
  const [actingId, setActingId] = useState<HealthPlan['id']>()
  const [checkinPlan, setCheckinPlan] = useState<HealthPlan>()

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const result = await planApi.getHealthPlans(memberId, {
        page, page_size: PAGE_SIZE, status: applied.status,
      })
      setList(result.list ?? [])
      setTotal(result.total ?? 0)
    } catch { /* 拦截器统一提示 */ } finally { setLoading(false) }
  }, [memberId, page, applied])

  useEffect(() => { void load() }, [load])

  const openCreate = () => {
    setEditorPlan(undefined)
    editorForm.setFieldsValue({ goals: '[]', interventions: '[]' })
    setEditorOpen(true)
  }

  const openEdit = async (row: HealthPlan) => {
    setEditorPlan(row)
    setEditorOpen(true)
    setEditorLoading(true)
    try {
      const result = await planApi.getHealthPlanDetail(row.id)
      const parts = detailParts(result)
      editorForm.setFieldsValue({
        goals: JSON.stringify(parts.goals, null, 2),
        interventions: JSON.stringify(parts.interventions, null, 2),
      })
    } catch { setEditorOpen(false) } finally { setEditorLoading(false) }
  }

  const save = async () => {
    const values = await editorForm.validateFields()
    const payload = {
      goals: parseArray(values.goals) as HealthPlanGoal[],
      interventions: parseArray(values.interventions) as HealthPlanIntervention[],
    }
    setSaving(true)
    try {
      if (editorPlan) await planApi.updateHealthPlan(editorPlan.id, payload)
      else await planApi.createHealthPlan(memberId, payload)
      message.success(editorPlan ? '健康方案已更新' : '健康方案草稿已创建')
      setEditorOpen(false)
      editorForm.resetFields()
      await load()
    } catch { /* 保留输入 */ } finally { setSaving(false) }
  }

  const openDetail = async (row: HealthPlan) => {
    setDetailOpen(true)
    setDetail(undefined)
    setDetailLoading(true)
    try { setDetail(await planApi.getHealthPlanDetail(row.id)) }
    catch { setDetailOpen(false) }
    finally { setDetailLoading(false) }
  }

  const review = async () => {
    if (!reviewPlan) return
    setReviewing(true)
    try {
      await planApi.reviewHealthPlan(reviewPlan.id, { pass: reviewPass })
      message.success(reviewPass ? '方案审核已通过' : '方案已驳回')
      setReviewPlan(undefined)
      await load()
    } catch { /* 拦截器统一提示 */ } finally { setReviewing(false) }
  }

  const abandon = async (row: HealthPlan) => {
    setActingId(row.id)
    try {
      await planApi.abandonHealthPlan(row.id)
      message.success('健康方案已中止')
      await load()
    } catch { /* 拦截器统一提示 */ } finally { setActingId(undefined) }
  }

  const parts = detailParts(detail)
  const planInfo = Object.fromEntries(Object.entries(parts.plan).filter(([key]) => (
    !['goals', 'interventions', 'reviews', 'review_history', 'review_logs'].includes(key)
  )))

  return (
    <>
      <Card
        className="archive-panel-card" title="健康方案"
        extra={<Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>新建健康方案</Button>}
      >
        <div className="archive-inline-filter">
          <Select
            allowClear placeholder="全部方案状态" value={filters.status}
            options={Object.entries(STATUS_META).map(([value, meta]) => ({ value: Number(value), label: meta.label }))}
            onChange={(value) => setFilters({ status: value })}
          />
          <Button onClick={() => { setFilters({}); setApplied({}); setPage(1) }}>重置</Button>
          <Button type="primary" onClick={() => { setApplied({ ...filters }); setPage(1) }}>查询</Button>
        </div>
        <div className="archive-table-scroll">
          <Table<HealthPlan>
            rowKey={(row) => String(row.id)} size="small" loading={loading}
            dataSource={list} scroll={{ x: 1220, y: '100%' }}
            columns={[
              {
                title: '方案', key: 'title', width: 220,
                render: (_, row) => <div className="archive-primary-cell"><strong>{planTitle(row)}</strong><span>ID：{display(row.id)}</span></div>,
              },
              { title: '状态', dataIndex: 'status', width: 130, render: statusTag },
              {
                title: '目标 / 干预', key: 'counts', width: 120,
                render: (_, row) => `${row.goal_count ?? row.goals?.length ?? '-'} / ${row.intervention_count ?? row.interventions?.length ?? '-'}`,
              },
              {
                title: '方案周期', key: 'period', width: 220,
                render: (_, row) => `${planDate(row.start_date)} 至 ${planDate(row.end_date)}`,
              },
              { title: '创建时间', dataIndex: 'created_at', width: 170, render: formatTimestamp },
              {
                title: '操作', key: 'action', width: 390, fixed: 'right',
                render: (_, row) => (
                  <Space size={4} wrap>
                    <Button size="small" onClick={() => void openDetail(row)}>详情</Button>
                    {(row.status === 1 || row.status === 2) && <Button size="small" onClick={() => void openEdit(row)}>编辑</Button>}
                    {(row.status === 1 || row.status === 2) && <Button size="small" type="primary" onClick={() => { setReviewPass(true); setReviewPlan(row) }}>审核</Button>}
                    <Button size="small" onClick={() => setCheckinPlan(row)}>打卡管理</Button>
                    {row.status !== 9 && (
                      <Popconfirm title="确认中止该健康方案？" description="中止后方案进入终态，不可继续编辑。" onConfirm={() => abandon(row)}>
                        <Button size="small" danger loading={actingId === row.id}>中止</Button>
                      </Popconfirm>
                    )}
                  </Space>
                ),
              },
            ]}
            pagination={{
              current: page, pageSize: PAGE_SIZE, total,
              showTotal: (value) => `共 ${value} 条`,
              onChange: (nextPage) => setPage(nextPage),
            }}
          />
        </div>
      </Card>

      <FormDrawer
        title={editorPlan ? `编辑健康方案 · ${planTitle(editorPlan)}` : '新建健康方案'}
        open={editorOpen} onClose={() => setEditorOpen(false)} onSubmit={save}
        confirmLoading={saving} width={760}
      >
        <Spin spinning={editorLoading}>
          <Alert
            type="info" showIcon className="plan-editor-alert"
            message={editorPlan ? '仅草稿、健管师通过状态可编辑；保存会覆盖目标与干预。' : '创建后生成草稿方案，等待健管师提交审核。'}
          />
          <Form form={editorForm} layout="vertical">
            <Form.Item
              name="goals" label="健康目标（goals JSON 数组）"
              extra="接口文档仅声明目标数组，具体目标字段以后端模型为准。"
              rules={[{ required: true }, { validator: validateArray }]}
            >
              <Input.TextArea rows={10} className="archive-code-input" />
            </Form.Item>
            <Form.Item
              name="interventions" label="干预措施（interventions JSON 数组）"
              extra="打卡频率使用 checkin_freq_type / checkin_freq_value 等后端字段。"
              rules={[{ required: true }, { validator: validateArray }]}
            >
              <Input.TextArea rows={12} className="archive-code-input" />
            </Form.Item>
          </Form>
        </Spin>
      </FormDrawer>

      <Drawer
        title={detail ? `健康方案 · ${planTitle(parts.plan)}` : '健康方案详情'}
        width={920} open={detailOpen} onClose={() => setDetailOpen(false)}
        className="plan-detail-drawer" extra={detail ? statusTag(parts.plan.status) : undefined}
      >
        <Spin spinning={detailLoading}>
          {detail && (
            <>
              <Descriptions size="small" bordered column={{ xs: 1, sm: 3 }} className="plan-detail-summary">
                <Descriptions.Item label="方案 ID">{display(parts.plan.id)}</Descriptions.Item>
                <Descriptions.Item label="会员 ID">{display(parts.plan.member_id)}</Descriptions.Item>
                <Descriptions.Item label="方案周期">{planDate(parts.plan.start_date)} 至 {planDate(parts.plan.end_date)}</Descriptions.Item>
              </Descriptions>
              <Tabs
                items={[
                  { key: 'info', label: '方案信息', children: <DataView value={planInfo} /> },
                  { key: 'goals', label: `健康目标（${parts.goals.length}）`, children: <DataView value={parts.goals} /> },
                  { key: 'interventions', label: `干预措施（${parts.interventions.length}）`, children: <DataView value={parts.interventions} /> },
                  { key: 'reviews', label: `审核履历（${parts.reviews.length}）`, children: <DataView value={parts.reviews} /> },
                ]}
              />
            </>
          )}
        </Spin>
      </Drawer>

      <Modal
        title={`方案审核 · ${reviewPlan ? planTitle(reviewPlan) : ''}`}
        open={reviewPlan != null} onCancel={() => setReviewPlan(undefined)}
        onOk={review} confirmLoading={reviewing} okText="提交审核" destroyOnHidden
      >
        <Alert
          type="info" showIcon className="plan-review-alert"
          message={reviewPlan?.status === 1 ? '当前为健管师审核环节，通过后进入医生确认。' : '当前为医生确认环节，通过后方案定稿。'}
          description="审核角色由登录人自动判定；驳回后保持原审核状态。"
        />
        <Radio.Group value={reviewPass} onChange={(event) => setReviewPass(event.target.value as boolean)}>
          <Radio value>通过</Radio>
          <Radio value={false}>驳回</Radio>
        </Radio.Group>
      </Modal>

      <PlanCheckins plan={checkinPlan} onClose={() => setCheckinPlan(undefined)} />
    </>
  )
}
