/**
 * 工作台共享区块组件
 * 告警横幅 / 指标卡片 / 列表面板 / 统计面板 / 趋势面板 / 快捷入口
 * 样式见 index.less；配色变量见 variables.less（@color-wb-*）
 */
import { useMemo } from 'react'
import { ArrowRightOutlined } from '@ant-design/icons'
import { Link } from 'react-router-dom'
import { useUserStore } from '@/store/modules/user'
import type {
  BannerConfig,
  MetricItem,
  MainPanelConfig,
  StatsPanelConfig,
  TrendPanelConfig,
  QuickLink,
} from './types'

/** 空权限数组常量（避免选择器每次返回新引用导致无限重渲染） */
const EMPTY_PERMISSIONS: string[] = []

/** 告警横幅（黄底 + 红色标题 + 右侧操作） */
export function AlertBanner({ config }: { config: BannerConfig }) {
  return (
    <div className="wb-banner">
      <div className="wb-banner__left">
        <div className="wb-banner__title">
          {config.title} <span className="wb-banner__count">{config.count}</span>
        </div>
        <div className="wb-banner__desc">{config.desc}</div>
      </div>
      <Link to={config.path} className="wb-banner__action">
        {config.actionText} <ArrowRightOutlined />
      </Link>
    </div>
  )
}

/** 指标卡片行 */
export function MetricRow({ items }: { items: MetricItem[] }) {
  return (
    <div className="wb-metrics">
      {items.map((item) => (
        <div key={item.label} className="wb-metric">
          <div className="wb-metric__label">{item.label}</div>
          <div className={`wb-metric__value${item.danger ? ' wb-metric__value--danger' : ''}`}>
            {item.value}
            {item.suffix && <span className="wb-metric__suffix">{item.suffix}</span>}
          </div>
          {item.linkText && item.path && (
            <Link to={item.path} className="wb-metric__link">
              {item.linkText} <ArrowRightOutlined />
            </Link>
          )}
        </div>
      ))}
    </div>
  )
}

/** 左侧列表面板（dot 任务列表 / plain 活动负荷列表） */
export function MainPanel({ config }: { config: MainPanelConfig }) {
  return (
    <div className="wb-panel">
      <div className="wb-panel__title">{config.title}</div>
      <div className="wb-list">
        {config.items.map((item, index) => (
          <div key={index} className="wb-list__row">
            <div className="wb-list__left">
              {config.variant === 'dot' && (
                <span
                  className={`wb-list__dot${item.tone === 'danger' ? ' wb-list__dot--danger' : ''}`}
                />
              )}
              <span className="wb-list__title">{item.title}</span>
            </div>
            {item.info && <span className="wb-list__info">{item.info}</span>}
            {item.tag && (
              <span
                className={`wb-list__tag${item.tone ? ` wb-list__tag--${item.tone}` : ''}`}
              >
                {item.tag}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

/** 右侧统计面板（标签左 / 数值右） */
export function StatsPanel({ config }: { config: StatsPanelConfig }) {
  return (
    <div className="wb-panel">
      <div className="wb-panel__title">{config.title}</div>
      <div className="wb-stats">
        {config.items.map((item) => (
          <div key={item.label} className="wb-stats__row">
            <span className="wb-stats__label">{item.label}</span>
            <span className={`wb-stats__value${item.danger ? ' wb-stats__value--danger' : ''}`}>
              {item.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

/** 右侧趋势面板（CSS 柱状图 + 统计行 + 脚注） */
export function TrendPanel({ config }: { config: TrendPanelConfig }) {
  return (
    <div className="wb-panel">
      <div className="wb-panel__title">{config.title}</div>
      <div className="wb-trend">
        <div className="wb-trend__bars">
          {config.bars.map((height, index) => (
            <span
              key={index}
              className={`wb-trend__bar${index === config.bars.length - 1 ? ' wb-trend__bar--active' : ''}`}
              style={{ height: `${height}%` }}
            />
          ))}
        </div>
        <div className="wb-trend__stats">
          {config.stats.map((item) => (
            <div key={item.label} className="wb-trend__stat">
              <div className="wb-trend__stat-label">{item.label}</div>
              <div
                className={`wb-trend__stat-value${item.danger ? ' wb-trend__stat-value--danger' : ''}`}
              >
                {item.value}
              </div>
            </div>
          ))}
        </div>
        {config.footnote && <div className="wb-trend__footnote">{config.footnote}</div>}
      </div>
    </div>
  )
}

/** 快捷入口（受目录权限控制：按权限码过滤） */
export function QuickLinksRow({ title, links }: { title: string; links: QuickLink[] }) {
  const permissions = useUserStore((state) => state.userInfo?.permissions ?? EMPTY_PERMISSIONS)

  const visibleLinks = useMemo(
    () =>
      links.filter(
        (link) =>
          !link.permissions ||
          link.permissions.length === 0 ||
          link.permissions.some((code) => permissions.includes(code)),
      ),
    [links, permissions],
  )

  if (visibleLinks.length === 0) return null

  return (
    <div className="wb-panel wb-quick">
      <div className="wb-panel__title">{title}</div>
      <div className="wb-quick__links">
        {visibleLinks.map((link) => (
          <Link
            key={link.label}
            to={link.path}
            className={`wb-quick__link${link.tone ? ` wb-quick__link--${link.tone}` : ''}`}
          >
            {link.label}
          </Link>
        ))}
      </div>
    </div>
  )
}
