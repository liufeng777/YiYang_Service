/** 预警完成处置：使用真实详情与处置接口，不再使用本地关闭 mock。 */
import { useCallback, useEffect, useState } from 'react'
import { App, Button, Input, Radio, Spin } from 'antd'
import { ArrowLeftOutlined } from '@ant-design/icons'
import { useNavigate, useParams } from 'react-router-dom'
import PageContainer from '@/components/PageContainer'
import { warningApi } from '@/api'
import { WARNING_STATUS_MAP, type WarningItem } from '@/api/modules/warning'
import './index.less'

export default function WarningClose() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const { message } = App.useApp()
  const [detail, setDetail] = useState<WarningItem | null>(null)
  const [loading, setLoading] = useState(false)
  const [conclusion, setConclusion] = useState('')
  const [stopService, setStopService] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const fetchDetail = useCallback(async () => {
    if (!id) return
    setLoading(true)
    try {
      setDetail(await warningApi.getWarningDetail(id))
    } catch {
      // 错误提示由拦截器统一处理
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    fetchDetail()
  }, [fetchDetail])

  const onSubmit = async () => {
    if (!id) return
    if (!conclusion.trim()) {
      message.warning('请填写处置结论')
      return
    }
    setSubmitting(true)
    try {
      await warningApi.handleWarning(id, {
        warning_status: stopService ? 5 : 4,
        handled_reason: conclusion.trim(),
      })
      message.success('预警处置结果已提交')
      navigate('/warning')
    } catch {
      // 错误提示由拦截器统一处理
    } finally {
      setSubmitting(false)
    }
  }

  const isPending = detail?.warning_status === 0 || detail?.warning_status === 1

  return (
    <div className="wn-page">
      <PageContainer
        title="完成预警处置"
        description="核对预警信息后，提交最终处置结论与服务安排"
        extra={<Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/warning')}>返回预警列表</Button>}
      >
        <Spin spinning={loading}>
          <div className="wn-close">
            <div className="wn-card">
              <div className="wn-card__header"><span className="wn-card__title">预警信息</span></div>
              <div className="wn-field"><div className="wn-field__label">预警内容</div><div>{detail?.title}</div></div>
              <div className="wn-field"><div className="wn-field__label">服务对象</div><div>{detail?.member_name}</div></div>
              {/* <div className="wn-field"><div className="wn-field__label">指标快照</div><div>{detail?.metric_values}</div></div> */}
              <div className="wn-field"><div className="wn-field__label">当前状态</div><div>{detail ? WARNING_STATUS_MAP[detail.warning_status] : undefined}</div></div>
              <div className="wn-field"><div className="wn-field__label">已有处置意见</div><div>{detail?.handled_reason}</div></div>
            </div>

            <div className="wn-card">
              <div className="wn-card__header"><span className="wn-card__title">处置结论</span></div>
              {isPending ? (
                <>
                  <div className="wn-field">
                    <div className="wn-field__label">结论说明 <span className="wn-required">*</span></div>
                    <Input.TextArea rows={4} value={conclusion} onChange={(event) => setConclusion(event.target.value)} placeholder="请填写最终判断和处理结论" maxLength={1000} showCount />
                  </div>
                  <div className="wn-field wn-field--last">
                    <div className="wn-field__label">后续服务安排</div>
                    <Radio.Group value={stopService} onChange={(event) => setStopService(event.target.value as boolean)}>
                      <Radio.Button value={false}>继续服务</Radio.Button>
                      <Radio.Button value>中止服务</Radio.Button>
                    </Radio.Group>
                  </div>
                  <div className="wn-close__actions">
                    <Button type="primary" onClick={onSubmit} loading={submitting}>提交处置结果</Button>
                  </div>
                </>
              ) : (
                <div className="wn-note-box">
                  <div className="wn-note-box__title">该预警已完成处理</div>
                  <div className="wn-note-box__line">处理状态：{detail ? WARNING_STATUS_MAP[detail.warning_status] : undefined}</div>
                  <div className="wn-note-box__line">处置意见：{detail?.handled_reason}</div>
                </div>
              )}
            </div>
          </div>
        </Spin>
      </PageContainer>
    </div>
  )
}
