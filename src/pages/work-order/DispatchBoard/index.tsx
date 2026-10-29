/**
 * 服务工单 - 排单板（批量派单，Drawer 全高抽屉）
 * 思路：
 * - 每张工单默认方案 = 客户期望时间 + 期望医护，板上直接呈现冲突与否
 * - 工单块显示 work_order_no + member_name；绿色 = 无冲突可派，红色 = 冲突
 * - 每个工单的客户期望位置用「浅绿虚线幽灵块」标在期望人员的行上（重叠竖向堆叠），
 *   方案落在期望位时幽灵块自动隐去；无期望医护的工单无幽灵块
 * - 待分配池：时间条上方的独立卡片（与表格视觉分离），无期望人员 / 期望时间的工单默认放入；
 *   跨天共享，不受顶部日期筛选约束；可把工单拖回池中重新分配
 * - 冲突时拖拽（或先点选工单块、再点击空档）调整人员 / 时段；
 *   拖拽按抓取点偏移落位，块落在视觉上看到的位置
 * - 状态提示（无冲突 / N 单冲突）位于底部左下角；
 *   「确认派单（N）」批量提交所有无冲突且已分配的工单；其余留板继续调整
 * 数据来源：候选人员、待派单队列、人员排班及派单提交均使用真实接口。
 */
import { useEffect, useMemo, useRef, useState } from 'react'
import type { DragEvent as ReactDragEvent, MouseEvent as ReactMouseEvent } from 'react'
import { Button, DatePicker, Drawer, Spin, Tooltip, App } from 'antd'
import { CheckCircleFilled, WarningFilled, CloseOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'
import { scheduleApi, staffApi, workOrderApi } from '@/api'
import type { WorkOrderItem } from '@/api/modules/work-order'
import {
  BOARD_END,
  BOARD_START,
  SLOT_STEP,
  findConflicts,
  fmtMin,
  overlaps,
  timeToMinutes,
  type BusyBlock,
  type DispatchCandidate,
} from './board-utils'
import './index.less'

type Candidate = DispatchCandidate

/** staffId = 0 表示在待分配池中 */
const POOL_STAFF_ID = 0

interface Plan {
  staffId: number
  startMin: number
}

/** 事件坐标 → 轨道上的分钟数（吸附到 SLOT_STEP） */
function pointerMin(clientX: number, track: HTMLElement): number {
  const rect = track.getBoundingClientRect()
  const ratio = Math.min(Math.max((clientX - rect.left) / rect.width, 0), 1)
  return Math.round((BOARD_START + ratio * (BOARD_END - BOARD_START)) / SLOT_STEP) * SLOT_STEP
}

/** 起始分钟钳制在排单板范围内（保证整段不越界） */
const clampStart = (m: number, dur: number) =>
  Math.min(Math.max(m, BOARD_START), BOARD_END - dur)

export default function DispatchBoard({
  open,
  orders,
  onClose,
  onDone,
}: {
  open: boolean
  /** 真实待派工单 */
  orders: WorkOrderItem[]
  onClose: () => void
  /** 板上工单全部派完时回调（父级关闭并刷新列表） */
  onDone: () => void
}) {
  const { message } = App.useApp()
  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [loading, setLoading] = useState(false)
  const [plans, setPlans] = useState<Record<number, Plan>>({})
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [doneIds, setDoneIds] = useState<number[]>([])
  const [schedules, setSchedules] = useState<Map<number, BusyBlock[]>>(new Map())
  const [dateStr, setDateStr] = useState(() =>
    orders.length > 0
      ? dayjs(orders[0].expected_start_at * 1000).format('YYYY-MM-DD')
      : dayjs().format('YYYY-MM-DD'),
  )
  /** 拖拽抓取点偏移（分钟）：落点 = 指针位置 - 偏移，块落在视觉位置 */
  const dragRef = useRef<{ id: number; offset: number } | null>(null)

  const allOrders = orders

  /* 服务时长（分钟）→ 块长，吸附 30 分钟粒度，最小 1 格 */
  const durationOf = (o: WorkOrderItem) =>
    Math.max(SLOT_STEP, Math.round(((o.duration || 60)) / SLOT_STEP) * SLOT_STEP)
  const expectedMinOf = (o: WorkOrderItem) => {
    const d = dayjs((o.expected_start_at || 0) * 1000)
    const snapped = Math.round((d.hour() * 60 + d.minute()) / SLOT_STEP) * SLOT_STEP
    return Math.min(Math.max(snapped, BOARD_START), BOARD_END - durationOf(o))
  }
  const matchExpected = (o: WorkOrderItem): Candidate | undefined =>
    candidates.find((s) => s.id === o.expect_staff) ??
    candidates.find((s) => s.name && s.name === o.expect_staff_name)

  /* 当前日期的工单（排除已派出） */
  const dayOrders = useMemo(
    () =>
      allOrders.filter(
        (o) =>
          dayjs(o.expected_start_at * 1000).format('YYYY-MM-DD') === dateStr &&
          !doneIds.includes(o.id),
      ),
    [allOrders, dateStr, doneIds],
  )

  /* 待分配池：跨天共享，不受日期筛选约束 */
  const poolOrders = useMemo(
    () => allOrders.filter((o) => plans[o.id]?.staffId === POOL_STAFF_ID && !doneIds.includes(o.id)),
    [allOrders, plans, doneIds],
  )

  /* 工单条 / 点选用清单 = 当日工单 ∪ 池内工单 */
  const chipOrders = useMemo(
    () => [...dayOrders, ...poolOrders.filter((o) => !dayOrders.some((d) => d.id === o.id))],
    [dayOrders, poolOrders],
  )

  /* 打开时加载真实候选人员，无数据或请求失败均不生成演示人员。 */
  useEffect(() => {
    if (!open) return
    setLoading(true)
    staffApi
      .getStaffList({ page: 1, page_size: 100, status: 1 })
      .then((res) => {
        setCandidates(res.list.map((staff) => ({
          id: staff.id,
          name: staff.name,
          position_name: staff.position_name || '-',
          title: staff.title || '',
          phone: staff.phone || '',
          upcoming_credential_expire: staff.upcoming_credential_expire,
        })))
      })
      .catch(() => {
        // 错误提示由拦截器统一处理
        setCandidates([])
      })
      .finally(() => setLoading(false))
  }, [open])

  /* 按当前日期读取真实人员排班，用于时段冲突提示。 */
  useEffect(() => {
    if (!open) return
    setLoading(true)
    scheduleApi
      .getSchedules({ page: 1, page_size: 200, view: 'day', date: dateStr })
      .then((res) => {
        const next = new Map<number, BusyBlock[]>()
        res.list.forEach((item) => {
          if (!item.staff_id || item.status === 9) return
          const startMin = timeToMinutes(item.start_time)
          const endMin = timeToMinutes(item.end_time)
          if (startMin == null || endMin == null || endMin <= startMin) return
          const blocks = next.get(item.staff_id) ?? []
          blocks.push({ startMin, endMin, title: item.remark || '已排安排' })
          next.set(item.staff_id, blocks)
        })
        setSchedules(next)
      })
      .catch(() => {
        // 请求失败时不使用模拟排班，避免产生虚假冲突。
        setSchedules(new Map())
      })
      .finally(() => setLoading(false))
  }, [open, dateStr])

  /* 初始化默认方案：期望人员 + 期望时段；
     无期望人员 / 期望时间的工单进入待分配池（位置取期望时间，无则 08:00 起） */
  useEffect(() => {
    if (!open || candidates.length === 0) return
    setPlans((prev) => {
      const next = { ...prev }
      allOrders.forEach((o) => {
        if (next[o.id] || doneIds.includes(o.id)) return
        const exp = matchExpected(o)
        if (exp && o.expected_start_at) {
          next[o.id] = { staffId: exp.id, startMin: expectedMinOf(o) }
        } else {
          next[o.id] = {
            staffId: POOL_STAFF_ID,
            startMin: o.expected_start_at ? expectedMinOf(o) : BOARD_START,
          }
        }
      })
      return next
    })
    setSelectedId(
      (prev) => prev ?? allOrders.find((o) => !doneIds.includes(o.id))?.id ?? null,
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, candidates, allOrders])

  /** 某工单方案的冲突：人员已有安排 + 同人员其他工单方案（池内工单不参与） */
  const conflictOf = (o: WorkOrderItem) => {
    const p = plans[o.id]
    if (!p || p.staffId === POOL_STAFF_ID) return { busy: [] as BusyBlock[], orders: [] as WorkOrderItem[] }
    const dur = durationOf(o)
    const busy = findConflicts(schedules.get(p.staffId) ?? [], p.startMin, p.startMin + dur)
    const others = dayOrders.filter((x) => {
      if (x.id === o.id) return false
      const q = plans[x.id]
      return (
        q?.staffId === p.staffId &&
        overlaps(q.startMin, q.startMin + durationOf(x), p.startMin, p.startMin + dur)
      )
    })
    return { busy, orders: others }
  }
  const hasConflict = (o: WorkOrderItem) => {
    const c = conflictOf(o)
    return c.busy.length > 0 || c.orders.length > 0
  }
  const isExpectedPlan = (o: WorkOrderItem) => {
    const p = plans[o.id]
    const exp = matchExpected(o)
    return !!p && !!exp && p.staffId === exp.id && p.startMin === expectedMinOf(o)
  }

  const conflictCount = dayOrders.filter(hasConflict).length
  const okOrders = dayOrders.filter(
    (o) => plans[o.id] && plans[o.id].staffId !== POOL_STAFF_ID && !hasConflict(o),
  )

  /** 尝试把工单放到某人某时段（staffId = 0 为待分配池，不做冲突校验）；冲突则拒绝并提示 */
  const tryPlace = (orderId: number, staffId: number, startMin: number) => {
    const o = chipOrders.find((x) => x.id === orderId)
    if (!o) return
    if (staffId === POOL_STAFF_ID) {
      setPlans((prev) => ({ ...prev, [orderId]: { staffId, startMin } }))
      return
    }
    const dur = durationOf(o)
    const busy = findConflicts(schedules.get(staffId) ?? [], startMin, startMin + dur)
    if (busy.length > 0) {
      message.warning(
        `${o.member_name}：该时段与「${busy[0].title} ${fmtMin(busy[0].startMin)}~${fmtMin(busy[0].endMin)}」冲突，请拖到空档`,
      )
      return
    }
    const others = dayOrders.filter((x) => {
      if (x.id === orderId) return false
      const q = plans[x.id]
      return q?.staffId === staffId && overlaps(q.startMin, q.startMin + durationOf(x), startMin, startMin + dur)
    })
    if (others.length > 0) {
      message.warning(`${o.member_name}：该时段已排「${others[0].member_name}」的工单，请错开`)
      return
    }
    setPlans((prev) => ({ ...prev, [orderId]: { staffId, startMin } }))
  }

  /** 批量确认：提交所有无冲突且已分配的工单，其余留板 */
  const onConfirm = async () => {
    if (okOrders.length === 0) return
    setSubmitting(true)
    const dispatched: number[] = []
    for (const o of okOrders) {
      const p = plans[o.id]
      const startAt = dayjs(dateStr).startOf('day').add(p.startMin, 'minute').unix()
      try {
        await workOrderApi.dispatchWorkOrder(o.id, {
          assigned_staff_id: p.staffId,
          service_date: dateStr,
          planned_start_at: startAt,
          planned_stop_at: startAt + durationOf(o) * 60,
        })
        dispatched.push(o.id)
      } catch {
        // 单笔失败不中断批量，错误提示由拦截器统一处理
      }
    }
    setSubmitting(false)
    if (dispatched.length > 0) {
      setDoneIds((prev) => [...prev, ...dispatched])
      setPlans((prev) => {
        const next = { ...prev }
        dispatched.forEach((id) => delete next[id])
        return next
      })
      const remain = allOrders.filter(
        (o) => !doneIds.includes(o.id) && !dispatched.includes(o.id),
      ).length
      message.success(
        `已派单 ${dispatched.length} 单，助手端同步收到任务${remain > 0 ? `，剩余 ${remain} 单待调整` : ''}`,
      )
      if (remain === 0) onDone()
    }
  }

  const rangePct = (startMin: number, endMin: number) => ({
    left: `${((startMin - BOARD_START) / (BOARD_END - BOARD_START)) * 100}%`,
    width: `${((endMin - startMin) / (BOARD_END - BOARD_START)) * 100}%`,
  })

  const hours: number[] = []
  for (let h = BOARD_START; h <= BOARD_END; h += 60) hours.push(h)

  const woShort = (o: WorkOrderItem) => o.work_order_no?.split('-').pop() || o.work_order_no

  /** 工单块共用：拖拽开始（记录抓取点偏移） */
  const onBlockDragStart = (e: ReactDragEvent<HTMLDivElement>, o: WorkOrderItem, startMin: number) => {
    setSelectedId(o.id)
    const track = e.currentTarget.parentElement
    dragRef.current = {
      id: o.id,
      offset: track ? pointerMin(e.clientX, track) - startMin : 0,
    }
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', String(o.id))
  }

  /** 轨道共用：落点分钟数（扣除抓取偏移，吸附 + 钳制） */
  const dropMinOf = (e: ReactDragEvent<HTMLDivElement> | ReactMouseEvent<HTMLDivElement>, track: HTMLElement, o: WorkOrderItem) => {
    const offset = dragRef.current?.id === o.id ? dragRef.current.offset : 0
    return clampStart(pointerMin(e.clientX, track) - offset, durationOf(o))
  }

  /* 待分配池泳道：水平重叠的池内工单竖向堆叠 */
  const poolLane = new Map<number, number>()
  const poolLaneEnds: number[] = []
  ;[...poolOrders]
    .sort((a, b) => (plans[a.id]?.startMin ?? 0) - (plans[b.id]?.startMin ?? 0))
    .forEach((o) => {
      const p = plans[o.id]
      if (!p) return
      let lane = poolLaneEnds.findIndex((end) => end <= p.startMin)
      if (lane === -1) {
        lane = poolLaneEnds.length
        poolLaneEnds.push(0)
      }
      poolLaneEnds[lane] = p.startMin + durationOf(o)
      poolLane.set(o.id, lane)
    })
  const poolH = Math.max(52, poolLaneEnds.length * 46 + 6)

  /** 工单块渲染（人员行与待分配池共用） */
  const renderPlanBlock = (o: WorkOrderItem, p: Plan, inPool: boolean, lane = 0) => {
    const conflict = !inPool && hasConflict(o)
    return (
      <div
        key={o.id}
        className={`wo-board__plan ${
          inPool ? 'wo-board__plan--pool' : conflict ? 'wo-board__plan--conflict' : ''
        } ${o.id === selectedId ? 'wo-board__plan--selected' : ''}`}
        style={
          inPool
            ? { ...rangePct(p.startMin, p.startMin + durationOf(o)), top: 6 + lane * 46, height: 40 }
            : rangePct(p.startMin, p.startMin + durationOf(o))
        }
        draggable
        onDragStart={(e) => onBlockDragStart(e, o, p.startMin)}
        onClick={(e) => {
          e.stopPropagation()
          setSelectedId(o.id)
        }}
        title={`${o.work_order_no} · ${o.member_name} · ${o.service_name}　期望：${o.expect_staff_name || '无'} ${fmtMin(expectedMinOf(o))}~${fmtMin(expectedMinOf(o) + durationOf(o))}　拖动或点选后点击空档调整`}
      >
        <span className="wo-board__plan-text">
          <span className="wo-board__plan-no">{o.work_order_no}</span>
          <span className="wo-board__plan-name">{o.member_name}</span>
        </span>
      </div>
    )
  }

  return (
    <Drawer
      open={open}
      onClose={onClose}
      width={1200}
      title={null}
      className="wo-dispatch-modal"
    >
      <div className="wo-modal__head">
        <div style={{flex: 1}}>
          <div className="wo-modal__title">
            <div>
              {chipOrders.length > 1 ? `排单板 · 批量派单（${chipOrders.length} 单）` : '排单板 · 派单'}
              <DatePicker
                value={dayjs(dateStr)}
                onChange={(d) => d && setDateStr(d.format('YYYY-MM-DD'))}
                allowClear={false}
              />
            </div>
            <Button type="text" icon={<CloseOutlined />} onClick={onClose} />
          </div>
          <div className="wo-modal__sub">
            绿色 = 无冲突可派，红色 = 冲突，浅绿虚线框 = 客户期望位置；「待分配」栏拖入人员行完成分配
          </div>
        </div>
      </div>

      {/* 工单条：点选后点击轨道空档即可放置 */}
      {chipOrders.length > 0 && (
        <div className="wo-board__chips">
          {chipOrders.map((o) => (
            <span
              key={o.id}
              className={`wo-board__chip ${
                hasConflict(o)
                  ? 'wo-board__chip--conflict'
                  : isExpectedPlan(o)
                    ? 'wo-board__chip--ok'
                    : 'wo-board__chip--adjusted'
              } ${o.id === selectedId ? 'wo-board__chip--selected' : ''}`}
              onClick={() => setSelectedId(o.id)}
              title={`${o.work_order_no} · ${o.service_name} · 期望 ${o.expect_staff_name || '无'} ${fmtMin(expectedMinOf(o))}~${fmtMin(expectedMinOf(o) + durationOf(o))}`}
            >
              {woShort(o)} {o.member_name}
            </span>
          ))}
        </div>
      )}

      {/* 待分配池：时间条上方的独立卡片（与表格视觉分离），跨天共享，可拖回重新分配 */}
      <div className="wo-pool">
        <div className="wo-pool__label">
          <div className="wo-pool__name">
            待分配
            <span className="wo-pool__count">{poolOrders.length} 单</span>
          </div>
          <div className="wo-pool__sub">拖入人员行完成分配</div>
        </div>
        <div
          className="wo-pool__track"
          style={{ height: poolH }}
          onClick={(e) => {
            if (selectedId == null) return
            const o = chipOrders.find((x) => x.id === selectedId)
            if (o) tryPlace(selectedId, POOL_STAFF_ID, dropMinOf(e, e.currentTarget, o))
          }}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault()
            const id = Number(e.dataTransfer.getData('text/plain')) || selectedId
            if (id == null) return
            const o = chipOrders.find((x) => x.id === id)
            if (o) tryPlace(id, POOL_STAFF_ID, dropMinOf(e, e.currentTarget, o))
          }}
        >
          {poolOrders.map((o) => {
            const p = plans[o.id]
            if (!p) return null
            return renderPlanBlock(o, p, true, poolLane.get(o.id) ?? 0)
          })}
          {poolOrders.length === 0 && <span className="wo-pool__hint">无待分配工单</span>}
        </div>
      </div>

      <Spin spinning={loading} style={{ flex: 1, overflow: 'auto' }}>
        <div className="wo-board">
          {/* 时间刻度头 */}
          <div className="wo-board__head">
            <div className="wo-board__staff wo-board__staff--head">服务人员</div>
            <div className="wo-board__track wo-board__track--head">
              {hours.map((h) => (
                <span
                  key={h}
                  className="wo-board__hour"
                  style={{ left: `${((h - BOARD_START) / (BOARD_END - BOARD_START)) * 100}%` }}
                >
                  {fmtMin(h)}
                </span>
              ))}
            </div>
          </div>

          {/* 人员行 */}
          {candidates.map((c) => {
            const blocks = schedules.get(c.id) ?? []
            /* 该人员的全部期望条目（含已满足），悬停「期望 ×N」展示明细 */
            const expAll = dayOrders.filter((o) => matchExpected(o)?.id === c.id)
            /* 未满足的期望幽灵块：水平重叠的竖向堆叠（区间泳道分配），最多 2 行，更多折叠为 +N */
            const ghosts = expAll
              .filter((o) => !isExpectedPlan(o))
              .sort((a, b) => expectedMinOf(a) - expectedMinOf(b))
            const laneEnds: number[] = []
            const ghostLane = new Map<number, number>()
            ghosts.forEach((o) => {
              const s = expectedMinOf(o)
              const e = s + durationOf(o)
              let lane = laneEnds.findIndex((end) => end <= s)
              if (lane === -1) {
                lane = laneEnds.length
                laneEnds.push(0)
              }
              laneEnds[lane] = e
              ghostLane.set(o.id, lane)
            })
            const MAX_GHOST_LANES = 2
            const visibleGhosts = ghosts.filter((o) => (ghostLane.get(o.id) ?? 0) < MAX_GHOST_LANES)
            const hiddenGhosts = ghosts.filter((o) => (ghostLane.get(o.id) ?? 0) >= MAX_GHOST_LANES)
            const ghostZone =
              laneEnds.length > 0 ? Math.min(laneEnds.length, MAX_GHOST_LANES) * 18 + 6 : 0
            return (
              <div key={c.id} className="wo-board__row">
                <div className="wo-board__staff">
                  <div className="wo-board__staff-name">
                    {c.name}
                    {expAll.length > 0 && (
                      <Tooltip
                        title={
                          <div>
                            {expAll.map((o) => (
                              <div key={o.id}>
                                {o.member_name} · {fmtMin(expectedMinOf(o))}~
                                {fmtMin(expectedMinOf(o) + durationOf(o))}
                              </div>
                            ))}
                          </div>
                        }
                      >
                        <span className="wo-tag wo-tag--green">期望 ×{expAll.length}</span>
                      </Tooltip>
                    )}
                  </div>
                  {/* <div className="wo-board__staff-sub">
                    {c.position_name}
                    {c.upcoming_credential_expire ? (
                      <span className="wo-tag wo-tag--orange">资质临期</span>
                    ) : (
                      <span className="wo-tag wo-tag--green">可派</span>
                    )}
                  </div> */}
                </div>
                <div
                  className="wo-board__track"
                  style={{ height: 52 + ghostZone }}
                  onClick={(e) => {
                    if (selectedId == null) return
                    const o = chipOrders.find((x) => x.id === selectedId)
                    if (o) tryPlace(selectedId, c.id, dropMinOf(e, e.currentTarget, o))
                  }}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault()
                    const id = Number(e.dataTransfer.getData('text/plain')) || selectedId
                    if (id == null) return
                    const o = chipOrders.find((x) => x.id === id)
                    if (o) tryPlace(id, c.id, dropMinOf(e, e.currentTarget, o))
                  }}
                >
                  {blocks.map((b, i) => (
                    <div
                      key={i}
                      className="wo-board__busy"
                      style={rangePct(b.startMin, b.endMin)}
                      title={`${b.title} ${fmtMin(b.startMin)}~${fmtMin(b.endMin)}`}
                      onClick={(e) => e.stopPropagation()}
                    >
                      {b.title}
                    </div>
                  ))}

                  {/* 客户期望位置（浅绿虚线幽灵块，重叠竖向堆叠，更多折叠为 +N） */}
                  {visibleGhosts.map((o) => {
                    const em = expectedMinOf(o)
                    const lane = ghostLane.get(o.id) ?? 0
                    return (
                      <div
                        key={`exp-${o.id}`}
                        className="wo-board__expect"
                        style={{
                          ...rangePct(em, em + durationOf(o)),
                          top: 52 + lane * 18,
                          height: 16,
                        }}
                        title={`${o.member_name} 的客户期望：${c.name} ${fmtMin(em)}~${fmtMin(em + durationOf(o))}`}
                        onClick={(e) => e.stopPropagation()}
                      >
                        期望·{o.member_name}
                      </div>
                    )
                  })}
                  {hiddenGhosts.length > 0 && (
                    <Tooltip
                      title={
                        <div>
                          {hiddenGhosts.map((o) => (
                            <div key={o.id}>
                              {o.member_name} · 期望 {fmtMin(expectedMinOf(o))}~
                              {fmtMin(expectedMinOf(o) + durationOf(o))}
                            </div>
                          ))}
                        </div>
                      }
                    >
                      <span
                        className="wo-board__expect-more"
                        style={{ top: 52 }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        +{hiddenGhosts.length}
                      </span>
                    </Tooltip>
                  )}

                  {/* 工单方案块（work_order_no + member_name，可拖拽） */}
                  {dayOrders.map((o) => {
                    const p = plans[o.id]
                    if (!p || p.staffId !== c.id) return null
                    return renderPlanBlock(o, p, false)
                  })}
                </div>
              </div>
            )
          })}
          {!loading && chipOrders.length === 0 && (
            <div className="wo-empty">该日期暂无待派工单，可切换日期查看</div>
          )}
        </div>
      </Spin>

      <div className="wo-modal__footer">
        {/* 状态提示（底部左下角）：无冲突 / N 单冲突 */}
        {dayOrders.length > 0 &&
          (conflictCount === 0 ? (
            <span className="wo-board__banner wo-board__banner--ok">
              <CheckCircleFilled />
              {dayOrders.length} 单均无冲突，可一键批量派单
            </span>
          ) : (
            <span className="wo-board__banner wo-board__banner--conflict">
              <WarningFilled />
              {conflictCount} 单存在冲突，请拖动工单块到空档调整
            </span>
          ))}
        <span className="wo-board__plan-summary">
          共 {chipOrders.length} 单 · 待分配 {poolOrders.length} 单 · 冲突 {conflictCount} 单 · 可派 {okOrders.length} 单
        </span>
        <Button onClick={onClose}>取消</Button>
        <Button
          type="primary"
          disabled={okOrders.length === 0}
          loading={submitting}
          onClick={onConfirm}
        >
          确认派单（{okOrders.length}）
        </Button>
      </div>
    </Drawer>
  )
}
