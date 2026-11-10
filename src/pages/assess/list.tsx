/**
 * 健康力测评列表
 * Swagger 按会员查询评估，因此先选择会员，再调用会员评估列表接口。
 */
import { useCallback, useEffect, useState } from 'react'
import { Button, Card, Input, Select, Space, Table, Tag } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import PageContainer from '@/components/PageContainer'
import { memberApi } from '@/api'
import type { AssessmentItem, MemberItem } from '@/api/modules/member'
import { formatDateTime } from '@/utils'
import { displayValue } from './data-view'
import './index.less'

export default function AssessList() {
  const navigate = useNavigate()
  const [keyword, setKeyword] = useState('')
  const [members, setMembers] = useState<MemberItem[]>([])
  const [memberLoading, setMemberLoading] = useState(false)
  const [memberId, setMemberId] = useState<number>()
  const [list, setList] = useState<AssessmentItem[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  const searchMembers = useCallback(async (value = '') => {
    setMemberLoading(true)
    try {
      const res = await memberApi.getMemberList({ page: 1, page_size: 50, keyword: value || undefined })
      setMembers(res.list ?? [])
    } catch {
      // 拦截器统一提示
    } finally {
      setMemberLoading(false)
    }
  }, [])

  useEffect(() => { searchMembers() }, [searchMembers])

  const loadAssessments = useCallback(async () => {
    if (memberId == null) {
      setList([])
      setTotal(0)
      return
    }
    setLoading(true)
    try {
      const res = await memberApi.getAssessments(memberId, { page, page_size: pageSize })
      setList(res.list ?? [])
      setTotal(res.total ?? 0)
    } catch {
      // 拦截器统一提示
    } finally {
      setLoading(false)
    }
  }, [memberId, page, pageSize])

  useEffect(() => { loadAssessments() }, [loadAssessments])

  const columns = [
    { title: '评估 ID', dataIndex: 'id', key: 'id', width: 110 },
    { title: '评估类型', dataIndex: 'type', key: 'type', render: (value?: string) => value || '-' },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (value: unknown) => value != null ? <Tag>{displayValue(value)}</Tag> : '-',
    },
    {
      title: '创建时间',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (value?: number) => value ? formatDateTime(value * 1000) : '-',
    },
    {
      title: '操作',
      key: 'action',
      width: 250,
      render: (_: unknown, row: AssessmentItem) => (
        <Space wrap>
          <Button size="small" onClick={() => navigate(`/assessment/${row.id}`)}>详情</Button>
          <Button size="small" onClick={() => navigate(`/assessment/${row.id}/entry`)}>原始数据</Button>
          <Button size="small" type="primary" onClick={() => navigate(`/assessment/${row.id}/analysis`)}>确认</Button>
        </Space>
      ),
    },
  ]

  return (
    <PageContainer
      title="健康力测评"
      description="按会员查询、发起和确认健康评估"
      extra={
        <Button
          type="primary"
          icon={<PlusOutlined />}
          disabled={memberId == null}
          onClick={() => navigate('/assessment/create', { state: { memberId } })}
        >
          新建测评
        </Button>
      }
    >
      <Card variant="borderless" className="filter-bar">
        <Input
          placeholder="输入姓名 / 手机号查询会员"
          value={keyword}
          onChange={(event) => setKeyword(event.target.value.trim())}
          onPressEnter={() => searchMembers(keyword)}
          allowClear
        />
        <Select
          showSearch
          optionFilterProp="label"
          loading={memberLoading}
          placeholder="请选择测评会员"
          value={memberId}
          onChange={(value) => { setMemberId(value); setPage(1) }}
          options={members.map((member) => ({ value: member.id, label: `${member.name} · ${member.phone || member.id}` }))}
        />
        <Button onClick={() => { setKeyword(''); setMemberId(undefined); setPage(1); searchMembers() }}>重置</Button>
        <Button type="primary" onClick={() => searchMembers(keyword)}>查询</Button>
      </Card>

      <Card variant="borderless" className="list-card table-fill">
        <Table<AssessmentItem>
          rowKey="id"
          columns={columns}
          dataSource={list}
          loading={loading}
          locale={{ emptyText: memberId == null ? '请先选择会员' : '该会员暂无评估记录' }}
          pagination={{
            current: page,
            pageSize,
            total,
            showSizeChanger: true,
            showTotal: (value) => `共 ${value} 条`,
            onChange: (nextPage, nextPageSize) => { setPage(nextPage); setPageSize(nextPageSize) },
          }}
        />
      </Card>
    </PageContainer>
  )
}
