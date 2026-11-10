/** 以 member_id 为上下文的健康档案维护工作台。 */
import { Button, Tabs } from 'antd'
import { ArrowLeftOutlined } from '@ant-design/icons'
import { useNavigate, useParams } from 'react-router-dom'
import PageContainer from '@/components/PageContainer'
import { BasicPanel, RecordsPanel } from './archive-forms'
import ChronicPanel from './chronic-panel'
import MetricsPanel from './metrics-panel'
import HealthPlansPanel from './plans-panel'
import './index.less'

export default function HealthArchiveDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const memberId = id ?? ''

  return (
    <PageContainer
      title={`健康档案详情`}
      extra={<Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/health-record')}>返回档案列表</Button>}
    >
      <div className="archive-detail">
        <Tabs
          items={[
            { key: 'basic', label: '主档案与生活习惯', children: <BasicPanel memberId={memberId} /> },
            { key: 'records', label: '病史记录', children: <RecordsPanel memberId={memberId} /> },
            { key: 'chronic', label: '慢病专病', children: <ChronicPanel memberId={memberId} /> },
            { key: 'metrics', label: '健康指标', children: <MetricsPanel memberId={memberId} /> },
            { key: 'plans', label: '目标与方案', children: <HealthPlansPanel memberId={memberId} /> },
          ]}
        />
      </div>
    </PageContainer>
  )
}
