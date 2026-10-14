/**
 * 机构管理 - 机构列表（设计稿：11.机构管理/机构列表.png）
 * 该模块接口尚未提供（协同工作台端机构主数据 API v0.1 未定义），页面暂以空状态占位，待后端补充后接入
 */
import { Card, Empty } from 'antd'
import PageContainer from '@/components/PageContainer'

export default function InstitutionList() {
  return (
    <PageContainer
      title="机构管理"
      description="平台管理员统一维护机构主数据、首个机构管理员及运营平台同步状态"
    >
      <Card variant="borderless" className="list-card table-fill">
        <Empty description="暂无数据" style={{ margin: '80px auto' }} />
      </Card>
    </PageContainer>
  )
}
