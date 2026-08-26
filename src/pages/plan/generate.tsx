/**
 * 健康管理方案 - AI方案生成（设计稿：选择生成依据.png / 进度状态.png）
 * 步骤 1：确认长者、生成依据与方案模块；点击「开始AI生成」展示生成进度弹窗，
 * 完成后进入生成结果（方案详情）逐项核对完善
 * TODO: 生成接口 planApi.aiGeneratePlan（§5.1）为异步任务，进度轮询接口待后端定义；
 * 当前进度为本地模拟
 */
import { useEffect, useRef, useState } from 'react'
import { Button, Checkbox, Input, Modal, Progress, Steps } from 'antd'
import { CheckCircleFilled } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import PageContainer from '@/components/PageContainer'
import { mockGenerateBasis, mockGenerateModules, mockGenerateSteps, mockPlanMember } from './mock'
import './index.less'

/** AI 主题色（同 variables.less @color-ai；antd Progress 需要 JS 色值） */
const AI_COLOR = '#6d4fc2'

export default function PlanGenerate() {
  const navigate = useNavigate()
  const m = mockPlanMember
  const [modules, setModules] = useState<string[]>(mockGenerateModules.slice(0, 4))
  const [generating, setGenerating] = useState(false)
  const [progress, setProgress] = useState(0)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(
    () => () => {
      if (timerRef.current) clearInterval(timerRef.current)
    },
    [],
  )

  const toggleModule = (name: string) => {
    setModules((list) => (list.includes(name) ? list.filter((k) => k !== name) : [...list, name]))
  }

  const onStart = () => {
    // TODO: 接入后端后调用 planApi.aiGeneratePlan，返回任务 ID 后轮询进度
    setGenerating(true)
    setProgress(0)
    timerRef.current = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) {
          if (timerRef.current) clearInterval(timerRef.current)
          return 100
        }
        return p + 2
      })
    }, 60)
  }

  const done = progress >= 100
  /** 各步骤状态：done-已完成 doing-生成中 wait-等待 */
  const stepState = (index: number) => {
    const threshold = ((index + 1) / mockGenerateSteps.length) * 100
    if (progress >= threshold || done) return 'done'
    const prevThreshold = (index / mockGenerateSteps.length) * 100
    if (progress >= prevThreshold) return 'doing'
    return 'wait'
  }

  return (
    <div className="plan-page">
      <PageContainer
        title="AI方案生成"
        description="确认长者、生成依据与方案模块，AI将生成可编辑的健康管理方案"
      >
        <div className="plan-design__steps">
          <Steps
            current={0}
            items={[
              { title: '选择生成依据', description: '档案、目标与数据' },
              { title: 'AI生成方案', description: '生成个性化草稿' },
              { title: '完善并提交审核', description: '健管师检查后送审' },
            ]}
          />
        </div>

        {/* 会员条 */}
        <div className="plan-member">
          <div className="plan-member__main">
            <div>
              <div className="plan-member__name">
                {m.name}
                <span className="plan-member__meta">
                  {m.gender} · {m.age}岁 · {m.diseases.join(' / ')}
                </span>
              </div>
            </div>
            <div className="plan-member__conditions">
              {m.conditions.map((c) => (
                <span key={c.label} className={`plan-tag plan-tag--${c.tone}`}>
                  {c.label}
                </span>
              ))}
            </div>
          </div>
          <div className="plan-member__side">
            <div className="plan-member__item">
              <span className="plan-member__label">责任医生</span>
              <span>{m.doctor}</span>
            </div>
            <div className="plan-member__item">
              <span className="plan-member__label">健管师</span>
              <span>{m.manager}</span>
            </div>
          </div>
        </div>

        <div className="plan-generate__panels">
          {/* 左：生成依据 */}
          <div className="plan-card">
            <div className="plan-card__header">
              <span className="plan-card__title">生成依据</span>
              <span className="plan-card__sub">AI读取以下信息生成方案，原始数据不会被复制修改</span>
            </div>
            {mockGenerateBasis.map((b) => (
              <div key={b.key} className="plan-basis">
                <CheckCircleFilled className="plan-basis__icon" />
                <div className="plan-basis__body">
                  <div className="plan-basis__name">{b.name}</div>
                  <div className="plan-basis__desc">{b.desc}</div>
                </div>
                <span className="plan-basis__meta">{b.meta}</span>
              </div>
            ))}
          </div>

          {/* 右：生成设置 */}
          <div className="plan-card">
            <div className="plan-card__header">
              <span className="plan-card__title">生成设置</span>
            </div>
            <div className="plan-field">
              <div className="plan-field__label">管理周期</div>
              <Input value={`3个月  ${m.periodStart} 至 ${m.periodEnd}`} readOnly />
            </div>
            <div className="plan-field">
              <div className="plan-field__label">方案模块</div>
              <div className="plan-modules">
                {mockGenerateModules.map((name) => (
                  <div
                    key={name}
                    className={
                      modules.includes(name) ? 'plan-module plan-module--active' : 'plan-module'
                    }
                    onClick={() => toggleModule(name)}
                  >
                    <Checkbox checked={modules.includes(name)} />
                    <span>{name}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="plan-ai-note">
              ✦ AI会结合疾病、目标和近期趋势生成建议，所有内容均需人工确认。
            </div>
          </div>
        </div>

        <div className="plan-generate__actions">
          <Button onClick={() => navigate(-1)}>取消</Button>
          <Button type="primary" disabled={modules.length === 0} onClick={onStart}>
            ✦ 开始AI生成
          </Button>
        </div>

        {/* 生成进度弹窗（设计稿：进度状态.png） */}
        <Modal open={generating} footer={null} closable={false} centered width={520}>
          <div className="plan-progress">
            <div className="plan-progress__icon">✦</div>
            <div className="plan-progress__title">正在生成健康管理方案</div>
            <div className="plan-progress__sub">AI正在综合长者的健康信息，请稍候</div>
            <Progress
              percent={progress}
              strokeColor={AI_COLOR}
              showInfo={false}
              className="plan-progress__bar"
            />
            <div className="plan-progress__percent">{progress}%</div>
            <div className="plan-progress__steps">
              {mockGenerateSteps.map((s, i) => {
                const state = stepState(i)
                return (
                  <div key={s} className="plan-progress-step">
                    <span className={`plan-progress-step__icon plan-progress-step__icon--${state}`}>
                      {state === 'done' ? '✓' : state === 'doing' ? '…' : i + 1}
                    </span>
                    <span className="plan-progress-step__name">{s}</span>
                    <span className={`plan-progress-step__state plan-progress-step__state--${state}`}>
                      {state === 'done' ? '已完成' : state === 'doing' ? '生成中' : '等待'}
                    </span>
                  </div>
                )
              })}
            </div>
            <div className="plan-progress__note">
              AI生成结果需要由健管师逐项核对，提交后再由责任医生审核。
            </div>
            <Button
              type="primary"
              className="plan-progress__cta"
              disabled={!done}
              onClick={() => navigate(`/plan/${m.id}`)}
            >
              查看生成结果
            </Button>
          </div>
        </Modal>
      </PageContainer>
    </div>
  )
}
