/** 手动创建健康预警回访。 */
import { useEffect, useState } from 'react'
import { Alert, App, Button, Card, DatePicker, Form, InputNumber, Select } from 'antd'
import { ArrowLeftOutlined } from '@ant-design/icons'
import type { Dayjs } from 'dayjs'
import { useNavigate } from 'react-router-dom'
import PageContainer from '@/components/PageContainer'
import { followupApi, memberApi } from '@/api'
import type { MemberItem } from '@/api/modules/member'
import './index.less'

interface CreateValues {
  member_id: number
  warning_id: number
  next_followup_date: Dayjs
}

export default function FollowupCreate() {
  const navigate = useNavigate()
  const { message } = App.useApp()
  const [form] = Form.useForm<CreateValues>()
  const [members, setMembers] = useState<MemberItem[]>([])
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const loadMembers = async (keyword = '') => {
    setLoading(true)
    try {
      const res = await memberApi.getMemberList({ page: 1, page_size: 50, keyword: keyword || undefined })
      setMembers(res.list ?? [])
    } catch { /* 拦截器统一提示 */ } finally { setLoading(false) }
  }

  useEffect(() => { loadMembers() }, [])

  const submit = async () => {
    const values = await form.validateFields()
    setSubmitting(true)
    try {
      await followupApi.createFollowup(values.member_id, {
        followup_type: 2,
        warning_id: values.warning_id,
        next_followup_date: values.next_followup_date.format('YYYY-MM-DD'),
      })
      message.success('健康预警回访已创建，随访子项由后端按会员情况自动展开')
      navigate('/followup')
    } catch { /* 请求失败时保留表单 */ } finally { setSubmitting(false) }
  }

  return (
    <div className="fu-page">
      <PageContainer
        title="创建健康预警回访"
        description="为已建档会员手动创建健康预警回访任务"
        extra={<Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/followup')}>返回随访列表</Button>}
      >
        <Card variant="borderless" className="fu-card">
          <Alert
            type="info" showIcon title="创建规则"
            description="健康预警回访必须关联属于该会员的预警 ID。创建后，后端会按随访类型和会员在管慢病自动生成随访子项模板。"
          />
          <Form form={form} layout="vertical">
            <Form.Item name="member_id" label="服务对象" rules={[{ required: true, message: '请选择会员' }]}>
              <Select
                showSearch optionFilterProp="label" loading={loading} onSearch={loadMembers}
                placeholder="搜索并选择会员"
                options={members.map((member) => ({ value: member.id, label: `${member.name} · ${member.phone || member.id}` }))}
              />
            </Form.Item>
            <Form.Item name="warning_id" label="关联预警 ID" rules={[{ required: true, message: '请输入关联预警 ID' }]}>
              <InputNumber min={1} precision={0} placeholder="预警必须属于所选会员" />
            </Form.Item>
            <Form.Item name="next_followup_date" label="计划回访日期" rules={[{ required: true, message: '请选择计划日期' }]}>
              <DatePicker />
            </Form.Item>
          </Form>
          <div className="fu-create__actions">
            <Button onClick={() => navigate('/followup')}>取消</Button>
            <Button type="primary" loading={submitting} onClick={submit}>创建回访任务</Button>
          </div>
        </Card>
      </PageContainer>
    </div>
  )
}
