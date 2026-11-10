/**
 * 健康会员
 * 列表与处理流程全部使用 staff/health-accesses；会员下拉仅用于线下登记时选择既有会员。
 */
import { useCallback, useEffect, useState } from 'react'
import {
  App, Button, Card, Descriptions, Drawer, Form, Input, InputNumber, Modal,
  Select, Space, Table, Tag,
} from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import PageContainer from '@/components/PageContainer'
import { healthAccessApi, memberApi, staffApi } from '@/api'
import { HEALTH_ACCESS_STATUS_MAP, type HealthAccessItem } from '@/api/modules/health-access'
import type { MemberItem } from '@/api/modules/member'
import type { StaffItem } from '@/api/modules/staff'
import { useUserStore } from '@/store'
import { formatDateTime } from '@/utils'
import './index.less'

type ActionType = 'assign' | 'confirm' | 'followup' | 'reject' | 'transfer'
interface Filters { key: string; status?: number; source_type?: number; days?: number }
interface ActionState { type: ActionType; row: HealthAccessItem }

const EMPTY_FILTERS: Filters = { key: '' }
const ACTION_TITLES: Record<ActionType, string> = {
  assign: '分配健管师', confirm: '确认接入', followup: '添加跟进', reject: '拒绝接入', transfer: '转派机构',
}

function display(value: unknown) {
  if (value == null || value === '') return '-'
  return typeof value === 'object' ? JSON.stringify(value) : String(value)
}

export default function MemberList() {
  const { message } = App.useApp()
  const currentOrg = useUserStore((s) => s.currentOrg)
  const [createForm] = Form.useForm()
  const [actionForm] = Form.useForm()
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS)
  const [applied, setApplied] = useState<Filters>(EMPTY_FILTERS)
  const [list, setList] = useState<HealthAccessItem[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [members, setMembers] = useState<MemberItem[]>([])
  const [staffs, setStaffs] = useState<StaffItem[]>([])
  const [createOpen, setCreateOpen] = useState(false)
  const [creating, setCreating] = useState(false)
  const [detail, setDetail] = useState<HealthAccessItem>()
  const [detailLoading, setDetailLoading] = useState(false)
  const [action, setAction] = useState<ActionState>()
  const [acting, setActing] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await healthAccessApi.getHealthAccesses({
        page, page_size: pageSize, key: applied.key || undefined,
        status: applied.status, source_type: applied.source_type, days: applied.days,
      })
      setList(res.list ?? [])
      setTotal(res.total ?? 0)
    } catch { /* 拦截器统一提示 */ } finally { setLoading(false) }
  }, [page, pageSize, applied])

  useEffect(() => { load() }, [load])
  useEffect(() => {
    memberApi.getMemberList({ page: 1, page_size: 100 }).then((res) => setMembers(res.list ?? [])).catch(() => undefined)
    staffApi.getStaffList({ page: 1, page_size: 100 }).then((res) => setStaffs(res.list ?? [])).catch(() => undefined)
  }, [])

  const openDetail = async (row: HealthAccessItem) => {
    setDetail(row)
    setDetailLoading(true)
    try { setDetail(await healthAccessApi.getHealthAccessDetail(row.id)) } catch { /* 保留列表数据 */ }
    finally { setDetailLoading(false) }
  }

  const openAction = (type: ActionType, row: HealthAccessItem) => {
    actionForm.resetFields()
    setAction({ type, row })
  }

  const search = () => { setPage(1); setApplied({ ...filters }) }
  const reset = () => { setFilters(EMPTY_FILTERS); setApplied(EMPTY_FILTERS); setPage(1) }

  const onCreate = async () => {
    const values = await createForm.validateFields()
    setCreating(true)
    try {
      const tags = String(values.demand_tags || '').split(/[,，]/).map((item: string) => item.trim()).filter(Boolean)
      await healthAccessApi.createHealthAccess({
        member_id: values.member_id,
        institution_id: currentOrg ? Number(currentOrg.id) : undefined,
        source_type: values.source_type,
        relation: values.relation,
        demand_desc: values.demand_desc?.trim() || undefined,
        demand_tags: tags.length ? JSON.stringify(tags) : undefined,
        health_intent: values.health_intent?.trim() || undefined,
        remark: values.remark?.trim() || undefined,
      })
      message.success('健康会员接入已登记')
      setCreateOpen(false)
      createForm.resetFields()
      setPage(1)
      load()
    } catch { /* 保留输入 */ } finally { setCreating(false) }
  }

  const onAction = async () => {
    if (!action) return
    const values = await actionForm.validateFields()
    setActing(true)
    try {
      const id = action.row.id
      if (action.type === 'assign') await healthAccessApi.assignHealthAccess(id, { staff_id: values.staff_id })
      if (action.type === 'confirm') await healthAccessApi.confirmHealthAccess(id, { relation: values.relation })
      if (action.type === 'followup') await healthAccessApi.followupHealthAccess(id, { content: values.content.trim() })
      if (action.type === 'reject') await healthAccessApi.rejectHealthAccess(id, { reason: values.reason?.trim() || undefined })
      if (action.type === 'transfer') await healthAccessApi.transferHealthAccess(id, {
        institution_id: values.institution_id, reason: values.reason?.trim() || undefined,
      })
      message.success(`${ACTION_TITLES[action.type]}成功`)
      setAction(undefined)
      await load()
      if (detail?.id === id) await openDetail(action.row)
    } catch { /* 拦截器统一提示 */ } finally { setActing(false) }
  }

  const columns = [
    { title: '接入编号', dataIndex: 'id', key: 'id', width: 100 },
    {
      title: '健康会员', key: 'member',
      render: (_: unknown, row: HealthAccessItem) => (
        <div className="mb-access-member">
          <strong>{row.member_name || `会员 #${row.member_id}`}</strong>
          <span>{row.member_phone || '-'}</span>
        </div>
      ),
    },
    { title: '服务需求', key: 'demand', render: (_: unknown, row: HealthAccessItem) => row.demand_desc || row.health_intent || '-' },
    { title: '健管师', dataIndex: 'staff_name', key: 'staff_name', render: (value?: string) => value || '-' },
    {
      title: '来源', dataIndex: 'source_type', key: 'source_type',
      render: (value?: number) => value === 1 ? '线下登记' : value != null ? `来源 ${value}` : '-',
    },
    {
      title: '接入状态', dataIndex: 'status', key: 'status',
      render: (value?: number) => <Tag>{value != null ? HEALTH_ACCESS_STATUS_MAP[value] ?? `状态 ${value}` : '-'}</Tag>,
    },
    { title: '登记时间', dataIndex: 'created_at', key: 'created_at', render: (value?: number) => value ? formatDateTime(value * 1000) : '-' },
    {
      title: '操作', key: 'action', width: 90,
      render: (_: unknown, row: HealthAccessItem) => <Button size="small" onClick={() => openDetail(row)}>处理</Button>,
    },
  ]

  return (
    <PageContainer
      title="健康会员管理"
      description="通过健康服务接入流程登记会员需求，并完成分配、确认、跟进与转派"
      extra={<Button type="primary" icon={<PlusOutlined />} onClick={() => setCreateOpen(true)}>新增健康会员</Button>}
    >
      <Card variant="borderless" className="filter-bar">
        <Input
          placeholder="会员名 / 手机号 / 编号"
          value={filters.key}
          onChange={(event) => setFilters((prev) => ({ ...prev, key: event.target.value.trim() }))}
          onPressEnter={search}
          allowClear
        />
        <Select
          placeholder="全部状态" value={filters.status} allowClear
          onChange={(value) => setFilters((prev) => ({ ...prev, status: value }))}
          options={Object.entries(HEALTH_ACCESS_STATUS_MAP).map(([value, label]) => ({ value: Number(value), label }))}
        />
        <Select
          placeholder="全部来源" value={filters.source_type} allowClear
          onChange={(value) => setFilters((prev) => ({ ...prev, source_type: value }))}
          options={[{ value: 1, label: '线下登记' }]}
        />
        <InputNumber
          min={1} precision={0} placeholder="最近 N 天" value={filters.days}
          onChange={(value) => setFilters((prev) => ({ ...prev, days: value ?? undefined }))}
        />
        <Button onClick={reset}>重置</Button>
        <Button type="primary" onClick={search}>查询</Button>
      </Card>

      <Card variant="borderless" className="list-card table-fill">
        <Table<HealthAccessItem>
          rowKey="id" columns={columns} dataSource={list} loading={loading} scroll={{ x: 1050 }}
          pagination={{
            current: page, pageSize, total, showSizeChanger: true,
            showTotal: (value) => `共 ${value} 条`,
            onChange: (nextPage, nextPageSize) => { setPage(nextPage); setPageSize(nextPageSize) },
          }}
        />
      </Card>

      <Modal
        title="新增健康会员" open={createOpen} onCancel={() => setCreateOpen(false)}
        onOk={onCreate} confirmLoading={creating} destroyOnHidden
      >
        <Form form={createForm} layout="vertical" initialValues={{ source_type: 1, relation: 1 }}>
          <Form.Item name="member_id" label="会员" rules={[{ required: true, message: '请选择会员' }]}>
            <Select
              showSearch optionFilterProp="label" placeholder="选择既有会员"
              options={members.map((member) => ({ value: member.id, label: `${member.name} · ${member.phone || member.id}` }))}
            />
          </Form.Item>
          <Form.Item name="source_type" label="来源" rules={[{ required: true }]}>
            <Select options={[{ value: 1, label: '线下登记' }]} />
          </Form.Item>
          <Form.Item name="relation" label="关系"><InputNumber min={1} precision={0} /></Form.Item>
          <Form.Item name="demand_desc" label="需求描述"><Input.TextArea rows={3} maxLength={500} /></Form.Item>
          <Form.Item name="demand_tags" label="需求标签" extra="多个标签使用逗号分隔，提交为 JSON 数组字符串">
            <Input placeholder="如：慢病管理，定期随访" />
          </Form.Item>
          <Form.Item name="health_intent" label="健康管理意向"><Input.TextArea rows={2} /></Form.Item>
          <Form.Item name="remark" label="备注"><Input.TextArea rows={2} /></Form.Item>
        </Form>
      </Modal>

      <Drawer
        title={`健康会员接入 #${detail?.id ?? ''}`} width={560} open={detail != null}
        loading={detailLoading} onClose={() => setDetail(undefined)}
        footer={detail && (
          <Space wrap>
            <Button onClick={() => openAction('assign', detail)}>分配</Button>
            <Button type="primary" onClick={() => openAction('confirm', detail)}>确认接入</Button>
            <Button onClick={() => openAction('followup', detail)}>跟进</Button>
            <Button danger onClick={() => openAction('reject', detail)}>拒绝</Button>
            <Button onClick={() => openAction('transfer', detail)}>转派</Button>
          </Space>
        )}
      >
        {detail && (
          <Descriptions bordered column={1} size="small">
            {Object.entries(detail).map(([key, value]) => (
              <Descriptions.Item key={key} label={key}>
                {key === 'created_at' && typeof value === 'number'
                  ? formatDateTime(value * 1000)
                  : key === 'status' && typeof value === 'number'
                    ? HEALTH_ACCESS_STATUS_MAP[value] ?? value : display(value)}
              </Descriptions.Item>
            ))}
          </Descriptions>
        )}
      </Drawer>

      <Modal
        title={action ? ACTION_TITLES[action.type] : ''} open={action != null}
        onCancel={() => setAction(undefined)} onOk={onAction} confirmLoading={acting} destroyOnHidden
      >
        <Form form={actionForm} layout="vertical" initialValues={{ relation: 1 }}>
          {action?.type === 'assign' && (
            <Form.Item name="staff_id" label="目标健管师" rules={[{ required: true, message: '请选择健管师' }]}>
              <Select
                showSearch optionFilterProp="label"
                options={staffs.map((staff) => ({ value: staff.id, label: `${staff.name} · ${staff.position_name || staff.position_code || staff.id}` }))}
              />
            </Form.Item>
          )}
          {action?.type === 'confirm' && <Form.Item name="relation" label="关系"><InputNumber min={1} precision={0} /></Form.Item>}
          {action?.type === 'followup' && (
            <Form.Item name="content" label="跟进内容" rules={[{ required: true, whitespace: true, message: '请输入跟进内容' }]}>
              <Input.TextArea rows={4} maxLength={1000} />
            </Form.Item>
          )}
          {(action?.type === 'reject' || action?.type === 'transfer') && (
            <Form.Item name="reason" label={action.type === 'reject' ? '拒绝原因' : '转派原因'}>
              <Input.TextArea rows={3} maxLength={500} />
            </Form.Item>
          )}
          {action?.type === 'transfer' && (
            <Form.Item name="institution_id" label="目标机构 ID" rules={[{ required: true, message: '请输入目标机构 ID' }]}>
              <InputNumber min={1} precision={0} />
            </Form.Item>
          )}
        </Form>
      </Modal>
    </PageContainer>
  )
}
