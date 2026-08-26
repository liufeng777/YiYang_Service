/**
 * 人员管理 - 执业资质列表（设计稿：2.服务授权/资质列表.png）
 * 集中维护人员证照、审核状态和到期预警，派单时按服务项目自动校验
 * TODO: 接口见 @/api/modules/staff（§7 资质列表/新增/状态更新），待后端联调后替换 mock
 */
import { useMemo, useState } from 'react'
import { Button, Input, Select, Table } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import PageContainer from '@/components/PageContainer'
import {
  CREDENTIAL_STATUS_TEXT,
  CRED_DISPATCH_TEXT,
  mockCertTypes,
  mockCredentialList,
  mockCredentialStats,
  type CredDispatchStatus,
  type CredentialStatus,
  type MockCredentialRow,
} from './mock'
import './index.less'

const STATUS_TONE: Record<CredentialStatus, string> = {
  pending: 'blue',
  approved: 'green',
  expiring: 'orange',
  expired: 'red',
}

const DISPATCH_TONE: Record<CredDispatchStatus, string> = {
  checking: 'teal',
  normal: 'green',
  limited: 'red',
}

interface Filters {
  keyword: string
  org?: string
  certType?: string
  status?: CredentialStatus
  expiry?: string
}

const ORG_OPTIONS = ['城东护理院', '幸福护理院', '安康康复中心']
const EXPIRY_OPTIONS = ['30天内到期', '已过期', '有效']

export default function CredentialList() {
  const navigate = useNavigate()
  const [filters, setFilters] = useState<Filters>({ keyword: '' })

  const filtered = useMemo(
    () =>
      mockCredentialList.filter((row) => {
        if (filters.keyword && ![row.name, row.phone].some((v) => v.includes(filters.keyword)))
          return false
        if (filters.org && row.org !== filters.org) return false
        if (filters.certType && row.certType !== filters.certType) return false
        if (filters.status && row.status !== filters.status) return false
        return true
      }),
    [filters],
  )

  const stats = [
    { label: '资质总数', value: mockCredentialStats.total, note: mockCredentialStats.totalNote, noteTone: 'green' },
    { label: '待审核', value: mockCredentialStats.pending, note: mockCredentialStats.pendingNote, noteTone: 'blue' },
    { label: '即将到期', value: mockCredentialStats.expiring, note: mockCredentialStats.expiringNote, noteTone: 'orange' },
    { label: '已过期', value: mockCredentialStats.expired, note: mockCredentialStats.expiredNote, noteTone: 'red' },
  ]

  const columns = [
    {
      title: '人员',
      key: 'name',
      render: (_: unknown, row: MockCredentialRow) => (
        <div>
          <div className="staff-row__name">{row.name}</div>
          <div className="staff-row__sub">{row.phone}</div>
        </div>
      ),
    },
    { title: '所属机构', dataIndex: 'org', key: 'org' },
    { title: '岗位 / 职种', dataIndex: 'role', key: 'role' },
    { title: '证书类型', dataIndex: 'certType', key: 'certType' },
    { title: '有效期', dataIndex: 'validUntil', key: 'validUntil' },
    {
      title: '资质状态',
      key: 'status',
      render: (_: unknown, row: MockCredentialRow) => (
        <span className={`staff-tag staff-tag--${STATUS_TONE[row.status]}`}>
          {CREDENTIAL_STATUS_TEXT[row.status]}
        </span>
      ),
    },
    {
      title: '派单状态',
      key: 'dispatch',
      render: (_: unknown, row: MockCredentialRow) => (
        <span className={`staff-tag staff-tag--${DISPATCH_TONE[row.dispatch]}`}>
          {CRED_DISPATCH_TEXT[row.dispatch]}
        </span>
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 90,
      render: (_: unknown, row: MockCredentialRow) => (
        <Button
          size="small"
          onClick={() =>
            row.status === 'pending'
              ? navigate(`/staff/audit/${row.id.replace('CR', 'AU')}`)
              : navigate(`/staff/${row.staffId}`)
          }
        >
          {row.status === 'pending' ? '审核' : '查看'}
        </Button>
      ),
    },
  ]

  return (
    <div className="staff-page">
      <PageContainer
        title="执业资质"
        description="集中维护人员证照、审核状态和到期预警，派单时按服务项目自动校验"
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => navigate('/staff/ST-001/credential-upload')}
          >
            新增资质
          </Button>
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
        <div className="staff-filters">
          <div className="staff-filters__item">
            <div className="staff-filters__label">人员 / 手机号</div>
            <Input
              placeholder="请输入人员姓名或手机号"
              value={filters.keyword}
              onChange={(e) => setFilters((f) => ({ ...f, keyword: e.target.value.trim() }))}
              allowClear
            />
          </div>
          <div className="staff-filters__item">
            <div className="staff-filters__label">所属机构</div>
            <Select
              placeholder="全部机构"
              value={filters.org}
              onChange={(v) => setFilters((f) => ({ ...f, org: v }))}
              options={ORG_OPTIONS.map((v) => ({ value: v, label: v }))}
              allowClear
            />
          </div>
          <div className="staff-filters__item">
            <div className="staff-filters__label">证书类型</div>
            <Select
              placeholder="全部类型"
              value={filters.certType}
              onChange={(v) => setFilters((f) => ({ ...f, certType: v }))}
              options={mockCertTypes.map((v) => ({ value: v, label: v }))}
              allowClear
            />
          </div>
          <div className="staff-filters__item">
            <div className="staff-filters__label">审核状态</div>
            <Select
              placeholder="全部状态"
              value={filters.status}
              onChange={(v) => setFilters((f) => ({ ...f, status: v }))}
              options={Object.entries(CREDENTIAL_STATUS_TEXT).map(([value, label]) => ({
                value,
                label,
              }))}
              allowClear
            />
          </div>
          <div className="staff-filters__item">
            <div className="staff-filters__label">到期状态</div>
            <Select
              placeholder="全部状态"
              value={filters.expiry}
              onChange={(v) => setFilters((f) => ({ ...f, expiry: v }))}
              options={EXPIRY_OPTIONS.map((v) => ({ value: v, label: v }))}
              allowClear
            />
          </div>
          <div className="staff-filters__actions">
            <Button type="primary">查询</Button>
            <Button onClick={() => setFilters({ keyword: '' })}>重置</Button>
          </div>
        </div>

        {/* 资质表格 */}
        <div className="staff-list">
          <Table<MockCredentialRow>
            rowKey="id"
            columns={columns}
            dataSource={filtered}
            pagination={false}
          />
          <div className="staff-list__footer">
            <span>共 256 份　1 / 26</span>
            <span className="staff-text--danger">
              证照到期仅限制依赖该资质的服务，不停用人员账号
            </span>
          </div>
        </div>
      </PageContainer>
    </div>
  )
}
