/** 执行随访：可多次保存草稿，完成时提交结果并由服务端写入完成时间。 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  App, Button, Card, DatePicker, Descriptions, Empty, Form, Input, InputNumber,
  Select, Space, Spin,
} from 'antd'
import { ArrowLeftOutlined, CheckOutlined, SaveOutlined } from '@ant-design/icons'
import dayjs, { type Dayjs } from 'dayjs'
import { useNavigate, useParams } from 'react-router-dom'
import PageContainer from '@/components/PageContainer'
import SensitiveText from '@/components/SensitiveText'
import { followupApi } from '@/api'
import {
  FOLLOWUP_RESULT_MAP,
  FOLLOWUP_STATUS_MAP,
  FOLLOWUP_TYPE_MAP,
  type FollowupDetailResponse,
  type FollowupSavePayload,
} from '@/api/modules/followup'
import {
  display, formatDateTime, getFollowupGroups, getFollowupMain, pick, toDayjs,
} from './utils'
import './index.less'

interface ExecuteValues {
  items?: Record<string, unknown>
  remark?: string
  result?: number
  next_followup_date?: Dayjs
}

const TYPE_TONE: Record<number, string> = { 1: 'blue', 2: 'orange' }

export default function FollowupExecute() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { message } = App.useApp()
  const [form] = Form.useForm<ExecuteValues>()
  const [detail, setDetail] = useState<FollowupDetailResponse>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [completing, setCompleting] = useState(false)
  const startTimeRef = useRef<number | undefined>(undefined)

  const load = useCallback(async () => {
    if (!id) return
    setLoading(true)
    try {
      setDetail(await followupApi.getFollowupDetail(id))
    } catch {
      // 错误提示由拦截器统一处理。
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => { load() }, [load])

  const followup = useMemo(() => getFollowupMain(detail), [detail])
  const groups = useMemo(() => getFollowupGroups(detail), [detail])
  const readOnly = followup.status === 2

  useEffect(() => {
    const fields = groups.flatMap((group) => group.fields)
    form.setFieldsValue({
      items: Object.fromEntries(fields.map((field) => [field.key, field.value])),
      remark: pick(followup, ['remark', 'summary', 'supplement']) as string | undefined,
      result: Number(followup.result) > 0 ? Number(followup.result) : undefined,
      next_followup_date: toDayjs(followup.next_followup_date),
    })
    startTimeRef.current = Number(followup.start_time) || startTimeRef.current || dayjs().unix()
  }, [groups, followup, form])

  const buildPayload = (values: ExecuteValues): FollowupSavePayload => ({
    start_time: startTimeRef.current ?? dayjs().unix(),
    remark: values.remark,
    next_followup_date: values.next_followup_date?.format('YYYY-MM-DD'),
    items: values.items ?? {},
  })

  const save = async () => {
    if (!id || saving || completing) return
    // 草稿不触发“随访结果”必填校验，允许只填写部分内容。
    const values = form.getFieldsValue(true)
    setSaving(true)
    try {
      await followupApi.saveFollowup(id, buildPayload(values))
      // 保留当前表单，避免重新加载后清除仅供完成提交的随访结果。
      message.success('随访草稿已保存')
    } catch {
      // 请求失败时保留当前输入。
    } finally {
      setSaving(false)
    }
  }

  const complete = async () => {
    if (!id || saving || completing) return
    let values: ExecuteValues
    try {
      values = await form.validateFields()
    } catch {
      return
    }
    if (values.result == null) {
      message.warning('请选择本次随访结果')
      return
    }
    setCompleting(true)
    try {
      await followupApi.completeFollowup(id, { ...buildPayload(values), result: values.result })
      message.success('随访已完成')
      navigate(`/followup/${id}`)
    } catch {
      // 请求失败时保留当前输入。
    } finally {
      setCompleting(false)
    }
  }

  return (
    <div className="fu-page">
      <PageContainer
        title={readOnly ? '随访记录' : '执行随访'}
        description="填写随访子项与补充说明；草稿可多次保存，完成提交后不可继续编辑"
        extra={(
          <Space>
            <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/followup')}>返回列表</Button>
            {readOnly && <Button onClick={() => navigate(`/followup/${id}`)}>查看详情</Button>}
          </Space>
        )}
      >
        <Spin spinning={loading}>
          <Card variant="borderless" className="fu-card">
            <Descriptions title="随访任务" column={{ xs: 1, sm: 2, lg: 3 }} bordered>
              <Descriptions.Item label="任务 ID">{display(id)}</Descriptions.Item>
              <Descriptions.Item label="服务对象"><SensitiveText type="name" value={followup.member_name} /></Descriptions.Item>
              <Descriptions.Item label="会员 ID">{display(followup.member_id)}</Descriptions.Item>
              <Descriptions.Item label="随访类型">
                <span className={`status-tag status-tag--${TYPE_TONE[Number(followup.followup_type)] ?? 'gray'}`}>
                  {FOLLOWUP_TYPE_MAP[Number(followup.followup_type)] ?? display(followup.followup_type)}
                </span>
              </Descriptions.Item>
              <Descriptions.Item label="计划回访时间">{formatDateTime(followup.plan_time ?? followup.next_followup_date)}</Descriptions.Item>
              <Descriptions.Item label="当前状态">{FOLLOWUP_STATUS_MAP[Number(followup.status)] ?? display(followup.status)}</Descriptions.Item>
              <Descriptions.Item label="任务说明" span={3}>{display(followup.followup_name)}</Descriptions.Item>
            </Descriptions>

            <Form<ExecuteValues> form={form} layout="vertical" className="fu-execute-form">
              <section className="fu-detail-section">
                <h3 className="fu-section-title">随访子项</h3>
                {groups.length ? groups.map((group) => (
                  <Card key={group.key} size="small" title={group.label} className="fu-item-group">
                    <div className="fu-followup-items">
                      {group.fields.map((field) => (
                        <Form.Item
                          key={field.key}
                          name={['items', field.key]}
                          label={`${field.label}${field.unit ? `（${field.unit}）` : ''}`}
                        >
                          {field.options.length ? (
                            <Select
                              options={field.options}
                              disabled={readOnly}
                              allowClear
                              placeholder={`请选择${field.label}`}
                            />
                          ) : field.dataType === 1 ? (
                            <InputNumber
                              className="fu-full-width"
                              disabled={readOnly}
                              placeholder={`请输入${field.label}`}
                            />
                          ) : (
                            <Input disabled={readOnly} placeholder={`请输入${field.label}`} />
                          )}
                        </Form.Item>
                      ))}
                    </div>
                  </Card>
                )) : <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="该随访暂无子项" />}
              </section>

              <section className="fu-detail-section">
                <h3 className="fu-section-title">结果与补充说明</h3>
                <div className="fu-execute-grid">
                  <Form.Item
                    name="result"
                    label="随访结果"
                    rules={readOnly ? undefined : [{ required: true, message: '请选择随访结果' }]}
                  >
                    <Select
                      disabled={readOnly}
                      placeholder="完成随访时必选"
                      options={Object.entries(FOLLOWUP_RESULT_MAP).map(([value, label]) => ({ value: Number(value), label }))}
                    />
                  </Form.Item>
                  <Form.Item name="next_followup_date" label="下次随访日期">
                    <DatePicker className="fu-full-width" disabled={readOnly} />
                  </Form.Item>
                </div>
                <Form.Item name="remark" label="补充说明">
                  <Input.TextArea
                    rows={5}
                    disabled={readOnly}
                    placeholder="记录沟通情况、异常说明或后续注意事项"
                  />
                </Form.Item>
              </section>
            </Form>

            {!readOnly && (
              <div className="fu-form-actions">
                <Button icon={<SaveOutlined />} loading={saving} disabled={completing} onClick={save}>保存草稿</Button>
                <Button type="primary" icon={<CheckOutlined />} loading={completing} disabled={saving} onClick={complete}>完成随访</Button>
              </div>
            )}
          </Card>
        </Spin>
      </PageContainer>
    </div>
  )
}
