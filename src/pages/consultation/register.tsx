/**
 * 咨询管理 - 来电登记（设计稿：来电登记.png）
 * 登记来电人与实际服务对象；保存后系统自动关联档案或生成线索
 * TODO: 电话咨询登记接口 API v0.1 未定义，待后端补充（见 api/modules/consult.ts TODO）
 */
import { useState } from 'react'
import { Button, Input, message } from 'antd'
import { useNavigate } from 'react-router-dom'
import PageContainer from '@/components/PageContainer'
import { mockConsultRegister } from './mock'
import './index.less'

export default function ConsultationRegister() {
  const navigate = useNavigate()
  const c = mockConsultRegister
  const [callerPhone, setCallerPhone] = useState(c.defaultCallerPhone)
  const [callerName, setCallerName] = useState(c.defaultCallerName)
  const [source, setSource] = useState(c.defaultSource)
  const [targetType, setTargetType] = useState(c.defaultTargetType)
  const [targetName, setTargetName] = useState(c.defaultTargetName)
  const [targetPhone, setTargetPhone] = useState(c.defaultTargetPhone)
  const [topic, setTopic] = useState(c.defaultTopic)
  const [content, setContent] = useState(c.defaultContent)
  const [result, setResult] = useState(c.defaultResult)
  const [nextFollowup, setNextFollowup] = useState(c.defaultNextFollowup)

  const onSave = () => {
    if (!callerPhone.trim()) {
      message.warning('请填写来电号码')
      return
    }
    if (!content.trim()) {
      message.warning('请填写咨询内容')
      return
    }
    // TODO: 电话咨询登记接口待后端补充；保存后系统自动关联档案或生成线索
    message.success('咨询记录已保存，已创建“待跟进”线索并带入登记信息')
    navigate('/consultation')
  }

  return (
    <div className="cs-page">
      <PageContainer
        title="登记电话咨询"
        description="登记来电人与实际服务对象；保存后系统自动关联档案或生成线索"
      >
        <div className="cs-register">
          {/* 左：登记表单 */}
          <div className="cs-card">
            <div className="cs-section__title">1. 来电信息</div>
            <div className="cs-register__grid">
              <div className="cs-field">
                <div className="cs-field__label">
                  来电号码 <span className="cs-required">*</span>
                </div>
                <Input value={callerPhone} onChange={(e) => setCallerPhone(e.target.value)} />
              </div>
              <div className="cs-field">
                <div className="cs-field__label">来电人姓名</div>
                <Input value={callerName} onChange={(e) => setCallerName(e.target.value)} />
              </div>
            </div>
            <div className="cs-field">
              <div className="cs-field__label">
                咨询来源 <span className="cs-required">*</span>
              </div>
              <div className="cs-pills">
                {c.sources.map((s) => (
                  <span
                    key={s}
                    className={s === source ? 'cs-pill cs-pill--active' : 'cs-pill'}
                    onClick={() => setSource(s)}
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>

            <div className="cs-section__title">2. 实际服务对象</div>
            <div className="cs-field">
              <div className="cs-pills">
                {c.targetTypes.map((t) => (
                  <span
                    key={t}
                    className={t === targetType ? 'cs-pill cs-pill--active' : 'cs-pill'}
                    onClick={() => setTargetType(t)}
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>
            {targetType !== '来电人本人' && targetType !== '尚未明确' && (
              <div className="cs-register__grid">
                <div className="cs-field">
                  <div className="cs-field__label">服务对象姓名</div>
                  <Input value={targetName} onChange={(e) => setTargetName(e.target.value)} />
                </div>
                <div className="cs-field">
                  <div className="cs-field__label">服务对象手机号</div>
                  <Input value={targetPhone} onChange={(e) => setTargetPhone(e.target.value)} />
                </div>
              </div>
            )}

            <div className="cs-section__title">3. 咨询内容</div>
            <div className="cs-field">
              <div className="cs-pills">
                {c.topics.map((t) => (
                  <span
                    key={t}
                    className={t === topic ? 'cs-pill cs-pill--active' : 'cs-pill'}
                    onClick={() => setTopic(t)}
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>
            <div className="cs-field">
              <Input.TextArea rows={3} value={content} onChange={(e) => setContent(e.target.value)} />
            </div>
            <div className="cs-field">
              <div className="cs-field__label">咨询处理结果</div>
              <Input.TextArea rows={2} value={result} onChange={(e) => setResult(e.target.value)} />
            </div>
            <div className="cs-field">
              <div className="cs-field__label">下次跟进时间</div>
              <Input
                className="cs-register__next"
                value={nextFollowup}
                onChange={(e) => setNextFollowup(e.target.value)}
              />
            </div>
            <div className="cs-register__submit">
              <Button type="primary" onClick={onSave}>
                保存咨询记录
              </Button>
            </div>
          </div>

          {/* 右：身份校验与处理预览 */}
          <div className="cs-register__rail">
            <div className="cs-card">
              <div className="cs-card__header">
                <span className="cs-card__title">身份校验与处理预览</span>
              </div>
              <div className="cs-field__label">来电账号</div>
              <div className="cs-register__kv-value">{c.preview.callerAccount}</div>
              <div className="cs-field__label cs-register__kv-gap">实际服务对象</div>
              <div className="cs-register__kv-value">{c.preview.target}</div>
              <div className="cs-preview">
                <div className="cs-preview__title">预计处理</div>
                <ol className="cs-preview__list">
                  {c.preview.steps.map((s) => (
                    <li key={s}>{s}</li>
                  ))}
                </ol>
              </div>
              <div className="cs-field__label cs-register__kv-gap">自动建立的线索带入</div>
              <div className="cs-register__lead-fields">
                {c.leadFields.map((f) => (
                  <div key={f}>{f}</div>
                ))}
              </div>
              <div className="cs-boundary">
                <div className="cs-boundary__title">业务边界</div>
                {c.boundary.split('\n\n').map((p) => (
                  <p key={p.slice(0, 8)}>{p}</p>
                ))}
              </div>
            </div>
          </div>
        </div>
      </PageContainer>
    </div>
  )
}
