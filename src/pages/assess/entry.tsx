/**
 * AI长者健康力测评 - 评测录入（设计稿：W-HEALTH-P1-03 / P1-03A 完成检查 / P1-03B C端同步原始答案）
 * ?mode=sync 时为 C端自主测评原始答案只读视图
 * TODO: 接入后端后对齐 API §4.2 评估详情（问卷/答案）
 */
import { useState } from 'react'
import { Button, Input, Modal, Progress, Radio, message } from 'antd'
import { CheckCircleFilled, LeftOutlined, RightOutlined } from '@ant-design/icons'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import PageContainer from '@/components/PageContainer'
import {
  mockEntryCheck,
  mockEntryProgress,
  mockEntryQuestions,
  mockEntrySections,
} from './mock'
import './index.less'

/** 完成检查 Modal（P1-03A） */
function CheckModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const c = mockEntryCheck
  return (
    <Modal title="完成检查" open={open} onCancel={onClose} footer={null} width={560}>
      <div className="as-check">
        <span className="as-tag as-tag--pending">尚未通过</span>
        <div className="as-check__block as-check__block--warn">
          <div className="as-check__block-title">必填项缺失 {c.requiredMissing.count} 项</div>
          {c.requiredMissing.items.map((it) => (
            <div key={it} className="as-check__block-item">
              {it}
            </div>
          ))}
        </div>
        <div className="as-check__block as-check__block--danger">
          <div className="as-check__block-title">逻辑冲突 {c.logicConflict.count} 项</div>
          {c.logicConflict.items.map((it) => (
            <div key={it} className="as-check__block-item">
              {it}
            </div>
          ))}
        </div>
        <div className="as-check__block as-check__block--ok">
          <div className="as-check__block-title">评分口径</div>
          依据已确认评测规则自动计算。不会把不同量表得分简单相加形成总分。
        </div>
        <div className="as-check__actions">
          <Button onClick={onClose}>返回补充</Button>
          <Button type="primary" onClick={() => message.info('仍有未完成项，请补充后再提交（mock）')}>
            再次检查
          </Button>
        </div>
      </div>
    </Modal>
  )
}

export default function AssessEntry() {
  const { id } = useParams()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const readonly = searchParams.get('mode') === 'sync'
  const [answers, setAnswers] = useState<Record<string, string>>(() =>
    Object.fromEntries(
      mockEntryQuestions.filter((q) => q.answer).map((q) => [q.id, q.answer as string]),
    ),
  )
  const [active, setActive] = useState('quality')
  const [checkOpen, setCheckOpen] = useState(false)
  const p = mockEntryProgress
  const sections = mockEntrySections.map((s) => ({ ...s, active: s.key === active }))

  return (
    <PageContainer
      title={readonly ? 'C端同步原始答案' : '健康力测评录入'}
      description={
        readonly
          ? `张桂芳 · 67岁｜《居家快速测评表 V1.0》｜C端自主测评 · ${p.autoSaved.replace('刚刚已保存', '08-19 10:26 已同步')}`
          : `张桂芳 · 67岁｜《专业健康力评测表 V1.0》｜${p.source}`
      }
    >
      <div className="as-entry">
        {/* 左：评测目录 */}
        <div className="as-card as-entry__nav">
          <div className="as-card__header">
            <span className="as-card__title">评测目录</span>
          </div>
          {sections.map((s) => (
            <div
              key={s.key}
              className={`as-entry__nav-item${s.active ? ' as-entry__nav-item--active' : ''}`}
              onClick={() => setActive(s.key)}
            >
              <span>{s.name}</span>
              {s.done && <CheckCircleFilled className="as-entry__nav-done" />}
            </div>
          ))}
        </div>

        {/* 中：当前维度题目 */}
        <div className="as-card as-entry__main">
          <div className="as-card__header">
            <span className="as-card__title">
              {sections.find((s) => s.key === active)?.name}
            </span>
            <span className="as-row__sub">{readonly ? '只读 · C端原始答案' : '请按问卷逐题录入'}</span>
          </div>
          {mockEntryQuestions.map((q) => (
            <div key={q.id} className="as-question">
              <div className="as-question__title">{q.title}</div>
              {q.remark ? (
                <Input.TextArea rows={3} placeholder="请输入补充说明" disabled={readonly} />
              ) : (
                <Radio.Group
                  className="as-question__options"
                  value={answers[q.id]}
                  disabled={readonly}
                  onChange={(e) => setAnswers((prev) => ({ ...prev, [q.id]: e.target.value as string }))}
                  options={q.options.map((o) => ({ value: o, label: o }))}
                />
              )}
            </div>
          ))}
          <div className="as-entry__pager">
            <Button icon={<LeftOutlined />} onClick={() => setActive('sensory')}>
              上一维度
            </Button>
            <Button type="primary" onClick={() => setActive('nutrition')}>
              下一维度 <RightOutlined />
            </Button>
          </div>
        </div>

        {/* 右：完成情况 */}
        <div className="as-entry__side">
          <div className="as-card">
            <div className="as-card__header">
              <span className="as-card__title">完成情况</span>
            </div>
            <div className="as-progress">
              <Progress
                percent={Math.round((p.finished / p.total) * 100)}
                format={() => `${p.finished}/${p.total}`}
              />
              <div className="as-progress__row">
                <span>未完成题目</span>
                <span>{p.unfinished}</span>
              </div>
              <div className="as-progress__row">
                <span>必填项缺失</span>
                <span className="as-text--warn">{p.requiredMissing}</span>
              </div>
            </div>
            <div className="as-meta-list">
              <div className="as-meta-list__row">
                <span>评测来源</span>
                <span>{readonly ? 'C端自主测评' : p.source}</span>
              </div>
              <div className="as-meta-list__row">
                <span>评测人员</span>
                <span>{readonly ? 'C端用户自主完成' : p.assessor}</span>
              </div>
              <div className="as-meta-list__row">
                <span>模板版本</span>
                <span>{p.version}</span>
              </div>
              <div className="as-meta-list__row">
                <span>自动保存</span>
                <span className="as-text--ok">
                  {readonly ? '08-19 10:26 已同步' : p.autoSaved}
                </span>
              </div>
            </div>
            {!readonly && (
              <div className="as-entry__issue">完成前需处理：{p.issues}</div>
            )}
            <div className="as-entry__side-actions">
              {readonly ? (
                <>
                  <Button block onClick={() => navigate('/assessment')}>
                    返回列表
                  </Button>
                  <Button type="primary" block onClick={() => navigate(`/assessment/${id ?? 'A20260819001'}/analysis`)}>
                    查看AI分析
                  </Button>
                </>
              ) : (
                <>
                  <Button block onClick={() => message.success('已暂存（mock）')}>
                    暂存
                  </Button>
                  <Button type="primary" block onClick={() => setCheckOpen(true)}>
                    完成检查
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <CheckModal open={checkOpen} onClose={() => setCheckOpen(false)} />
    </PageContainer>
  )
}
