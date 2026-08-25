/**
 * 健康档案 - 档案列表（设计稿：V2-01 健康档案列表.png）
 * 数据当前为 mock（见 ./mock.ts）；接入后端后替换为 memberApi.getMemberList
 */
import { useMemo, useState } from 'react'
import type { Key } from 'react'
import { Avatar, Button, Dropdown, Input, Select, Table } from 'antd'
import { MoreOutlined, PlusOutlined, SearchOutlined, SettingOutlined, UploadOutlined } from '@ant-design/icons'
import { useNavigate, useSearchParams } from 'react-router-dom'
import PageContainer from '@/components/PageContainer'
import { mockRecordList, mockRecordStats, type MockRecordRow } from './mock'
import './index.less'

interface Filters {
  keyword: string
  org?: string
  disease?: string
  risk?: 'high' | 'mid' | 'low'
  manager?: string
}

const RISK_TEXT = { high: '高风险', mid: '中风险', low: '低风险' } as const

const QUICK_FILTERS = ['高风险', '资料待完善', '待制定方案', '7天内待随访', '同步异常'] as const

export default function HealthRecordList() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [filters, setFilters] = useState<Filters>({ keyword: searchParams.get('keyword') ?? '' })
  const [quick, setQuick] = useState<string>()
  const [selectedKeys, setSelectedKeys] = useState<Key[]>([])
  const [page, setPage] = useState(1)
  const pageSize = 20

  const orgOptions = useMemo(() => [...new Set(mockRecordList.map((r) => r.org))], [])
  const diseaseOptions = useMemo(() => [...new Set(mockRecordList.flatMap((r) => r.diseases))], [])
  const managerOptions = useMemo(() => [...new Set(mockRecordList.map((r) => r.manager))], [])

  // TODO: 接入后端后替换为 memberApi.getMemberList({ ...filters, page, page_size: pageSize })
  const filtered = useMemo(
    () =>
      mockRecordList.filter((row) => {
        if (
          filters.keyword &&
          !row.name.includes(filters.keyword) &&
          !row.phone.includes(filters.keyword)
        ) {
          return false
        }
        if (filters.org && row.org !== filters.org) return false
        if (filters.disease && !row.diseases.includes(filters.disease)) return false
        if (filters.risk && row.risk !== filters.risk) return false
        if (filters.manager && row.manager !== filters.manager) return false
        if (quick === '高风险' && row.risk !== 'high') return false
        if (quick === '资料待完善' && row.completeness >= 80) return false
        if (quick === '待制定方案' && row.planStatus !== '方案待制定') return false
        if (quick === '7天内待随访' && !row.nextTaskDate) return false
        if (quick === '同步异常' && row.syncOk) return false
        return true
      }),
    [filters, quick],
  )

  const onReset = () => {
    setFilters({ keyword: '' })
    setQuick(undefined)
    setPage(1)
  }

  const stats = [
    { label: '健康档案总数', value: mockRecordStats.total, sub: `较上月 +${mockRecordStats.totalDelta}` },
    { label: '高风险对象', value: mockRecordStats.highRisk, sub: `今日新增 ${mockRecordStats.highRiskDelta}`, danger: true },
    { label: '资料待完善', value: mockRecordStats.incomplete, sub: '完整度低于 80%' },
    { label: '今日同步更新', value: mockRecordStats.todaySync, sub: `医养平台 ${mockRecordStats.platformSync} 条` },
  ]

  const columns = [
    {
      title: '服务对象',
      key: 'member',
      render: (_: unknown, row: MockRecordRow) => (
        <div className="hr-row__member">
          <Avatar className="hr-avatar" size={40}>
            {row.name.slice(0, 1)}
          </Avatar>
          <div>
            <div className="hr-row__name">{row.name}</div>
            <div className="hr-row__sub">
              {row.gender} · {row.age}岁&nbsp;&nbsp;{row.phone}
            </div>
          </div>
        </div>
      ),
    },
    {
      title: '健康概况',
      key: 'health',
      render: (_: unknown, row: MockRecordRow) => (
        <div className="hr-row__tags">
          {row.diseases.map((d) => (
            <span key={d} className="hr-tag hr-tag--disease">
              {d}
            </span>
          ))}
          <span className={`hr-tag hr-tag--risk-${row.risk}`}>{RISK_TEXT[row.risk]}</span>
        </div>
      ),
    },
    {
      title: '最新健康指标',
      key: 'metrics',
      render: (_: unknown, row: MockRecordRow) => (
        <div>
          <div className="hr-row__metric">
            血压 {row.bp} · {row.bpStatus}
          </div>
          <div className="hr-row__sub">
            血糖 {row.glucose} · {row.glucoseStatus}
          </div>
          <div className="hr-row__sub">{row.metricTime}</div>
        </div>
      ),
    },
    {
      title: '档案与同步',
      key: 'sync',
      render: (_: unknown, row: MockRecordRow) => (
        <div>
          <div className="hr-row__metric">完整度 {row.completeness}%</div>
          <div className={row.syncOk ? 'hr-row__sub' : 'hr-row__sub hr-row__sub--warn'}>
            {row.syncStatus}
          </div>
        </div>
      ),
    },
    {
      title: '管理归属',
      key: 'owner',
      render: (_: unknown, row: MockRecordRow) => (
        <div>
          <div className="hr-row__metric">{row.org}</div>
          <div className="hr-row__sub">
            {row.manager}
            {row.planStatus ? ` · ${row.planStatus}` : ''}
          </div>
        </div>
      ),
    },
    {
      title: '下次任务',
      key: 'task',
      render: (_: unknown, row: MockRecordRow) =>
        row.nextTaskDate ? (
          <div>
            <div className="hr-row__metric">{row.nextTaskDate}</div>
            <div className="hr-row__sub">{row.nextTaskType}</div>
          </div>
        ) : (
          <span className="hr-row__sub">—</span>
        ),
    },
    {
      title: '操作',
      key: 'action',
      width: 190,
      render: (_: unknown, row: MockRecordRow) => (
        <div className="hr-row__actions">
          <Button type="link" size="small" onClick={() => navigate(`/health-record/${row.id}`)}>
            查看档案
          </Button>
          <Button type="link" size="small">
            发起随访
          </Button>
          <Dropdown
            menu={{
              items: [
                { key: 'edit', label: '编辑基础信息' },
                { key: 'record', label: '录入健康指标' },
                { key: 'risk-level', label: '分层分级详情' },
                { key: 'risk-change', label: '分层变化处理' },
                { key: 'assign', label: '分配管理团队' },
              ],
              onClick: ({ key }) => {
                if (key === 'risk-level') navigate(`/health-record/${row.id}/risk-level`)
                if (key === 'risk-change') navigate(`/health-record/${row.id}/risk-change`)
                if (key === 'assign') navigate(`/health-record/${row.id}/assign`)
              },
            }}
          >
            <Button type="text" size="small" icon={<MoreOutlined />} />
          </Dropdown>
        </div>
      ),
    },
  ]

  return (
    <div className="hr-page">
      <PageContainer
        title="健康档案"
        description="统一管理基础信息、健康风险、指标记录与连续健康服务"
        extra={
          <div className="hr-page__header-actions">
            <Button icon={<UploadOutlined />} onClick={() => navigate('/health-record/import')}>
              批量导入
            </Button>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/health-record/create')}>
              新建健康档案
            </Button>
          </div>
        }
      >
        {/* 统计卡 */}
        <div className="hr-stats">
          {stats.map((s) => (
            <div key={s.label} className="hr-stat">
              <div className="hr-stat__label">{s.label}</div>
              <div className={s.danger ? 'hr-stat__value hr-stat__value--danger' : 'hr-stat__value'}>
                {s.value.toLocaleString()}
              </div>
              <div className={s.danger ? 'hr-stat__sub hr-stat__sub--danger' : 'hr-stat__sub'}>{s.sub}</div>
            </div>
          ))}
        </div>

        {/* 筛选卡 */}
        <div className="hr-filters">
          <div className="hr-filters__row">
            <Input
              className="hr-filters__search"
              prefix={<SearchOutlined />}
              placeholder="搜索手机号、会员ID或姓名"
              value={filters.keyword}
              onChange={(e) => setFilters((f) => ({ ...f, keyword: e.target.value.trim() }))}
              allowClear
            />
            <Select
              placeholder="所属机构"
              value={filters.org}
              onChange={(v) => setFilters((f) => ({ ...f, org: v }))}
              options={orgOptions.map((o) => ({ value: o, label: o }))}
              allowClear
            />
            <Select
              placeholder="病种类标签"
              value={filters.disease}
              onChange={(v) => setFilters((f) => ({ ...f, disease: v }))}
              options={diseaseOptions.map((d) => ({ value: d, label: d }))}
              allowClear
            />
            <Select
              placeholder="风险等级"
              value={filters.risk}
              onChange={(v) => setFilters((f) => ({ ...f, risk: v }))}
              options={Object.entries(RISK_TEXT).map(([value, label]) => ({ value, label }))}
              allowClear
            />
            <Select
              placeholder="责任健康管理师"
              value={filters.manager}
              onChange={(v) => setFilters((f) => ({ ...f, manager: v }))}
              options={managerOptions.map((m) => ({ value: m, label: m }))}
              allowClear
            />
            <Button type="primary" onClick={() => setPage(1)}>
              查询
            </Button>
          </div>
          <div className="hr-filters__quick">
            {QUICK_FILTERS.map((q) => (
              <span
                key={q}
                className={quick === q ? 'hr-quick hr-quick--active' : 'hr-quick'}
                onClick={() => setQuick(quick === q ? undefined : q)}
              >
                {q}
              </span>
            ))}
            <Button type="link" className="hr-filters__reset" onClick={onReset}>
              重置筛选
            </Button>
          </div>
        </div>

        {/* 档案列表卡 */}
        <div className="hr-list">
          <div className="hr-list__header">
            <span className="hr-list__title">档案列表&nbsp;&nbsp;共 {filtered.length.toLocaleString()} 人</span>
            <Button type="text" icon={<SettingOutlined />}>
              字段显示设置
            </Button>
          </div>
          <Table<MockRecordRow>
            rowKey="id"
            columns={columns}
            dataSource={filtered}
            rowSelection={{
              selectedRowKeys: selectedKeys,
              onChange: setSelectedKeys,
            }}
            pagination={{
              current: page,
              pageSize,
              total: filtered.length,
              onChange: setPage,
              showTotal: (total) => `已选择 ${selectedKeys.length} 项 · 每页 ${pageSize} 条 · 共 ${total} 条`,
            }}
          />
        </div>
      </PageContainer>
    </div>
  )
}
