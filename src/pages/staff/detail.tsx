/**
 * 人员管理 - 人员详情
 * 设计稿：专业服务人员.png（Tabs：基本信息/执业资质/服务授权）、普通人员.png（单页）
 * 已对接：
 * - GET /api/v1/staff/staffs/:id              人员详情（§7.2）
 * - GET /api/v1/staff/staffs/:id/credentials  执业资质列表（§7.3）
 * 说明：服务授权项目名字典接口待补充，授权项目以 ID 展示
 */
import { useCallback, useEffect, useState } from 'react'
import { Button, Segmented, Spin } from 'antd'
import { useNavigate, useParams } from 'react-router-dom'
import PageContainer from '@/components/PageContainer'
import { staffApi } from '@/api'
import type { CredentialItem, StaffDetail as StaffDetailData } from '@/api/modules/staff'
import './index.less'

const PRO_TABS = ['基本信息', '执业资质', '服务授权']

const STAFF_TYPE_MAP: Record<number, string> = {
  1: '本端协同人员',
  2: '小程序服务人员',
}

const CREDENTIAL_AUDIT_MAP: Record<number, string> = {
  0: '待审核',
  1: '已通过',
  2: '已驳回',
}

export default function StaffDetail() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const [tab, setTab] = useState('基本信息')
  const [detail, setDetail] = useState<StaffDetailData | null>(null)
  const [credentials, setCredentials] = useState<CredentialItem[]>([])
  const [loading, setLoading] = useState(false)

  const fetchDetail = useCallback(async () => {
    if (!id) return
    setLoading(true)
    try {
      const res = await staffApi.getStaffDetail(Number(id))
      setDetail(res)
      if (res.credentials) {
        setCredentials(res.credentials)
      } else {
        const list = await staffApi.getStaffCredentials(Number(id)).catch(() => [])
        setCredentials(list)
      }
    } catch {
      // 错误提示由拦截器统一处理
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    fetchDetail()
  }, [fetchDetail])

  const isPro = detail?.staff_type === 2
  const positionName = detail?.institutions?.[0]?.position_name

  const baseFields = detail
    ? [
        { label: '姓名', value: detail.name || '-' },
        { label: '手机号', value: detail.phone || '-' },
        { label: '身份证号', value: detail.id_card || '-' },
        { label: '岗位', value: positionName || detail.title || '-' },
        { label: '人员类型', value: STAFF_TYPE_MAP[detail.staff_type] ?? '-' },
        { label: '排班次数', value: detail.schedule_count != null ? String(detail.schedule_count) : '-' },
      ]
    : []

  return (
    <div className="staff-page">
      <PageContainer
        title={isPro ? '专业服务人员详情' : '普通用户详情'}
        description={
          isPro
            ? '查看人员关系、人员角色、执业资质、服务授权、审核记录和派单资格'
            : '单页查看基础信息和账号状态'
        }
      >
        <Spin spinning={loading}>
          {/* 专业服务人员 Tabs */}
          {isPro && (
            <div className="staff-detail__tabs">
              <Segmented value={tab} onChange={(v) => setTab(v as string)} options={PRO_TABS} block />
            </div>
          )}

          {/* 人员头卡 */}
          {detail && (
            <div className="staff-card staff-profile">
              <div className="staff-profile__main">
                <div className="staff-profile__avatar">{(detail.name || '-')[0]}</div>
                <div>
                  <div className="staff-profile__name">
                    {detail.name || '-'}
                    {positionName && (
                      <span className="staff-tag staff-tag--blue">{positionName}</span>
                    )}
                    <span className="staff-tag staff-tag--green">
                      {STAFF_TYPE_MAP[detail.staff_type] ?? '-'}
                    </span>
                  </div>
                  <div className="staff-profile__meta">
                    {detail.phone || '-'} · 机构 #{detail.institution_id}
                  </div>
                </div>
              </div>
              <div className="staff-profile__side">
                <div className="staff-profile__cell">
                  <div className="staff-profile__cell-label">人员状态</div>
                  <span className={`staff-tag staff-tag--${detail.status === 1 ? 'green' : 'red'}`}>
                    {detail.status === 1 ? '启用' : '停用'}
                  </span>
                </div>
                <div className="staff-profile__cell">
                  <div className="staff-profile__cell-label">资质到期预警</div>
                  <span
                    className={`staff-tag staff-tag--${detail.upcoming_credential_expire ? 'orange' : 'green'}`}
                  >
                    {detail.upcoming_credential_expire ? '即将到期' : '正常'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* 基本信息 */}
          {(!isPro || tab === '基本信息') && detail && (
            <div className="staff-card">
              <div className="staff-card__title">基础信息</div>
              <div className="staff-card__sub">
                {isPro
                  ? '专业服务人员的实名信息、人员角色和任职关系'
                  : '普通人员仅维护账号与患者管理所需信息'}
              </div>
              <div className="staff-field-grid">
                {baseFields.map((f) => (
                  <div key={f.label} className="staff-field">
                    <div className="staff-field__label">{f.label}</div>
                    <div className="staff-field__value">{f.value}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 执业资质 */}
          {isPro && tab === '执业资质' && detail && (
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
              {credentials.length === 0 ? (
                <div className="staff-note">暂无执业资质记录</div>
              ) : (
                <div className="staff-field-grid">
                  {credentials.map((c) => (
                    <CredentialFields key={c.id} {...c} />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 服务授权 */}
          {isPro && tab === '服务授权' && detail && (
            <div className="staff-card">
              <div className="staff-card__header">
                <div>
                  <div className="staff-card__title">服务授权</div>
                  <div className="staff-card__sub">查看该人员已授权的机构服务项目</div>
                </div>
                <Button type="primary" onClick={() => navigate(`/staff/${detail.id}/authorize`)}>
                  调整服务授权
                </Button>
              </div>
              <div className="staff-field">
                <div className="staff-field__label">已授权项目</div>
                <div className="staff-auth-tags">
                  {(detail.service_ids ?? []).length === 0 ? (
                    <span className="staff-text--muted">暂无授权服务项目</span>
                  ) : (
                    (detail.service_ids ?? []).map((sid) => (
                      <span key={sid} className="staff-auth-tag">
                        服务 #{sid}
                      </span>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}
        </Spin>
      </PageContainer>
    </div>
  )
}

/** 单条资质的三列字段（名称/有效期/状态） */
function CredentialFields(c: CredentialItem) {
  return (
    <>
      <div className="staff-field">
        <div className="staff-field__label">资质类型</div>
        <div className="staff-field__value">{c.credential_type || '-'}</div>
      </div>
      <div className="staff-field">
        <div className="staff-field__label">有效期至</div>
        <div className="staff-field__value">{c.valid_until || '-'}</div>
      </div>
      <div className="staff-field">
        <div className="staff-field__label">审核状态</div>
        <div className="staff-field__value">{CREDENTIAL_AUDIT_MAP[c.audit_status] ?? '-'}</div>
      </div>
    </>
  )
}
