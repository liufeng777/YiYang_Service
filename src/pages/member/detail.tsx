/**
 * 健康会员 - 健康会员详情（设计稿：2.健康会员/健康会员详情.png）
 * 已对接 GET /api/v1/staff/members/:id/health-profile（健康档案聚合）
 * 接口未覆盖的字段（关联注册会员/团队/健康目标/最近随访）以「-」占位，待后端补充
 */
import { useEffect, useState } from 'react'
import { Button, Input, App } from 'antd'
import { CheckCircleFilled, LeftOutlined } from '@ant-design/icons'
import { useNavigate, useParams } from 'react-router-dom'
import PageContainer from '@/components/PageContainer'
import { memberApi } from '@/api'
import { MEMBER_STATUS_MAP, RISK_LEVEL_MAP, type HealthProfile } from '@/api/modules/member'
import './index.less'

export default function MemberDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { message } = App.useApp()
  const [profile, setProfile] = useState<HealthProfile>()
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!id) return
    setLoading(true)
    memberApi
      .getHealthProfile(id)
      .then((res) => setProfile(res))
      .catch(() => undefined)
      .finally(() => setLoading(false))
  }, [id])

  const m = profile?.member
  const riskValue =
    profile?.levels && !Array.isArray(profile.levels) ? profile.levels.risk_level : undefined
  const riskText = riskValue ? (RISK_LEVEL_MAP[riskValue] ?? '-') : '-'
  const statusText = m?.status ? (MEMBER_STATUS_MAP[m.status] ?? '-') : '-'

  return (
    <PageContainer
      title="健康会员详情"
      description="查看服务对象基础信息、健康管理状态及专业团队归属"
      extra={
        <>
          <span className="mb-tag mb-tag--verify">系统实名校验：已通过</span>
          <Button icon={<LeftOutlined />} onClick={() => navigate('/member')}>
            返回列表
          </Button>
        </>
      }
    >
      <div className="mb-card mb-detail">
        {/* 基本信息 */}
        <div className="mb-detail__section-title">基本信息</div>
        <div className="mb-detail__grid">
          <div className="mb-detail__field">
            <span className="mb-detail__label">姓名</span>
            <Input value={m?.name ?? '-'} readOnly />
          </div>
          <div className="mb-detail__field">
            <span className="mb-detail__label">联系电话</span>
            <Input value={m?.phone ?? profile?.contact?.emergency_phone ?? '-'} readOnly />
          </div>
          <div className="mb-detail__field">
            <span className="mb-detail__label">关联注册会员</span>
            <Input value="-" readOnly />
          </div>
        </div>

        {/* 健康管理信息 */}
        <div className="mb-detail__section-title">健康管理信息</div>
        <div className="mb-detail__grid">
          <div className="mb-detail__field">
            <span className="mb-detail__label">健康档案</span>
            <Input value={m?.status && m.status > 1 ? '已建档' : '待完善'} readOnly />
          </div>
          <div className="mb-detail__field">
            <span className="mb-detail__label">风险分层</span>
            <Input value={riskText} readOnly />
          </div>
          <div className="mb-detail__field">
            <span className="mb-detail__label">健康管理团队</span>
            <Input value={statusText === '管理中' ? '已纳管' : '待分配团队'} readOnly />
          </div>
        </div>
        <div className="mb-detail__field mb-detail__field--full">
          <span className="mb-detail__label">当前健康目标</span>
          <Input.TextArea
            rows={4}
            readOnly
            value={profile?.recent_goals?.map((g) => g.name).join('；') || '-'}
          />
        </div>
        <div className="mb-detail__field mb-detail__field--full">
          <span className="mb-detail__label">最近随访</span>
          <Input value="-" readOnly />
        </div>

        {/* 实名校验留痕 */}
        <div className="mb-verify-banner">实名校验由系统自动完成，留痕信息接口暂未提供</div>
        <div className="mb-verify-note">
          <CheckCircleFilled className="mb-verify-note__icon" />
          姓名与身份证号由系统自动校验；失败由用户修改后重新提交，不产生人工审核任务。
        </div>

        {/* 底部操作 */}
        <div className="mb-detail__actions">
          <Button onClick={() => navigate('/member')}>取消</Button>
          <Button
            type="primary"
            loading={loading}
            onClick={() => message.info('保存配置接口暂未提供')}
          >
            保存配置
          </Button>
        </div>
      </div>
    </PageContainer>
  )
}
