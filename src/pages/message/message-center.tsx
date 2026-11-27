import { useCallback, useEffect, useState } from 'react'
import type { Key } from 'react'
import {
  App, Button, Card, DatePicker, Drawer, Form, Input, InputNumber,
  Popconfirm, Select, Space, Spin, Switch, Table, Tabs, Tag,
} from 'antd'
import { CheckOutlined, ReloadOutlined } from '@ant-design/icons'
import dayjs, { type Dayjs } from 'dayjs'
import { messageApi } from '@/api'
import type {
  StaffMessage, StaffMessageType, StaffNotifySubscription,
} from '@/api/modules/message'
import { unreadTotal } from '@/api/modules/message'
import './index.less'

const PAGE_SIZE = 10

const MESSAGE_TYPE_META: Record<number, { label: string; color: string }> = {
  1: { label: '系统', color: 'default' },
  2: { label: '订单', color: 'blue' },
  3: { label: '工单', color: 'geekblue' },
  4: { label: '活动', color: 'purple' },
  5: { label: '随访', color: 'cyan' },
  6: { label: '健康方案', color: 'green' },
  7: { label: '健康预警', color: 'red' },
  8: { label: '退款', color: 'volcano' },
  9: { label: '预约到院', color: 'orange' },
  10: { label: '咨询', color: 'gold' },
  11: { label: '排班', color: 'lime' },
  12: { label: '资质', color: 'magenta' },
  13: { label: '账号', color: 'default' },
}

const MESSAGE_TYPE_OPTIONS = Object.entries(MESSAGE_TYPE_META).map(([value, meta]) => ({
  value: Number(value) as StaffMessageType,
  label: meta.label,
}))

function text(value: unknown) {
  if (value == null || value === '') return '-'
  return typeof value === 'string' || typeof value === 'number' ? String(value) : JSON.stringify(value)
}

function messageTitle(row: StaffMessage) {
  return text(row.title ?? row.subject ?? row.summary ?? row.content ?? `消息 #${row.id}`)
}

function messageContent(row: StaffMessage) {
  return text(row.content ?? row.body ?? row.summary ?? row.title)
}

function messageTime(row: StaffMessage) {
  const value = row.created_at ?? row.send_at ?? row.updated_at
  return typeof value === 'number' && value > 0 ? dayjs(value * 1000).format('YYYY-MM-DD HH:mm') : text(value)
}

function messageTypeTag(type?: number) {
  const meta = MESSAGE_TYPE_META[type ?? 0]
  return <Tag color={meta?.color}>{meta?.label ?? text(type)}</Tag>
}

interface PreferenceValues {
  category_off?: StaffMessageType[]
  night_silent: boolean
  sms_enabled: boolean
  wechat_enabled: boolean
}

interface SubscriptionValues {
  tpl_code: string
  subscribe_type: 0 | 1 | 2
  remain_count?: number
  expire_at?: Dayjs
}

function NotifyPreferences({ open }: { open: boolean }) {
  const { message } = App.useApp()
  const [preferenceForm] = Form.useForm<PreferenceValues>()
  const [subscriptionForm] = Form.useForm<SubscriptionValues>()
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [subscriptionLoading, setSubscriptionLoading] = useState(false)
  const [subscriptionSaving, setSubscriptionSaving] = useState(false)
  const subscribeType = Form.useWatch('subscribe_type', subscriptionForm)

  useEffect(() => {
    if (!open) return
    setLoading(true)
    messageApi.getNotifyPrefs()
      .then((result) => preferenceForm.setFieldsValue({
        category_off: result.category_off ?? [],
        night_silent: result.night_silent === 1,
        sms_enabled: result.sms_enabled === 1,
        wechat_enabled: result.wechat_enabled === 1,
      }))
      .catch(() => undefined)
      .finally(() => setLoading(false))
  }, [open, preferenceForm])

  const savePreferences = async () => {
    const values = await preferenceForm.validateFields()
    setSaving(true)
    try {
      await messageApi.saveNotifyPrefs({
        category_off: values.category_off ?? [],
        night_silent: values.night_silent ? 1 : 0,
        sms_enabled: values.sms_enabled ? 1 : 0,
        wechat_enabled: values.wechat_enabled ? 1 : 0,
      })
      message.success('触达偏好已保存')
    } catch { /* 拦截器统一提示 */ } finally { setSaving(false) }
  }

  const querySubscription = async () => {
    const { tpl_code } = await subscriptionForm.validateFields(['tpl_code'])
    setSubscriptionLoading(true)
    try {
      const result = await messageApi.getNotifySubscription(tpl_code)
      subscriptionForm.setFieldsValue({
        subscribe_type: result.subscribe_type ?? 0,
        remain_count: result.remain_count,
        expire_at: result.expire_at ? dayjs(result.expire_at * 1000) : undefined,
      })
    } catch { /* 拦截器统一提示 */ } finally { setSubscriptionLoading(false) }
  }

  const saveSubscription = async () => {
    const values = await subscriptionForm.validateFields()
    const payload: StaffNotifySubscription = {
      tpl_code: values.tpl_code,
      subscribe_type: values.subscribe_type,
      remain_count: values.subscribe_type === 1 ? values.remain_count ?? 0 : undefined,
      expire_at: values.subscribe_type === 2 ? values.expire_at?.unix() ?? 0 : undefined,
    }
    setSubscriptionSaving(true)
    try {
      await messageApi.saveNotifySubscription(payload)
      message.success('微信订阅状态已保存')
    } catch { /* 拦截器统一提示 */ } finally { setSubscriptionSaving(false) }
  }

  return (
    <div className="message-preferences">
      <Card
        title="触达偏好"
        extra={<Button type="primary" icon={<CheckOutlined />} loading={saving} onClick={savePreferences}>保存偏好</Button>}
      >
        <Spin spinning={loading}>
          <Form form={preferenceForm} layout="vertical" initialValues={{ category_off: [], night_silent: false, sms_enabled: false, wechat_enabled: false }}>
            <Form.Item name="category_off" label="关闭消息分类" extra="选中的分类将不再触达，未选中的分类保持开启。">
              <Select mode="multiple" allowClear options={MESSAGE_TYPE_OPTIONS} placeholder="请选择需要关闭的分类" />
            </Form.Item>
            <div className="message-preference-switches">
              <Form.Item name="night_silent" label="夜间免打扰" valuePropName="checked"><Switch /></Form.Item>
              <Form.Item name="sms_enabled" label="短信触达" valuePropName="checked"><Switch /></Form.Item>
              <Form.Item name="wechat_enabled" label="微信触达" valuePropName="checked"><Switch /></Form.Item>
            </div>
          </Form>
        </Spin>
      </Card>

      <Card
        title="微信订阅模板"
        extra={(
          <Space>
            <Button icon={<ReloadOutlined />} loading={subscriptionLoading} onClick={querySubscription}>查询状态</Button>
            <Button type="primary" icon={<CheckOutlined />} loading={subscriptionSaving} onClick={saveSubscription}>保存订阅</Button>
          </Space>
        )}
      >
        <Form form={subscriptionForm} layout="vertical" initialValues={{ subscribe_type: 0, remain_count: 0 }}>
          <Form.Item name="tpl_code" label="模板码" rules={[{ required: true, whitespace: true, message: '请输入微信订阅模板码' }]}>
            <Input placeholder="例如：WO_ASSIGNED" />
          </Form.Item>
          <Form.Item name="subscribe_type" label="订阅状态" rules={[{ required: true }]}>
            <Select options={[{ value: 0, label: '未订阅' }, { value: 1, label: '一次性订阅' }, { value: 2, label: '长期订阅' }]} />
          </Form.Item>
          {subscribeType === 1 && (
            <Form.Item name="remain_count" label="剩余次数" rules={[{ required: true, message: '请输入剩余次数' }]}>
              <InputNumber min={0} precision={0} className="message-full-width" />
            </Form.Item>
          )}
          {subscribeType === 2 && (
            <Form.Item name="expire_at" label="有效期" extra="不选择有效期表示长期有效。">
              <DatePicker showTime className="message-full-width" />
            </Form.Item>
          )}
        </Form>
      </Card>
    </div>
  )
}

export default function MessageCenter({ open, onClose, onUnreadChange }: {
  open: boolean
  onClose: () => void
  onUnreadChange: (count: number) => void
}) {
  const { message } = App.useApp()
  const [activeTab, setActiveTab] = useState('messages')
  const [filters, setFilters] = useState<{ message_type?: StaffMessageType; is_read?: 1 | 2; entity_type?: string }>({})
  const [applied, setApplied] = useState<typeof filters>({})
  const [list, setList] = useState<StaffMessage[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [selectedRowKeys, setSelectedRowKeys] = useState<Key[]>([])
  const [marking, setMarking] = useState(false)
  // const [detailOpen, setDetailOpen] = useState(false)
  // const [detailLoading, setDetailLoading] = useState(false)
  // const [detail, setDetail] = useState<StaffMessage>()

  const refreshUnread = useCallback(async () => {
    try {
      const result = await messageApi.getUnreadMessageCount()
      onUnreadChange(unreadTotal(result))
    } catch { /* 拦截器统一提示 */ }
  }, [onUnreadChange])

  const loadList = useCallback(async () => {
    setLoading(true)
    try {
      const result = await messageApi.getMessages({
        page,
        page_size: PAGE_SIZE,
        message_type: applied.message_type,
        is_read: applied.is_read,
        entity_type: applied.entity_type || undefined,
      })
      setList(result.list ?? [])
      setTotal(result.total ?? 0)
      setSelectedRowKeys([])
    } catch { /* 拦截器统一提示 */ } finally { setLoading(false) }
  }, [page, applied])

  useEffect(() => {
    if (!open) return
    void loadList()
    void refreshUnread()
  }, [open, loadList, refreshUnread])

  // const openDetail = async (row: StaffMessage) => {
  //   setDetailOpen(true)
  //   setDetail(undefined)
  //   setDetailLoading(true)
  //   try {
  //     setDetail(await messageApi.getMessageDetail(row.id))
  //     await Promise.all([loadList(), refreshUnread()])
  //   } catch { /* 拦截器统一提示 */ } finally { setDetailLoading(false) }
  // }

  const markSelected = async () => {
    const ids = selectedRowKeys.map(Number).filter(Number.isFinite)
    if (!ids.length) {
      message.warning('请先选择需要标记的消息')
      return
    }
    setMarking(true)
    try {
      await messageApi.markMessagesRead(ids)
      message.success('所选消息已标记为已读')
      await Promise.all([loadList(), refreshUnread()])
    } catch { /* 拦截器统一提示 */ } finally { setMarking(false) }
  }

  const markAll = async () => {
    setMarking(true)
    try {
      await messageApi.markAllMessagesRead(applied.message_type)
      message.success(applied.message_type ? '当前分类消息已全部标记为已读' : '全部消息已标记为已读')
      await Promise.all([loadList(), refreshUnread()])
    } catch { /* 拦截器统一提示 */ } finally { setMarking(false) }
  }

  return (
    <>
      <Drawer title="消息中心" width={960} open={open} onClose={onClose} className="message-center-drawer">
        <Tabs
          activeKey={activeTab} onChange={setActiveTab}
          items={[
            {
              key: 'messages', label: '消息列表',
              children: (
                <Card
                  title="站内消息"
                  extra={(
                    <Space wrap>
                      <Button icon={<CheckOutlined />} loading={marking} disabled={!selectedRowKeys.length} onClick={markSelected}>标记已读</Button>
                      <Popconfirm
                        title="确认全部标记为已读？"
                        description={applied.message_type ? '将处理当前查询分类下的全部消息。' : '将处理当前账号在机构内的全部消息。'}
                        onConfirm={markAll}
                      >
                        <Button loading={marking}>全部已读</Button>
                      </Popconfirm>
                    </Space>
                  )}
                >
                  <div className="message-filter-bar">
                    <Select style={{width: 200}} allowClear placeholder="全部消息类型" value={filters.message_type} options={MESSAGE_TYPE_OPTIONS} onChange={(value) => setFilters({ ...filters, message_type: value })} />
                    <Select style={{width: 200}}
                      allowClear placeholder="全部读取状态" value={filters.is_read}
                      options={[{ value: 1, label: '未读' }, { value: 2, label: '已读' }]}
                      onChange={(value) => setFilters({ ...filters, is_read: value })}
                    />
                    {/* <Input allowClear placeholder="业务对象类型，如 WO" value={filters.entity_type} onChange={(event) => setFilters({ ...filters, entity_type: event.target.value.trim() })} /> */}
                    <Button onClick={() => { setFilters({}); setApplied({}); setPage(1) }}>重置</Button>
                    <Button type="primary" onClick={() => { setApplied({ ...filters }); setPage(1) }}>查询</Button>
                  </div>
                  <Table<StaffMessage>
                    rowKey={(row) => String(row.id)} size="small" loading={loading}
                    dataSource={list} scroll={{ x: 760 }}
                    rowSelection={{ selectedRowKeys, onChange: setSelectedRowKeys }}
                    columns={[
                      {
                        title: '消息', key: 'message',
                        render: (_, row) => (
                          <div className="message-list-cell">
                            <strong>{messageTitle(row)}</strong>
                            <span>{messageContent(row)}</span>
                          </div>
                        ),
                      },
                      { title: '类型', dataIndex: 'message_type', width: 110, render: messageTypeTag },
                      {
                        title: '状态', dataIndex: 'is_read', width: 80,
                        render: (value) => <Tag color={value === 1 ? 'red' : 'default'}>{value === 1 ? '未读' : value === 2 ? '已读' : text(value)}</Tag>,
                      },
                      { title: '接收时间', key: 'created_at', width: 155, render: (_, row) => messageTime(row) },
                      // { title: '操作', key: 'action', width: 70, render: (_, row) => <Button size="small" onClick={() => void openDetail(row)}>查看</Button> },
                    ]}
                    pagination={{
                      current: page, pageSize: PAGE_SIZE, total,
                      showTotal: (value) => `共 ${value} 条`,
                      onChange: setPage,
                    }}
                  />
                </Card>
              ),
            },
            { key: 'preferences', label: '触达设置', children: <NotifyPreferences open={open && activeTab === 'preferences'} /> },
          ]}
        />
      </Drawer>

      {/* <Drawer
        title={detail ? messageTitle(detail) : '消息详情'} width={640}
        open={detailOpen} onClose={() => setDetailOpen(false)} className="message-detail-drawer"
      >
        <Spin spinning={detailLoading}>
          {detail && (
            <Descriptions bordered size="small" column={2}>
              <Descriptions.Item label="消息类型">{messageTypeTag(detail.message_type)}</Descriptions.Item>
              <Descriptions.Item label="读取状态">{detail.is_read === 1 ? '未读' : detail.is_read === 2 ? '已读' : text(detail.is_read)}</Descriptions.Item>
              <Descriptions.Item label="业务对象">{text(detail.entity_type)}{detail.entity_id != null ? ` / ${text(detail.entity_id)}` : ''}</Descriptions.Item>
              <Descriptions.Item label="接收时间">{messageTime(detail)}</Descriptions.Item>
              <Descriptions.Item label="消息内容" span={2}><div className="message-detail-content">{messageContent(detail)}</div></Descriptions.Item>
            </Descriptions>
          )}
        </Spin>
      </Drawer> */}
    </>
  )
}
