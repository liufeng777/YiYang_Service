/**
 * 人员管理 - 专业人员派单资格（设计稿：状态总览.png）
 * 仅展示专业服务人员，综合校验人员关系、证照和服务项目授权
 * TODO: 派单资格综合校验接口 API v0.1 未单列，待后端补充（基础数据见 @/api/modules/staff §7）
 */
import { useMemo, useState } from 'react'
import { Button, Card, Select, Table } from 'antd'
import { useNavigate } from 'react-router-dom'
import PageContainer from '@/components/PageContainer'
import { mockQualList, mockQualStats, type MockQualRow } from './mock'
import './index.less'

interface Filters {
  org?: string
  role?: string
  service?: string
  credential?: string
  dispatch?: 'ok' | 'no'
}

const ORG_OPTIONS = ['城东护理院', '幸福护理院', '安康康复中心']
const ROLE_OPTIONS = ['医师', '护士', '护理员', '康复治疗师']
const SERVICE_OPTIONS = ['输液港维护', '上门采血', '伤口护理', '康复训练']
const CREDENTIAL_OPTIONS = ['有效', '待人工审核', '即将到期', '已过期']

export default function StaffQualification() {
  const navigate = useNavigate()
  const [filters, setFilters] = useState<Filters>({})
  const [applied, setApplied] = useState<Filters>({})
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  const applyFilters = () => setApplied(filters)

  const resetFilters = () => {
    setFilters({})
    setApplied({})
  }

  const filtered = useMemo(
    () =>
      mockQualList.filter((row) => {
        if (applied.org && row.org !== applied.org) return false
        if (applied.role && row.role !== applied.role) return false
        if (applied.dispatch && row.dispatch !== applied.dispatch) return false
        if (applied.credential && !row.credentialStatus.includes(applied.credential)) return false
        return true
      }),
    [applied],
  )

  const stats = [
    { label: '可派单', value: mockQualStats.ok, note: mockQualStats.okNote, noteTone: 'green' },
    { label: '待审核', value: mockQualStats.pending, note: mockQualStats.pendingNote, noteTone: 'orange' },
    { label: '即将到期', value: mockQualStats.expiring, note: mockQualStats.expiringNote, noteTone: 'orange' },
    { label: '已限制', value: mockQualStats.limited, note: mockQualStats.limitedNote, noteTone: 'red' },
  ]

  const columns = [
    {
      title: '人员',
      key: 'name',
      render: (_: unknown, row: MockQualRow) => (
        <div>
          <div className="staff-row__name">{row.name}</div>
          <div className="staff-row__sub">{row.role}</div>
        </div>
      ),
    },
    { title: '所属机构', dataIndex: 'org', key: 'org' },
    {
      title: '证照状态',
      key: 'credentialStatus',
      render: (_: unknown, row: MockQualRow) => (
        <span className={`staff-tag staff-tag--${row.credentialTone}`}>{row.credentialStatus}</span>
      ),
    },
    { title: '授权项目', dataIndex: 'authCount', key: 'authCount' },
    {
      title: '派单资格',
      key: 'dispatch',
      render: (_: unknown, row: MockQualRow) => (
        <span className={`staff-tag staff-tag--${row.dispatch === 'ok' ? 'green' : 'red'}`}>
          {row.dispatch === 'ok' ? '可派单' : '不可派单'}
        </span>
      ),
    },
    {
      title: '限制原因',
      key: 'limitReason',
      render: (_: unknown, row: MockQualRow) =>
        row.limitReason === '—' ? (
          <span className="staff-text--muted">—</span>
        ) : (
          <span className="staff-text--danger">{row.limitReason}</span>
        ),
    },
    {
      title: '审核状态',
      key: 'audit',
      render: (_: unknown, row: MockQualRow) =>
        row.auditTone ? (
          <span className={`staff-tag staff-tag--${row.auditTone}`}>{row.audit}</span>
        ) : (
          <span className="staff-text--muted">{row.audit}</span>
        ),
    },
    {
      title: '操作',
      key: 'action',
      width: 90,
      render: (_: unknown, row: MockQualRow) => (
        <Button size="small" onClick={() => navigate(`/staff/${row.id}`)}>
          {row.action === 'audit' ? '审核' : '查看'}
        </Button>
      ),
    },
  ]

  return (
    <div className="staff-page">
      <PageContainer
        title="专业人员派单资格"
        description="仅展示专业服务人员，综合校验人员关系、证照和服务项目授权"
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
            placeholder="全部项目"
            value={filters.service}
            onChange={(v) => setFilters((f) => ({ ...f, service: v }))}
            options={SERVICE_OPTIONS.map((v) => ({ value: v, label: v }))}
            allowClear
          />
          <Select
            placeholder="全部状态"
            value={filters.credential}
            onChange={(v) => setFilters((f) => ({ ...f, credential: v }))}
            options={CREDENTIAL_OPTIONS.map((v) => ({ value: v, label: v }))}
            allowClear
          />
          <Select
            placeholder="全部"
            value={filters.dispatch}
            onChange={(v) => setFilters((f) => ({ ...f, dispatch: v }))}
            options={[
              { value: 'ok', label: '可派单' },
              { value: 'no', label: '不可派单' },
            ]}
            allowClear
          />
          
          <Button type="primary" onClick={applyFilters}>查询</Button>
          <Button onClick={resetFilters}>重置</Button>
        </Card>

        {/* 派单资格表格 */}
        <Card variant="borderless" className="list-card table-fill">
          <Table<MockQualRow>
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
            <span>普通用户不进入本列表。</span>
            <span className="staff-text--ok">
              派单时再次校验人员状态、任职、证照与服务授权。
            </span>
          </div>
        </Card>
      </PageContainer>
    </div>
  )
}
