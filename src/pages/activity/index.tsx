/**
 * 健康活动 - 活动列表（设计稿：活动列表.png）
 * 查看本机构承接活动、报名与现场执行情况
 * TODO: 活动接口 API v0.1 未定义，数据为本地 mock（见 ./mock.ts）
 */
import { useMemo, useState } from 'react'
import { Button, Card, DatePicker, Input, Table, message } from 'antd'
import { PlusOutlined, SearchOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import PageContainer from '@/components/PageContainer'
import { mockActivityList, mockActivityStats, type MockActivityRow } from './mock'
import './index.less'

const { RangePicker } = DatePicker

interface Filters {
  keyword: string
  dateRange?: [string, string]
}

export default function ActivityList() {
  const navigate = useNavigate()
  const [filters, setFilters] = useState<Filters>({ keyword: '' })
  const [applied, setApplied] = useState<Filters>({ keyword: '' })

  const applyFilters = () => setApplied(filters)

  const resetFilters = () => {
    const init: Filters = { keyword: '' }
    setFilters(init)
    setApplied(init)
  }

  const filtered = useMemo(
    () =>
      mockActivityList.filter(
        (row) => !applied.keyword || row.name.includes(applied.keyword),
      ),
    [applied],
  )

  const stats = [
    { label: '未来30天活动', value: mockActivityStats.upcoming30, note: mockActivityStats.upcoming30Note },
    { label: '今日活动', value: mockActivityStats.today, note: mockActivityStats.todayNote },
    { label: '待联系报名', value: mockActivityStats.pendingContact, note: mockActivityStats.pendingContactNote },
    { label: '活动产生线索', value: mockActivityStats.leads, note: mockActivityStats.leadsNote },
  ]

  const columns = [
    {
      title: '活动名称',
      dataIndex: 'name',
      key: 'name',
      render: (v: string) => <span className="ac-row__name">{v}</span>,
    },
    {
      title: '时间 / 地点',
      key: 'time',
      render: (_: unknown, row: MockActivityRow) => (
        <span className="ac-row__sub">
          {row.time} · {row.place}
        </span>
      ),
    },
    {
      title: '报名 / 名额',
      key: 'signed',
      render: (_: unknown, row: MockActivityRow) => (
        <span>
          {row.signed} / {row.quota}
        </span>
      ),
    },
    {
      title: '联系确认',
      key: 'contact',
      render: (_: unknown, row: MockActivityRow) =>
        row.pendingContact > 0 ? (
          <span className="ac-text--warn">待联系 {row.pendingContact}</span>
        ) : (
          <span className="ac-text--success">已确认 {row.confirmed}</span>
        ),
    },
    { title: '签到', dataIndex: 'checkedIn', key: 'checkedIn' },
    {
      title: '操作',
      key: 'action',
      width: 180,
      render: (_: unknown, row: MockActivityRow) => (
        <span className="ac-row__actions">
          <Button
            type="link"
            size="small"
            onClick={() => navigate(`/health-activity/${row.id}/registrations`)}
          >
            查看报名
          </Button>
          <Button
            type="link"
            size="small"
            onClick={() => navigate(`/health-activity/${row.id}/check-in`)}
          >
            现场签到
          </Button>
        </span>
      ),
    },
  ]

  return (
    <div className="ac-page">
      <PageContainer
        title="健康活动"
        description="查看本机构承接活动、报名与现场执行情况"
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => message.info('新增活动由运营后台创建后分配至本机构，工作台暂不支持新建')}
          >
            新增活动
          </Button>
        }
      >
        {/* 统计卡 */}
        <div className="ac-stats">
          {stats.map((s) => (
            <div key={s.label} className="ac-stat">
              <div className="ac-stat__label">{s.label}</div>
              <div className="ac-stat__body">
                <span className="ac-stat__value">{s.value}</span>
                <span className="ac-stat__note">{s.note}</span>
              </div>
            </div>
          ))}
        </div>

        {/* 筛选 */}
        <Card variant="borderless" className="filter-bar">
          <Input
            prefix={<SearchOutlined />}
            placeholder="活动名称 / 日期"
            value={filters.keyword}
            onChange={(e) => setFilters((f) => ({ ...f, keyword: e.target.value.trim() }))}
            allowClear
            onPressEnter={applyFilters}
          />
          <RangePicker
            placeholder={['开始日期', '结束日期']}
            onChange={(_, ds) =>
              setFilters((f) => ({
                ...f,
                dateRange: Array.isArray(ds) && ds[0] && ds[1] ? [ds[0], ds[1]] : undefined,
              }))
            }
          />
          <Button onClick={resetFilters}>重置</Button>
          <Button type="primary" onClick={applyFilters}>查询</Button>
        </Card>

        {/* 活动表格 */}
        <Card variant="borderless" className="list-card">
          <Table<MockActivityRow>
            rowKey="id"
            columns={columns}
            dataSource={filtered}
            pagination={false}
          />
        </Card>
      </PageContainer>
    </div>
  )
}
