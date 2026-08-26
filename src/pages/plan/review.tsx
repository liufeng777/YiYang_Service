/**
 * 健康管理方案 - 医生审核（设计稿：医生审核.png）
 * 责任医生审核医学合理性、风险提示与管理目标一致性；通过后生效并推送C端，未通过退回健管师修改
 * TODO: 审核操作接入 planApi.confirmPlan（§5.2）；退回接口 API v0.1 未定义，已标注 TODO
 */
import { useState } from 'react'
import { Button, Input, message } from 'antd'
import { ArrowLeftOutlined } from '@ant-design/icons'
import { useNavigate, useParams } from 'react-router-dom'
import PageContainer from '@/components/PageContainer'
import { mockPlanAudit, mockPlanMember } from './mock'
import './index.less'

export default function PlanReview() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [opinion, setOpinion] = useState(mockPlanAudit.opinion)
  const a = mockPlanAudit
  const m = mockPlanMember

  const onApprove = () => {
    // TODO: 接入后端后调用 planApi.confirmPlan（§5.2）
    message.success('审核通过，方案已生效并推送C端')
    navigate(`/plan/${id ?? m.id}/execution`)
  }

  const onReject = () => {
    if (!opinion.trim()) {
      message.warning('请填写审核意见后再退回')
      return
    }
    // TODO: 退回接口 API v0.1 未定义，待后端补充
    message.success('已退回健管师修改')
    navigate(`/plan/${id ?? m.id}/returned`)
  }

  return (
    <div className="plan-page">
      <PageContainer
        title={
          <span className="plan-detail__title">
            <ArrowLeftOutlined className="plan-detail__back" onClick={() => navigate('/plan')} />
            审核健康管理方案
          </span>
        }
        description="审核医学合理性、风险提示与管理目标一致性"
        extra={<span className="plan-tag plan-tag--review">待医生审核</span>}
      >
        {/* 会员条 */}
        <div className="plan-member">
          <div className="plan-member__main">
            <div>
              <div className="plan-member__name">{m.name}</div>
              <div className="plan-member__meta">
                {m.gender} · {m.age}岁 · {m.diseases.join(' / ')}
              </div>
            </div>
          </div>
          <div className="plan-member__side plan-member__side--wide">
            <span>方案周期 {m.periodStart} 至 {m.periodEnd}</span>
            <span>
              提交人 {a.submitter} · {a.submittedAt}
            </span>
            <span>版本 {a.version}</span>
          </div>
        </div>

        <div className="plan-audit">
          {/* 左：审核目录 */}
          <div className="plan-card plan-audit__nav">
            <div className="plan-card__header">
              <span className="plan-card__title">审核目录</span>
            </div>
            {a.catalog.map((c) => (
              <div
                key={c.key}
                className={
                  c.state === 'warn' ? 'plan-nav-item plan-nav-item--warn' : 'plan-nav-item'
                }
              >
                <span>{c.name}</span>
                <span className={c.state === 'warn' ? 'plan-text--warn' : 'plan-audit__pass'}>
                  {c.state === 'warn' ? '需关注' : '通过'}
                </span>
              </div>
            ))}
            <div className="plan-audit__summary">
              <div className="plan-field__label">审核摘要</div>
              {a.summary.map((s) => (
                <div key={s.label} className="plan-rail__row">
                  <span className="plan-rail__label">{s.label}</span>
                  <span>{s.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 中：重点审核项 */}
          <div className="plan-card plan-audit__main">
            <div className="plan-card__header">
              <span className="plan-card__title">重点审核项</span>
              <span className="plan-card__sub">系统标记2项需要医生确认</span>
            </div>
            {a.items.map((item) => (
              <div key={item.key} className={`plan-audit-item plan-audit-item--${item.tone}`}>
                <div className="plan-audit-item__head">
                  <span className="plan-audit-item__title">{item.title}</span>
                  {item.tag && <span className="plan-audit__pass">{item.tag}</span>}
                </div>
                <div className="plan-audit-item__content">{item.content}</div>
                {item.opinion && (
                  <div className="plan-audit-item__foot">
                    <span className="plan-audit-item__opinion">{item.opinion}</span>
                    {item.action === '确认通过' ? (
                      <Button
                        type="primary"
                        size="small"
                        onClick={() => message.success(`已确认通过：${item.title}`)}
                      >
                        确认通过
                      </Button>
                    ) : (
                      <Button
                        size="small"
                        className="plan-audit-item__modify"
                        onClick={() => message.info(`已标记修改建议：${item.title}`)}
                      >
                        建议修改
                      </Button>
                    )}
                  </div>
                )}
              </div>
            ))}
            <div className="plan-field">
              <div className="plan-field__label">审核意见</div>
              <Input.TextArea rows={3} value={opinion} onChange={(e) => setOpinion(e.target.value)} />
            </div>
          </div>

          {/* 右：方案来源与变更记录 */}
          <div className="plan-detail__rail">
            <div className="plan-card">
              <div className="plan-card__header">
                <span className="plan-card__title">方案来源</span>
              </div>
              <div className="plan-ai-note plan-ai-note--block">
                {a.source.map((s, i) => (
                  <div key={s} className={i === 0 ? 'plan-audit__source-first' : undefined}>
                    {i === 0 ? `✦ ${s}` : s}
                  </div>
                ))}
              </div>
              <div className="plan-field__label plan-rail__gap">变更记录</div>
              {a.changes.map((c) => (
                <div key={c.time} className="plan-rail__row">
                  <span className="plan-rail__label">{c.time}</span>
                  <span>{c.text}</span>
                </div>
              ))}
              <div className="plan-data-note plan-data-note--blue">{a.effectNote}</div>
            </div>
          </div>
        </div>

        <div className="plan-detail__actions">
          <Button danger onClick={onReject}>
            退回修改
          </Button>
          <Button type="primary" onClick={onApprove}>
            审核通过并生效
          </Button>
        </div>
      </PageContainer>
    </div>
  )
}
