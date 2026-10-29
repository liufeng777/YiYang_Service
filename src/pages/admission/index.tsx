/**
 * 入住协同 - 意向列表（设计稿：16.入住协同 / 意向列表.png）
 * 登记会员入住意向并持续跟进，线下接待结果在此留痕
 * 已对接预约（appointments）接口：入住意向 = 预约类型「参观」(appointment_type=3)，
 * 列表/新增走预约接口，跟进操作走状态回写、到院确认与取消接口；
 * 逐条跟进记录暂无独立接口，跟进内容写入预约备注
 */
import { useCallback, useEffect, useState } from 'react'
import { Button, Card, DatePicker, Drawer, Input, Popconfirm, Select, Table, Tag, App } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import type { Dayjs } from 'dayjs'
import PageContainer from '@/components/PageContainer'
import { appointmentApi } from '@/api'
import type { AppointmentItem } from '@/api/modules/appointment'

const {
  APPOINTMENT_STATUS_MAP,
  APPOINTMENT_TYPE_MAP,
  cancelAppointment,
  createAppointment,
  getAppointmentDetail,
  getAppointments,
  updateAppointmentStatus,
  visitAppointment,
} = appointmentApi
import { formatDateTime } from '@/utils'
import { useUserStore } from '@/store'
import './index.less'

/** 预约状态标签配色 */
const STATUS_TAG_COLOR: Record<number, string> = {
  1: 'orange',
  2: 'blue',
  3: 'green',
  4: 'green',
  9: 'default',
}

interface Filters {
  keyword: string
  status?: number
}

export default function AdmissionList() {
  const { message } = App.useApp()
  const currentOrg = useUserStore((s) => s.currentOrg)

  const [list, setList] = useState<AppointmentItem[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [filters, setFilters] = useState<Filters>({ keyword: '' })
  const [applied, setApplied] = useState<Filters>({ keyword: '' })

  /* 新增意向抽屉 */
  const [createOpen, setCreateOpen] = useState(false)
  const [creating, setCreating] = useState(false)
  const [form, setForm] = useState({
    contactName: '',
    contactPhone: '',
    expectedVisit: null as Dayjs | null,
    timeSlot: '',
    demand: '',
    remark: '',
  })

  /* 跟进抽屉 */
  const [followId, setFollowId] = useState<number | null>(null)
  const [followDetail, setFollowDetail] = useState<AppointmentItem | null>(null)
  const [followLoading, setFollowLoading] = useState(false)
  const [nextStatus, setNextStatus] = useState<number | undefined>(undefined)
  const [followRemark, setFollowRemark] = useState('')
  const [acting, setActing] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await getAppointments({
        page,
        page_size: pageSize,
        appoint_type: 3, // 入住意向 = 参观预约
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
  }, [page, pageSize, applied])

  useEffect(() => {
    load()
  }, [load])

  /** 打开跟进抽屉时加载预约详情 */
  useEffect(() => {
    if (followId == null) {
      setFollowDetail(null)
      return
    }
    setFollowLoading(true)
    getAppointmentDetail(followId)
      .then((res) => {
        setFollowDetail(res)
        setNextStatus(res?.status)
      })
      .catch(() => undefined)
      .finally(() => setFollowLoading(false))
  }, [followId])

  const onSearch = () => {
    setApplied(filters)
    setPage(1)
  }
  const onReset = () => {
    setFilters({ keyword: '' })
    setApplied({ keyword: '' })
    setPage(1)
  }

  /** 保存登记（创建参观预约） */
  const onCreate = async () => {
    if (!form.contactName.trim() || !form.contactPhone.trim()) {
      message.warning('请填写联系人与联系电话')
      return
    }
    if (!form.expectedVisit) {
      message.warning('请选择期望到访日期')
      return
    }
    setCreating(true)
    try {
      await createAppointment({
        appointment_type: 3,
        appointment_date: form.expectedVisit.format('YYYY-MM-DD'),
        time_slot: form.timeSlot.trim() || undefined,
        contact_name: form.contactName.trim(),
        contact_phone: form.contactPhone.trim(),
        institution_id: +(currentOrg?.id || 0),
        service_interest: form.demand.trim() || undefined,
        remark: form.remark.trim() || undefined,
        status: 1,
      })
      message.success('入住意向已登记')
      setCreateOpen(false)
      setForm({
        contactName: '',
        contactPhone: '',
        expectedVisit: null,
        timeSlot: '',
        demand: '',
        remark: '',
      })
      setPage(1)
      load()
    } catch {
      /* 拦截器已提示 */
    } finally {
      setCreating(false)
    }
  }

  /** 状态回写（跟进结果） */
  const onSaveStatus = async () => {
    if (followId == null || nextStatus == null) {
      message.warning('请选择预约状态')
      return
    }
    setActing(true)
    try {
      await updateAppointmentStatus(followId, { status: nextStatus })
      message.success('预约状态已更新')
      load()
    } catch {
      /* 拦截器已提示 */
    } finally {
      setActing(false)
    }
  }

  /** 到院确认 */
  const onVisit = async () => {
    if (followId == null) return
    setActing(true)
    try {
      await visitAppointment(followId, followRemark.trim() ? { remark: followRemark.trim() } : undefined)
      message.success('已确认到院')
      setFollowDetail((prev) => (prev ? { ...prev, status: 3 } : prev))
      setNextStatus(3)
      load()
    } catch {
      /* 拦截器已提示 */
    } finally {
      setActing(false)
    }
  }

  /** 取消预约 */
  const onCancel = async () => {
    if (followId == null) return
    setActing(true)
    try {
      await cancelAppointment(followId, followRemark.trim() ? { reason: followRemark.trim() } : undefined)
      message.success('预约已取消')
      setFollowDetail((prev) => (prev ? { ...prev, status: 9 } : prev))
      setNextStatus(9)
      load()
    } catch {
      /* 拦截器已提示 */
    } finally {
      setActing(false)
    }
  }

  const columns = [
    {
      title: '会员',
      key: 'member',
      render: (_: unknown, row: AppointmentItem) => (
        <span>{row.member_name || row.contact_name || '-'}</span>
      ),
    },
    { 
      title: '联系人',
      dataIndex: 'contact_phone',
      key: 'contact_phone',
      width: 120,
      render: (v, r) => (
        <div className='table-cell'>
          <strong>{r.contact_name}</strong>
          <span>{r.contact_phone}</span>
        </div>
      )
    },
    {
      title: '预约类型',
      dataIndex: 'appointment_type',
      key: 'appointment_type',
      width: 100,
      render: (v: number, row: AppointmentItem) =>
        APPOINTMENT_TYPE_MAP[v ?? row.appoint_type ?? 0] ?? '-',
    },
    {
      title: '预约到访',
      key: 'date',
      width: 160,
      render: (_: unknown, row: AppointmentItem) => (
        <span>
          {row.appointment_date || '-'}
          {row.time_slot ? ` ${row.time_slot}` : ''}
        </span>
      ),
    },
    {
      title: '服务意向',
      dataIndex: 'service_interest',
      key: 'service_interest',
      render: (v: string) => v || '-',
    },
    {
      title: '接待人员',
      dataIndex: 'assigned_staff_name',
      key: 'assigned_staff_name',
      render: (v: string) => v || '-',
    },
    {
      title: '预约状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (v: number) => (
        <Tag color={STATUS_TAG_COLOR[v] ?? 'default'}>{APPOINTMENT_STATUS_MAP[v] ?? v ?? '-'}</Tag>
      ),
    },
    {
      title: '登记时间',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 160,
      render: (v: number) => (v ? formatDateTime(v * 1000) : '-'),
    },
    {
      title: '操作',
      key: 'action',
      width: 80,
      render: (_: unknown, row: AppointmentItem) => (
        <Button size="small" onClick={() => setFollowId(row.id)}>
          {row.status === 4 || row.status === 9 ? '查看' : '跟进'}
        </Button>
      ),
    },
  ]

  return (
    <div className="ad-page">
      <PageContainer
        title="入住协同"
        description="登记会员入住意向并持续跟进，线下接待结果在此留痕"
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setCreateOpen(true)}>
            新增入住意向
          </Button>
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
            placeholder="预约状态：全部"
            value={filters.status}
            onChange={(v) => setFilters((f) => ({ ...f, status: v }))}
            options={Object.entries(APPOINTMENT_STATUS_MAP).map(([value, label]) => ({
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

        {/* 意向列表 */}
        <Card variant="borderless" className="list-card table-fill">
          <Table<AppointmentItem>
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
      </PageContainer>

      {/* 新增入住意向抽屉 */}
      <Drawer
        title="新增入住意向"
        width={520}
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        footer={
          <div className="ad-drawer__footer">
            <Button onClick={() => setCreateOpen(false)}>取消</Button>
            <Button type="primary" loading={creating} onClick={onCreate}>
              保存登记
            </Button>
          </div>
        }
      >
        <div className="ad-section__title">基础信息</div>
        <div className="ad-form__grid">
          <div className="ad-field">
            <div className="ad-field__label">联系人</div>
            <Input
              placeholder="如：王先生（家属）"
              value={form.contactName}
              onChange={(e) => setForm((f) => ({ ...f, contactName: e.target.value }))}
            />
          </div>
          <div className="ad-field">
            <div className="ad-field__label">联系电话</div>
            <Input
              placeholder="手机号"
              value={form.contactPhone}
              onChange={(e) => setForm((f) => ({ ...f, contactPhone: e.target.value }))}
            />
          </div>
        </div>

        <div className="ad-section__title">入住意向</div>
        <div className="ad-form__grid">
          <div className="ad-field">
            <div className="ad-field__label">期望到访日期</div>
            <DatePicker
              style={{ width: '100%' }}
              value={form.expectedVisit}
              onChange={(v) => setForm((f) => ({ ...f, expectedVisit: v }))}
            />
          </div>
          <div className="ad-field">
            <div className="ad-field__label">到访时段</div>
            <Input
              placeholder="如：上午 10:00"
              value={form.timeSlot}
              onChange={(e) => setForm((f) => ({ ...f, timeSlot: e.target.value }))}
            />
          </div>
        </div>
        <div className="ad-field">
          <div className="ad-field__label">需求说明</div>
          <Input.TextArea
            rows={3}
            placeholder="需要了解护理环境、服务内容和收费标准"
            value={form.demand}
            onChange={(e) => setForm((f) => ({ ...f, demand: e.target.value }))}
          />
        </div>
        <div className="ad-field">
          <div className="ad-field__label">备注（来源 / 入住时间意向等）</div>
          <Input.TextArea
            rows={2}
            placeholder="如：健康咨询转运营，希望一个月内入住"
            value={form.remark}
            onChange={(e) => setForm((f) => ({ ...f, remark: e.target.value }))}
          />
        </div>
        <div className="ad-note">一期仅登记意向与跟进，不处理床位、合同、费用和正式入住办理。</div>
      </Drawer>

      {/* 入住意向跟进抽屉 */}
      <Drawer
        title="入住意向跟进"
        width={520}
        loading={followLoading}
        open={followId != null}
        onClose={() => setFollowId(null)}
      >
        {followDetail && (
          <>
            <div className="ad-follow__member">
              <div className="ad-follow__member-main">
                <span className="ad-follow__member-name">
                  {followDetail.member_name || followDetail.contact_name || '-'}
                </span>
                <span>{followDetail.contact_phone || '-'}</span>
              </div>
              <div className="ad-follow__member-sub">
                预约到访：{followDetail.appointment_date || '-'}
                {followDetail.time_slot ? ` ${followDetail.time_slot}` : ''}　状态：
                {APPOINTMENT_STATUS_MAP[followDetail.status ?? 0] ?? '-'}
              </div>
              <div className="ad-follow__member-sub">
                服务意向：{followDetail.service_interest || '-'}
              </div>
              {followDetail.remark && (
                <div className="ad-follow__member-sub">备注：{followDetail.remark}</div>
              )}
              {followDetail.created_at && (
                <div className="ad-follow__member-sub">
                  登记时间：{formatDateTime(followDetail.created_at * 1000)}
                </div>
              )}
            </div>

            <div className="ad-section__title">跟进操作</div>
            <div className="ad-form__grid">
              <div className="ad-field">
                <div className="ad-field__label">预约状态</div>
                <Select
                  placeholder="请选择"
                  value={nextStatus}
                  onChange={(v) => setNextStatus(v)}
                  options={Object.entries(APPOINTMENT_STATUS_MAP).map(([value, label]) => ({
                    value: Number(value),
                    label,
                  }))}
                />
              </div>
            </div>
            <div className="ad-field">
              <div className="ad-field__label">跟进备注</div>
              <Input.TextArea
                rows={3}
                placeholder="家属计划带老人一同参观，重点了解护理服务。"
                value={followRemark}
                onChange={(e) => setFollowRemark(e.target.value)}
              />
            </div>
            <div className="ad-drawer__footer" style={{ padding: 0 }}>
              <Button type="primary" loading={acting} onClick={onSaveStatus}>
                保存状态
              </Button>
              <Button loading={acting} onClick={onVisit}>
                确认到院
              </Button>
              <Popconfirm title="确认取消该预约？" onConfirm={onCancel}>
                <Button danger loading={acting}>
                  取消预约
                </Button>
              </Popconfirm>
            </div>
            <div className="ad-note">
              逐条跟进记录暂无独立接口，跟进内容将随状态回写或到院、取消操作一并提交。
            </div>
          </>
        )}
      </Drawer>
    </div>
  )
}
