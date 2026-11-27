/**
 * 工作台模板配置类型
 * 各岗位工作台（设计稿：健康管理师 / 护理院养老顾问 / 机构管理员 /
 * 健康驿站运营专员 / 平台管理员 / 审核医生）共用同一套区块组件，
 * 差异通过配置表达；数值统一取自 GET /dashboard/overview（见 fields.ts）
 * - key：配置该区块展示的 overview 字段；未配置表示接口无对应字段，数值显示「-」
 * - permissions：配置权限码后按登录用户权限过滤（无权限整项不展示）
 */

/**
 * overview 接口字段键（对应 DashboardOverview 字段路径）
 * 仅使用接口已返回的字段，避免指标与接口口径不一致
 */
export type OverviewFieldKey =
  | 'today.pending_dispatch'
  | 'today.dispatch_confirming'
  | 'today.wo_running'
  | 'today.wo_completed'
  | 'today.scheduled_staff'
  | 'lead.new'
  | 'lead.followup_due_today'
  | 'appointment.confirmed_today'
  | 'appointment.arriving_today'
  | 'health.pending_assessment'
  | 'health.warn_active'
  | 'health.warn_high'
  | 'health.followup_due_today'
  | 'health.plan_pending_confirm'
  | 'visit.today_visit'

/** 带权限控制的配置项（权限码为空表示所有登录用户可见） */
export interface Permissioned {
  /** 允许查看的权限码（拥有任一即可；all:manage 全量放行） */
  permissions?: string[]
}

/** 告警横幅 */
export interface BannerConfig extends Permissioned {
  /** 如「红色健康告警」 */
  title: string
  /** 数量，运行时由 key 对应的 overview 字段覆盖 */
  count: number
  /** 辅助说明 */
  desc: string
  /** 右侧操作文案，如「进入处理 →」 */
  actionText: string
  /** 点击跳转路径 */
  path: string
  /** 数量来源字段；未配置时不展示横幅（无真实数据） */
  key?: OverviewFieldKey
}

/** 指标卡片 */
export interface MetricItem extends Permissioned {
  label: string
  /** 展示数值，运行时由 key 对应的 overview 字段覆盖 */
  value: number | string
  /** 后缀单位，如「场」「人」「条」 */
  suffix?: string
  /** 红色强调（风险类指标） */
  danger?: boolean
  /** 卡片右下角链接文案 */
  linkText?: string
  /** 链接路径（对应列表页路由） */
  path?: string
  /** 数值来源字段；未配置时显示「-」（如接口未提供的审核类指标） */
  key?: OverviewFieldKey
}

/** 左侧面板列表项 */
export interface ListItem {
  /** 主标题（如任务名 / 活动名 / 人员名） */
  title: string
  /** 中部说明（如「张女士 · 血压186/106mmHg」） */
  info?: string
  /** 右侧状态 / 时间（如「立即核实」「报名25 / 签到18」） */
  tag?: string
  /** 状态色调：danger 红 / success 绿 / muted 灰 */
  tone?: 'danger' | 'success' | 'muted'
}

/** 左侧面板 */
export interface MainPanelConfig extends Permissioned {
  title: string
  /** dot：左侧圆点列表（任务类）；plain：无圆点（活动/负荷类） */
  variant: 'dot' | 'plain'
  items: ListItem[]
  /** 列表为空时的提示文案（默认「暂无数据」） */
  emptyText?: string
}

/** 统计行（右侧统计面板 / 趋势面板共用） */
export interface StatRow extends Permissioned {
  label: string
  value: string
  danger?: boolean
  /** 数值来源字段；未配置时显示「-」 */
  key?: OverviewFieldKey
}

/** 右侧统计面板（在管患者概况 / 今日概况等） */
export interface StatsPanelConfig extends Permissioned {
  type: 'stats'
  title: string
  items: StatRow[]
}

/** 右侧趋势面板（机构/平台订单趋势：接口未提供，暂不使用） */
export interface TrendPanelConfig extends Permissioned {
  type: 'trend'
  title: string
  /** 近 30 日柱状图数据（相对高度 0-100） */
  bars: number[]
  stats: StatRow[]
  footnote?: string
}

/** 快捷入口项 */
export interface QuickLink {
  label: string
  path: string
  /** default 灰绿底 / warn 警示黄底 / info 专业蓝底 */
  tone?: 'default' | 'warn' | 'info'
  /** 权限码：拥有任一权限码才展示（受目录权限控制） */
  permissions?: string[]
}

/** 岗位工作台模板配置 */
export interface WorkbenchConfig {
  /** true：标题为「{问候}，{昵称}」（健康管理师样式）；false：固定标题 */
  greeting?: boolean
  /** 固定标题（greeting=false 时使用），如「机构运营总览」 */
  title?: string
  /** 副标题 */
  subtitle: string
  banner?: BannerConfig
  metrics: MetricItem[]
  /** 左侧面板；未配置（或用户无权限）时不渲染 */
  main?: MainPanelConfig
  /** 右侧面板；未配置（或用户无权限）时不渲染 */
  side?: StatsPanelConfig | TrendPanelConfig
  /** 快捷入口标题，如「快捷入口（受目录权限控制）」 */
  quickLinksTitle: string
  quickLinks: QuickLink[]
}
