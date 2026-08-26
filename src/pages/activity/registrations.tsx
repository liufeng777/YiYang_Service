/**
 * 健康活动 - 报名名单（设计稿：报名名单.png）
 * 机构主动联系报名人，确认参与人、席位与需求
 * TODO: 报名名单接口 API v0.1 未定义，数据为本地 mock
 */
import { useMemo, useState } from 'react'
import { Button, Input, Select, Table, message } from 'antd'
import { useNavigate, useParams } from 'react-router-dom'
import PageContainer from '@/components/PageContainer'
import {
  REG_CONTACT_TEXT,
  REG_LEAD_TEXT,
  mockActivityInfo,
  mockRegistrations,
  type MockRegistrationRow,
  type RegContactStatus,
} from './mock'
import './index.less'

interface Filters {
  keyword: string
  identity?: string
  contact?: RegContactStatus
  checkin?: string
}

export default function ActivityRegistrations() {
  const { id } = useParams()
  const navigate = useNavigate()
  const a = mockActivityInfo
  const [filters, setFilters] = useState<Filters>({ keyword: '' })

  const filtered = useMemo(
    () =>
      mockRegistrations.filter((row) => {
        if (filters.keyword && ![row.applicant, row.participant].some((v) => v.includes(filters.keyword)))
          return false
        if (filters.identity && row.accountType !== filters.identity) return false
        if (filters.contact && row.contactStatus !== filters.contact) return false
        if (filters.checkin === '已签到' && !row.checkedIn) return false
        if (filters.checkin === '未签到' && row.checkedIn) return false
        return true
      }),
    [filters],
  )

  const renderAction = (row: MockRegistrationRow) => {
    if (row.contactStatus === 'pending') {
      return (
        <Button
          type="link"
          size="small"
          onClick={() => navigate(`/health-activity/${id ?? a.id}/registrations/${row.id}/contact`)}
        >
          联系确认
        </Button>
      )
    }
    if (row.contactStatus === 'unreachable') {
      return (
        <Button
          type="link"
          size="small"
          onClick={() => navigate(`/health-activity/${id ?? a.id}/registrations/${row.id}/contact`)}
        >
          再次联系
        </Button>
      )
    }
    if (row.leadResult === 'created' || row.leadResult === 'linked') {
      return (
        <Button type="link" size="small" onClick={() => navigate('/leads')}>
          查看线索
        </Button>
      )
    }
    return (
      <Button type="link" size="small" onClick={() => navigate('/health-record')}>
        查看档案
      </Button>
    )
  }

  const columns = [
    {
      title: '报名人 / 实际参与人',
      key: 'applicant',
      render: (_: unknown, row: MockRegistrationRow) => (
        <span className="ac-row__name">
          {row.applicant} <span className="ac-row__sub">/ {row.participant}</span>
        </span>
      ),
    },
    { title: '账号身份', dataIndex: 'accountType', key: 'accountType' },
    { title: '档案状态', dataIndex: 'profileStatus', key: 'profileStatus' },
    {
      title: '联系状态',
      key: 'contactStatus',
      render: (_: unknown, row: MockRegistrationRow) => (
        <span className={row.contactStatus === 'pending' ? 'ac-text--warn' : undefined}>
          {REG_CONTACT_TEXT[row.contactStatus]}
        </span>
      ),
    },
    {
      title: '线索结果',
      key: 'leadResult',
      render: (_: unknown, row: MockRegistrationRow) => (
        <span
          className={
            row.leadResult === 'created' || row.leadResult === 'linked' ? 'ac-text--warn' : undefined
          }
        >
          {REG_LEAD_TEXT[row.leadResult]}
        </span>
      ),
    },
    {
      title: '签到',
      key: 'checkedIn',
      render: (_: unknown, row: MockRegistrationRow) =>
        row.checkedIn ? (
          <span className="ac-text--success">已签到</span>
        ) : (
          <span className="ac-row__sub">未签到</span>
        ),
    },
    {
      title: '操作',
      key: 'action',
      width: 110,
      render: (_: unknown, row: MockRegistrationRow) => renderAction(row),
    },
  ]

  return (
    <div className="ac-page">
      <PageContainer
        title="报名名单"
        description="机构主动联系报名人，确认参与人、席位与需求"
        extra={
          <Button type="primary" onClick={() => message.success('导出任务已创建，完成后可下载')}>
            导出名单
          </Button>
        }
      >
        {/* 活动信息条 */}
        <div className="ac-activity-bar">
          <div className="ac-activity-bar__main">
            {a.time}　{a.place}
          </div>
          <div className="ac-activity-bar__meta">
            报名 {a.signed}/{a.quota}　<span className="ac-text--warn">待联系 {a.pendingContact}</span>
            　已确认 {a.confirmed}　不参加 {a.declined}
          </div>
        </div>

        {/* 筛选 */}
        <div className="ac-filters">
          <div className="ac-filters__item ac-filters__item--grow">
            <Input
              placeholder="姓名 / 手机号 / 会员ID"
              value={filters.keyword}
              onChange={(e) => setFilters((f) => ({ ...f, keyword: e.target.value.trim() }))}
              allowClear
            />
          </div>
          <Select
            placeholder="身份状态：全部"
            value={filters.identity}
            onChange={(v) => setFilters((f) => ({ ...f, identity: v }))}
            options={['实名会员', '注册会员'].map((v) => ({ value: v, label: `身份状态：${v}` }))}
            allowClear
          />
          <Select
            placeholder="联系状态：全部"
            value={filters.contact}
            onChange={(v) => setFilters((f) => ({ ...f, contact: v }))}
            options={Object.entries(REG_CONTACT_TEXT).map(([value, label]) => ({
              value,
              label: `联系状态：${label}`,
            }))}
            allowClear
          />
          <Select
            placeholder="签到状态：全部"
            value={filters.checkin}
            onChange={(v) => setFilters((f) => ({ ...f, checkin: v }))}
            options={['已签到', '未签到'].map((v) => ({ value: v, label: `签到状态：${v}` }))}
            allowClear
          />
          <div className="ac-filters__actions">
            <Button type="primary">查询</Button>
            <Button onClick={() => setFilters({ keyword: '' })}>重置</Button>
          </div>
        </div>

        {/* 报名表格 */}
        <div className="ac-list">
          <Table<MockRegistrationRow>
            rowKey="id"
            columns={columns}
            dataSource={filtered}
            pagination={false}
          />
        </div>
      </PageContainer>
    </div>
  )
}
