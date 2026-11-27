/**
 * 工作台视图模型
 * 把岗位模板配置 + overview / warnings 接口数据 + 当前用户权限，
 * 合成为可直接渲染的配置（权限过滤、字段取值、空态兜底）
 * - 无权限的指标 / 横幅 / 面板 / 统计行整项剔除，保证「进入处理」跳转的页面都可访问
 * - 数值按配置的 key 读取 overview 字段（见 fields.ts），未配置 key 显示「-」
 */
import type { DashboardOverview, DashboardWarningItem } from '@/api/modules/workbench'
import { maskName } from '@/components/SensitiveText'
import { hasAnyPermission } from '@/router/menu'
import { formatOverviewValue, readOverviewField } from './fields'
import type {
  ListItem,
  MainPanelConfig,
  StatsPanelConfig,
  TrendPanelConfig,
  WorkbenchConfig,
} from './types'

/** 预警等级文案（health_warnings.severity） */
const SEVERITY_TEXT: Record<number, string> = { 1: '低风险', 2: '中风险', 3: '高风险' }

/** 预警清单 → 主面板列表项 */
export function warningToListItem(warning: DashboardWarningItem): ListItem {
  return {
    title: warning.title || '健康预警',
    info: warning.member_name ? maskName(warning.member_name) : `会员 #${warning.member_id}`,
    tag: SEVERITY_TEXT[warning.severity] ?? '待核实',
    tone: warning.severity >= 2 ? 'danger' : 'muted',
  }
}

/** 主面板：dot 列表展示真实预警清单；plain 列表接口无数据，仅保留空态 */
export function buildMain(
  main: MainPanelConfig | undefined,
  warnings: DashboardWarningItem[],
  permissions: string[],
): MainPanelConfig | undefined {
  if (!main || !hasAnyPermission(main.permissions, permissions)) return undefined
  if (main.variant === 'dot') {
    return {
      ...main,
      items: warnings.map(warningToListItem),
      emptyText: main.emptyText ?? '暂无待处置预警',
    }
  }
  return { ...main, items: [], emptyText: main.emptyText ?? '暂未对接接口' }
}

/** 右侧面板：统计行按权限过滤并取 overview 数值，全部被过滤时不展示面板 */
export function buildSide(
  side: StatsPanelConfig | TrendPanelConfig | undefined,
  overview: DashboardOverview | undefined,
  permissions: string[],
): StatsPanelConfig | TrendPanelConfig | undefined {
  if (!side || !hasAnyPermission(side.permissions, permissions)) return undefined

  if (side.type === 'stats') {
    const items = side.items
      .filter((item) => hasAnyPermission(item.permissions, permissions))
      .map((item) => ({ ...item, value: String(formatOverviewValue(item.key, overview)) }))
    return items.length > 0 ? { ...side, items } : undefined
  }

  // 趋势面板：柱状数据接口未提供，仅保留按权限过滤后的统计行
  const stats = side.stats
    .filter((item) => hasAnyPermission(item.permissions, permissions))
    .map((item) => ({ ...item, value: String(formatOverviewValue(item.key, overview)) }))
  return stats.length > 0 ? { ...side, stats, bars: [] } : undefined
}

/** 用真实接口数据 + 权限过滤生成最终展示配置 */
export function applyRealData(
  config: WorkbenchConfig,
  overview: DashboardOverview | undefined,
  warnings: DashboardWarningItem[],
  permissions: string[],
): WorkbenchConfig {
  // 告警横幅：仅有真实数据来源（key）且数值 > 0、且有查看权限时展示
  const bannerCount = readOverviewField(config.banner?.key, overview)
  const banner =
    config.banner &&
    hasAnyPermission(config.banner.permissions, permissions) &&
    bannerCount !== undefined &&
    bannerCount > 0
      ? { ...config.banner, count: bannerCount }
      : undefined

  // 指标卡片：按权限过滤，值取自 key 对应字段（无 key 显示「-」）
  const metrics = config.metrics
    .filter((metric) => hasAnyPermission(metric.permissions, permissions))
    .map((metric) => ({ ...metric, value: formatOverviewValue(metric.key, overview) }))

  return {
    ...config,
    banner,
    metrics,
    main: buildMain(config.main, warnings, permissions),
    side: buildSide(config.side, overview, permissions),
  }
}
