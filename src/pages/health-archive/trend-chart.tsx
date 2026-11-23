/** 将健康指标趋势接口的 series/points 绘制为带参考范围的折线图。 */
import { useId } from 'react'
import { Card, Empty, Tag, Tooltip } from 'antd'
import dayjs from 'dayjs'
import type { MetricItem } from '@/api/modules/metric'
import type { ArchiveData } from './Plan/shared'
import { asObject, formatTimestamp, pick } from './Plan/shared'

type TrendPointStatus = 'normal' | 'high' | 'low' | 'abnormal' | 'unknown'

export interface TrendPoint {
  time: number
  value: number
  status: TrendPointStatus
  raw: ArchiveData
}

export interface TrendSeries {
  code: string
  name: string
  unit: string
  refLower: number | null
  refUpper: number | null
  refLowerText: string
  refUpperText: string
  points: TrendPoint[]
}

const STATUS_META: Record<TrendPointStatus, { label: string; color: string }> = {
  normal: { label: '正常', color: 'green' },
  high: { label: '高于正常范围', color: 'red' },
  low: { label: '低于正常范围', color: 'orange' },
  abnormal: { label: '异常', color: 'red' },
  unknown: { label: '未判定', color: 'default' },
}

function toTimestamp(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value) && value > 0) {
    return value > 1_000_000_000_000 ? Math.floor(value / 1000) : value
  }
  if (typeof value === 'string' && value.trim()) {
    const numeric = Number(value)
    if (Number.isFinite(numeric) && numeric > 0) return numeric > 1_000_000_000_000 ? Math.floor(numeric / 1000) : numeric
    const parsed = dayjs(value)
    return parsed.isValid() ? parsed.unix() : null
  }
  return null
}

function toNumber(value: unknown): number | null {
  if (typeof value === 'number') return Number.isFinite(value) ? value : null
  if (typeof value !== 'string' || !value.trim()) return null
  const numeric = Number(value)
  return Number.isFinite(numeric) ? numeric : null
}

function getPointStatus(value: number, raw: ArchiveData, refLower: number | null, refUpper: number | null): TrendPointStatus {
  // 正常范围优先于接口冗余的异常标记，确保图形与当前参考范围一致。
  if (refLower != null && value < refLower) return 'low'
  if (refUpper != null && value > refUpper) return 'high'
  if (refLower != null || refUpper != null) return 'normal'
  const reported = Number(pick(raw, ['is_abnormal']))
  if (reported === 1) return 'abnormal'
  if (reported === 2) return 'normal'
  return 'unknown'
}

function toPoint(value: unknown, refLower: number | null, refUpper: number | null): TrendPoint | null {
  const raw = asObject(value)
  const time = toTimestamp(pick(raw, ['measurement_time', 'measured_at', 'timestamp', 'time', 'created_at']))
  const metricValue = toNumber(pick(raw, ['metric_value', 'value', 'val']))
  return time != null && metricValue != null
    ? { time, value: metricValue, status: getPointStatus(metricValue, raw, refLower, refUpper), raw }
    : null
}

function toSeries(value: unknown, fallbackCode: string | undefined, metricMap: Map<string, MetricItem>): TrendSeries | null {
  const raw = asObject(value)
  const pointValues = pick(raw, ['points', 'records', 'list', 'items', 'values'])
  if (!Array.isArray(pointValues)) return null
  const code = String(pick(raw, ['metric_code', 'code']) ?? fallbackCode ?? '')
  const dictionary = metricMap.get(code)
  const refLowerValue = pick(raw, ['ref_lower', 'refLower'])
  const refUpperValue = pick(raw, ['ref_upper', 'refUpper'])
  const refLower = toNumber(refLowerValue)
  const refUpper = toNumber(refUpperValue)
  const points = pointValues.map((point) => toPoint(point, refLower, refUpper))
    .filter((point): point is TrendPoint => point != null)
    .sort((left, right) => left.time - right.time)
  return {
    code,
    name: String(pick(raw, ['metric_name_cn', 'metric_name', 'name']) ?? dictionary?.metric_name_cn ?? code ?? '健康指标'),
    unit: String(pick(raw, ['metric_unit', 'unit_symbol', 'unit']) ?? dictionary?.metric_unit ?? dictionary?.unit_symbol ?? ''),
    refLower,
    refUpper,
    refLowerText: refLowerValue == null ? '' : String(refLowerValue),
    refUpperText: refUpperValue == null ? '' : String(refUpperValue),
    points,
  }
}

/** 优先解析文档声明的 series 结构，同时兼容旧的编码映射和平铺记录。 */
export function parseTrendSeries(result: unknown, metrics: MetricItem[]): TrendSeries[] {
  const metricMap = new Map(metrics.map((item) => [item.metric_code, item]))
  const root = asObject(result)
  const directSeries = toSeries(root, undefined, metricMap)
  if (directSeries) return [directSeries]
  const container = pick(root, ['series', 'trends', 'metrics', 'list', 'items', 'data']) ?? result
  const entries = Array.isArray(container)
    ? container.map((value) => ({ value, code: undefined }))
    : Object.entries(asObject(container)).map(([code, value]) => ({ value, code }))
  const series = entries.map(({ value, code }) => toSeries(value, code, metricMap))
    .filter((item): item is TrendSeries => item != null)
  if (series.length > 0) return series

  const flatPoints = entries.map(({ value }) => asObject(value)).filter((item) => pick(item, ['metric_value', 'value', 'val']) != null)
  const groups = new Map<string, ArchiveData[]>()
  flatPoints.forEach((point) => {
    const code = String(pick(point, ['metric_code', 'code']) ?? '')
    groups.set(code, [...groups.get(code) ?? [], point])
  })
  return Array.from(groups.entries()).map(([code, points]) => toSeries({ metric_code: code, points }, code, metricMap))
    .filter((item): item is TrendSeries => item != null)
}

function formatValue(value: number) {
  return new Intl.NumberFormat('zh-CN', { maximumFractionDigits: 2 }).format(value)
}

function formatRange(series: TrendSeries) {
  if (!series.refLowerText && !series.refUpperText) return '接口未提供正常参考范围'
  return `${series.refLowerText || '-∞'} ~ ${series.refUpperText || '+∞'}${series.unit ? ` ${series.unit}` : ''}`
}

function TrendLineChart({ series }: { series: TrendSeries }) {
  const clipId = `trend-clip-${useId().replace(/:/g, '')}`
  const { points } = series
  const width = 820
  const height = 320
  const margin = { top: 28, right: 30, bottom: 48, left: 70 }
  const innerWidth = width - margin.left - margin.right
  const innerHeight = height - margin.top - margin.bottom

  if (points.length === 0) return <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="暂无可绘制的数值记录" />

  const domainValues = [
    ...points.map((point) => point.value),
    ...(series.refLower == null ? [] : [series.refLower]),
    ...(series.refUpper == null ? [] : [series.refUpper]),
  ]
  const times = points.map((point) => point.time)
  const rawMin = Math.min(...domainValues)
  const rawMax = Math.max(...domainValues)
  const valuePadding = rawMax === rawMin ? Math.max(Math.abs(rawMax) * 0.1, 1) : (rawMax - rawMin) * 0.12
  const minValue = rawMin - valuePadding
  const maxValue = rawMax + valuePadding
  const minTime = Math.min(...times)
  const maxTime = Math.max(...times)
  const yForValue = (value: number) => margin.top + ((maxValue - value) / (maxValue - minValue)) * innerHeight
  const coordinates = points.map((point) => ({
    ...point,
    x: margin.left + (maxTime === minTime ? innerWidth / 2 : ((point.time - minTime) / (maxTime - minTime)) * innerWidth),
    y: yForValue(point.value),
  }))
  const yTicks = Array.from({ length: 5 }, (_, index) => minValue + ((maxValue - minValue) * index) / 4).reverse()
  const labelCount = Math.min(5, points.length)
  const labelIndexes = Array.from(new Set(Array.from({ length: labelCount }, (_, index) => (
    labelCount === 1 ? 0 : Math.round((index * (points.length - 1)) / (labelCount - 1))
  ))))
  const hasRange = series.refLower != null || series.refUpper != null
  const bandTop = yForValue(series.refUpper ?? maxValue)
  const bandBottom = yForValue(series.refLower ?? minValue)

  return (
    <div className="archive-trend__canvas">
      <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label={`${series.name}指标趋势图`}>
        <defs>
          <clipPath id={clipId}>
            <rect x={margin.left} y={margin.top} width={innerWidth} height={innerHeight} />
          </clipPath>
        </defs>
        {hasRange && (
          <g clipPath={`url(#${clipId})`}>
            <rect
              className="archive-trend__normal-band" x={margin.left} y={bandTop}
              width={innerWidth} height={Math.max(0, bandBottom - bandTop)}
            />
          </g>
        )}
        {yTicks.map((tick, index) => {
          const y = yForValue(tick)
          return (
            <g key={`${tick}-${index}`}>
              <line className="archive-trend__grid" x1={margin.left} x2={width - margin.right} y1={y} y2={y} />
              <text className="archive-trend__axis-label" x={margin.left - 12} y={y + 4} textAnchor="end">{formatValue(tick)}</text>
            </g>
          )
        })}
        {[
          { value: series.refLower, label: '下限' },
          { value: series.refUpper, label: '上限' },
        ].map((reference) => reference.value == null ? null : (
          <g key={reference.label}>
            <line
              className="archive-trend__reference-line" x1={margin.left} x2={width - margin.right}
              y1={yForValue(reference.value)} y2={yForValue(reference.value)}
            />
            <text
              className="archive-trend__reference-label" x={width - margin.right - 4}
              y={yForValue(reference.value) - 6} textAnchor="end"
            >{reference.label} {formatValue(reference.value)}</text>
          </g>
        ))}
        <polyline
          className="archive-trend__line"
          points={coordinates.map((point) => `${point.x},${point.y}`).join(' ')}
        />
        {coordinates.map((point, index) => {
          const status = STATUS_META[point.status]
          const timeText = dayjs(point.time * 1000).format('YYYY-MM-DD HH:mm')
          return (
            <g key={`${point.time}-${index}`}>
              <Tooltip
                placement="top" mouseEnterDelay={0.1}
                title={(
                  <div className="archive-trend__tooltip">
                    <span>{timeText}</span>
                    <strong>{formatValue(point.value)} {series.unit}</strong>
                    <span>结果：{status.label}</span>
                    <span>正常范围：{formatRange(series)}</span>
                  </div>
                )}
              >
                <circle
                  className={`archive-trend__point is-${point.status}`} cx={point.x} cy={point.y} r={6} tabIndex={0}
                  aria-label={`${timeText}，测量值 ${formatValue(point.value)} ${series.unit}，${status.label}`}
                />
              </Tooltip>
              {labelIndexes.includes(index) && (
                <text className="archive-trend__axis-label" x={point.x} y={height - 14} textAnchor="middle">
                  {dayjs(point.time * 1000).format('MM-DD')}
                </text>
              )}
            </g>
          )
        })}
      </svg>
    </div>
  )
}

function TrendCard({ series }: { series: TrendSeries }) {
  const values = series.points.map((point) => point.value)
  const latest = series.points[series.points.length - 1]
  const maximum = values.length ? Math.max(...values) : undefined
  const minimum = values.length ? Math.min(...values) : undefined
  const average = values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : undefined
  const abnormalCount = series.points.filter((point) => ['high', 'low', 'abnormal'].includes(point.status)).length
  const latestStatus = latest ? STATUS_META[latest.status] : undefined
  const stats = [
    { label: '最高值', value: maximum },
    { label: '最低值', value: minimum },
    { label: '平均值', value: average },
    { label: '异常点', value: abnormalCount, suffix: ` / ${series.points.length}` },
  ]

  return (
    <Card
      className="archive-trend__card"
      title={(
        <div className="archive-trend__heading">
          <span>{series.name}</span>
          {series.code && <Tag>{series.code}</Tag>}
        </div>
      )}
      extra={series.unit || '-'}
    >
      <div className="archive-trend__overview">
        <div className="archive-trend__latest">
          <span>最近记录</span>
          <strong>{latest ? `${formatValue(latest.value)} ${series.unit}` : '-'}</strong>
          {latestStatus && <Tag color={latestStatus.color}>{latestStatus.label}</Tag>}
          <span>{latest ? formatTimestamp(latest.time) : '暂无测量时间'}</span>
        </div>
        <div className="archive-trend__reference">
          <span>正常参考范围</span>
          <strong>{formatRange(series)}</strong>
        </div>
      </div>
      <div className="archive-trend__stats">
        {stats.map((stat) => (
          <div key={stat.label}>
            <span>{stat.label}</span>
            <strong>{stat.value == null ? '-' : `${formatValue(stat.value)}${stat.suffix ?? ''}`}</strong>
          </div>
        ))}
      </div>
      <div className="archive-trend__legend" aria-label="趋势图图例">
        <span><i className="is-normal" />正常</span>
        <span><i className="is-high" />高于范围</span>
        <span><i className="is-low" />低于范围</span>
        {(series.refLower != null || series.refUpper != null) && <span><i className="is-range" />正常参考区间</span>}
      </div>
      <TrendLineChart series={series} />
    </Card>
  )
}

export default function TrendResult({ series }: { series: TrendSeries[] }) {
  if (series.length === 0) return <Empty description="当前查询条件下暂无趋势数据" />
  return <div className="archive-trend">{series.map((item) => <TrendCard key={item.code || item.name} series={item} />)}</div>
}
