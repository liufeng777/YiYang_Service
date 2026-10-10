/**
 * 角色管理 - 角色列表（设计稿：14.角色管理/角色列表.png）
 * 角色由系统管理员统一配置，供全系统使用；首页待办与数据范围由系统规则自动生成
 * TODO: 角色管理接口 API v0.1 未定义（运营后台域），待后端补充
 */
import { useMemo, useState } from 'react'
import { Button, Card, Input, Select, Table } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import PageContainer from '@/components/PageContainer'
import {
  ROLE_TYPE_TEXT,
  mockRoleList,
  mockRoleModules,
  mockRoleStats,
  type MockRoleRow,
  type RoleConfigType,
} from './mock'
import './index.less'

interface Filters {
  keyword: string
  type?: RoleConfigType
  module?: string
  status?: 'enabled' | 'disabled'
}

export default function RoleList() {
  const navigate = useNavigate()
  const [filters, setFilters] = useState<Filters>({ keyword: '' })
  const [applied, setApplied] = useState<Filters>({ keyword: '' })
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  const applyFilters = () => setApplied(filters)

  const resetFilters = () => {
    const init: Filters = { keyword: '' }
    setFilters(init)
    setApplied(init)
  }

  const filtered = useMemo(
    () =>
      mockRoleList.filter((row) => {
        if (applied.keyword && !row.name.includes(applied.keyword)) return false
        if (applied.type && row.type !== applied.type) return false
        if (applied.module && !row.scope.includes(applied.module.replace('管理', ''))) return false
        if (applied.status && row.status !== applied.status) return false
        return true
      }),
    [applied],
  )

  const stats = [
    { label: '角色总数', value: mockRoleStats.total, note: mockRoleStats.totalNote, noteTone: 'green' },
    { label: '系统预置角色', value: mockRoleStats.preset, note: mockRoleStats.presetNote, noteTone: 'blue' },
    { label: '自定义角色', value: mockRoleStats.custom, note: mockRoleStats.customNote, noteTone: 'orange' },
    { label: '停用角色', value: mockRoleStats.disabled, note: mockRoleStats.disabledNote, noteTone: 'red' },
  ]

  const columns = [
    {
      title: '角色名称',
      key: 'name',
      render: (_: unknown, row: MockRoleRow) => (
        <div>
          <div className="role-row__name">{row.name}</div>
          <div className="role-row__sub">编码 {row.code}</div>
        </div>
      ),
    },
    {
      title: '配置类型',
      key: 'type',
      render: (_: unknown, row: MockRoleRow) => ROLE_TYPE_TEXT[row.type],
    },
    { title: '主要权限', dataIndex: 'scope', key: 'scope' },
    {
      title: '使用人数',
      key: 'userCount',
      render: (_: unknown, row: MockRoleRow) => `${row.userCount}人`,
    },
    {
      title: '更新日期',
      key: 'updatedAt',
      render: (_: unknown, row: MockRoleRow) => (
        <span className={`role-tag role-tag--${row.dateTone}`}>{row.updatedAt}</span>
      ),
    },
    {
      title: '状态',
      key: 'status',
      render: (_: unknown, row: MockRoleRow) => (
        <span className={`role-tag role-tag--${row.status === 'enabled' ? 'green' : 'red'}`}>
          {row.status === 'enabled' ? '启用' : '待启用'}
        </span>
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 90,
      render: () => (
        <Button size="small" onClick={() => navigate('/role/create')}>
          查看
        </Button>
      ),
    },
  ]

  return (
    <div className="role-page">
      <PageContainer
        title="角色管理"
        description="角色由系统管理员统一配置，供全系统使用；首页待办与数据范围由系统规则自动生成。"
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/role/create')}>
            新建角色
          </Button>
        }
      >
        {/* 统计卡 */}
        <div className="role-stats">
          {stats.map((s) => (
            <div key={s.label} className="role-stat">
              <div className="role-stat__label">{s.label}</div>
              <div className="role-stat__body">
                <span className="role-stat__value">{s.value}</span>
                <span className={`role-stat__note role-stat__note--${s.noteTone}`}>{s.note}</span>
              </div>
            </div>
          ))}
        </div>

        {/* 筛选 */}
        <Card variant="borderless" className="filter-bar">
          <Input
            placeholder="请输入角色名称"
            value={filters.keyword}
            onChange={(e) => setFilters((f) => ({ ...f, keyword: e.target.value.trim() }))}
            allowClear
          />
          <Select
            placeholder="全部类型"
            value={filters.type}
            onChange={(v) => setFilters((f) => ({ ...f, type: v }))}
            options={Object.entries(ROLE_TYPE_TEXT).map(([value, label]) => ({ value, label }))}
            allowClear
          />
          <Select
            placeholder="全部模块"
            value={filters.module}
            onChange={(v) => setFilters((f) => ({ ...f, module: v }))}
            options={mockRoleModules.map((v) => ({ value: v, label: v }))}
            allowClear
          />
          <Select
            placeholder="全部状态"
            value={filters.status}
            onChange={(v) => setFilters((f) => ({ ...f, status: v }))}
            options={[
              { value: 'enabled', label: '启用' },
              { value: 'disabled', label: '待启用' },
            ]}
            allowClear
          />
          <Button type="primary" onClick={applyFilters}>查询</Button>
          <Button onClick={resetFilters}>重置</Button>
          
        </Card>

        {/* 角色表格 */}
        <Card variant="borderless" className="list-card table-fill">
          <Table<MockRoleRow>
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
          <div className="role-list__footer">
            <span className="role-text--danger">
              角色由系统管理员统一维护，供全系统使用；人员在新增或编辑时选择角色。
            </span>
          </div>
        </Card>
      </PageContainer>
    </div>
  )
}
