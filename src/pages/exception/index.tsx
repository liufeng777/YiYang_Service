/**
 * 异常处理 - 异常列表（设计稿：异常列表.png）
 * 服务人员助手端上报分为健康异常与工单异常，分别进入对应处置流程
 * TODO: 履约异常列表接口 API v0.1 未定义，数据为本地 mock
 */
import { useMemo, useState } from 'react'
import { Button, Card, DatePicker, Input, Select, Table, message } from 'antd'
import { useNavigate } from 'react-router-dom'
import PageContainer from '@/components/PageContainer'
import {
  EXCEPTION_STATUS_TEXT,
  EXCEPTION_TYPE_TEXT,
  mockExceptionList,
  mockExceptionStats,
  type ExceptionStatus,
  type ExceptionType,
  type MockExceptionRow,
} from './mock'
import './index.less'

interface Filters {
  keyword: string
  status?: ExceptionStatus
  type?: ExceptionType
  urgency?: string
  date?: string
}

export default function ExceptionList() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<ExceptionType | 'all'>('all')
  const [filters, setFilters] = useState<Filters>({ keyword: '' })
  const [applied, setApplied] = useState<Filters>({ keyword: '' })
  const [page, setPage] = useState(1)
  const pageSize = 20

  const filtered = useMemo(
    () =>
      mockExceptionList.filter((row) => {
        if (activeTab !== 'all' && row.type !== activeTab) return false
        if (applied.keyword && ![row.id, row.content].some((v) => v.includes(applied.keyword)))
          return false
        if (applied.status && row.status !== applied.status) return false
        if (applied.type && row.type !== applied.type) return false
        return true
      }),
    [activeTab, applied],
  )

  const applyFilters = () => {
    setApplied(filters)
    setPage(1)
  }

  const onReset = () => {
    setFilters({ keyword: '' })
    setApplied({ keyword: '' })
    setActiveTab('all')
    setPage(1)
  }

  const stats = [
    { label: '待受理', value: mockExceptionStats.pending, note: mockExceptionStats.pendingNote, noteTone: 'red' },
    { label: '处理中', value: mockExceptionStats.processing, note: mockExceptionStats.processingNote, noteTone: 'orange' },
    { label: '已闭环', value: mockExceptionStats.closed, note: mockExceptionStats.closedNote, noteTone: 'green' },
    { label: '超时', value: mockExceptionStats.timeout, note: mockExceptionStats.timeoutNote, noteTone: 'red' },
  ]

  const columns = [
    { title: '异常编号', dataIndex: 'id', key: 'id' },
    { title: '上报内容', dataIndex: 'content', key: 'content' },
    {
      title: '关联工单',
      dataIndex: 'woNo',
      key: 'woNo',
      render: (v: string) => <span className="ex-text--primary">{v}</span>,
    },
    { title: '上报人', dataIndex: 'reporter', key: 'reporter' },
    { title: '上报时间', dataIndex: 'reportedAt', key: 'reportedAt' },
    {
      title: '异常分类',
      key: 'type',
      render: (_: unknown, row: MockExceptionRow) => (
        <span className={`ex-tag ex-tag--${row.type === 'health' ? 'red' : 'blue'}`}>
          {EXCEPTION_TYPE_TEXT[row.type]}
        </span>
      ),
    },
    {
      title: '处理状态',
      key: 'status',
      render: (_: unknown, row: MockExceptionRow) => (
        <span
          className={`ex-tag ex-tag--${row.status === 'pending' ? 'red' : row.status === 'processing' ? 'blue' : 'green'}`}
        >
          {EXCEPTION_STATUS_TEXT[row.status]}
        </span>
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 90,
      render: (_: unknown, row: MockExceptionRow) => (
        <Button
          size="small"
          onClick={() => navigate(`/exception/${row.id}/${row.type === 'health' ? 'health' : 'wo'}`)}
        >
          查看
        </Button>
      ),
    },
  ]

  return (
    <div className="ex-page">
      <PageContainer
        title="异常处理"
        description="服务人员助手端上报分为健康异常与工单异常，分别进入对应处置流程"
        extra={<Button onClick={() => message.success('导出任务已创建，完成后可下载')}>导出记录</Button>}
      >
        {/* 类型 Tabs */}
        <div className="ex-tabs">
          {(
            [
              { key: 'all', label: '全部异常' },
              { key: 'health', label: '健康异常' },
              { key: 'wo', label: '工单异常' },
            ] as const
          ).map((t) => (
            <span
              key={t.key}
              className={t.key === activeTab ? 'ex-tabs__item ex-tabs__item--active' : 'ex-tabs__item'}
              onClick={() => {
                setActiveTab(t.key)
                setPage(1)
              }}
            >
              {t.label}
            </span>
          ))}
        </div>

        {/* 统计卡 */}
        <div className="ex-stats">
          {stats.map((s) => (
            <div key={s.label} className="ex-stat">
              <div className="ex-stat__label">{s.label}</div>
              <div className="ex-stat__body">
                <span className="ex-stat__value">{s.value}</span>
                <span className={`ex-tag ex-tag--${s.noteTone}`}>{s.note}</span>
              </div>
            </div>
          ))}
        </div>

        {/* 筛选 */}
        <Card variant="borderless" className="filter-bar">
          <Input
            placeholder="异常编号 / 关键词"
            value={filters.keyword}
            onChange={(e) => setFilters((f) => ({ ...f, keyword: e.target.value.trim() }))}
            allowClear
          />
          <Select
            placeholder="全部状态"
            value={filters.status}
            onChange={(v) => setFilters((f) => ({ ...f, status: v }))}
            options={Object.entries(EXCEPTION_STATUS_TEXT).map(([value, label]) => ({ value, label }))}
            allowClear
          />
          <Select
            placeholder="全部分类"
            value={filters.type}
            onChange={(v) => setFilters((f) => ({ ...f, type: v }))}
            options={Object.entries(EXCEPTION_TYPE_TEXT).map(([value, label]) => ({ value, label }))}
            allowClear
          />
          <Select
            placeholder="全部等级"
            value={filters.urgency}
            onChange={(v) => setFilters((f) => ({ ...f, urgency: v }))}
            options={['紧急', '高', '中', '低'].map((v) => ({ value: v, label: v }))}
            allowClear
          />
          <DatePicker
            placeholder="上报日期"
            onChange={(_, ds) =>
              setFilters((f) => ({ ...f, date: typeof ds === 'string' ? ds : undefined }))
            }
          />
          <Button onClick={onReset}>重置</Button>
          <Button type="primary" onClick={applyFilters}>查询</Button>
        </Card>

        {/* 异常表格 */}
        <Card variant="borderless" className="list-card">
          <Table<MockExceptionRow>
            rowKey="id"
            columns={columns}
            dataSource={filtered}
            pagination={{
              current: page,
              pageSize,
              total: 49,
              onChange: setPage,
              showTotal: (total) => `共 ${total} 条`,
            }}
          />
        </Card>
      </PageContainer>
    </div>
  )
}
