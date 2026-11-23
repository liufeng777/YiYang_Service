/** 健康方案列表、结构化详情、AI 草稿、两轮审核与中止。 */
import { useCallback, useEffect, useState } from 'react'
import {
  Alert, App, Button, Card, Descriptions, Drawer, Form, Input, Modal,
  Popconfirm, Radio, Select, Space, Spin, Table, Tabs, Tag, Timeline,
} from 'antd'
import { PlusOutlined, RobotOutlined } from '@ant-design/icons'
import { planApi } from '@/api'
import SensitiveText from '@/components/SensitiveText'
import type {
  HealthPlan, HealthPlanDetail, HealthPlanDraft, HealthPlanStatus,
} from '@/api/modules/plan'
import { display, formatTimestamp } from './shared'
import {
  detailParts, executionText, FIELD_TYPE_META, frequencyText, goalCategoryTag,
  interventionLabel, PLAN_STATUS_META, planDate, planStatusTag, planTypeText,
  planTitle, reviewActionTag, reviewRoleText,
} from './plan-shared'
import PlanEditor from './plan-editor'
import PlanAiDraft from './plan-ai-draft'
import PlanCheckins from './plan-checkins'

const PAGE_SIZE = 10

export default function HealthPlansPanel({ memberId }: { memberId: string }) {
  const { message } = App.useApp()
  const [reviewForm] = Form.useForm<{ remark?: string }>()
  const [list, setList] = useState<HealthPlan[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [filters, setFilters] = useState<{ status?: HealthPlanStatus }>({})
  const [applied, setApplied] = useState<{ status?: HealthPlanStatus }>({})
  const [editorOpen, setEditorOpen] = useState(false)
  const [editorPlan, setEditorPlan] = useState<HealthPlan>()
  const [editorDraft, setEditorDraft] = useState<HealthPlanDraft>()
  const [aiOpen, setAiOpen] = useState(false)
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
    setEditorDraft(undefined)
    setEditorOpen(true)
  }

  const closeEditor = () => {
    setEditorOpen(false)
    setEditorPlan(undefined)
    setEditorDraft(undefined)
  }

  const openDetail = async (row: HealthPlan) => {
    setDetailOpen(true)
    setDetail(undefined)
    setDetailLoading(true)
    try { setDetail(await planApi.getHealthPlanDetail(row.id)) }
    catch { setDetailOpen(false) }
    finally { setDetailLoading(false) }
  }

  const openReview = (row: HealthPlan) => {
    setReviewPass(true)
    reviewForm.resetFields()
    setReviewPlan(row)
  }

  const review = async () => {
    if (!reviewPlan) return
    const values = await reviewForm.validateFields()
    setReviewing(true)
    try {
      await planApi.reviewHealthPlan(reviewPlan.id, { pass: reviewPlan.status === 1 ? true : reviewPass, remark: values.remark || undefined })
      message.success(reviewPlan.status === 1 ? '方案已提交医生确认' : reviewPass ? '方案已由医生确认定稿' : '方案已驳回并退回草稿')
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
  const execution = executionText(parts.plan)

  return (
    <>
      <Card
        className="archive-panel-card" title="健康方案"
        extra={(
          <Space wrap>
            <Button icon={<RobotOutlined />} onClick={() => setAiOpen(true)}>AI 生成草稿</Button>
            <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>新建健康方案</Button>
          </Space>
        )}
      >
        <div className="archive-inline-filter">
          <Select
            allowClear placeholder="全部方案状态" value={filters.status}
            options={Object.entries(PLAN_STATUS_META).map(([value, meta]) => ({ value: Number(value), label: meta.label }))}
            onChange={(value) => setFilters({ status: value })}
          />
          <Button onClick={() => { setFilters({}); setApplied({}); setPage(1) }}>重置</Button>
          <Button type="primary" onClick={() => { setApplied({ ...filters }); setPage(1) }}>查询</Button>
        </div>
        <div className="archive-table-scroll">
          <Table<HealthPlan>
            rowKey={(row) => String(row.id)} size="small" loading={loading}
            dataSource={list} scroll={{ x: 1400, y: '100%' }}
            columns={[
              {
                title: '方案',
                key: 'plan_name',
                dataIndex: 'plan_name',
                width: 160,
                render: (_, row) => planTitle(row),
              },
              {
                title: '状态', key: 'status', width: 140,
                render: (_, row) => <Space size={4}>{planStatusTag(row.status)}{executionText(row) && <Tag color="cyan">{executionText(row)}</Tag>}</Space>,
              },
              { title: '执行周期', dataIndex: 'duration_days', width: 110, render: (value) => value ? `${value} 天` : '-' },
              {
                title: '方案周期', key: 'period', width: 210,
                render: (_, row) => `${planDate(row.start_date)} 至 ${planDate(row.end_date)}`,
              },
              {
                title: '创建人 / 确认人', key: 'operators', width: 150,
                render: (_, row) => (
                  <div className="archive-primary-cell">
                    <strong><SensitiveText type="name" value={row.created_by_name} /></strong>
                    <span>确认：<SensitiveText type="name" value={row.confirmed_by_name} /></span>
                  </div>
                ),
              },
              { title: '创建时间', dataIndex: 'created_at', width: 160, render: formatTimestamp },
              {
                title: '操作', key: 'action', width: 250, fixed: 'right',
                render: (_, row) => (
                  <Space>
                    <Button size="small" onClick={() => void openDetail(row)}>详情</Button>
                    {(row.status === 1 || row.status === 2) && <Button size="small" onClick={() => { setEditorDraft(undefined); setEditorPlan(row); setEditorOpen(true) }}>编辑</Button>}
                    {(row.status === 1 || row.status === 2) && <Button size="small" type="primary" onClick={() => openReview(row)}>{row.status === 1 ? '提交审核' : '医生审核'}</Button>}
                    {row.status === 3 && <Button size="small" onClick={() => setCheckinPlan(row)}>打卡管理</Button>}
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

      <PlanEditor
        memberId={memberId} open={editorOpen} plan={editorPlan} draft={editorDraft}
        onClose={closeEditor} onSaved={load}
      />
      <PlanAiDraft
        memberId={memberId} open={aiOpen} onClose={() => setAiOpen(false)}
        onApply={(draft) => { setAiOpen(false); setEditorPlan(undefined); setEditorDraft(draft); setEditorOpen(true) }}
      />

      <Drawer
        title={detail ? `健康方案 · ${planTitle(parts.plan)}` : '健康方案详情'}
        width={1000} open={detailOpen} onClose={() => setDetailOpen(false)}
        className="plan-detail-drawer"
        extra={detail ? <Space>{execution && <Tag color="cyan">{execution}</Tag>}{planStatusTag(parts.plan.status)}</Space> : undefined}
      >
        <Spin spinning={detailLoading}>
          {detail && (
            <>
              <Descriptions size="small" bordered column={{ xs: 1, sm: 3 }} className="plan-detail-summary">
                <Descriptions.Item label="方案类型">{planTypeText(parts.plan.plan_type)}</Descriptions.Item>
                <Descriptions.Item label="执行周期">{parts.plan.duration_days ? `${parts.plan.duration_days} 天` : '-'}</Descriptions.Item>
                <Descriptions.Item label="方案周期">{planDate(parts.plan.start_date)} 至 {planDate(parts.plan.end_date)}</Descriptions.Item>
                <Descriptions.Item label="创建人"><SensitiveText type="name" value={parts.plan.created_by_name} /></Descriptions.Item>
                <Descriptions.Item label="确认人"><SensitiveText type="name" value={parts.plan.confirmed_by_name} /></Descriptions.Item>
                <Descriptions.Item label="创建时间">{formatTimestamp(parts.plan.created_at)}</Descriptions.Item>
                <Descriptions.Item label="健康管理意向" span={3}>{display(parts.plan.health_intent)}</Descriptions.Item>
                <Descriptions.Item label="最近审批意见" span={3}>{display(parts.plan.review_remark)}</Descriptions.Item>
              </Descriptions>
              <Tabs
                items={[
                  {
                    key: 'goals', label: `健康目标（${parts.goals.length}）`,
                    children: (
                      <Table
                        rowKey={(row) => String(row.id ?? row.goal_code)} size="small" pagination={false}
                        dataSource={parts.goals} scroll={{ x: 820 }}
                        columns={[
                          { title: '类别', dataIndex: 'category', width: 140, render: goalCategoryTag },
                          { title: '目标编码', dataIndex: 'goal_code', width: 150, render: display },
                          { title: '目标名称', dataIndex: 'goal_label', width: 180, render: display },
                          { title: '目标依据', dataIndex: 'goal_basis', render: display },
                          { title: '状态', dataIndex: 'status', width: 90, render: (value) => <Tag color={value === 1 ? 'green' : 'default'}>{value === 1 ? '启用' : '停用'}</Tag> },
                        ]}
                      />
                    ),
                  },
                  {
                    key: 'interventions', label: `干预措施（${parts.interventions.length}）`,
                    children: (
                      <Table
                        rowKey={(row) => String(row.id ?? row.interv_code)} size="small" pagination={false}
                        dataSource={parts.interventions}
                        columns={[
                          { title: '干预', key: 'name', render: (_, row) => <div className="archive-primary-cell"><strong>{interventionLabel(row)}</strong><span>{display(row.interv_code)}</span></div> },
                          { title: '字段类型', dataIndex: 'field_type', render: (value) => FIELD_TYPE_META[value] ?? display(value) },
                          { title: '单位', dataIndex: 'field_unit', render: display },
                          { title: '打卡频次', key: 'frequency', render: (_, row) => frequencyText(row) },
                          { title: '必填', dataIndex: 'required', render: (value) => value === 1 ? <Tag color="red">必填</Tag> : <Tag>选填</Tag>},
                          { title: '状态', dataIndex: 'status', width: 80, render: (value) => <Tag color={value === 1 ? 'green' : 'default'}>{value === 1 ? '启用' : '停用'}</Tag> },
                        ]}
                        expandable={{ expandedRowRender: (row) => (
                          <Descriptions size="small" column={1}>
                            <Descriptions.Item label="干预说明">{display(row.action_desc)}</Descriptions.Item>
                            <Descriptions.Item label="干预依据">{display(row.interv_basis)}</Descriptions.Item>
                            <Descriptions.Item label="关联指标">{display(row.metric_code)}</Descriptions.Item>
                            {(row.field_type === 4 || row.field_type === 5) && <Descriptions.Item label="可选项">{display(row.option_json)}</Descriptions.Item>}
                          </Descriptions>
                        ) }}
                      />
                    ),
                  },
                  {
                    key: 'audit_reviews', label: `审批履历（${parts.audit_reviews.length}）`,
                    children: parts.audit_reviews.length ? (
                      <Timeline
                        className="plan-review-timeline"
                        items={parts.audit_reviews.map((review) => ({
                          color: review.action === 4 ? 'red' : review.action === 3 ? 'green' : 'blue',
                          children: (
                            <div className="plan-review-item">
                              <Space wrap>{reviewActionTag(review)}<strong><SensitiveText type="name" value={review.operator_name} /></strong><span>{formatTimestamp(review.operated_at)}</span></Space>
                              <div>角色：{reviewRoleText(review.role)}</div>
                              {review.remark && <p>{review.remark}</p>}
                            </div>
                          ),
                        }))}
                      />
                    ) : <Alert type="info" showIcon message="暂无审批履历" />,
                  },
                ]}
              />
            </>
          )}
        </Spin>
      </Drawer>

      <Modal
        title={reviewPlan?.status === 1 ? `提交医生审核 · ${planTitle(reviewPlan)}` : `医生审核 · ${planTitle(reviewPlan)}`}
        open={reviewPlan != null} onCancel={() => setReviewPlan(undefined)}
        onOk={review} confirmLoading={reviewing} okText={reviewPlan?.status === 1 ? '确认提交' : '提交审核'} destroyOnHidden
      >
        <Alert
          type="info" showIcon className="plan-review-alert"
          message={reviewPlan?.status === 1 ? '健管师审核只执行通过，通过后进入医生确认。' : '医生通过后方案定稿；驳回后方案退回草稿，由健管师修改后重新提交。'}
          description="如需调整当前方案，可先使用审核期编辑，修改内容不会改变审批进度。"
        />
        <Form form={reviewForm} layout="vertical">
          {reviewPlan?.status === 2 && (
            <Form.Item label="审核结果" required>
              <Radio.Group value={reviewPass} onChange={(event) => setReviewPass(event.target.value as boolean)}>
                <Radio value>通过并定稿</Radio>
                <Radio value={false}>驳回至草稿</Radio>
              </Radio.Group>
            </Form.Item>
          )}
          <Form.Item
            name="remark" label="审批意见"
            rules={reviewPlan?.status === 2 && !reviewPass ? [{ required: true, whitespace: true, message: '驳回时请填写审批意见' }] : undefined}
          >
            <Input.TextArea rows={4} placeholder="记录本次审核意见，将同步到审批履历" />
          </Form.Item>
        </Form>
      </Modal>

      <PlanCheckins plan={checkinPlan} onClose={() => setCheckinPlan(undefined)} />
    </>
  )
}
