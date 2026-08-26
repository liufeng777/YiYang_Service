/**
 * 健康管理方案 - 方案详情 / AI 生成结果（设计稿：方案概览 / 监测计划 / 饮食指导 / 运动指导 / 复诊复查与健康教育）
 * 健管师逐项核对 AI 草稿并完善，提交责任医生审核后生效
 * TODO: 方案模块结构化内容接口 API v0.1 未定义，数据为本地 mock（见 ./mock.ts）；
 * 提交审核接入 planApi.confirmPlan（§5.2），重新生成接入 planApi.aiGeneratePlan（§5.1）
 */
import { useState } from 'react'
import { Button, Checkbox, message, Progress } from 'antd'
import { ArrowLeftOutlined, PlusOutlined, RedoOutlined } from '@ant-design/icons'
import { useNavigate, useParams } from 'react-router-dom'
import PageContainer from '@/components/PageContainer'
import {
  mockDiet,
  mockExercise,
  mockMonitorItems,
  mockPlanAi,
  mockPlanCoreGoals,
  mockPlanMember,
  mockPlanModuleHeaders,
  mockPlanModules,
  mockPlanOverviewCards,
  mockPlanTodos,
  mockRevisit,
} from './mock'
import './index.less'

/** 各模块底部主操作（diet/exercise 引导进入下一项） */
const NEXT_MODULE: Record<string, string> = {
  diet: 'exercise',
  exercise: 'review',
}

export default function PlanDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [moduleKey, setModuleKey] = useState('overview')
  const m = mockPlanMember
  void id

  const activeModule = mockPlanModules.find((mod) => mod.key === moduleKey)
  const header = mockPlanModuleHeaders[moduleKey]
  const nextKey = NEXT_MODULE[moduleKey]
  const nextModule = nextKey ? mockPlanModules.find((mod) => mod.key === nextKey) : undefined

  const onSubmit = () => {
    // TODO: 接入后端后调用 planApi.confirmPlan（§5.2，先人工修订再 status=3-confirmed）
    message.success('已提交责任医生审核，审核通过后方案生效')
    navigate('/plan')
  }

  const onRegenerate = () => {
    // TODO: 接入后端后调用 planApi.aiGeneratePlan（§5.1）重新生成草稿
    message.info('将按最新档案与数据重新生成方案草稿（当前为演示）')
  }

  const moduleStatusTag = (status: 'generated' | 'confirm') =>
    status === 'generated' ? (
      <span className="plan-tag plan-tag--green">已生成</span>
    ) : (
      <span className="plan-tag plan-tag--orange">需确认</span>
    )

  return (
    <div className="plan-page">
      <PageContainer
        title={
          <span className="plan-detail__title">
            <ArrowLeftOutlined className="plan-detail__back" onClick={() => navigate('/plan')} />
            健康管理方案
          </span>
        }
        description={`AI方案草稿 · ${activeModule?.name ?? ''}`}
        extra={<span className="plan-tag plan-tag--purple">✦ AI生成 · {mockPlanAi.generatedAt}</span>}
      >
        {/* 会员条 */}
        <div className="plan-member">
          <div className="plan-member__main">
            <div>
              <div className="plan-member__name">{m.name}</div>
              <div className="plan-member__meta">{m.gender} · {m.age}岁 · {header?.sub}</div>
            </div>
          </div>
          <div className="plan-member__side plan-member__side--wide">
            <span>{header?.center}</span>
            {moduleKey !== 'diet' && moduleKey !== 'exercise' && moduleKey !== 'review' && (
              <span>方案周期 {m.periodStart} 至 {m.periodEnd}</span>
            )}
            <span className="plan-text--warn">草稿状态 待完善</span>
          </div>
        </div>

        <div className="plan-detail__panels">
          {/* 左：方案模块导航 */}
          <div className="plan-card plan-detail__nav">
            <div className="plan-card__header">
              <span className="plan-card__title">方案模块</span>
            </div>
            {mockPlanModules.map((mod) => (
              <div
                key={mod.key}
                className={
                  moduleKey === mod.key ? 'plan-nav-item plan-nav-item--active' : 'plan-nav-item'
                }
                onClick={() => setModuleKey(mod.key)}
              >
                <span>{mod.name}</span>
                {moduleStatusTag(mod.status)}
              </div>
            ))}
            <div className="plan-detail__completeness">
              <div className="plan-field__label">方案完整度</div>
              <div className="plan-detail__completeness-value">{m.completeness}%</div>
              <Progress percent={m.completeness} showInfo={false} />
            </div>
            <div className="plan-todo-box">
              <div className="plan-todo-box__title">待确认事项</div>
              <ul>
                {mockPlanTodos.map((t) => (
                  <li key={t}>{t}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* 中：模块内容 */}
          <div className="plan-detail__content">
            {moduleKey === 'overview' && (
              <div className="plan-card">
                <div className="plan-card__header">
                  <span className="plan-card__title">方案概览</span>
                  <span className="plan-card__sub">AI综合档案、目标和数据生成，需由健管师核对</span>
                </div>
                <div className="plan-readonly-box">
                  <div className="plan-readonly-box__title">核心管理目标（只读）</div>
                  <div className="plan-readonly-box__body">{mockPlanCoreGoals.join('　')}</div>
                </div>
                <div className="plan-detail__section">方案内容</div>
                {mockPlanOverviewCards.map((c) => (
                  <div key={c.key} className="plan-module-card">
                    <div className="plan-module-card__head">
                      <span className="plan-module-card__title">{c.title}</span>
                      <span className="plan-module-card__count">{c.count}</span>
                    </div>
                    <div className="plan-module-card__desc">{c.desc}</div>
                    <div className="plan-module-card__status">{moduleStatusTag(c.status)}</div>
                  </div>
                ))}
                <div className="plan-ai-note plan-ai-note--block">
                  <div className="plan-ai-note__title">✦ AI生成说明</div>
                  <p>{mockPlanAi.overviewNote}</p>
                  <div className="plan-ai-note__meta">
                    依据版本：{mockPlanAi.version}　生成时间：{mockPlanAi.generatedAt}
                  </div>
                </div>
              </div>
            )}

            {moduleKey === 'monitor' && (
              <div className="plan-card">
                <div className="plan-card__header">
                  <span className="plan-card__title">监测计划</span>
                  <span className="plan-card__sub">AI根据已生效目标及近期异常生成，可由健管师调整频次</span>
                </div>
                <div className="plan-readonly-box">
                  <div className="plan-readonly-box__title">引用管理目标（只读）</div>
                  <div className="plan-readonly-box__body">
                    {mockPlanCoreGoals.slice(0, 2).join('　')}
                  </div>
                  <div className="plan-readonly-box__tip">
                    修改目标请由责任医生进入「管理目标」
                  </div>
                </div>
                <div className="plan-detail__section">居家监测安排</div>
                {mockMonitorItems.map((item) => (
                  <div key={item.id} className="plan-module-card plan-monitor">
                    <div className="plan-monitor__main">
                      <div className="plan-monitor__name">{item.name}</div>
                      <div className="plan-monitor__freq">{item.frequency}</div>
                      <div className="plan-monitor__time">{item.timePoint}</div>
                    </div>
                    <div className="plan-monitor__sub">
                      <span>{item.source}</span>
                      <span className="plan-text--warn">{item.alert}</span>
                    </div>
                    <Button
                      size="small"
                      onClick={() => message.info('调整监测频次（当前为演示）')}
                    >
                      调整
                    </Button>
                  </div>
                ))}
                <Button
                  block
                  icon={<PlusOutlined />}
                  className="plan-monitor__add"
                  onClick={() => message.info('添加监测项（当前为演示）')}
                >
                  添加监测项
                </Button>
                <div className="plan-data-note">
                  数据说明：监测结果写入「健康数据」，检查报告写入「检查检验」；方案只保存面向患者的指导内容与监测建议，不生成随访任务。
                </div>
              </div>
            )}

            {moduleKey === 'diet' && (
              <div className="plan-card">
                <div className="plan-card__header">
                  <span className="plan-card__title">饮食指导</span>
                  <span className="plan-card__sub">根据健康档案、管理目标和劳动强度生成，可人工调整</span>
                </div>
                <div className="plan-readonly-box">
                  <div className="plan-readonly-box__title">生成参数</div>
                  <div className="plan-kv-grid">
                    {mockDiet.params.map((p) => (
                      <div key={p.label}>
                        <div className="plan-kv-grid__label">{p.label}</div>
                        <div className="plan-kv-grid__value">{p.value}</div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="plan-detail__section">每日建议</div>
                <div className="plan-quad">
                  {mockDiet.daily.map((d) => (
                    <div key={d.label} className="plan-quad__cell">
                      <div className="plan-quad__label">{d.label}</div>
                      <div className={d.warn ? 'plan-quad__value plan-text--warn' : 'plan-quad__value'}>
                        {d.value}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="plan-detail__section">一日食谱建议</div>
                {mockDiet.meals.map((meal) => (
                  <div key={meal.name} className="plan-module-card plan-meal">
                    <div className="plan-meal__name">{meal.name}</div>
                    <div className="plan-meal__body">
                      <div>{meal.content}</div>
                      <div className="plan-text--warn plan-meal__note">{meal.note}</div>
                    </div>
                    <Button size="small" onClick={() => message.info('调整食谱（当前为演示）')}>
                      调整
                    </Button>
                  </div>
                ))}
                <div className="plan-data-note">
                  <div className="plan-data-note__title">饮食原则与禁忌</div>
                  <ul className="plan-rail__list">
                    {mockDiet.principles.map((p) => (
                      <li key={p}>{p}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {moduleKey === 'exercise' && (
              <div className="plan-card">
                <div className="plan-card__header">
                  <span className="plan-card__title">运动指导</span>
                  <span className="plan-card__sub">依据运动基础、疾病风险与目标生成，开始前须确认禁忌</span>
                </div>
                <div className="plan-readonly-box">
                  <div className="plan-readonly-box__title">运动安全评估</div>
                  <div className="plan-readonly-box__body">{mockExercise.safety}</div>
                  <div className="plan-readonly-box__tip plan-text--warn">{mockExercise.safetyWarn}</div>
                </div>
                <div className="plan-detail__section">运动处方（FITT）</div>
                <div className="plan-quad">
                  {mockExercise.fitt.map((f) => (
                    <div key={f.label} className="plan-quad__cell">
                      <div className="plan-quad__label">{f.label}</div>
                      <div className={f.warn ? 'plan-quad__value plan-text--warn' : 'plan-quad__value'}>
                        {f.value}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="plan-detail__section">一周运动安排</div>
                <div className="plan-week">
                  {mockExercise.week.map((d) => (
                    <div key={d.day} className="plan-week__cell">
                      <div className="plan-week__day">{d.day}</div>
                      <div className="plan-week__content">{d.content}</div>
                      <div className="plan-week__duration">{d.duration || '—'}</div>
                    </div>
                  ))}
                </div>
                <div className="plan-detail__section">运动内容</div>
                {mockExercise.contents.map((c) => (
                  <div key={c.name} className="plan-module-card plan-meal">
                    <div className="plan-meal__name">{c.name}</div>
                    <div className="plan-meal__body">{c.desc}</div>
                    <Button size="small" onClick={() => message.info('调整运动内容（当前为演示）')}>
                      调整
                    </Button>
                  </div>
                ))}
                <div className="plan-todo-box">{mockExercise.warning}</div>
              </div>
            )}

            {moduleKey === 'review' && (
              <div className="plan-card">
                <div className="plan-card__header">
                  <span className="plan-card__title">复诊复查与健康教育</span>
                  <span className="plan-card__sub">复诊复查和健康教育建议，经审核后推送患者端</span>
                </div>
                <div className="plan-readonly-box">
                  <div className="plan-readonly-box__title">生成逻辑</div>
                  <div className="plan-readonly-box__body">{mockRevisit.logic}</div>
                </div>
                <div className="plan-detail__section">方案建议</div>
                {mockRevisit.items.map((item) => (
                  <div key={item.name} className="plan-module-card">
                    <div className="plan-module-card__head">
                      <span className="plan-module-card__title">{item.name}</span>
                      <span className="plan-module-card__count">
                        {item.date}　{item.channel}　{item.target}
                      </span>
                    </div>
                    <div className="plan-module-card__desc">{item.desc}</div>
                    <div className="plan-module-card__status">{moduleStatusTag(item.status)}</div>
                  </div>
                ))}
                <div className="plan-todo-box">
                  <div className="plan-todo-box__title">风险提示</div>
                  <ul>
                    {mockRevisit.risks.map((r) => (
                      <li key={r}>{r}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>

          {/* 右：进度与摘要（按模块切换） */}
          <div className="plan-detail__rail">
            {moduleKey === 'monitor' && (
              <>
                <div className="plan-card">
                  <div className="plan-card__header">
                    <span className="plan-card__title">AI生成摘要</span>
                  </div>
                  <div className="plan-ai-note plan-ai-note--block">
                    <div className="plan-ai-note__title">✦ 生成依据</div>
                    <ul className="plan-rail__list">
                      {mockPlanAi.basis.map((b) => (
                        <li key={b}>{b}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="plan-field__label plan-rail__gap">风险提示</div>
                  <div className="plan-todo-box">{mockPlanAi.riskNote}</div>
                  <div className="plan-field__label plan-rail__gap">人工确认记录</div>
                  {mockPlanAi.confirmRecords.map((r) => (
                    <div key={r.label} className="plan-rail__row">
                      <span className="plan-rail__label">{r.label}</span>
                      <span>{r.value}</span>
                    </div>
                  ))}
                </div>
                <Button block icon={<RedoOutlined />} onClick={onRegenerate}>
                  重新生成方案
                </Button>
                <div className="plan-data-note plan-data-note--blue">
                  AI内容仅作为方案草稿，提交前须由健管师核对，生效前须经医生审核。
                </div>
              </>
            )}

            {moduleKey === 'diet' && (
              <>
                <div className="plan-card">
                  <div className="plan-card__header">
                    <span className="plan-card__title">AI推荐依据</span>
                  </div>
                  <div className="plan-ai-note plan-ai-note--block">
                    <p>✦ {mockDiet.aiBasis}</p>
                    <div className="plan-ai-note__meta">{mockDiet.aiSource}</div>
                  </div>
                  <div className="plan-field__label plan-rail__gap">人工确认</div>
                  <div className="plan-checks">
                    {mockDiet.confirms.map((c) => (
                      <div key={c.label} className="plan-checks__item">
                        <Checkbox checked={c.checked} />
                        <span>{c.label}</span>
                      </div>
                    ))}
                  </div>
                  <div className="plan-todo-box">
                    <div className="plan-todo-box__title">特别提醒</div>
                    {mockDiet.specialNote}
                  </div>
                </div>
                <Button block icon={<RedoOutlined />} onClick={onRegenerate}>
                  重新生成饮食指导
                </Button>
              </>
            )}

            {moduleKey === 'exercise' && (
              <>
                <div className="plan-card">
                  <div className="plan-card__header">
                    <span className="plan-card__title">AI推荐依据</span>
                  </div>
                  <div className="plan-ai-note plan-ai-note--block">
                    <p>✦ {mockExercise.aiBasis}</p>
                    <div className="plan-ai-note__meta">{mockExercise.aiSource}</div>
                  </div>
                  <div className="plan-field__label plan-rail__gap">禁忌确认</div>
                  <div className="plan-checks">
                    {mockExercise.confirms.map((c) => (
                      <div key={c.label} className="plan-checks__item">
                        <Checkbox checked={c.checked} />
                        <span>{c.label}</span>
                      </div>
                    ))}
                  </div>
                  <div className="plan-data-note">
                    <div className="plan-data-note__title">阶段目标</div>
                    {mockExercise.stageGoal}
                  </div>
                </div>
                <Button block icon={<RedoOutlined />} onClick={onRegenerate}>
                  重新生成运动指导
                </Button>
              </>
            )}

            {moduleKey === 'review' && (
              <div className="plan-card">
                <div className="plan-card__header">
                  <span className="plan-card__title">本页方案内容</span>
                </div>
                <div className="plan-quad plan-quad--half">
                  <div className="plan-quad__cell">
                    <div className="plan-quad__label">指导内容</div>
                    <div className="plan-quad__value">{mockRevisit.pageContent.guide}</div>
                  </div>
                  <div className="plan-quad__cell">
                    <div className="plan-quad__label">风险提示</div>
                    <div className="plan-quad__value plan-text--warn">{mockRevisit.pageContent.risk}</div>
                  </div>
                </div>
                <div className="plan-card__sub">{mockRevisit.pageContent.note}</div>
                <div className="plan-field__label plan-rail__gap">表单模板</div>
                <div className="plan-checks">
                  {mockRevisit.templates.map((t) => (
                    <div key={t} className="plan-checks__item">
                      <Checkbox checked />
                      <span>{t}</span>
                    </div>
                  ))}
                </div>
                <div className="plan-readonly-box plan-rail__gap">
                  <div className="plan-readonly-box__title">沟通方式</div>
                  <div className="plan-readonly-box__tip">{mockRevisit.channelNote}</div>
                </div>
                <div className="plan-ai-note plan-ai-note--block">✦ {mockRevisit.aiNote}</div>
              </div>
            )}

            {moduleKey === 'overview' && (
              <>
                <div className="plan-card">
                  <div className="plan-card__header">
                    <span className="plan-card__title">完善进度</span>
                  </div>
                  <div className="plan-detail__completeness-value">{m.completeness}%</div>
                  <Progress percent={m.completeness} showInfo={false} />
                  <div className="plan-field__label plan-rail__gap">待确认事项</div>
                  <div className="plan-todo-box">
                    <ol className="plan-todo-box__ordered">
                      {mockPlanTodos.map((t) => (
                        <li key={t}>{t}</li>
                      ))}
                    </ol>
                  </div>
                </div>
                <div className="plan-card">
                  <div className="plan-card__header">
                    <span className="plan-card__title">责任分工</span>
                  </div>
                  <div className="plan-rail__row">
                    <span className="plan-rail__label">健管师</span>
                    <span>{m.manager}</span>
                  </div>
                  <div className="plan-rail__row">
                    <span className="plan-rail__label">责任医生</span>
                    <span>{m.doctor}</span>
                  </div>
                  <div className="plan-rail__row">
                    <span className="plan-rail__label">医生审核</span>
                    <span className="plan-text--warn">待提交</span>
                  </div>
                  <div className="plan-readonly-box plan-rail__gap">
                    <div className="plan-readonly-box__title">方案版本</div>
                    <div className="plan-readonly-box__body">V0.1 AI草稿</div>
                    <div className="plan-readonly-box__tip">尚未提交医生审核</div>
                  </div>
                </div>
                <Button block icon={<RedoOutlined />} onClick={onRegenerate}>
                  重新生成方案
                </Button>
              </>
            )}
          </div>
        </div>

        <div className="plan-detail__actions">
          <Button onClick={() => message.success('草稿已保存')}>保存草稿</Button>
          {nextModule ? (
            <Button type="primary" onClick={() => setModuleKey(nextModule.key)}>
              下一项：{nextModule.name}
            </Button>
          ) : (
            <Button type="primary" onClick={onSubmit}>
              提交医生审核
            </Button>
          )}
        </div>
      </PageContainer>
    </div>
  )
}
