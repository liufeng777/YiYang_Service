/**
 * 线索管理 - 线索登记列表（设计稿：线索列表.png）
 * 已对接 GET /api/v1/staff/leads（服务端分页，支持 keyword / status / source_type 筛选）
 * 说明：意向类型与登记日期筛选 API 未提供查询参数，已移除；
 * 当前线索管理已从侧边栏隐藏（由健康会员替代），页面保留
 */
import { useCallback, useEffect, useState } from 'react'
import { Button, Card, Input, Select, Table } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import { useNavigate, useSearchParams } from 'react-router-dom'
import dayjs from 'dayjs'
import PageContainer from '@/components/PageContainer'
import { leadApi } from '@/api'
import {
  LEAD_SOURCE_MAP,
  LEAD_STATUS_MAP,
  type LeadItem,
} from '@/api/modules/lead'
import './index.less'

interface Filters {
  keyword: string
  source_type?: number
  status?: number
}

export default function LeadList() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  // 顶栏全局搜索带入的 keyword（姓名 / 手机号）
  const initialFilters: Filters = { keyword: searchParams.get('keyword') ?? '' }
  const [filters, setFilters] = useState<Filters>(initialFilters)
  const [applied, setApplied] = useState<Filters>(initialFilters)
  const [list, setList] = useState<LeadItem[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  const fetchList = useCallback(async () => {
    setLoading(true)
    try {
      const res = await leadApi.getLeadList({
        page,
        page_size: pageSize,
        keyword: applied.keyword || undefined,
        source_type: applied.source_type,
        status: applied.status,
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
          {record.contact_name || record.name || '-'} {record.contact_phone || record.phone || ''}
        </span>
      ),
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
      render: (v: number) => (v ? `类型 ${v}` : '-'),
    },
    {
      title: '需求摘要',
      dataIndex: 'demand_detail',
      key: 'demand_detail',
      ellipsis: true,
      render: (v: string | undefined, record: LeadItem) => v || record.remark || '-',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (v: number) => LEAD_STATUS_MAP[v] ?? '-',
    },
    {
      title: '负责人',
      dataIndex: 'owner_staff_name',
      key: 'owner_staff_name',
      render: (v: string | undefined, record: LeadItem) => v || record.assignee_name || '-',
    },
    {
      title: '登记时间',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (v: number) => (v ? dayjs(v * 1000).format('MM-DD HH:mm') : '-'),
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
            placeholder="线索状态"
            value={filters.status}
            onChange={(v) => setFilters((f) => ({ ...f, status: v }))}
            options={Object.entries(LEAD_STATUS_MAP).map(([value, label]) => ({
              value: Number(value),
              label,
            }))}
            allowClear
          />
          <Button onClick={onReset}>重置</Button>
          <Button type="primary" onClick={onSearch}>查询</Button>
        </Card>

        {/* 列表 */}
        <Card variant="borderless" className="list-card table-fill">
          <div className="list-card__header">
            <span className="list-card__header__title">线索列表</span>
          </div>
          <Table<LeadItem>
            rowKey="id"
            columns={columns}
            dataSource={list}
            loading={loading}
            size="small"
            pagination={{
              current: page,
              pageSize,
              total,
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
