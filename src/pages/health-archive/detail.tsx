/** 以 member_id 为上下文的健康档案维护工作台。 */
import { useEffect, useState } from 'react'
import { Button, Card, Descriptions, Tabs, Tag } from 'antd'
import {
  ArrowLeftOutlined, CalendarOutlined, PhoneOutlined, UserOutlined,
} from '@ant-design/icons'
import { useNavigate, useParams } from 'react-router-dom'
import PageContainer from '@/components/PageContainer'
import { healthArchiveApi } from '@/api'
import type { ArchiveEnumOptions, HealthArchiveOverview } from '@/api/modules/health-archive'
import { BasicPanel, RecordsPanel } from './archive-forms'
import ChronicPanel from './chronic-panel'
import MetricsPanel from './metrics-panel'
import HealthPlansPanel from './plans-panel'
import './index.less'

export default function HealthArchiveDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const memberId = id ?? ''
  const [overview, setOverview] = useState<HealthArchiveOverview>()
  const [overviewLoading, setOverviewLoading] = useState(false)
  const [enumOptions, setEnumOptions] = useState<ArchiveEnumOptions>({})

  useEffect(() => {
    setOverviewLoading(true)
    healthArchiveApi.getHealthArchiveOverview(memberId)
      .then(setOverview)
      .catch(() => setOverview(undefined))
      .finally(() => setOverviewLoading(false))
  }, [memberId])

  useEffect(() => {
    healthArchiveApi.getHealthArchiveEnumOptions().then(setEnumOptions).catch(() => undefined)
  }, [])

  const member = overview?.member

  return (
    <PageContainer
      title="健康档案详情"
      extra={<Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/health-record')}>返回档案列表</Button>}
    >
      <div className="archive-detail">
        <Card
          className="archive-member-summary" loading={overviewLoading}
          title={<><UserOutlined /> 会员信息</>}
        >
          <Descriptions column={{ xs: 2, sm: 4 }}>
            <Descriptions.Item label="年龄">{member?.age != null ? `${member.age} 岁` : '-'}</Descriptions.Item>
            <Descriptions.Item label="性别">
              {member?.gender === 1 ? <Tag color="blue">男</Tag> : member?.gender === 2 ? <Tag color="magenta">女</Tag> : '-'}
            </Descriptions.Item>
            <Descriptions.Item label={<><CalendarOutlined /> 出生日期</>}>{member?.birthday || '-'}</Descriptions.Item>
            <Descriptions.Item label={<><PhoneOutlined /> 联系电话</>}>{member?.phone || '-'}</Descriptions.Item>
          </Descriptions>
        </Card>
        <Tabs
          type='card'
          tabPosition="left"
          className="archive-primary-tabs"
          items={[
            { key: 'basic', label: '主档案与生活习惯', children: <BasicPanel memberId={memberId} overview={overview} loading={overviewLoading} enumOptions={enumOptions} /> },
            { key: 'records', label: '病史记录', children: <RecordsPanel memberId={memberId} enumOptions={enumOptions} /> },
            { key: 'chronic', label: '慢病专病', children: <ChronicPanel memberId={memberId} /> },
            { key: 'metrics', label: '健康指标', children: <MetricsPanel memberId={memberId} /> },
            { key: 'plans', label: '健康方案', children: <HealthPlansPanel memberId={memberId} /> },
          ]}
        />
      </div>
    </PageContainer>
  )
}
