/** 健康评估详情：展示 GET /assessments/{id} 的实际响应。 */
import { useEffect, useState } from 'react'
import { Alert, Button, Card, Space, Spin } from 'antd'
import { ArrowLeftOutlined } from '@ant-design/icons'
import { useNavigate, useParams } from 'react-router-dom'
import PageContainer from '@/components/PageContainer'
import { memberApi } from '@/api'
import { asObject, JsonView, ObjectDescriptions, type ApiObject } from './data-view'
import './index.less'

export default function AssessDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [detail, setDetail] = useState<ApiObject>({})
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!id) return
    setLoading(true)
    memberApi.getAssessmentDetail(id)
      .then((res) => setDetail(asObject(res)))
      .catch(() => undefined)
      .finally(() => setLoading(false))
  }, [id])

  return (
    <PageContainer
      title={`健康力测评详情 #${id ?? '-'}`}
      description="展示评估接口返回的基础信息、答案与结果"
      extra={
        <Space wrap>
          <Button onClick={() => navigate(`/assessment/${id}/entry`)}>查看原始数据</Button>
          <Button type="primary" onClick={() => navigate(`/assessment/${id}/analysis`)}>专业确认</Button>
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/assessment')}>返回列表</Button>
        </Space>
      }
    >
      <Spin spinning={loading}>
        <Card variant="borderless" className="as-card" title="评估信息">
          <ObjectDescriptions value={detail} />
        </Card>
        <Card variant="borderless" className="as-card" title="评估结果">
          <Alert
            type="info"
            showIcon
            title="Swagger 未定义六维评分、AI 结论或专业意见的响应模型"
            description="以下为通用 result / analysis 字段内容；字段不存在时显示空态，不使用演示分析结果。"
          />
          <JsonView value={detail.result ?? detail.analysis} />
        </Card>
      </Spin>
    </PageContainer>
  )
}
