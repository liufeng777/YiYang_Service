/**
 * 健康活动 - 活动列表（设计稿：9.健康活动/活动列表.png）
 * 该模块接口尚未提供（API v0.1 未定义），页面暂以空状态占位，待后端补充后接入
 */
import { Card, Empty } from 'antd'
import PageContainer from '@/components/PageContainer'

export default function ActivityList() {
  return (
    <PageContainer title="健康活动" description="查看本机构承接活动、报名与现场执行情况">
      <Card variant="borderless" className="list-card table-fill">
        <Empty description="暂无数据" style={{ margin: '80px auto' }} />
      </Card>
    </PageContainer>
  )
}
