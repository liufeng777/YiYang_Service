/**
 * 健康活动 - 活动列表（设计稿：9.健康活动/活动列表.png）
 * 已对接 GET /api/v1/staff/activities（分页列表）
 * 操作：报名名单（/health-activity/:id/registrations）、现场签到（/health-activity/:id/check-in）
 */
import { useCallback, useEffect, useState } from 'react'
import { Button, Card, Table, Tag, Space } from 'antd'
import { useNavigate } from 'react-router-dom'
import PageContainer from '@/components/PageContainer'
import { activityApi } from '@/api'
import type { ActivityItem } from '@/api/modules/activity'
import { formatDateTime } from '@/utils'

/** Swagger 未定义活动状态枚举，展示原始状态值，避免前端猜测业务含义。 */
function formatActivityTime(value?: number) {
  return value == null ? '-' : formatDateTime(value * 1000, 'YYYY-MM-DD')
}

export default function ActivityList() {
  const navigate = useNavigate()
  const [list, setList] = useState<ActivityItem[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await activityApi.getActivities({ page, page_size: pageSize })
      setList(res.list ?? [])
      setTotal(res.total ?? 0)
    } catch {
      /* 拦截器已提示 */
    } finally {
      setLoading(false)
    }
  }, [page, pageSize])

  useEffect(() => {
    load()
  }, [load])

  const columns = [
    {
      title: '活动名称',
      key: 'title',
      render: (_: unknown, row: ActivityItem) => row.title ?? row.activity_name ?? '-',
    },
    {
      title: '活动时间',
      key: 'time',
      render: (_: unknown, row: ActivityItem) => (
        <span>
          {formatActivityTime(row.start_date)} ~ {formatActivityTime(row.end_date)}
        </span>
      ),
    },
    {
      title: '活动地点',
      key: 'location',
      render: (_: unknown, row: ActivityItem) => row.location ?? row.address ?? '-',
    },
    {
      title: '报名情况',
      key: 'quota',
      render: (_: unknown, row: ActivityItem) =>
        row.registered_count != null
          ? `${row.registered_count}${row.quota != null ? ` / ${row.quota}` : ''} 人`
          : '-',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (value?: number) => <Tag>{value != null ? `状态 ${value}` : '-'}</Tag>,
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      render: (_: unknown, row: ActivityItem) => (
        <Space>
          <Button
            size="small"
            
            onClick={() => navigate(`/health-activity/${row.id}/registrations`)}
          >
            报名名单
          </Button>
          <Button
            size="small"
            onClick={() => navigate(`/health-activity/${row.id}/check-in`)}
          >
            现场签到
          </Button>
        </Space>
      ),
    },
  ]

  return (
    <PageContainer title="健康活动" description="查看本机构承接活动、报名与现场执行情况">
      <Card variant="borderless" className="list-card table-fill">
        <Table<ActivityItem>
          rowKey="id"
          columns={columns}
          dataSource={list}
          loading={loading}
          size="small"
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
  )
}
