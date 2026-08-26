/**
 * 健康活动 - 联系确认（设计稿：联系确认.png）
 * 确认实际参与人并记录活动需求；保存后系统自动校验身份
 * TODO: 联系确认保存接口 API v0.1 未定义，待后端补充
 */
import { useState } from 'react'
import { Button, Input, message } from 'antd'
import { useNavigate, useParams } from 'react-router-dom'
import PageContainer from '@/components/PageContainer'
import { mockContactConfirm } from './mock'
import './index.less'

export default function ActivityContact() {
  const { id } = useParams()
  const navigate = useNavigate()
  const c = mockContactConfirm
  const [participantType, setParticipantType] = useState(c.defaultType)
  const [name, setName] = useState(c.defaultName)
  const [phone, setPhone] = useState(c.defaultPhone)
  const [result, setResult] = useState(c.defaultResult)
  const [needs, setNeeds] = useState<string[]>(c.defaultNeeds)
  const [record, setRecord] = useState(c.defaultRecord)
  const [nextContact, setNextContact] = useState(c.defaultNextContact)

  const toggleNeed = (n: string) =>
    setNeeds((list) => (list.includes(n) ? list.filter((x) => x !== n) : [...list, n]))

  const onSave = () => {
    if (!name.trim() || !phone.trim()) {
      message.warning('请填写参与人姓名与手机号')
      return
    }
    // TODO: 联系确认保存接口待后端补充；保存后系统自动校验身份并判断是否建线索
    message.success('已保存并完成身份校验：实名信息已关联，线索由系统自动判断')
    navigate(`/health-activity/${id ?? 'AC01'}/registrations`)
  }

  return (
    <div className="ac-page">
      <PageContainer
        title="联系确认"
        description="确认实际参与人并记录活动需求；保存后系统自动校验身份"
      >
        <div className="ac-contact">
          {/* 左：表单 */}
          <div className="ac-card">
            <div className="ac-field__label">报名账号</div>
            <div className="ac-contact__account">
              {c.applicant}　{c.phone}　{c.accountType}
            </div>

            <div className="ac-field">
              <div className="ac-field__label">
                实际参与人 <span className="ac-required">*</span>
              </div>
              <div className="ac-pills">
                {c.participantTypes.map((t) => (
                  <span
                    key={t}
                    className={t === participantType ? 'ac-pill ac-pill--active' : 'ac-pill'}
                    onClick={() => setParticipantType(t)}
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>

            <div className="ac-contact__grid">
              <div className="ac-field">
                <div className="ac-field__label">
                  参与人姓名 <span className="ac-required">*</span>
                </div>
                <Input value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div className="ac-field">
                <div className="ac-field__label">
                  参与人手机号 <span className="ac-required">*</span>
                </div>
                <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
              </div>
            </div>

            <div className="ac-field">
              <div className="ac-field__label">
                联系结果 <span className="ac-required">*</span>
              </div>
              <div className="ac-pills">
                {c.results.map((r) => (
                  <span
                    key={r}
                    className={r === result ? 'ac-pill ac-pill--active' : 'ac-pill'}
                    onClick={() => setResult(r)}
                  >
                    {r}
                  </span>
                ))}
              </div>
            </div>

            <div className="ac-field">
              <div className="ac-field__label">用户关注或服务需求</div>
              <div className="ac-pills">
                {c.needs.map((n) => (
                  <span
                    key={n}
                    className={needs.includes(n) ? 'ac-pill ac-pill--active' : 'ac-pill'}
                    onClick={() => toggleNeed(n)}
                  >
                    {n}
                  </span>
                ))}
              </div>
            </div>

            <div className="ac-field">
              <div className="ac-field__label">联系记录</div>
              <Input.TextArea rows={3} value={record} onChange={(e) => setRecord(e.target.value)} />
            </div>

            <div className="ac-field">
              <div className="ac-field__label">下次联系时间（需要继续跟进时）</div>
              <Input
                className="ac-contact__next"
                value={nextContact}
                onChange={(e) => setNextContact(e.target.value)}
              />
            </div>

            <div className="ac-contact__submit">
              <Button type="primary" onClick={onSave}>
                保存并校验身份
              </Button>
            </div>
          </div>

          {/* 右：保存后的系统处理 */}
          <div className="ac-card ac-contact__rail">
            <div className="ac-card__header">
              <span className="ac-card__title">保存后的系统处理</span>
            </div>
            {c.systemSteps.map((s, i) => (
              <div key={s.title} className="ac-step">
                <span className="ac-step__no">{i + 1}</span>
                <div>
                  <div className="ac-step__title">{s.title}</div>
                  <div className="ac-step__desc">{s.desc}</div>
                </div>
              </div>
            ))}
            <div className="ac-note-blue">
              <div className="ac-note-blue__title">防重复规则</div>
              {c.antiDuplicate.split('\n\n').map((p) => (
                <p key={p.slice(0, 8)}>{p}</p>
              ))}
            </div>
          </div>
        </div>
      </PageContainer>
    </div>
  )
}
