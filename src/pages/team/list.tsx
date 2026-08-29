/**
 * 团队管理 - 团队列表（设计稿：13.团队管理/团队列表.png）
 * 机构管理员建立本机构健康管理团队，维护医生、护士和健康管理师成员池
 * TODO: 团队管理接口 API v0.1 未定义，待后端补充
 */
import { useMemo, useState } from 'react'
import { Button, Card, Input, Select, Table } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import PageContainer from '@/components/PageContainer'
import { mockTeamList, mockTeamStats, type MockTeamRow } from './mock'
import './index.less'

interface Filters {
  keyword: string
  org?: string
  status?: 'enabled' | 'disabled'
}

const ORG_OPTIONS = ['城东护理院', '幸福护理院', '安康康复中心']

export default function TeamList() {
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
      mockTeamList.filter((row) => {
        if (applied.keyword && !row.name.includes(applied.keyword)) return false
        if (applied.org && row.org !== applied.org) return false
        if (applied.status && row.status !== applied.status) return false
        return true
      }),
    [applied],
  )

  const stats = [
    { label: '团队总数', value: mockTeamStats.total, note: mockTeamStats.totalNote, noteTone: 'green' },
    { label: '团队成员', value: mockTeamStats.members, note: mockTeamStats.membersNote, noteTone: 'blue' },
    { label: '在管患者', value: mockTeamStats.patients, note: mockTeamStats.patientsNote, noteTone: 'orange' },
    { label: '未分配患者', value: mockTeamStats.unassigned, note: mockTeamStats.unassignedNote, noteTone: 'red' },
  ]

  const columns = [
    {
      title: '团队名称',
      key: 'name',
      render: (_: unknown, row: MockTeamRow) => (
        <div>
          <div className="team-row__name">{row.name}</div>
          <div className="team-row__sub">编号 {row.code}</div>
        </div>
      ),
    },
    { title: '所属机构', dataIndex: 'org', key: 'org' },
    { title: '医生', dataIndex: 'doctor', key: 'doctor' },
    { title: '护士', dataIndex: 'nurse', key: 'nurse' },
    { title: '健康管理师', dataIndex: 'manager', key: 'manager' },
    {
      title: '在管患者',
      key: 'patientCount',
      render: (_: unknown, row: MockTeamRow) => (
        <span className={`team-tag team-tag--${row.patientTone}`}>{row.patientCount}人</span>
      ),
    },
    {
      title: '状态',
      key: 'status',
      render: (_: unknown, row: MockTeamRow) => (
        <span className={`team-tag team-tag--${row.status === 'enabled' ? 'green' : 'red'}`}>
          {row.status === 'enabled' ? '启用' : '停用'}
        </span>
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 90,
      render: (_: unknown, row: MockTeamRow) => (
        <Button size="small" onClick={() => navigate(`/team/${row.id}`)}>
          查看
        </Button>
      ),
    },
  ]

  return (
    <div className="team-page">
      <PageContainer
        title="团队管理"
        description="机构管理员建立本机构健康管理团队，维护医生、护士和健康管理师成员池"
        extra={
          <>
            <Button onClick={() => navigate('/team/unassigned')}>待分配患者</Button>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/team/create')}>
              新建团队
            </Button>
          </>
        }
      >
        {/* 统计卡 */}
        <div className="team-stats">
          {stats.map((s) => (
            <div
              key={s.label}
              className={`team-stat${s.label === '未分配患者' ? ' team-stat--link' : ''}`}
              onClick={s.label === '未分配患者' ? () => navigate('/team/unassigned') : undefined}
            >
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
            placeholder="请输入团队名称"
            value={filters.keyword}
            onChange={(e) => setFilters((f) => ({ ...f, keyword: e.target.value.trim() }))}
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
            placeholder="全部状态"
            value={filters.status}
            onChange={(v) => setFilters((f) => ({ ...f, status: v }))}
            options={[
              { value: 'enabled', label: '启用' },
              { value: 'disabled', label: '停用' },
            ]}
            allowClear
          />
          
          <Button type="primary" onClick={applyFilters}>查询</Button>
          <Button onClick={resetFilters}>重置</Button>
        </Card>

        {/* 团队表格 */}
        <Card variant="borderless" className="list-card">
          <Table<MockTeamRow>
            rowKey="id"
            columns={columns}
            dataSource={filtered}
            pagination={false}
          />
          <div className="team-list__footer">
            <span>共 8 个团队　1 / 1</span>
            <span className="team-text--danger">
              团队是责任人候选成员池；患者责任关系在健康档案中指定。
            </span>
          </div>
        </Card>
      </PageContainer>
    </div>
  )
}
