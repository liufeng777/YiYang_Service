/**
 * 健康档案 - 分层分级详情（设计稿：分层分级详情.png）
 * 展示本次分层结论、计算依据、数据版本与下一步任务
 * TODO: 分层分级接口 API v0.1 未定义，当前为 mock
 */
import { Button } from 'antd'
import { useParams } from 'react-router-dom'
import PageContainer from '@/components/PageContainer'
import { mockRiskLevel } from './mock'
import './index.less'

export default function RiskLevelDetail() {
  const { id } = useParams()
  // TODO: 接入后端后按 id 调分层分级详情接口
  void id
  const r = mockRiskLevel

  return (
    <div className="hr-page">
      <PageContainer title="分层分级详情" description="展示本次分层结论、计算依据、数据版本与下一步任务">
        {/* 当前综合风险 */}
        <div className="hr-card hr-risk__summary">
          <div>
            <div className="hr-overview-item__label">当前综合风险</div>
            <div className="hr-risk__current">
              <span className="hr-risk__level">{r.current}</span>
              <span className="hr-tag hr-tag--risk-mid">{r.tag}</span>
            </div>
          </div>
          <div className="hr-risk__meta">
            <div className="hr-risk__meta-row">
              <span className="hr-overview-item__label">计算时间</span>
              <span className="hr-risk__meta-value">{r.time}</span>
            </div>
            <div className="hr-risk__meta-row">
              <span className="hr-overview-item__label">规则版本</span>
              <span className="hr-risk__meta-value">{r.rule}</span>
            </div>
          </div>
        </div>

        <div className="hr-risk__panels">
          {/* 分层依据 */}
          <div className="hr-card">
            <div className="hr-card__header">
              <span className="hr-card__title">分层依据</span>
            </div>
            <div className="hr-risk-basis">
              {r.basis.map((b) => (
                <div key={b.label} className="hr-risk-basis__row">
                  <span className="hr-risk-basis__label">{b.label}</span>
                  <span className="hr-risk-basis__value">{b.value}</span>
                  <span className="hr-risk-basis__note">{b.note}</span>
                  <span className={`hr-tag hr-tag--risk-${b.level}`}>{b.tag}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 系统生成的下一步 */}
          <div className="hr-card">
            <div className="hr-card__header">
              <span className="hr-card__title">系统生成的下一步</span>
            </div>
            <div className="hr-risk-steps">
              {r.nextSteps.map((s) => (
                <div key={s.no} className="hr-risk-steps__row">
                  <span className="hr-risk-steps__no">{s.no}</span>
                  <span className="hr-risk-steps__text">{s.text}</span>
                  <span className="hr-risk-steps__status">{s.status}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 数据新鲜度与版本 */}
        <div className="hr-risk__freshness">
          <div className="hr-risk__freshness-title">数据新鲜度与版本</div>
          {r.freshness}
        </div>

        <div className="hr-risk__footer">
          <Button>查看历史变化</Button>
        </div>
      </PageContainer>
    </div>
  )
}
