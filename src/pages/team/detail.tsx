/**
 * 团队管理 - 团队详情（设计稿：13.团队管理/成员与在管患者.png）
 * 该模块接口尚未提供（API v0.1 未定义），页面暂以空状态占位，待后端补充后接入
 */
import { Card, Empty } from 'antd'
import PageContainer from '@/components/PageContainer'

export default function TeamDetail() {
  return (
    <PageContainer title="团队详情" description="查看团队成员，以及每位成员作为责任人关联的患者和待办">
      <Card variant="borderless" className="list-card table-fill">
        <Empty description="暂无数据" style={{ margin: '80px auto' }} />
      </Card>
    </PageContainer>
  )
}
