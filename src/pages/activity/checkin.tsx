/**
 * 健康活动 - 现场签到（设计稿：9.健康活动/现场签到.png）
 * 该模块接口尚未提供（API v0.1 未定义），页面暂以空状态占位，待后端补充后接入
 */
import { Card, Empty } from 'antd'
import PageContainer from '@/components/PageContainer'

export default function ActivityCheckin() {
  return (
    <PageContainer title="现场签到" description="按报名名单或手机号完成签到，临时到场人员可补登记">
      <Card variant="borderless" className="list-card table-fill">
        <Empty description="暂无数据" style={{ margin: '80px auto' }} />
      </Card>
    </PageContainer>
  )
}
