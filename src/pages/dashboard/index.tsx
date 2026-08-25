/**
 * 运营首页 - 数据总览
 * 展示经营指标（经营指标 28/36 Bold）
 */
import { useEffect, useState } from 'react'
import { Card, Col, Row, Skeleton } from 'antd'
import PageContainer from '@/components/PageContainer'
import type { OverviewData } from '@/api/modules/dashboard'
import './index.less'

const metricConfig = [
  { key: 'todayOrderCount', label: '今日订单数', prefix: '', suffix: '单' },
  { key: 'todayOrderAmount', label: '今日订单金额', prefix: '¥', suffix: '' },
  { key: 'todayRefundCount', label: '今日退款笔数', prefix: '', suffix: '笔' },
  { key: 'totalInstitution', label: '合作机构数', prefix: '', suffix: '家' },
]

export default function Dashboard() {
  const [data, setData] = useState<OverviewData | null>(null)

  useEffect(() => {
    // TODO: 后端就绪后替换为真实接口，例如：
    // getOverview().then(setData)
    setData({
      todayOrderCount: 128,
      todayOrderAmount: 35680,
      todayRefundCount: 6,
      totalInstitution: 58,
    })
  }, [])

  return (
    <PageContainer title="运营首页" description="核心经营数据一览">
      <Row gutter={16}>
        {metricConfig.map((item) => (
          <Col key={item.key} xs={24} sm={12} lg={6}>
            <Card className="metric-card" bordered={false}>
              {data ? (
                <>
                  <div className="metric-card__label">{item.label}</div>
                  <div className="metric-card__value">
                    {item.prefix}
                    {data[item.key as keyof OverviewData]}
                    <span className="metric-card__suffix">{item.suffix}</span>
                  </div>
                </>
              ) : (
                <Skeleton active paragraph={{ rows: 1 }} />
              )}
            </Card>
          </Col>
        ))}
      </Row>
      <Row gutter={16} style={{ marginTop: 16 }}>
        <Col xs={24} lg={14}>
          <Card title="订单趋势" bordered={false}>
            <div className="metric-card__placeholder">图表区域（预留，可接入 ECharts 等）</div>
          </Card>
        </Col>
        <Col xs={24} lg={10}>
          <Card title="待办提醒" bordered={false}>
            <div className="metric-card__placeholder">待办事项列表（预留）</div>
          </Card>
        </Col>
      </Row>
    </PageContainer>
  )
}
