/**
 * 健康管理方案 - 方案列表（设计稿：健管师.png）
 * 健管师视角：基于健康档案、管理目标和近期数据生成个性化方案
 * TODO: 跨会员方案列表 / 统计接口 API v0.1 未定义，数据为本地 mock（见 ./mock.ts）
 */
import { useMemo, useState } from 'react'
import { Button, Card, Input, Select, Table } from 'antd'
import { SearchOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import PageContainer from '@/components/PageContainer'
import { mockPlanList, mockPlanStats, PLAN_STATUS_TEXT, type MockPlanRow } from './mock'
import './index.less'

interface Filters {
  keyword: string
  disease?: string
  status?: MockPlanRow['status']
  creator?: string
}

export default function PlanList() {
  const navigate = useNavigate()
  const [filters, setFilters] = useState<Filters>({ keyword: '' })
  const [applied, setApplied] = useState<Filters>({ keyword: '' })
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)

  const diseaseOptions = useMemo(() => [...new Set(mockPlanList.flatMap((r) => r.diseases))], [])
  const creatorOptions = useMemo(
    () => [...new Set(mockPlanList.map((r) => r.creator).filter((c) => c !== '—'))],
    [],
  )

  const filtered = useMemo(
    () =>
      mockPlanList.filter((row) => {
        if (applied.keyword && !row.name.includes(applied.keyword)) return false
        if (applied.disease && !row.diseases.includes(applied.disease)) return false
        if (applied.status && row.status !== applied.status) return false
        if (applied.creator && row.creator !== applied.creator) return false
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
    { label: '待生成', value: mockPlanStats.pending, sub: '已具备生成条件', tone: 'warn' },
    { label: 'AI草稿', value: mockPlanStats.draft, sub: '待健管师完善', tone: 'purple' },
    { label: '待医生审核', value: mockPlanStats.review, sub: '已提交审核', tone: 'info' },
    { label: '执行中', value: mockPlanStats.active, sub: '服务任务已下发', tone: 'success' },
  ]

  const columns = [
    {
      title: '长者 / 病种',
      key: 'member',
      render: (_: unknown, row: MockPlanRow) => (
        <div>
          <div className="plan-row__name">
            {row.name}
            <span className="plan-row__sub">
              {row.gender} · {row.age}岁
            </span>
          </div>
          <div className="plan-row__diseases">{row.diseases.join(' | ')}</div>
        </div>
      ),
    },
    {
      title: '方案周期',
      key: 'period',
      render: (_: unknown, row: MockPlanRow) => <span>{row.period}</span>,
    },
    {
      title: '方案内容',
      key: 'content',
      render: (_: unknown, row: MockPlanRow) =>
        row.status === 'pending' ? (
          <span className="plan-row__sub">{row.content}</span>
        ) : (
          <span>{row.content}</span>
        ),
    },
    {
      title: '生成方式',
      key: 'genMode',
      render: (_: unknown, row: MockPlanRow) =>
        row.genMode === '—' ? (
          <span className="plan-row__sub">—</span>
        ) : (
          <span className="plan-text--purple">{row.genMode}</span>
        ),
    },
    {
      title: '状态',
      key: 'status',
      render: (_: unknown, row: MockPlanRow) => (
        <span className={`plan-tag plan-tag--${row.status}`}>{PLAN_STATUS_TEXT[row.status]}</span>
      ),
    },
    {
      title: '制定 / 审核',
      key: 'owner',
      render: (_: unknown, row: MockPlanRow) =>
        row.creator === '—' ? (
          <span className="plan-row__sub">—</span>
        ) : (
          <span>
            {row.creator} · {row.reviewer}
          </span>
        ),
    },
    {
      title: '操作',
      key: 'action',
      width: 110,
      render: (_: unknown, row: MockPlanRow) => {
        if (row.status === 'pending') {
          return (
            <Button type="primary" size="small" onClick={() => navigate('/plan/generate')}>
              AI生成
            </Button>
          )
        }
        if (row.status === 'draft') {
          return (
            <Button type="primary" size="small" onClick={() => navigate(`/plan/${row.id}`)}>
              继续完善
            </Button>
          )
        }
        return (
          <Button size="small" onClick={() => navigate(`/plan/${row.id}/${row.status === 'review' ? 'review' : 'execution'}`)}>
            {row.status === 'review' ? '查看审核' : '查看方案'}
          </Button>
        )
      },
    },
  ]

  return (
    <div className="plan-page">
      <PageContainer
        title="健康管理方案"
        description="基于健康档案、管理目标和近期数据生成个性化方案"
        extra={
          <Button type="primary" onClick={() => navigate('/plan/generate')}>
            ✦ AI方案生成
          </Button>
        }
      >
        {/* 统计卡 */}
        <div className="plan-stats">
          {stats.map((s) => (
            <div key={s.label} className="plan-stat">
              <div className="plan-stat__label">{s.label}</div>
              <div className={`plan-stat__value plan-stat__value--${s.tone}`}>{s.value}</div>
              <div className="plan-stat__sub">{s.sub}</div>
            </div>
          ))}
        </div>

        {/* 筛选卡 */}
        <Card variant="borderless" className="filter-bar">
          <Input
            prefix={<SearchOutlined />}
            placeholder="搜索姓名、手机号或身份证号"
            value={filters.keyword}
            onChange={(e) => setFilters((f) => ({ ...f, keyword: e.target.value.trim() }))}
            allowClear
          />
          <Select
            placeholder="病种：全部"
            value={filters.disease}
            onChange={(v) => setFilters((f) => ({ ...f, disease: v }))}
            options={diseaseOptions.map((d) => ({ value: d, label: d }))}
            allowClear
          />
          <Select
            placeholder="状态：全部"
            value={filters.status}
            onChange={(v) => setFilters((f) => ({ ...f, status: v }))}
            options={Object.entries(PLAN_STATUS_TEXT).map(([value, label]) => ({ value, label }))}
            allowClear
          />
          <Select
            placeholder="制定人：全部"
            value={filters.creator}
            onChange={(v) => setFilters((f) => ({ ...f, creator: v }))}
            options={creatorOptions.map((c) => ({ value: c, label: c }))}
            allowClear
          />
          <Button onClick={onReset}>重置</Button>
          <Button type="primary" onClick={applyFilters}>查询</Button>
        </Card>

        {/* 方案记录卡 */}
        <Card variant="borderless" className="list-card table-fill">
          <div className="plan-list__header">
            <span className="plan-list__title">健康管理方案记录</span>
            <span className="plan-list__sub">
              共 {mockPlanStats.total} 份 · {mockPlanStats.review} 份待医生审核
            </span>
          </div>
          <Table<MockPlanRow>
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
      </PageContainer>
    </div>
  )
}
