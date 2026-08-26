/**
 * 随访管理 - 执行随访（设计稿：通用电话模块 / 饮食与运动 / 按病加载问卷 / 结果处置）
 * 四步向导：1 通用信息 → 2 饮食运动 → 3 专病问卷（按已建专病档案依次加载）→ 4 结果处置
 * TODO: 问卷结构化接口 API v0.1 未定义；完成后调用 followupApi.completeFollowup（§6.5）
 */
import { useState } from 'react'
import { Button, Input, message } from 'antd'
import { CheckOutlined } from '@ant-design/icons'
import { useNavigate, useParams } from 'react-router-dom'
import PageContainer from '@/components/PageContainer'
import {
  mockDiseaseQuizList,
  mockExecuteMember,
  mockGoalEvidence,
  mockStep1,
  mockStep2,
  mockStep4,
} from './mock'
import './index.less'

const STEP_TITLES = ['通用信息', '饮食运动', '专病问卷', '结果处置']

/** 单选 pill 组（执行随访通用控件） */
function PillRadio(props: {
  label: string
  options: string[]
  value: string
  onChange: (v: string) => void
  required?: boolean
  hint?: string
}) {
  const { label, options, value, onChange, required, hint } = props
  return (
    <div className="fu-field">
      <div className="fu-field__label">
        {label}
        {required && <span className="fu-required"> *</span>}
        {hint && <span className="fu-field__hint">{hint}</span>}
      </div>
      <div className="fu-pills">
        {options.map((o) => (
          <span key={o} className={value === o ? 'fu-pill fu-pill--active' : 'fu-pill'} onClick={() => onChange(o)}>
            {o}
          </span>
        ))}
      </div>
    </div>
  )
}

export default function FollowupExecute() {
  const { id } = useParams()
  const navigate = useNavigate()
  const m = mockExecuteMember
  void id

  const [step, setStep] = useState(0)
  const [diseaseIdx, setDiseaseIdx] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({
    contactResult: '本人接通',
    identity: '通过',
    consent: '同意',
    answerer: '患者本人',
    reliability: '可靠',
    emergency: '均无',
    recentEvent: '均无',
    compliance: '规律',
    staple: '米饭为主',
    taste: '适中',
    intensity: '中度体力劳动',
    frequency: '3–4次/周',
    duration: '15–30分钟',
    exerciseType: '散步',
    exerciseNote: '',
    staplePerDay: '',
    staplePerMeal: '',
    result: '医生复核',
    understand: '理解并同意',
    nextDate: mockStep4.nextDate,
    method: mockStep4.method,
    summary: mockStep4.summary,
  })
  const set = (key: string) => (v: string) => setAnswers((a) => ({ ...a, [key]: v }))

  const quiz = mockDiseaseQuizList[diseaseIdx]
  const isLastDisease = diseaseIdx >= mockDiseaseQuizList.length - 1

  const onFinish = () => {
    // TODO: 接入后端后调用 followupApi.completeFollowup（§6.5）
    message.success('回访已完成，记录写入健康档案并生成下次待回访任务')
    navigate('/followup')
  }

  const step3Next = () => {
    if (!isLastDisease) {
      setDiseaseIdx((i) => i + 1)
    } else {
      setStep(3)
    }
  }

  return (
    <div className="fu-page">
      <PageContainer
        title="执行随访"
        description={
          step === 0
            ? `${m.name} · ${m.typeLabel}`
            : step === 1
              ? `${m.name} · 通用问卷 · 饮食与运动`
              : `步骤 ${step + 1} / 4 · ${STEP_TITLES[step]}`
        }
      >
        {/* 步骤条（pill 样式） */}
        <div className="fu-steps">
          {STEP_TITLES.map((t, i) => (
            <span
              key={t}
              className={
                i === step ? 'fu-step fu-step--active' : i < step ? 'fu-step fu-step--done' : 'fu-step'
              }
            >
              <span className="fu-step__index">{i < step ? <CheckOutlined /> : i + 1}</span>
              {t}
            </span>
          ))}
        </div>

        <div className="fu-execute">
          {/* 中：当前步骤表单 */}
          <div className="fu-card">
            {step === 0 && (
              <>
                <div className="fu-section__title">1. 联系结果与身份确认</div>
                <PillRadio label="本次联系结果" required options={mockStep1.contactResults} value={answers.contactResult} onChange={set('contactResult')} />
                <PillRadio label="身份核验" required options={mockStep1.identityChecks} value={answers.identity} onChange={set('identity')} />
                <PillRadio label="同意本次电话健康随访" required options={mockStep1.consents} value={answers.consent} onChange={set('consent')} />
                <div className="fu-section__title">2. 回答人与安全筛查</div>
                <PillRadio label="主要回答人" required options={mockStep1.answerers} value={answers.answerer} onChange={set('answerer')} />
                <PillRadio label="回答信息可靠性" required options={mockStep1.reliabilities} value={answers.reliability} onChange={set('reliability')} />
                <PillRadio label="患者现在有无紧急不适" required options={mockStep1.emergencies} value={answers.emergency} onChange={set('emergency')} />
                <div className="fu-section__title">3. 近期变化与方案执行</div>
                <PillRadio label="上次随访后发生的事件" required options={mockStep1.events} value={answers.recentEvent} onChange={set('recentEvent')} />
                <PillRadio label="近2周是否按医嘱执行" required options={mockStep1.compliance} value={answers.compliance} onChange={set('compliance')} />
              </>
            )}

            {step === 1 && (
              <>
                <div className="fu-section__title">4. 饮食情况</div>
                <PillRadio label="主食" required options={mockStep2.stapleTypes} value={answers.staple} onChange={set('staple')} />
                <div className="fu-field-grid">
                  <div className="fu-field">
                    <div className="fu-field__label">每日主食量</div>
                    <Input placeholder="请选择或输入（克/天）" value={answers.staplePerDay} onChange={(e) => set('staplePerDay')(e.target.value)} />
                  </div>
                  <div className="fu-field">
                    <div className="fu-field__label">每餐主食量</div>
                    <Input placeholder="请选择或输入（克/餐）" value={answers.staplePerMeal} onChange={(e) => set('staplePerMeal')(e.target.value)} />
                  </div>
                </div>
                <PillRadio label="饮食口味" required options={mockStep2.tastes} value={answers.taste} onChange={set('taste')} />
                <div className="fu-data-note fu-data-note--blue">
                  主食记录支持选择常用档位或手动录入；饮食口味用于后续管理方案和变化比较。
                </div>
                <div className="fu-section__title">5. 运动情况</div>
                <PillRadio label="劳动/活动强度" required hint="档案带入 · 如有变化，保存后同步更新健康档案" options={mockStep2.intensities} value={answers.intensity} onChange={set('intensity')} />
                <PillRadio label="运动频率" required options={mockStep2.frequencies} value={answers.frequency} onChange={set('frequency')} />
                <PillRadio label="每次运动时间" required options={mockStep2.durations} value={answers.duration} onChange={set('duration')} />
                <div className="fu-field-grid">
                  <div className="fu-field">
                    <div className="fu-field__label">主要运动方式（选填）</div>
                    <Input value={answers.exerciseType} onChange={(e) => set('exerciseType')(e.target.value)} />
                  </div>
                  <div className="fu-field">
                    <div className="fu-field__label">补充说明（选填）</div>
                    <Input placeholder="可记录行动不便或运动限制" value={answers.exerciseNote} onChange={(e) => set('exerciseNote')(e.target.value)} />
                  </div>
                </div>
                <div className="fu-data-note">
                  活动强度默认带入健康档案；发生变化时同步更新，供AI生成饮食与运动方案使用。
                </div>
              </>
            )}

            {step === 2 && (
              <>
                <div className="fu-quiz__head">
                  <span className="fu-field__label">本次按生效管理目标加载</span>
                  <div className="fu-quiz__tabs">
                    {mockDiseaseQuizList.map((d, i) => (
                      <span
                        key={d.key}
                        className={i === diseaseIdx ? 'fu-pill fu-pill--active' : 'fu-pill'}
                        onClick={() => setDiseaseIdx(i)}
                      >
                        {d.name} {d.index}
                      </span>
                    ))}
                  </div>
                  <span className="fu-quiz__evidence">{mockGoalEvidence.ready}</span>
                </div>
                {quiz.questions.map((q) => (
                  <PillRadio
                    key={q.question}
                    label={`${q.group}｜${q.question}`}
                    required
                    options={q.options}
                    value={answers[`quiz_${quiz.key}_${q.question}`] ?? q.answer}
                    onChange={set(`quiz_${quiz.key}_${q.question}`)}
                  />
                ))}
                {quiz.reading && (
                  <div className="fu-field-grid fu-field-grid--three">
                    <div className="fu-field">
                      <div className="fu-field__label">最近一次血压</div>
                      <Input value={quiz.reading.value} readOnly />
                    </div>
                    <div className="fu-field">
                      <div className="fu-field__label">测量时间</div>
                      <Input value={quiz.reading.time} readOnly />
                    </div>
                    <div className="fu-field">
                      <div className="fu-field__label">数据来源</div>
                      <Input value={quiz.reading.source} readOnly />
                    </div>
                  </div>
                )}
                <div className="fu-data-note fu-data-note--plain">
                  <span className="fu-field__label">按目标条件追问</span>
                  <div>{quiz.followUp}</div>
                </div>
                {quiz.nextDiseaseTip && (
                  <div className="fu-data-note fu-data-note--blue">{quiz.nextDiseaseTip}</div>
                )}
              </>
            )}

            {step === 3 && (
              <>
                <div className="fu-field__label">系统建议</div>
                <div className="fu-suggestion">
                  <div className="fu-suggestion__head">
                    <span className="fu-tag fu-tag--warning">{mockStep4.suggestion.level}</span>
                    <span className="fu-suggestion__text">{mockStep4.suggestion.text}</span>
                  </div>
                  <div className="fu-suggestion__basis">{mockStep4.suggestion.basis}</div>
                </div>
                <PillRadio label="本次处理结果" required options={mockStep4.results} value={answers.result} onChange={set('result')} />
                <PillRadio label="患者/照护者是否理解下一步安排" required options={mockStep4.understands} value={answers.understand} onChange={set('understand')} />
                <div className="fu-field-grid">
                  <div className="fu-field">
                    <div className="fu-field__label">下次随访日期</div>
                    <Input value={answers.nextDate} onChange={(e) => set('nextDate')(e.target.value)} />
                  </div>
                  <div className="fu-field">
                    <div className="fu-field__label">随访方式</div>
                    <Input value={answers.method} onChange={(e) => set('method')(e.target.value)} />
                  </div>
                </div>
                <div className="fu-field">
                  <div className="fu-field__label">
                    随访小结 <span className="fu-required">*</span>
                  </div>
                  <Input.TextArea rows={4} value={answers.summary} onChange={(e) => set('summary')(e.target.value)} />
                </div>
                <div className="fu-data-note">
                  <div className="fu-data-note__title">完成后自动更新</div>
                  {mockStep4.autoUpdate}
                </div>
              </>
            )}

            {/* 底部操作 */}
            <div className="fu-execute__actions">
              {step > 0 && (
                <Button onClick={() => (step === 2 && diseaseIdx > 0 ? setDiseaseIdx((i) => i - 1) : setStep((s) => s - 1))}>
                  上一步
                </Button>
              )}
              <Button onClick={() => message.success('草稿已保存')}>保存草稿</Button>
              {step === 0 && (
                <Button type="primary" onClick={() => setStep(1)}>
                  下一步：饮食运动
                </Button>
              )}
              {step === 1 && (
                <Button type="primary" onClick={() => setStep(2)}>
                  下一步：专病问卷
                </Button>
              )}
              {step === 2 && (
                <Button type="primary" onClick={step3Next}>
                  {isLastDisease ? '下一步：结果处置' : '保存并进入下一病'}
                </Button>
              )}
              {step === 3 && (
                <Button type="primary" onClick={onFinish}>
                  完成回访
                </Button>
              )}
            </div>
          </div>

          {/* 右：步骤侧栏 */}
          <div className="fu-execute__rail">
            {step === 0 && (
              <div className="fu-card">
                <div className="fu-field__label">服务对象</div>
                <div className="fu-member">
                  <div className="fu-member__name">
                    {m.name} {m.age}岁
                  </div>
                  <div className="fu-member__phone">{m.phone}</div>
                  <div className="fu-member__section">已建专病档案</div>
                  <div className="fu-member__tags">
                    {m.diseases.map((d) => (
                      <span key={d} className="fu-tag fu-tag--disease">
                        {d}
                      </span>
                    ))}
                  </div>
                  <div className="fu-member__section">管理目标</div>
                  {m.goals.map((g) => (
                    <div key={g} className="fu-member__goal">
                      {g}
                    </div>
                  ))}
                  <div className="fu-todo-box">
                    <div className="fu-todo-box__title">先完成急症筛查</div>
                    出现任一红旗项时，阻断常规问卷并提示紧急处置与医生升级。
                  </div>
                </div>
                <div className="fu-field">
                  <div className="fu-field__label">问卷加载逻辑</div>
                  <div className="fu-side-text">
                    通用模块只填写一次；下一步按已建专病档案依次加载高血压和糖尿病问卷。
                  </div>
                </div>
              </div>
            )}

            {step === 1 && (
              <div className="fu-card">
                <div className="fu-field__label">采集说明</div>
                {mockStep2.notes.map((n) => (
                  <div key={n.title} className="fu-side-note">
                    <div className={n.title === '通用问卷只收集一次' ? 'fu-side-note__title fu-text--green' : 'fu-side-note__title'}>
                      {n.title}
                    </div>
                    <div className="fu-side-text">{n.desc}</div>
                  </div>
                ))}
                <div className="fu-data-note fu-data-note--blue">{mockStep2.rule}</div>
              </div>
            )}

            {step === 2 && (
              <div className="fu-card">
                <div className="fu-field__label">生效目标与已有证据</div>
                {mockGoalEvidence.goals.map((g) => (
                  <div key={g.name} className="fu-side-note">
                    <div className="fu-side-text">{g.name}</div>
                    <div className="fu-side-note__evidence">{g.evidence}</div>
                  </div>
                ))}
                <div className="fu-side-note">
                  <div className="fu-side-text">用药依从目标</div>
                  <div className="fu-side-note__evidence">{mockGoalEvidence.medicationNote}</div>
                </div>
                <div className="fu-data-note">
                  <div className="fu-data-note__title">目标评价预览</div>
                  <div className="fu-preview__main">{mockGoalEvidence.preview.title}</div>
                  <div>{mockGoalEvidence.preview.sub}</div>
                  <div className="fu-preview__note">{mockGoalEvidence.preview.note}</div>
                </div>
                <div className="fu-field">
                  <div className="fu-field__label">四类目标证据映射</div>
                  <div className="fu-member__tags">
                    {mockGoalEvidence.diseaseMapping.map((d) => (
                      <span key={d} className="fu-tag fu-tag--plain">
                        {d}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="fu-data-note fu-data-note--blue">
                  <div className="fu-data-note__title">动态问卷规则</div>
                  {mockGoalEvidence.dynamicRules.map((r) => (
                    <div key={r}>{r}</div>
                  ))}
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="fu-card">
                <div className="fu-member__name">{m.name}</div>
                <div className="fu-member__phone">{m.typeLabel}</div>
                {mockStep4.summaryCard.map((s) => (
                  <div key={s.label} className="fu-rail__row">
                    <span className="fu-rail__label">{s.label}</span>
                    <span className={s.tone === 'warn' ? 'fu-text--orange' : undefined}>{s.value}</span>
                  </div>
                ))}
                <div className="fu-data-note fu-data-note--blue">
                  <div className="fu-data-note__title">保存前质控</div>
                  {mockStep4.qualityCheck.map((q) => (
                    <div key={q}>{q}</div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="fu-footnote">
          <span className="fu-footnote__label">交互说明</span>
          {step === 3
            ? '完成回访后逐项保存管理目标评价：达成、未达成或数据不足；新增证据写入健康档案并触发分层分级。'
            : step === 2
              ? '指标值优先读取患者端、设备或检查检验记录；仅在缺失时允许口述补录，并同时保存测量日期与来源。'
              : '正常路径默认展示常用选项；未接听、拒接等只保存联系记录，不把任务切换为第三种状态。'}
        </div>
      </PageContainer>
    </div>
  )
}
