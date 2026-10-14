/**
 * 团队管理 - 待分配患者（设计稿：13.团队管理/待分配患者.png）
 * 该模块接口尚未提供（API v0.1 未定义），页面暂以空状态占位，待后端补充后接入
 */
import { Card, Empty } from 'antd'
import PageContainer from '@/components/PageContainer'

export default function TeamUnassigned() {
  return (
    <PageContainer
      title="待分配患者"
      description="处理自动建档、批量导入或线索转化后尚未归属管理团队的服务对象"
    >
      <Card variant="borderless" className="list-card table-fill">
        <Empty description="暂无数据" style={{ margin: '80px auto' }} />
      </Card>
    </PageContainer>
  )
}
