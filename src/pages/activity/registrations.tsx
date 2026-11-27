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
import { Button, Card, Form, Input, InputNumber, Popconfirm, Select, Table, App, Space } from 'antd'
import Tag from '@/components/StatusTag'
import { ArrowLeftOutlined } from '@ant-design/icons'
import { useNavigate, useParams } from 'react-router-dom'
import PageContainer from '@/components/PageContainer'
import FormDrawer from '@/components/FormDrawer'
import SensitiveText from '@/components/SensitiveText'
import { activityApi } from '@/api'
import type { ActivityItem, RegistrationItem } from '@/api/modules/activity'
import MemberSelect from './member-select'
import { formatActivityDateTime } from './shared'

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
  const [regForm, setRegForm] = useState<{ member_id?: number; participant_count: number; remark: string }>({
    member_id: undefined,
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
      await load()
    } catch {
      /* 拦截器已提示 */
    }
  }

  /** 取消报名 */
  const onCancel = async (rid: number) => {
    try {
      await activityApi.cancelRegistration(id, rid)
      message.success('已取消报名')
      await load()
    } catch {
      /* 拦截器已提示 */
    }
  }

  /** 代报名 */
  const onRegister = async () => {
    if (!regForm.member_id) {
      message.warning('请选择健康会员')
      return
    }
    setRegSaving(true)
    try {
      await activityApi.registerActivity(id, {
        member_id: regForm.member_id,
        participant_count: regForm.participant_count,
        remark: regForm.remark.trim() || undefined,
      })
      message.success('代报名成功')
      setRegOpen(false)
      setRegForm({ member_id: undefined, participant_count: 1, remark: '' })
      setPage(1)
      await load()
    } catch {
      /* 拦截器已提示 */
    } finally {
      setRegSaving(false)
    }
  }

  const columns = [
    {
      title: '会员',
      key: 'name',
      render: (_: unknown, row: RegistrationItem) => (
        <div className='table-cell'>
          <strong><SensitiveText allowReveal={false} type="name" value={row.member_name || row.contact_name} /></strong>
          <span className='table-cell__span'><SensitiveText allowReveal={false} type="phone" value={row.member_phone || row.contact_phone} /></span>
        </div>
        
      ),
    },
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
      dataIndex: 'registered_at',
      key: 'registered_at',
      width: 160,
      render: (v?: number) => formatActivityDateTime(v),
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
        <Space>
          {row.status === 1 && (
            <Button size="small" onClick={() => onCheckin(row.registration_id)}>
              签到
            </Button>
          )}
          {row.status !== 3 && (
            <Popconfirm title="确认取消该报名？" onConfirm={() => onCancel(row.registration_id)}>
              <Button size="small" danger>
                取消报名
              </Button>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ]

  return (
    <PageContainer
      title={`报名名单${activity ? ` - ${activity.title ?? activity.activity_name ?? ''}` : ''}`}
      description="机构主动联系报名人，确认参与人、席位与需求"
      extra={
        <Space>
          <Button onClick={() => navigate(`/health-activity/${id}/check-in`)}>现场签到</Button>
          <Button onClick={() => setRegOpen(true)}>
            代报名
          </Button>
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(`/health-activity/${id}`)}>返回活动详情</Button>
        </Space>
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
        <Button onClick={onReset}>重置</Button>
        <Button type="primary" onClick={onSearch}>
          查询
        </Button>
      </Card>

      <Card variant="borderless" className="list-card table-fill">
        <Table<RegistrationItem>
          rowKey="registration_id"
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

      <FormDrawer
        title="代报名" open={regOpen} onClose={() => setRegOpen(false)}
        onSubmit={onRegister} confirmLoading={regSaving} okText="确认报名"
      >
        <Form layout="vertical">
          <Form.Item label="健康会员" required>
            <MemberSelect
              value={regForm.member_id}
              onChange={(memberId) => setRegForm((form) => ({ ...form, member_id: memberId }))}
            />
          </Form.Item>
          <Form.Item label="参与人数" required>
            <InputNumber
              min={1} placeholder="参与人数"
              value={regForm.participant_count}
              onChange={(v) => setRegForm((f) => ({ ...f, participant_count: v ?? 1 }))}
            />
          </Form.Item>
          <Form.Item label="备注（选填）">
            <Input.TextArea
              rows={2} placeholder="备注（选填）" value={regForm.remark}
              onChange={(e) => setRegForm((f) => ({ ...f, remark: e.target.value }))}
            />
          </Form.Item>
        </Form>
      </FormDrawer>
    </PageContainer>
  )
}
