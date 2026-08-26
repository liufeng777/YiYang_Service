/**
 * 随访管理 - 创建健康预警回访（设计稿：手动创建回访.png）
 * 由健管师判断患者端异常指标是否需要追加一次回访；是否创建由健管师人工确认
 * TODO: 接入后端后调用 followupApi.createFollowup（§6.4，source_type=9 手动）
 */
import { useState } from 'react'
import { Button, Input, message, Select } from 'antd'
import { useNavigate } from 'react-router-dom'
import PageContainer from '@/components/PageContainer'
import { mockCreateRules, mockWarningForCreate } from './mock'
import './index.less'

export default function FollowupCreate() {
  const navigate = useNavigate()
  const w = mockWarningForCreate
  const [needCreate, setNeedCreate] = useState(true)
  const [planTime, setPlanTime] = useState('今天 10:30')
  const [template, setTemplate] = useState('糖尿病电话随访')
  const [focus, setFocus] = useState('确认血糖测量情境与读数，筛查低血糖/高血糖急症表现，了解近期用药和饮食执行情况。')
  const [doctorAssist, setDoctorAssist] = useState('回访后按结果判断')

  const onSubmit = () => {
    if (!needCreate) {
      message.success('已记录：已知且已处理，不创建回访任务')
      navigate('/followup')
      return
    }
    if (!focus.trim()) {
      message.warning('请填写本次关注重点')
      return
    }
    // TODO: 接入后端后调用 followupApi.createFollowup（§6.4）
    message.success('回访任务已创建，进入「待回访」列表')
    navigate('/followup')
  }

  return (
    <div className="fu-page">
      <PageContainer
        title="创建健康预警回访"
        description="由健管师判断患者端异常指标是否需要追加一次回访"
      >
        {/* 预警卡 */}
        <div className="fu-create__warning">
          <div className="fu-create__warning-main">
            <div className="fu-create__warning-head">
              <span className="fu-tag fu-tag--warning">{w.level}</span>
              <span className="fu-create__warning-title">{w.title}</span>
            </div>
            <div className="fu-create__warning-desc">{w.desc}</div>
            <div className="fu-create__warning-meta">{w.meta}</div>
          </div>
          <div className="fu-data-note fu-create__duplicate">
            <div className="fu-data-note__title">避免重复回访</div>
            {w.duplicateTip}
          </div>
        </div>

        <div className="fu-create__panels">
          {/* 左：表单 */}
          <div className="fu-card">
            <div className="fu-field">
              <div className="fu-field__label">
                是否需要创建回访任务 <span className="fu-required">*</span>
              </div>
              <div className="fu-pills">
                <span
                  className={needCreate ? 'fu-pill fu-pill--active' : 'fu-pill'}
                  onClick={() => setNeedCreate(true)}
                >
                  需要回访
                </span>
                <span
                  className={!needCreate ? 'fu-pill fu-pill--active' : 'fu-pill'}
                  onClick={() => setNeedCreate(false)}
                >
                  已知且已处理，不创建
                </span>
              </div>
            </div>

            <div className="fu-field-grid">
              <div className="fu-field">
                <div className="fu-field__label">回访类型</div>
                <Input value="健康预警回访（固定）" readOnly />
              </div>
              <div className="fu-field">
                <div className="fu-field__label">计划回访时间</div>
                <Input value={planTime} onChange={(e) => setPlanTime(e.target.value)} />
              </div>
              <div className="fu-field">
                <div className="fu-field__label">关联预警</div>
                <Input value="空腹血糖 9.8 mmol/L" readOnly />
              </div>
              <div className="fu-field">
                <div className="fu-field__label">回访模板</div>
                <Select
                  value={template}
                  onChange={setTemplate}
                  options={['糖尿病电话随访', '高血压电话随访', '通用电话随访'].map((t) => ({ value: t, label: t }))}
                />
              </div>
            </div>

            <div className="fu-field">
              <div className="fu-field__label">
                本次关注重点 <span className="fu-required">*</span>
              </div>
              <Input.TextArea rows={3} value={focus} onChange={(e) => setFocus(e.target.value)} />
            </div>

            <div className="fu-field">
              <div className="fu-field__label">需要医生协同</div>
              <div className="fu-pills">
                {['暂不需要', '回访后按结果判断', '立即通知医生'].map((o) => (
                  <span
                    key={o}
                    className={doctorAssist === o ? 'fu-pill fu-pill--active' : 'fu-pill'}
                    onClick={() => setDoctorAssist(o)}
                  >
                    {o}
                  </span>
                ))}
              </div>
            </div>

            <div className="fu-data-note fu-data-note--blue">
              <div className="fu-data-note__title">创建后</div>
              任务进入当前健管师的「待回访」列表，仍只使用待回访 / 已回访两种状态。
            </div>

            <div className="fu-create__actions">
              <Button onClick={() => navigate(-1)}>取消</Button>
              <Button type="primary" onClick={onSubmit}>
                创建回访任务
              </Button>
            </div>
          </div>

          {/* 右：规则说明 */}
          <div className="fu-card fu-create__side">
            <div className="fu-field">
              <div className="fu-field__label">什么时候创建</div>
              <ul className="fu-side-list">
                {mockCreateRules.whenCreate.map((t) => (
                  <li key={t}>{t}</li>
                ))}
              </ul>
            </div>
            <div className="fu-field">
              <div className="fu-field__label">什么时候不创建</div>
              <ul className="fu-side-list">
                {mockCreateRules.whenNotCreate.map((t) => (
                  <li key={t}>{t}</li>
                ))}
              </ul>
            </div>
            <div className="fu-todo-box">
              <div className="fu-todo-box__title">一期规则</div>
              {mockCreateRules.rule}
            </div>
            <div className="fu-field">
              <div className="fu-field__label">任务归属</div>
              <div className="fu-side-text">{mockCreateRules.ownership}</div>
            </div>
          </div>
        </div>

        <div className="fu-footnote">
          <span className="fu-footnote__label">交互说明</span>
          入口可从“我的随访”顶部或患者健康预警详情进入；创建完成后返回待回访列表。
        </div>
      </PageContainer>
    </div>
  )
}
