/**
 * 管理目标 - 发起目标制定（设计稿：健管师_1.png）
 * 健管师发起目标制定任务，由责任医生在工作台完成制定并确认生效
 * TODO: 发起目标制定接口 API v0.1 未定义，当前为本地 mock 提交
 */
import { useState } from 'react'
import { Button, Checkbox, DatePicker, Input, Select, message } from 'antd'
import { useNavigate } from 'react-router-dom'
import PageContainer from '@/components/PageContainer'
import GoalMemberBar from './member-bar'
import { mockCreateGuidelines, mockGoalMember, mockGoalReasons } from './mock'
import './index.less'

export default function GoalCreate() {
  const navigate = useNavigate()
  const [doctor, setDoctor] = useState<string>(mockGoalMember.doctor)
  const [deadline, setDeadline] = useState<string>('2026-08-14 18:00')
  const [reasons, setReasons] = useState<string[]>(['first'])
  const [remark, setRemark] = useState('')

  const toggleReason = (key: string) => {
    setReasons((list) => (list.includes(key) ? list.filter((k) => k !== key) : [...list, key]))
  }

  const onSubmit = () => {
    if (!doctor) {
      message.warning('请选择责任医生')
      return
    }
    if (!deadline) {
      message.warning('请选择建议完成时间')
      return
    }
    if (reasons.length === 0) {
      message.warning('请选择发起原因')
      return
    }
    // TODO: 接入后端后调用发起目标制定接口
    message.success('已提交，将在医生工作台生成「制定管理目标」待办')
    navigate('/goal')
  }

  return (
    <div className="goal-page">
      <PageContainer
        title="发起目标制定"
        description="由健管师发起，责任医生制定并确认临床目标值后生效"
      >
        <GoalMemberBar />

        <div className="goal-create__panels">
          {/* 左：发起表单 */}
          <div className="goal-card">
            <div className="goal-card__header">
              <span className="goal-card__title">发起信息</span>
            </div>

            <div className="goal-field">
              <div className="goal-field__label">
                责任医生 <span className="goal-required">*</span>
              </div>
              <Select
                className="goal-field__control"
                value={doctor}
                onChange={setDoctor}
                options={['王医生', '李医生', '周医生', '陈医生'].map((d) => ({ value: d, label: d }))}
                placeholder="选择负责制定目标的医生"
              />
            </div>

            <div className="goal-field">
              <div className="goal-field__label">
                建议完成时间 <span className="goal-required">*</span>
              </div>
              <DatePicker
                className="goal-field__control"
                showTime={{ format: 'HH:mm' }}
                format="YYYY-MM-DD HH:mm"
                placeholder="选择建议完成时间"
                onChange={(_, s) => setDeadline(typeof s === 'string' ? s : '')}
              />
              <div className="goal-field__tip">当前填写：{deadline || '—'}</div>
            </div>

            <div className="goal-field">
              <div className="goal-field__label">
                发起原因 <span className="goal-required">*</span>（可多选）
              </div>
              <div className="goal-reasons">
                {mockGoalReasons.map((r) => (
                  <div
                    key={r.key}
                    className={
                      reasons.includes(r.key) ? 'goal-reason goal-reason--active' : 'goal-reason'
                    }
                    onClick={() => toggleReason(r.key)}
                  >
                    <Checkbox checked={reasons.includes(r.key)} />
                    <div>
                      <div className="goal-reason__label">{r.label}</div>
                      <div className="goal-reason__desc">{r.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="goal-field">
              <div className="goal-field__label">系统自动附带</div>
              <div className="goal-auto-box">
                <div>专病档案：高血压、糖尿病</div>
                <div>当前分层：{mockGoalMember.level}</div>
                <div>近期异常：{mockGoalMember.recentAbnormal.join('、')}</div>
                <div>已有数据：{mockGoalMember.dataSources.join('、')}</div>
              </div>
            </div>

            <div className="goal-field">
              <div className="goal-field__label">补充说明（选填）</div>
              <Input.TextArea
                rows={3}
                value={remark}
                onChange={(e) => setRemark(e.target.value)}
                placeholder="补充会员近期情况、家属诉求等，帮助医生更快完成目标制定"
              />
            </div>

            <div className="goal-create__actions">
              <Button onClick={() => navigate(-1)}>取消</Button>
              <Button type="primary" onClick={onSubmit}>
                提交医生制定
              </Button>
            </div>
          </div>

          {/* 右：责任边界说明 */}
          <div className="goal-create__side">
            <div className="goal-card">
              <div className="goal-card__header">
                <span className="goal-card__title">健管师可以做什么</span>
              </div>
              <ul className="goal-guideline">
                {mockCreateGuidelines.canDo.map((t) => (
                  <li key={t}>{t}</li>
                ))}
              </ul>
            </div>
            <div className="goal-card">
              <div className="goal-card__header">
                <span className="goal-card__title">不能做什么</span>
              </div>
              <ul className="goal-guideline goal-guideline--danger">
                {mockCreateGuidelines.canNotDo.map((t) => (
                  <li key={t}>{t}</li>
                ))}
              </ul>
            </div>
            <div className="goal-after-submit">{mockCreateGuidelines.afterSubmit}</div>
          </div>
        </div>
      </PageContainer>
    </div>
  )
}
