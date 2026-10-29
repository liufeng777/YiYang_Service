/** 派单板通用配置与时间冲突计算。 */
export const BOARD_START = 8 * 60
export const BOARD_END = 20 * 60
export const SLOT_STEP = 30

export interface BusyBlock {
  startMin: number
  endMin: number
  title: string
}

export interface DispatchCandidate {
  id: number
  name: string
  position_name: string
  title: string
  phone: string
  upcoming_credential_expire: boolean
}

/** 区间是否重叠。 */
export const overlaps = (aS: number, aE: number, bS: number, bE: number) =>
  aS < bE && bS < aE

export function findConflicts(blocks: BusyBlock[], startMin: number, endMin: number): BusyBlock[] {
  return blocks.filter((block) => overlaps(block.startMin, block.endMin, startMin, endMin))
}

export const fmtMin = (minutes: number) =>
  `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`

/** 将接口 HH:mm / HH:mm:ss 时间转换为当日分钟数。 */
export function timeToMinutes(value?: string): number | null {
  const match = value?.match(/^(\d{1,2}):(\d{2})/)
  if (!match) return null
  return Number(match[1]) * 60 + Number(match[2])
}
