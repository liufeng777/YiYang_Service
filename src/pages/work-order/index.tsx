/**
 * 服务工单 - 工单列表（设计稿：状态Tab.png）
 * 处理运营平台分配至当前机构的订单，完成派单、联系、改期与履约管理
 * TODO: 接入后端后替换为 workOrderApi.getWorkOrders（API §9.2）
 */
import { useMemo, useState } from 'react'
import { Button, DatePicker, Input, Select, Table } from 'antd'
import { SearchOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import PageContainer from '@/components/PageContainer'
import {
  CONTACT_STATUS_TEXT,
  WO_STATUS_TABS,
  WO_STATUS_TEXT,
  mockWoStats,
  mockWorkOrderList,
  type ContactStatus,
  type MockWorkOrderRow,
  type WoStatus,
} from './mock'
import './index.less'

/** 状态标签配色（wo-tag--*） */
const STATUS_TONE: Record<WoStatus, string> = {
  pending_dispatch: 'orange',
  dispatched: 'blue',
  pending_contact: 'blue',
  pending_service: 'green',
  in_service: 'green',
  pending_receipt: 'orange',
  completed: 'green',
  reschedule: 'purple',
  exception: 'red',
}

const CONTACT_TONE: Record<ContactStatus, string> = {
  not_due: 'blue',
  pending: 'orange',
  confirmed: 'green',
  unreachable: 'orange',
  reschedule_request: 'purple',
  cancelled: 'red',
}

interface Filters {
  keyword: string
  status?: WoStatus
  service?: string
  date?: string
}

export default function WorkOrderList() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<WoStatus | 'all'>('all')
  const [filters, setFilters] = useState<Filters>({ keyword: '' })
  const [page, setPage] = useState(1)
  const pageSize = 20

  const serviceOptions = useMemo(
    () => [...new Set(mockWorkOrderList.map((r) => r.serviceName))],
    [],
  )

  const filtered = useMemo(
    () =>
      mockWorkOrderList.filter((row) => {
        if (activeTab !== 'all' && row.status !== activeTab) return false
        if (
          filters.keyword &&
          ![row.woNo, row.orderNo, row.memberName, row.memberPhone].some((v) =>
            v.includes(filters.keyword),
          )
        )
          return false
        if (filters.status && row.status !== filters.status) return false
        if (filters.service && row.serviceName !== filters.service) return false
        return true
      }),
    [activeTab, filters],
  )

  const onReset = () => {
    setFilters({ keyword: '' })
    setActiveTab('all')
    setPage(1)
  }

  const stats = [
    { label: '今日待派单', value: mockWoStats.todayPendingDispatch, tone: 'success' },
    { label: '明日待联系确认', value: mockWoStats.tomorrowContact, tone: 'info' },
    { label: '待确认回执', value: mockWoStats.pendingReceipt, tone: 'warn' },
    { label: '履约异常', value: mockWoStats.exception, tone: 'danger' },
  ]

  const renderAction = (row: MockWorkOrderRow) => {
    switch (row.status) {
      case 'pending_dispatch':
        return (
          <Button
            type="primary"
            size="small"
            onClick={() => navigate(`/work-order/${row.id}?dispatch=1`)}
          >
            去派单
          </Button>
        )
      case 'in_service':
        return (
          <Button size="small" onClick={() => navigate(`/work-order/${row.id}`)}>
            查看进度
          </Button>
        )
      case 'reschedule':
        return (
          <Button
            type="primary"
            size="small"
            onClick={() => navigate(`/work-order/${row.id}?reschedule=1`)}
          >
            处理改期
          </Button>
        )
      case 'pending_receipt':
        return (
          <Button
            type="primary"
            size="small"
            onClick={() => navigate(`/work-order/${row.id}?tab=receipt`)}
          >
            确认回执
          </Button>
        )
      default:
        return (
          <Button size="small" onClick={() => navigate(`/work-order/${row.id}`)}>
            查看
          </Button>
        )
    }
  }

  const columns = [
    {
      title: '工单 / 订单',
      key: 'wo',
      render: (_: unknown, row: MockWorkOrderRow) => (
        <div>
          <div className="wo-row__name">{row.woNo}</div>
          <div className="wo-row__sub">订单 {row.orderNo}</div>
        </div>
      ),
    },
    {
      title: '服务对象',
      key: 'member',
      render: (_: unknown, row: MockWorkOrderRow) => (
        <div>
          <div>{row.memberName}</div>
          <div className="wo-row__sub">{row.memberPhone}</div>
        </div>
      ),
    },
    { title: '服务项目', dataIndex: 'serviceName', key: 'serviceName' },
    { title: '预约时间', dataIndex: 'appointment', key: 'appointment' },
    {
      title: '服务人员',
      key: 'staff',
      render: (_: unknown, row: MockWorkOrderRow) =>
        row.staffName ? <span>{row.staffName}</span> : <span className="wo-row__sub">—</span>,
    },
    {
      title: '联系状态',
      key: 'contactStatus',
      render: (_: unknown, row: MockWorkOrderRow) => (
        <span className={`wo-tag wo-tag--${CONTACT_TONE[row.contactStatus]}`}>
          {CONTACT_STATUS_TEXT[row.contactStatus]}
        </span>
      ),
    },
    {
      title: '工单状态',
      key: 'status',
      render: (_: unknown, row: MockWorkOrderRow) => (
        <span className={`wo-tag wo-tag--${STATUS_TONE[row.status]}`}>
          {WO_STATUS_TEXT[row.status]}
        </span>
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 110,
      render: (_: unknown, row: MockWorkOrderRow) => renderAction(row),
    },
  ]

  return (
    <div className="wo-page">
      <PageContainer
        title="服务工单"
        description="处理运营平台分配至当前机构的订单，完成派单、联系、改期与履约管理"
      >
        {/* 统计卡 */}
        <div className="wo-stats">
          {stats.map((s) => (
            <div key={s.label} className="wo-stat">
              <div className="wo-stat__label">{s.label}</div>
              <div className={`wo-stat__value wo-stat__value--${s.tone}`}>{s.value}</div>
            </div>
          ))}
        </div>

        {/* 规则提示 */}
        <div className="wo-banner">
          预约日期与时段来自 C 端订单（至少提前一天）；机构无需再次与用户确认预约后才派单。
        </div>

        {/* 状态 Tabs */}
        <div className="wo-tabs">
          {WO_STATUS_TABS.map((t) => (
            <span
              key={t.key}
              className={t.key === activeTab ? 'wo-tabs__item wo-tabs__item--active' : 'wo-tabs__item'}
              onClick={() => {
                setActiveTab(t.key)
                setPage(1)
              }}
            >
              {t.label}
            </span>
          ))}
        </div>

        {/* 筛选 */}
        <div className="wo-filters">
          <Input
            className="wo-filters__search"
            prefix={<SearchOutlined />}
            placeholder="工单号 / 订单号 / 姓名 / 手机号"
            value={filters.keyword}
            onChange={(e) => setFilters((f) => ({ ...f, keyword: e.target.value.trim() }))}
            allowClear
          />
          <Select
            placeholder="工单状态：全部"
            value={filters.status}
            onChange={(v) => setFilters((f) => ({ ...f, status: v }))}
            options={Object.entries(WO_STATUS_TEXT).map(([value, label]) => ({ value, label }))}
            allowClear
          />
          <Select
            placeholder="服务项目：全部"
            value={filters.service}
            onChange={(v) => setFilters((f) => ({ ...f, service: v }))}
            options={serviceOptions.map((s) => ({ value: s, label: s }))}
            allowClear
          />
          <DatePicker
            placeholder="预约日期"
            onChange={(_, ds) =>
              setFilters((f) => ({ ...f, date: typeof ds === 'string' ? ds : undefined }))
            }
          />
          <Button type="primary" onClick={() => setPage(1)}>
            查询
          </Button>
          <Button onClick={onReset}>重置</Button>
        </div>

        {/* 工单表格 */}
        <div className="wo-list">
          <Table<MockWorkOrderRow>
            rowKey="id"
            columns={columns}
            dataSource={filtered}
            pagination={{
              current: page,
              pageSize,
              total: filtered.length,
              onChange: setPage,
              showTotal: (total) => `每页 ${pageSize} 条 · 共 ${total} 条`,
            }}
          />
        </div>
      </PageContainer>
    </div>
  )
}
