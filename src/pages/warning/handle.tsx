/**
 * 预警管理 - 健康预警医生处置（设计稿：医生处置.png）
 * 已对接：
 * - GET  /api/v1/staff/warnings/:id       预警详情
 * - POST /api/v1/staff/warnings/:id/handle 处置（可调整风险等级，§6.2）
 * - POST /api/v1/staff/warnings/:id/ignore 忽略
 * 说明：处置单结构化字段（后续动作/复测回传）API v0.1 未定义，随 note 一并提交
 */
import { useCallback, useEffect, useState } from 'react'
import { Button, Checkbox, Input, Radio, App } from 'antd'
import { useNavigate, useParams } from 'react-router-dom'
import PageContainer from '@/components/PageContainer'
import { warningApi } from '@/api'
import { WARNING_SEVERITY_MAP, type WarningItem } from '@/api/modules/warning'
import './index.less'

const RISK_OPTIONS = [
  { label: '低风险', value: 1 },
  { label: '中风险', value: 2 },
  { label: '高风险', value: 3 },
]

const ACTION_OPTIONS = ['创建回访任务', '调整管理目标', '复测提醒']

/** 关闭条件（设计稿固定说明文案） */
const CLOSE_CONDITIONS = [
  '患者核实完成，医生判断与处置意见已记录',
  '复测 / 就医结果已回传',
  '后续随访已完成或明确取消',
  '处置结论已回写健康档案',
]

export default function WarningHandle() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const { message } = App.useApp()
  const [detail, setDetail] = useState<WarningItem | null>(null)
  const [risk, setRisk] = useState<number>(2)
  const [opinion, setOpinion] = useState('')
  const [actions, setActions] = useState<string[]>([])
  const [stopService, setStopService] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const fetchDetail = useCallback(async () => {
    if (!id) return
    try {
      const res = await warningApi.getWarningDetail(id)
      setDetail(res)
      if (res.severity) setRisk(res.severity)
    } catch {
      // 错误提示由拦截器统一处理
    }
  }, [id])

  useEffect(() => {
    fetchDetail()
  }, [fetchDetail])

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
        title="健康预警医生处置"
        description="医生一次完成健康风险判断与派生层级变化确认，避免重复预警和重复处置"
        extra={<span className="wn-tag wn-tag--orange">待医生处理</span>}
      >
        <div className="wn-handle">
          {/* 左：预警与核实信息 */}
          <div className="wn-card">
            <div className="wn-card__header">
              <span className="wn-card__title">预警与核实信息</span>
            </div>
            <div className="wn-handle__metric">
              <span className="wn-handle__metric-name">{detail?.title}</span>
              <span className="wn-handle__metric-value">
                {detail ? WARNING_SEVERITY_MAP[detail.severity] : undefined}
              </span>
              <div className="wn-handle__metric-meta">
                {detail?.member_name}
              </div>
            </div>

            <div className="wn-field">
              <div className="wn-field__label">
                医生风险判断 <span className="wn-required">*</span>
              </div>
              <Radio.Group
                value={risk}
                onChange={(e) => setRisk(e.target.value as number)}
                className="wn-pill-radio"
              >
                {RISK_OPTIONS.map((o) => (
                  <Radio.Button key={o.value} value={o.value}>
                    {o.label}
                  </Radio.Button>
                ))}
              </Radio.Group>
            </div>

            <div className="wn-field">
              <div className="wn-field__label">
                医生处置意见 <span className="wn-required">*</span>
              </div>
              <Input.TextArea
                rows={3}
                value={opinion}
                onChange={(e) => setOpinion(e.target.value)}
                placeholder="请输入处置意见"
              />
            </div>

            <div className="wn-field wn-field--last">
              <div className="wn-field__label">后续动作</div>
              <Checkbox.Group
                value={actions}
                onChange={(v) => setActions(v as string[])}
                className="wn-checks"
                options={ACTION_OPTIONS}
              />
            </div>

            <div className="wn-field wn-field--last">
              <div className="wn-field__label">处置后服务</div>
              <Radio.Group
                value={stopService}
                onChange={(e) => setStopService(e.target.value as boolean)}
                className="wn-pill-radio"
              >
                <Radio.Button value={false}>继续服务</Radio.Button>
                <Radio.Button value={true}>中止服务</Radio.Button>
              </Radio.Group>
            </div>
          </div>

          {/* 右：关闭条件 */}
          <div className="wn-card">
            <div className="wn-card__header">
              <span className="wn-card__title">关闭条件</span>
            </div>
            <div className="wn-handle__close-tip">
              预警不是医生提交意见后立即关闭。以下条件满足后才可关闭：
            </div>
            <ol className="wn-handle__conditions">
              {CLOSE_CONDITIONS.map((c) => (
                <li key={c}>{c}</li>
              ))}
            </ol>
            <div className="wn-handle__submit">
              <Button type="primary" onClick={onSubmit} loading={submitting}>
                提交医生处置
              </Button>
              <Button style={{ marginLeft: 12 }} onClick={onIgnore} loading={submitting}>
                忽略预警
              </Button>
            </div>
          </div>
        </div>
      </PageContainer>
    </div>
  )
}
