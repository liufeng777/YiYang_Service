/**
 * 人员管理 - 人员列表（设计稿：人员列表.png）
 * 已对接 GET /api/v1/staff/staffs（服务端分页，支持 keyword / staff_type / status / position_code 筛选）
 * 岗位筛选项对接 GET /api/v1/staff/positions
 * 说明：顶部统计卡无对应接口，已移除
 */
import { useCallback, useEffect, useState } from 'react'
import { Button, Card, Input, Select, Space, Table } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import PageContainer from '@/components/PageContainer'
import { staffApi } from '@/api'
import type { PositionItem, StaffItem } from '@/api/modules/staff'
import '../index.less'

const STAFF_TYPE_MAP: Record<number, string> = {
  1: '本端协同人员',
  2: '小程序服务人员',
}

const STAFF_STATUS_MAP: Record<number, string> = {
  0: '停用',
  1: '启用',
}

interface Filters {
  keyword: string
  staff_type?: number
  position_code?: string
  status?: number
}

export default function StaffList() {
  const navigate = useNavigate()
  const [filters, setFilters] = useState<Filters>({ keyword: '' })
  const [applied, setApplied] = useState<Filters>({ keyword: '' })
  const [positions, setPositions] = useState<PositionItem[]>([])
  const [list, setList] = useState<StaffItem[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  const fetchList = useCallback(async () => {
    setLoading(true)
    try {
      const res = await staffApi.getStaffList({
        page,
        page_size: pageSize,
        keyword: applied.keyword || undefined,
        staff_type: applied.staff_type,
        position_code: applied.position_code,
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

  useEffect(() => {
    staffApi
      .getPositions()
      .then((res) => setPositions(res.list))
      .catch(() => {
        // 错误提示由拦截器统一处理
      })
  }, [])

  const applyFilters = () => {
    setApplied(filters)
    setPage(1)
  }

  const resetFilters = () => {
    const init: Filters = { keyword: '' }
    setFilters(init)
    setApplied(init)
    setPage(1)
  }

  const columns = [
    {
      title: '人员',
      key: 'name',
      render: (_: unknown, row: StaffItem) => (
        <div className='table-cell'>
          <strong>{row.name || '-'}</strong>
          <span>{row.phone || '-'}</span>
        </div>
      ),
    },
    {
      title: '人员类型',
      key: 'staff_type',
      render: (_: unknown, row: StaffItem) => (
        <div className='table-cell'>
          <strong>{STAFF_TYPE_MAP[row.staff_type] ?? '-'}</strong>
          <span>{row.referral_code}</span>
        </div>
      )
    },
    {
      title: '岗位',
      key: 'position',
      render: (_: unknown, row: StaffItem) =>
        <div className='table-cell'>
          <strong>{row.position_name || '-'}</strong>
          {row.title && row.title !== row.position_name && <span>{row.title || '-'}</span>}
        </div>
    },
    {
      title: '资质与授权',
      key: 'credential',
      render: (_: unknown, row: StaffItem) =>
        row.upcoming_credential_expire ? (
          <span className="status-tag status-tag--orange">资质即将到期</span>
        ) : (
          <span className="staff-text--muted">-</span>
        ),
    },
    {
      title: '人员状态',
      key: 'status',
      render: (_: unknown, row: StaffItem) => (
        <span className={`status-tag status-tag--${row.status === 1 ? 'green' : 'red'}`}>
          {STAFF_STATUS_MAP[row.status] ?? '-'}
        </span>
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 90,
      render: (_: unknown, row: StaffItem) => (
        <Button size="small" onClick={() => navigate(`/staff/${row.id}`)}>
          查看
        </Button>
      ),
    },
  ]

  return (
    <div className="staff-page">
      <PageContainer
        title="人员管理"
        description="机构管理员维护当前机构普通用户、专业服务人员及账号状态"
        extra={
          <Space>
            <Button onClick={() => navigate('/staff/credentials')}>执业资质</Button>
            <Button onClick={() => navigate('/staff/audit')}>资质审核</Button>
            <Button onClick={() => navigate('/staff/qualification')}>派单资格总览</Button>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/staff/create')}>
              新增人员
            </Button>
          </Space>
        }
      >
        {/* 筛选 */}
        <Card variant="borderless" className="filter-bar">
          <Input
            placeholder="请输入姓名或手机号"
            value={filters.keyword}
            onChange={(e) => setFilters((f) => ({ ...f, keyword: e.target.value.trim() }))}
            allowClear
          />
          <Select
            placeholder="全部类型"
            value={filters.staff_type}
            onChange={(v) => setFilters((f) => ({ ...f, staff_type: v }))}
            options={Object.entries(STAFF_TYPE_MAP).map(([value, label]) => ({
              value: Number(value),
              label,
            }))}
            allowClear
          />
          <Select
            placeholder="全部岗位"
            value={filters.position_code}
            onChange={(v) => setFilters((f) => ({ ...f, position_code: v }))}
            options={positions.map((p) => ({ value: p.position_code, label: p.position_name }))}
            allowClear
            showSearch
            optionFilterProp="label"
          />
          <Select
            placeholder="全部状态"
            value={filters.status}
            onChange={(v) => setFilters((f) => ({ ...f, status: v }))}
            options={Object.entries(STAFF_STATUS_MAP).map(([value, label]) => ({
              value: Number(value),
              label,
            }))}
            allowClear
          />
          <Button onClick={resetFilters}>重置</Button>
          <Button type="primary" onClick={applyFilters}>查询</Button>
        </Card>

        {/* 人员表格 */}
        <Card variant="borderless" className="list-card table-fill">
          <Table<StaffItem>
            rowKey="id"
            size="small"
            columns={columns}
            dataSource={list}
            loading={loading}
            pagination={{
              current: page,
              pageSize,
              total,
              onChange: (nextPage, nextPageSize) => {
                setPage(nextPage)
                setPageSize(nextPageSize)
              },
              showSizeChanger: true,
              showTotal: (total) => `共 ${total} 条`,
            }}
          />
        </Card>
      </PageContainer>
    </div>
  )
}
