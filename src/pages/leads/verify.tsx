/**
 * 线索管理 - 引导服务对象完成实名认证（设计稿：实名认证.png）
 * 流程：身份查重 → 身份信息 → 实名及授权 → 自动建档
 * 数据当前为 mock；接入后端后：查重/发送邀请接口待后端定义，认证完成后由
 * leadApi.convertLead（API §3.7）自动建档
 */
import { useState } from 'react'
import { Button, Form, Input, App } from 'antd'
import { CheckOutlined } from '@ant-design/icons'
import { useNavigate, useParams } from 'react-router-dom'
import PageContainer from '@/components/PageContainer'
import { useUserStore } from '@/store/modules/user'
import {
  CONTACT_IDENTITY_MAP,
  LEAD_DEMAND_MAP,
  LEAD_SOURCE_MAP,
} from '@/api/modules/lead'
import { mockVerifyLead, mockLeads } from './mock'
import './index.less'

const steps = ['身份查重', '身份信息', '实名及授权', '自动建档']

const authChecklist = [
  '已向本人说明健康管理服务内容及数据用途',
  '本人同意建立健康档案并接受后续联系',
  '本人确认档案信息真实，可在C端继续补充',
]

export default function LeadVerify() {
  const navigate = useNavigate()
  const { id } = useParams()
  const { message } = App.useApp()
  const [sending, setSending] = useState(false)
  const currentOrg = useUserStore((state) => state.currentOrg)

  // TODO: 接入后端后替换为 leadApi.getLeadDetail(id)
  const lead = mockLeads.find((item) => item.id === Number(id)) ?? mockVerifyLead

  const onSend = async () => {
    setSending(true)
    try {
      // TODO: 接入后端后替换为发送实名认证邀请接口
      await new Promise((resolve) => setTimeout(resolve, 400))
      message.success('实名认证邀请已发送（mock）')
      // mock 演示：直接流转到「自动建档成功」页
      navigate(`/leads/${id}/convert-success`)
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="lead-page">
      <PageContainer
        title="引导服务对象完成实名认证"
        description="仅健康管理意向线索使用；实际服务对象完成实名认证后，系统自动创建或关联健康档案。"
      >
        {/* 流程步骤条 */}
        <div className="lead-verify__steps">
          {steps.map((label, index) => (
            <div
              key={label}
              className={`lead-verify__step${index === 0 ? ' lead-verify__step--active' : ''}`}
            >
              <span className="lead-verify__step-no">{index + 1}</span>
              {label}
            </div>
          ))}
        </div>

        <div className="lead-verify__panels">
          {/* 左：线索与本人信息 */}
          <div className="lead-verify__card">
            <div className="lead-edit__section-title">线索与本人信息</div>
            <Form layout="vertical">
              <Form.Item label="线索联系人">
                <Input
                  readOnly
                  variant="filled"
                  value={`${lead.contact_name} ${lead.contact_phone}（${lead.contact_identity ? CONTACT_IDENTITY_MAP[lead.contact_identity] : '-'}）`}
                />
              </Form.Item>
              <Form.Item label="线索来源">
                <Input readOnly variant="filled" value={LEAD_SOURCE_MAP[lead.source_type]} />
              </Form.Item>
              <Form.Item label="意向类型">
                <Input readOnly variant="filled" value={LEAD_DEMAND_MAP[lead.demand_type]} />
              </Form.Item>
              <Form.Item label="需求摘要">
                <Input readOnly variant="filled" value={lead.demand_detail} />
              </Form.Item>
              <Form.Item
                label="身份证件号码"
                required
                name="id_card"
                rules={[
                  { required: true, message: '请输入本人身份证件号码' },
                  { pattern: /^\d{17}[\dXx]$/, message: '请输入正确的 18 位身份证号' },
                ]}
              >
                <Input placeholder="请输入本人身份证件号码" maxLength={18} />
              </Form.Item>
              <Form.Item label="本人手机号" required>
                <Input readOnly value={lead.contact_phone} />
              </Form.Item>
            </Form>

            <div className="lead-verify__check-result">
              <div>校验结果：当前服务对象尚未实名认证，未发现可关联健康档案</div>
              <div className="lead-verify__check-note">
                若实名认证后发现已有档案，系统直接关联，不允许重复创建。
              </div>
            </div>
          </div>

          {/* 右：实名及授权 */}
          <div className="lead-verify__card">
            <div className="lead-edit__section-title">实名及授权</div>
            <div className="lead-verify__auth-list">
              {authChecklist.map((item) => (
                <div key={item} className="lead-verify__auth-item">
                  <CheckOutlined /> {item}
                </div>
              ))}
            </div>

            <div className="lead-verify__org-label">归属机构</div>
            <Input readOnly variant="filled" value={`${currentOrg?.name ?? '城东养老中心'}（当前机构）`} />

            <div className="lead-verify__tip">
              提交后向服务对象发送实名认证入口；认证完成后系统自动生成最小健康档案，状态为"档案待完善"。
            </div>

            <div className="lead-verify__actions">
              <Button onClick={() => navigate('/leads')}>取消</Button>
              <Button type="primary" loading={sending} onClick={onSend}>
                发送实名认证邀请
              </Button>
            </div>
          </div>
        </div>
      </PageContainer>
    </div>
  )
}
