/**
 * 服务工单 - 工单详情（设计稿：预约与联系.png / 资质授权强校验.png）
 * 已对接：
 * - GET  /api/v1/staff/work-orders/:id          工单详情（§9.2）
 * - GET  /api/v1/staff/staffs                 派单候选人员
 * - POST /api/v1/staff/work-orders/:id/dispatch 派单（§9.3）
 * 说明：改期 / 联系结果回写 / 回执接口 API v0.1 未定义，相关操作为演示交互
 */
import { useCallback, useEffect, useState } from 'react'
import { Button, DatePicker, Input, Modal, Spin, TimePicker, App } from 'antd'
import { CheckOutlined } from '@ant-design/icons'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import dayjs, { type Dayjs } from 'dayjs'
import PageContainer from '@/components/PageContainer'
import { workOrderApi } from '@/api'
import { WO_STATUS_MAP, type WorkOrderItem } from '@/api/modules/work-order'
import DispatchBoard from './DispatchBoard'
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

/** 工单状态 → 当前所处步骤下标（对齐最新 WO_STATUS_MAP） */
const STATUS_STAGE: Record<number, number> = {
  1: 0, // 待派单
  8: 0, // 已取消
  2: 1, // 待接单(已派单)
  3: 1, // 待服务
  4: 2, // 服务中
  9: 2, // 服务终止
  5: 4, // 已完成
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
        <DispatchBoard
          open={dispatchOpen}
          orders={[detail]}
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
              {fmt(d.expected_start_at, 'HH:mm')} — {fmt(d.expected_start_at + (d.duration || 0) * 60, 'HH:mm')}
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
          <span className="wo-kv__value">{d.work_order_no || '-'}</span>
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
            {fmt(d.expected_start_at)} ~ {fmt(d.expected_start_at + (d.duration || 0) * 60, 'HH:mm')}
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
      setRange([
        dayjs(wo.expected_start_at * 1000),
        dayjs((wo.expected_start_at + (wo.duration || 0) * 60) * 1000),
      ])
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
            原预约：{wo ? `${fmt(wo.expected_start_at)} ~ ${fmt(wo.expected_start_at + (wo.duration || 0) * 60, 'HH:mm')}` : '-'}
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
