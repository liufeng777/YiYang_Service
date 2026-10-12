/**
 * 工作台
 * - 模板由登录用户岗位（positionCode）决定，见 configs.ts 模板注册表
 * - 侧边栏与快捷入口按权限码过滤（对齐《协同工作台-API设计》权限模型）
 * - 数据已对接真实接口：GET /dashboard/overview（今日工作概览）、GET /dashboard/warnings（预警快捷清单）
 *   接口未覆盖的指标（活动、订单趋势、人员负荷等）显示「-」或空态提示
 */
import { useEffect, useMemo, useState } from 'react'
import PageContainer from '@/components/PageContainer'
import { useUserStore } from '@/store/modules/user'
import { workbenchApi } from '@/api'
import type { DashboardOverview, DashboardWarningItem } from '@/api/modules/workbench'
import { workbenchConfigs, defaultWorkbenchConfig } from './configs'
import type { ListItem, WorkbenchConfig } from './types'
import { AlertBanner, MetricRow, MainPanel, StatsPanel, TrendPanel, QuickLinksRow } from './components'
import './index.less'

/** 预警等级文案（health_warnings.severity） */
const SEVERITY_TEXT: Record<number, string> = { 1: '低风险', 2: '中风险', 3: '高风险' }

/** 按指标卡片 label 匹配 overview 真实数值；接口未覆盖返回 '-' */
function metricRealValue(label: string, o?: DashboardOverview): number | string {
  if (!o) return '-'
  if (label.includes('待派单')) return o.today.pending_dispatch
  if (label.includes('派单确认')) return o.today.dispatch_confirming
  if (label.includes('服务中')) return o.today.wo_running
  if (label.includes('已完成')) return o.today.wo_completed
  if (label.includes('排班')) return o.today.scheduled_staff
  if (label.includes('新增线索')) return o.lead.new
  if (label.includes('待跟进')) return o.lead.followup_due_today
  if (label.includes('预约')) return o.appointment.confirmed_today
  if (label.includes('到访') || label.includes('到院')) return o.appointment.arriving_today
  if (label.includes('高风险')) return o.health.warn_high
  if (label.includes('预警') || label.includes('告警')) return o.health.warn_active
  if (label.includes('评估')) return o.health.pending_assessment
  if (label.includes('随访')) return o.health.followup_due_today
  if (label.includes('方案')) return o.health.plan_pending_confirm
  return '-'
}

/** 预警清单 → 主面板列表项 */
function warningToListItem(w: DashboardWarningItem): ListItem {
  return {
    title: w.title || '健康预警',
    info: w.member_name || `会员 #${w.member_id}`,
    tag: SEVERITY_TEXT[w.severity] ?? '待核实',
    tone: w.severity >= 2 ? 'danger' : 'muted',
  }
}

/** 用真实接口数据覆盖模板配置中的演示数据 */
function applyRealData(
  config: WorkbenchConfig,
  overview: DashboardOverview | undefined,
  warnings: DashboardWarningItem[],
): WorkbenchConfig {
  // 告警横幅：仅预警类横幅有真实数据（高风险预警数）；其他横幅（工单异常等）无接口，不展示
  const banner =
    config.banner && config.banner.path === '/warning' && (overview?.health.warn_high ?? 0) > 0
      ? { ...config.banner, count: overview!.health.warn_high, desc: '当前高风险健康预警，需立即核实并处置' }
      : undefined

  // 指标卡片：按 label 匹配真实值，未覆盖显示 '-'
  const metrics = config.metrics.map((m) => ({ ...m, value: metricRealValue(m.label, overview) }))

  // 主面板：任务类（dot）展示真实预警清单；活动/负荷类（plain）无接口
  const main =
    config.main.variant === 'dot'
      ? { ...config.main, items: warnings.map(warningToListItem), emptyText: '暂无待处置预警' }
      : { ...config.main, items: [], emptyText: '暂未对接接口' }

  // 右侧面板：统计项按 label 匹配；趋势图无接口置空
  const side =
    config.side.type === 'stats'
      ? {
          ...config.side,
          items: config.side.items.map((s) => ({
            ...s,
            value: String(metricRealValue(s.label, overview)),
          })),
        }
      : {
          ...config.side,
          bars: [],
          stats: config.side.stats.map((s) => ({
            ...s,
            value: String(metricRealValue(s.label, overview)),
          })),
          footnote: '订单趋势接口暂未提供',
        }

  return { ...config, banner, metrics, main, side }
}

/** 按当前时段生成问候语 */
function greetingWord(): string {
  const hour = new Date().getHours()
  if (hour < 6) return '凌晨好'
  if (hour < 12) return '早上好'
  if (hour < 14) return '中午好'
  if (hour < 18) return '下午好'
  return '晚上好'
}

export default function Workbench() {
  const userInfo = useUserStore((state) => state.userInfo)
  const [overview, setOverview] = useState<DashboardOverview>()
  const [warnings, setWarnings] = useState<DashboardWarningItem[]>([])

  useEffect(() => {
    workbenchApi
      .getOverview()
      .then((res) => setOverview(res))
      .catch(() => undefined)
    workbenchApi
      .getWarnings()
      .then((res) => setWarnings(res.list.slice(0, 5)))
      .catch(() => undefined)
  }, [])

  const config = useMemo(() => {
    const positionCode = userInfo?.positionCode
    const base = (positionCode && workbenchConfigs[positionCode]) || defaultWorkbenchConfig
    return applyRealData(base, overview, warnings)
  }, [userInfo?.positionCode, overview, warnings])

  const title = config.greeting
    ? `${greetingWord()}，${userInfo?.nickname ?? ''}`
    : (config.title ?? '工作台')

  return (
    <div className="workbench-page">
      <PageContainer title={title} description={config.subtitle}>
        {config.banner && <AlertBanner config={config.banner} />}
        <MetricRow items={config.metrics} />
        <div className="workbench-page__panels">
          <MainPanel config={config.main} />
          {config.side.type === 'stats' ? (
            <StatsPanel config={config.side} />
          ) : (
            <TrendPanel config={config.side} />
          )}
        </div>
        <QuickLinksRow title={config.quickLinksTitle} links={config.quickLinks} />
      </PageContainer>
    </div>
  )
}
