/**
 * 机构管理 - 机构列表（设计稿：机构列表.png）
 * 平台管理员统一维护机构主数据、首个机构管理员及运营平台同步状态
 * TODO: 机构主数据接口 API v0.1 未定义（运营后台域），数据为本地 mock（见 ./mock.ts）
 */
import { useMemo, useState } from 'react'
import { Button, Input, Select, Table, message } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import PageContainer from '@/components/PageContainer'
import {
  ORG_SYNC_TEXT,
  mockOrgList,
  mockOrgStats,
  type MockOrgRow,
  type OrgSyncStatus,
} from './mock'
import './index.less'

const SYNC_TONE: Record<OrgSyncStatus, string> = {
  synced: 'green',
  pending: 'orange',
  failed: 'red',
}

interface Filters {
  keyword: string
  type?: string
  status?: string
  sync?: OrgSyncStatus
}

export default function InstitutionList() {
  const navigate = useNavigate()
  const [filters, setFilters] = useState<Filters>({ keyword: '' })

  const filtered = useMemo(
    () =>
      mockOrgList.filter((row) => {
        if (filters.keyword && ![row.name, row.code].some((v) => v.includes(filters.keyword)))
          return false
        if (filters.type && row.type !== filters.type) return false
        if (filters.status && row.status !== filters.status) return false
        if (filters.sync && row.syncStatus !== filters.sync) return false
        return true
      }),
    [filters],
  )

  const stats = [
    { label: '机构总数', value: mockOrgStats.total, note: mockOrgStats.totalNote, noteTone: 'green' },
    { label: '服务人员', value: mockOrgStats.staff, note: mockOrgStats.staffNote, noteTone: 'blue' },
    { label: '待同步', value: mockOrgStats.pendingSync, note: mockOrgStats.pendingSyncNote, noteTone: 'orange' },
    { label: '资质预警', value: mockOrgStats.licenseWarning, note: mockOrgStats.licenseWarningNote, noteTone: 'red' },
  ]

  const columns = [
    {
      title: '机构名称',
      key: 'name',
      render: (_: unknown, row: MockOrgRow) => (
        <div>
          <div className="org-row__name">{row.name}</div>
          <div className="org-row__sub">
            {row.codeLabel}：{row.code}
          </div>
        </div>
      ),
    },
    { title: '机构类型', dataIndex: 'type', key: 'type' },
    {
      title: '服务能力',
      key: 'services',
      render: (_: unknown, row: MockOrgRow) => row.services.join(' | '),
    },
    {
      title: '人员',
      key: 'staffCount',
      render: (_: unknown, row: MockOrgRow) => `${row.staffCount}人`,
    },
    {
      title: '运营状态',
      key: 'status',
      render: (_: unknown, row: MockOrgRow) => (
        <span className={`org-tag org-tag--${row.status === '运营中' ? 'green' : 'orange'}`}>
          {row.status}
        </span>
      ),
    },
    {
      title: '同步状态',
      key: 'syncStatus',
      render: (_: unknown, row: MockOrgRow) => (
        <span className={`org-tag org-tag--${SYNC_TONE[row.syncStatus]}`}>
          {ORG_SYNC_TEXT[row.syncStatus]}
        </span>
      ),
    },
    { title: '更新时间', dataIndex: 'updatedAt', key: 'updatedAt' },
    {
      title: '操作',
      key: 'action',
      width: 90,
      render: (_: unknown, row: MockOrgRow) =>
        row.syncStatus === 'synced' ? (
          <Button size="small" onClick={() => navigate(`/organization/${row.id}`)}>
            查看
          </Button>
        ) : (
          <Button size="small" onClick={() => navigate(`/organization/${row.id}`)}>
            编辑
          </Button>
        ),
    },
  ]

  return (
    <div className="org-page">
      <PageContainer
        title="机构管理"
        description="平台管理员统一维护机构主数据、首个机构管理员及运营平台同步状态"
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => navigate('/organization/create')}
          >
            新增机构
          </Button>
        }
      >
        {/* 统计卡 */}
        <div className="org-stats">
          {stats.map((s) => (
            <div key={s.label} className="org-stat">
              <div className="org-stat__label">{s.label}</div>
              <div className="org-stat__body">
                <span className="org-stat__value">{s.value}</span>
                <span className={`org-stat__note org-stat__note--${s.noteTone}`}>{s.note}</span>
              </div>
            </div>
          ))}
        </div>

        {/* 筛选 */}
        <div className="org-filters">
          <div className="org-filters__item">
            <div className="org-filters__label">机构名称 / 统一信用代码</div>
            <Input
              placeholder="请输入机构名称或代码"
              value={filters.keyword}
              onChange={(e) => setFilters((f) => ({ ...f, keyword: e.target.value.trim() }))}
              allowClear
            />
          </div>
          <div className="org-filters__item">
            <div className="org-filters__label">机构类型</div>
            <Select
              placeholder="全部类型"
              value={filters.type}
              onChange={(v) => setFilters((f) => ({ ...f, type: v }))}
              options={['护理院', '康复机构'].map((v) => ({ value: v, label: v }))}
              allowClear
            />
          </div>
          <div className="org-filters__item">
            <div className="org-filters__label">运营状态</div>
            <Select
              placeholder="全部状态"
              value={filters.status}
              onChange={(v) => setFilters((f) => ({ ...f, status: v }))}
              options={['运营中', '已停用'].map((v) => ({ value: v, label: v }))}
              allowClear
            />
          </div>
          <div className="org-filters__item">
            <div className="org-filters__label">同步状态</div>
            <Select
              placeholder="全部状态"
              value={filters.sync}
              onChange={(v) => setFilters((f) => ({ ...f, sync: v }))}
              options={Object.entries(ORG_SYNC_TEXT).map(([value, label]) => ({ value, label }))}
              allowClear
            />
          </div>
          <div className="org-filters__actions">
            <Button type="primary">查询</Button>
            <Button onClick={() => setFilters({ keyword: '' })}>重置</Button>
            <Button onClick={() => message.success('导出任务已创建，完成后可下载')}>导出</Button>
          </div>
        </div>

        {/* 机构表格 */}
        <div className="org-list">
          <Table<MockOrgRow>
            rowKey="id"
            columns={columns}
            dataSource={filtered}
            pagination={false}
          />
          <div className="org-list__footer">
            <span>共 8 家机构　1 / 1</span>
            <span>仅平台管理员可新增机构；机构管理员维护本机构人员与团队</span>
          </div>
        </div>
      </PageContainer>
    </div>
  )
}
