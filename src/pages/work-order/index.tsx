/**
 * 服务工单 - 工单列表（设计稿：状态Tab.png）
 * 已对接 GET /api/v1/staff/work-orders（服务端分页，支持 wo_status / keyword / service_date 筛选）
 * 说明：顶部统计卡与服务项目筛选无对应接口，已移除
 */
import { useCallback, useEffect, useState } from 'react'
import { Button, Card, DatePicker, Input, Select, Table } from 'antd'
import { useNavigate } from 'react-router-dom'
import PageContainer from '@/components/PageContainer'
import { workOrderApi } from '@/api'
import DispatchBoard from './DispatchBoard'
import { WO_STATUS_MAP, type WorkOrderItem } from '@/api/modules/work-order';
import { formatDateTime } from '@/utils'
import './index.less'

/** 工单状态标签配色（wo-tag--*，对齐最新 WO_STATUS_MAP） */
const STATUS_TONE: Record<number, string> = {
  1: 'orange', // 待派单
  2: 'blue', // 待接单(已派单)
  3: 'blue', // 待服务
  4: 'green', // 服务中
  5: 'green', // 已完成
  8: 'gray', // 已取消
  9: 'red', // 服务终止
}

interface Filters {
  keyword: string
  status?: number
  date?: string
}

export default function WorkOrderList() {
  const navigate = useNavigate()
  const [filters, setFilters] = useState<Filters>({ keyword: '' })
  const [applied, setApplied] = useState<Filters>({ keyword: '' })
  const [list, setList] = useState<WorkOrderItem[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  /* 批量派单排单板 */
  const [batchOpen, setBatchOpen] = useState(false)
  const [batchLoading, setBatchLoading] = useState(false)
  const [pendingOrders, setPendingOrders] = useState<WorkOrderItem[]>([])

  /** 打开批量派单：拉取待派单队列；为空 / 异常时传空数组，排单板自动进入 mock 演示 */
  const onOpenBatch = async () => {
    setBatchLoading(true)
    try {
      const res = await workOrderApi.getPendingDispatch({ page: 1, page_size: 50 })
      setPendingOrders(res.list)
    } catch {
      setPendingOrders([])
    } finally {
      setBatchLoading(false)
      setBatchOpen(true)
    }
  }

  const fetchList = useCallback(async () => {
    setLoading(true)
    try {
      const res = await workOrderApi.getWorkOrders({
        page,
        page_size: pageSize,
        wo_status: applied.status,
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
  }, [page, pageSize, applied])

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
      default:
        return (
          <Button size="small" onClick={() => navigate(`/work-order/${row.id}`)}>
            查看详情
          </Button>
        )
    }
  }

  const columns = [
    {
      title: '工单 / 订单',
      key: 'wo',
      render: (_: unknown, row: WorkOrderItem) => (
        <div className='table-cell'>
          <strong>{row.work_order_no}</strong>
          <span>订单 {row.order_no || '-'}</span>
        </div>
      ),
    },
    {
      title: '服务对象',
      key: 'member',
      render: (_: unknown, row: WorkOrderItem) => (
        <div className='table-cell'>
          <strong>{row.member_name || '-'}</strong>
          <span>{row.member_phone || row.contact_phone || '-'}</span>
        </div>
      ),
    },
    {
      title: '联系人',
      key: 'contact_name',
      render: (_: unknown, row: WorkOrderItem) => (
        <div className='table-cell'>
          <strong>{row.contact_name || '-'}</strong>
          <span>{row.member_phone || row.contact_phone || '-'}</span>
        </div>
      ),
    },
    { 
      title: '服务项目/时长(分钟)',
      dataIndex: 'service_name',
      key: 'service_name',
      render: (_: unknown, row: WorkOrderItem) => (
        <div className='table-cell'>
          <strong>{row.service_name || '-'}</strong>
          <span>{row.duration}</span>
        </div>
      ),
    },
    {
      title: '服务人员/时间',
      key: 'appointment',
      render: (_: unknown, row: WorkOrderItem) => <div className='table-cell'>
        {row.wo_status === 1 ? (
          <>
            <strong>{row.expect_staff_name || '-'}</strong>
            <span>
              {row.expected_start_at ? formatDateTime(row.expected_start_at * 1000) : '-'}
            </span>
          </>
        ) :(
          <>
            <strong>{row.assigned_staff_name || '-'}</strong>
            <span>
              {row.assigned_at ? formatDateTime(row.assigned_at * 1000) : '-'}
            </span>
          </>
        )}
        </div>
    },
    {
      title: '工单状态',
      key: 'status',
      render: (_: unknown, row: WorkOrderItem) => (
        <span className={`status-tag status-tag--${STATUS_TONE[row.wo_status] ?? 'blue'}`}>
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
        extra={
          <Button color="primary" variant="outlined" loading={batchLoading} onClick={onOpenBatch}>
            批量派单
          </Button>
        }
      >
        {/* 规则提示 */}
        {/* <div className="wo-banner">
          预约日期与时段来自 C 端订单（至少提前一天）；机构无需再次与用户确认预约后才派单。
        </div> */}

        {/* 状态 Tabs */}
        {/* <div className="wo-tabs">
          {STATUS_TABS.map((t) => (
            <span
              key={t.key}
              className={t.key === activeTab ? 'wo-tabs__item wo-tabs__item--active' : 'wo-tabs__item'}
              onClick={() => {
                setActiveTab(t.key)
                setFilters((f) => ({ ...f, status: t.key || undefined }))
                setPage(1)
              }}
            >
              {t.label}
            </span>
          ))}
        </div> */}

        {/* 筛选 */}
        <Card variant="borderless" className="filter-bar">
          <Input
            placeholder="工单号 / 订单号 / 姓名 / 手机号"
            value={filters.keyword}
            onChange={(e) => setFilters((f) => ({ ...f, keyword: e.target.value.trim() }))}
            allowClear
          />
          <Select
            placeholder="工单状态：全部"
            value={filters.status}
            onChange={(v) => setFilters((f) => ({ ...f, status: v }))}
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
              showSizeChanger: true,
              showTotal: (total) => `共 ${total} 条`,
            }}
          />
        </Card>
      </PageContainer>

      {/* 批量派单排单板（队列为空时自动进入 mock 演示，覆盖各种冲突情况） */}
      {batchOpen && (
        <DispatchBoard
          open={batchOpen}
          orders={pendingOrders}
          onClose={() => setBatchOpen(false)}
          onDone={() => {
            setBatchOpen(false)
            fetchList()
          }}
        />
      )}
    </div>
  )
}
