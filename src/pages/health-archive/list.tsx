/**
 * 健康档案列表
 * 使用 GET /api/v1/staff/health-archives，以 member_id 进入档案工作台。
 */
import { useCallback, useEffect, useState } from 'react'
import { Button, Card, Input, Select, Table, Tag } from 'antd'
import { useNavigate } from 'react-router-dom'
import PageContainer from '@/components/PageContainer'
import { healthArchiveApi } from '@/api'
import { HEALTH_ACCESS_STATUS_MAP } from '@/api/modules/health-access'
import { type ArchiveListItem } from '@/api/modules/health-archive'
import { formatDateTime } from '@/utils'
import './index.less'

interface Filters { key: string; status?: number; }
const EMPTY_FILTERS: Filters = { key: '' }

export default function HealthArchiveList() {
  const navigate = useNavigate()
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS)
  const [applied, setApplied] = useState<Filters>(EMPTY_FILTERS)
  const [list, setList] = useState<ArchiveListItem[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await healthArchiveApi.getHealthArchiveList({
        page, page_size: pageSize,
        key: applied.key || undefined,
        status: applied.status,
      })
      setList(res.list ?? [])
      setTotal(res.total ?? 0)
    } catch { /* 拦截器统一提示 */ } finally { setLoading(false) }
  }, [page, pageSize, applied])

  useEffect(() => { load() }, [load])
  const search = () => { setPage(1); setApplied({ ...filters }) }
  const reset = () => { setFilters(EMPTY_FILTERS); setApplied(EMPTY_FILTERS); setPage(1) }

  const columns = [
    {
      title: '健康会员',
      key: 'member_name',
      dataIndex: 'member_name',
      render: (v: string, r: ArchiveListItem) => (
        <div className='table-cell'>
          <strong>{v}</strong>
          <span>{r.gender === 1 ? '男' : r.gender === 2 ? '女' : '未知'} · {r.age != null ? `${r.age}岁` : '年龄未知'}</span>
        </div>
      )
    },
    {
      title: '联系电话', dataIndex: 'phone', key: 'phone',
    },
    {
      title: '接入状态', dataIndex: 'access_status', key: 'access_status',
      render: (value?: number) => <Tag>{value != null ? HEALTH_ACCESS_STATUS_MAP[value] ?? `状态 ${value}` : '-'}</Tag>,
    },
    {
      title: '最后编辑', dataIndex: 'editor_name', key: 'editor_name',
      render: (value?: string) => value || '-',
    },
    {
      title: '档案更新时间',
      dataIndex: 'archive_updated_at',
      key: 'archive_updated_at',
      render: (value?: number) => value ? formatDateTime(value * 1000) : '-',
    },
    {
      title: '操作',
      key: 'action',
      width: 160,
      render: (_: unknown, row: ArchiveListItem) => (
        <Button size="small" onClick={() => navigate(`/health-record/${row.member_id}`)}>维护档案</Button>
      ),
    },
  ]

  return (
    <PageContainer
      title="健康档案"
      description="查看本机构已建档会员，维护病史、指标、慢病、目标与方案"
      extra={<Button type="primary" onClick={() => navigate('/health-record/metric-management')}>检测项管理</Button>}
    >
      <Card variant="borderless" className="filter-bar">
        <Input
          placeholder="会员名 / 手机号 / 编号" value={filters.key} allowClear
          onChange={(event) => setFilters((prev) => ({ ...prev, key: event.target.value.trim() }))}
          onPressEnter={search}
        />
        <Select
          placeholder="全部状态" value={filters.status} allowClear
          onChange={(value) => setFilters((prev) => ({ ...prev, status: value }))}
          options={Object.entries(HEALTH_ACCESS_STATUS_MAP).map(([value, label]) => ({ value: Number(value), label }))}
        />
        <Button onClick={reset}>重置</Button>
        <Button type="primary" onClick={search}>查询</Button>
      </Card>

      <Card variant="borderless" className="list-card table-fill">
        <Table<ArchiveListItem>
          rowKey="member_id" columns={columns} dataSource={list} loading={loading}
          pagination={{
            current: page, pageSize, total, showSizeChanger: true,
            showTotal: (value) => `共 ${value} 条`,
            onChange: (nextPage, nextPageSize) => { setPage(nextPage); setPageSize(nextPageSize) },
          }}
        />
      </Card>
    </PageContainer>
  )
}
