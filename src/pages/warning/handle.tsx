/**
 * 预警管理 - 健康预警医生处置（设计稿：医生处置.png）
 * 医生一次完成健康风险判断与派生层级变化确认，避免重复预警和重复处置
 * TODO: 医生处置单接口 API v0.1 未定义，待后端补充；处置后可调 warningApi.handleWarning（API §6.2）
 */
import { useState } from 'react'
import { Button, Checkbox, Input, Radio, message } from 'antd'
import { useNavigate } from 'react-router-dom'
import PageContainer from '@/components/PageContainer'
import { mockWarningHandle } from './mock'
import './index.less'

export default function WarningHandle() {
  const navigate = useNavigate()
  const h = mockWarningHandle
  const [risk, setRisk] = useState(h.defaultRisk)
  const [opinion, setOpinion] = useState(h.defaultOpinion)
  const [actions, setActions] = useState<string[]>(h.actions)

  const onSubmit = () => {
    if (!opinion.trim()) {
      message.warning('请填写医生处置意见')
      return
    }
    // TODO: 医生处置单提交接口待后端补充；等级调整走 warningApi.handleWarning（§6.2）
    message.success('医生处置已提交，待复测结果回传后可关闭预警')
    navigate('/warning')
  }

  return (
    <div className="wn-page">
      <PageContainer
        title="健康预警医生处置"
        description="医生一次完成健康风险判断与派生层级变化确认，避免重复预警和重复处置"
        extra={<span className="wn-tag wn-tag--orange">待医生处理</span>}
      >
        <div className="wn-handle">
          {/* 左：预警与核实信息 */}
          <div className="wn-card">
            <div className="wn-card__header">
              <span className="wn-card__title">预警与核实信息</span>
            </div>
            <div className="wn-handle__metric">
              <span className="wn-handle__metric-name">{h.metric}</span>
              <span className="wn-handle__metric-value">{h.value}</span>
              <div className="wn-handle__metric-meta">{h.meta}</div>
            </div>

            <div className="wn-field__label">健管师核实</div>
            <div className="wn-handle__verify">{h.verification}</div>

            <div className="wn-field">
              <div className="wn-field__label">
                医生风险判断 <span className="wn-required">*</span>
              </div>
              <Radio.Group
                value={risk}
                onChange={(e) => setRisk(e.target.value)}
                className="wn-pill-radio"
              >
                {h.riskOptions.map((o) => (
                  <Radio.Button key={o} value={o}>
                    {o}
                  </Radio.Button>
                ))}
              </Radio.Group>
            </div>

            <div className="wn-field">
              <div className="wn-field__label">
                医生处置意见 <span className="wn-required">*</span>
              </div>
              <Input.TextArea rows={3} value={opinion} onChange={(e) => setOpinion(e.target.value)} />
            </div>

            <div className="wn-field wn-field--last">
              <div className="wn-field__label">后续动作</div>
              <Checkbox.Group
                value={actions}
                onChange={(v) => setActions(v as string[])}
                className="wn-checks"
                options={h.actions}
              />
            </div>
          </div>

          {/* 右：关闭条件 */}
          <div className="wn-card">
            <div className="wn-card__header">
              <span className="wn-card__title">关闭条件</span>
            </div>
            <div className="wn-handle__close-tip">
              预警不是医生提交意见后立即关闭。以下条件满足后才可关闭：
            </div>
            <ol className="wn-handle__conditions">
              {h.closeConditions.map((c) => (
                <li key={c}>{c}</li>
              ))}
            </ol>
            <div className="wn-note-box">
              <div className="wn-note-box__title">当前状态</div>
              {h.currentState.map((s) => (
                <div key={s} className="wn-note-box__line">
                  {s}
                </div>
              ))}
            </div>
            <div className="wn-handle__submit">
              <Button type="primary" onClick={onSubmit}>
                提交医生处置
              </Button>
            </div>
          </div>
        </div>
      </PageContainer>
    </div>
  )
}
