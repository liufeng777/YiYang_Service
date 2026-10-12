/**
 * 健康会员 - 健康会员列表（设计稿：2.健康会员/健康会员列表.png）
 * 已对接 GET /api/v1/staff/members（服务端分页）
 * 接口未覆盖的列（关联注册会员/健康管理团队/最近随访）以「-」占位，待后端补充字段
 */
import { useCallback, useEffect, useState } from 'react'
import { Button, Input, Select, Table, App } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import PageContainer from '@/components/PageContainer'
import { memberApi } from '@/api'
import type { MemberItem } from '@/api/modules/member'
import { MEMBER_STATUS_MAP, RISK_LEVEL_MAP } from '@/api/modules/member'
import './index.less'

export default function MemberList() {
  const navigate = useNavigate()
  const { message } = App.useApp()
  const [keyword, setKeyword] = useState('')
  const [appliedKeyword, setAppliedKeyword] = useState('')
  const [list, setList] = useState<MemberItem[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  const fetchList = useCallback(async () => {
    setLoading(true)
    try {
      const res = await memberApi.getMemberList({
        page,
        page_size: pageSize,
        keyword: appliedKeyword || undefined,
      })
      setList(res.list)
      setTotal(res.total)
    } catch {
      // 错误提示由拦截器统一处理
    } finally {
      setLoading(false)
    }
  }, [page, pageSize, appliedKeyword])

  useEffect(() => {
    fetchList()
  }, [fetchList])

  const columns = [
    {
      title: '健康会员 / 手机号',
      key: 'name',
      render: (_: unknown, row: MemberItem) => (
        <div>
          <span className="mb-row__name">{row.name || '-'}</span>{' '}
          <span className="mb-row__sub">{row.phone || '-'}</span>
        </div>
      ),
    },
    {
      title: '关联注册会员',
      key: 'linkedUser',
      render: () => <span className="mb-row__sub">-</span>,
    },
    {
      title: '健康档案',
      dataIndex: 'status',
      key: 'status',
      render: (v: number) =>
        v > 1 ? (
          <span className="mb-text--ok">已建档</span>
        ) : (
          <span className="mb-text--warn">待完善</span>
        ),
    },
    {
      title: '风险分层',
      key: 'risk',
      render: (_: unknown, row: MemberItem) => {
        const text =
          row.risk_level?.level_name ||
          (row.risk_level?.level_value ? RISK_LEVEL_MAP[row.risk_level.level_value] : '')
        if (!text) return <span className="mb-row__sub">未评级</span>
        const cls =
          row.risk_level?.level_value === 3
            ? 'mb-text--risk-high'
            : row.risk_level?.level_value === 2
              ? 'mb-text--risk-mid'
              : 'mb-text--risk-low'
        return <span className={cls}>{text}</span>
      },
    },
    {
      title: '健康管理团队',
      dataIndex: 'status',
      key: 'team',
      render: (v: number) =>
        v === 3 ? (
          <span>{MEMBER_STATUS_MAP[v]} <span className="mb-row__sub">· 已纳管</span></span>
        ) : (
          <span className="mb-text--warn">待分配团队</span>
        ),
    },
    {
      title: '最近随访',
      key: 'lastFollowup',
      render: () => <span className="mb-row__sub">-</span>,
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
        <Button type="primary" icon={<PlusOutlined />} onClick={() => message.info('导出接口暂未提供')}>
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
            onPressEnter={() => {
              setPage(1)
              setAppliedKeyword(keyword)
            }}
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
        <div className="mb-filters__actions">
          <Button
            type="primary"
            onClick={() => {
              setPage(1)
              setAppliedKeyword(keyword)
            }}
          >
            查询
          </Button>
          <Button
            onClick={() => {
              setKeyword('')
              setAppliedKeyword('')
              setPage(1)
            }}
          >
            重置
          </Button>
        </div>
      </div>

      {/* 列表 */}
      <div className="mb-card mb-table table-fill">
        <Table<MemberItem>
          rowKey="id"
          columns={columns}
          dataSource={list}
          loading={loading}
          pagination={{
            current: page,
            pageSize,
            total,
            onChange: (nextPage, nextPageSize) => {
              setPage(nextPage)
              setPageSize(nextPageSize)
            },
            showTotal: (t) => `共 ${t} 条`,
          }}
        />
      </div>
    </PageContainer>
  )
}
