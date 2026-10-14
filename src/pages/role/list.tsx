/**
 * 角色管理 - 角色列表（设计稿：14.角色管理/角色列表.png）
 * 该模块接口尚未提供（API v0.1 未定义），页面暂以空状态占位，待后端补充后接入
 */
import { Card, Empty } from 'antd'
import PageContainer from '@/components/PageContainer'

export default function RoleList() {
  return (
    <PageContainer
      title="角色管理"
      description="角色由系统管理员统一配置，供全系统使用；首页待办与数据范围由系统规则自动生成。"
    >
      <Card variant="borderless" className="list-card table-fill">
        <Empty description="暂无数据" style={{ margin: '80px auto' }} />
      </Card>
    </PageContainer>
  )
}
