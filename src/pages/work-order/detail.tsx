/**
 * 服务工单 - 工单详情（设计稿：预约与联系.png / 资质授权强校验.png / 时段冲突建议重派.png / 原人员可保留.png）
 * 步骤条 + 多 Tab 履约管理；派单与修改预约为弹窗交互
 * TODO: 接入后端后替换为 workOrderApi（API §9）；资质校验/改期留痕接口待后端补充
 */
import { useMemo, useState } from 'react'
import { Button, Checkbox, Input, Modal, Radio, Select, message } from 'antd'
import { CheckCircleFilled, CheckOutlined } from '@ant-design/icons'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import PageContainer from '@/components/PageContainer'
import {
  mockDispatchInfo,
  mockDispatchStaff,
  mockReschedule,
  mockWoDetail,
  type MockDispatchStaff,
} from './mock'
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

export default function WorkOrderDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const d = mockWoDetail

  const [activeTab, setActiveTab] = useState(
    () => (searchParams.get('tab') === 'receipt' ? 'receipt' : 'booking'),
  )
  const [dispatchOpen, setDispatchOpen] = useState(() => searchParams.get('dispatch') === '1')
  const [rescheduleOpen, setRescheduleOpen] = useState(
    () => searchParams.get('reschedule') === '1',
  )

  const openReschedule = () => {
    setRescheduleOpen(true)
    searchParams.delete('reschedule')
    setSearchParams(searchParams, { replace: true })
  }

  return (
    <div className="wo-page">
      <PageContainer
        title="服务工单详情"
        description={`关联订单 ${d.orderNo} · ${d.source} ${d.appointmentText}`}
        extra={<Button onClick={() => navigate('/work-order')}>返回列表</Button>}
      >
        {/* 状态行 */}
        <div className="wo-detail__status">
          {d.statusTags.map((t) => (
            <span key={t.text} className={`wo-tag wo-tag--${t.tone}`}>
              {t.text}
            </span>
          ))}
          <span className="wo-detail__status-note">
            服务人员助手端将于服务前一天收到联系任务并解锁联系方式
          </span>
        </div>

        {/* 履约步骤条 */}
        <div className="wo-card wo-steps">
          {d.steps.map((s, i) => (
            <div key={s.title} className="wo-steps__item">
              <div
                className={`wo-steps__node wo-steps__node--${s.state}`}
              >
                {s.state === 'done' ? <CheckOutlined /> : i + 1}
              </div>
              <div className="wo-steps__body">
                <div className={`wo-steps__title wo-steps__title--${s.state}`}>{s.title}</div>
                <div className="wo-steps__desc">{s.desc}</div>
              </div>
              {i < d.steps.length - 1 && (
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

        {activeTab === 'booking' && (
          <BookingTab onOpenReschedule={openReschedule} />
        )}
        {activeTab === 'basic' && <BasicTab />}
        {activeTab === 'dispatch' && <DispatchTab onOpenDispatch={() => setDispatchOpen(true)} />}
        {activeTab === 'fulfill' && (
          <div className="wo-card">
            <div className="wo-card__header">
              <span className="wo-card__title">履约记录</span>
            </div>
            <div className="wo-empty">服务人员上门签到签退与执行留痕由医护小程序端回写，当前暂无履约记录。</div>
          </div>
        )}
        {activeTab === 'receipt' && (
          <div className="wo-card">
            <div className="wo-card__header">
              <span className="wo-card__title">服务回执</span>
            </div>
            <div className="wo-empty">
              服务完成后由服务人员上传服务回执；当前工单未到回执阶段。可在工单列表对「待回执」工单执行确认回执。
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
            <div className="wo-empty">暂无改期记录。用户要求改期时，联系结果将标记为「用户要求改期」。</div>
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
      </PageContainer>

      <DispatchModal
        open={dispatchOpen}
        onClose={() => setDispatchOpen(false)}
        onConfirm={(staff) => {
          // TODO: 接入后端后调用 workOrderApi.dispatchWorkOrder（API §9.3）
          message.success(`已派单给 ${staff.name}，服务人员助手端同步收到任务`)
          setDispatchOpen(false)
        }}
      />
      <RescheduleModal open={rescheduleOpen} onClose={() => setRescheduleOpen(false)} woId={id} />
    </div>
  )
}

/* ===== 预约与联系 Tab ===== */
function BookingTab({ onOpenReschedule }: { onOpenReschedule: () => void }) {
  const d = mockWoDetail
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
            <span className="wo-kv__value">{d.booking.date}</span>
          </div>
          <div className="wo-kv">
            <span className="wo-kv__label">预约时段</span>
            <span className="wo-kv__value">{d.booking.slot}</span>
          </div>
          <div className="wo-kv">
            <span className="wo-kv__label">下单时间</span>
            <span className="wo-kv__value">{d.booking.orderedAt}</span>
          </div>
          <div className="wo-kv">
            <span className="wo-kv__label">服务地址</span>
            <span className="wo-kv__value">{d.booking.address}</span>
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
          <div className="wo-assignee">
            <span className="wo-assignee__avatar" />
            <div>
              <div className="wo-assignee__name">{d.assignee.name}</div>
              <div className="wo-assignee__title">{d.assignee.title}</div>
            </div>
            <div className="wo-assignee__tags">
              {d.assignee.tags.map((t) => (
                <span key={t} className="wo-tag wo-tag--green">
                  {t}
                </span>
              ))}
            </div>
          </div>
          <div className="wo-kv">
            <span className="wo-kv__label">派单时间</span>
            <span className="wo-kv__value">{d.assignee.dispatchedAt}</span>
            <span className="wo-kv__label wo-kv__label--gap">时段提示</span>
            <span className="wo-kv__value">{d.assignee.slotHint}</span>
          </div>
          <div className="wo-note">预约时段可用仅作为派单提示，不是强制拦截条件。</div>
          <div className="wo-card__footer">
            <Button>调整派单</Button>
          </div>
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
            <span className="wo-kv__label">推送时间</span>
            <span className="wo-kv__value">{d.contact.pushedAt}</span>
          </div>
          <div className="wo-kv">
            <span className="wo-kv__label">联系对象</span>
            <span className="wo-kv__value">{d.contact.target}</span>
          </div>
          <div className="wo-kv">
            <span className="wo-kv__label">当前结果</span>
            <span className="wo-kv__value wo-text--strong">{d.contact.result}</span>
          </div>
        </div>
        <div className="wo-contact__results">
          <span className="wo-kv__label">联系结果</span>
          <span className="wo-tag wo-tag--green">已确认</span>
          <span className="wo-tag wo-tag--orange">未接通</span>
          <span className="wo-tag wo-tag--purple">用户要求改期</span>
          <span className="wo-tag wo-tag--red">用户取消</span>
        </div>
        <div className="wo-note wo-note--block">
          履约过程中的服务异常在"履约异常"Tab单独记录，与联系确认结果分开管理。
        </div>
        <div className="wo-card__footer">
          <Button>查看联系记录</Button>
          <Button type="primary" onClick={onOpenReschedule}>
            修改预约
          </Button>
        </div>
      </div>
    </>
  )
}

/* ===== 基本信息 Tab ===== */
function BasicTab() {
  const d = mockWoDetail
  return (
    <div className="wo-booking">
      <div className="wo-card">
        <div className="wo-card__header">
          <span className="wo-card__title">服务对象</span>
        </div>
        <div className="wo-kv">
          <span className="wo-kv__label">姓名</span>
          <span className="wo-kv__value">
            {d.member.name}（{d.member.gender} · {d.member.age}岁）
          </span>
        </div>
        <div className="wo-kv">
          <span className="wo-kv__label">联系电话</span>
          <span className="wo-kv__value">{d.member.phone}</span>
        </div>
        <div className="wo-kv">
          <span className="wo-kv__label">既往病种</span>
          <span className="wo-kv__value">{d.member.diseases.join(' / ')}</span>
        </div>
        <div className="wo-kv">
          <span className="wo-kv__label">服务地址</span>
          <span className="wo-kv__value">{d.member.address}</span>
        </div>
      </div>
      <div className="wo-card">
        <div className="wo-card__header">
          <span className="wo-card__title">订单信息</span>
        </div>
        <div className="wo-kv">
          <span className="wo-kv__label">工单编号</span>
          <span className="wo-kv__value">{d.woNo}</span>
        </div>
        <div className="wo-kv">
          <span className="wo-kv__label">关联订单</span>
          <span className="wo-kv__value">{d.orderNo}</span>
        </div>
        <div className="wo-kv">
          <span className="wo-kv__label">订单来源</span>
          <span className="wo-kv__value">{d.source}</span>
        </div>
        <div className="wo-kv">
          <span className="wo-kv__label">预约时间</span>
          <span className="wo-kv__value">{d.appointmentText}</span>
        </div>
      </div>
    </div>
  )
}

/* ===== 派单信息 Tab ===== */
function DispatchTab({ onOpenDispatch }: { onOpenDispatch: () => void }) {
  const d = mockWoDetail
  return (
    <div className="wo-card">
      <div className="wo-card__header">
        <span className="wo-card__title">派单信息</span>
        <Button type="primary" size="small" onClick={onOpenDispatch}>
          调整派单
        </Button>
      </div>
      <div className="wo-kv">
        <span className="wo-kv__label">服务人员</span>
        <span className="wo-kv__value">
          {d.assignee.name}（{d.assignee.title}）
        </span>
      </div>
      <div className="wo-kv">
        <span className="wo-kv__label">派单时间</span>
        <span className="wo-kv__value">{d.assignee.dispatchedAt}</span>
      </div>
      <div className="wo-kv">
        <span className="wo-kv__label">资质授权</span>
        <span className="wo-kv__value">{d.assignee.tags.join(' / ')}</span>
      </div>
      <div className="wo-kv">
        <span className="wo-kv__label">时段提示</span>
        <span className="wo-kv__value">{d.assignee.slotHint}</span>
      </div>
    </div>
  )
}

/* ===== 派单弹窗（设计稿：资质授权强校验.png） ===== */
function DispatchModal({
  open,
  onClose,
  onConfirm,
}: {
  open: boolean
  onClose: () => void
  onConfirm: (staff: MockDispatchStaff) => void
}) {
  const info = mockDispatchInfo
  const [preferAvailable, setPreferAvailable] = useState(true)
  const [selectedId, setSelectedId] = useState<number | null>(
    mockDispatchStaff.find((s) => s.recommended)?.id ?? null,
  )

  const staffList = useMemo(
    () =>
      preferAvailable
        ? [...mockDispatchStaff].sort((a, b) => Number(b.recommended ?? false) - Number(a.recommended ?? false))
        : mockDispatchStaff,
    [preferAvailable],
  )
  const selected = staffList.find((s) => s.id === selectedId)

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
            {info.woNo} · {info.serviceName} · {info.appointmentText}
          </div>
        </div>
        <Button onClick={onClose}>关闭</Button>
      </div>

      <div className="wo-dispatch__rule">
        <div className="wo-dispatch__rule-title">强制条件：证照有效 + 已获得当前服务项目授权</div>
        <div>预约时段可用仅用于排序和冲突提醒，不会自动禁止选择。</div>
      </div>

      <Checkbox
        checked={preferAvailable}
        onChange={(e) => setPreferAvailable(e.target.checked)}
        className="wo-dispatch__prefer"
      >
        优先显示预约时段可用人员
        <span className="wo-dispatch__prefer-sub">关闭后仍只展示资质和服务授权符合的人员</span>
      </Checkbox>

      <div className="wo-dispatch__table-head">
        <span>服务人员</span>
        <span>资质与授权</span>
        <span>预约时段提示</span>
        <span>近期任务</span>
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
              <div className="wo-assignee__title">{s.title}</div>
            </div>
          </div>
          <div className="wo-staff__tags">
            <span className="wo-tag wo-tag--green">{s.credential}</span>
            <span className="wo-tag wo-tag--green">{s.authorization}</span>
          </div>
          <div className="wo-staff__slot">
            <div className={s.slotTone === 'warn' ? 'wo-text--warn' : undefined}>{s.slotHint}</div>
            <div className="wo-row__sub">{s.recentTask}</div>
          </div>
          <div className="wo-staff__action">
            {s.recommended ? (
              <span className="wo-tag wo-tag--green">推荐</span>
            ) : s.slotTone === 'warn' ? (
              <span className="wo-tag wo-tag--orange">仍可选择</span>
            ) : (
              <span className="wo-tag wo-tag--blue">可选择</span>
            )}
            <Radio checked={s.id === selectedId} />
          </div>
        </div>
      ))}

      <div className="wo-modal__note">管理员可在存在时段提醒时继续派单，系统保留确认人和操作时间。</div>
      <div className="wo-modal__footer">
        <Button onClick={onClose}>取消</Button>
        <Button
          type="primary"
          disabled={!selected}
          onClick={() => selected && onConfirm(selected)}
        >
          确认派单
        </Button>
      </div>
    </Modal>
  )
}

/* ===== 修改预约弹窗（设计稿：时段冲突建议重派.png / 原人员可保留.png） ===== */
function RescheduleModal({
  open,
  onClose,
  woId,
}: {
  open: boolean
  onClose: () => void
  woId?: string
}) {
  const r = mockReschedule
  const navigate = useNavigate()
  const [date, setDate] = useState(r.defaultDate)
  const [slot, setSlot] = useState('10:00—11:00')
  const [reason, setReason] = useState(r.defaultReason)
  const [mode, setMode] = useState<'redispatch' | 'keep'>('redispatch')
  const [keepChecked, setKeepChecked] = useState(false)
  const [keepStaff, setKeepStaff] = useState(true)

  const conflict = slot === r.conflictSlot
  const newText = `${date.replace('2026年', '')} ${slot}`

  const reset = () => {
    setDate(r.defaultDate)
    setSlot('10:00—11:00')
    setReason(r.defaultReason)
    setMode('redispatch')
    setKeepChecked(false)
    setKeepStaff(true)
  }

  const onSave = () => {
    if (conflict) {
      if (mode === 'keep' && !keepChecked) {
        message.warning('保留原服务人员前，请确认已核实人员实际可以按新时段服务')
        return
      }
      // TODO: 改期 + 重新派单接口待后端补充
      message.success(
        mode === 'redispatch'
          ? '已保存新预约并清空原派单，工单回到"待重新派单"状态'
          : '已保存新预约并保留原服务人员，冲突确认已留痕',
      )
    } else {
      // TODO: 修改预约接口待后端补充
      message.success(`已保存修改，${keepStaff ? '保留原服务人员，' : ''}服务人员助手端同步收到更新`)
    }
    reset()
    onClose()
    if (conflict && mode === 'redispatch') navigate('/work-order')
    void woId
  }

  return (
    <Modal
      open={open}
      onCancel={() => {
        reset()
        onClose()
      }}
      footer={null}
      width={720}
      title={null}
      closable={false}
    >
      <div className="wo-modal__head">
        <div>
          <div className="wo-modal__title">修改预约日期和时间</div>
          <div className="wo-modal__sub">来源：{r.source}</div>
        </div>
        <div className="wo-modal__head-side">
          {conflict && <span className="wo-tag wo-tag--orange">检测到时段提醒</span>}
          <Button
            onClick={() => {
              reset()
              onClose()
            }}
          >
            关闭
          </Button>
        </div>
      </div>

      {conflict ? (
        <div className="wo-reschedule__summary">
          原预约：{r.origin.replace('2026年', '')} <span className="wo-reschedule__arrow">→</span>{' '}
          新预约：{newText}
        </div>
      ) : (
        <div className="wo-reschedule__origin">
          <div>
            <div className="wo-kv__label">原预约</div>
            <div className="wo-reschedule__origin-value">{r.origin}</div>
          </div>
          <div className="wo-reschedule__origin-staff">原服务人员：{r.originStaff}</div>
        </div>
      )}

      <div className="wo-reschedule__form">
        <div className="wo-field">
          <div className="wo-field__label">新预约日期</div>
          <Input value={date} onChange={(e) => setDate(e.target.value)} />
        </div>
        <div className="wo-field">
          <div className="wo-field__label">新预约时段</div>
          <Select
            value={slot}
            onChange={setSlot}
            options={r.slotOptions.map((s) => ({ value: s, label: s }))}
          />
        </div>
      </div>
      <div className="wo-field">
        <div className="wo-field__label">改期原因</div>
        <Input.TextArea rows={2} value={reason} onChange={(e) => setReason(e.target.value)} />
      </div>

      {conflict ? (
        <>
          <div className="wo-reschedule__conflict">
            <div className="wo-reschedule__conflict-title">
              原服务人员{r.conflictStaff}在新时段已有服务任务
            </div>
            <div>时段可用不是强制条件，管理员仍可选择保留；系统将记录冲突确认。</div>
          </div>
          <div className="wo-field__label">处理方式</div>
          <div
            className={`wo-reschedule__option ${mode === 'redispatch' ? 'wo-reschedule__option--active' : ''}`}
            onClick={() => setMode('redispatch')}
          >
            <Radio checked={mode === 'redispatch'} />
            <div>
              <div className="wo-reschedule__option-title">转为待重新派单（推荐）</div>
              <div className="wo-reschedule__option-desc">
                保存新预约后清空原派单，回到"待重新派单"状态。
              </div>
            </div>
          </div>
          <div
            className={`wo-reschedule__option ${mode === 'keep' ? 'wo-reschedule__option--active' : ''}`}
            onClick={() => setMode('keep')}
          >
            <Radio checked={mode === 'keep'} />
            <div>
              <div className="wo-reschedule__option-title">保留原服务人员</div>
              <div className="wo-reschedule__option-desc">
                允许继续保存，但需管理员确认已核实排班冲突。
              </div>
              {mode === 'keep' && (
                <Checkbox
                  checked={keepChecked}
                  onChange={(e) => setKeepChecked(e.target.checked)}
                  onClick={(e) => e.stopPropagation()}
                >
                  我已核实人员实际可以按新时段服务
                </Checkbox>
              )}
            </div>
          </div>
          <div className="wo-note wo-note--blue">
            操作留痕：记录改期人、原/新预约、处理方式和冲突确认结果。
          </div>
        </>
      ) : (
        <div className="wo-reschedule__pass">
          <div className="wo-reschedule__pass-title">
            <CheckCircleFilled /> 校验结果：原服务人员仍可保留
          </div>
          <div className="wo-reschedule__checks">
            {r.checks.map((c) => (
              <div key={c.label} className="wo-reschedule__check">
                <span className="wo-kv__label">{c.label}</span>
                <span className="wo-tag wo-tag--green">{c.value}</span>
              </div>
            ))}
          </div>
          <Checkbox checked={keepStaff} onChange={(e) => setKeepStaff(e.target.checked)}>
            <span className="wo-reschedule__keep-title">保留原服务人员：{r.originStaff}</span>
            <div className="wo-reschedule__option-desc">
              保存后无需重新派单，服务人员助手端同步收到更新
            </div>
          </Checkbox>
        </div>
      )}

      <div className="wo-modal__footer">
        {conflict ? (
          <>
            <Button
              onClick={() => {
                reset()
                onClose()
              }}
            >
              取消
            </Button>
            <Button type="primary" onClick={onSave}>
              保存并待重新派单
            </Button>
          </>
        ) : (
          <>
            <Button onClick={() => setSlot(r.conflictSlot)}>查看冲突示例</Button>
            <Button type="primary" onClick={onSave}>
              保存修改
            </Button>
          </>
        )}
      </div>
    </Modal>
  )
}
