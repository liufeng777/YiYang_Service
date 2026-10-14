/**
 * 服务工单 - 工单详情（设计稿：预约与联系.png / 资质授权强校验.png）
 * 已对接：
 * - GET  /api/v1/staff/work-orders/:id          工单详情（§9.2）
 * - GET  /api/v1/staff/staffs                 派单候选人员
 * - POST /api/v1/staff/work-orders/:id/dispatch 派单（§9.3）
 * 说明：改期 / 联系结果回写 / 回执接口 API v0.1 未定义，相关操作为演示交互
 */
import { useCallback, useEffect, useState } from 'react'
import { Button, DatePicker, Input, Modal, Radio, Spin, TimePicker, App } from 'antd'
import { CheckOutlined } from '@ant-design/icons'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import dayjs, { type Dayjs } from 'dayjs'
import PageContainer from '@/components/PageContainer'
import { staffApi, workOrderApi } from '@/api'
import type { StaffItem } from '@/api/modules/staff'
import {
  WO_CONTACT_STATUS_MAP,
  WO_STATUS_MAP,
  type WorkOrderItem,
} from '@/api/modules/work-order'
import './index.less'

const DETAIL_TABS = [
  { key: 'basic', label: '基本信息' },
  { key: 'booking', label: '预约与联系' },
  { key: 'dispatch', label: '派单信息' },
  { key: 'fulfill', label: '履约记录' },
  { key: 'receipt', label: '服务回执' },
  { key: 'reschedule', label: '改期记录' },
  { key: 'exception', label: '履约异常' },
]

const STEP_TITLES = ['派单', '联系确认', '服务执行', '服务回执', '完成']

/** 工单状态 → 当前所处步骤下标 */
const STATUS_STAGE: Record<number, number> = {
  1: 0,
  8: 0,
  2: 1,
  3: 1,
  4: 2,
  5: 2,
  9: 2,
  6: 3,
  7: 4,
}

const fmt = (ts?: number | null, pattern = 'YYYY-MM-DD HH:mm') =>
  ts ? dayjs(ts * 1000).format(pattern) : '-'

export default function WorkOrderDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const [detail, setDetail] = useState<WorkOrderItem | null>(null)
  const [loading, setLoading] = useState(false)

  const [activeTab, setActiveTab] = useState(
    () => (searchParams.get('tab') === 'receipt' ? 'receipt' : 'booking'),
  )
  const [dispatchOpen, setDispatchOpen] = useState(() => searchParams.get('dispatch') === '1')
  const [rescheduleOpen, setRescheduleOpen] = useState(
    () => searchParams.get('reschedule') === '1',
  )

  const fetchDetail = useCallback(async () => {
    if (!id) return
    setLoading(true)
    try {
      const res = await workOrderApi.getWorkOrderDetail(id)
      setDetail(res)
    } catch {
      // 错误提示由拦截器统一处理
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    fetchDetail()
  }, [fetchDetail])

  const openReschedule = () => {
    setRescheduleOpen(true)
    searchParams.delete('reschedule')
    setSearchParams(searchParams, { replace: true })
  }

  const stage = detail ? (STATUS_STAGE[detail.wo_status] ?? 0) : 0
  const steps = STEP_TITLES.map((title, i) => ({
    title,
    state:
      detail?.wo_status === 7 || i < stage ? ('done' as const) : i === stage ? ('active' as const) : ('todo' as const),
  }))

  return (
    <div className="wo-page">
      <PageContainer
        title="服务工单详情"
        description={`关联订单 ${detail?.order_no ?? '-'} · 预约 ${fmt(detail?.expected_start_at, 'MM-DD HH:mm')}`}
        extra={<Button onClick={() => navigate('/work-order')}>返回列表</Button>}
      >
        <Spin spinning={loading}>
          {/* 状态行 */}
          {detail && (
            <div className="wo-detail__status">
              <span className="wo-tag wo-tag--blue">{WO_STATUS_MAP[detail.wo_status] ?? '-'}</span>
              {detail.contact_status != null && (
                <span className="wo-tag wo-tag--orange">
                  联系：{WO_CONTACT_STATUS_MAP[detail.contact_status] ?? '-'}
                </span>
              )}
              <span className="wo-detail__status-note">
                服务人员助手端将于服务前一天收到联系任务并解锁联系方式
              </span>
            </div>
          )}

          {/* 履约步骤条 */}
          <div className="wo-card wo-steps">
            {steps.map((s, i) => (
              <div key={s.title} className="wo-steps__item">
                <div className={`wo-steps__node wo-steps__node--${s.state}`}>
                  {s.state === 'done' ? <CheckOutlined /> : i + 1}
                </div>
                <div className="wo-steps__body">
                  <div className={`wo-steps__title wo-steps__title--${s.state}`}>{s.title}</div>
                </div>
                {i < steps.length - 1 && (
                  <div className={`wo-steps__line ${s.state === 'done' ? 'wo-steps__line--done' : ''}`} />
                )}
              </div>
            ))}
          </div>

          {/* Tab 切换 */}
          <div className="wo-detail__tabs">
            {DETAIL_TABS.map((t) => (
              <span
                key={t.key}
                className={
                  t.key === activeTab ? 'wo-detail__tab wo-detail__tab--active' : 'wo-detail__tab'
                }
                onClick={() => setActiveTab(t.key)}
              >
                {t.label}
              </span>
            ))}
          </div>

          {detail && activeTab === 'booking' && (
            <BookingTab d={detail} onOpenReschedule={openReschedule} />
          )}
          {detail && activeTab === 'basic' && <BasicTab d={detail} />}
          {detail && activeTab === 'dispatch' && (
            <DispatchTab d={detail} onOpenDispatch={() => setDispatchOpen(true)} />
          )}
          {activeTab === 'fulfill' && (
            <div className="wo-card">
              <div className="wo-card__header">
                <span className="wo-card__title">履约记录</span>
              </div>
              <div className="wo-empty">
                服务人员上门签到签退与执行留痕由医护小程序端回写，当前暂无履约记录。
              </div>
            </div>
          )}
          {activeTab === 'receipt' && (
            <div className="wo-card">
              <div className="wo-card__header">
                <span className="wo-card__title">服务回执</span>
              </div>
              <div className="wo-empty">
                服务完成后由服务人员上传服务回执；回执确认接口待后端补充。
              </div>
            </div>
          )}
          {activeTab === 'reschedule' && (
            <div className="wo-card">
              <div className="wo-card__header">
                <span className="wo-card__title">改期记录</span>
                <Button size="small" onClick={openReschedule}>
                  修改预约
                </Button>
              </div>
              <div className="wo-empty">暂无改期记录。改期接口待后端补充。</div>
            </div>
          )}
          {activeTab === 'exception' && (
            <div className="wo-card">
              <div className="wo-card__header">
                <span className="wo-card__title">履约异常</span>
                <Button size="small" onClick={() => navigate('/exception')}>
                  前往异常处理
                </Button>
              </div>
              <div className="wo-empty">
                履约过程中的服务异常在「履约异常」Tab 单独记录，与联系确认结果分开管理。当前工单暂无异常。
              </div>
            </div>
          )}
        </Spin>
      </PageContainer>

      {detail && id && (
        <DispatchModal
          open={dispatchOpen}
          wo={detail}
          onClose={() => setDispatchOpen(false)}
          onDone={() => {
            setDispatchOpen(false)
            fetchDetail()
          }}
        />
      )}
      <RescheduleModal open={rescheduleOpen} onClose={() => setRescheduleOpen(false)} wo={detail} />
    </div>
  )
}

/* ===== 预约与联系 Tab ===== */
function BookingTab({ d, onOpenReschedule }: { d: WorkOrderItem; onOpenReschedule: () => void }) {
  return (
    <>
      <div className="wo-booking">
        {/* 预约信息 */}
        <div className="wo-card">
          <div className="wo-card__header">
            <span className="wo-card__title">预约信息</span>
            <span className="wo-tag wo-tag--green">来自C端订单</span>
          </div>
          <div className="wo-kv">
            <span className="wo-kv__label">预约日期</span>
            <span className="wo-kv__value">{fmt(d.expected_start_at, 'YYYY-MM-DD')}</span>
          </div>
          <div className="wo-kv">
            <span className="wo-kv__label">预约时段</span>
            <span className="wo-kv__value">
              {fmt(d.expected_start_at, 'HH:mm')} — {fmt(d.expected_stop_at, 'HH:mm')}
            </span>
          </div>
          <div className="wo-kv">
            <span className="wo-kv__label">服务地址</span>
            <span className="wo-kv__value">{d.service_address || '-'}</span>
          </div>
          <div className="wo-card__footer">
            <Button onClick={onOpenReschedule}>修改预约</Button>
          </div>
        </div>

        {/* 派单人员 */}
        <div className="wo-card">
          <div className="wo-card__header">
            <span className="wo-card__title">派单人员</span>
          </div>
          {d.expect_staff_name ? (
            <>
              <div className="wo-assignee">
                <span className="wo-assignee__avatar" />
                <div>
                  <div className="wo-assignee__name">{d.expect_staff_name}</div>
                  <div className="wo-assignee__title">期望医护 / 已派服务人员</div>
                </div>
              </div>
              <div className="wo-kv">
                <span className="wo-kv__label">派单时间</span>
                <span className="wo-kv__value">{fmt(d.assigned_at)}</span>
              </div>
            </>
          ) : (
            <div className="wo-empty">尚未派单</div>
          )}
          <div className="wo-note">预约时段可用仅作为派单提示，不是强制拦截条件。</div>
        </div>
      </div>

      {/* 服务前联系确认 */}
      <div className="wo-card">
        <div className="wo-card__header">
          <span className="wo-card__title">服务前联系确认</span>
          <span className="wo-tag wo-tag--blue">T-1 自动推送</span>
        </div>
        <div className="wo-note wo-note--block">
          服务人员助手端打开工单后查看联系方式，通知消息不直接展示完整手机号。
        </div>
        <div className="wo-contact">
          <div className="wo-kv">
            <span className="wo-kv__label">联系对象</span>
            <span className="wo-kv__value">
              {d.contact_name || d.member_name || '-'} {d.contact_phone || d.member_phone || ''}
            </span>
          </div>
          <div className="wo-kv">
            <span className="wo-kv__label">当前结果</span>
            <span className="wo-kv__value wo-text--strong">
              {d.contact_status != null ? (WO_CONTACT_STATUS_MAP[d.contact_status] ?? '-') : '-'}
            </span>
          </div>
        </div>
        <div className="wo-note wo-note--block">
          联系结果回写接口待后端补充；履约异常在「履约异常」Tab 单独记录。
        </div>
      </div>
    </>
  )
}

/* ===== 基本信息 Tab ===== */
function BasicTab({ d }: { d: WorkOrderItem }) {
  return (
    <div className="wo-booking">
      <div className="wo-card">
        <div className="wo-card__header">
          <span className="wo-card__title">服务对象</span>
        </div>
        <div className="wo-kv">
          <span className="wo-kv__label">姓名</span>
          <span className="wo-kv__value">{d.member_name || '-'}</span>
        </div>
        <div className="wo-kv">
          <span className="wo-kv__label">联系电话</span>
          <span className="wo-kv__value">{d.member_phone || d.contact_phone || '-'}</span>
        </div>
        <div className="wo-kv">
          <span className="wo-kv__label">联系人</span>
          <span className="wo-kv__value">{d.contact_name || '-'}</span>
        </div>
        <div className="wo-kv">
          <span className="wo-kv__label">服务地址</span>
          <span className="wo-kv__value">{d.service_address || '-'}</span>
        </div>
      </div>
      <div className="wo-card">
        <div className="wo-card__header">
          <span className="wo-card__title">订单信息</span>
        </div>
        <div className="wo-kv">
          <span className="wo-kv__label">工单编号</span>
          <span className="wo-kv__value">{d.wo_no || '-'}</span>
        </div>
        <div className="wo-kv">
          <span className="wo-kv__label">关联订单</span>
          <span className="wo-kv__value">{d.order_no || '-'}</span>
        </div>
        <div className="wo-kv">
          <span className="wo-kv__label">服务项目</span>
          <span className="wo-kv__value">{d.service_name || '-'}</span>
        </div>
        <div className="wo-kv">
          <span className="wo-kv__label">预约时间</span>
          <span className="wo-kv__value">
            {fmt(d.expected_start_at)} ~ {fmt(d.expected_stop_at, 'HH:mm')}
          </span>
        </div>
        {d.remark && (
          <div className="wo-kv">
            <span className="wo-kv__label">备注</span>
            <span className="wo-kv__value">{d.remark}</span>
          </div>
        )}
      </div>
    </div>
  )
}

/* ===== 派单信息 Tab ===== */
function DispatchTab({ d, onOpenDispatch }: { d: WorkOrderItem; onOpenDispatch: () => void }) {
  return (
    <div className="wo-card">
      <div className="wo-card__header">
        <span className="wo-card__title">派单信息</span>
        <Button type="primary" size="small" onClick={onOpenDispatch}>
          {d.expect_staff_name ? '调整派单' : '去派单'}
        </Button>
      </div>
      <div className="wo-kv">
        <span className="wo-kv__label">服务人员</span>
        <span className="wo-kv__value">{d.expect_staff_name || '尚未派单'}</span>
      </div>
      <div className="wo-kv">
        <span className="wo-kv__label">派单时间</span>
        <span className="wo-kv__value">{fmt(d.assigned_at)}</span>
      </div>
    </div>
  )
}

/* ===== 派单弹窗（对接 staffs 列表 + dispatch 接口） ===== */
function DispatchModal({
  open,
  wo,
  onClose,
  onDone,
}: {
  open: boolean
  wo: WorkOrderItem
  onClose: () => void
  onDone: () => void
}) {
  const { message } = App.useApp()
  const [staffList, setStaffList] = useState<StaffItem[]>([])
  const [staffLoading, setStaffLoading] = useState(false)
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!open) return
    setStaffLoading(true)
    staffApi
      .getStaffList({ page: 1, page_size: 50, status: 1 })
      .then((res) => setStaffList(res.list))
      .catch(() => {
        // 错误提示由拦截器统一处理
      })
      .finally(() => setStaffLoading(false))
  }, [open])

  const selected = staffList.find((s) => s.id === selectedId)

  const onConfirm = async () => {
    if (!selected) return
    setSubmitting(true)
    try {
      await workOrderApi.dispatchWorkOrder(wo.id, {
        assigned_staff_id: selected.id,
        service_date: dayjs((wo.expected_start_at || Date.now() / 1000) * 1000).format('YYYY-MM-DD'),
        planned_start_at: wo.expected_start_at,
        planned_stop_at: wo.expected_stop_at,
      })
      message.success(`已派单给 ${selected.name}，服务人员助手端同步收到任务`)
      onDone()
    } catch {
      // 错误提示由拦截器统一处理
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      width={860}
      title={null}
      closable={false}
      className="wo-dispatch-modal"
    >
      <div className="wo-modal__head">
        <div>
          <div className="wo-modal__title">派单服务人员</div>
          <div className="wo-modal__sub">
            {wo.wo_no} · {wo.service_name} · {fmt(wo.expected_start_at, 'MM-DD HH:mm')}
          </div>
        </div>
        <Button onClick={onClose}>关闭</Button>
      </div>

      <div className="wo-dispatch__rule">
        <div className="wo-dispatch__rule-title">强制条件：证照有效 + 已获得当前服务项目授权</div>
        <div>预约时段可用仅用于排序和冲突提醒，不会自动禁止选择；资质校验接口待后端补充。</div>
      </div>

      <Spin spinning={staffLoading}>
        <div className="wo-dispatch__table-head">
          <span>服务人员</span>
          <span>岗位</span>
          <span>手机号</span>
          <span>选择</span>
        </div>
        {staffList.map((s) => (
          <div
            key={s.id}
            className={`wo-staff ${s.id === selectedId ? 'wo-staff--active' : ''}`}
            onClick={() => setSelectedId(s.id)}
          >
            <div className="wo-staff__main">
              <span className="wo-assignee__avatar" />
              <div>
                <div className="wo-assignee__name">{s.name}</div>
                <div className="wo-assignee__title">{s.title || '-'}</div>
              </div>
            </div>
            <div className="wo-staff__tags">
              <span className="wo-tag wo-tag--green">
                {s.institutions?.[0]?.position_name || '-'}
              </span>
            </div>
            <div className="wo-staff__slot">
              <div>{s.phone || '-'}</div>
            </div>
            <div className="wo-staff__action">
              {s.upcoming_credential_expire ? (
                <span className="wo-tag wo-tag--orange">资质临期</span>
              ) : (
                <span className="wo-tag wo-tag--blue">可选择</span>
              )}
              <Radio checked={s.id === selectedId} />
            </div>
          </div>
        ))}
        {!staffLoading && staffList.length === 0 && (
          <div className="wo-empty">暂无可派单人员</div>
        )}
      </Spin>

      <div className="wo-modal__note">管理员可在存在时段提醒时继续派单，系统保留确认人和操作时间。</div>
      <div className="wo-modal__footer">
        <Button onClick={onClose}>取消</Button>
        <Button type="primary" disabled={!selected} loading={submitting} onClick={onConfirm}>
          确认派单
        </Button>
      </div>
    </Modal>
  )
}

/* ===== 修改预约弹窗（改期接口待后端补充，当前为演示交互） ===== */
function RescheduleModal({
  open,
  onClose,
  wo,
}: {
  open: boolean
  onClose: () => void
  wo: WorkOrderItem | null
}) {
  const { message } = App.useApp()
  const [date, setDate] = useState<Dayjs | null>(null)
  const [range, setRange] = useState<[Dayjs | null, Dayjs | null] | null>(null)
  const [reason, setReason] = useState('')

  useEffect(() => {
    if (open && wo?.expected_start_at) {
      setDate(dayjs(wo.expected_start_at * 1000))
      setRange([dayjs(wo.expected_start_at * 1000), dayjs((wo.expected_stop_at || 0) * 1000)])
      setReason('')
    }
  }, [open, wo])

  const onSave = () => {
    // TODO: 修改预约 / 改期接口 API v0.1 未定义，待后端补充后接入
    void date
    void range
    message.info('改期接口暂未提供，本次修改未提交')
    onClose()
  }

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      width={720}
      title={null}
      closable={false}
    >
      <div className="wo-modal__head">
        <div>
          <div className="wo-modal__title">修改预约日期和时间</div>
          <div className="wo-modal__sub">
            原预约：{wo ? `${fmt(wo.expected_start_at)} ~ ${fmt(wo.expected_stop_at, 'HH:mm')}` : '-'}
          </div>
        </div>
        <Button onClick={onClose}>关闭</Button>
      </div>

      <div className="wo-reschedule__form">
        <div className="wo-field">
          <div className="wo-field__label">新预约日期</div>
          <DatePicker value={date} onChange={setDate} style={{ width: '100%' }} />
        </div>
        <div className="wo-field">
          <div className="wo-field__label">新预约时段</div>
          <TimePicker.RangePicker
            value={range}
            onChange={(v) => setRange(v)}
            format="HH:mm"
            style={{ width: '100%' }}
          />
        </div>
      </div>
      <div className="wo-field">
        <div className="wo-field__label">改期原因</div>
        <Input.TextArea rows={2} value={reason} onChange={(e) => setReason(e.target.value)} />
      </div>

      <div className="wo-note wo-note--blue">
        改期与冲突校验接口待后端补充；当前保存仅作演示，不会提交。
      </div>
      <div className="wo-modal__footer">
        <Button onClick={onClose}>取消</Button>
        <Button type="primary" onClick={onSave}>
          保存修改
        </Button>
      </div>
    </Modal>
  )
}
