/**
 * 随访管理 - 我的随访（设计稿：待回访.png / 已回访.png）
 * 系统按专病类型＋当前风险层级固定规则生成；健康预警回访由健管师手动创建
 * TODO: 接入后端后替换为 followupApi.getFollowups（§6.3），数据为本地 mock（见 ./mock.ts）
 */
import { useMemo, useState } from 'react'
import { Button, Card, DatePicker, Input, Select, Table, Tabs } from 'antd'
import { SearchOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import PageContainer from '@/components/PageContainer'
import {
  FOLLOWUP_TYPE_LABEL,
  mockFollowupCounts,
  mockFollowupDone,
  mockFollowupPending,
  mockFollowupStats,
  type FollowupTypeKey,
  type MockFollowupDoneRow,
  type MockFollowupPendingRow,
} from './mock'
import './index.less'

const TYPE_OPTIONS = Object.entries(FOLLOWUP_TYPE_LABEL).map(([value, label]) => ({ value, label }))

export default function FollowupList() {
  const navigate = useNavigate()
  const [tab, setTab] = useState<'pending' | 'done'>('pending')
  const [typeFilter, setTypeFilter] = useState<FollowupTypeKey>()
  const [keyword, setKeyword] = useState('')
  const [applied, setApplied] = useState({ typeFilter: undefined as FollowupTypeKey | undefined, keyword: '' })
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)

  const pendingFiltered = useMemo(
    () =>
      mockFollowupPending.filter((row) => {
        if (applied.typeFilter && row.type !== applied.typeFilter) return false
        if (applied.keyword && !row.memberName.includes(applied.keyword)) return false
        return true
      }),
    [applied],
  )

  const doneFiltered = useMemo(
    () =>
      mockFollowupDone.filter((row) => {
        if (applied.typeFilter && row.type !== applied.typeFilter) return false
        if (applied.keyword && !row.memberName.includes(applied.keyword)) return false
        return true
      }),
    [applied],
  )

  const applyFilters = () => {
    setApplied({ typeFilter, keyword })
    setPage(1)
  }

  const onReset = () => {
    setTypeFilter(undefined)
    setKeyword('')
    setApplied({ typeFilter: undefined, keyword: '' })
    setPage(1)
  }

  const typeTag = (type: FollowupTypeKey) => (
    <span className={`fu-tag fu-tag--${type}`}>{FOLLOWUP_TYPE_LABEL[type]}</span>
  )

  const pendingColumns = [
    { title: '计划时间', dataIndex: 'planTime', key: 'planTime' },
    {
      title: '服务对象',
      key: 'member',
      render: (_: unknown, row: MockFollowupPendingRow) => (
        <span>
          {row.memberName} <span className="fu-row__sub">{row.age}岁</span>
        </span>
      ),
    },
    { title: '随访类型', key: 'type', render: (_: unknown, row: MockFollowupPendingRow) => typeTag(row.type) },
    { title: '病种/来源', dataIndex: 'disease', key: 'disease' },
    { title: '任务说明', dataIndex: 'source', key: 'source' },
    { title: '最近随访', dataIndex: 'lastFollowup', key: 'lastFollowup' },
    {
      title: '操作',
      key: 'action',
      width: 110,
      render: (_: unknown, row: MockFollowupPendingRow) => (
        <Button type="primary" size="small" onClick={() => navigate(`/followup/${row.id}/execute`)}>
          开始回访
        </Button>
      ),
    },
  ]

  const doneColumns = [
    { title: '完成时间', dataIndex: 'doneTime', key: 'doneTime' },
    {
      title: '服务对象',
      key: 'member',
      render: (_: unknown, row: MockFollowupDoneRow) => (
        <span>
          {row.memberName} <span className="fu-row__sub">{row.age}岁</span>
        </span>
      ),
    },
    { title: '随访类型', key: 'type', render: (_: unknown, row: MockFollowupDoneRow) => typeTag(row.type) },
    { title: '病种/来源', dataIndex: 'disease', key: 'disease' },
    {
      title: '随访结果',
      key: 'result',
      render: (_: unknown, row: MockFollowupDoneRow) => (
        <span className={row.resultTone === 'plain' ? undefined : `fu-text--${row.resultTone}`}>
          {row.result}
        </span>
      ),
    },
    { title: '下次随访', dataIndex: 'nextFollowup', key: 'nextFollowup' },
    {
      title: '操作',
      key: 'action',
      width: 110,
      render: () => (
        <Button size="small" onClick={() => navigate('/followup/11/execute')}>
          查看记录
        </Button>
      ),
    },
  ]

  const stats = [
    { label: '今日待回访', value: mockFollowupStats.todayPending, sub: `其中健康预警 ${mockFollowupStats.todayWarning}`, tone: 'warn' },
    { label: '未来7天', value: mockFollowupStats.next7Days, sub: '专病 / 风险规则生成' },
    { label: '本月已回访', value: mockFollowupStats.monthDone, sub: `有效随访 ${mockFollowupStats.monthEffective}` },
  ]

  return (
    <div className="fu-page">
      <PageContainer
        title="我的随访"
        description={
          tab === 'pending'
            ? '系统按专病类型＋当前风险层级固定规则生成；健康预警回访由健管师手动创建'
            : '查看当前健管师已完成的随访记录'
        }
      >
        <Tabs
          activeKey={tab}
          onChange={(k) => {
            setTab(k as 'pending' | 'done')
            setPage(1)
          }}
          items={[
            { key: 'pending', label: `待回访　${mockFollowupCounts.pending}` },
            { key: 'done', label: `已回访　${mockFollowupCounts.done}` },
          ]}
        />

        {tab === 'pending' && (
          <div className="fu-stats">
            {stats.map((s) => (
              <div key={s.label} className="fu-stat">
                <div className="fu-stat__label">{s.label}</div>
                <div className={s.tone ? `fu-stat__value fu-stat__value--${s.tone}` : 'fu-stat__value'}>
                  {s.value}
                  <span className="fu-stat__sub">{s.sub}</span>
                </div>
              </div>
            ))}
            <div className="fu-stat fu-stat--banner">
              <div>
                <div className="fu-stat__banner-title">发现患者健康指标异常？</div>
                <div className="fu-stat__banner-sub">由健管师判断是否需要新建健康预警回访</div>
              </div>
              <Button type="primary" onClick={() => navigate('/followup/create')}>
                创建健康预警回访
              </Button>
            </div>
          </div>
        )}

        {/* 筛选 */}
        <Card variant="borderless" className="filter-bar">
          <Select
            placeholder="全部类型"
            value={typeFilter}
            onChange={setTypeFilter}
            options={TYPE_OPTIONS}
            allowClear
          />
          {tab === 'pending' ? (
            <Select placeholder="全部日期" options={[{ value: 'today', label: '今天' }]} allowClear />
          ) : (
            <DatePicker.RangePicker placeholder={['开始日期', '结束日期']} />
          )}
          <Input
            prefix={<SearchOutlined />}
            placeholder="姓名 / 手机号"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value.trim())}
            allowClear
          />
          <Button type="primary" onClick={applyFilters}>查询</Button>
          <Button onClick={onReset}>重置</Button>
        </Card>

        {/* 列表 */}
        <Card variant="borderless" className="list-card table-fill">
          {tab === 'pending' ? (
            <Table<MockFollowupPendingRow>
              rowKey="id"
              columns={pendingColumns}
              dataSource={pendingFiltered}
              pagination={{
                current: page,
                pageSize,
                total: pendingFiltered.length,
                onChange: (nextPage, nextPageSize) => {
                  setPage(nextPage)
                  setPageSize(nextPageSize)
                },
                showTotal: (total) => `共 ${total} 条`,
              }}
            />
          ) : (
            <Table<MockFollowupDoneRow>
              rowKey="id"
              columns={doneColumns}
              dataSource={doneFiltered}
              pagination={{
                current: page,
                pageSize,
                total: doneFiltered.length,
                onChange: (nextPage, nextPageSize) => {
                  setPage(nextPage)
                  setPageSize(nextPageSize)
                },
                showTotal: (total) => `共 ${total} 条`,
              }}
            />
          )}
        </Card>

        <div className="fu-footnote">
          <span className="fu-footnote__label">交互说明</span>
          {tab === 'pending'
            ? '一期固定规则：高风险每周1次、中风险每2周1次、低风险每月1次；服务后回访由服务完成触发，健康预警回访由健管师手动创建。状态仅保留“待回访 / 已回访”。'
            : '“已回访”按完成时间记录；联系失败也保留联系记录，但只有完成有效问卷后才计入有效随访。'}
        </div>
      </PageContainer>
    </div>
  )
}
