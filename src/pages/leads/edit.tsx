/**
 * 线索管理 - 新增 / 编辑线索（设计稿：新增编辑.png）
 * - 新增：/leads/create；编辑（查看）：/leads/edit/:id
 * - 数据当前为 mock；接入后端后：保存调用 leadApi.createLead（手动补录接口待后端定义），
 *   编辑回显调用 leadApi.getLeadDetail
 */
import { useEffect, useState } from 'react'
import { Button, Checkbox, Form, Input, Select, Tag, App, Card } from 'antd'
import { ArrowLeftOutlined } from '@ant-design/icons'
import { useNavigate, useParams } from 'react-router-dom'
import dayjs from 'dayjs'
import PageContainer from '@/components/PageContainer'
import { useUserStore } from '@/store/modules/user'
import {
  CONTACT_IDENTITY_MAP,
  LEAD_DEMAND_MAP,
  LEAD_SOURCE_MAP,
} from '@/api/modules/lead'
import { mockLeads } from './mock'
import './index.less'

interface LeadFormValues {
  contact_name: string
  contact_phone: string
  contact_identity: number
  source_type: number
  demand_type: number
  target_org?: string
  demand_detail: string
  remark?: string
  informed: boolean
}

export default function LeadEdit() {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEdit = Boolean(id)
  const { message } = App.useApp()
  const [form] = Form.useForm<LeadFormValues>()
  const [saving, setSaving] = useState(false)
  const userInfo = useUserStore((state) => state.userInfo)
  const currentOrg = useUserStore((state) => state.currentOrg)

  // 编辑模式：回显线索（mock；接入后端后替换为 leadApi.getLeadDetail(id)）
  const editing = isEdit ? mockLeads.find((lead) => lead.id === Number(id)) : undefined
  const sourceType = Form.useWatch('source_type', form)

  useEffect(() => {
    if (editing) {
      form.setFieldsValue({
        contact_name: editing.contact_name,
        contact_phone: editing.contact_phone,
        contact_identity: editing.contact_identity,
        source_type: editing.source_type,
        demand_type: editing.demand_type,
        demand_detail: editing.demand_detail,
        informed: true,
      })
    }
  }, [editing, form])

  const onFinish = async (values: LeadFormValues) => {
    setSaving(true)
    try {
      // TODO: 接入后端后替换为 leadApi.createLead / 编辑保存接口
      void values
      await new Promise((resolve) => setTimeout(resolve, 300))
      message.success(isEdit ? '线索已保存' : '线索登记成功')
      navigate('/leads')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="lead-page">
      <PageContainer
        title={isEdit ? '编辑线索' : '新增线索'}
        description="电话咨询或健康活动自动产生线索时带入用户、服务对象和需求摘要，也支持机构手动补录。"
        extra={
          <>
            {sourceType && (
              <Tag className="lead-edit__source-tag">来源：{LEAD_SOURCE_MAP[sourceType]}</Tag>
            )}
            <Button icon={<ArrowLeftOutlined />} color="primary" variant="outlined" onClick={() => navigate('/leads')}>返回线索列表</Button>
          </>
        }
      >
        <Card className='lead-edit__card'>
          <Form<LeadFormValues>
            form={form}
            layout="vertical"
            onFinish={onFinish}
            initialValues={{ informed: true }}
          >
            <div className="lead-edit__section-title">联系人信息</div>
            <div className="lead-edit__grid">
              <Form.Item
                name="contact_name"
                label="姓名"
                rules={[{ required: true, message: '请输入姓名' }]}
              >
                <Input placeholder="请输入联系人姓名" maxLength={20} />
              </Form.Item>
              <Form.Item
                name="contact_phone"
                label="联系电话"
                rules={[
                  { required: true, message: '请输入联系电话' },
                  { pattern: /^1\d{10}$/, message: '请输入正确的 11 位手机号' },
                ]}
              >
                <Input placeholder="请输入联系电话" maxLength={11} />
              </Form.Item>
              <Form.Item
                name="contact_identity"
                label="咨询人身份"
                rules={[{ required: true, message: '请选择咨询人身份' }]}
              >
                <Select
                  placeholder="请选择"
                  options={Object.entries(CONTACT_IDENTITY_MAP).map(([value, label]) => ({
                    value: Number(value),
                    label,
                  }))}
                />
              </Form.Item>
            </div>

            <div className="lead-edit__section-title">线索信息</div>
            <div className="lead-edit__grid">
              <Form.Item
                name="source_type"
                label="线索来源"
                rules={[{ required: true, message: '请选择线索来源' }]}
              >
                <Select
                  placeholder="请选择"
                  options={Object.entries(LEAD_SOURCE_MAP).map(([value, label]) => ({
                    value: Number(value),
                    label,
                  }))}
                />
              </Form.Item>
              <Form.Item
                name="demand_type"
                label="意向类型"
                rules={[{ required: true, message: '请选择意向类型' }]}
              >
                <Select
                  placeholder="请选择"
                  options={Object.entries(LEAD_DEMAND_MAP).map(([value, label]) => ({
                    value: Number(value),
                    label,
                  }))}
                />
              </Form.Item>
              <Form.Item name="target_org" label="意向机构或服务">
                <Input placeholder={currentOrg?.name ?? '默认为当前机构'} maxLength={30} />
              </Form.Item>
            </div>

            <Form.Item
              name="demand_detail"
              label="需求描述"
              rules={[{ required: true, message: '请输入需求描述' }]}
            >
              <Input.TextArea
                rows={4}
                placeholder="希望了解护理院入住条件、收费标准，并预约到院参观。"
                maxLength={200}
              />
            </Form.Item>

            <Form.Item name="remark" label="备注">
              <Input.TextArea rows={3} placeholder="可补充线下沟通信息" maxLength={200} />
            </Form.Item>

            {isEdit && editing && (
              <div className="lead-edit__meta">
                登记人：{editing.owner_staff_name ?? userInfo?.nickname ?? '-'}
                &nbsp;&nbsp;登记时间：{dayjs(editing.created_at * 1000).format('YYYY-MM-DD HH:mm')}
                &nbsp;&nbsp;来源会话：C{editing.lead_no.slice(-9)}
              </div>
            )}

            <Form.Item
              name="informed"
              valuePropName="checked"
              rules={[
                {
                  validator: (_, value) =>
                    value ? Promise.resolve() : Promise.reject(new Error('请先向用户说明信息用途')),
                },
              ]}
            >
              <Checkbox>已向用户说明信息用于后续联系与服务咨询</Checkbox>
            </Form.Item>

            <div className="lead-edit__actions">
              <Button onClick={() => navigate('/leads')}>取消</Button>
              <Button type="primary" htmlType="submit" loading={saving}>
                保存线索
              </Button>
            </div>
          </Form>
        </Card>
      </PageContainer>
    </div>
  )
}
