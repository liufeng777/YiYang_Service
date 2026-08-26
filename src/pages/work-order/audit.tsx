/**
 * 服务工单 - 医生审核（设计稿：医生审核.png）
 * 审核服务适用性、患者风险、医嘱依据与上门实施条件
 * TODO: 服务订单医生审核接口 API v0.1 未定义，待后端补充（见 api/modules/work-order.ts）
 */
import { useState } from 'react'
import { Button, Input, message } from 'antd'
import { ArrowLeftOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import PageContainer from '@/components/PageContainer'
import { mockWoAudit } from './mock'
import './index.less'

export default function WorkOrderAudit() {
  const navigate = useNavigate()
  const [opinion, setOpinion] = useState(mockWoAudit.opinion)
  const a = mockWoAudit
  const m = a.member

  const onApprove = () => {
    // TODO: 审核通过接口待后端补充
    message.success('审核通过，工单进入待派单')
    navigate(`/work-order/${a.woNo}/audit-result`)
  }

  const onReject = (text: string) => {
    if (!opinion.trim()) {
      message.warning('请填写审核意见')
      return
    }
    // TODO: 审核不通过 / 退回补充接口待后端补充
    message.success(text)
    navigate('/work-order')
  }

  return (
    <div className="wo-page">
      <PageContainer
        title={
          <span className="wo-detail__title">
            <ArrowLeftOutlined className="wo-detail__back" onClick={() => navigate('/work-order')} />
            审核服务订单
          </span>
        }
        description="审核服务适用性、患者风险、医嘱依据与上门实施条件"
        extra={<span className="wo-tag wo-tag--blue">待医生审核</span>}
      >
        {/* 会员条 */}
        <div className="wo-member">
          <div className="wo-member__main">
            <div>
              <div className="wo-member__name">{m.name}</div>
              <div className="wo-member__meta">
                {m.gender} · {m.age}岁 · {m.diseases.join(' / ')}
              </div>
            </div>
          </div>
          <div className="wo-member__side">
            <span>
              服务项目 {a.service} · 预约 {a.appointment}
            </span>
            <span>
              订单 {a.orderNo} · {a.orderSource}
            </span>
            <span>待医生审核</span>
          </div>
        </div>

        <div className="wo-audit">
          {/* 左：审核要点 */}
          <div className="wo-card wo-audit__nav">
            <div className="wo-card__header">
              <span className="wo-card__title">审核要点</span>
            </div>
            {a.catalog.map((c) => (
              <div
                key={c.key}
                className={c.state === 'warn' ? 'wo-nav-item wo-nav-item--warn' : 'wo-nav-item'}
              >
                <span>{c.name}</span>
                <span className={c.state === 'warn' ? 'wo-text--warn' : 'wo-audit__pass'}>
                  {c.state === 'warn' ? '需关注' : '通过'}
                </span>
              </div>
            ))}
            <div className="wo-audit__summary">
              <div className="wo-field__label">审核摘要</div>
              {a.summary.map((s) => (
                <div key={s.label} className="wo-rail__row">
                  <span className="wo-rail__label">{s.label}</span>
                  <span>{s.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 中：订单审核项 */}
          <div className="wo-card wo-audit__main">
            <div className="wo-card__header">
              <span className="wo-card__title">订单审核项</span>
              <span className="wo-card__sub">系统已完成基础校验，以下内容需医生确认</span>
            </div>
            {a.items.map((item) => (
              <div key={item.key} className={`wo-audit-item wo-audit-item--${item.tone}`}>
                <div className="wo-audit-item__head">
                  <span className="wo-audit-item__title">{item.title}</span>
                  {item.tag && <span className="wo-audit__pass">{item.tag}</span>}
                </div>
                <div className="wo-audit-item__content">{item.content}</div>
                {item.action && (
                  <div className="wo-audit-item__foot">
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
                        className="wo-audit-item__modify"
                        onClick={() => message.info(`已标记修改建议：${item.title}`)}
                      >
                        建议修改
                      </Button>
                    )}
                  </div>
                )}
              </div>
            ))}
            <div className="wo-field">
              <div className="wo-field__label">审核意见</div>
              <Input.TextArea rows={3} value={opinion} onChange={(e) => setOpinion(e.target.value)} />
            </div>
          </div>

          {/* 右：订单来源与审核记录 */}
          <div className="wo-audit__rail">
            <div className="wo-card">
              <div className="wo-card__header">
                <span className="wo-card__title">订单来源</span>
              </div>
              <div className="wo-audit__source">
                {a.source.map((s) => (
                  <div key={s.label} className="wo-rail__row">
                    <span className="wo-rail__label">{s.label}</span>
                    <span>{s.value}</span>
                  </div>
                ))}
              </div>
              <div className="wo-field__label wo-rail__gap">审核记录</div>
              {a.records.map((r) => (
                <div key={r.time + r.text} className="wo-rail__row">
                  <span className="wo-rail__label">{r.time}</span>
                  <span>{r.text}</span>
                </div>
              ))}
              <div className="wo-note wo-note--blue">{a.effectNote}</div>
            </div>
          </div>
        </div>

        <div className="wo-audit__actions">
          <Button danger onClick={() => onReject('已记录审核不通过原因，本次订单已结束')}>
            审核不通过
          </Button>
          <Button danger onClick={() => onReject('已退回补充，工单保持未派单')}>
            退回补充
          </Button>
          <Button type="primary" onClick={onApprove}>
            审核通过
          </Button>
        </div>
      </PageContainer>
    </div>
  )
}
