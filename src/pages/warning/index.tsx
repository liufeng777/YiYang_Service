/**
 * 预警管理 - 预警列表（设计稿：预警列表.png）
 * 同一健康事件只生成一个医生处置单；由该事件派生的层级变化作为影响结果合并展示
 * TODO: 接入后端后替换为 warningApi.getWarnings（API §6.1）
 */
import { useMemo, useState } from 'react'
import { Button, Card, DatePicker, Input, Select, Table, message } from 'antd'
import { useNavigate } from 'react-router-dom'
import PageContainer from '@/components/PageContainer'
import {
  WARNING_STATUS_TEXT,
  WARNING_TYPE_TEXT,
  mockWarningList,
  mockWarningStats,
  type MockWarningRow,
  type WarningStatus,
  type WarningType,
} from './mock'
import './index.less'

interface Filters {
  keyword: string
  status?: WarningStatus
  type?: WarningType
  level?: string
  date?: string
}

export default function WarningList() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<WarningType | 'all'>('all')
  const [filters, setFilters] = useState<Filters>({ keyword: '' })
  const [applied, setApplied] = useState<Filters>({ keyword: '' })
  const [page, setPage] = useState(1)
  const pageSize = 20

  const filtered = useMemo(
    () =>
      mockWarningList.filter((row) => {
        if (activeTab !== 'all' && row.type !== activeTab) return false
        if (applied.keyword && ![row.id, row.content].some((v) => v.includes(applied.keyword)))
          return false
        if (applied.status && row.status !== applied.status) return false
        if (applied.type && row.type !== applied.type) return false
        if (applied.level && row.currentLevel !== applied.level) return false
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
    { label: '待处理', value: mockWarningStats.pending, note: mockWarningStats.pendingNote, noteTone: 'red' },
    { label: '医生复核', value: mockWarningStats.reviewing, note: mockWarningStats.reviewingNote, noteTone: 'orange' },
    { label: '已关闭', value: mockWarningStats.closed, note: mockWarningStats.closedNote, noteTone: 'green' },
    { label: '高风险', value: mockWarningStats.highRisk, note: mockWarningStats.highRiskNote, noteTone: 'red' },
  ]

  const columns = [
    { title: '预警编号', dataIndex: 'id', key: 'id' },
    { title: '预警内容', dataIndex: 'content', key: 'content' },
    {
      title: '数据来源',
      dataIndex: 'source',
      key: 'source',
      render: (v: string) => <span className="wn-text--primary">{v}</span>,
    },
    { title: '当前分层', dataIndex: 'currentLevel', key: 'currentLevel' },
    { title: '触发时间', dataIndex: 'triggeredAt', key: 'triggeredAt' },
    {
      title: '预警类型',
      key: 'type',
      render: (_: unknown, row: MockWarningRow) => (
        <span className={`wn-tag wn-tag--${row.type === 'health' ? 'red' : 'blue'}`}>
          {WARNING_TYPE_TEXT[row.type]}
        </span>
      ),
    },
    {
      title: '处理状态',
      key: 'status',
      render: (_: unknown, row: MockWarningRow) => (
        <span
          className={`wn-tag wn-tag--${row.status === 'pending' ? 'red' : row.status === 'reviewing' ? 'blue' : 'green'}`}
        >
          {WARNING_STATUS_TEXT[row.status]}
        </span>
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 90,
      render: (_: unknown, row: MockWarningRow) => (
        <Button
          size="small"
          onClick={() =>
            navigate(`/warning/${row.id}/${row.status === 'closed' ? 'close' : 'handle'}`)
          }
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
        extra={<Button onClick={() => message.success('导出任务已创建，完成后可下载')}>导出记录</Button>}
      >
        {/* 类型 Tabs */}
        <div className="wn-tabs">
          {(
            [
              { key: 'all', label: '全部预警' },
              { key: 'health', label: '健康异常预警' },
              { key: 'level', label: '层级变更' },
            ] as const
          ).map((t) => (
            <span
              key={t.key}
              className={t.key === activeTab ? 'wn-tabs__item wn-tabs__item--active' : 'wn-tabs__item'}
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
        <div className="wn-stats">
          {stats.map((s) => (
            <div key={s.label} className="wn-stat">
              <div className="wn-stat__label">{s.label}</div>
              <div className="wn-stat__body">
                <span className="wn-stat__value">{s.value}</span>
                <span className={`wn-tag wn-tag--${s.noteTone}`}>{s.note}</span>
              </div>
            </div>
          ))}
        </div>

        {/* 筛选 */}
        <Card variant="borderless" className="filter-bar">
          <Input
            placeholder="姓名 / 会员ID / 预警编号"
            value={filters.keyword}
            onChange={(e) => setFilters((f) => ({ ...f, keyword: e.target.value.trim() }))}
            allowClear
          />
          <Select
            placeholder="全部状态"
            value={filters.status}
            onChange={(v) => setFilters((f) => ({ ...f, status: v }))}
            options={Object.entries(WARNING_STATUS_TEXT).map(([value, label]) => ({ value, label }))}
            allowClear
          />
          <Select
            placeholder="全部类型"
            value={filters.type}
            onChange={(v) => setFilters((f) => ({ ...f, type: v }))}
            options={Object.entries(WARNING_TYPE_TEXT).map(([value, label]) => ({ value, label }))}
            allowClear
          />
          <Select
            placeholder="全部风险"
            value={filters.level}
            onChange={(v) => setFilters((f) => ({ ...f, level: v }))}
            options={['高风险', '中风险', '低风险'].map((v) => ({ value: v, label: v }))}
            allowClear
          />
          <DatePicker
            placeholder="触发日期"
            onChange={(_, ds) =>
              setFilters((f) => ({ ...f, date: typeof ds === 'string' ? ds : undefined }))
            }
          />
          <Button onClick={onReset}>重置</Button>
          <Button type="primary" onClick={applyFilters}>查询</Button>
        </Card>

        {/* 预警表格 */}
        <Card variant="borderless" className="list-card">
          <Table<MockWarningRow>
            rowKey="id"
            columns={columns}
            dataSource={filtered}
            pagination={{
              current: page,
              pageSize,
              total: 18,
              onChange: setPage,
              showTotal: (total) => `共 ${total} 条`,
            }}
          />
        </Card>
      </PageContainer>
    </div>
  )
}
