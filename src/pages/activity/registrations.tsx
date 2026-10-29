/**
 * 健康活动 - 报名名单（设计稿：9.健康活动/报名名单.png）
 * 已对接：
 * - GET /activities/{id}（活动信息）
 * - GET /activities/{id}/registrations（报名记录，status/keyword 过滤，服务端分页）
 * - POST /activities/{id}/registrations（代报名）
 * - POST /activities/{id}/registrations/{rid}/checkin（签到）
 * - POST /activities/{id}/registrations/{rid}/cancel（取消报名）
 */
import { useCallback, useEffect, useState } from 'react'
import { Button, Card, Input, InputNumber, Modal, Popconfirm, Select, Table, Tag, App } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import { useNavigate, useParams } from 'react-router-dom'
import PageContainer from '@/components/PageContainer'
import { activityApi } from '@/api'
import type { ActivityItem, RegistrationItem } from '@/api/modules/activity'
import { formatDateTime } from '@/utils'

const { REG_STATUS_MAP } = activityApi

const REG_TAG_COLOR: Record<number, string> = {
  1: 'blue',
  2: 'green',
  3: 'default',
}

interface Filters {
  keyword: string
  status?: number
}

export default function ActivityRegistrations() {
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const { message } = App.useApp()

  const [activity, setActivity] = useState<ActivityItem | null>(null)
  const [list, setList] = useState<RegistrationItem[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [filters, setFilters] = useState<Filters>({ keyword: '' })
  const [applied, setApplied] = useState<Filters>({ keyword: '' })

  /* 代报名弹窗 */
  const [regOpen, setRegOpen] = useState(false)
  const [regSaving, setRegSaving] = useState(false)
  const [regForm, setRegForm] = useState({
    contact_name: '',
    contact_phone: '',
    participant_count: 1,
    remark: '',
  })

  useEffect(() => {
    if (!id) return
    activityApi
      .getActivityDetail(id)
      .then((res) => setActivity(res))
      .catch(() => undefined)
  }, [id])

  const load = useCallback(async () => {
    if (!id) return
    setLoading(true)
    try {
      const res = await activityApi.getActivityRegistrations(id, {
        page,
        page_size: pageSize,
        keyword: applied.keyword || undefined,
        status: applied.status,
      })
      setList(res.list ?? [])
      setTotal(res.total ?? 0)
    } catch {
      /* 拦截器已提示 */
    } finally {
      setLoading(false)
    }
  }, [id, page, pageSize, applied])

  useEffect(() => {
    load()
  }, [load])

  const onSearch = () => {
    setApplied(filters)
    setPage(1)
  }
  const onReset = () => {
    setFilters({ keyword: '' })
    setApplied({ keyword: '' })
    setPage(1)
  }

  /** 签到 */
  const onCheckin = async (rid: number) => {
    try {
      await activityApi.checkinRegistration(id, rid)
      message.success('签到成功')
      load()
    } catch {
      /* 拦截器已提示 */
    }
  }

  /** 取消报名 */
  const onCancel = async (rid: number) => {
    try {
      await activityApi.cancelRegistration(id, rid)
      message.success('已取消报名')
      load()
    } catch {
      /* 拦截器已提示 */
    }
  }

  /** 代报名 */
  const onRegister = async () => {
    if (!regForm.contact_name.trim() || !regForm.contact_phone.trim()) {
      message.warning('请填写联系人与联系电话')
      return
    }
    setRegSaving(true)
    try {
      await activityApi.registerActivity(id, {
        contact_name: regForm.contact_name.trim(),
        contact_phone: regForm.contact_phone.trim(),
        participant_count: regForm.participant_count,
        remark: regForm.remark.trim() || undefined,
      })
      message.success('代报名成功')
      setRegOpen(false)
      setRegForm({ contact_name: '', contact_phone: '', participant_count: 1, remark: '' })
      setPage(1)
      load()
    } catch {
      /* 拦截器已提示 */
    } finally {
      setRegSaving(false)
    }
  }

  const columns = [
    {
      title: '会员 / 联系人',
      key: 'name',
      render: (_: unknown, row: RegistrationItem) =>
        row.member_name || row.contact_name || '-',
    },
    { title: '联系电话', dataIndex: 'contact_phone', key: 'contact_phone', width: 130 },
    {
      title: '参与人数',
      dataIndex: 'participant_count',
      key: 'participant_count',
      width: 90,
      render: (v: number) => v ?? '-',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 90,
      render: (v: number) => (
        <Tag color={REG_TAG_COLOR[v] ?? 'default'}>{REG_STATUS_MAP[v] ?? v ?? '-'}</Tag>
      ),
    },
    {
      title: '报名时间',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 160,
      render: (v: number) => (v ? formatDateTime(v * 1000) : '-'),
    },
    {
      title: '备注',
      dataIndex: 'remark',
      key: 'remark',
      render: (v: string) => v || '-',
    },
    {
      title: '操作',
      key: 'action',
      width: 160,
      render: (_: unknown, row: RegistrationItem) => (
        <>
          {row.status === 1 && (
            <Button size="small" type="link" onClick={() => onCheckin(row.id)}>
              签到
            </Button>
          )}
          {row.status !== 3 && (
            <Popconfirm title="确认取消该报名？" onConfirm={() => onCancel(row.id)}>
              <Button size="small" type="link" danger>
                取消报名
              </Button>
            </Popconfirm>
          )}
        </>
      ),
    },
  ]

  return (
    <PageContainer
      title={`报名名单${activity ? ` - ${activity.title ?? activity.activity_name ?? ''}` : ''}`}
      description="机构主动联系报名人，确认参与人、席位与需求"
      extra={
        <>
          <Button onClick={() => navigate(`/health-activity/${id}/check-in`)}>现场签到</Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setRegOpen(true)}>
            代报名
          </Button>
        </>
      }
    >
      {/* 筛选区 */}
      <Card variant="borderless" className="filter-bar">
        <Input
          placeholder="会员姓名 / 手机号"
          value={filters.keyword}
          onChange={(e) => setFilters((f) => ({ ...f, keyword: e.target.value.trim() }))}
          allowClear
        />
        <Select
          placeholder="报名状态：全部"
          value={filters.status}
          onChange={(v) => setFilters((f) => ({ ...f, status: v }))}
          options={Object.entries(REG_STATUS_MAP).map(([value, label]) => ({
            value: Number(value),
            label,
          }))}
          allowClear
        />
        <Button type="primary" onClick={onSearch}>
          查询
        </Button>
        <Button onClick={onReset}>重置</Button>
      </Card>

      <Card variant="borderless" className="list-card table-fill">
        <Table<RegistrationItem>
          rowKey="id"
          columns={columns}
          dataSource={list}
          loading={loading}
          size="small"
          pagination={{
            current: page,
            pageSize,
            total,
            onChange: (nextPage, nextPageSize) => {
              setPage(nextPage)
              setPageSize(nextPageSize)
            },
            showSizeChanger: true,
            showTotal: (t) => `共 ${t} 条`,
          }}
        />
      </Card>

      {/* 代报名弹窗 */}
      <Modal
        title="代报名"
        open={regOpen}
        onCancel={() => setRegOpen(false)}
        onOk={onRegister}
        confirmLoading={regSaving}
        okText="确认报名"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <Input
            placeholder="联系人姓名"
            value={regForm.contact_name}
            onChange={(e) => setRegForm((f) => ({ ...f, contact_name: e.target.value }))}
          />
          <Input
            placeholder="联系电话"
            value={regForm.contact_phone}
            onChange={(e) => setRegForm((f) => ({ ...f, contact_phone: e.target.value }))}
          />
          <InputNumber
            style={{ width: '100%' }}
            min={1}
            placeholder="参与人数"
            value={regForm.participant_count}
            onChange={(v) => setRegForm((f) => ({ ...f, participant_count: v ?? 1 }))}
          />
          <Input.TextArea
            rows={2}
            placeholder="备注（选填）"
            value={regForm.remark}
            onChange={(e) => setRegForm((f) => ({ ...f, remark: e.target.value }))}
          />
        </div>
      </Modal>
    </PageContainer>
  )
}
