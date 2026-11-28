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
 * 数据来源：候选人员、待派单队列、员工派单情况及派单提交均使用真实接口。
 */
import { useEffect, useMemo, useRef, useState } from 'react'
import type { DragEvent as ReactDragEvent, MouseEvent as ReactMouseEvent } from 'react'
import { Button, DatePicker, Drawer, Spin, Tooltip, App } from 'antd'
import { CheckCircleFilled, WarningFilled, CloseOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'
import { orderApi, staffApi, workOrderApi } from '@/api'
import { maskName } from '@/components/SensitiveText'
import type { WorkOrderItem } from '@/api/modules/work-order'
import {
  BOARD_END,
  BOARD_START,
  SLOT_STEP,
  findConflicts,
  fmtMin,
  overlaps,
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
  /** 方案所在排班日期；跨天工单从待分配池拖入后按当前看板日期展示 */
  date: string
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

/** 待接单 / 待服务均为已派工单；是否改派不依赖详情是否返回 schedule_id。 */
const isReassignOrder = (order: WorkOrderItem) =>
  [2, 3].includes(Number(order.wo_status))

export default function DispatchBoard({
  open,
  orders,
  onClose,
  onDone,
}: {
  open: boolean
  /** 真实待派工单或详情页传入的当前已派工单 */
  orders: WorkOrderItem[]
  onClose: () => void
  /** 板上工单全部派完或改派完成时回调（父级关闭并刷新） */
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
  const [dateStr, setDateStr] = useState(() => {
    const first = orders[0]
    const currentAt = first && isReassignOrder(first) ? first.planned_start_at : undefined
    const expectedAt = first?.expected_start_at
    const initialAt = currentAt || expectedAt
    return initialAt && (currentAt || dayjs(initialAt * 1000).isAfter(dayjs()))
      ? dayjs(initialAt * 1000).format('YYYY-MM-DD')
      : dayjs().format('YYYY-MM-DD')
  })
  /** 拖拽抓取点偏移（分钟）：落点 = 指针位置 - 偏移，块落在视觉位置 */
  const dragRef = useRef<{ id: number; offset: number } | null>(null)
  /** 用户已主动调整的工单不被后续接口回包覆盖。 */
  const adjustedOrderIdsRef = useRef<Set<number>>(new Set())

  const allOrders = orders
  const reassignMode = allOrders.length > 0 && allOrders.every(isReassignOrder)
  const reassignDate = reassignMode && allOrders[0]?.planned_start_at
    ? dayjs(allOrders[0].planned_start_at! * 1000).format('YYYY-MM-DD')
    : ''

  /* 排单详情异步返回后，将看板切到当前派单日期；用户手动切换日期时不重复覆盖。 */
  useEffect(() => {
    if (open && reassignDate) setDateStr(reassignDate)
  }, [open, reassignDate])

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

  /* 当前排班日期的工单：改派取当前计划日期，新派单取客户期望日期，拖放后取方案日期。 */
  const dayOrders = useMemo(
    () =>
      allOrders.filter((o) => {
        if (doneIds.includes(o.id)) return false
        const currentAt = isReassignOrder(o) ? o.planned_start_at : undefined
        const defaultDate = dayjs((currentAt || o.expected_start_at) * 1000).format('YYYY-MM-DD')
        return (plans[o.id]?.date ?? defaultDate) === dateStr
      }),
    [allOrders, plans, dateStr, doneIds],
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
      .getStaffList({ page: 1, page_size: 100, status: 1, staff_type: 2 })
      .then((res) => {
        const nextCandidates: Candidate[] = res.list.map((staff) => ({
          id: staff.id,
          name: staff.name,
          position_name: staff.position_name || '-',
          title: staff.title || '',
          phone: staff.phone || '',
          upcoming_credential_expire: staff.upcoming_credential_expire,
        }))
        /* 当前服务人员即使不在在职候选列表中，也保留其真实行以展示当前派单。 */
        allOrders.filter(isReassignOrder).forEach((order) => {
          if (!order.assigned_staff_id || nextCandidates.some((staff) => staff.id === order.assigned_staff_id)) return
          nextCandidates.push({
            id: order.assigned_staff_id,
            name: order.assigned_staff_name || '当前服务人员',
            position_name: '-',
            title: '',
            phone: '',
            upcoming_credential_expire: false,
          })
        })
        setCandidates(nextCandidates)
      })
      .catch(() => {
        // 错误提示由拦截器统一处理
        setCandidates([])
      })
      .finally(() => setLoading(false))
  }, [open])

  /* 按当前日期读取各员工已有工单；相同 work_order_no 的记录就是当前改派工单。 */
  useEffect(() => {
    if (!open) return
    setLoading(true)
    orderApi
      .getOrdersByStaff(dateStr)
      .then((res) => {
        const next = new Map<number, BusyBlock[]>()
        const matchedPlans: Array<{ order: WorkOrderItem; plan: Plan }> = []
        const matchedStaff: Candidate[] = []
        res.list.forEach((staff) => {
          if (!staff.staff_id) return
          const blocks = (staff.work_orders ?? []).flatMap((item) => {
            const plannedStart = item.planned_start_at ? dayjs(item.planned_start_at * 1000) : null
            /* 工单号与当前面板工单一致即为本单，不再受排单 ID 或状态字段完整性影响。 */
            const currentOrder = allOrders.find((order) =>
              order.work_order_no === item.work_order_no,
            )
            if (currentOrder) {
              /* 当前改派单只渲染为可拖拽绿色方案块，不进入灰色占用块。 */
              if (plannedStart) {
                matchedPlans.push({
                  order: currentOrder,
                  plan: {
                    staffId: staff.staff_id,
                    startMin: clampStart(
                      plannedStart.hour() * 60 + plannedStart.minute(),
                      durationOf(currentOrder),
                    ),
                    date: plannedStart.format('YYYY-MM-DD'),
                  },
                })
                matchedStaff.push({
                  id: staff.staff_id,
                  name: staff.staff_name || currentOrder.assigned_staff_name || '当前服务人员',
                  position_name: '-',
                  title: '',
                  phone: '',
                  upcoming_credential_expire: false,
                })
              }
              return []
            }

            const plannedStop = item.planned_stop_at ? dayjs(item.planned_stop_at * 1000) : null
            if (!plannedStart) return []
            const startMin = plannedStart.hour() * 60 + plannedStart.minute()
            const endMin = plannedStop
              ? plannedStop.hour() * 60 + plannedStop.minute()
              : startMin + (item.duration || 60)
            if (endMin <= startMin) return []

            const serviceTitle = [item.member_name, item.service_name].filter(Boolean).join(' · ')
            return [{
              startMin,
              endMin,
              title: serviceTitle || item.work_order_no || item.order_no || item.remark || '已排安排',
            }]
          })
          next.set(staff.staff_id, blocks)
        })
        setSchedules(next)
        if (matchedStaff.length > 0) {
          setCandidates((prev) => {
            const nextCandidates = [...prev]
            matchedStaff.forEach((staff) => {
              if (!nextCandidates.some((candidate) => candidate.id === staff.id)) nextCandidates.push(staff)
            })
            return nextCandidates
          })
        }
        if (matchedPlans.length > 0) {
          setPlans((prev) => {
            const nextPlans = { ...prev }
            let changed = false
            matchedPlans.forEach(({ order, plan }) => {
              if (adjustedOrderIdsRef.current.has(order.id)) return
              nextPlans[order.id] = plan
              changed = true
            })
            return changed ? nextPlans : prev
          })
          const firstMatched = matchedPlans.find(({ order }) => !adjustedOrderIdsRef.current.has(order.id))
          if (firstMatched && firstMatched.plan.date !== dateStr) setDateStr(firstMatched.plan.date)
        }
      })
      .catch(() => {
        // 请求失败时不使用模拟工单，避免产生虚假冲突。
        setSchedules(new Map())
      })
      .finally(() => setLoading(false))
  }, [open, dateStr])

  /* 初始化方案：改派单取当前服务人员 + 当前计划时段；新派单取期望人员 + 期望时段。
     新派单期望时间已过期时改取当前时间；无期望人员 / 时间的工单进入待分配池。 */
  useEffect(() => {
    if (!open) return
    setPlans((prev) => {
      const next = { ...prev }
      const now = dayjs()
      allOrders.forEach((o) => {
        if (next[o.id] || doneIds.includes(o.id)) return
        const exp = matchExpected(o)
        if (isReassignOrder(o)) {
          const staffId = o.assigned_staff_id || exp?.id
          /* 缺少当前人员时等待 by-staff 的工单号匹配结果，不默认放进待分配池。 */
          if (!staffId) return
          const plannedAt = o.planned_start_at || o.expected_start_at
          const planned = plannedAt ? dayjs(plannedAt * 1000) : null
          const startMin = planned
            ? clampStart(planned.hour() * 60 + planned.minute(), durationOf(o))
            : BOARD_START
          next[o.id] = {
            staffId,
            startMin,
            date: planned?.format('YYYY-MM-DD') ?? dateStr,
          }
          return
        }
        if (candidates.length === 0) return
        const expectedAt = o.expected_start_at ? dayjs(o.expected_start_at * 1000) : null
        const expectedIsFuture = expectedAt?.isAfter(now) ?? false
        const defaultStartMin = expectedIsFuture
          ? expectedMinOf(o)
          : Math.min(
              Math.max(now.hour() * 60 + now.minute(), BOARD_START),
              BOARD_END - durationOf(o),
            )
        const planDate = expectedAt
          ? (expectedIsFuture ? expectedAt : now).format('YYYY-MM-DD')
          : dateStr
        if (exp && expectedAt) {
          next[o.id] = { staffId: exp.id, startMin: defaultStartMin, date: planDate }
        } else {
          next[o.id] = {
            staffId: POOL_STAFF_ID,
            startMin: expectedAt ? defaultStartMin : BOARD_START,
            date: planDate,
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
    const expectedDate = dayjs(o.expected_start_at * 1000).format('YYYY-MM-DD')
    return (
      !!p &&
      !!exp &&
      p.date === expectedDate &&
      p.staffId === exp.id &&
      p.startMin === expectedMinOf(o)
    )
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
      adjustedOrderIdsRef.current.add(orderId)
      setPlans((prev) => ({ ...prev, [orderId]: { staffId, startMin, date: dateStr } }))
      return
    }
    const dur = durationOf(o)
    const busy = findConflicts(schedules.get(staffId) ?? [], startMin, startMin + dur)
    if (busy.length > 0) {
      message.warning(
        `${maskName(o.member_name)}：该时段与「${busy[0].title} ${fmtMin(busy[0].startMin)}~${fmtMin(busy[0].endMin)}」冲突，请拖到空档`,
      )
      return
    }
    const others = dayOrders.filter((x) => {
      if (x.id === orderId) return false
      const q = plans[x.id]
      return q?.staffId === staffId && overlaps(q.startMin, q.startMin + durationOf(x), startMin, startMin + dur)
    })
    if (others.length > 0) {
      message.warning(`${maskName(o.member_name)}：该时段已排「${maskName(others[0].member_name)}」的工单，请错开`)
      return
    }
    adjustedOrderIdsRef.current.add(orderId)
    setPlans((prev) => ({ ...prev, [orderId]: { staffId, startMin, date: dateStr } }))
  }

  /** 批量确认：新工单调用派单接口，已有排单的工单调用改派接口。 */
  const onConfirm = async () => {
    if (okOrders.length === 0) return
    setSubmitting(true)
    const dispatched: number[] = []
    for (const o of okOrders) {
      const p = plans[o.id]
      const startAt = dayjs(dateStr).startOf('day').add(p.startMin, 'minute').unix()
      const stopAt = startAt + durationOf(o) * 60
      try {
        if (isReassignOrder(o)) {
          await workOrderApi.reassignSchedule(o.schedule_id, {
            new_staff_id: p.staffId,
            reason: '通过派单面板调整服务人员或服务时间',
            planned_start_at: startAt,
            planned_stop_at: stopAt,
          })
        } else {
          await workOrderApi.dispatchWorkOrder(o.id, {
            assigned_staff_id: p.staffId,
            service_date: dateStr,
            planned_start_at: startAt,
            planned_stop_at: stopAt,
          })
        }
        dispatched.push(o.id)
      } catch {
        // 单笔失败不中断批量，错误提示由拦截器统一处理
      }
    }
    setSubmitting(false)
    if (dispatched.length > 0) {
      /* 已派 / 已改派工单立即转为人员占用时段，继续调整其他工单时仍参与冲突校验。 */
      setSchedules((prev) => {
        const next = new Map(prev)
        dispatched.forEach((id) => {
          const order = allOrders.find((item) => item.id === id)
          const plan = plans[id]
          if (!order || !plan) return
          next.set(plan.staffId, [
            ...(next.get(plan.staffId) ?? []),
            {
              startMin: plan.startMin,
              endMin: plan.startMin + durationOf(order),
              title: `${order.member_name} · ${order.service_name}`,
            },
          ])
        })
        return next
      })
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
        reassignMode
          ? `已改派 ${dispatched.length} 单，服务人员与计划时间已更新`
          : `已派单 ${dispatched.length} 单，助手端同步收到任务${remain > 0 ? `，剩余 ${remain} 单待调整` : ''}`,
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
    const reassign = isReassignOrder(o)
    const tooltipTitle = reassign
      ? inPool
        ? `${o.work_order_no} · 请先在上方选择新的派单日期，再将工单拖入目标人员的空闲时段`
        : `${o.work_order_no} · 当前派单可直接拖拽调整服务人员或当天时段；如需修改派单日期，请先将工单拖入「待分配」，再选择日期并重新派单`
      : `${o.work_order_no} · ${maskName(o.member_name)} · ${o.service_name}　期望：${o.expect_staff_name || '无'} ${fmtMin(expectedMinOf(o))}~${fmtMin(expectedMinOf(o) + durationOf(o))}　拖动或点选后点击空档调整`
    return (
      <Tooltip key={o.id} title={tooltipTitle} placement="topLeft">
        <div
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
        >
          <span className="wo-board__plan-text">
            <span className="wo-board__plan-no">{o.work_order_no}</span>
            <span className="wo-board__plan-name">{maskName(o.member_name)}</span>
          </span>
        </div>
      </Tooltip>
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
              <span style={{marginRight: 20}}>
                {reassignMode
                  ? '排单板 · 调整派单'
                  : chipOrders.length > 1
                    ? `排单板 · 批量派单（${chipOrders.length} 单）`
                    : '排单板 · 派单'}
              </span>
              <DatePicker
                value={dayjs(dateStr)}
                onChange={(d) => d && setDateStr(d.format('YYYY-MM-DD'))}
                disabled={reassignMode && poolOrders.length === 0}
                allowClear={false}
              />
            </div>
            <Button type="text" icon={<CloseOutlined />} onClick={onClose} />
          </div>
          <div className="wo-modal__sub">
            {reassignMode
              ? '当前派单已载入对应服务人员与时段；如需修改日期，请先拖入「待分配」，再选择日期并重新派单'
              : '绿色 = 无冲突可派，红色 = 冲突，浅绿虚线框 = 客户期望位置；「待分配」栏拖入人员行完成分配'}
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
                  : isReassignOrder(o) || isExpectedPlan(o)
                    ? 'wo-board__chip--ok'
                    : 'wo-board__chip--adjusted'
              } ${o.id === selectedId ? 'wo-board__chip--selected' : ''}`}
              onClick={() => setSelectedId(o.id)}
              title={`${o.work_order_no} · ${o.service_name} · 期望 ${o.expect_staff_name || '无'} ${fmtMin(expectedMinOf(o))}~${fmtMin(expectedMinOf(o) + durationOf(o))}`}
            >
              {woShort(o)} {maskName(o.member_name)}
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
                                {maskName(o.member_name)} · {fmtMin(expectedMinOf(o))}~
                                {fmtMin(expectedMinOf(o) + durationOf(o))}
                              </div>
                            ))}
                          </div>
                        }
                      >
                        <span className="status-tag status-tag--green">期望 ×{expAll.length}</span>
                      </Tooltip>
                    )}
                  </div>
                  <div className="wo-board__staff-sub">
                    {c.position_name}
                  </div>
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
                        title={`${maskName(o.member_name)} 的客户期望：${c.name} ${fmtMin(em)}~${fmtMin(em + durationOf(o))}`}
                        onClick={(e) => e.stopPropagation()}
                      >
                        期望·{maskName(o.member_name)}
                      </div>
                    )
                  })}
                  {hiddenGhosts.length > 0 && (
                    <Tooltip
                      title={
                        <div>
                          {hiddenGhosts.map((o) => (
                            <div key={o.id}>
                              {maskName(o.member_name)} · 期望 {fmtMin(expectedMinOf(o))}~
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
              {dayOrders.length} 单均无冲突，可{reassignMode ? '确认改派' : '一键批量派单'}
            </span>
          ) : (
            <span className="wo-board__banner wo-board__banner--conflict">
              <WarningFilled />
              {conflictCount} 单存在冲突，请拖动工单块到空档调整
            </span>
          ))}
        <span className="wo-board__plan-summary">
          共 {chipOrders.length} 单 · 待分配 {poolOrders.length} 单 · 冲突 {conflictCount} 单 · {reassignMode ? '可改派' : '可派'} {okOrders.length} 单
        </span>
        <Button onClick={onClose}>取消</Button>
        <Button
          type="primary"
          disabled={okOrders.length === 0}
          loading={submitting}
          onClick={onConfirm}
        >
          {reassignMode ? '确认改派' : '确认派单'}（{okOrders.length}）
        </Button>
      </div>
    </Drawer>
  )
}
