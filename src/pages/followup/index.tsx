/** 随访列表：全部筛选均由服务端执行，计划时间使用 UTC 秒。 */
import { useCallback, useEffect, useRef, useState } from 'react'
import { Button, Card, DatePicker, Select, Space, Table } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { PlusOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import type { Dayjs } from 'dayjs'
import PageContainer from '@/components/PageContainer'
import SensitiveText, { maskName, maskPhone } from '@/components/SensitiveText'
import { followupApi, memberApi } from '@/api'
import {
  FOLLOWUP_RESULT_MAP,
  FOLLOWUP_STATUS_MAP,
  FOLLOWUP_TYPE_MAP,
  type FollowupItem,
} from '@/api/modules/followup'
import type { MemberItem } from '@/api/modules/member'
import { followupSource, formatDateTime } from './utils'
import './index.less'

const STATUS_OPTIONS = Object.entries(FOLLOWUP_STATUS_MAP).map(([value, label]) => ({ value: Number(value), label }))
const TYPE_OPTIONS = Object.entries(FOLLOWUP_TYPE_MAP).map(([value, label]) => ({ value: Number(value), label }))
const TYPE_TONE: Record<number, string> = { 1: 'blue', 2: 'orange' }
const RESULT_TONE: Record<number, string> = { 1: 'green', 2: 'gray', 3: 'orange' }

type DateRange = [Dayjs, Dayjs] | null
interface MemberOption { value: number; label: string }
interface AppliedFilters {
  status?: number
  followup_type?: number
  member_id?: number
  start_time?: number
  end_time?: number
}

export default function FollowupList() {
  const navigate = useNavigate()
  const [statusFilter, setStatusFilter] = useState<number>()
  const [typeFilter, setTypeFilter] = useState<number>()
  const [memberFilter, setMemberFilter] = useState<MemberOption>()
  const [range, setRange] = useState<DateRange>(null)
  const [applied, setApplied] = useState<AppliedFilters>({})
  const [members, setMembers] = useState<MemberItem[]>([])
  const [memberLoading, setMemberLoading] = useState(false)
  const memberRequestRef = useRef(0)
  const [list, setList] = useState<FollowupItem[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  const loadMembers = useCallback(async (keyword = '') => {
    const requestId = ++memberRequestRef.current
    setMemberLoading(true)
    try {
      const res = await memberApi.getMemberList({ page: 1, page_size: 50, keyword: keyword || undefined })
      if (requestId === memberRequestRef.current) setMembers(res.list ?? [])
    } catch {
      // 错误提示由拦截器统一处理。
    } finally {
      if (requestId === memberRequestRef.current) setMemberLoading(false)
    }
  }, [])

  useEffect(() => { loadMembers() }, [loadMembers])

  const fetchList = useCallback(async () => {
    setLoading(true)
    try {
      const res = await followupApi.getFollowups({
        page,
        page_size: pageSize,
        ...applied,
      })
      setList(res.list ?? [])
      setTotal(res.total ?? 0)
    } catch {
      // 错误提示由拦截器统一处理。
    } finally {
      setLoading(false)
    }
  }, [page, pageSize, applied])

  useEffect(() => { fetchList() }, [fetchList])

  const applyFilters = () => {
    setApplied({
      status: statusFilter,
      followup_type: typeFilter,
      member_id: memberFilter?.value,
      start_time: range?.[0].startOf('day').unix(),
      end_time: range?.[1].endOf('day').unix(),
    })
    setPage(1)
  }

  const resetFilters = () => {
    setStatusFilter(undefined)
    setTypeFilter(undefined)
    setMemberFilter(undefined)
    setRange(null)
    setApplied({})
    setPage(1)
  }

  const columns: ColumnsType<FollowupItem> = [
    {
      title: '服务对象', key: 'member',
      render: (_, row) => (
        <div className="table-cell">
          <strong>
            <SensitiveText allowReveal={false} type="name" value={row.member_name} />
          </strong>
          <span className="table-cell__span">
            {Number(row.gender ?? row.member_gender) === 1 ? '男' : Number(row.gender ?? row.member_gender) === 2 ? '女' : '性别未知'}
            {Number(row.age ?? row.member_age) > 0 ? ` · ${Number(row.age ?? row.member_age)} 岁` : ''}
          </span>
        </div>
      ),
    },
    {
      title: '随访类型', key: 'followup_type',
      render: (_, row) => (
        <Space size={4} wrap>
          <span className={`status-tag status-tag--${TYPE_TONE[row.followup_type] ?? 'gray'}`}>
            {FOLLOWUP_TYPE_MAP[row.followup_type] ?? `类型 ${row.followup_type}`}
          </span>
          {row.followup_type === 2 && Number(row.warning_id) > 0 && (
            <Button type="link" size="small" onClick={() => navigate(`/warning/${row.warning_id}/handle`)}>预警详情</Button>
          )}
        </Space>
      ),
    },
    {
      title: '来源', key: 'source', ellipsis: true,
      render: (_, row) => row.source_name || followupSource(row.source_type, row.source_id),
    },
    {
      title: '负责人', dataIndex: 'staff_name', key: 'staff_name', width: 110,
      render: (value?: string | null) => value || '-',
    },
    // {
    //   title: '计划回访时间', key: 'plan_time', width: 150,
    //   render: (_, row) => formatDateTime(row.plan_time ?? row.next_followup_date),
    // },
    {
      title: '开始随访', dataIndex: 'start_time', key: 'start_time', width: 150,
      render: (value?: number | null) => formatDateTime(value),
    },
    {
      title: '上次随访', dataIndex: 'last_followup_time', key: 'last_followup_time', width: 150,
      render: (value?: number | null) => formatDateTime(value),
    },
    {
      title: '完成时间', key: 'finish_time', width: 150,
      render: (_, row) => formatDateTime(row.finish_time ?? row.followup_time),
    },
    {
      title: '随访结果', dataIndex: 'result', key: 'result', width: 110,
      render: (value?: number | null) => !Number(value) ? '-' : (
        <span className={`status-tag status-tag--${RESULT_TONE[Number(value)] ?? 'gray'}`}>
          {FOLLOWUP_RESULT_MAP[Number(value)] ?? `结果 ${value}`}
        </span>
      ),
    },
    {
      title: '状态', dataIndex: 'status', key: 'status', width: 100,
      render: (value: number) => (
        <span className={`status-tag status-tag--${value === 2 ? 'green' : 'orange'}`}>
          {FOLLOWUP_STATUS_MAP[value] ?? `状态 ${value}`}
        </span>
      ),
    },
    {
      title: '操作', key: 'action', width: 180,
      render: (_, row) => (
        <Space size={8}>
          <Button size="small" onClick={() => navigate(`/followup/${row.id}`)}>查看详情</Button>
          {row.status === 1 && (
            <Button size="small" onClick={() => navigate(`/followup/${row.id}/execute`)}>开始回访</Button>
          )}
        </Space>
      ),
    },
  ]

  return (
    <div className="fu-page">
      <PageContainer
        title="随访管理"
        description="管理本机构随访任务，支持新建、草稿保存、完成随访及历史记录查看"
        extra={<Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/followup/create')}>新建随访</Button>}
      >
        <Card variant="borderless" className="filter-bar fu-filter-bar">
          <Select
            placeholder="全部状态"
            value={statusFilter}
            onChange={setStatusFilter}
            options={STATUS_OPTIONS}
            allowClear
          />
          <Select
            className="fu-filter-bar__member"
            showSearch filterOption={false} labelInValue allowClear
            placeholder="全部服务对象"
            value={memberFilter}
            loading={memberLoading}
            onSearch={loadMembers}
            onChange={(value) => setMemberFilter(value as MemberOption | undefined)}
            options={members.map((member) => ({
              value: member.id,
              label: `${maskName(member.name)} · ${member.phone ? maskPhone(member.phone) : `ID ${member.id}`}`,
            }))}
          />
          <Select
            placeholder="全部类型" value={typeFilter} onChange={setTypeFilter}
            options={TYPE_OPTIONS} allowClear
          />
          <DatePicker.RangePicker
            value={range}
            onChange={(dates) => setRange(dates?.[0] && dates[1] ? [dates[0], dates[1]] : null)}
            placeholder={['计划开始日期', '计划结束日期']}
            allowClear
          />
          <Button onClick={resetFilters}>重置</Button>
          <Button type="primary" onClick={applyFilters}>查询</Button>
        </Card>

        <Card variant="borderless" className="list-card table-fill">
          <Table<FollowupItem>
            rowKey="id"
            columns={columns}
            dataSource={list}
            loading={loading}
            scroll={{ x: 1500 }}
            pagination={{
              current: page, pageSize, total,
              onChange: (nextPage, nextPageSize) => {
                setPage(nextPageSize !== pageSize ? 1 : nextPage)
                setPageSize(nextPageSize)
              },
              showSizeChanger: true,
              showTotal: (value) => `共 ${value} 条`,
            }}
          />
        </Card>
      </PageContainer>
    </div>
  )
}
