/**
 * 新建健康评估
 * 请求体在 Swagger 中仅为 object，本页按既有 type / answers 约定提交并明确标注限制。
 */
import { useEffect, useState } from 'react'
import { Alert, App, Button, Card, Form, Input, Select } from 'antd'
import { ArrowLeftOutlined } from '@ant-design/icons'
import { useLocation, useNavigate } from 'react-router-dom'
import PageContainer from '@/components/PageContainer'
import { memberApi } from '@/api'
import type { MemberItem } from '@/api/modules/member'
import './index.less'

interface CreateFormValues {
  member_id: number
  type: string
  answers: string
}

export default function AssessCreate() {
  const navigate = useNavigate()
  const location = useLocation()
  const { message } = App.useApp()
  const [form] = Form.useForm<CreateFormValues>()
  const [members, setMembers] = useState<MemberItem[]>([])
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const initialMemberId = (location.state as { memberId?: number } | null)?.memberId

  const loadMembers = async (keyword = '') => {
    setLoading(true)
    try {
      const res = await memberApi.getMemberList({ page: 1, page_size: 50, keyword: keyword || undefined })
      setMembers(res.list ?? [])
    } catch {
      // 拦截器统一提示
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadMembers() }, [])

  const submit = async () => {
    const values = await form.validateFields()
    let answers: unknown
    try {
      answers = JSON.parse(values.answers)
    } catch {
      message.error('答案内容不是有效 JSON')
      return
    }
    setSubmitting(true)
    try {
      const res = await memberApi.createAssessment(values.member_id, { type: values.type.trim(), answers })
      message.success('健康评估已创建')
      if (res?.id != null) navigate(`/assessment/${res.id}`)
      else navigate('/assessment')
    } catch {
      // 请求失败时保留表单
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <PageContainer
      title="新建健康力测评"
      description="选择会员并提交评估类型与原始答案"
      extra={<Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/assessment')}>返回测评列表</Button>}
    >
      <Card variant="borderless" className="as-card">
        <Alert
          type="info"
          showIcon
          title="评估结构待后端补充"
          description="Swagger 仅声明请求体为 object，未定义模板、题目、评分和附件字段。当前按 type / answers 提交，不提供模拟模板或假上传。"
        />
        <Form form={form} layout="vertical" initialValues={{ member_id: initialMemberId, answers: '{}' }}>
          <Form.Item name="member_id" label="测评会员" rules={[{ required: true, message: '请选择会员' }]}>
            <Select
              showSearch
              optionFilterProp="label"
              loading={loading}
              onSearch={loadMembers}
              options={members.map((member) => ({ value: member.id, label: `${member.name} · ${member.phone || member.id}` }))}
            />
          </Form.Item>
          <Form.Item name="type" label="评估类型" rules={[{ required: true, whitespace: true, message: '请输入评估类型' }]}>
            <Input placeholder="请输入后端可识别的评估类型" maxLength={100} />
          </Form.Item>
          <Form.Item name="answers" label="原始答案（JSON）" rules={[{ required: true, message: '请输入答案内容' }]}>
            <Input.TextArea rows={14} spellCheck={false} />
          </Form.Item>
        </Form>
        <div className="as-footer-actions">
          <Button onClick={() => navigate('/assessment')}>取消</Button>
          <Button type="primary" loading={submitting} onClick={submit}>创建测评</Button>
        </div>
      </Card>
    </PageContainer>
  )
}
