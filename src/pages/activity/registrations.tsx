/**
 * 健康活动 - 报名名单（设计稿：9.健康活动/报名名单.png）
 * 该模块接口尚未提供（API v0.1 未定义），页面暂以空状态占位，待后端补充后接入
 */
import { Card, Empty } from 'antd'
import PageContainer from '@/components/PageContainer'

export default function ActivityRegistrations() {
  return (
    <PageContainer title="报名名单" description="机构主动联系报名人，确认参与人、席位与需求">
      <Card variant="borderless" className="list-card table-fill">
        <Empty description="暂无数据" style={{ margin: '80px auto' }} />
      </Card>
    </PageContainer>
  )
}
