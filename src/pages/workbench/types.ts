/**
 * 工作台模板配置类型
 * 各岗位工作台（设计稿：健康管理师 / 护理院养老顾问 / 机构管理员 /
 * 健康驿站运营专员 / 平台管理员 / 审核医生）共用同一套区块组件，
 * 差异通过配置表达；数据接入真实接口后替换 configs.ts 中的 mock
 */

/** 告警横幅 */
export interface BannerConfig {
  /** 如「红色健康告警」 */
  title: string
  /** 数量（如 3） */
  count: number
  /** 辅助说明 */
  desc: string
  /** 右侧操作文案，如「立即处理 →」 */
  actionText: string
  /** 点击跳转路径 */
  path: string
}

/** 指标卡片 */
export interface MetricItem {
  label: string
  value: number | string
  /** 后缀单位，如「场」「人」「条」 */
  suffix?: string
  /** 红色强调（风险类指标） */
  danger?: boolean
  /** 卡片右下角链接文案 */
  linkText?: string
  /** 链接路径 */
  path?: string
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
export interface MainPanelConfig {
  title: string
  /** dot：左侧圆点列表（任务类）；plain：无圆点（活动/负荷类） */
  variant: 'dot' | 'plain'
  items: ListItem[]
  /** 列表为空时的提示文案（默认「暂无数据」） */
  emptyText?: string
}

/** 右侧统计面板（在管患者概况 / 漏斗等） */
export interface StatsPanelConfig {
  type: 'stats'
  title: string
  items: { label: string; value: string; danger?: boolean }[]
}

/** 右侧趋势面板（机构/平台订单趋势） */
export interface TrendPanelConfig {
  type: 'trend'
  title: string
  /** 近 30 日柱状图数据（相对高度 0-100） */
  bars: number[]
  stats: { label: string; value: string; danger?: boolean }[]
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
  main: MainPanelConfig
  side: StatsPanelConfig | TrendPanelConfig
  /** 快捷入口标题，如「快捷入口（受目录权限控制）」 */
  quickLinksTitle: string
  quickLinks: QuickLink[]
}
