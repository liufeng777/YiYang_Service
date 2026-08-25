/**
 * 管理目标 - 制定管理目标（设计稿：从目标库选择 / 设置个体值与周期 / 确认生效）
 * 医生视角三步向导：1 选择目标 → 2 设置个体目标 → 3 确认生效
 * TODO: 目标库 / 确认生效接口 API v0.1 未定义，当前为本地 mock；
 * 接入后创建目标调用 goalApi.createGoal（入参对齐 §5.4）
 */
import { useMemo, useState } from 'react'
import { Button, Checkbox, Input, Steps, message } from 'antd'
import { useNavigate } from 'react-router-dom'
import PageContainer from '@/components/PageContainer'
import GoalMemberBar from './member-bar'
import {
  GOAL_PRIORITY_TEXT,
  mockGoalDetails,
  mockGoalLibrary,
  mockGoalMember,
  mockGoalTemplates,
} from './mock'
import './index.less'

/** 步骤 2 可编辑字段 */
interface GoalFormValue {
  target: string
  evalPeriod: string
  planEvalDate: string
  patientAction: string
  managerTask: string
}

const STEP_TITLES = ['选择目标', '设置个体目标', '确认生效']

export default function GoalDesign() {
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [libKey, setLibKey] = useState('recommended')
  const [selectedIds, setSelectedIds] = useState<string[]>(mockGoalTemplates.map((t) => t.id))
  const [currentIndex, setCurrentIndex] = useState(0)
  const [formValues, setFormValues] = useState<Record<string, GoalFormValue>>(() =>
    Object.fromEntries(
      mockGoalDetails.map((d) => [
        d.goalId,
        {
          target: d.target,
          evalPeriod: d.evalPeriod,
          planEvalDate: d.planEvalDate,
          patientAction: d.patientAction,
          managerTask: d.managerTask,
        },
      ]),
    ),
  )

  const selectedTemplates = useMemo(
    () => mockGoalTemplates.filter((t) => selectedIds.includes(t.id)),
    [selectedIds],
  )

  const toggleTemplate = (id: string) => {
    setSelectedIds((list) => (list.includes(id) ? list.filter((k) => k !== id) : [...list, id]))
  }

  const currentTemplate = selectedTemplates[currentIndex]
  const currentDetail = currentTemplate
    ? mockGoalDetails.find((d) => d.goalId === currentTemplate.id)
    : undefined
  const currentForm = currentTemplate ? formValues[currentTemplate.id] : undefined

  const setForm = (patch: Partial<GoalFormValue>) => {
    if (!currentTemplate) return
    setFormValues((v) => ({ ...v, [currentTemplate.id]: { ...v[currentTemplate.id], ...patch } }))
  }

  const onNextItem = () => {
    if (currentIndex < selectedTemplates.length - 1) {
      setCurrentIndex((i) => i + 1)
    } else {
      setStep(2)
    }
  }

  const onConfirm = () => {
    // TODO: 接入后端后调用 goalApi.createGoal（POST /members/:id/goals，入参对齐 §5.4）
    message.success('管理目标已确认生效，将返回健管师目标列表开始跟踪')
    navigate('/goal')
  }

  const coreCount = selectedTemplates.filter((t) => t.priority === 'core').length

  return (
    <div className="goal-page">
      <PageContainer title="制定管理目标" description="临床目标值由责任医生确认；确认生效后自动进入跟踪与评价">
        <div className="goal-design__steps">
          <Steps current={step} items={STEP_TITLES.map((title) => ({ title }))} />
        </div>

        <GoalMemberBar />

        {/* ===== 步骤 1：选择目标 ===== */}
        {step === 0 && (
          <div className="goal-pick">
            {/* 左：目标库 */}
            <div className="goal-card goal-pick__lib">
              <div className="goal-card__header">
                <span className="goal-card__title">目标库</span>
              </div>
              {mockGoalLibrary.map((c) => (
                <div
                  key={c.key}
                  className={libKey === c.key ? 'goal-lib-item goal-lib-item--active' : 'goal-lib-item'}
                  onClick={() => setLibKey(c.key)}
                >
                  <span>{c.name}</span>
                  <span className="goal-lib-item__count">{c.count}</span>
                </div>
              ))}
            </div>

            {/* 中：推荐目标组合 */}
            <div className="goal-card goal-pick__list">
              <div className="goal-card__header">
                <div>
                  <span className="goal-card__title">推荐目标组合</span>
                  <span className="goal-tag goal-tag--orange goal-pick__hint">建议 5-7 个</span>
                </div>
                <span className="goal-card__sub">
                  {mockGoalMember.diseases[1].name}（{mockGoalMember.level}）：
                  {mockGoalMember.recentAbnormal[0]} 未达标
                </span>
              </div>
              {mockGoalTemplates.map((t) => (
                <div
                  key={t.id}
                  className={
                    selectedIds.includes(t.id) ? 'goal-template goal-template--active' : 'goal-template'
                  }
                  onClick={() => toggleTemplate(t.id)}
                >
                  <Checkbox checked={selectedIds.includes(t.id)} />
                  <div className="goal-template__body">
                    <div className="goal-template__name">
                      {t.name}
                      <span className={`goal-tag goal-tag--priority-${t.priority}`}>
                        {GOAL_PRIORITY_TEXT[t.priority]}
                      </span>
                    </div>
                    <div className="goal-template__meta">
                      {t.category} · {t.baseline}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* 右：已选目标 */}
            <div className="goal-card goal-pick__selected">
              <div className="goal-card__header">
                <span className="goal-card__title">已选目标</span>
              </div>
              <div className="goal-pick__count">{selectedTemplates.length}</div>
              <div className="goal-pick__breakdown">
                病种主目标 {coreCount} / 常规目标 {selectedTemplates.length - coreCount}
              </div>
              <div className="goal-pick__principle">
                选择原则：核心指标 2-3 个，重大安全事件单独评价，行为目标不超过 3 个
              </div>
              <div className="goal-pick__safety-note">
                重大安全事件单独评价说明：安全事件不与其他指标合并计算达标率，发生任一事件需单独处理并记录
              </div>
              <div className="goal-pick__footer">
                <Button type="primary" disabled={selectedTemplates.length === 0} onClick={() => setStep(1)}>
                  下一步：设置个体目标
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* ===== 步骤 2：设置个体目标 ===== */}
        {step === 1 && currentTemplate && currentDetail && currentForm && (
          <>
            <div className="goal-edit">
              {/* 左：已选目标列表 */}
              <div className="goal-card goal-edit__nav">
                <div className="goal-card__header">
                  <span className="goal-card__title">已选目标（{selectedTemplates.length}）</span>
                </div>
                {selectedTemplates.map((t, i) => (
                  <div
                    key={t.id}
                    className={i === currentIndex ? 'goal-edit-item goal-edit-item--active' : 'goal-edit-item'}
                    onClick={() => setCurrentIndex(i)}
                  >
                    <span className="goal-edit-item__index">{i + 1}</span>
                    <div>
                      <div className="goal-edit-item__name">{t.name}</div>
                      <div className="goal-edit-item__meta">{t.category}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* 右：目标编辑卡 */}
              <div className="goal-card goal-edit__form">
                <div className="goal-card__header">
                  <div>
                    <span className="goal-tag goal-tag--blue">{currentDetail.categoryTag}</span>
                    <span className="goal-tag goal-tag--priority-core goal-edit__priority-tag">
                      {currentDetail.priorityTag}
                    </span>
                  </div>
                </div>
                <div className="goal-edit__name">{currentTemplate.name}</div>
                <div className="goal-edit__code">
                  目标编码 {currentDetail.code} · 由医生确认关键目标值
                </div>

                <div className="goal-edit__grid">
                  <div className="goal-edit__cell">
                    <div className="goal-field__label">基线值</div>
                    <div className="goal-edit__value">
                      {currentDetail.baselineValue}
                      {currentDetail.unit}
                    </div>
                  </div>
                  <div className="goal-edit__cell">
                    <div className="goal-field__label">单位</div>
                    <div className="goal-edit__value">{currentDetail.unit || '—'}</div>
                  </div>
                  <div className="goal-edit__cell">
                    <div className="goal-field__label">基线日期</div>
                    <div className="goal-edit__value">{currentDetail.baselineDate}</div>
                  </div>
                  <div className="goal-edit__cell">
                    <div className="goal-field__label">数据来源</div>
                    <div className="goal-edit__value">{currentDetail.dataSource}</div>
                  </div>
                  <div className="goal-edit__cell">
                    <div className="goal-field__label">
                      目标上限 <span className="goal-required">*</span>
                    </div>
                    <Input value={currentForm.target} onChange={(e) => setForm({ target: e.target.value })} />
                  </div>
                  <div className="goal-edit__cell">
                    <div className="goal-field__label">
                      评价周期 <span className="goal-required">*</span>
                    </div>
                    <Input
                      value={currentForm.evalPeriod}
                      onChange={(e) => setForm({ evalPeriod: e.target.value })}
                    />
                  </div>
                  <div className="goal-edit__cell">
                    <div className="goal-field__label">计划评价日期</div>
                    <Input
                      value={currentForm.planEvalDate}
                      onChange={(e) => setForm({ planEvalDate: e.target.value })}
                    />
                  </div>
                  <div className="goal-edit__cell">
                    <div className="goal-field__label">最低数据要求</div>
                    <div className="goal-edit__value">{currentDetail.minData}</div>
                  </div>
                </div>

                <div className="goal-auto-box goal-edit__rule">自动评价规则：{currentDetail.autoRule}</div>

                <div className="goal-field">
                  <div className="goal-field__label">患者行动计划</div>
                  <Input
                    value={currentForm.patientAction}
                    onChange={(e) => setForm({ patientAction: e.target.value })}
                  />
                </div>
                <div className="goal-field">
                  <div className="goal-field__label">健管师任务</div>
                  <Input
                    value={currentForm.managerTask}
                    onChange={(e) => setForm({ managerTask: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <div className="goal-edit__footer">
              <span className="goal-edit__next-hint">
                {currentIndex < selectedTemplates.length - 1
                  ? `下一项：${selectedTemplates[currentIndex + 1].name}`
                  : '已是最后一项，下一步进入确认'}
              </span>
              <div className="goal-edit__footer-actions">
                <Button onClick={() => message.success('草稿已保存')}>保存草稿</Button>
                <Button type="primary" onClick={onNextItem}>
                  {currentIndex < selectedTemplates.length - 1 ? '下一项' : '下一步：确认管理目标'}
                </Button>
              </div>
            </div>
          </>
        )}

        {/* ===== 步骤 3：确认生效 ===== */}
        {step === 2 && (
          <div className="goal-confirm">
            {/* 左：目标组合 */}
            <div className="goal-confirm__goals">
              <div className="goal-card">
                <div className="goal-card__header">
                  <span className="goal-card__title">
                    {mockGoalMember.name} · 目标组合（{selectedTemplates.length}项）
                  </span>
                </div>
                {(['关键指标', '重大安全事件', '用药依从', '饮食', '运动'] as const).map((cat) => {
                  const items = selectedTemplates.filter((t) => t.category === cat)
                  if (items.length === 0) return null
                  return (
                    <div key={cat} className="goal-confirm-group">
                      <div className="goal-confirm-group__title">{cat}</div>
                      {items.map((t) => {
                        const form = formValues[t.id]
                        const detail = mockGoalDetails.find((d) => d.goalId === t.id)
                        return (
                          <div key={t.id} className="goal-confirm-item">
                            <div className="goal-confirm-item__name">
                              {t.name}
                              <span className={`goal-tag goal-tag--priority-${t.priority}`}>
                                {GOAL_PRIORITY_TEXT[t.priority]}
                              </span>
                            </div>
                            <div className="goal-confirm-item__meta">
                              目标：{form?.target}
                              {detail?.unit && !form?.target.includes(detail.unit) ? detail.unit : ''} ·
                              评价周期：{form?.evalPeriod}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )
                })}
              </div>
            </div>

            {/* 右：确认摘要 */}
            <div className="goal-card goal-confirm__summary">
              <div className="goal-card__header">
                <span className="goal-card__title">确认摘要</span>
              </div>
              <div className="goal-confirm__row">
                <span className="goal-confirm__label">目标数量</span>
                <span>{selectedTemplates.length} 项</span>
              </div>
              <div className="goal-confirm__row">
                <span className="goal-confirm__label">生效日期</span>
                <span>{mockGoalMember.periodStart}</span>
              </div>
              <div className="goal-confirm__row">
                <span className="goal-confirm__label">阶段评价</span>
                <span>{mockGoalMember.periodEnd}</span>
              </div>
              <div className="goal-confirm__section">生效后自动执行</div>
              <ul className="goal-guideline">
                <li>进入健管师目标列表并开始跟踪</li>
                <li>按评价周期生成评价待办</li>
                <li>按最低数据要求生成数据补充提醒</li>
                <li>重大安全事件单独评价并触发预警</li>
                <li>患者行动计划与健管师任务同步到随访</li>
              </ul>
              <div className="goal-confirm__boundary">
                责任边界：临床目标值由责任医生确认；健管师负责执行跟踪与数据记录，不能修改临床目标值
              </div>
              <div className="goal-confirm__actions">
                <Button onClick={() => setStep(1)}>返回修改</Button>
                <Button type="primary" onClick={onConfirm}>
                  确认并生效
                </Button>
              </div>
            </div>
          </div>
        )}
      </PageContainer>
    </div>
  )
}
