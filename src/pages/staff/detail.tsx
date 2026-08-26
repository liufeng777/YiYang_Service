/**
 * 人员管理 - 人员详情
 * 设计稿：专业服务人员.png（Tabs：基本信息/执业资质/服务授权）、普通人员.png（单页）、执业资质.png
 * TODO: 接口见 @/api/modules/staff（§7.2 人员详情 / 7.3 资质），待后端联调后替换 mock
 */
import { useMemo, useState } from 'react'
import { Button, Segmented, Select, message } from 'antd'
import { useNavigate, useParams } from 'react-router-dom'
import PageContainer from '@/components/PageContainer'
import {
  DISPATCH_TEXT,
  STAFF_STATUS_TEXT,
  STAFF_TYPE_TEXT,
  mockStaffDetailNormal,
  mockStaffDetailPro,
  mockStaffList,
  type MockStaffDetail,
} from './mock'
import './index.less'

const PRO_TABS = ['基本信息', '执业资质', '服务授权']

export default function StaffDetail() {
  const navigate = useNavigate()
  const { id } = useParams()
  const [tab, setTab] = useState('基本信息')

  // TODO: 联调后按 id 请求 staffApi.getStaffDetail；当前按列表 mock 判断人员类型
  const detail: MockStaffDetail = useMemo(() => {
    const row = mockStaffList.find((r) => r.id === id)
    return row?.type === 'normal' ? mockStaffDetailNormal : mockStaffDetailPro
  }, [id])

  const isPro = detail.type === 'pro'

  return (
    <div className="staff-page">
      <PageContainer
        title={isPro ? '专业服务人员详情' : '普通用户详情'}
        description={
          isPro
            ? '查看人员关系、人员角色、执业资质、服务授权、审核记录和派单资格'
            : '单页查看基础信息和账号状态'
        }
        extra={
          <Button type="primary" onClick={() => message.success('已跳转编辑（演示）')}>
            {isPro ? '编辑专业人员' : '编辑普通用户'}
          </Button>
        }
      >
        {/* 专业服务人员 Tabs */}
        {isPro && (
          <div className="staff-detail__tabs">
            <Segmented value={tab} onChange={(v) => setTab(v as string)} options={PRO_TABS} block />
          </div>
        )}

        {/* 人员头卡 */}
        <div className="staff-card staff-profile">
          <div className="staff-profile__main">
            <div className="staff-profile__avatar">{detail.name[0]}</div>
            <div>
              <div className="staff-profile__name">
                {detail.name}
                <span className="staff-tag staff-tag--blue">{detail.role}</span>
                <span className={`staff-tag staff-tag--${detail.headTagTone}`}>
                  {isPro ? detail.headTag : STAFF_TYPE_TEXT[detail.type]}
                </span>
                {!isPro && (
                  <span className={`staff-tag staff-tag--${detail.headTagTone}`}>
                    {detail.headTag}
                  </span>
                )}
              </div>
              <div className="staff-profile__meta">
                {detail.phone} · 工号 {detail.staffNo} · {detail.org}
              </div>
            </div>
          </div>
          <div className="staff-profile__side">
            <div className="staff-profile__cell">
              <div className="staff-profile__cell-label">人员状态</div>
              <span className={`staff-tag staff-tag--${detail.status === 'valid' ? 'green' : 'red'}`}>
                {STAFF_STATUS_TEXT[detail.status]}
              </span>
            </div>
            <div className="staff-profile__cell">
              <div className="staff-profile__cell-label">
                {isPro ? '派单资格' : '账号状态'}
              </div>
              <span className={`staff-tag staff-tag--${detail.dispatch === 'no' ? 'red' : 'green'}`}>
                {isPro ? DISPATCH_TEXT[detail.dispatch] : '启用'}
              </span>
            </div>
            <div className="staff-profile__cell-note">{detail.dispatchNote}</div>
          </div>
        </div>

        {/* 基本信息 */}
        {(!isPro || tab === '基本信息') && (
          <div className="staff-card">
            <div className="staff-card__title">基础信息</div>
            <div className="staff-card__sub">
              {isPro
                ? '专业服务人员的实名信息、人员角色和任职关系'
                : '普通人员仅维护账号与患者管理所需信息'}
            </div>
            <div className="staff-field-grid">
              {detail.baseFields.map((f) => (
                <div key={f.label} className="staff-field">
                  <div className="staff-field__label">{f.label}</div>
                  <div className="staff-field__value">{f.value}</div>
                </div>
              ))}
            </div>
            <div className="staff-note">{detail.baseNote}</div>
            <div className="staff-detail__actions">
              <Button type="primary" onClick={() => message.success('已跳转编辑（演示）')}>
                编辑信息
              </Button>
            </div>
          </div>
        )}

        {/* 执业资质 */}
        {isPro && tab === '执业资质' && (
          <div className="staff-card">
            <div className="staff-card__header">
              <div>
                <div className="staff-card__title">执业资质</div>
                <div className="staff-card__sub">证照照片、有效期和人工审核留痕</div>
              </div>
              <Button
                type="primary"
                onClick={() => navigate(`/staff/${detail.id}/credential-upload`)}
              >
                + 新增资质
              </Button>
            </div>
            <div className="staff-field-grid">
              {(detail.credentials ?? []).map((c) => (
                <CredentialFields key={c.name} {...c} />
              ))}
              {(detail.auditTrail ?? []).map((f) => (
                <div key={f.label} className="staff-field">
                  <div className="staff-field__label">{f.label}</div>
                  <div className="staff-field__value">{f.value}</div>
                </div>
              ))}
            </div>
            <div className="staff-note">{detail.credentialNote}</div>
            <div className="staff-detail__actions">
              <Button onClick={() => message.success('证照照片预览（演示）')}>查看照片</Button>
              <Button type="primary" onClick={() => message.success('已发起人工审核（演示）')}>
                发起审核
              </Button>
            </div>
          </div>
        )}

        {/* 服务授权 */}
        {isPro && tab === '服务授权' && (
          <div className="staff-card">
            <div className="staff-card__header">
              <div>
                <div className="staff-card__title">服务授权</div>
                <div className="staff-card__sub">查看并调整该人员已授权的机构服务项目</div>
              </div>
              <Button
                type="primary"
                onClick={() => navigate(`/staff/${detail.id}/authorize`)}
              >
                调整服务授权
              </Button>
            </div>
            <div className="staff-field">
              <div className="staff-field__label">
                授权服务项目 <span className="staff-required">*</span>
              </div>
              <Select
                mode="multiple"
                value={detail.authedServices ?? []}
                options={(detail.authedServices ?? []).map((v) => ({ value: v, label: v }))}
                open={false}
                suffixIcon={null}
                maxTagCount={0}
                maxTagPlaceholder={`已选择 ${(detail.authedServices ?? []).length} 项`}
              />
            </div>
            <div className="staff-field">
              <div className="staff-field__label">已选项目</div>
              <div className="staff-auth-tags">
                {(detail.authedServices ?? []).map((s) => (
                  <span key={s} className="staff-auth-tag">
                    {s}
                  </span>
                ))}
                <span className="staff-text--muted">
                  可选范围：运营平台有效项目 ∩ 当前机构已开通项目
                </span>
              </div>
            </div>
            <div className="staff-detail__actions">
              <Button type="primary" onClick={() => message.success('授权已保存，进入审核（演示）')}>
                保存授权
              </Button>
            </div>
          </div>
        )}
      </PageContainer>
    </div>
  )
}

/** 单条资质的三列字段（名称/有效期/状态） */
function CredentialFields(c: {
  name: string
  uploaded: string
  validLabel: string
  validUntil: string
  statusLabel: string
  status: string
}) {
  return (
    <>
      <div className="staff-field">
        <div className="staff-field__label">{c.name}</div>
        <div className="staff-field__value">{c.uploaded}</div>
      </div>
      <div className="staff-field">
        <div className="staff-field__label">{c.validLabel}</div>
        <div className="staff-field__value">{c.validUntil}</div>
      </div>
      <div className="staff-field">
        <div className="staff-field__label">{c.statusLabel}</div>
        <div className="staff-field__value">{c.status}</div>
      </div>
    </>
  )
}
