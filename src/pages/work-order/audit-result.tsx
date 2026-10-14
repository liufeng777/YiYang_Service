/**
 * 服务工单 - 审核通过结果页（设计稿：审核通过待派单.png）
 * 医生审核结论已记录，工单进入待派单
 */
import { Button } from 'antd'
import { CheckCircleFilled } from '@ant-design/icons'
import { useNavigate, useParams } from 'react-router-dom'
import PageContainer from '@/components/PageContainer'
import { mockWoAuditResult } from './mock'
import './index.less'

export default function WorkOrderAuditResult() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const r = mockWoAuditResult
  const orderNo = id ?? r.woNo

  return (
    <div className="wo-page">
      <PageContainer
        title="医生审核服务订单"
        description="审核结论已记录，工单进入待派单"
        extra={<Button onClick={() => navigate('/work-order')}>‹ 返回工单列表</Button>}
      >
        <div className="wo-card wo-result">
          <CheckCircleFilled className="wo-result__icon" />
          <div className="wo-result__title">服务订单审核通过</div>
          <div className="wo-result__sub">工单编号：{orderNo}</div>

          <div className="wo-result__member">
            <div className="wo-result__member-name">
              {r.member.name}
              <span className="wo-result__member-meta">{r.member.meta}</span>
            </div>
            <div className="wo-result__member-org">{r.member.org}</div>
            <div className="wo-result__member-tags">
              {r.member.tags.map((t) => (
                <span key={t} className="wo-tag wo-tag--blue">
                  {t}
                </span>
              ))}
            </div>
          </div>

          <div className="wo-note wo-note--green wo-result__note">{r.syncNote}</div>
          <div className="wo-result__tip">{r.tip}</div>

          <div className="wo-result__actions">
            <Button onClick={() => navigate('/work-order')}>返回工单列表</Button>
            <Button
              type="primary"
              onClick={() => navigate(`/work-order/${orderNo}?dispatch=1`)}
            >
              进入派单
            </Button>
          </div>
        </div>
      </PageContainer>
    </div>
  )
}
