/**
 * 随访管理 - 我的随访（设计稿：待回访.png / 已回访.png）
 * 已对接 GET /api/v1/staff/followups（服务端分页，待回访 status=1 / 已回访 status=3）
 * 说明：随访类型 / 关键字筛选 API v0.1 未提供查询参数，当前页内本地过滤；
 * 顶部统计卡无对应接口，已移除（仅保留「创建健康预警回访」入口）
 */
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Button, Card, Input, Select, Table, Tabs } from 'antd'
import { SearchOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import dayjs from 'dayjs'
import PageContainer from '@/components/PageContainer'
import { followupApi } from '@/api'
import { FOLLOWUP_TYPE_MAP, type FollowupItem } from '@/api/modules/followup'
import './index.less'

const TYPE_OPTIONS = Object.entries(FOLLOWUP_TYPE_MAP).map(([value, label]) => ({
  value: Number(value),
  label,
}))

/** 随访类型标签样式（对齐原设计稿配色） */
const TYPE_TAG_CLS: Record<number, string> = {
  1: 'disease',
  2: 'warning',
  3: 'daily',
  4: 'service',
}

export default function FollowupList() {
  const navigate = useNavigate()
  const [tab, setTab] = useState<'pending' | 'done'>('pending')
  const [typeFilter, setTypeFilter] = useState<number>()
  const [keyword, setKeyword] = useState('')
  const [applied, setApplied] = useState({ typeFilter: undefined as number | undefined, keyword: '' })
  const [list, setList] = useState<FollowupItem[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  const fetchList = useCallback(async () => {
    setLoading(true)
    try {
      const res = await followupApi.getFollowups({
        page,
        page_size: pageSize,
        status: tab === 'pending' ? 1 : 3,
      })
      setList(res.list)
      setTotal(res.total)
    } catch {
      // 错误提示由拦截器统一处理
    } finally {
      setLoading(false)
    }
  }, [page, pageSize, tab])

  useEffect(() => {
    fetchList()
  }, [fetchList])

  // 类型 / 关键字筛选 API 未提供参数，仅在当前页结果内过滤
  const filtered = useMemo(
    () =>
      list.filter((row) => {
        if (applied.typeFilter && row.followup_type !== applied.typeFilter) return false
        if (applied.keyword && !(row.member_name ?? '').includes(applied.keyword)) return false
        return true
      }),
    [list, applied],
  )

  const applyFilters = () => {
    setApplied({ typeFilter, keyword })
    setPage(1)
  }

  const onReset = () => {
    setTypeFilter(undefined)
    setKeyword('')
    setApplied({ typeFilter: undefined, keyword: '' })
  }

  const typeTag = (type: number) => (
    <span className={`fu-tag fu-tag--${TYPE_TAG_CLS[type] ?? 'plain'}`}>
      {FOLLOWUP_TYPE_MAP[type] ?? '-'}
    </span>
  )

  const pendingColumns = [
    {
      title: '计划时间',
      dataIndex: 'next_followup_date',
      key: 'next_followup_date',
      render: (v?: string) => v || '-',
    },
    {
      title: '服务对象',
      key: 'member',
      render: (_: unknown, row: FollowupItem) => (
        <span>
          {row.member_name || '-'} <span className="fu-row__sub">#{row.member_id}</span>
        </span>
      ),
    },
    { title: '随访类型', key: 'type', render: (_: unknown, row: FollowupItem) => typeTag(row.followup_type) },
    {
      title: '任务说明',
      dataIndex: 'followup_name',
      key: 'followup_name',
      render: (v?: string | null) => v || '-',
    },
    {
      title: '操作',
      key: 'action',
      width: 110,
      render: (_: unknown, row: FollowupItem) => (
        <Button type="primary" size="small" onClick={() => navigate(`/followup/${row.id}/execute`)}>
          开始回访
        </Button>
      ),
    },
  ]

  const doneColumns = [
    {
      title: '完成时间',
      dataIndex: 'followup_time',
      key: 'followup_time',
      render: (v?: number | null) => (v ? dayjs(v * 1000).format('YYYY-MM-DD HH:mm') : '-'),
    },
    {
      title: '服务对象',
      key: 'member',
      render: (_: unknown, row: FollowupItem) => (
        <span>
          {row.member_name || '-'} <span className="fu-row__sub">#{row.member_id}</span>
        </span>
      ),
    },
    { title: '随访类型', key: 'type', render: (_: unknown, row: FollowupItem) => typeTag(row.followup_type) },
    {
      title: '任务说明',
      dataIndex: 'followup_name',
      key: 'followup_name',
      render: (v?: string | null) => v || '-',
    },
    {
      title: '下次随访',
      dataIndex: 'next_followup_date',
      key: 'next_followup_date',
      render: (v?: string) => v || '-',
    },
    {
      title: '操作',
      key: 'action',
      width: 110,
      render: (_: unknown, row: FollowupItem) => (
        <Button size="small" onClick={() => navigate(`/followup/${row.id}/execute`)}>
          查看记录
        </Button>
      ),
    },
  ]

  return (
    <div className="fu-page">
      <PageContainer
        title="我的随访"
        description={
          tab === 'pending'
            ? '系统按专病类型＋当前风险层级固定规则生成；健康预警回访由健管师手动创建'
            : '查看当前健管师已完成的随访记录'
        }
      >
        <Tabs
          activeKey={tab}
          onChange={(k) => {
            setTab(k as 'pending' | 'done')
            setPage(1)
          }}
          items={[
            { key: 'pending', label: '待回访' },
            { key: 'done', label: '已回访' },
          ]}
        />

        {tab === 'pending' && (
          <div className="fu-stats">
            <div className="fu-stat fu-stat--banner">
              <div>
                <div className="fu-stat__banner-title">发现患者健康指标异常？</div>
                <div className="fu-stat__banner-sub">由健管师判断是否需要新建健康预警回访</div>
              </div>
              <Button type="primary" onClick={() => navigate('/followup/create')}>
                创建健康预警回访
              </Button>
            </div>
          </div>
        )}

        {/* 筛选 */}
        <Card variant="borderless" className="filter-bar">
          <Select
            placeholder="全部类型"
            value={typeFilter}
            onChange={setTypeFilter}
            options={TYPE_OPTIONS}
            allowClear
          />
          <Input
            prefix={<SearchOutlined />}
            placeholder="姓名"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value.trim())}
            allowClear
          />
          <Button type="primary" onClick={applyFilters}>查询</Button>
          <Button onClick={onReset}>重置</Button>
        </Card>

        {/* 列表 */}
        <Card variant="borderless" className="list-card table-fill">
          <Table<FollowupItem>
            rowKey="id"
            columns={tab === 'pending' ? pendingColumns : doneColumns}
            dataSource={filtered}
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
              showTotal: (total) => `共 ${total} 条`,
            }}
          />
        </Card>

        <div className="fu-footnote">
          <span className="fu-footnote__label">交互说明</span>
          {tab === 'pending'
            ? '一期固定规则：高风险每周1次、中风险每2周1次、低风险每月1次；服务后回访由服务完成触发，健康预警回访由健管师手动创建。状态仅保留“待回访 / 已回访”。'
            : '“已回访”按完成时间记录；联系失败也保留联系记录，但只有完成有效问卷后才计入有效随访。'}
        </div>
      </PageContainer>
    </div>
  )
}
