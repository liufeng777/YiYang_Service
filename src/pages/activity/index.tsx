/** 健康活动列表：按活动真实字段展示，并聚合各承接机构的报名统计。 */
import { useCallback, useEffect, useState } from 'react'
import { Button, Card, Space, Table, Tag } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { useNavigate } from 'react-router-dom'
import PageContainer from '@/components/PageContainer'
import StatusTag from '@/components/StatusTag'
import { activityApi } from '@/api'
import type { ActivityItem } from '@/api/modules/activity'
import { formatActivityDate, getActivityStats } from './shared'

/** 活动类型：1社区活动 / 2康养旅游 / 3健康课堂 / 4健康活动 / 5其他 */
export const ActivityType = {
  1: '社区活动',
  2: '康养旅游',
  3: '健康课堂',
  4: '健康活动',
  5: '其他'
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

  const columns: ColumnsType<ActivityItem> = [
    {
      title: '活动名称 / 简介',
      key: 'title',
      fixed: 'left',
      render: (_, row) => (
        <div className="table-cell">
          <strong>{row.title}</strong>
          <span className="table-cell__span">{row.location || '-'}</span>
        </div>
      ),
    },
    {
      title: '活动时间 / 类型',
      key: 'time',
      render: (_, row) => (
        <div>
          <div style={{fontWeight: '500'}}>{`${formatActivityDate(row.start_date)} ~ ${formatActivityDate(row.end_date)}`}</div>
          <Tag style={{display: 'inline-block'}}>{row.activity_type != null ? ActivityType[row.activity_type as keyof typeof ActivityType] ?? '-' : '-'}</Tag>
        </div>
      )
    },
    {
      title: '报名情况 / 适合人群',
      key: 'registration',
      render: (_, row) => {
        const stats = getActivityStats(row)
        return (
          <div className="table-cell">
            <strong>{stats.registeredCount} / {stats.maxParticipants} 人</strong>
            <span className="table-cell__span">{row.target_crowd || '适用人群暂未填写'}</span>
          </div>
        )
      },
    },
    {
      title: '活动状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (value?: number) => (
        <StatusTag color={value === 1 ? 'blue' : value === 2 ? 'green' : 'gray'}>
          {value != null ? activityApi.ACTIVITY_STATUS_MAP[value] ?? `状态 ${value}` : '-'}
        </StatusTag>
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 230,
      fixed: 'right',
      render: (_, row) => (
        <Space wrap>
          <Button size="small" onClick={() => navigate(`/health-activity/${row.id}`)}>
            详情
          </Button>
          <Button size="small" onClick={() => navigate(`/health-activity/${row.id}/registrations`)}>
            报名名单
          </Button>
          <Button size="small" onClick={() => navigate(`/health-activity/${row.id}/check-in`)}>
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
            showTotal: (value) => `共 ${value} 条`,
          }}
        />
      </Card>
    </PageContainer>
  )
}
