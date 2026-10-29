import { http } from '@/utils/request'
import type { PageParams, PageResult } from '@/types/api'

/**
 * 健康预警（协同工作台端 §6 健康预警与随访回访）
 * 网关前缀：/api/v1/staff
 *
 * 规则（设计稿交互说明）：
 * - 同一健康事件只生成一个医生处置单；由该事件派生的层级变化作为影响结果合并展示
 * - 预警不是医生提交意见后立即关闭：需完成患者核实、记录医生判断、复测/就医结果回传、
 *   后续随访完成或明确取消、处置结论回写健康档案后才可关闭
 * - 预警处置若调整等级，写 risk_level_changes(change_source=2-预警处置) 并重排随访周期
 */

/**
 * 预警处理状态（health_warnings.warning_status）
 * swagger 处置入参说明：3-ignored已忽略 4-handled_goon已处置-继续服务 5-handled_stop已处置-中止服务
 * 列表数据中 0/1 为待处理、2 为已处理（兼容展示）
 */
export const WARNING_STATUS_MAP: Record<number, string> = {
  0: '待处理',
  1: '待处理',
  2: '已处理',
  3: '已忽略',
  4: '已处置（继续服务）',
  5: '已处置（中止服务）',
}

/** 预警等级（health_warnings.severity） */
export const WARNING_SEVERITY_MAP: Record<number, string> = {
  1: '低风险',
  2: '中风险',
  3: '高风险',
}

/** 预警列表项（GET /warnings 出参，对齐 §6.1） */
export interface WarningItem {
  id: number
  member_id: number
  member_name: string
  /** 预警标题（如 空腹血糖异常） */
  title: string
  /** 等级（WARNING_SEVERITY_MAP） */
  severity: number
  /** 处理状态（WARNING_STATUS_MAP） */
  warning_status: number
  /** 触发指标值快照 */
  metric_values?: string
  /** 以下来源、关联工单与处置字段由详情接口按需返回 */
  warning_source?: number
  content?: string
  remark?: string
  handled_reason?: string
  handled_by_name: string
  handled_at?: number
  created_at: number
}

/** 预警列表查询参数（swagger：status / severity / warning_source / member_id / 分页） */
export interface WarningListParams extends PageParams {
  status?: number
  severity?: number
  warning_source?: number
  member_id?: number
}

/** 预警列表（权限 warn:view，按等级/状态/来源筛选） */
export function getWarnings(params: WarningListParams) {
  return http.get<PageResult<WarningItem>>('/v1/staff/warnings', { ...params })
}

/** 预警详情（权限 warn:view） */
export function getWarningDetail(id: number | string) {
  return http.get<WarningItem>(`/v1/staff/warnings/${id}`)
}

/**
 * 预警处置（权限 warn:handle，对齐 swagger）
 * warning_status 取值：3-已忽略(继续服务) 4-已处置-继续服务 5-已处置-中止服务；
 * 处置为 5 时小程序端会抓取并中止关联工单
 */
export function handleWarning(
  id: number | string,
  data: {
    warning_status: 3 | 4 | 5
    handled_reason?: string
    adjust_risk_level?: number
    adjust_care_level?: number
    note?: string
  },
) {
  return http.post<null>(`/v1/staff/warnings/${id}/handle`, data)
}

/** 预警忽略（权限 warn:handle） */
export function ignoreWarning(id: number | string) {
  return http.post<null>(`/v1/staff/warnings/${id}/ignore`)
}

/**
 * TODO: 以下设计稿交互对应接口 API v0.1 未定义，待后端补充：
 * - 预警医生处置单（风险判断/处置意见/后续动作：创建回访、确认层级、目标调整待办）
 * - 预警关闭前检查清单与关闭结论/关闭原因（关闭与回写）
 * - 履约异常上报与处置闭环（异常处理模块：健康异常风险处置 / 工单异常处置）
 * 当前页面以本地 mock 演示完整交互。
 */
