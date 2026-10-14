/**
 * 人员管理 - 资质审核队列（设计稿：12.人员管理/审核队列.png）
 * 资质与服务授权统一审核接口 API v0.1 未定义，页面暂以空状态占位，待后端补充后接入
 */
import { Card, Empty } from 'antd'
import PageContainer from '@/components/PageContainer'

export default function StaffAudit() {
  return (
    <PageContainer
      title="专业人员审核"
      description="统一审核人员执业资质和服务项目授权，审核结论决定派单资格"
    >
      <Card variant="borderless" className="list-card table-fill">
        <Empty description="暂无数据" style={{ margin: '80px auto' }} />
      </Card>
    </PageContainer>
  )
}
