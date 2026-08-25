/**
 * 健康档案 - 独立层级变化处理（设计稿：分层变化处理.png）
 * 医生对层级变化的判断与处理；确认后按选项触发系统动作
 * TODO: 层级变化处理接口 API v0.1 未定义，当前为本地 mock
 */
import { useState } from 'react'
import { Button, Input, message } from 'antd'
import { ArrowRightOutlined } from '@ant-design/icons'
import { useNavigate, useParams } from 'react-router-dom'
import PageContainer from '@/components/PageContainer'
import { mockRiskChange } from './mock'
import './index.less'

export default function RiskChangeHandle() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [choice, setChoice] = useState('adjust')
  const [opinion, setOpinion] = useState(mockRiskChange.opinion)
  const r = mockRiskChange
  void id

  const onSubmit = () => {
    // TODO: 接入后端后调用层级变化处理接口
    message.success('已提交处理，系统动作将按所选方式执行')
    navigate(`/health-record/${id ?? 1}`)
  }

  return (
    <div className="hr-page">
      <PageContainer
        title="独立层级变化处理"
        description="仅当层级变化没有关联打开中的健康异常预警时，才生成独立医生待办；有关联时合并到原预警处置单"
      >
        {/* 层级变化摘要 */}
        <div className="hr-card hr-change__summary">
          <div className="hr-change__flow">
            <span className="hr-change__level hr-change__level--from">
              {r.from.color}（{r.from.date}）
            </span>
            <ArrowRightOutlined className="hr-change__arrow" />
            <span className="hr-change__level hr-change__level--to">
              {r.to.color}（{r.to.date}）
            </span>
          </div>
          <div className="hr-change__meta">
            <div>变化原因：{r.reason}</div>
            <div className="hr-change__meta-sub">触发来源：{r.source}</div>
          </div>
        </div>

        <div className="hr-change__panels">
          {/* 医生判断 */}
          <div className="hr-card">
            <div className="hr-card__header">
              <span className="hr-card__title">医生判断</span>
            </div>
            <div className="hr-change__options">
              {r.options.map((o) => (
                <div
                  key={o.key}
                  className={
                    choice === o.key ? 'hr-change-option hr-change-option--active' : 'hr-change-option'
                  }
                  onClick={() => setChoice(o.key)}
                >
                  <span className="hr-change-option__radio" />
                  <div>
                    <div className="hr-change-option__label">{o.label}</div>
                    <div className="hr-change-option__desc">{o.desc}</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="hr-create__field-label hr-change__opinion-label">
              医生意见 <span className="hr-required">*</span>
            </div>
            <Input.TextArea rows={3} value={opinion} onChange={(e) => setOpinion(e.target.value)} />
          </div>

          {/* 提交后的系统动作 */}
          <div className="hr-card hr-change__side">
            <div className="hr-card__header">
              <span className="hr-card__title">提交后的系统动作</span>
            </div>
            <ol className="hr-change__actions">
              {r.actions.map((a, i) => (
                <li key={i}>{a}</li>
              ))}
            </ol>
            <div className="hr-change__footer">
              <Button onClick={() => navigate(-1)}>暂不调整</Button>
              <Button type="primary" disabled={!opinion.trim()} onClick={onSubmit}>
                确认处理
              </Button>
            </div>
          </div>
        </div>

        <div className="hr-footnote hr-footnote--green">{r.principle}</div>
      </PageContainer>
    </div>
  )
}
