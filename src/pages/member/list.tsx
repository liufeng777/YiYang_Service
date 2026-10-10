/**
 * 健康会员 - 健康会员列表（设计稿：2.健康会员/健康会员列表.png）
 * 管理已通过系统实名认证的服务对象、健康档案状态与专业团队归属
 * TODO: 接入后端后对齐 API §4.1 GET /api/v1/staff/members
 */
import { useMemo, useState } from 'react'
import { Button, DatePicker, Input, Select, Table, message } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import PageContainer from '@/components/PageContainer'
import { RISK_LAYER, mockMembers, type MemberItem } from './mock'
import './index.less'

export default function MemberList() {
  const navigate = useNavigate()
  const [keyword, setKeyword] = useState('')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  const list = useMemo(
    () => mockMembers.filter((m) => !keyword || m.name.includes(keyword) || m.phone.includes(keyword)),
    [keyword],
  )

  const columns = [
    {
      title: '健康会员 / 手机号',
      key: 'name',
      render: (_: unknown, row: MemberItem) => (
        <div>
          <span className="mb-row__name">{row.name}</span>{' '}
          <span className="mb-row__sub">{row.phone}</span>
        </div>
      ),
    },
    { title: '关联注册会员', dataIndex: 'linkedUser', key: 'linkedUser' },
    {
      title: '健康档案',
      dataIndex: 'profile',
      key: 'profile',
      render: (v: MemberItem['profile']) => (
        <span className={v === '已建档' ? 'mb-text--ok' : 'mb-text--warn'}>{v}</span>
      ),
    },
    {
      title: '风险分层',
      dataIndex: 'risk',
      key: 'risk',
      render: (v: MemberItem['risk']) => (
        <span className={`mb-text--risk-${v}`}>{RISK_LAYER[v].text}</span>
      ),
    },
    {
      title: '健康管理团队',
      key: 'team',
      render: (_: unknown, row: MemberItem) =>
        row.team ? (
          <span>
            {row.team} <span className="mb-row__sub">· 已纳管</span>
          </span>
        ) : (
          <span className="mb-text--warn">待分配团队</span>
        ),
    },
    {
      title: '最近随访',
      key: 'lastFollowup',
      render: (_: unknown, row: MemberItem) =>
        row.lastFollowup ?? <span className="mb-row__sub">尚未随访</span>,
    },
    {
      title: '操作',
      key: 'action',
      width: 90,
      render: (_: unknown, row: MemberItem) => (
        <Button size="small" onClick={() => navigate(`/member/${row.id}`)}>
          查看
        </Button>
      ),
    },
  ]

  return (
    <PageContainer
      title="健康会员管理"
      description="管理已通过系统实名认证的服务对象、健康档案状态与专业团队归属"
      extra={
        <Button type="primary" icon={<PlusOutlined />} onClick={() => message.success('开始导出健康会员（mock）')}>
          导出健康会员
        </Button>
      }
    >
      {/* 页签位（一期仅健康会员列表） */}
      <div className="mb-tabs">
        <span className="mb-tabs__item mb-tabs__item--active">健康会员列表</span>
      </div>

      {/* 筛选区 */}
      <div className="mb-card mb-filters">
        <div className="mb-filters__field">
          <span className="mb-filters__label">健康会员信息</span>
          <Input
            placeholder="姓名 / 手机号"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value.trim())}
            allowClear
          />
        </div>
        <div className="mb-filters__field">
          <span className="mb-filters__label">实名状态</span>
          <Select
            defaultValue="passed"
            options={[{ value: 'passed', label: '系统校验通过' }]}
          />
        </div>
        <div className="mb-filters__field">
          <span className="mb-filters__label">团队状态</span>
          <Select
            defaultValue="all"
            options={[
              { value: 'all', label: '全部状态' },
              { value: 'managed', label: '已纳管' },
              { value: 'unassigned', label: '待分配团队' },
            ]}
          />
        </div>
        <div className="mb-filters__field">
          <span className="mb-filters__label">建档日期</span>
          <DatePicker placeholder="2026-08-12" />
        </div>
        <div className="mb-filters__actions">
          <Button type="primary">查询</Button>
          <Button onClick={() => setKeyword('')}>重置</Button>
        </div>
      </div>

      {/* 列表 */}
      <div className="mb-card mb-table table-fill">
        <Table<MemberItem>
          rowKey="id"
          columns={columns}
          dataSource={list}
          pagination={{
            current: page,
            pageSize,
            total: list.length,
            onChange: (nextPage, nextPageSize) => {
              setPage(nextPage)
              setPageSize(nextPageSize)
            },
            showTotal: (total) => `共 ${total} 条`,
          }}
        />
      </div>
    </PageContainer>
  )
}
