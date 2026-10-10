/**
 * 管理目标 - 目标列表（设计稿：健管师.png）
 * 健管师视角：查看自己管理用户的目标状态与跟进任务；临床目标值由医生确认
 * TODO: 跨会员目标列表 / 统计接口 API v0.1 未定义，数据为本地 mock（见 ./mock.ts）
 */
import { useMemo, useState } from 'react'
import { Button, Card, Input, Select, Table } from 'antd'
import { FlagOutlined, SearchOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import PageContainer from '@/components/PageContainer'
import { mockGoalList, mockGoalStats, type MockGoalRow } from './mock'
import './index.less'

interface Filters {
  keyword: string
  status?: 'active' | 'pending'
  disease?: string
  doctor?: string
}

const STATUS_OPTIONS = [
  { value: 'active', label: '生效中' },
  { value: 'pending', label: '待医生制定' },
]

export default function GoalList() {
  const navigate = useNavigate()
  const [filters, setFilters] = useState<Filters>({ keyword: '' })
  const [applied, setApplied] = useState<Filters>({ keyword: '' })
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)

  const diseaseOptions = useMemo(() => [...new Set(mockGoalList.map((r) => r.disease))], [])
  const doctorOptions = useMemo(() => [...new Set(mockGoalList.map((r) => r.doctor))], [])

  const filtered = useMemo(
    () =>
      mockGoalList.filter((row) => {
        if (applied.keyword && !row.memberName.includes(applied.keyword)) return false
        if (applied.status && row.status !== applied.status) return false
        if (applied.disease && row.disease !== applied.disease) return false
        if (applied.doctor && row.doctor !== applied.doctor) return false
        return true
      }),
    [applied],
  )

  const applyFilters = () => {
    setApplied(filters)
    setPage(1)
  }

  const onReset = () => {
    setFilters({ keyword: '' })
    setApplied({ keyword: '' })
    setPage(1)
  }

  const stats = [
    { label: '待医生制定', value: mockGoalStats.pending, tone: 'warn' },
    { label: '已生效目标', value: mockGoalStats.active },
    { label: '本周需评价', value: mockGoalStats.weekReview, tone: 'info' },
    { label: '需跟进', value: mockGoalStats.needFollow, tone: 'danger' },
  ]

  const columns = [
    {
      title: '服务对象',
      key: 'member',
      render: (_: unknown, row: MockGoalRow) => (
        <div>
          <div className="goal-row__name">{row.memberName}</div>
          <div className="goal-row__sub">
            {row.gender} · {row.age}岁
          </div>
        </div>
      ),
    },
    {
      title: '目标组合',
      key: 'goals',
      render: (_: unknown, row: MockGoalRow) =>
        row.status === 'pending' ? (
          <span className="goal-text--warn">待医生制定</span>
        ) : (
          <div className="goal-row__tags">
            {row.goals.map((g) => (
              <span key={g} className="goal-tag goal-tag--green">
                {g}
              </span>
            ))}
          </div>
        ),
    },
    {
      title: '生效周期',
      key: 'period',
      render: (_: unknown, row: MockGoalRow) => <span>{row.period}</span>,
    },
    {
      title: '当前评价',
      key: 'evaluation',
      render: (_: unknown, row: MockGoalRow) =>
        row.evaluation ? (
          <span className="goal-text--warn">{row.evaluation}</span>
        ) : (
          <span className="goal-row__sub">—</span>
        ),
    },
    {
      title: '待办',
      key: 'todo',
      render: (_: unknown, row: MockGoalRow) => <span>{row.todo}</span>,
    },
    {
      title: '责任医生',
      key: 'doctor',
      render: (_: unknown, row: MockGoalRow) => <span>{row.doctor}</span>,
    },
    {
      title: '操作',
      key: 'action',
      width: 110,
      render: (_: unknown, row: MockGoalRow) =>
        row.status === 'pending' ? (
          <Button type="link" size="small" onClick={() => navigate('/goal/design')}>
            查看任务
          </Button>
        ) : (
          <Button type="link" size="small" onClick={() => navigate(`/health-record/${row.id}`)}>
            查看目标
          </Button>
        ),
    },
  ]

  return (
    <div className="goal-page">
      <PageContainer
        title="管理目标"
        description="查看自己管理用户的目标状态与跟进任务；临床目标值由医生确认"
        extra={
          <Button type="primary" icon={<FlagOutlined />} onClick={() => navigate('/goal/create')}>
            发起目标制定
          </Button>
        }
      >
        {/* 统计卡 */}
        <div className="goal-stats">
          {stats.map((s) => (
            <div key={s.label} className="goal-stat">
              <div className="goal-stat__label">{s.label}</div>
              <div className={s.tone ? `goal-stat__value goal-stat__value--${s.tone}` : 'goal-stat__value'}>
                {s.value}
              </div>
            </div>
          ))}
        </div>

        {/* 筛选卡 */}
        <Card variant="borderless" className="filter-bar">
          <Select
            placeholder="全部状态"
            value={filters.status}
            onChange={(v) => setFilters((f) => ({ ...f, status: v }))}
            options={STATUS_OPTIONS}
            allowClear
          />
          <Select
            placeholder="全部病种"
            value={filters.disease}
            onChange={(v) => setFilters((f) => ({ ...f, disease: v }))}
            options={diseaseOptions.map((d) => ({ value: d, label: d }))}
            allowClear
          />
          <Input
            prefix={<SearchOutlined />}
            placeholder="服务对象：姓名 / 会员ID / 手机号"
            value={filters.keyword}
            onChange={(e) => setFilters((f) => ({ ...f, keyword: e.target.value.trim() }))}
            allowClear
          />
          <Select
            placeholder="全部责任医生"
            value={filters.doctor}
            onChange={(v) => setFilters((f) => ({ ...f, doctor: v }))}
            options={doctorOptions.map((d) => ({ value: d, label: d }))}
            allowClear
          />
          <Button onClick={onReset}>重置</Button>
          <Button type="primary" onClick={applyFilters}>查询</Button>
        </Card>

        {/* 目标列表卡 */}
        <Card variant="borderless" className="list-card table-fill">
          <Table<MockGoalRow>
            rowKey="id"
            columns={columns}
            dataSource={filtered}
            pagination={{
              current: page,
              pageSize,
              total: filtered.length,
              onChange: (nextPage, nextPageSize) => {
                setPage(nextPage)
                setPageSize(nextPageSize)
              },
              showTotal: (total) => `共 ${total} 条`,
            }}
          />
        </Card>

        <div className="goal-footnote">
          健管师不能直接修改临床目标值，目标值与评价周期由责任医生在「制定管理目标」时确认
        </div>
      </PageContainer>
    </div>
  )
}
