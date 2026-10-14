/**
 * AI长者健康力测评 - 列表（设计稿：W-HEALTH-P1-01）
 * 该模块接口尚未提供（API v0.1 未定义），页面暂以空状态占位，待后端补充后接入
 */
import { Card, Empty } from 'antd'
import PageContainer from '@/components/PageContainer'

export default function AssessList() {
  return (
    <PageContainer
      title="AI长者健康力测评"
      description="统一管理C端自主测评与专业人员录入，AI分析后由专业人员确认"
    >
      <Card variant="borderless" className="list-card table-fill">
        <Empty description="暂无数据" style={{ margin: '80px auto' }} />
      </Card>
    </PageContainer>
  )
}
