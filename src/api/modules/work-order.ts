import { http } from '@/utils/request'
import type { PageParams, PageResult } from '@/types/api'

/**
 * 服务工单与排单派单（协同工作台端 §9 服务订单确认与排单派单）
 * 网关前缀：/api/v1/staff
 *
 * 规则（设计稿交互说明）：
 * - 预约日期与时段来自 C 端订单（至少提前一天）；机构无需再次与用户确认预约后才派单
 * - 派单强制条件：服务人员证照有效 + 已获得当前服务项目授权；
 *   预约时段可用仅用于排序和冲突提醒，不会自动禁止选择
 * - 改期时原服务人员在新时段已有服务任务：建议转为待重新派单；
 *   管理员确认已核实排班冲突后可保留原服务人员，系统记录操作留痕
 * - 联系状态与工单状态分开管理；履约异常在「异常处理」模块单独记录
 */

/** 工单状态（work_orders.wo_status，对齐共通 §6.2，仅邻近状态正向流转） */
export const WO_STATUS_MAP: Record<number, string> = {
  1: '待派单',
  2: '待接单(已派单)',
  3: '待服务',
  4: '服务中',
  5: '已完成',
  8: '已取消',
  9: '服务终止'
}

/** 服务前联系结果（联系状态，与工单状态分开管理） */
export const WO_CONTACT_STATUS_MAP: Record<number, string> = {
  1: '未到联系日',
  2: '待联系',
  3: '已确认',
  4: '未接通',
  5: '用户要求改期',
  6: '用户取消',
}

/** 工单（GET /work-orders 出参，对齐 §9.2） */
export interface WorkOrderItem {
  assigned_at: number;
  assigned_staff_id: number;
  assigned_staff_name: string;
  category: number;
  contact_name: string;
  contact_phone: string;
  expect_staff: number;
  expect_staff_name: string;
  expected_start_at: number;
  id: number;
  work_order_no: string;
  member_id: number;
  member_name: string;
  member_phone: string; 
  order_id: number;
  order_no: string; 
  remark: string; 
  schedule_id: number;
  service_address: string;
  service_id: number;
  duration: number; // 服务时长，分钟
  service_name: string;
  wo_status: number;
}

/** 工单列表查询参数（§9.2） */
export interface WorkOrderListParams extends PageParams {
  wo_status?: number
  staff_id?: number
  service_date?: string
  member_id?: number
  keyword?: string
}

/** 工单列表（权限 wo:view，按状态/时间/人员筛选） */
export function getWorkOrders(params: WorkOrderListParams) {
  return http.get<PageResult<WorkOrderItem>>('/v1/staff/work-orders', { ...params })
}

/** 工单详情（权限 wo:view，含排单与服务留痕） */
export function getWorkOrderDetail(id: number | string) {
  return http.get<WorkOrderItem>(`/v1/staff/work-orders/${id}`)
}

/** 待排单队列（权限 wo:dispatch，wo_status=1-待派单） */
export function getPendingDispatch(params: PageParams) {
  return http.get<PageResult<WorkOrderItem>>('/v1/staff/work-orders/pending-dispatch', { ...params })
}

/** 派单（权限 wo:dispatch，对齐 §9.3，创建 service_schedules 排单） */
export function dispatchWorkOrder(
  id: number | string,
  data: {
    assigned_staff_id: number
    service_date: string
    planned_start_at: number
    planned_stop_at: number
    remark?: string
  },
) {
  return http.post<{ schedule_id: number; schedule_no: string }>(
    `/v1/staff/work-orders/${id}/dispatch`,
    data,
  )
}

/** 改派（权限 wo:dispatch，对齐 §9.4，更换服务人员） */
export function reassignSchedule(
  id: number | string,
  data: {
    new_staff_id: number
    reason: string
    planned_start_at?: number
    planned_stop_at?: number
  },
) {
  return http.post<null>(`/v1/staff/service-schedules/${id}/reassign`, data)
}

/** 催单（权限 wo:dispatch，对齐 §9.5，向服务人员发送催办通知） */
export function remindWorkOrder(id: number | string, data: { via: string; content: string }) {
  return http.post<null>(`/v1/staff/work-orders/${id}/reminder`, data)
}

/** 取消排单（权限 wo:dispatch，对齐 §9.6，仅 schedule_status=2/3 可取消） */
export function cancelSchedule(id: number | string, data: { reason: string }) {
  return http.post<null>(`/v1/staff/service-schedules/${id}/cancel`, data)
}

/**
 * TODO: 以下设计稿交互对应接口 API v0.1 未定义，待后端补充：
 * - 服务订单医生审核（审核要点/审核意见/审核不通过/退回补充，设计稿「医生审核.png」）
 * - 派单前人员资质与时段校验（证照有效 + 项目授权 + 时段冲突提醒，设计稿「资质授权强校验.png」）
 * - 修改预约日期与时间（含改期原因、保留原服务人员/转重新派单，设计稿「时段冲突建议重派.png」「原人员可保留.png」）
 * - 服务前联系确认结果回写（已确认/未接通/用户要求改期/用户取消）
 * 当前页面以本地 mock 演示完整交互。
 */
