/**
 * 健康管理方案 - 返修方案并重新提交（设计稿：返修并重新提交.png）
 * 健管师逐项响应医生退回意见，形成新草稿版本后重新提交同一责任医生审核
 * TODO: 返修提交接口 API v0.1 未定义（可参考 §5.2 confirm 的 edits 入参），当前为本地 mock
 */
import { useState } from 'react'
import { Button, Checkbox, Input, message } from 'antd'
import { useNavigate, useParams } from 'react-router-dom'
import PageContainer from '@/components/PageContainer'
import { mockPlanRevise } from './mock'
import './index.less'

export default function PlanRevise() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [note, setNote] = useState(mockPlanRevise.note)
  const r = mockPlanRevise

  const onSubmit = () => {
    if (!note.trim()) {
      message.warning('请填写返修说明')
      return
    }
    // TODO: 接入后端后调用返修提交接口（形成新草稿版本，状态→待医生复审）
    message.success('已重新提交，状态变为「待医生复审」')
    navigate(`/plan/${id ?? 1}/review`)
  }

  return (
    <div className="plan-page">
      <PageContainer
        title="返修方案并重新提交"
        description="逐项响应医生意见，形成新草稿版本后重新提交同一责任医生审核"
      >
        <div className="plan-returned">
          {/* 左：修改清单 */}
          <div className="plan-card">
            <div className="plan-card__header">
              <span className="plan-card__title">修改清单</span>
            </div>
            {r.changes.map((c) => (
              <div key={c.name} className="plan-module-card plan-returned__module">
                <div>
                  <div className="plan-module-card__title">{c.name}</div>
                  <div className="plan-module-card__desc">{c.desc}</div>
                </div>
                <span className="plan-tag plan-tag--green">已完成</span>
              </div>
            ))}
            <div className="plan-field">
              <div className="plan-field__label">
                返修说明 <span className="plan-required">*</span>
              </div>
              <Input.TextArea rows={4} value={note} onChange={(e) => setNote(e.target.value)} />
            </div>
            <div className="plan-rail__row">
              <span className="plan-rail__label">本次版本</span>
              <span className="plan-revise__version">{r.version}</span>
            </div>
          </div>

          {/* 右：重新提交检查 */}
          <div className="plan-detail__rail">
            <div className="plan-card">
              <div className="plan-card__header">
                <span className="plan-card__title">重新提交检查</span>
              </div>
              <div className="plan-checks">
                {r.checks.map((c) => (
                  <div key={c} className="plan-checks__item">
                    <Checkbox checked />
                    <span>{c}</span>
                  </div>
                ))}
              </div>
              <div className="plan-data-note plan-returned__assignee">
                <div className="plan-data-note__title">提交后</div>
                {r.afterNote}
              </div>
            </div>
            <div className="plan-revise__actions">
              <Button block onClick={() => message.success('草稿已保存')}>
                保存草稿
              </Button>
              <Button type="primary" block onClick={onSubmit}>
                重新提交审核
              </Button>
            </div>
          </div>
        </div>
      </PageContainer>
    </div>
  )
}
