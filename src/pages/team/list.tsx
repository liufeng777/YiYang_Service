/**
 * 团队管理 - 团队列表（设计稿：13.团队管理/团队列表.png）
 * 该模块接口尚未提供（API v0.1 未定义），页面暂以空状态占位，待后端补充后接入
 */
import { Card, Empty } from 'antd'
import PageContainer from '@/components/PageContainer'

export default function TeamList() {
  return (
    <PageContainer
      title="团队管理"
      description="机构管理员建立本机构健康管理团队，维护医生、护士和健康管理师成员池"
    >
      <Card variant="borderless" className="list-card table-fill">
        <Empty description="暂无数据" style={{ margin: '80px auto' }} />
      </Card>
    </PageContainer>
  )
}
