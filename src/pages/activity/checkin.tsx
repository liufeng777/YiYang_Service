/**
 * 健康活动 - 现场签到（设计稿：9.健康活动/现场签到.png）
 * 已对接：
 * - GET /activities/{id}（活动信息）
 * - GET /activities/{id}/registrations（默认展示全部状态，支持按手机号/姓名搜索）
 * - POST /activities/{id}/registrations/{rid}/checkin（签到）
 * - POST /activities/{id}/registrations（临时到场补登记 = 代报名后再签到）
 */
import { useCallback, useEffect, useState } from 'react'
import { Button, Card, Form, Input, InputNumber, Select, Table, App, Space } from 'antd'
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

const GENDER_MAP: Record<number, string> = { 0: '性别未知', 1: '男', 2: '女' }

/** 会员姓名 + 性别 / 年龄，便于签到现场核对身份。 */
function MemberCell({ row }: { row: RegistrationItem }) {
  const gender = Number(row.member_gender ?? 0)
  const age = Number(row.member_age ?? 0)
  const meta = [
    gender === 1 || gender === 2 ? GENDER_MAP[gender] : '',
    age > 0 ? `${age} 岁` : '',
  ].filter(Boolean).join(' · ') || '-'

  return (
    <div>
      <SensitiveText allowReveal={false} type="name" value={row.member_name || row.contact_name} />
      <div className="text-secondary">{meta}</div>
    </div>
  )
}

export default function ActivityCheckin() {
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const { message } = App.useApp()

  const [activity, setActivity] = useState<ActivityItem | null>(null)
  const [list, setList] = useState<RegistrationItem[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [keyword, setKeyword] = useState('')
  const [status, setStatus] = useState<number | undefined>(undefined) // 默认「全部」
  const [applied, setApplied] = useState<{ keyword: string; status?: number }>({ keyword: '' })

  /* 临时到场补登记弹窗 */
  const [regOpen, setRegOpen] = useState(false)
  const [regSaving, setRegSaving] = useState(false)
  const [regForm, setRegForm] = useState<{ member_id?: number; participant_count: number }>({
    member_id: undefined,
    participant_count: 1,
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

  /** 临时到场补登记：选择健康会员后生成待参加报名记录。 */
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
        remark: '现场临时到场补登记',
      })
      message.success('补登记成功，请在名单中完成签到')
      setRegOpen(false)
      setRegForm({ member_id: undefined, participant_count: 1 })
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
      key: 'member',
      width: 120,
      render: (_: unknown, row: RegistrationItem) => <MemberCell row={row} />,
    },
    {
      title: '联系电话',
      key: 'member_phone',
      width: 150,
      render: (_: unknown, row: RegistrationItem) => (
        <SensitiveText allowReveal={false} type="phone" value={row.member_phone || row.contact_phone} />
      ),
    },
    {
      title: '参与人数',
      dataIndex: 'participant_count',
      key: 'participant_count',
      width: 90,
      render: (v?: number) => v ?? '-',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 90,
      render: (v?: number) => (
        <Tag color={REG_TAG_COLOR[v ?? 0] ?? 'default'}>{REG_STATUS_MAP[v ?? 0] ?? v ?? '-'}</Tag>
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
      title: '签到时间',
      dataIndex: 'signed_at',
      key: 'signed_at',
      width: 160,
      render: (v?: number) => formatActivityDateTime(v),
    },
    {
      title: '备注',
      dataIndex: 'remark',
      key: 'remark',
      ellipsis: true,
      render: (v?: string) => v || '-',
    },
    {
      title: '操作',
      key: 'action',
      width: 100,
      render: (_: unknown, row: RegistrationItem) => {
        if (row.status === 1) {
          return (
            <Button size="small" onClick={() => onCheckin(row.registration_id)}>
              签到
            </Button>
          )
        }
        if (row.status === 2) return <span className="text-secondary">已签到</span>
        return '-'
      },
    },
  ]

  return (
    <PageContainer
      title={`现场签到${activity ? ` - ${activity.title ?? activity.activity_name ?? ''}` : ''}`}
      description="按报名名单或手机号完成签到，临时到场人员可补登记"
      extra={
        <Space>
          <Button onClick={() => setRegOpen(true)}>
            临时到场补登记
          </Button>
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(`/health-activity/${id}`)}>返回活动详情</Button>
        </Space>
      }
    >
      {/* 筛选区 */}
      <Card variant="borderless" className="filter-bar">
        <Input
          placeholder="姓名 / 手机号"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value.trim())}
          allowClear
        />
        <Select
          placeholder="状态：全部"
          value={status}
          onChange={(v) => setStatus(v)}
          options={Object.entries(REG_STATUS_MAP).map(([value, label]) => ({
            value: Number(value),
            label,
          }))}
          allowClear
        />
        <Button
          onClick={() => {
            setKeyword('')
            setStatus(undefined)
            setApplied({ keyword: '' })
            setPage(1)
          }}
        >
          重置
        </Button>
        <Button
          type="primary"
          onClick={() => {
            setApplied({ keyword, status })
            setPage(1)
          }}
        >
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
          scroll={{ x: 1080 }}
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
        title="临时到场补登记" open={regOpen} onClose={() => setRegOpen(false)}
        onSubmit={onRegister} confirmLoading={regSaving} okText="补登记"
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
        </Form>
      </FormDrawer>
    </PageContainer>
  )
}
