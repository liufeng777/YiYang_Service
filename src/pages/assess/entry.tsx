/** 评估原始数据只读视图；Swagger 未提供答案更新接口。 */
import { useEffect, useState } from 'react'
import { Alert, Button, Card, Space, Spin } from 'antd'
import { ArrowLeftOutlined } from '@ant-design/icons'
import { useNavigate, useParams } from 'react-router-dom'
import PageContainer from '@/components/PageContainer'
import { memberApi } from '@/api'
import { asObject, JsonView, type ApiObject } from './data-view'
import './index.less'

export default function AssessEntry() {
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
      title={`评估原始数据 #${id ?? '-'}`}
      description="查看评估详情中的 answers / answer / questions 字段"
      extra={
        <Space>
          <Button onClick={() => navigate(`/assessment/${id}/analysis`)}>前往确认</Button>
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(`/assessment/${id}`)}>返回详情</Button>
        </Space>
      }
    >
      <Spin spinning={loading}>
        <Card variant="borderless" className="as-card">
          <Alert
            type="warning"
            showIcon
            title="当前接口只支持查看，不支持逐题编辑、自动保存或完成检查"
            description="Swagger 未定义评估更新、草稿和题目结构接口，因此本页不保留这些模拟操作。"
          />
          <JsonView value={detail.answers ?? detail.answer ?? detail.questions ?? detail} />
        </Card>
      </Spin>
    </PageContainer>
  )
}
