/**
 * 异常处理 - 异常列表（设计稿：8.预警与异常处理/异常列表.png）
 * 履约异常上报与处置闭环接口 API v0.1 未定义，页面暂以空状态占位，待后端补充后接入
 */
import { Card, Empty } from 'antd'
import PageContainer from '@/components/PageContainer'

export default function ExceptionList() {
  return (
    <PageContainer
      title="异常处理"
      description="服务人员助手端上报分为健康异常与工单异常，分别进入对应处置流程"
    >
      <Card variant="borderless" className="list-card table-fill">
        <Empty description="暂无数据" style={{ margin: '80px auto' }} />
      </Card>
    </PageContainer>
  )
}
