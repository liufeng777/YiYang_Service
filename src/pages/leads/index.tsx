/**
 * 线索管理 - 线索登记列表（设计稿：线索列表.png）
 * 数据当前为 mock（见 ./mock.ts）；接入后端后替换为 leadApi.getLeadList
 */
import { useMemo, useState } from 'react'
import { Button, Card, DatePicker, Input, Select, Table } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import { useNavigate, useSearchParams } from 'react-router-dom'
import dayjs from 'dayjs'
import PageContainer from '@/components/PageContainer'
import {
  CONTACT_IDENTITY_MAP,
  LEAD_DEMAND_MAP,
  LEAD_SOURCE_MAP,
  type LeadItem,
} from '@/api/modules/lead'
import { mockLeads } from './mock'
import './index.less'

interface Filters {
  keyword: string
  source_type?: number
  demand_type?: number
  date?: string
}

export default function LeadList() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  // 顶栏全局搜索带入的 keyword（姓名 / 手机号）
  const initialFilters: Filters = { keyword: searchParams.get('keyword') ?? '' }
  const [filters, setFilters] = useState<Filters>(initialFilters)
  const [applied, setApplied] = useState<Filters>(initialFilters)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  // TODO: 接入后端后替换为 leadApi.getLeadList({ ...applied, page, page_size: pageSize })
  const filtered = useMemo(
    () =>
      mockLeads.filter((lead) => {
        if (
          applied.keyword &&
          !lead.contact_name.includes(applied.keyword) &&
          !lead.contact_phone.includes(applied.keyword)
        ) {
          return false
        }
        if (applied.source_type && lead.source_type !== applied.source_type) return false
        if (applied.demand_type && lead.demand_type !== applied.demand_type) return false
        if (applied.date && dayjs(lead.created_at * 1000).format('YYYY-MM-DD') !== applied.date) {
          return false
        }
        return true
      }),
    [applied],
  )

  const onSearch = () => {
    setApplied(filters)
    setPage(1)
  }
  const onReset = () => {
    setFilters({ keyword: '' })
    setApplied({ keyword: '' })
    setPage(1)
  }

  const columns = [
    {
      title: '姓名 / 电话',
      key: 'contact',
      render: (_: unknown, record: LeadItem) => (
        <span className="lead-table__contact">
          {record.contact_name} {record.contact_phone}
        </span>
      ),
    },
    {
      title: '咨询人身份',
      dataIndex: 'contact_identity',
      key: 'contact_identity',
      render: (v?: number) => (v ? CONTACT_IDENTITY_MAP[v] : '-'),
    },
    {
      title: '来源',
      dataIndex: 'source_type',
      key: 'source_type',
      render: (v: number) => LEAD_SOURCE_MAP[v] ?? '-',
    },
    {
      title: '意向类型',
      dataIndex: 'demand_type',
      key: 'demand_type',
      render: (v: number) => LEAD_DEMAND_MAP[v] ?? '-',
    },
    {
      title: '需求摘要',
      dataIndex: 'demand_detail',
      key: 'demand_detail',
      ellipsis: true,
    },
    {
      title: '登记时间',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (v: number) => dayjs(v * 1000).format('MM-DD HH:mm'),
    },
    {
      title: '操作',
      key: 'action',
      width: 90,
      render: (_: unknown, record: LeadItem) => (
        <Button size="small" type="link" onClick={() => navigate(`/leads/edit/${record.id}`)}>
          查看
        </Button>
      ),
    },
  ]

  return (
    <div className="lead-page">
      <PageContainer
        title="线索管理"
        description="简单记录线上咨询和线下接触中产生的用户意向"
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/leads/create')}>
            新增线索
          </Button>
        }
      >
        {/* 页签（预留多页签扩展，当前仅线索登记） */}
        {/* <div className="lead-page__tabs">
          <Tabs
            activeKey="register"
            items={[{ key: 'register', label: '线索登记' }]}
          />
        </div> */}

        {/* 筛选区 */}
        <Card variant="borderless" className="filter-bar">
          <Input
            placeholder="用户姓名 / 手机号"
            value={filters.keyword}
            onChange={(e) => setFilters((f) => ({ ...f, keyword: e.target.value.trim() }))}
            allowClear
          />
          <Select
            placeholder="线索来源"
            value={filters.source_type}
            onChange={(v) => setFilters((f) => ({ ...f, source_type: v }))}
            options={Object.entries(LEAD_SOURCE_MAP).map(([value, label]) => ({
              value: Number(value),
              label,
            }))}
            allowClear
          />
          <Select
            placeholder="意向类型"
            value={filters.demand_type}
            onChange={(v) => setFilters((f) => ({ ...f, demand_type: v }))}
            options={Object.entries(LEAD_DEMAND_MAP).map(([value, label]) => ({
              value: Number(value),
              label,
            }))}
            allowClear
          />
          <DatePicker
            placeholder='登记日期'
            value={filters.date ? dayjs(filters.date) : null}
            onChange={(d) => setFilters((f) => ({ ...f, date: d ? d.format('YYYY-MM-DD') : undefined }))}
            style={{ flex: '1 1 140px', minWidth: 140 }}
            allowClear
          />
          <Button onClick={onReset}>重置</Button>
          <Button type="primary" onClick={onSearch}>查询</Button>
        </Card>

        {/* 列表 */}
        <Card variant="borderless" className="list-card table-fill">
          <div className="list-card__header">
            <span className='list-card__header__title'>线索列表</span>
          </div>
          <Table<LeadItem>
            rowKey="id"
            columns={columns}
            dataSource={filtered}
            size="small"
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
