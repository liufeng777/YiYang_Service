/**
 * 健康管理方案 - 执行详情（设计稿：详情.png）
 * 方案生效后的执行跟踪视图：任务完成、目标达标与近期动态
 * TODO: 方案执行数据接口 API v0.1 未定义（数据来自健康数据/用药记录/服务履约），当前为本地 mock
 */
import { Button, message, Progress } from 'antd'
import { ArrowLeftOutlined } from '@ant-design/icons'
import { useNavigate, useParams } from 'react-router-dom'
import PageContainer from '@/components/PageContainer'
import { mockExecution, mockPlanMember } from './mock'
import './index.less'

const TASK_STATUS_TAG: Record<string, { text: string; cls: string }> = {
  normal: { text: '正常', cls: 'plan-tag--green' },
  pending: { text: '待完成', cls: 'plan-tag--orange' },
  done: { text: '已完成', cls: 'plan-tag--green' },
}

export default function PlanExecution() {
  const { id } = useParams()
  const navigate = useNavigate()
  const e = mockExecution
  const m = mockPlanMember
  void id

  const stats = [
    { label: `执行第 ${e.dayIndex} 天`, value: `剩余 ${e.remaining} 天`, tone: 'info' },
    { label: '方案完成度', value: `${e.completion}%`, tone: 'success' },
    { label: '目标达标', value: e.goalsMet, tone: 'success' },
    { label: '本周异常', value: `${e.weekAbnormal}项`, tone: 'danger' },
  ]

  return (
    <div className="plan-page">
      <PageContainer
        title={
          <span className="plan-detail__title">
            <ArrowLeftOutlined className="plan-detail__back" onClick={() => navigate('/plan')} />
            健康管理方案详情
          </span>
        }
        description={`${e.status} · ${e.version}`}
        extra={
          <div className="plan-detail__header-actions">
            <Button onClick={() => message.info('打印方案（当前为演示）')}>打印方案</Button>
            <Button type="primary" onClick={() => message.info('发起方案调整（当前为演示）')}>
              发起方案调整
            </Button>
          </div>
        }
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
              责任医生 {m.doctor}　健管师 {m.manager}
            </span>
            <span className="plan-tag plan-tag--green">{e.status}</span>
          </div>
        </div>

        {/* 统计卡 */}
        <div className="plan-stats">
          {stats.map((s) => (
            <div key={s.label} className="plan-stat">
              <div className="plan-stat__label">{s.label}</div>
              <div className={`plan-stat__value plan-stat__value--${s.tone}`}>{s.value}</div>
            </div>
          ))}
        </div>

        <div className="plan-execution">
          {/* 左：本周执行情况 */}
          <div className="plan-card">
            <div className="plan-card__header">
              <span className="plan-card__title">本周执行情况</span>
              <span className="plan-card__sub">{e.weekRange}</span>
            </div>
            <div className="plan-execution__rate">
              <div className="plan-execution__rate-label">任务完成率</div>
              <div className="plan-execution__rate-value">
                {e.taskDone} / {e.taskTotal}
              </div>
              <Progress percent={e.taskRate} showInfo={false} />
              <div className="plan-execution__rate-percent">{e.taskRate}%</div>
            </div>
            <div className="plan-detail__section">任务明细</div>
            {e.tasks.map((t) => (
              <div key={t.name} className="plan-module-card plan-execution__task">
                <span className="plan-module-card__title">{t.name}</span>
                <span className="plan-execution__task-plan">{t.plan}</span>
                <span className="plan-execution__task-progress">{t.progress}</span>
                <span className="plan-execution__task-note">{t.note}</span>
                <span className={`plan-tag ${TASK_STATUS_TAG[t.status].cls}`}>
                  {TASK_STATUS_TAG[t.status].text}
                </span>
              </div>
            ))}
            <div className="plan-data-note plan-data-note--blue">{e.dataNote}</div>
          </div>

          {/* 右：目标与风险 + 近期动态 */}
          <div className="plan-detail__rail">
            <div className="plan-card">
              <div className="plan-card__header">
                <span className="plan-card__title">目标与风险</span>
              </div>
              {e.metrics.map((mt) => (
                <div key={mt.name} className="plan-metric">
                  <div className="plan-metric__label">{mt.name}</div>
                  <div className="plan-metric__foot">
                    <span className={mt.tone === 'danger' ? 'plan-metric__value plan-text--danger' : 'plan-metric__value'}>
                      {mt.value}
                    </span>
                    <span className={mt.tone === 'danger' ? 'plan-tag plan-tag--danger' : 'plan-tag plan-tag--green'}>
                      {mt.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <div className="plan-card">
              <div className="plan-card__header">
                <span className="plan-card__title">近期动态</span>
              </div>
              {e.activities.map((act) => (
                <div key={`${act.date}-${act.text}`} className="plan-rail__row">
                  <span className="plan-rail__label">{act.date}</span>
                  <span>{act.text}</span>
                </div>
              ))}
              <div className="plan-exception">
                <div className="plan-exception__title">异常待处理</div>
                {e.exceptionNote}
              </div>
            </div>
          </div>
        </div>
      </PageContainer>
    </div>
  )
}
