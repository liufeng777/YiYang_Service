/**
 * 人员管理 - 专业人员审核队列（设计稿：2.服务授权/审核队列.png）
 * 统一审核人员执业资质和服务项目授权，审核结论决定派单资格
 * TODO: 统一审核接口 API v0.1 未单列（§7 仅有资质状态更新），待后端补充
 */
import { useMemo, useState } from 'react'
import { Button, Card, DatePicker, Input, Select, Table } from 'antd'
import { useNavigate } from 'react-router-dom'
import PageContainer from '@/components/PageContainer'
import {
  AUDIT_STATUS_TEXT,
  mockAuditList,
  mockAuditStats,
  type AuditStatus,
  type MockAuditRow,
} from './mock'
import './index.less'

const STATUS_TONE: Record<AuditStatus, string> = {
  pending: 'orange',
  supplement: 'blue',
  approved: 'green',
  rejected: 'red',
  expiring: 'red',
}

const TABS: { value?: AuditStatus; label: string }[] = [
  { value: undefined, label: '全部' },
  { value: 'pending', label: '待审核' },
  { value: 'supplement', label: '待补充' },
  { value: 'approved', label: '审核通过' },
  { value: 'rejected', label: '审核不通过' },
  { value: 'expiring', label: '即将到期' },
]

const ROLE_OPTIONS = ['医师', '护士', '护理员', '康复治疗师', '检验人员']
const ORG_OPTIONS = ['城东护理院', '幸福护理院', '安康康复中心', '康复机构']

export default function StaffAudit() {
  const navigate = useNavigate()
  const [tab, setTab] = useState<AuditStatus | undefined>('pending')
  const [keyword, setKeyword] = useState('')
  const [role, setRole] = useState<string>()
  const [org, setOrg] = useState<string>()
  const [applied, setApplied] = useState({ keyword: '', role: undefined as string | undefined, org: undefined as string | undefined })

  const applyFilters = () => setApplied({ keyword, role, org })

  const resetFilters = () => {
    setKeyword('')
    setRole(undefined)
    setOrg(undefined)
    setApplied({ keyword: '', role: undefined, org: undefined })
  }

  const filtered = useMemo(
    () =>
      mockAuditList.filter((row) => {
        if (tab && row.status !== tab) return false
        if (applied.keyword && ![row.name, row.phone].some((v) => v.includes(applied.keyword))) return false
        if (applied.role && !row.roleOrg.startsWith(applied.role)) return false
        if (applied.org && !row.roleOrg.endsWith(applied.org)) return false
        return true
      }),
    [tab, applied],
  )

  const stats = [
    { label: '待审核', value: mockAuditStats.pending, note: mockAuditStats.pendingNote, noteTone: 'orange' },
    { label: '待补充', value: mockAuditStats.supplement, note: mockAuditStats.supplementNote, noteTone: 'blue' },
    { label: '即将到期', value: mockAuditStats.expiring, note: mockAuditStats.expiringNote, noteTone: 'red' },
    { label: '本月已通过', value: mockAuditStats.monthApproved, note: mockAuditStats.monthApprovedNote, noteTone: 'green' },
  ]

  const columns = [
    {
      title: '人员',
      key: 'name',
      render: (_: unknown, row: MockAuditRow) => (
        <div>
          <div className="staff-row__name">{row.name}</div>
          <div className="staff-row__sub">{row.phone}</div>
        </div>
      ),
    },
    { title: '角色 / 机构', dataIndex: 'roleOrg', key: 'roleOrg' },
    { title: '执业资质', dataIndex: 'credential', key: 'credential' },
    { title: '服务授权', dataIndex: 'auth', key: 'auth' },
    { title: '提交时间', dataIndex: 'submittedAt', key: 'submittedAt' },
    {
      title: '审核状态',
      key: 'status',
      render: (_: unknown, row: MockAuditRow) => (
        <span className={`staff-tag staff-tag--${STATUS_TONE[row.status]}`}>
          {AUDIT_STATUS_TEXT[row.status]}
        </span>
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 100,
      render: (_: unknown, row: MockAuditRow) =>
        row.status === 'pending' ? (
          <Button size="small" type="primary" onClick={() => navigate(`/staff/audit/${row.id}`)}>
            去审核
          </Button>
        ) : (
          <Button size="small" onClick={() => navigate(`/staff/${row.staffId}`)}>
            查看
          </Button>
        ),
    },
  ]

  return (
    <div className="staff-page">
      <PageContainer
        title="专业人员审核"
        description="统一审核人员执业资质和服务项目授权，审核结论决定派单资格"
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

        {/* 状态页签 */}
        <div className="staff-audit-tabs">
          {TABS.map((t) => (
            <Button
              key={t.label}
              type={tab === t.value ? 'primary' : 'default'}
              onClick={() => setTab(t.value)}
            >
              {t.label}
            </Button>
          ))}
        </div>

        {/* 筛选 */}
        <Card variant="borderless" className="filter-bar">
          <Input
            placeholder="姓名 / 手机号 / 工号"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value.trim())}
            allowClear
          />
          <Select
            placeholder="全部角色"
            value={role}
            onChange={setRole}
            options={ROLE_OPTIONS.map((v) => ({ value: v, label: v }))}
            allowClear
          />
          <Select
            placeholder="全部机构"
            value={org}
            onChange={setOrg}
            options={ORG_OPTIONS.map((v) => ({ value: v, label: v }))}
            allowClear
          />
          <DatePicker placeholder="提交时间" />
          <Button onClick={resetFilters}>重置</Button>
          <Button type="primary" onClick={applyFilters}>查询</Button>
        </Card>

        {/* 审核表格 */}
        <Card variant="borderless" className="list-card">
          <Table<MockAuditRow>
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
