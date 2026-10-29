/** 咨询管理：使用 Drawer + Form 登记电话咨询，字段对齐咨询创建接口。 */
import { useState } from 'react'
import { App, Button, Drawer, Form, Input, InputNumber } from 'antd'
import { consultApi } from '@/api'
import { useUserStore } from '@/store'

interface ConsultationRegisterProps {
  open: boolean
  onClose: () => void
  onSuccess: () => void
}

interface ConsultationFormValues {
  contact_name: string
  contact_phone: string
  question: string
  answer?: string
  satisfaction_score?: number
}

export default function ConsultationRegister({
  open,
  onClose,
  onSuccess,
}: ConsultationRegisterProps) {
  const { message } = App.useApp()
  const currentOrg = useUserStore((state) => state.currentOrg)
  const [form] = Form.useForm<ConsultationFormValues>()
  const [submitting, setSubmitting] = useState(false)

  const close = () => {
    form.resetFields()
    onClose()
  }

  const onFinish = async (values: ConsultationFormValues) => {
    setSubmitting(true)
    try {
      await consultApi.createConsultation({
        contact_name: values.contact_name.trim(),
        contact_phone: values.contact_phone.trim(),
        question: values.question.trim(),
        answer: values.answer?.trim() || undefined,
        satisfaction_score: values.satisfaction_score,
        consultation_type: 3,
        institution_id: currentOrg?.id ? Number(currentOrg.id) : undefined,
      })
      message.success('咨询记录已保存')
      form.resetFields()
      onSuccess()
    } catch {
      // 错误提示由拦截器统一处理
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Drawer
      title="登记电话咨询"
      width={560}
      open={open}
      onClose={close}
      destroyOnHidden
      footer={
        <div className="cs-drawer__footer">
          <Button onClick={close}>取消</Button>
          <Button type="primary" loading={submitting} onClick={() => form.submit()}>
            保存咨询记录
          </Button>
        </div>
      }
    >
      <Form<ConsultationFormValues>
        form={form}
        layout="vertical"
        requiredMark="optional"
        onFinish={onFinish}
        autoComplete="off"
      >
        <Form.Item
          name="contact_name"
          label="联系人姓名"
          rules={[
            { required: true, whitespace: true, message: '请输入联系人姓名' },
            { max: 50, message: '联系人姓名不能超过 50 个字符' },
          ]}
        >
          <Input placeholder="请输入来电人姓名" maxLength={50} />
        </Form.Item>
        <Form.Item
          name="contact_phone"
          label="联系电话"
          rules={[
            { required: true, whitespace: true, message: '请输入联系电话' },
            { pattern: /^[\d\s+\-()]{5,20}$/, message: '请输入有效的联系电话' },
          ]}
        >
          <Input placeholder="请输入手机号或座机号码" maxLength={20} />
        </Form.Item>
        <Form.Item
          name="question"
          label="咨询内容"
          rules={[
            { required: true, whitespace: true, message: '请输入咨询内容' },
            { max: 1000, message: '咨询内容不能超过 1000 个字符' },
          ]}
        >
          <Input.TextArea
            rows={6}
            maxLength={1000}
            showCount
            placeholder="请记录客户咨询的问题、涉及的服务及重点诉求"
          />
        </Form.Item>
        <Form.Item
          name="answer"
          label="咨询处理结果"
          tooltip="如已当场解答，可同步登记处理结果"
          rules={[{ max: 1000, message: '处理结果不能超过 1000 个字符' }]}
        >
          <Input.TextArea
            rows={4}
            maxLength={1000}
            showCount
            placeholder="选填，记录本次答复或处理情况"
          />
        </Form.Item>
        <Form.Item name="satisfaction_score" label="满意度评分" extra="选填，范围为 0～5 分">
          <InputNumber min={0} max={5} precision={0} placeholder="请输入评分" style={{ width: '100%' }} />
        </Form.Item>
      </Form>
    </Drawer>
  )
}
