/** 健康方案结构化创建与审核期编辑。 */
import { useEffect, useState } from 'react'
import {
  Alert, App, Button, Card, DatePicker, Empty, Form, Input, InputNumber,
  Select, Spin,
} from 'antd'
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons'
import dayjs, { type Dayjs } from 'dayjs'
import { planApi } from '@/api'
import FormDrawer from '@/components/FormDrawer'
import type {
  HealthPlan, HealthPlanDraft, HealthPlanGoal, HealthPlanIntervention,
} from '@/api/modules/plan'
import {
  detailParts, GOAL_CATEGORY_OPTIONS, PLAN_TYPE_META, planTitle,
} from './plan-shared'

interface EditorValues {
  plan_type: number
  health_intent?: string
  duration_days: number
  start_date?: Dayjs
  end_date?: Dayjs
  goals: HealthPlanGoal[]
  interventions: HealthPlanIntervention[]
}

const newGoal = (sort: number): HealthPlanGoal => ({
  category: 1, goal_code: '', goal_label: '', goal_basis: '', status: 1, sort_order: sort,
})

const newIntervention = (sort: number): HealthPlanIntervention => ({
  interv_code: '', interv_name: '', action_desc: '', interv_basis: '',
  field_type: 1, field_unit: '', metric_code: '', option_json: '',
  checkin_freq_type: 1, checkin_freq_value: 1, required: 1, status: 1, sort_order: sort,
})

function dateValue(value?: number) {
  return value && value > 0 ? dayjs(value * 1000) : undefined
}

function InterventionDynamicFields({ form, index }: {
  form: ReturnType<typeof Form.useForm<EditorValues>>[0]
  index: number
}) {
  const fieldType = Form.useWatch(['interventions', index, 'field_type'], form)
  const frequencyType = Form.useWatch(['interventions', index, 'checkin_freq_type'], form)
  return (
    <>
      {(fieldType === 1 || fieldType === 4 || fieldType === 5) && (
        <div className="plan-form-grid">
          {fieldType === 1 && (
            <>
              <Form.Item name={[index, 'field_unit']} label="数值单位"><Input placeholder="例如：mmHg、分钟" /></Form.Item>
              <Form.Item name={[index, 'metric_code']} label="关联健康指标编码"><Input placeholder="选填，用于指标趋势" /></Form.Item>
            </>
          )}
          {(fieldType === 4 || fieldType === 5) && (
            <Form.Item
              name={[index, 'option_json']} label="可选项 JSON" className="plan-field-wide"
              rules={[{ validator: (_, value: string) => {
                if (!value) return Promise.resolve()
                try { JSON.parse(value); return Promise.resolve() } catch { return Promise.reject(new Error('请输入有效 JSON')) }
              } }]}
            >
              <Input.TextArea rows={2} placeholder='例如：["选项一", "选项二"]' />
            </Form.Item>
          )}
        </div>
      )}
      <div className="plan-form-grid">
        <Form.Item name={[index, 'checkin_freq_type']} label="打卡频次" rules={[{ required: true }]}>
          <Select
            options={[{ value: 1, label: '每日 1 次' }, { value: 2, label: '每周 N 次' }]}
            onChange={(value) => {
              if (value === 1) form.setFieldValue(['interventions', index, 'checkin_freq_value'], 1)
            }}
          />
        </Form.Item>
        <Form.Item name={[index, 'checkin_freq_value']} label={frequencyType === 2 ? '每周次数' : '每日次数'} rules={[{ required: true }]}>
          <InputNumber min={1} precision={0} disabled={frequencyType !== 2} className="archive-full-width" />
        </Form.Item>
        <Form.Item name={[index, 'required']} label="是否必填"><Select options={[{ value: 1, label: '必填' }, { value: 0, label: '选填' }]} /></Form.Item>
      </div>
    </>
  )
}

export default function PlanEditor({ memberId, open, plan, draft, onClose, onSaved }: {
  memberId: string
  open: boolean
  plan?: HealthPlan
  draft?: HealthPlanDraft
  onClose: () => void
  onSaved: () => void | Promise<void>
}) {
  const { message } = App.useApp()
  const [form] = Form.useForm<EditorValues>()
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!open) return
    let active = true
    form.resetFields()
    const fillDraft = (value?: HealthPlanDraft) => form.setFieldsValue({
      plan_type: value?.plan_type || 1,
      health_intent: value?.health_intent || '',
      duration_days: value?.duration_days || 90,
      goals: value?.goals?.length ? value.goals : [newGoal(1)],
      interventions: value?.interventions?.length ? value.interventions : [newIntervention(1)],
    })
    if (!plan) {
      fillDraft(draft)
      return () => { active = false }
    }
    setLoading(true)
    planApi.getHealthPlanDetail(plan.id)
      .then((result) => {
        if (!active) return
        const parts = detailParts(result)
        form.setFieldsValue({
          plan_type: parts.plan.plan_type || 1,
          health_intent: parts.plan.health_intent || '',
          duration_days: parts.plan.duration_days || 90,
          start_date: dateValue(parts.plan.start_date),
          end_date: dateValue(parts.plan.end_date),
          goals: parts.goals,
          interventions: parts.interventions,
        })
      })
      .catch(() => { if (active) onClose() })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [open, plan?.id, draft, form])

  const save = async () => {
    const values = await form.validateFields()
    if (values.goals.length > 5) {
      message.warning('每个方案最多设置 5 个健康目标')
      return
    }
    setSaving(true)
    const payload = {
      plan_type: values.plan_type,
      health_intent: values.health_intent || undefined,
      duration_days: values.duration_days,
      start_date: values.start_date?.startOf('day').unix(),
      end_date: values.end_date?.endOf('day').unix(),
      goals: values.goals.map((goal, index) => ({ ...goal, sort_order: goal.sort_order ?? index + 1 })),
      interventions: values.interventions.map((item, index) => ({
        ...item,
        checkin_freq_value: item.checkin_freq_type === 2 ? item.checkin_freq_value : 1,
        sort_order: item.sort_order ?? index + 1,
      })),
    }
    try {
      if (plan) await planApi.updateHealthPlan(plan.id, payload)
      else await planApi.createHealthPlan(memberId, payload)
      message.success(plan ? '方案内容已保存，审批进度保持不变' : '健康方案草稿已创建')
      form.resetFields()
      await onSaved()
      onClose()
    } catch { /* 保留输入 */ } finally { setSaving(false) }
  }

  return (
    <FormDrawer
      title={plan ? `编辑健康方案 · ${planTitle(plan)}` : draft ? '编辑 AI 方案草稿' : '新建健康方案'}
      open={open} onClose={onClose} onSubmit={save} confirmLoading={saving} width={1040}
    >
      <Spin spinning={loading}>
        <Alert
          type="info" showIcon className="plan-editor-alert"
          message={plan ? '审核期编辑只更新内容，不改变当前审批进度。' : '方案内容仅由健康目标与干预措施组成，保存后生成一条草稿方案。'}
        />
        <Form form={form} layout="vertical" requiredMark="optional">
          <Card size="small" title="基本信息" className="plan-editor-section">
            <div className="plan-form-grid">
              <Form.Item name="plan_type" label="方案类型" rules={[{ required: true, message: '请选择方案类型' }]}>
                <Select options={Object.entries(PLAN_TYPE_META).map(([value, label]) => ({ value: Number(value), label }))} />
              </Form.Item>
              <Form.Item name="duration_days" label="执行周期（天）" rules={[{ required: true, message: '请输入执行周期' }]}><InputNumber min={1} precision={0} className="archive-full-width" /></Form.Item>
              <Form.Item name="start_date" label="开始日期"><DatePicker className="archive-full-width" /></Form.Item>
              <Form.Item name="end_date" label="结束日期" dependencies={['start_date']} rules={[{ validator: (_, value: Dayjs | undefined) => {
                const start = form.getFieldValue('start_date') as Dayjs | undefined
                return value && start && value.isBefore(start, 'day') ? Promise.reject(new Error('结束日期不能早于开始日期')) : Promise.resolve()
              } }]}><DatePicker className="archive-full-width" /></Form.Item>
              <Form.Item name="health_intent" label="健康管理意向" className="plan-field-wide"><Input.TextArea rows={2} placeholder="记录会员的健康管理意向快照" /></Form.Item>
            </div>
          </Card>

          <Form.List
            name="goals"
            rules={[{ validator: async (_, value: HealthPlanGoal[]) => {
              if ((value?.length ?? 0) > 5) throw new Error('每个方案最多设置 5 个健康目标')
            } }]}
          >
            {(fields, { add, remove }, { errors }) => (
              <Card
                size="small" title={`健康目标（${fields.length}/5）`} className="plan-editor-section"
                extra={<Button size="small" icon={<PlusOutlined />} disabled={fields.length >= 5} onClick={() => add(newGoal(fields.length + 1))}>添加目标</Button>}
              >
                {fields.length === 0 && <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="暂无健康目标" />}
                {fields.map((field, index) => (
                  <div className="plan-editor-item" key={field.key}>
                    <div className="plan-editor-item__heading"><strong>目标 {index + 1}</strong><Button type="text" danger icon={<DeleteOutlined />} onClick={() => remove(field.name)} /></div>
                    <Form.Item name={[field.name, 'id']} hidden><Input /></Form.Item>
                    <div className="plan-form-grid">
                      <Form.Item name={[field.name, 'category']} label="目标类别" rules={[{ required: true, message: '请选择目标类别' }]}>
                        <Select options={GOAL_CATEGORY_OPTIONS} placeholder="请选择目标类别" />
                      </Form.Item>
                      <Form.Item name={[field.name, 'goal_code']} label="目标编码" rules={[{ required: true, whitespace: true, message: '请输入目标编码' }]}><Input placeholder="方案内唯一" /></Form.Item>
                      <Form.Item name={[field.name, 'goal_label']} label="目标名称" rules={[{ required: true, whitespace: true, message: '请输入目标名称' }]}><Input /></Form.Item>
                      <Form.Item name={[field.name, 'sort_order']} label="排序"><InputNumber precision={0} className="archive-full-width" /></Form.Item>
                      <Form.Item name={[field.name, 'status']} label="状态"><Select options={[{ value: 1, label: '启用' }, { value: 9, label: '停用' }]} /></Form.Item>
                      <Form.Item name={[field.name, 'goal_basis']} label="目标依据" className="plan-field-wide"><Input.TextArea rows={2} placeholder="记录档案异常、就诊记录等目标来源和依据" /></Form.Item>
                    </div>
                  </div>
                ))}
                <Form.ErrorList errors={errors} />
              </Card>
            )}
          </Form.List>

          <Form.List name="interventions">
            {(fields, { add, remove }) => (
              <Card
                size="small" title={`干预措施（${fields.length}）`} className="plan-editor-section"
                extra={<Button size="small" icon={<PlusOutlined />} onClick={() => add(newIntervention(fields.length + 1))}>添加干预</Button>}
              >
                {fields.length === 0 && <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="暂无干预措施" />}
                {fields.map((field, index) => (
                  <div className="plan-editor-item" key={field.key}>
                    <div className="plan-editor-item__heading"><strong>干预 {index + 1}</strong><Button type="text" danger icon={<DeleteOutlined />} onClick={() => remove(field.name)} /></div>
                    <Form.Item name={[field.name, 'id']} hidden><Input /></Form.Item>
                    <div className="plan-form-grid">
                      <Form.Item name={[field.name, 'interv_code']} label="干预编码" rules={[{ required: true, whitespace: true, message: '请输入干预编码' }]}><Input placeholder="例如：diet_salt" /></Form.Item>
                      <Form.Item name={[field.name, 'interv_name']} label="干预名称" rules={[{ required: true, whitespace: true, message: '请输入干预名称' }]}><Input /></Form.Item>
                      <Form.Item name={[field.name, 'field_type']} label="打卡字段类型" rules={[{ required: true }]}><Select options={[1, 2, 3, 4, 5].map((value) => ({ value, label: ['数值', '文本', '布尔', '枚举', '多选'][value - 1] }))} /></Form.Item>
                      <Form.Item name={[field.name, 'sort_order']} label="排序"><InputNumber precision={0} className="archive-full-width" /></Form.Item>
                      <Form.Item name={[field.name, 'status']} label="状态"><Select options={[{ value: 1, label: '启用' }, { value: 9, label: '停用' }]} /></Form.Item>
                      <Form.Item name={[field.name, 'action_desc']} label="干预说明" className="plan-field-wide"><Input.TextArea rows={2} placeholder="说明会员需要执行的具体行动" /></Form.Item>
                      <Form.Item name={[field.name, 'interv_basis']} label="干预依据" className="plan-field-wide"><Input.TextArea rows={2} placeholder="记录干预来源和健康依据" /></Form.Item>
                    </div>
                    <InterventionDynamicFields form={form} index={field.name} />
                  </div>
                ))}
              </Card>
            )}
          </Form.List>
        </Form>
      </Spin>
    </FormDrawer>
  )
}
