/**
 * 预警管理 - 预警列表（设计稿：预警列表.png）
 * 已对接 GET /api/v1/staff/warnings（服务端分页，支持 status / severity 筛选）
 * 说明：预警类型（健康异常/层级变更）Tabs 与统计卡无对应接口，已移除；
 * 关键字筛选 API 未提供参数，已移除
 */
import { useCallback, useEffect, useState } from 'react'
import { Button, Card, Select, Table } from 'antd'
import { useNavigate } from 'react-router-dom'
import dayjs from 'dayjs'
import PageContainer from '@/components/PageContainer'
import { warningApi } from '@/api'
import {
  WARNING_SEVERITY_MAP,
  WARNING_STATUS_MAP,
  type WarningItem,
} from '@/api/modules/warning'
import './index.less'

const SEVERITY_TONE: Record<number, string> = { 1: 'green', 2: 'orange', 3: 'red' }
const STATUS_TONE: Record<number, string> = {
  0: 'red',
  1: 'red',
  2: 'blue',
  3: 'green',
  4: 'green',
  5: 'orange',
}

interface Filters {
  status?: number
  severity?: number
}

export default function WarningList() {
  const navigate = useNavigate()
  const [filters, setFilters] = useState<Filters>({})
  const [applied, setApplied] = useState<Filters>({})
  const [list, setList] = useState<WarningItem[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)

  const fetchList = useCallback(async () => {
    setLoading(true)
    try {
      const res = await warningApi.getWarnings({
        page,
        page_size: pageSize,
        status: applied.status,
        severity: applied.severity,
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
    setFilters({})
    setApplied({})
    setPage(1)
  }

  const columns = [
    { title: '预警编号', dataIndex: 'id', key: 'id', width: 100 },
    { title: '预警内容', dataIndex: 'title', key: 'title' },
    {
      title: '服务对象',
      key: 'member',
      render: (_: unknown, row: WarningItem) => row.member_name || `会员 #${row.member_id}`,
    },
    {
      title: '预警等级',
      key: 'severity',
      render: (_: unknown, row: WarningItem) => (
        <span className={`wn-tag wn-tag--${SEVERITY_TONE[row.severity] ?? 'blue'}`}>
          {WARNING_SEVERITY_MAP[row.severity] ?? '-'}
        </span>
      ),
    },
    {
      title: '处理状态',
      key: 'status',
      render: (_: unknown, row: WarningItem) => (
        <span className={`wn-tag wn-tag--${STATUS_TONE[row.warning_status] ?? 'blue'}`}>
          {WARNING_STATUS_MAP[row.warning_status] ?? '-'}
        </span>
      ),
    },
    {
      title: '触发时间',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (v: number) => (v ? dayjs(v * 1000).format('YYYY-MM-DD HH:mm') : '-'),
    },
    {
      title: '操作',
      key: 'action',
      width: 90,
      render: (_: unknown, row: WarningItem) => (
        <Button
          size="small"
          onClick={() => navigate(`/warning/${row.id}/handle`)}
        >
          查看
        </Button>
      ),
    },
  ]

  return (
    <div className="wn-page">
      <PageContainer
        title="预警管理"
        description="同一健康事件只生成一个医生处置单；由该事件派生的层级变化作为影响结果合并展示"
      >
        {/* 筛选 */}
        <Card variant="borderless" className="filter-bar">
          <Select
            placeholder="全部状态"
            value={filters.status}
            onChange={(v) => setFilters((f) => ({ ...f, status: v }))}
            options={Object.entries(WARNING_STATUS_MAP).map(([value, label]) => ({
              value: Number(value),
              label,
            }))}
            allowClear
          />
          <Select
            placeholder="全部风险"
            value={filters.severity}
            onChange={(v) => setFilters((f) => ({ ...f, severity: v }))}
            options={Object.entries(WARNING_SEVERITY_MAP).map(([value, label]) => ({
              value: Number(value),
              label,
            }))}
            allowClear
          />
          <Button onClick={onReset}>重置</Button>
          <Button type="primary" onClick={applyFilters}>查询</Button>
        </Card>

        {/* 预警表格 */}
        <Card variant="borderless" className="list-card table-fill">
          <Table<WarningItem>
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
    </div>
  )
}
