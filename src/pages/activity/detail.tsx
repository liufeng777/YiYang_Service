/** 健康活动详情：展示活动、富文本介绍及各承接机构执行信息。 */
import { useCallback, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { ArrowLeftOutlined } from '@ant-design/icons'
import { Button, Card, Descriptions, Empty, Space, Spin, Table } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { useNavigate, useParams } from 'react-router-dom'
import { activityApi } from '@/api'
import type { ActivityInstitution, ActivityItem } from '@/api/modules/activity'
import PageContainer from '@/components/PageContainer'
import StatusTag from '@/components/StatusTag'
import { formatActivityDate, formatActivityDateTime, getActivityStats } from './shared';
import { ActivityType } from './index'
import './index.less'

interface RichTextNode {
  type?: string
  text?: string
  content?: RichTextNode[]
  marks?: Array<{ type?: string }>
}

/** 将接口中的 ProseMirror JSON 转为受控 React 节点，不注入 HTML。 */
function renderRichTextNode(node: RichTextNode, key: string): ReactNode {
  const children = Array.isArray(node.content)
    ? node.content.map((child, index) => renderRichTextNode(child, `${key}-${index}`))
    : null

  switch (node.type) {
    case 'text': {
      const text = node.text ?? ''
      return node.marks?.some((mark) => mark.type === 'bold')
        ? <strong key={key}>{text}</strong>
        : <span key={key}>{text}</span>
    }
    case 'hardBreak':
      return <br key={key} />
    case 'paragraph':
      return <p key={key}>{children}</p>
    case 'bulletList':
      return <ul key={key}>{children}</ul>
    case 'orderedList':
      return <ol key={key}>{children}</ol>
    case 'listItem':
      return <li key={key}>{children}</li>
    case 'doc':
      return <span key={key}>{children}</span>
    default:
      return <span key={key}>{children}</span>
  }
}

function ActivityDescription({ value }: { value?: string }) {
  if (!value) return <div className="ac-rich-text">暂无活动详情</div>

  try {
    const parsed: unknown = JSON.parse(value)
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      return <div className="ac-rich-text">{renderRichTextNode(parsed as RichTextNode, 'root')}</div>
    }
  } catch {
    // 非 JSON 的历史数据按普通文本展示。
  }

  return <div className="ac-rich-text ac-rich-text__plain">{value}</div>
}

const institutionColumns: ColumnsType<ActivityInstitution> = [
  {
    title: '承接机构',
    dataIndex: 'institution_name',
    key: 'institution_name',
    render: (value?: string) => value || '-',
  },
  {
    title: '联系人',
    dataIndex: 'contact_name',
    key: 'contact_name',
    width: 110,
    render: (value?: string) => value || '-',
  },
  {
    title: '联系电话',
    dataIndex: 'contact_phone',
    key: 'contact_phone',
    width: 140,
    render: (value?: string) => value || '-',
  },
  {
    title: '承接时间',
    key: 'time',
    width: 280,
    render: (_, row) => `${formatActivityDateTime(row.start_time)} ~ ${formatActivityDateTime(row.end_time)}`,
  },
  {
    title: '报名 / 名额',
    key: 'quota',
    width: 110,
    render: (_, row) => `${row.registered_count ?? 0} / ${row.max_participants ?? 0}`,
  },
  {
    title: '剩余名额',
    dataIndex: 'remaining_quota',
    key: 'remaining_quota',
    width: 100,
    render: (value?: number) => value ?? 0,
  }
]

export default function ActivityDetail() {
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const [activity, setActivity] = useState<ActivityItem | null>(null)
  const [loading, setLoading] = useState(false)

  const load = useCallback(async () => {
    if (!id) return
    setLoading(true)
    try {
      setActivity(await activityApi.getActivityDetail(id))
    } catch {
      /* 拦截器已提示 */
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    load()
  }, [load])

  const stats = activity ? getActivityStats(activity) : null

  return (
    <PageContainer
      title={activity ? activity.title : '活动详情'}
      description="查看活动介绍、名额与承接机构执行情况"
      extra={
        <Space wrap>
          <Button onClick={() => navigate(`/health-activity/${id}/registrations`)}>报名名单</Button>
          <Button onClick={() => navigate(`/health-activity/${id}/check-in`)}>现场签到</Button>
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/health-activity')}>
            返回列表
          </Button>
        </Space>
      }
    >
      <Spin spinning={loading}>
        {activity && stats ? (
          <div className="ac-detail">
            <Card variant="borderless" className="ac-card">
              <div className="ac-detail__hero">
                {activity.cover_url ? (
                  <img className="ac-detail__cover" src={activity.cover_url} alt={activity.title} />
                ) : (
                  <div className="ac-detail__cover ac-detail__cover--empty">暂无封面</div>
                )}
                <div className="ac-detail__content">
                  <h3 className="ac-detail__title">{activity.title}</h3>
                  <Descriptions
                    column={2}
                    size="small"
                    items={[
                      { key: 'type', label: '活动类型', children: <StatusTag color="gray">{activity.activity_type != null ? ActivityType[activity.activity_type as keyof typeof ActivityType] ?? '-' : '-'}</StatusTag> },
                      { key: 'status', label: '活动状态', children: <StatusTag color={activity.status === 1 ? 'blue' : activity.status === 2 ? 'green' : 'gray'}>{activity.status != null ? activityApi.ACTIVITY_STATUS_MAP[activity.status] ?? `状态 ${activity.status}` : '-'}</StatusTag> },
                      { key: 'time', label: '活动时间', children: `${formatActivityDate(activity.start_date)} ~ ${formatActivityDate(activity.end_date)}`},
                      { key: 'location', label: '活动简介', children: activity.location},
                      { key: 'crowd', label: '适用人群', children: activity.target_crowd || '-'},
                      { key: 'max', label: '活动名额', children: `${stats.maxParticipants} 人` },
                      { key: 'registered', label: '已报名人数', children: `${stats.registeredCount} 人` },
                      { key: 'remaining', label: '剩余名额', children: `${stats.remainingQuota} 个` },
                      { key: 'created', label: '创建时间', children: formatActivityDateTime(activity.created_at) },
                    ]}
                  />
                </div>
              </div>
            </Card>

            <Card variant="borderless" className="ac-card" title="活动详情">
              <ActivityDescription value={activity.description} />
            </Card>

            {!!activity.institutions?.length && (
              <Card variant="borderless" className="ac-card" title="承接机构">
                <Table<ActivityInstitution>
                  rowKey="id"
                  columns={institutionColumns}
                  dataSource={activity.institutions}
                  pagination={false}
                  size="small"
                  scroll={{ x: 950 }}
                />
              </Card>
            )}
          </div>
        ) : !loading ? (
          <Card variant="borderless" className="ac-card"><Empty description="未找到活动信息" /></Card>
        ) : null}
      </Spin>
    </PageContainer>
  )
}
