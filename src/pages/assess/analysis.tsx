/**
 * AI长者健康力测评 - AI分析与专业确认（设计稿：W-HEALTH-P1-04）
 * 六维结果 + AI 初步分析（待确认）+ 专业人员确认表单
 * TODO: 接入后端后对齐 API §4.6 评估完成/确认 POST /api/v1/staff/assessments/:id/confirm
 */
import { Button, Input, message } from 'antd'
import { useNavigate, useParams } from 'react-router-dom'
import PageContainer from '@/components/PageContainer'
import { DimensionCards } from './dim-cards'
import { mockAiAnalysis, mockProConfirm } from './mock'
import './index.less'

export default function AssessAnalysis() {
  const { id } = useParams()
  const navigate = useNavigate()
  const ai = mockAiAnalysis
  const pro = mockProConfirm

  return (
    <PageContainer
      title="AI健康力分析与专业确认"
      description="六维结果分别呈现；AI辅助解释与专业人员意见明确区分"
    >
      {/* 健康力概览 */}
      <div className="as-card">
        <div className="as-card__header">
          <span className="as-card__title">健康力概览</span>
          <span className="as-row__sub">六维结果分别呈现，不合并为单一总分</span>
        </div>
        <DimensionCards />
      </div>

      <div className="as-analysis">
        {/* 左：AI 初步分析 */}
        <div className="as-card as-analysis__ai">
          <div className="as-card__header">
            <span className="as-card__title">AI 初步分析</span>
            <span className="as-tag as-tag--pending">AI生成 · 待专业确认</span>
          </div>
          {ai.sections.map((s) => (
            <div key={s.title} className="as-ai-section">
              <div className="as-ai-section__title">{s.title}</div>
              <div className="as-ai-section__content">{s.content}</div>
            </div>
          ))}
          <div className="as-footnote as-footnote--yellow">{ai.disclaimer}</div>
        </div>

        {/* 右：专业人员确认 */}
        <div className="as-card as-analysis__pro">
          <div className="as-card__header">
            <span className="as-card__title">专业人员确认</span>
            <span className="as-row__sub">确认人：{pro.doctor}</span>
          </div>
          {pro.fields.map((f) => (
            <div key={f.label} className="as-pro-field">
              <div className="as-pro-field__label">{f.label}</div>
              <Input.TextArea rows={2} defaultValue={f.value} />
            </div>
          ))}
        </div>
      </div>

      {/* 底部操作 */}
      <div className="as-footer-actions">
        <Button onClick={() => navigate(`/assessment/${id ?? 'A20260819001'}/entry`)}>返回修改</Button>
        <Button onClick={() => message.success('草稿已保存（mock）')}>保存草稿</Button>
        <Button
          type="primary"
          onClick={() => {
            message.success('已确认完成，结果归入健康档案（mock）')
            navigate(`/assessment/${id ?? 'A20260819001'}`)
          }}
        >
          确认完成
        </Button>
      </div>
    </PageContainer>
  )
}
