/**
 * 预警管理 - 关闭健康预警（设计稿：关闭与回写.png）
 * 核对处置结果、随访完成情况与档案回写后关闭本次预警
 * TODO: 关闭前检查清单与关闭接口 API v0.1 未定义，待后端补充
 */
import { useState } from 'react'
import { Button, Input, Radio, message } from 'antd'
import { CheckOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import PageContainer from '@/components/PageContainer'
import { mockWarningClose } from './mock'
import './index.less'

export default function WarningClose() {
  const navigate = useNavigate()
  const c = mockWarningClose
  const [conclusion, setConclusion] = useState(c.defaultConclusion)
  const [reason, setReason] = useState(c.reasons[0])

  const onClose = () => {
    if (!conclusion.trim()) {
      message.warning('请填写关闭结论')
      return
    }
    // TODO: 预警关闭接口待后端补充
    message.success('预警已关闭，处置结论已回写健康档案')
    navigate('/warning')
  }

  return (
    <div className="wn-page">
      <PageContainer
        title="关闭健康预警"
        description="核对处置结果、随访完成情况与档案回写后关闭本次预警"
        extra={<span className="wn-tag wn-tag--green">待关闭</span>}
      >
        <div className="wn-close">
          {/* 左：处置结果 */}
          <div className="wn-card">
            <div className="wn-card__header">
              <span className="wn-card__title">处置结果</span>
            </div>
            <div className="wn-timeline">
              {c.timeline.map((t) => (
                <div key={t.time} className="wn-timeline__item">
                  <span className="wn-timeline__time">{t.time}</span>
                  <span className="wn-timeline__text">{t.text}</span>
                </div>
              ))}
            </div>

            <div className="wn-field">
              <div className="wn-field__label">
                关闭结论 <span className="wn-required">*</span>
              </div>
              <Input.TextArea
                rows={3}
                value={conclusion}
                onChange={(e) => setConclusion(e.target.value)}
              />
            </div>

            <div className="wn-field wn-field--last">
              <div className="wn-field__label">
                关闭原因 <span className="wn-required">*</span>
              </div>
              <Radio.Group value={reason} onChange={(e) => setReason(e.target.value)}>
                {c.reasons.map((r) => (
                  <Radio key={r} value={r}>
                    {r}
                  </Radio>
                ))}
              </Radio.Group>
            </div>
          </div>

          {/* 右：关闭前检查 */}
          <div className="wn-card">
            <div className="wn-card__header">
              <span className="wn-card__title">关闭前检查</span>
            </div>
            {c.checks.map((item) => (
              <div key={item} className="wn-close__check">
                <CheckOutlined className="wn-close__check-icon" />
                {item}
              </div>
            ))}
            <div className="wn-note-box">
              <div className="wn-note-box__title">关闭后系统动作</div>
              {c.afterActions.map((s) => (
                <div key={s} className="wn-note-box__line">
                  {s}
                </div>
              ))}
            </div>
            <div className="wn-close__actions">
              <Button onClick={() => message.success('已暂存')}>暂存</Button>
              <Button type="primary" onClick={onClose}>
                确认关闭预警
              </Button>
            </div>
          </div>
        </div>

        <div className="wn-close__footer">{c.footer}</div>
      </PageContainer>
    </div>
  )
}
