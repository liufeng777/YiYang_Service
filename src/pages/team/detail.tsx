/**
 * 团队管理 - 团队详情（成员与在管患者，设计稿：成员与在管患者.png + 成员在管患者抽屉.png）
 * 查看团队成员，以及每位成员作为责任人关联的患者和待办
 * TODO: 团队管理接口 API v0.1 未定义，待后端补充
 */
import { useMemo, useState } from 'react'
import { Button, Card, Drawer, Input, Select, Table } from 'antd'
import { useNavigate } from 'react-router-dom'
import PageContainer from '@/components/PageContainer'
import {
  TEAM_ROLE_TEXT,
  mockMemberPatients,
  mockTeamDetail as d,
  type MockTeamMemberRow,
} from './mock'
import './index.less'

interface Filters {
  keyword: string
  role?: string
  patient: string
}

export default function TeamDetail() {
  const navigate = useNavigate()
  const [filters, setFilters] = useState<Filters>({ keyword: '', patient: '' })
  const [applied, setApplied] = useState<Filters>({ keyword: '', patient: '' })
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [drawerOpen, setDrawerOpen] = useState(false)

  const applyFilters = () => setApplied(filters)

  const resetFilters = () => {
    const init: Filters = { keyword: '', patient: '' }
    setFilters(init)
    setApplied(init)
  }

  const filtered = useMemo(
    () =>
      d.members.filter((row) => {
        if (applied.keyword && !row.name.includes(applied.keyword)) return false
        if (applied.role && TEAM_ROLE_TEXT[row.role] !== applied.role) return false
        if (
          applied.patient &&
          !row.patients.some((p) => p.name.includes(applied.patient))
        )
          return false
        return true
      }),
    [applied],
  )

  const columns = [
    {
      title: '成员',
      key: 'name',
      render: (_: unknown, row: MockTeamMemberRow) => (
        <div>
          <div className="team-row__name">{row.name}</div>
          <div className="team-row__sub">工号 {row.staffNo}</div>
        </div>
      ),
    },
    {
      title: '岗位',
      key: 'role',
      render: (_: unknown, row: MockTeamMemberRow) => TEAM_ROLE_TEXT[row.role],
    },
    { title: '手机号', dataIndex: 'phone', key: 'phone' },
    {
      title: '责任患者',
      key: 'patientCount',
      render: (_: unknown, row: MockTeamMemberRow) => `${row.patientCount}人`,
    },
    { title: '今日待办', dataIndex: 'todayTodo', key: 'todayTodo' },
    {
      title: '部分责任患者',
      key: 'patients',
      render: (_: unknown, row: MockTeamMemberRow) => (
        <span>
          {row.patients.map((p, i) => (
            <span key={p.name}>
              <span className={`team-text--${p.tone}`}>{p.name}</span>
              {i < row.patients.length - 1 && '、'}
            </span>
          ))}
          …
        </span>
      ),
    },
    {
      title: '状态',
      key: 'status',
      render: (_: unknown, row: MockTeamMemberRow) => (
        <span className="team-tag team-tag--green">{row.status}</span>
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 110,
      render: () => (
        <Button size="small" onClick={() => setDrawerOpen(true)}>
          查看全部
        </Button>
      ),
    },
  ]

  return (
    <div className="team-page">
      <PageContainer
        title={d.name}
        description="查看团队成员，以及每位成员作为责任人关联的患者和待办"
        extra={
          <Button type="primary" onClick={() => navigate('/team/create')}>
            编辑团队成员
          </Button>
        }
      >
        {/* 统计卡 */}
        <div className="team-stats">
          {d.stats.map((s) => (
            <div key={s.label} className="team-stat">
              <div className="team-stat__label">{s.label}</div>
              <div className="team-stat__body">
                <span className="team-stat__value">{s.value}</span>
                <span className={`team-stat__note team-stat__note--${s.noteTone}`}>{s.note}</span>
              </div>
            </div>
          ))}
        </div>

        {/* 筛选 */}
        <Card variant="borderless" className="filter-bar">
          <Input
            placeholder="请输入姓名"
            value={filters.keyword}
            onChange={(e) => setFilters((f) => ({ ...f, keyword: e.target.value.trim() }))}
            allowClear
          />
          <Select
            placeholder="全部岗位"
            value={filters.role}
            onChange={(v) => setFilters((f) => ({ ...f, role: v }))}
            options={Object.values(TEAM_ROLE_TEXT).map((v) => ({ value: v, label: v }))}
            allowClear
          />
          <Input
            placeholder="请输入责任患者姓名"
            value={filters.patient}
            onChange={(e) => setFilters((f) => ({ ...f, patient: e.target.value.trim() }))}
            allowClear
          />
          
          <Button type="primary" onClick={applyFilters}>查询</Button>
          <Button onClick={resetFilters}>重置</Button>
        </Card>

        {/* 成员表格 */}
        <Card variant="borderless" className="list-card table-fill">
          <Table<MockTeamMemberRow>
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
          <div className="team-list__footer">
            <span className="team-text--danger">{d.footerNote}</span>
          </div>
        </Card>
      </PageContainer>

      {/* 成员在管患者抽屉 */}
      <Drawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        width={640}
        closable={false}
        title={
          <div className="team-drawer__head">
            <div>
              <div className="team-drawer__title">{mockMemberPatients.title}</div>
              <div className="team-drawer__sub">{mockMemberPatients.sub}</div>
            </div>
            <Button onClick={() => setDrawerOpen(false)}>关闭</Button>
          </div>
        }
        footer={
          <div className="team-drawer__footer">
            <span>共{mockMemberPatients.total}名患者 · 当前显示1—{mockMemberPatients.list.length}</span>
            <Button onClick={() => setDrawerOpen(false)}>关闭</Button>
          </div>
        }
      >
        <div className="team-note team-note--green">{mockMemberPatients.banner}</div>
        <div className="team-drawer__patient-bar">
          <Input placeholder="搜索患者姓名、手机号" allowClear />
          <span className="team-tag team-tag--blue">全部{mockMemberPatients.total}人</span>
        </div>
        {mockMemberPatients.list.map((p) => (
          <div key={p.name} className="team-patient">
            <div className="team-patient__avatar" />
            <div className="team-patient__info">
              <div className="team-patient__name">{p.name}</div>
              <div className="team-patient__meta">{p.sexAge}</div>
            </div>
            <div className="team-patient__diseases">{p.diseases}</div>
            <div className="team-patient__side">
              <span className={`team-tag team-tag--${p.statusTone}`}>{p.status}</span>
              <div className="team-patient__meta">最近管理 {p.lastAt}</div>
            </div>
            <span className="team-text--link">查看档案 ›</span>
          </div>
        ))}
      </Drawer>
    </div>
  )
}
