/** 手动创建日常随访或健康预警回访。 */
import { useCallback, useEffect, useRef, useState } from 'react'
import { Alert, App, Button, Card, DatePicker, Form, Radio, Select } from 'antd'
import { ArrowLeftOutlined } from '@ant-design/icons'
import type { Dayjs } from 'dayjs'
import { useNavigate } from 'react-router-dom'
import PageContainer from '@/components/PageContainer'
import { maskName, maskPhone } from '@/components/SensitiveText'
import { followupApi, memberApi, warningApi } from '@/api'
import { FOLLOWUP_TYPE_MAP } from '@/api/modules/followup'
import type { MemberItem } from '@/api/modules/member'
import { WARNING_SEVERITY_MAP, type WarningItem } from '@/api/modules/warning'
import { formatDate } from './utils'
import './index.less'

interface MemberOption { value: number; label: string }
interface CreateValues {
  member: MemberOption
  followup_type: number
  warning_id?: number
  next_followup_date: Dayjs
}

export default function FollowupCreate() {
  const navigate = useNavigate()
  const { message } = App.useApp()
  const [form] = Form.useForm<CreateValues>()
  const followupType = Form.useWatch('followup_type', form) ?? 1
  const selectedMember = Form.useWatch('member', form)
  const memberId = selectedMember?.value
  const [members, setMembers] = useState<MemberItem[]>([])
  const [warnings, setWarnings] = useState<WarningItem[]>([])
  const [memberLoading, setMemberLoading] = useState(false)
  const [warningLoading, setWarningLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const memberRequestRef = useRef(0)

  const loadMembers = useCallback(async (keyword = '') => {
    const requestId = ++memberRequestRef.current
    setMemberLoading(true)
    try {
      const res = await memberApi.getMemberList({ page: 1, page_size: 50, keyword: keyword || undefined })
      if (requestId === memberRequestRef.current) setMembers(res.list ?? [])
    } catch {
      // 错误提示由拦截器统一处理。
    } finally {
      if (requestId === memberRequestRef.current) setMemberLoading(false)
    }
  }, [])

  useEffect(() => { loadMembers() }, [loadMembers])

  useEffect(() => {
    form.setFieldValue('warning_id', undefined)
    setWarnings([])
    if (followupType !== 2 || !memberId) return

    let cancelled = false
    setWarningLoading(true)
    warningApi.getWarnings({ page: 1, page_size: 100, member_id: memberId })
      .then((res) => { if (!cancelled) setWarnings(res.list ?? []) })
      .catch(() => { /* 错误提示由拦截器统一处理。 */ })
      .finally(() => { if (!cancelled) setWarningLoading(false) })
    return () => { cancelled = true }
  }, [followupType, memberId, form])

  const submit = async (values: CreateValues) => {
    setSubmitting(true)
    try {
      const created = await followupApi.createFollowup(values.member.value, {
        followup_type: values.followup_type,
        warning_id: values.followup_type === 2 ? values.warning_id : undefined,
        next_followup_date: values.next_followup_date.format('YYYY-MM-DD'),
      })
      message.success('随访创建成功，子项已按会员情况自动生成')
      navigate(created?.id ? `/followup/${created.id}` : '/followup')
    } catch {
      // 请求失败时保留表单。
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fu-page">
      <PageContainer
        title="新建随访"
        description="选择服务对象和随访类型，系统将自动展开对应的随访子项"
        extra={<Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/followup')}>返回随访列表</Button>}
      >
        <Card variant="borderless" className="fu-card fu-create-card">
          <Alert
            type="info"
            showIcon
            title={followupType === 2 ? '健康预警回访创建规则' : '日常随访创建规则'}
            description={followupType === 2
              ? '必须关联当前服务对象的预警记录。创建后，系统按健康预警回访类型和会员在管慢病生成随访子项。'
              : '日常随访无需关联预警。创建后，系统按日常随访类型和会员在管慢病生成随访子项。'}
          />
          <Form<CreateValues>
            form={form}
            layout="vertical"
            className="fu-create-form"
            initialValues={{ followup_type: 1 }}
            onFinish={submit}
          >
            <Form.Item name="followup_type" label="随访类型" rules={[{ required: true, message: '请选择随访类型' }]}>
              <Radio.Group
                optionType="button"
                buttonStyle="solid"
                options={Object.entries(FOLLOWUP_TYPE_MAP).map(([value, label]) => ({ value: Number(value), label }))}
              />
            </Form.Item>

            <Form.Item name="member" label="服务对象" rules={[{ required: true, message: '请选择服务对象' }]}>
              <Select<MemberOption>
                showSearch
                filterOption={false}
                labelInValue
                loading={memberLoading}
                onSearch={loadMembers}
                placeholder="输入姓名或手机号搜索会员"
                options={members.map((member) => ({
                  value: member.id,
                  label: `${maskName(member.name)} · ${member.phone ? maskPhone(member.phone) : `ID ${member.id}`}`,
                }))}
              />
            </Form.Item>

            {followupType === 2 && (
              <Form.Item
                name="warning_id"
                label="关联预警"
                rules={[{ required: true, message: '请选择该服务对象的预警记录' }]}
                extra={memberId && !warningLoading && !warnings.length ? '该服务对象暂无可关联的预警记录' : undefined}
              >
                <Select
                  showSearch
                  optionFilterProp="label"
                  loading={warningLoading}
                  disabled={!memberId}
                  placeholder={memberId ? '请选择预警记录' : '请先选择服务对象'}
                  notFoundContent={warningLoading ? '正在查询预警' : '暂无预警记录'}
                  options={warnings.map((warning) => ({
                    value: warning.id,
                    label: `#${warning.id} · ${warning.title} · ${WARNING_SEVERITY_MAP[warning.severity] ?? '未知等级'} · ${formatDate(warning.created_at)}`,
                  }))}
                />
              </Form.Item>
            )}

            <Form.Item name="next_followup_date" label="计划回访日期" rules={[{ required: true, message: '请选择计划回访日期' }]}>
              <DatePicker className="fu-full-width" />
            </Form.Item>

            <div className="fu-form-actions">
              <Button onClick={() => navigate('/followup')}>取消</Button>
              <Button type="primary" htmlType="submit" loading={submitting}>创建随访</Button>
            </div>
          </Form>
        </Card>
      </PageContainer>
    </div>
  )
}
