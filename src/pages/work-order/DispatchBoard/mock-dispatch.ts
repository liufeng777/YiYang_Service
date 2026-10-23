/**
 * 派单排班 mock（人员排班 / 时段冲突接口 API v0.1 未定义，待后端补充）
 * - 候选人员来自真实接口 GET /api/v1/staff/staffs
 * - 各人员在某日期的「已有安排」为本地确定性 mock：
 *   同一 staffId + 日期生成结果固定，刷新 / 重进页面排班不变，便于演示完整派单交互
 * - 接口无候选人员数据时，用 mockCandidates 兜底，保证排单板可完整演示
 * - buildMockOrders 根据生成的排班动态构造批量演示工单，保证覆盖各种情况
 */
import dayjs from 'dayjs'
import type { WorkOrderItem } from '@/api/modules/work-order'

/** 一段已有安排（分钟制，相对当日 00:00） */
export interface BusyBlock {
  startMin: number
  endMin: number
  title: string
}

/** 排单板时间范围与粒度 */
export const BOARD_START = 8 * 60 // 08:00
export const BOARD_END = 20 * 60 // 20:00
export const SLOT_STEP = 30 // 最小排单粒度 30 分钟

const BUSY_TITLES = ['上门服务', '机构巡诊', '健康讲座', '随访关怀', '康复训练']

function hash(str: string): number {
  let h = 0
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0
  return h
}

/** mulberry32 确定性伪随机数发生器 */
function mulberry(seed: number) {
  return () => {
    seed |= 0
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** 生成某人员某日期的已有安排（确定性伪随机，2~4 段，每段 60~150 分钟） */
export function getStaffSchedule(staffId: number, date: string): BusyBlock[] {
  const rand = mulberry(hash(`${staffId}|${date}`))
  const count = 2 + Math.floor(rand() * 3)
  const blocks: BusyBlock[] = []
  let cursor = BOARD_START + Math.floor(rand() * 4) * SLOT_STEP
  for (let i = 0; i < count && cursor < BOARD_END - 60; i++) {
    const dur = (2 + Math.floor(rand() * 4)) * SLOT_STEP
    const end = Math.min(cursor + dur, BOARD_END)
    blocks.push({
      startMin: cursor,
      endMin: end,
      title: BUSY_TITLES[Math.floor(rand() * BUSY_TITLES.length)],
    })
    cursor = end + (1 + Math.floor(rand() * 4)) * SLOT_STEP
  }
  return blocks
}

/** 区间是否重叠 */
export const overlaps = (aS: number, aE: number, bS: number, bE: number) => aS < bE && bS < aE

/** 找出与 [startMin, endMin) 冲突的安排 */
export function findConflicts(blocks: BusyBlock[], startMin: number, endMin: number): BusyBlock[] {
  return blocks.filter((b) => overlaps(b.startMin, b.endMin, startMin, endMin))
}

/** 分钟数 → HH:mm */
export const fmtMin = (m: number) =>
  `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`

/** 排单板候选人员（接口返回为空时兜底演示用） */
export interface MockCandidate {
  id: number
  name: string
  position_name: string
  title: string
  phone: string
  upcoming_credential_expire: boolean
}

export const mockCandidates: MockCandidate[] = [
  { id: 9101, name: '李慧敏', position_name: '照护人员', title: '养老护理员', phone: '13800000001', upcoming_credential_expire: false },
  { id: 9102, name: '王志强', position_name: '健管师', title: '健康管理师', phone: '13800000002', upcoming_credential_expire: false },
  { id: 9103, name: '陈雅琴', position_name: '照护人员', title: '养老护理员', phone: '13800000003', upcoming_credential_expire: true },
  { id: 9104, name: '赵德柱', position_name: '执业医师', title: '主治医师', phone: '13800000004', upcoming_credential_expire: false },
  { id: 9105, name: '孙丽娟', position_name: '照护人员', title: '养老护理员', phone: '13800000005', upcoming_credential_expire: false },
]

/* ===== 批量派单演示工单 ===== */

let mockSeq = 0

function mockOrder(partial: {
  member_name: string
  service_name: string
  expect_staff?: number
  expect_staff_name?: string
  startMin: number
  durMin: number
  date: string
}): WorkOrderItem {
  mockSeq += 1
  const at = (min: number) => dayjs(partial.date).startOf('day').add(min, 'minute').unix()
  return {
    id: 880000 + mockSeq,
    work_order_no: `WO${dayjs(partial.date).format('YYYYMMDD')}-${String(mockSeq).padStart(2, '0')}`,
    order_id: 990000 + mockSeq,
    order_no: `ORD${dayjs(partial.date).format('YYYYMMDD')}-${String(mockSeq).padStart(2, '0')}`,
    member_id: 770000 + mockSeq,
    member_name: partial.member_name,
    member_phone: `1390000${String(mockSeq).padStart(4, '0')}`,
    contact_name: '',
    contact_phone: '',
    service_id: 100 + mockSeq,
    service_name: partial.service_name,
    service_address: '',
    category: 1,
    expect_staff: partial.expect_staff ?? 0,
    expect_staff_name: partial.expect_staff_name ?? '',
    expected_start_at: at(partial.startMin),
    duration: partial.durMin,
    assigned_at: 0,
    assigned_staff_id: 0,
    assigned_staff_name: '',
    schedule_id: 0,
    remark: '',
    wo_status: 1,
  }
}

/**
 * 根据候选人员与其当日排班，动态构造批量演示工单（时长 0.5~3 小时不等，
 * 工单块宽度按期望时长占格：0.5 小时 = 1 格），稳定覆盖：
 * - 期望无冲突可直派（短单 / 长单均有）
 * - 期望时段与已有安排冲突
 * - 客户无期望医护
 * - 两单争抢同一人员同一时段（工单互斥）×2 组
 */
export function buildMockOrders(candidates: MockCandidate[], date: string): WorkOrderItem[] {
  mockSeq = 0
  const [c0, c1, c2, c3, c4] = [
    candidates[0],
    candidates[1] ?? candidates[0],
    candidates[2] ?? candidates[0],
    candidates[3] ?? candidates[0],
    candidates[4] ?? candidates[0],
  ]

  /* 已占区间 = 人员当日已有安排 + 前面演示工单已放的期望位置（用于给后续单找不重叠的空档） */
  const placed = new Map<number, { s: number; e: number }[]>()
  const freeGap = (staffId: number, dur: number): number => {
    const busy = [
      ...getStaffSchedule(staffId, date).map((b) => ({ s: b.startMin, e: b.endMin })),
      ...(placed.get(staffId) ?? []),
    ].sort((a, b) => a.s - b.s)
    let cursor = BOARD_START
    for (const b of busy) {
      if (b.s - cursor >= dur) break
      cursor = Math.max(cursor, b.e)
    }
    return Math.min(cursor, BOARD_END - dur)
  }
  const put = (staffId: number, startMin: number, dur: number) => {
    const arr = placed.get(staffId) ?? []
    arr.push({ s: startMin, e: startMin + dur })
    placed.set(staffId, arr)
  }

  /* 单 1：c0 空档，1 小时（无冲突） */
  const g1 = freeGap(c0.id, 60)
  put(c0.id, g1, 60)
  /* 单 2：c0 下一段空档，2 小时长单（占 4 格，无冲突） */
  const g2 = freeGap(c0.id, 120)
  put(c0.id, g2, 120)
  /* 单 4：c1 空档，2.5 小时长单（占 5 格，无冲突） */
  const g4 = freeGap(c1.id, 150)
  put(c1.id, g4, 150)
  /* 单 7：c3 空档，30 分钟短单（占 1 格，无冲突） */
  const g7 = freeGap(c3.id, 30)
  put(c3.id, g7, 30)
  /* 单 9：c4 空档，1 小时（无期望医护） */
  const g9 = freeGap(c4.id, 60)
  /* 单 6：无期望医护，1.5 小时，参考 c2 的空档（默认落第一位人员，状态以板上实际冲突为准） */
  const g6 = freeGap(c2.id, 90)
  /* 单 5：故意压在 c1 第一段已有安排上（期望时段冲突） */
  const clash1 = getStaffSchedule(c1.id, date)[0]?.startMin ?? BOARD_START + 120

  return [
    mockOrder({ member_name: '王秀兰', service_name: '上门护理', expect_staff: c0.id, expect_staff_name: c0.name, startMin: g1, durMin: 60, date }),
    mockOrder({ member_name: '周淑珍', service_name: '康复训练', expect_staff: c0.id, expect_staff_name: c0.name, startMin: g2, durMin: 120, date }),
    /* 与单 1 争抢 c0 同一时段（工单互斥） */
    mockOrder({ member_name: '陈庆生', service_name: '健康监测', expect_staff: c0.id, expect_staff_name: c0.name, startMin: g1, durMin: 60, date }),
    mockOrder({ member_name: '吴国强', service_name: '助浴服务', expect_staff: c1.id, expect_staff_name: c1.name, startMin: g4, durMin: 150, date }),
    /* 期望 c1，但压在其已有安排上（期望冲突） */
    mockOrder({ member_name: '张建国', service_name: '康复指导', expect_staff: c1.id, expect_staff_name: c1.name, startMin: clash1, durMin: 60, date }),
    mockOrder({ member_name: '刘桂芳', service_name: '陪同就医', startMin: g6, durMin: 90, date }),
    mockOrder({ member_name: '郑玉兰', service_name: '生命体征测量', expect_staff: c3.id, expect_staff_name: c3.name, startMin: g7, durMin: 30, date }),
    /* 与单 7 争抢 c3 同一时段（工单互斥） */
    mockOrder({ member_name: '何建华', service_name: '用药提醒', expect_staff: c3.id, expect_staff_name: c3.name, startMin: g7, durMin: 30, date }),
    mockOrder({ member_name: '孙秀荣', service_name: '上门送餐', startMin: g9, durMin: 60, date }),
  ]
}
