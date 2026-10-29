/**
 * 健康活动 - 现场签到（设计稿：9.健康活动/现场签到.png）
 * 已对接：
 * - GET /activities/{id}（活动信息）
 * - GET /activities/{id}/registrations（默认过滤「待参加」，支持按手机号/姓名搜索）
 * - POST /activities/{id}/registrations/{rid}/checkin（签到）
 * - POST /activities/{id}/registrations（临时到场补登记 = 代报名后再签到）
 */
import { useCallback, useEffect, useState } from 'react'
import { Button, Card, Input, InputNumber, Modal, Select, Table, Tag, App } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import { useParams } from 'react-router-dom'
import PageContainer from '@/components/PageContainer'
import { activityApi } from '@/api'
import type { ActivityItem, RegistrationItem } from '@/api/modules/activity'

const { REG_STATUS_MAP } = activityApi

const REG_TAG_COLOR: Record<number, string> = {
  1: 'blue',
  2: 'green',
  3: 'default',
}

export default function ActivityCheckin() {
  const { id = '' } = useParams()
  const { message } = App.useApp()

  const [activity, setActivity] = useState<ActivityItem | null>(null)
  const [list, setList] = useState<RegistrationItem[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [keyword, setKeyword] = useState('')
  const [status, setStatus] = useState<number | undefined>(1) // 默认「待参加」
  const [applied, setApplied] = useState<{ keyword: string; status?: number }>({
    keyword: '',
    status: 1,
  })

  /* 临时到场补登记弹窗 */
  const [regOpen, setRegOpen] = useState(false)
  const [regSaving, setRegSaving] = useState(false)
  const [regForm, setRegForm] = useState({
    contact_name: '',
    contact_phone: '',
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
      load()
    } catch {
      /* 拦截器已提示 */
    }
  }

  /** 临时到场补登记：代报名成功后立即签到 */
  const onRegister = async () => {
    if (!regForm.contact_name.trim() || !regForm.contact_phone.trim()) {
      message.warning('请填写姓名与联系电话')
      return
    }
    setRegSaving(true)
    try {
      await activityApi.registerActivity(id, {
        contact_name: regForm.contact_name.trim(),
        contact_phone: regForm.contact_phone.trim(),
        participant_count: regForm.participant_count,
        remark: '现场临时到场补登记',
      })
      message.success('补登记成功，请在名单中完成签到')
      setRegOpen(false)
      setRegForm({ contact_name: '', contact_phone: '', participant_count: 1 })
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
    { title: '联系电话', dataIndex: 'contact_phone', key: 'contact_phone', width: 140 },
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
      title: '操作',
      key: 'action',
      width: 100,
      render: (_: unknown, row: RegistrationItem) =>
        row.status === 1 ? (
          <Button size="small" type="primary" onClick={() => onCheckin(row.id)}>
            签到
          </Button>
        ) : (
          <span style={{ color: 'inherit' }}>-</span>
        ),
    },
  ]

  return (
    <PageContainer
      title={`现场签到${activity ? ` - ${activity.title ?? activity.activity_name ?? ''}` : ''}`}
      description="按报名名单或手机号完成签到，临时到场人员可补登记"
      extra={
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setRegOpen(true)}>
          临时到场补登记
        </Button>
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
          placeholder="状态：待参加"
          value={status}
          onChange={(v) => setStatus(v)}
          options={Object.entries(REG_STATUS_MAP).map(([value, label]) => ({
            value: Number(value),
            label,
          }))}
          allowClear
        />
        <Button
          type="primary"
          onClick={() => {
            setApplied({ keyword, status })
            setPage(1)
          }}
        >
          查询
        </Button>
        <Button
          onClick={() => {
            setKeyword('')
            setStatus(1)
            setApplied({ keyword: '', status: 1 })
            setPage(1)
          }}
        >
          重置
        </Button>
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

      {/* 临时到场补登记弹窗 */}
      <Modal
        title="临时到场补登记"
        open={regOpen}
        onCancel={() => setRegOpen(false)}
        onOk={onRegister}
        confirmLoading={regSaving}
        okText="补登记"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <Input
            placeholder="姓名"
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
        </div>
      </Modal>
    </PageContainer>
  )
}
