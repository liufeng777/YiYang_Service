/**
 * 人员管理 - 执业资质（设计稿：12.人员管理/执业资质.png）
 * 资质集中管理接口 API v0.1 未定义（仅提供按人员查询资质），页面暂以空状态占位，待后端补充后接入
 */
import { Card, Empty } from 'antd'
import PageContainer from '@/components/PageContainer'

export default function StaffCredentials() {
  return (
    <PageContainer
      title="执业资质"
      description="集中维护人员证照、审核状态和到期预警，派单时按服务项目自动校验"
    >
      <Card variant="borderless" className="list-card table-fill">
        <Empty description="暂无数据" style={{ margin: '80px auto' }} />
      </Card>
    </PageContainer>
  )
}
