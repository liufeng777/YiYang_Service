/** 随访列表：状态与随访类型均由服务端筛选。 */
import { useCallback, useEffect, useState } from 'react'
import { Button, Card, Select, Table, Tabs } from 'antd'
import { useNavigate } from 'react-router-dom'
import dayjs from 'dayjs'
import PageContainer from '@/components/PageContainer'
import { followupApi } from '@/api'
import { FOLLOWUP_TYPE_MAP, type FollowupItem } from '@/api/modules/followup'
import './index.less'

const TYPE_OPTIONS = Object.entries(FOLLOWUP_TYPE_MAP).map(([value, label]) => ({ value: Number(value), label }))
const TYPE_TAG_CLS: Record<number, string> = { 1: 'daily', 2: 'warning' }

function planTime(row: FollowupItem) {
  const value = row.plan_time ?? row.next_followup_date
  if (typeof value === 'number') return dayjs(value * 1000).format('YYYY-MM-DD HH:mm')
  return value || '-'
}

export default function FollowupList() {
  const navigate = useNavigate()
  const [tab, setTab] = useState<'pending' | 'done'>('pending')
  const [typeFilter, setTypeFilter] = useState<number>()
  const [appliedType, setAppliedType] = useState<number>()
  const [list, setList] = useState<FollowupItem[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  const fetchList = useCallback(async () => {
    setLoading(true)
    try {
      const res = await followupApi.getFollowups({
        page, page_size: pageSize,
        status: tab === 'pending' ? 1 : 2,
        followup_type: appliedType,
      })
      setList(res.list ?? [])
      setTotal(res.total ?? 0)
    } catch { /* 错误提示由拦截器统一处理 */ } finally { setLoading(false) }
  }, [page, pageSize, tab, appliedType])

  useEffect(() => { fetchList() }, [fetchList])

  const typeTag = (type: number) => (
    <span className={`fu-tag fu-tag--${TYPE_TAG_CLS[type] ?? 'plain'}`}>{FOLLOWUP_TYPE_MAP[type] ?? `类型 ${type}`}</span>
  )

  const memberColumn = {
    title: '服务对象', key: 'member',
    render: (_: unknown, row: FollowupItem) => (
      <div className="table-cell">
        <strong>{row.member_name || '-'} <span className="fu-row__sub">#{row.member_id}</span></strong>
        <span>{row.member_gender === 1 ? '男' : row.member_gender === 2 ? '女' : '性别未知'}{row.member_age != null ? ` · ${row.member_age} 岁` : ''}</span>
      </div>
    ),
  }

  const pendingColumns = [
    { title: '计划时间', key: 'plan_time', render: (_: unknown, row: FollowupItem) => planTime(row) },
    memberColumn,
    { title: '随访类型', key: 'type', render: (_: unknown, row: FollowupItem) => typeTag(row.followup_type) },
    { title: '任务说明', dataIndex: 'followup_name', key: 'followup_name', render: (value?: string | null) => value || '-' },
    {
      title: '操作', key: 'action', width: 110,
      render: (_: unknown, row: FollowupItem) => (
        <Button type="primary" size="small" onClick={() => navigate(`/followup/${row.id}/execute`, { state: { followup: row } })}>开始回访</Button>
      ),
    },
  ]

  const doneColumns = [
    {
      title: '完成时间', dataIndex: 'followup_time', key: 'followup_time',
      render: (value?: number | null) => value ? dayjs(value * 1000).format('YYYY-MM-DD HH:mm') : '-',
    },
    memberColumn,
    { title: '随访类型', key: 'type', render: (_: unknown, row: FollowupItem) => typeTag(row.followup_type) },
    { title: '任务说明', dataIndex: 'followup_name', key: 'followup_name', render: (value?: string | null) => value || '-' },
    {
      title: '操作', key: 'action', width: 110,
      render: (_: unknown, row: FollowupItem) => (
        <Button size="small" onClick={() => navigate(`/followup/${row.id}/execute`, { state: { followup: row } })}>查看记录</Button>
      ),
    },
  ]

  return (
    <div className="fu-page">
      <PageContainer title="我的随访" description="查看本机构随访任务，填写并保存随访问卷和回访结果">
        <Tabs
          activeKey={tab}
          onChange={(key) => { setTab(key as 'pending' | 'done'); setPage(1) }}
          items={[{ key: 'pending', label: '待回访' }, { key: 'done', label: '已回访' }]}
        />

        {tab === 'pending' && (
          <div className="fu-stats">
            <div className="fu-stat fu-stat--banner">
              <div>
                <div className="fu-stat__banner-title">发现患者健康指标异常？</div>
                <div className="fu-stat__banner-sub">创建健康预警回访后，系统将自动生成对应的随访子项</div>
              </div>
              <Button type="primary" onClick={() => navigate('/followup/create')}>创建健康预警回访</Button>
            </div>
          </div>
        )}

        <Card variant="borderless" className="filter-bar">
          <Select
            placeholder="全部类型" value={typeFilter} onChange={setTypeFilter}
            options={TYPE_OPTIONS} allowClear
          />
          <Button onClick={() => { setTypeFilter(undefined); setAppliedType(undefined); setPage(1) }}>重置</Button>
          <Button type="primary" onClick={() => { setAppliedType(typeFilter); setPage(1) }}>查询</Button>
        </Card>

        <Card variant="borderless" className="list-card table-fill">
          <Table<FollowupItem>
            rowKey="id" columns={tab === 'pending' ? pendingColumns : doneColumns}
            dataSource={list} loading={loading}
            pagination={{
              current: page, pageSize, total,
              onChange: (nextPage, nextPageSize) => { setPage(nextPage); setPageSize(nextPageSize) },
              showSizeChanger: true, showTotal: (value) => `共 ${value} 条`,
            }}
          />
        </Card>
      </PageContainer>
    </div>
  )
}
