/**
 * 人员管理 - 人员列表（设计稿：人员列表.png）
 * 机构管理员维护当前机构普通用户、专业服务人员及账号状态
 * TODO: 接口见 @/api/modules/staff（《协同工作台-API设计》§7），待后端联调后替换 mock
 */
import { useMemo, useState } from 'react'
import { Button, Card, Input, Select, Table } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import PageContainer from '@/components/PageContainer'
import {
  DISPATCH_TEXT,
  STAFF_STATUS_TEXT,
  STAFF_TYPE_TEXT,
  mockStaffList,
  mockStaffStats,
  type MockStaffRow,
  type StaffStatus,
  type StaffType,
} from './mock'
import './index.less'

interface Filters {
  keyword: string
  type?: StaffType
  org?: string
  role?: string
  status?: StaffStatus
}

const ORG_OPTIONS = ['城东护理院', '幸福护理院', '安康康复中心']
const ROLE_OPTIONS = ['护士', '医师', '护理员', '康复治疗师', '机构健康管理师']

export default function StaffList() {
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
      mockStaffList.filter((row) => {
        if (applied.keyword && ![row.name, row.phone].some((v) => v.includes(applied.keyword)))
          return false
        if (applied.type && row.type !== applied.type) return false
        if (applied.org && row.org !== applied.org) return false
        if (applied.role && row.role !== applied.role) return false
        if (applied.status && row.status !== applied.status) return false
        return true
      }),
    [applied],
  )

  const stats = [
    { label: '人员总数', value: mockStaffStats.total, note: mockStaffStats.totalNote, noteTone: 'green' },
    { label: '普通用户', value: mockStaffStats.normal, note: mockStaffStats.normalNote, noteTone: 'blue' },
    { label: '专业服务人员', value: mockStaffStats.pro, note: mockStaffStats.proNote, noteTone: 'orange' },
    { label: '派单受限', value: mockStaffStats.restricted, note: mockStaffStats.restrictedNote, noteTone: 'red' },
  ]

  const columns = [
    {
      title: '人员',
      key: 'name',
      render: (_: unknown, row: MockStaffRow) => (
        <div>
          <div className="staff-row__name">{row.name}</div>
          <div className="staff-row__sub">{row.phone}</div>
        </div>
      ),
    },
    {
      title: '人员类型',
      key: 'type',
      render: (_: unknown, row: MockStaffRow) => STAFF_TYPE_TEXT[row.type],
    },
    { title: '所属机构', dataIndex: 'org', key: 'org' },
    { title: '人员角色', dataIndex: 'role', key: 'role' },
    {
      title: '资质与授权',
      key: 'credential',
      render: (_: unknown, row: MockStaffRow) =>
        row.credentialTone ? (
          <span className={`staff-tag staff-tag--${row.credentialTone}`}>{row.credential}</span>
        ) : (
          <span className="staff-text--muted">{row.credential}</span>
        ),
    },
    {
      title: '人员状态',
      key: 'status',
      render: (_: unknown, row: MockStaffRow) => (
        <span className={`staff-tag staff-tag--${row.statusTone}`}>
          {STAFF_STATUS_TEXT[row.status]}
        </span>
      ),
    },
    {
      title: '账号·派单',
      key: 'dispatch',
      render: (_: unknown, row: MockStaffRow) => (
        <span className={`staff-tag staff-tag--${row.dispatchTone}`}>
          {DISPATCH_TEXT[row.dispatch]}
        </span>
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 90,
      render: (_: unknown, row: MockStaffRow) => (
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
          <>
            <Button onClick={() => navigate('/staff/credentials')}>执业资质</Button>
            <Button onClick={() => navigate('/staff/audit')}>资质审核</Button>
            <Button onClick={() => navigate('/staff/qualification')}>派单资格总览</Button>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/staff/create')}>
              新增人员
            </Button>
          </>
        }
      >
        {/* 统计卡 */}
        <div className="staff-stats">
          {stats.map((s) => (
            <div key={s.label} className="staff-stat">
              <div className="staff-stat__label">{s.label}</div>
              <div className="staff-stat__body">
                <span className="staff-stat__value">{s.value}</span>
                <span className={`staff-stat__note staff-stat__note--${s.noteTone}`}>{s.note}</span>
              </div>
            </div>
          ))}
        </div>

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
            value={filters.type}
            onChange={(v) => setFilters((f) => ({ ...f, type: v }))}
            options={Object.entries(STAFF_TYPE_TEXT).map(([value, label]) => ({ value, label }))}
            allowClear
          />
          <Select
            placeholder="全部机构"
            value={filters.org}
            onChange={(v) => setFilters((f) => ({ ...f, org: v }))}
            options={ORG_OPTIONS.map((v) => ({ value: v, label: v }))}
            allowClear
          />
          <Select
            placeholder="全部角色"
            value={filters.role}
            onChange={(v) => setFilters((f) => ({ ...f, role: v }))}
            options={ROLE_OPTIONS.map((v) => ({ value: v, label: v }))}
            allowClear
          />
          <Select
            placeholder="全部状态"
            value={filters.status}
            onChange={(v) => setFilters((f) => ({ ...f, status: v }))}
            options={Object.entries(STAFF_STATUS_TEXT).map(([value, label]) => ({ value, label }))}
            allowClear
          />
          
          <Button type="primary" onClick={applyFilters}>查询</Button>
          <Button onClick={resetFilters}>重置</Button>
        </Card>

        {/* 人员表格 */}
        <Card variant="borderless" className="list-card table-fill">
          <Table<MockStaffRow>
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
          <div className="staff-list__footer">
            <span className="staff-text--danger">
              本页仅维护当前机构；平台管理员可切换机构代建。
            </span>
          </div>
        </Card>
      </PageContainer>
    </div>
  )
}
