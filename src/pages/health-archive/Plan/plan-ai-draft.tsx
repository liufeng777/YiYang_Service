/** AI 异步方案草稿：任务号轮询，成功后回填结构化编辑器。 */
import { useEffect, useRef, useState } from 'react'
import { Alert, App, Form, Input, InputNumber, Select, Switch } from 'antd'
import { planApi } from '@/api'
import FormDrawer from '@/components/FormDrawer'
import type { HealthPlanDraft, HealthPlanDraftResult } from '@/api/modules/plan'
import { PLAN_TYPE_META } from './plan-shared'

interface DraftFormValues {
  requirement: string
  plan_type: number
  duration_days: number
  use_health_record: boolean
}

function normalizeDraft(result: HealthPlanDraftResult): HealthPlanDraft {
  const nested = result.draft
  return {
    plan_type: Number(nested?.plan_type ?? result.plan_type ?? 1) || 1,
    health_intent: String(nested?.health_intent ?? result.health_intent ?? ''),
    duration_days: Number(nested?.duration_days ?? result.duration_days ?? 90),
    goals: nested?.goals ?? result.goals ?? [],
    interventions: nested?.interventions ?? result.interventions ?? [],
  }
}

export default function PlanAiDraft({ memberId, open, onClose, onApply }: {
  memberId: string
  open: boolean
  onClose: () => void
  onApply: (draft: HealthPlanDraft) => void
}) {
  const { message } = App.useApp()
  const [form] = Form.useForm<DraftFormValues>()
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [taskNo, setTaskNo] = useState('')
  const [result, setResult] = useState<HealthPlanDraftResult>()
  const [generating, setGenerating] = useState(false)

  const stopPolling = () => {
    if (timer.current) clearTimeout(timer.current)
    timer.current = null
  }

  useEffect(() => {
    if (!open) return
    stopPolling()
    setTaskNo('')
    setResult(undefined)
    form.setFieldsValue({ requirement: '', plan_type: 1, duration_days: 90, use_health_record: true })
    return stopPolling
  }, [open, form])

  const poll = async (value: string) => {
    stopPolling()
    try {
      const next = await planApi.getHealthPlanDraft(value)
      setResult(next)
      if (next.status === 1) timer.current = setTimeout(() => { void poll(value) }, 2000)
      if (next.status === 3) message.error(next.error_msg || 'AI 草稿生成失败')
    } catch { /* 拦截器提示，保留任务号供排查 */ }
  }

  const generate = async () => {
    const values = await form.validateFields()
    setGenerating(true)
    stopPolling()
    setResult(undefined)
    try {
      const created = await planApi.createHealthPlanDraft(memberId, values)
      setTaskNo(created.task_no)
      setResult({ status: 1, task_no: created.task_no })
      void poll(created.task_no)
    } catch { /* 保留输入 */ } finally { setGenerating(false) }
  }

  const submit = async () => {
    if (result?.status === 2) {
      onApply(normalizeDraft(result))
      return
    }
    await generate()
  }

  const generatingDraft = generating || result?.status === 1

  return (
    <FormDrawer
      title="AI 生成健康方案草稿" open={open} onClose={() => { stopPolling(); onClose() }}
      onSubmit={submit} confirmLoading={generating} width={680}
      okText={result?.status === 2 ? '回填并编辑' : '开始生成'}
    >
      <Alert
        type="info" showIcon className="plan-editor-alert"
        message="AI 只生成目标与干预草稿，不会直接创建方案。"
        description="生成任务异步执行，草稿缓存 2 小时；回填并确认后才会保存为正式草稿方案。"
      />
      <Form form={form} layout="vertical">
        <Form.Item name="requirement" label="生成需求" rules={[{ required: true, whitespace: true, message: '请描述方案生成需求' }]}>
          <Input.TextArea rows={5} disabled={generatingDraft} placeholder="例如：会员高血压且近期血压偏高，希望制定 90 天饮食、运动和血压监测方案。" />
        </Form.Item>
        <div className="plan-form-grid">
          <Form.Item name="plan_type" label="方案类型" rules={[{ required: true, message: '请选择方案类型' }]}>
            <Select
              disabled={generatingDraft}
              options={Object.entries(PLAN_TYPE_META).map(([value, label]) => ({ value: Number(value), label }))}
            />
          </Form.Item>
          <Form.Item name="duration_days" label="执行周期（天）" rules={[{ required: true }]}><InputNumber min={1} precision={0} disabled={generatingDraft} className="archive-full-width" /></Form.Item>
          <Form.Item name="use_health_record" label="参考健康档案" valuePropName="checked"><Switch disabled={generatingDraft} /></Form.Item>
        </div>
      </Form>
      {taskNo && <div className="plan-draft-task">任务号：{taskNo}</div>}
      {result?.status === 1 && <Alert type="info" showIcon message="AI 正在生成目标与干预，页面将自动查询结果。" />}
      {result?.status === 2 && (
        <Alert
          type="success" showIcon message="方案草稿生成成功"
          description={`已生成 ${normalizeDraft(result).goals.length} 个目标、${normalizeDraft(result).interventions.length} 个干预，点击“回填并编辑”继续完善。`}
        />
      )}
      {result?.status === 3 && <Alert type="error" showIcon message="方案草稿生成失败" description={result.error_msg || '请调整需求后重新生成。'} />}
    </FormDrawer>
  )
}
