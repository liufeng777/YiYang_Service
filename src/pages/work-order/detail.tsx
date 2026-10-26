/**
 * 服务工单 - 工单详情（设计稿：含改派与异常主示例.png）
 * 区块：履约步骤条（C端预约→机构派单→确认接单→开始服务→已完成）、
 *       基础信息、预约与派单（含改派记录）、服务详情（签到/照片凭证）、异常记录（健康异常）
 * 已对接：
 * - GET /api/v1/staff/work-orders/:id    工单详情（基础信息 / 当前预约 / 状态）
 * - GET /api/v1/staff/orders/:id         关联订单（订单审核信息）
 * - GET /api/v1/staff/schedules/:id      排单详情（派单安排 / 改派记录 / 签到签退 / 照片凭证，schedule_id > 0 时）
 * - GET /api/v1/staff/warnings           健康异常（按 member_id 过滤）
 * - POST /api/v1/staff/work-orders/:id/dispatch 派单（排单板，?dispatch=1 自动打开）
 */
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Button, Spin } from 'antd'
import { CheckOutlined, PictureOutlined, ArrowLeftOutlined } from '@ant-design/icons'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import dayjs from 'dayjs'
import PageContainer from '@/components/PageContainer'
import { orderApi, scheduleApi, warningApi, workOrderApi } from '@/api'
import {
  WO_STATUS_MAP,
  type ReassignLog,
  type WorkOrderDetail,
  type WorkOrderPhoto,
} from '@/api/modules/work-order'
import type { ServiceScheduleDetail } from '@/api/modules/schedule'
import type { OrderDetail } from '@/api/modules/order'
import { WARNING_STATUS_MAP, type WarningItem } from '@/api/modules/warning'
import { useUserStore } from '@/store'
import DispatchBoard from './DispatchBoard'
import './index.less'

const STEP_TITLES = ['C端预约', '机构派单', '确认接单', '开始服务', '已完成']

/** 工单状态 → 当前所处步骤下标（5 为全部完成；对齐 WO_STATUS_MAP） */
const STATUS_STAGE: Record<number, number> = {
  1: 1, // 待派单 → 机构派单进行中
  2: 2, // 待接单(已派单) → 确认接单进行中
  3: 3, // 待服务 → 等待开始服务
  4: 3, // 服务中 → 开始服务进行中
  5: 5, // 已完成
  8: 1, // 已取消
  9: 3, // 服务终止
}

/** 订单审核状态（推断：1-已通过 2-已驳回，以后端实际返回为准） */
const AUDIT_STATUS_MAP: Record<number, string> = {
  1: '已通过',
  2: '已驳回',
}

const fmt = (ts?: number | null, pattern = 'YYYY-MM-DD HH:mm') =>
  ts ? dayjs(ts * 1000).format(pattern) : '-'

export default function WorkOrderDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const institutionName = useUserStore((s) => s.userInfo?.institutionName)

  const [detail, setDetail] = useState<WorkOrderDetail | null>(null)
  const [order, setOrder] = useState<OrderDetail | null>(null)
  const [schedule, setSchedule] = useState<ServiceScheduleDetail | null>(null)
  const [warnings, setWarnings] = useState<WarningItem[]>([])
  const [loading, setLoading] = useState(false)
  const [dispatchOpen, setDispatchOpen] = useState(() => searchParams.get('dispatch') === '1')

  const fetchDetail = useCallback(async () => {
    if (!id) return
    setLoading(true)
    try {
      const res = await workOrderApi.getWorkOrderDetail(id)
      setDetail(res)
      /* 关联订单：订单审核信息（失败不阻塞主详情） */
      if (res.order_id) {
        orderApi
          .getOrderDetail(res.order_id)
          .then(setOrder)
          .catch(() => undefined)
      }
      /* 排单详情：派单安排 / 改派记录 / 服务执行留痕 */
      if (res.schedule_id) {
        scheduleApi
          .getScheduleDetail(res.schedule_id)
          .then(setSchedule)
          .catch(() => setSchedule(null))
      } else {
        setSchedule(null)
      }
      /* 健康异常：按会员过滤预警列表 */
      if (res.member_id) {
        warningApi
          .getWarnings({ page: 1, page_size: 5, member_id: res.member_id })
          .then((r) => setWarnings(r.list))
          .catch(() => setWarnings([]))
      }
    } catch {
      // 错误提示由拦截器统一处理
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    fetchDetail()
  }, [fetchDetail])

  /* 履约步骤条：时间依次取 订单创建 / 派单 / 确认接单 / 开始服务(签到) / 完成 */
  const stage = detail ? (STATUS_STAGE[detail.wo_status] ?? 0) : 0
  const steps = useMemo(() => {
    if (!detail) return []
    const times: number[] = detail.stages.map(v => v.time)
    return STEP_TITLES.map((title, i) => ({
      title,
      time: times[i],
      state: (i < stage ? 'done' : i === stage ? 'active' : 'todo') as 'done' | 'active' | 'todo',
    }))
  }, [detail])

  /* 订单审核展示：审核人 · 状态 · 时间（接口未返回时降级 -） */
  const auditText = useMemo(() => {
    const name = detail?.audit_staff_name || order?.audit_staff_name || order?.confirmed_by_name
    const status = detail?.audit_status ?? order?.audit_status
    const at = detail?.audit_at ?? order?.audit_at ?? order?.confirmed_at
    if (!name && status == null) return '-'
    const parts = [
      name,
      status != null ? (AUDIT_STATUS_MAP[status] ?? (order?.order_status === 3 ? '已通过' : '')) : '',
    ].filter(Boolean)
    return `${parts.join(' · ') || '-'}${at ? ` ${fmt(at)}` : ''}`
  }, [detail, order])

  /* 派单安排字段：排单详情优先，工单详情兜底 */
  const staffName =
    schedule?.staff_name || detail?.assigned_staff_name || detail?.expect_staff_name || ''
  const staffTitle = schedule?.position_name || schedule?.title || ''
  const assignedBy = schedule?.assigned_by_name || detail?.assigned_by_name || ''
  const assignedAt = schedule?.assigned_at ?? detail?.assigned_at
  const confirmedAt = schedule?.confirmed_at ?? detail?.confirmed_at
  const reassignLogs: ReassignLog[] = schedule?.reassign_logs ?? detail?.reassign_logs ?? []

  /* 服务详情：签到 / 开始 / 结束 / 照片凭证 */
  const checkinAt = schedule?.checkin_at ?? detail?.checkin_at
  const startAt = schedule?.start_at ?? detail?.start_at
  const finishAt = schedule?.finish_at ?? detail?.finish_at
  const photos: WorkOrderPhoto[] = schedule?.photos ?? detail?.photos ?? []

  /** 是否可派单 / 调整派单（待派单 / 待接单 / 待服务） */
  const canDispatch = detail ? [1, 2, 3].includes(detail.wo_status) : false

  return (
    <div className="wo-page">
      <PageContainer
        title="服务工单详情"
        description={`工单编号 ${detail?.work_order_no ?? '-'} · 关联订单 ${detail?.order_no ?? '-'}`}
        extra={<Button icon={<ArrowLeftOutlined />} color="primary" variant="outlined" onClick={() => navigate('/work-order')}>返回列表</Button>}
      >
        <Spin spinning={loading}>
          {detail && (
            <>
              {/* 履约步骤条 */}
              <div className="wo-card wo-steps">
                {steps.map((s, i) => (
                  <div key={s.title} className="wo-steps__item">
                    <div className={`wo-steps__node wo-steps__node--${s.state}`}>
                      {s.state === 'done' ? <CheckOutlined /> : i + 1}
                    </div>
                    <div className="wo-steps__body">
                      <div className={`wo-steps__title wo-steps__title--${s.state}`}>{s.title}</div>
                      <div className="wo-steps__time">{fmt(s.time, 'MM-DD HH:mm')}</div>
                    </div>
                    {i < steps.length - 1 && (
                      <div
                        className={`wo-steps__line ${s.state === 'done' ? 'wo-steps__line--done' : ''}`}
                      />
                    )}
                  </div>
                ))}
              </div>

              {/* 基础信息 */}
              <div className="wo-card">
                <div className="wo-card__header">
                  <span className="wo-card__title wo-card__title--green">基础信息</span>
                </div>
                <div className="wo-grid2">
                  <div className="wo-kv">
                    <span className="wo-kv__label">工单编号</span>
                    <span className="wo-kv__value">{detail.work_order_no || '-'}</span>
                  </div>
                  <div className="wo-kv">
                    <span className="wo-kv__label">当前状态</span>
                    <span className="wo-kv__value">
                      <span className="wo-tag wo-tag--blue">
                        {WO_STATUS_MAP[detail.wo_status] ?? '-'}
                      </span>
                    </span>
                  </div>
                  <div className="wo-kv">
                    <span className="wo-kv__label">关联订单</span>
                    <span className="wo-kv__value">{detail.order_no || '-'}</span>
                  </div>
                  <div className="wo-kv">
                    <span className="wo-kv__label">服务项目</span>
                    <span className="wo-kv__value">{detail.service_name || '-'}</span>
                  </div>
                  <div className="wo-kv">
                    <span className="wo-kv__label">服务对象</span>
                    <span className="wo-kv__value">{detail.member_name || '-'}</span>
                  </div>
                  <div className="wo-kv">
                    <span className="wo-kv__label">所属机构</span>
                    <span className="wo-kv__value">
                      {detail.institution_name || institutionName || '-'}
                    </span>
                  </div>
                  <div className="wo-kv">
                    <span className="wo-kv__label">订单审核</span>
                    <span className="wo-kv__value">{auditText}</span>
                  </div>
                  <div className="wo-kv">
                    <span className="wo-kv__label">创建时间</span>
                    <span className="wo-kv__value">
                      {fmt(detail.created_at ?? order?.created_at)}
                    </span>
                  </div>
                </div>
              </div>

              {/* 预约与派单 */}
              <div className="wo-card">
                <div className="wo-card__header">
                  <span className="wo-card__title wo-card__title--green">预约与派单</span>
                  {canDispatch && (
                    <Button color="primary" variant="outlined" size="small" onClick={() => setDispatchOpen(true)}>
                      {detail.wo_status === 1 ? '去派单' : '调整派单'}
                    </Button>
                  )}
                </div>
                <div className="wo-grid2">
                  <div className="wo-kv">
                    <span className="wo-kv__label">当前预约</span>
                    <span className="wo-kv__value">
                      {detail.expected_start_at
                        ? `${fmt(detail.expected_start_at)} — ${fmt(detail.expected_start_at + (detail.duration || 0) * 60, 'HH:mm')}`
                        : '-'}
                    </span>
                  </div>
                  <div className="wo-kv">
                    <span className="wo-kv__label">服务地址</span>
                    <span className="wo-kv__value">{detail.service_address || '-'}</span>
                  </div>
                </div>

                <div className="wo-card__section">派单安排</div>
                {staffName ? (
                  <div className="wo-grid2">
                    <div className="wo-kv">
                      <span className="wo-kv__label">服务人员</span>
                      <span className="wo-kv__value">
                        {staffName}
                        {staffTitle ? ` · ${staffTitle}` : ''}
                      </span>
                    </div>
                    <div className="wo-kv">
                      <span className="wo-kv__label">派单人</span>
                      <span className="wo-kv__value">{assignedBy || '-'}</span>
                    </div>
                    <div className="wo-kv">
                      <span className="wo-kv__label">派单时间</span>
                      <span className="wo-kv__value">{fmt(assignedAt)}</span>
                    </div>
                    <div className="wo-kv">
                      <span className="wo-kv__label">确认接单</span>
                      <span className="wo-kv__value">
                        {confirmedAt ? `${fmt(confirmedAt)} · 已确认` : '-'}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="wo-empty">尚未派单</div>
                )}

                {/* 改派记录 */}
                {reassignLogs.length > 0 && (
                  <div className="wo-reassign">
                    <div className="wo-reassign__title">改派记录</div>
                    {reassignLogs.map((log, i) => (
                      <div key={i} className="wo-reassign__row">
                        {fmt(log.time, 'MM-DD HH:mm')}　{log.from_staff_name || '-'} →{' '}
                        {log.to_staff_name || '-'}；原因：{log.reason || '-'}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* 服务详情 */}
              <div className="wo-card">
                <div className="wo-card__header">
                  <span className="wo-card__title wo-card__title--green">服务详情</span>
                </div>
                {checkinAt || startAt || finishAt || photos.length > 0 ? (
                  <>
                    <div className="wo-grid2">
                      <div className="wo-kv">
                        <span className="wo-kv__label">上门签到</span>
                        <span className="wo-kv__value">{fmt(checkinAt)}</span>
                      </div>
                      <div className="wo-kv">
                        <span className="wo-kv__label">开始时间</span>
                        <span className="wo-kv__value">{fmt(startAt)}</span>
                      </div>
                      <div className="wo-kv">
                        <span className="wo-kv__label">结束时间</span>
                        <span className="wo-kv__value">{fmt(finishAt)}</span>
                      </div>
                      <div className="wo-kv">
                        <span className="wo-kv__label">照片与凭证</span>
                        <span className="wo-kv__value">
                          {photos.length > 0 ? `已上传 ${photos.length} 项` : '-'}
                        </span>
                      </div>
                    </div>
                    {photos.length > 0 && (
                      <div className="wo-photos">
                        {photos.map((p, i) => (
                          <div key={i} className="wo-photo">
                            {p.url ? (
                              <img className="wo-photo__img" src={p.url} alt={p.title || '凭证'} />
                            ) : (
                              <div className="wo-photo__placeholder">
                                <PictureOutlined />
                                <span>图片占位</span>
                              </div>
                            )}
                            <div className="wo-photo__title">{p.title || p.type || '凭证'}</div>
                            <div className="wo-photo__time">
                              {fmt(p.uploaded_at, 'MM-DD HH:mm')} · 已上传
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <div className="wo-empty">
                    服务执行后由服务人员端回写上门签到、开始 / 结束时间与照片凭证。
                  </div>
                )}
              </div>

              {/* 异常记录（健康异常） */}
              <div className="wo-card">
                <div className="wo-card__header">
                  <span className="wo-card__title wo-card__title--green">异常记录</span>
                  <Button color="primary" variant="outlined" onClick={() => navigate('/warning')}>查看 / 处理健康异常</Button>
                </div>
                {warnings.length > 0 ? (
                  <>
                    {warnings.map((w) => (
                      <div key={w.id} className="wo-kv">
                        <span className="wo-kv__label">健康异常</span>
                        <span className="wo-kv__value">
                          {fmt(w.created_at, 'MM-DD HH:mm:ss')}　{w.title || '-'} ·{' '}
                          <Button type="link" style={{padding: 0}} onClick={() => {
                            navigate(`/warning/${w.id}/handle`)
                          }}>{WARNING_STATUS_MAP[w.warning_status] ?? '待处理'}</Button>
                        </span>
                      </div>
                    ))}
                  </>
                ) : (
                  <div className="wo-empty">当前工单服务对象暂无健康异常记录。</div>
                )}
              </div>
            </>
          )}
        </Spin>
      </PageContainer>

      {/* 派单排单板（?dispatch=1 自动打开） */}
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
    </div>
  )
}
