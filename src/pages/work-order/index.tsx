/**
 * 服务工单 - 工单列表（设计稿：状态Tab.png）
 * 已对接 GET /api/v1/staff/work-orders（服务端分页，支持 wo_status / keyword / service_date 筛选）
 * 说明：顶部统计卡与服务项目筛选无对应接口，已移除
 */
import { useCallback, useEffect, useState } from 'react'
import { Button, Card, DatePicker, Input, Select, Table } from 'antd'
import { SearchOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import dayjs from 'dayjs'
import PageContainer from '@/components/PageContainer'
import { workOrderApi } from '@/api'
import {
  WO_CONTACT_STATUS_MAP,
  WO_STATUS_MAP,
  type WorkOrderItem,
} from '@/api/modules/work-order'
import './index.less'

/** 工单状态标签配色（wo-tag--*） */
const STATUS_TONE: Record<number, string> = {
  1: 'orange',
  2: 'blue',
  3: 'blue',
  4: 'green',
  5: 'green',
  6: 'orange',
  7: 'green',
  8: 'purple',
  9: 'red',
}

const CONTACT_TONE: Record<number, string> = {
  1: 'blue',
  2: 'orange',
  3: 'green',
  4: 'orange',
  5: 'purple',
  6: 'red',
}

const STATUS_TABS = [
  { key: 0, label: '全部' },
  ...Object.entries(WO_STATUS_MAP).map(([value, label]) => ({ key: Number(value), label })),
]

interface Filters {
  keyword: string
  status?: number
  date?: string
}

export default function WorkOrderList() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<number>(0)
  const [filters, setFilters] = useState<Filters>({ keyword: '' })
  const [applied, setApplied] = useState<Filters>({ keyword: '' })
  const [list, setList] = useState<WorkOrderItem[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)

  const fetchList = useCallback(async () => {
    setLoading(true)
    try {
      const res = await workOrderApi.getWorkOrders({
        page,
        page_size: pageSize,
        wo_status: activeTab || undefined,
        keyword: applied.keyword || undefined,
        service_date: applied.date,
      })
      setList(res.list)
      setTotal(res.total)
    } catch {
      // 错误提示由拦截器统一处理
    } finally {
      setLoading(false)
    }
  }, [page, pageSize, activeTab, applied])

  useEffect(() => {
    fetchList()
  }, [fetchList])

  const applyFilters = () => {
    setApplied(filters)
    setPage(1)
  }

  const onReset = () => {
    setFilters({ keyword: '' })
    setApplied({ keyword: '' })
    setActiveTab(0)
    setPage(1)
  }

  const renderAction = (row: WorkOrderItem) => {
    switch (row.wo_status) {
      case 1:
        return (
          <Button
            type="primary"
            size="small"
            onClick={() => navigate(`/work-order/${row.id}?dispatch=1`)}
          >
            去派单
          </Button>
        )
      case 5:
        return (
          <Button size="small" onClick={() => navigate(`/work-order/${row.id}`)}>
            查看进度
          </Button>
        )
      case 8:
        return (
          <Button
            type="primary"
            size="small"
            onClick={() => navigate(`/work-order/${row.id}?reschedule=1`)}
          >
            处理改期
          </Button>
        )
      case 6:
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
      render: (_: unknown, row: WorkOrderItem) => (
        <div>
          <div className="wo-row__name">{row.wo_no}</div>
          <div className="wo-row__sub">订单 {row.order_no || '-'}</div>
        </div>
      ),
    },
    {
      title: '服务对象',
      key: 'member',
      render: (_: unknown, row: WorkOrderItem) => (
        <div>
          <div>{row.member_name || '-'}</div>
          <div className="wo-row__sub">{row.member_phone || row.contact_phone || '-'}</div>
        </div>
      ),
    },
    { title: '服务项目', dataIndex: 'service_name', key: 'service_name' },
    {
      title: '预约时间',
      key: 'appointment',
      render: (_: unknown, row: WorkOrderItem) =>
        row.expected_start_at
          ? `${dayjs(row.expected_start_at * 1000).format('MM-DD HH:mm')} ~ ${dayjs(
              (row.expected_stop_at || row.expected_start_at) * 1000,
            ).format('HH:mm')}`
          : '-',
    },
    {
      title: '服务人员',
      key: 'staff',
      render: (_: unknown, row: WorkOrderItem) =>
        row.expect_staff_name ? (
          <span>{row.expect_staff_name}</span>
        ) : (
          <span className="wo-row__sub">—</span>
        ),
    },
    {
      title: '联系状态',
      key: 'contactStatus',
      render: (_: unknown, row: WorkOrderItem) =>
        row.contact_status ? (
          <span className={`wo-tag wo-tag--${CONTACT_TONE[row.contact_status] ?? 'blue'}`}>
            {WO_CONTACT_STATUS_MAP[row.contact_status] ?? '-'}
          </span>
        ) : (
          <span className="wo-row__sub">—</span>
        ),
    },
    {
      title: '工单状态',
      key: 'status',
      render: (_: unknown, row: WorkOrderItem) => (
        <span className={`wo-tag wo-tag--${STATUS_TONE[row.wo_status] ?? 'blue'}`}>
          {WO_STATUS_MAP[row.wo_status] ?? '-'}
        </span>
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 110,
      render: (_: unknown, row: WorkOrderItem) => renderAction(row),
    },
  ]

  return (
    <div className="wo-page">
      <PageContainer
        title="服务工单"
        description="处理运营平台分配至当前机构的订单，完成派单、联系、改期与履约管理"
      >
        {/* 规则提示 */}
        <div className="wo-banner">
          预约日期与时段来自 C 端订单（至少提前一天）；机构无需再次与用户确认预约后才派单。
        </div>

        {/* 状态 Tabs */}
        <div className="wo-tabs">
          {STATUS_TABS.map((t) => (
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
        <Card variant="borderless" className="filter-bar">
          <Input
            prefix={<SearchOutlined />}
            placeholder="工单号 / 订单号 / 姓名 / 手机号"
            value={filters.keyword}
            onChange={(e) => setFilters((f) => ({ ...f, keyword: e.target.value.trim() }))}
            allowClear
          />
          <Select
            placeholder="工单状态：全部"
            value={filters.status}
            onChange={(v) => {
              setFilters((f) => ({ ...f, status: v }))
              setActiveTab(v ?? 0)
              setPage(1)
            }}
            options={Object.entries(WO_STATUS_MAP).map(([value, label]) => ({
              value: Number(value),
              label,
            }))}
            allowClear
          />
          <DatePicker
            placeholder="预约日期"
            onChange={(d) =>
              setFilters((f) => ({ ...f, date: d ? d.format('YYYY-MM-DD') : undefined }))
            }
          />
          <Button onClick={onReset}>重置</Button>
          <Button type="primary" onClick={applyFilters}>查询</Button>
        </Card>

        {/* 工单表格 */}
        <Card variant="borderless" className="list-card table-fill">
          <Table<WorkOrderItem>
            rowKey="id"
            columns={columns}
            dataSource={list}
            loading={loading}
            pagination={{
              current: page,
              pageSize,
              total,
              onChange: (nextPage, nextPageSize) => {
                setPage(nextPage)
                setPageSize(nextPageSize)
              },
              showTotal: (total) => `共 ${total} 条`,
            }}
          />
        </Card>
      </PageContainer>
    </div>
  )
}
