/**
 * 健康档案 - 档案列表（设计稿：V2-01 健康档案列表.png）
 * 已对接 GET /api/v1/staff/members（服务端分页，支持 keyword / risk_level 筛选）
 * 接口未覆盖的列（最新健康指标/完整度/同步状态/下次任务）以「-」占位，待后端补充字段
 */
import { useCallback, useEffect, useState } from 'react'
import { Avatar, Button, Card, Dropdown, Input, Select, Table } from 'antd'
import { MoreOutlined, PlusOutlined, UploadOutlined } from '@ant-design/icons'
import { useNavigate, useSearchParams } from 'react-router-dom'
import PageContainer from '@/components/PageContainer'
import { memberApi } from '@/api'
import { MEMBER_STATUS_MAP, RISK_LEVEL_MAP, type MemberItem } from '@/api/modules/member'
import './index.less'

/** 由生日（ISO 字符串）计算年龄 */
function calcAge(birthday?: string): number | null {
  if (!birthday) return null
  const birth = new Date(birthday).getFullYear()
  if (Number.isNaN(birth)) return null
  return new Date().getFullYear() - birth
}

export default function HealthRecordList() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [keyword, setKeyword] = useState(searchParams.get('keyword') ?? '')
  const [risk, setRisk] = useState<number>()
  const [applied, setApplied] = useState<{ keyword: string; risk?: number }>({
    keyword: searchParams.get('keyword') ?? '',
  })
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
        keyword: applied.keyword || undefined,
        risk_level: applied.risk,
      })
      setList(res.list)
      setTotal(res.total)
    } catch {
      // 错误提示由拦截器统一处理
    } finally {
      setLoading(false)
    }
  }, [page, pageSize, applied])

  useEffect(() => {
    fetchList()
  }, [fetchList])

  const applyFilters = () => {
    setApplied({ keyword, risk })
    setPage(1)
  }

  const onReset = () => {
    setKeyword('')
    setRisk(undefined)
    setApplied({ keyword: '' })
    setPage(1)
  }

  const columns = [
    {
      title: '服务对象',
      key: 'member',
      render: (_: unknown, row: MemberItem) => {
        const age = calcAge(row.birthday)
        return (
          <div className="hr-row__member">
            <Avatar className="hr-avatar" size={40}>
              {(row.name || '-').slice(0, 1)}
            </Avatar>
            <div>
              <div className="hr-row__name">{row.name || '-'}</div>
              <div className="hr-row__sub">
                {row.gender === 1 ? '男' : row.gender === 2 ? '女' : '-'}
                {age !== null ? ` · ${age}岁` : ''}&nbsp;&nbsp;{row.phone || '-'}
              </div>
            </div>
          </div>
        )
      },
    },
    {
      title: '健康概况',
      key: 'health',
      render: (_: unknown, row: MemberItem) => {
        const riskValue = row.risk_level?.level_value
        const riskText =
          row.risk_level?.level_name || (riskValue ? RISK_LEVEL_MAP[riskValue] : '')
        const riskCls =
          riskValue === 3 ? 'high' : riskValue === 2 ? 'mid' : riskValue === 1 ? 'low' : ''
        return (
          <div className="hr-row__tags">
            {row.chronic_disease_count > 0 && (
              <span className="hr-tag hr-tag--disease">慢病 {row.chronic_disease_count} 项</span>
            )}
            {riskText ? (
              <span className={`hr-tag hr-tag--risk-${riskCls}`}>{riskText}</span>
            ) : (
              <span className="hr-row__sub">未评级</span>
            )}
          </div>
        )
      },
    },
    {
      title: '最新健康指标',
      key: 'metrics',
      render: () => <span className="hr-row__sub">-</span>,
    },
    {
      title: '档案与同步',
      key: 'sync',
      render: (_: unknown, row: MemberItem) => (
        <div>
          <div className="hr-row__metric">
            {row.status > 1 ? '已建档' : '待完善'}
            {row.assessment_count > 0 ? ` · 测评 ${row.assessment_count} 次` : ''}
          </div>
          <div className="hr-row__sub">同步状态 -</div>
        </div>
      ),
    },
    {
      title: '管理归属',
      key: 'owner',
      render: (_: unknown, row: MemberItem) => (
        <div>
          <div className="hr-row__metric">{MEMBER_STATUS_MAP[row.status] ?? '-'}</div>
          <div className="hr-row__sub">责任健管师 -</div>
        </div>
      ),
    },
    {
      title: '下次任务',
      key: 'task',
      render: () => <span className="hr-row__sub">-</span>,
    },
    {
      title: '操作',
      key: 'action',
      width: 190,
      render: (_: unknown, row: MemberItem) => (
        <div className="hr-row__actions">
          <Button type="link" size="small" onClick={() => navigate(`/health-record/${row.id}`)}>
            查看档案
          </Button>
          <Button type="link" size="small" onClick={() => navigate('/followup/create')}>
            发起随访
          </Button>
          <Dropdown
            menu={{
              items: [
                { key: 'edit', label: '编辑基础信息' },
                { key: 'record', label: '录入健康指标' },
                { key: 'risk-level', label: '分层分级详情' },
                { key: 'risk-change', label: '分层变化处理' },
                { key: 'assign', label: '分配管理团队' },
              ],
              onClick: ({ key }) => {
                if (key === 'risk-level') navigate(`/health-record/${row.id}/risk-level`)
                if (key === 'risk-change') navigate(`/health-record/${row.id}/risk-change`)
                if (key === 'assign') navigate(`/health-record/${row.id}/assign`)
              },
            }}
          >
            <Button type="text" size="small" icon={<MoreOutlined />} />
          </Dropdown>
        </div>
      ),
    },
  ]

  return (
    <div className="hr-page">
      <PageContainer
        title="健康档案"
        description="统一管理基础信息、健康风险、指标记录与连续健康服务"
        extra={
          <div className="hr-page__header-actions">
            <Button icon={<UploadOutlined />} onClick={() => navigate('/health-record/import')}>
              批量导入
            </Button>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/health-record/create')}>
              新建健康档案
            </Button>
          </div>
        }
      >
        {/* 筛选卡 */}
        <Card variant="borderless" className="filter-bar">
          <Input
            placeholder="搜索手机号、会员ID或姓名"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value.trim())}
            onPressEnter={applyFilters}
            allowClear
          />
          <Select
            placeholder="全部风险"
            value={risk}
            onChange={(v) => setRisk(v)}
            options={Object.entries(RISK_LEVEL_MAP).map(([value, label]) => ({
              value: Number(value),
              label,
            }))}
            allowClear
          />
          <Button onClick={onReset}>重置</Button>
          <Button type="primary" onClick={applyFilters}>查询</Button>
        </Card>

        {/* 档案列表卡 */}
        <Card variant="borderless" className="list-card table-fill">
          <div className="list-card__header">
            <span className="list-card__header__title">档案列表</span>
          </div>
          <Table<MemberItem>
            rowKey="id"
            size="small"
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
              showSizeChanger: true,
              showTotal: (t) => `共 ${t} 条`,
            }}
          />
        </Card>
      </PageContainer>
    </div>
  )
}
