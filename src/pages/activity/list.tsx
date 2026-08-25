/**
 * 活动管理 - 活动列表（预留）
 */
import { Card } from 'antd'
import PageContainer from '@/components/PageContainer'

export default function ActivityList() {
  return (
    <PageContainer title="健康活动" description="管理健康活动">
      <Card bordered={false}>活动列表表格（预留，使用 activityApi.getActivityList）</Card>
    </PageContainer>
  )
}
