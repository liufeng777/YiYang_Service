/**
 * 健康预警详情与医生处置
 * GET  /api/v1/staff/warnings/:id       预警详情
 * POST /api/v1/staff/warnings/:id/handle 处置
 * POST /api/v1/staff/warnings/:id/ignore 忽略
 */
import { useCallback, useEffect, useMemo, useState } from 'react'
import { App, Button, Checkbox, Descriptions, Image, Input, Radio, Space, Spin } from 'antd'
import { ArrowLeftOutlined } from '@ant-design/icons'
import { useNavigate, useParams } from 'react-router-dom'
import PageContainer from '@/components/PageContainer'
import SensitiveText from '@/components/SensitiveText'
import { warningApi } from '@/api'
import {
  WARNING_SEVERITY_MAP,
  WARNING_SOURCE_MAP,
  WARNING_STATUS_MAP,
  type WarningItem,
} from '@/api/modules/warning'
import { formatDateTime } from '@/utils'
import './index.less'

const RISK_OPTIONS = [
  { label: '低风险', value: 1 },
  { label: '中风险', value: 2 },
  { label: '高风险', value: 3 },
]

const ACTION_OPTIONS = ['创建回访任务', '调整管理目标', '复测提醒']

const CLOSE_CONDITIONS = [
  '患者核实完成，医生判断与处置意见已记录',
  '复测 / 就医结果已回传',
  '后续随访已完成或明确取消',
  '处置结论已回写健康档案',
]

const SEVERITY_TONE: Record<number, string> = { 1: 'green', 2: 'orange', 3: 'red' }
const STATUS_TONE: Record<number, string> = {
  0: 'red',
  1: 'red',
  2: 'blue',
  3: 'gray',
  4: 'green',
  5: 'orange',
}

function formatTimestamp(value?: number) {
  return value ? formatDateTime(value * 1000) : '-'
}

function displayText(value?: string | number | null) {
  const text = String(value ?? '').trim()
  return text || '-'
}

function formatMetricValue(value: unknown) {
  if (value === null || value === undefined || value === '') return '-'
  if (typeof value === 'object') {
    try {
      return JSON.stringify(value)
    } catch {
      return String(value)
    }
  }
  return String(value)
}

/** 同时兼容详情对象、列表 JSON 字符串及普通文本指标。 */
function getMetricEntries(metricValues: WarningItem['metric_values']): Array<[string, string]> {
  if (!metricValues) return []
  let parsed: unknown = metricValues
  if (typeof metricValues === 'string') {
    const raw = metricValues.trim()
    if (!raw) return []
    try {
      parsed = JSON.parse(raw)
    } catch {
      return [['指标值', raw]]
    }
  }
  if (Array.isArray(parsed)) {
    return parsed.map((value, index) => [`指标 ${index + 1}`, formatMetricValue(value)])
  }
  if (typeof parsed === 'object' && parsed !== null) {
    return Object.entries(parsed).map(([key, value]) => [key, formatMetricValue(value)])
  }
  return [['指标值', formatMetricValue(parsed)]]
}

/** 图片字段兼容数组、JSON 数组字符串及逗号 / 换行分隔地址。 */
function getWarningImages(images: WarningItem['images']) {
  const rawImages = Array.isArray(images) ? images : [images ?? '']
  return rawImages.flatMap((item) => {
    const raw = item.trim()
    if (!raw) return []
    if (raw.startsWith('[')) {
      try {
        const parsed: unknown = JSON.parse(raw)
        if (Array.isArray(parsed)) {
          return parsed.filter((value): value is string => typeof value === 'string' && Boolean(value.trim()))
        }
      } catch {
        // 非 JSON 时继续按普通分隔字符串处理。
      }
    }
    return raw.split(/[\n,，]/)
  }).map((item) => item.trim()).filter(Boolean)
}

export default function WarningHandle() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const { message } = App.useApp()
  const [detail, setDetail] = useState<WarningItem | null>(null)
  const [loading, setLoading] = useState(true)
  const [risk, setRisk] = useState<number>(2)
  const [opinion, setOpinion] = useState('')
  const [actions, setActions] = useState<string[]>([])
  const [stopService, setStopService] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const fetchDetail = useCallback(async () => {
    if (!id) {
      setLoading(false)
      return
    }
    setLoading(true)
    try {
      const res = await warningApi.getWarningDetail(id)
      setDetail(res)
      if (res.severity) setRisk(res.severity)
      setOpinion(res.handled_reason ?? '')
    } catch {
      // 错误提示由拦截器统一处理
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    fetchDetail()
  }, [fetchDetail])

  const metricEntries = useMemo(() => getMetricEntries(detail?.metric_values), [detail?.metric_values])
  const images = useMemo(() => getWarningImages(detail?.images), [detail?.images])
  const isPending = detail?.warning_status === 0 || detail?.warning_status === 1
  const severityTone = SEVERITY_TONE[detail?.severity ?? 0] ?? 'gray'
  const statusTone = STATUS_TONE[detail?.warning_status ?? 0] ?? 'gray'

  const onSubmit = async () => {
    if (!opinion.trim()) {
      message.warning('请填写医生处置意见')
      return
    }
    if (!id) return
    setSubmitting(true)
    try {
      await warningApi.handleWarning(id, {
        warning_status: stopService ? 5 : 4,
        handled_reason: opinion.trim(),
        adjust_risk_level: risk,
        note: actions.length > 0 ? `后续动作：${actions.join('、')}` : undefined,
      })
      message.success('医生处置已提交，待复测结果回传后可关闭预警')
      navigate('/warning')
    } catch {
      // 错误提示由拦截器统一处理
    } finally {
      setSubmitting(false)
    }
  }

  const onIgnore = async () => {
    if (!id) return
    setSubmitting(true)
    try {
      await warningApi.ignoreWarning(id)
      message.success('已忽略该预警')
      navigate('/warning')
    } catch {
      // 错误提示由拦截器统一处理
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="wn-page">
      <PageContainer
        title="健康预警详情"
        description="查看预警内容、指标快照与处置记录"
        extra={(
          <Space>
            {detail && (
              <span className={`status-tag status-tag--${statusTone}`}>
                {WARNING_STATUS_MAP[detail.warning_status] ?? '未知状态'}
              </span>
            )}
            <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/warning')}>返回列表</Button>
          </Space>
        )}
      >
        <Spin spinning={loading}>
          <div className="wn-handle wn-handle--detail">
            <div className="wn-card wn-detail__main">
              <div className="wn-card__header">
                <span className="wn-card__title">预警信息</span>
                {detail && (
                  <span className={`status-tag status-tag--${severityTone}`}>
                    {WARNING_SEVERITY_MAP[detail.severity] ?? '未知等级'}
                  </span>
                )}
              </div>

              <div className={`wn-handle__metric wn-handle__metric--${severityTone}`}>
                <div className="wn-detail__title-row">
                  <span className="wn-handle__metric-name">{displayText(detail?.title)}</span>
                  <span className="wn-handle__metric-value">
                    {detail ? WARNING_SEVERITY_MAP[detail.severity] ?? '未知等级' : '-'}
                  </span>
                </div>
                <div className="wn-handle__metric-meta wn-detail__meta">
                  <span>服务对象：<SensitiveText type="name" value={detail?.member_name} /></span>
                  <span>会员 ID：{detail?.member_id || '-'}</span>
                  <span>预警编号：{detail?.id ? `#${detail.id}` : '-'}</span>
                </div>
              </div>

              <section className="wn-detail__section">
                <h3 className="wn-detail__section-title">预警内容</h3>
                <div className="wn-detail__content">{displayText(detail?.content)}</div>
              </section>

              <Descriptions
                className="wn-detail__descriptions"
                column={{ xs: 1, sm: 2 }}
                size="small"
                bordered
              >
                <Descriptions.Item label="预警来源">
                  {detail?.warning_source
                    ? WARNING_SOURCE_MAP[detail.warning_source] ?? `其他来源（${detail.warning_source}）`
                    : '-'}
                </Descriptions.Item>
                <Descriptions.Item label="来源记录">
                  {detail?.source_id ? `#${detail.source_id}` : '-'}
                </Descriptions.Item>
                <Descriptions.Item label="触发时间">{formatTimestamp(detail?.created_at)}</Descriptions.Item>
                <Descriptions.Item label="更新时间">{formatTimestamp(detail?.updated_at)}</Descriptions.Item>
              </Descriptions>

              <section className="wn-detail__section">
                <h3 className="wn-detail__section-title">指标快照</h3>
                {metricEntries.length > 0 ? (
                  <Descriptions column={{ xs: 1, sm: 2 }} size="small" bordered>
                    {metricEntries.map(([label, value]) => (
                      <Descriptions.Item key={label} label={label}>
                        <span className="wn-detail__content">{value}</span>
                      </Descriptions.Item>
                    ))}
                  </Descriptions>
                ) : (
                  <div className="wn-detail__empty">暂无指标快照</div>
                )}
              </section>

              <section className="wn-detail__section">
                <h3 className="wn-detail__section-title">相关图片</h3>
                {images.length > 0 ? (
                  <Image.PreviewGroup>
                    <div className="wn-detail__images">
                      {images.map((src, index) => (
                        <Image
                          key={`${src}-${index}`}
                          className="wn-detail__image"
                          src={src}
                          alt={`预警相关图片 ${index + 1}`}
                        />
                      ))}
                    </div>
                  </Image.PreviewGroup>
                ) : (
                  <div className="wn-detail__empty">暂无相关图片</div>
                )}
              </section>
            </div>

            <div className="wn-detail__side">
              <div className="wn-card">
                <div className="wn-card__header">
                  <span className="wn-card__title">处置记录</span>
                  {detail && (
                    <span className={`status-tag status-tag--${statusTone}`}>
                      {WARNING_STATUS_MAP[detail.warning_status] ?? '未知状态'}
                    </span>
                  )}
                </div>
                <Descriptions column={1} size="small" bordered>
                  <Descriptions.Item label="处置人员">
                    {detail?.handled_by_name || (detail?.handled_by ? `人员 ID：${detail.handled_by}` : '-')}
                  </Descriptions.Item>
                  <Descriptions.Item label="处置时间">{formatTimestamp(detail?.handled_at)}</Descriptions.Item>
                  <Descriptions.Item label="处置意见">
                    <span className="wn-detail__content">{displayText(detail?.handled_reason)}</span>
                  </Descriptions.Item>
                </Descriptions>
                {detail && !isPending && (
                  <div className="wn-note-box">
                    <div className="wn-note-box__title">该预警已完成处理</div>
                    <div className="wn-note-box__line">当前页面仅展示处置结果，不可重复提交。</div>
                  </div>
                )}
              </div>

              {isPending && (
                <div className="wn-card">
                  <div className="wn-card__header">
                    <span className="wn-card__title">医生处置</span>
                  </div>
                  <div className="wn-field">
                    <div className="wn-field__label">
                      医生风险判断 <span className="wn-required">*</span>
                    </div>
                    <Radio.Group
                      value={risk}
                      onChange={(event) => setRisk(event.target.value as number)}
                      className="wn-pill-radio"
                    >
                      {RISK_OPTIONS.map((option) => (
                        <Radio.Button key={option.value} value={option.value}>{option.label}</Radio.Button>
                      ))}
                    </Radio.Group>
                  </div>

                  <div className="wn-field">
                    <div className="wn-field__label">
                      医生处置意见 <span className="wn-required">*</span>
                    </div>
                    <Input.TextArea
                      rows={4}
                      value={opinion}
                      onChange={(event) => setOpinion(event.target.value)}
                      placeholder="请输入处置意见"
                      maxLength={1000}
                      showCount
                    />
                  </div>

                  <div className="wn-field">
                    <div className="wn-field__label">后续动作</div>
                    <Checkbox.Group
                      value={actions}
                      onChange={(values) => setActions(values as string[])}
                      className="wn-checks"
                      options={ACTION_OPTIONS}
                    />
                  </div>

                  <div className="wn-field wn-field--last">
                    <div className="wn-field__label">处置后服务</div>
                    <Radio.Group
                      value={stopService}
                      onChange={(event) => setStopService(event.target.value as boolean)}
                      className="wn-pill-radio"
                    >
                      <Radio.Button value={false}>继续服务</Radio.Button>
                      <Radio.Button value>中止服务</Radio.Button>
                    </Radio.Group>
                  </div>

                  <div className="wn-detail__conditions">
                    <div className="wn-handle__close-tip">以下条件满足后才可关闭预警：</div>
                    <ol className="wn-handle__conditions">
                      {CLOSE_CONDITIONS.map((condition) => <li key={condition}>{condition}</li>)}
                    </ol>
                  </div>
                  <div className="wn-handle__submit">
                    <Button onClick={onIgnore} loading={submitting}>忽略预警</Button>
                    <Button type="primary" onClick={onSubmit} loading={submitting}>提交医生处置</Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </Spin>
      </PageContainer>
    </div>
  )
}
