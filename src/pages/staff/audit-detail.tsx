/**
 * 人员管理 - 专业人员统一审核（设计稿：2.服务授权/资质与服务授权统一审核.png）
 * 一次核对执业资质和服务授权，提交统一审核结论
 * TODO: 统一审核结论接口 API v0.1 未单列（§7 仅有资质状态更新 PUT /staff/credentials/:id），待后端补充
 */
import { useState } from 'react'
import { Button, Input, message } from 'antd'
import { CheckCircleFilled } from '@ant-design/icons'
import { useNavigate, useParams } from 'react-router-dom'
import PageContainer from '@/components/PageContainer'
import { mockAuditDetail as d } from './mock'
import './index.less'

type AuditResult = 'approve' | 'supplement' | 'reject'

const RESULT_OPTIONS: { value: AuditResult; label: string; tone: string }[] = [
  { value: 'approve', label: '审核通过', tone: 'green' },
  { value: 'supplement', label: '退回补充', tone: 'orange' },
  { value: 'reject', label: '审核不通过', tone: 'red' },
]

export default function StaffAuditDetail() {
  const navigate = useNavigate()
  const { id } = useParams()
  const [result, setResult] = useState<AuditResult>('approve')
  const [opinion, setOpinion] = useState(d.defaultOpinion)

  const onSubmit = (r: AuditResult) => {
    // TODO: 待后端补充统一审核接口；提交后写入审核记录并回写派单资格
    if (r === 'approve') {
      message.success(`审核通过（${id}）：证照与授权已生效，人员派单资格=可派单（演示）`)
    } else if (r === 'supplement') {
      message.success('已退回补充，待人员重新上传材料（演示）')
    } else {
      message.success('已提交审核不通过结论（演示）')
    }
    navigate('/staff/audit')
  }

  return (
    <div className="staff-page">
      <PageContainer
        title="专业人员统一审核"
        description="一次核对执业资质和服务授权，提交统一审核结论"
        extra={<Button onClick={() => navigate('/staff/audit')}>返回审核队列</Button>}
      >
        {/* 人员头卡 */}
        <div className="staff-card staff-profile">
          <div className="staff-profile__main">
            <div className="staff-profile__avatar">{d.name[0]}</div>
            <div>
              <div className="staff-profile__name">{d.name}</div>
              <div className="staff-profile__meta">{d.roleOrg}</div>
            </div>
          </div>
          <div className="staff-profile__side">
            <span className="staff-tag staff-tag--orange">{d.status}</span>
            <div className="staff-profile__cell">
              <div className="staff-profile__cell-label">提交时间</div>
              <div className="staff-profile__cell-value">{d.submittedAt}</div>
            </div>
            <div className="staff-profile__cell">
              <div className="staff-profile__cell-label">当前派单资格</div>
              <span className="staff-tag staff-tag--red">{d.dispatch}</span>
            </div>
          </div>
        </div>

        {/* 步骤条 */}
        <div className="staff-card">
          <div className="staff-flow">
            <div className="staff-flow__step staff-flow__step--done">
              <CheckCircleFilled />
              <span>执业资质</span>
            </div>
            <div className="staff-flow__line staff-flow__line--done" />
            <div className="staff-flow__step staff-flow__step--done">
              <CheckCircleFilled />
              <span>服务授权</span>
            </div>
            <div className="staff-flow__line" />
            <div className="staff-flow__step">
              <span className="staff-flow__no">3</span>
              <span>审核结论</span>
            </div>
          </div>
        </div>

        {/* 核对区 */}
        <div className="staff-audit-detail">
          {/* 执业资质 */}
          <div className="staff-card">
            <div className="staff-card__header">
              <div className="staff-card__title">执业资质</div>
              <span className="staff-tag staff-tag--orange">{d.credential.status}</span>
            </div>
            <div className="staff-cred-head">
              <div>
                <div className="staff-cred-head__name">{d.credential.name}</div>
                <div className="staff-cred-head__sub">{d.credential.uploaded}</div>
              </div>
              <Button onClick={() => message.success('证照照片预览（演示）')}>查看照片</Button>
            </div>
            <div className="staff-kv-list">
              {d.credential.fields.map((f) => (
                <div key={f.label} className="staff-kv">
                  <span className="staff-kv__label">{f.label}</span>
                  <span className="staff-kv__value">{f.value}</span>
                </div>
              ))}
            </div>
            <div className="staff-note staff-note--check">
              <CheckCircleFilled /> {d.credential.checkNote}
            </div>
          </div>

          {/* 服务授权 */}
          <div className="staff-card">
            <div className="staff-card__header">
              <div className="staff-card__title">服务授权</div>
              <span className="staff-tag staff-tag--orange">{d.auth.pendingNote}</span>
            </div>
            <div className="staff-card__sub">{d.auth.source}</div>
            <div className="staff-auth-checks">
              {d.auth.items.map((it) => (
                <div key={it.name} className="staff-auth-check">
                  <span className="staff-auth-check__name">{it.name}</span>
                  <span className="staff-auth-check__ok">{it.check}</span>
                </div>
              ))}
            </div>
            <div className="staff-note staff-note--info">
              <CheckCircleFilled /> {d.auth.checkNote}
            </div>
          </div>
        </div>

        {/* 统一审核结论 */}
        <div className="staff-card">
          <div className="staff-card__title">统一审核结论</div>
          <div className="staff-audit-form">
            <div className="staff-field">
              <div className="staff-field__label">审核结果</div>
              <div className="staff-audit-results">
                {RESULT_OPTIONS.map((o) => (
                  <span
                    key={o.value}
                    className={`staff-tag staff-tag--${o.tone} staff-audit-result${
                      result === o.value ? ' staff-audit-result--active' : ''
                    }`}
                    onClick={() => setResult(o.value)}
                  >
                    {o.label}
                  </span>
                ))}
              </div>
            </div>
            <div className="staff-field">
              <div className="staff-field__label">审核意见</div>
              <Input.TextArea
                rows={3}
                value={opinion}
                onChange={(e) => setOpinion(e.target.value)}
              />
            </div>
          </div>
          <div className="staff-audit-footer">
            <div className="staff-note staff-note--flat">{d.passNote}</div>
            <div className="staff-detail__actions">
              <Button onClick={() => onSubmit('supplement')}>退回补充</Button>
              <Button type="primary" onClick={() => onSubmit('approve')}>
                审核通过
              </Button>
            </div>
          </div>
        </div>
      </PageContainer>
    </div>
  )
}
