/** 健康评估专业确认：调用 POST /assessments/{id}/confirm。 */
import { useEffect, useState } from 'react'
import { Alert, App, Button, Card, Input, Space, Spin } from 'antd'
import { ArrowLeftOutlined } from '@ant-design/icons'
import { useNavigate, useParams } from 'react-router-dom'
import PageContainer from '@/components/PageContainer'
import { memberApi } from '@/api'
import { asObject, JsonView, type ApiObject } from './data-view'
import './index.less'

export default function AssessAnalysis() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { message } = App.useApp()
  const [detail, setDetail] = useState<ApiObject>({})
  const [confirmation, setConfirmation] = useState('{}')
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!id) return
    setLoading(true)
    memberApi.getAssessmentDetail(id)
      .then((res) => setDetail(asObject(res)))
      .catch(() => undefined)
      .finally(() => setLoading(false))
  }, [id])

  const confirm = async () => {
    if (!id) return
    let body: ApiObject
    try {
      const parsed: unknown = JSON.parse(confirmation)
      if (parsed == null || typeof parsed !== 'object' || Array.isArray(parsed)) throw new Error('object required')
      body = parsed as ApiObject
    } catch {
      message.error('确认结果必须是 JSON 对象')
      return
    }
    setSubmitting(true)
    try {
      await memberApi.confirmAssessment(id, body)
      message.success('评估已确认')
      navigate(`/assessment/${id}`)
    } catch {
      // 请求失败时停留当前页
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <PageContainer
      title={`健康评估专业确认 #${id ?? '-'}`}
      description="核对评估结果并调用评估确认接口"
      extra={<Button icon={<ArrowLeftOutlined />} onClick={() => navigate(`/assessment/${id}`)}>返回详情</Button>}
    >
      <Spin spinning={loading}>
        <Card variant="borderless" className="as-card" title="评估结果与分析数据">
          <Alert
            type="info"
            showIcon
            title="AI 六维分析结构未在 Swagger 中定义"
            description="本页仅展示接口实际返回的 result / analysis 数据，不生成模拟评分或医学结论。"
          />
          <JsonView value={detail.result ?? detail.analysis} />
        </Card>
        <Card variant="borderless" className="as-card" title="确认结果">
          <Alert
            type="warning"
            showIcon
            title="确认请求体为通用 object"
            description="可输入后端约定的确认字段；不需要附加字段时保持 {}。评估 ID 由 API 模块一并提交。"
          />
          <Input.TextArea
            className="as-confirmation-input"
            rows={8}
            value={confirmation}
            onChange={(event) => setConfirmation(event.target.value)}
            spellCheck={false}
          />
          <Space>
            <Button onClick={() => navigate(`/assessment/${id}/entry`)}>查看原始数据</Button>
            <Button type="primary" loading={submitting} onClick={confirm}>确认完成</Button>
          </Space>
        </Card>
      </Spin>
    </PageContainer>
  )
}
