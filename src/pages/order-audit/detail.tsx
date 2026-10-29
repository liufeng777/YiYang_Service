/**
 * 订单审核详情：基于 OrderDetail 展示订单、服务、健康档案与联系信息。
 */
import { useCallback, useEffect, useMemo, useState } from 'react'
import { App, Button, Checkbox, Empty, Input, Modal, Spin, Tag } from 'antd'
import {
  ArrowLeftOutlined,
  CheckCircleFilled,
  CheckOutlined,
  ClockCircleOutlined,
  CloseOutlined,
  EnvironmentOutlined,
  ExclamationCircleFilled,
  FileTextOutlined,
  MedicineBoxOutlined,
  PhoneOutlined,
  UserOutlined,
} from '@ant-design/icons'
import { useNavigate, useParams } from 'react-router-dom'
import dayjs from 'dayjs'
import PageContainer from '@/components/PageContainer'
import { orderApi } from '@/api'
import { ORDER_STATUS_MAP, type OrderDetail } from '@/api/modules/order'
import { mockOrderDetail } from './mock'
import './index.less'

const REJECT_REASONS = [
  '必要资料缺失或不清晰',
  '当前健康状况不适合本次服务',
  '申请需求与服务项目不符',
  '需先到院评估或进一步检查',
  '其他',
]

const fmt = (ts?: number | null) => (ts ? dayjs(ts * 1000).format('YYYY-MM-DD HH:mm') : '-')
const genderText = (gender?: number) => (gender === 1 ? '男' : gender === 2 ? '女' : '-')
const textOrDash = (value?: string | null) => value?.trim() || '-'

type AuditView = 'pending' | 'approved' | 'rejected'

function auditViewOf(order: OrderDetail | null): AuditView {
  if (order?.order_status === 9) return 'rejected'
  if (order?.order_status === 2) return 'pending'
  return 'approved'
}

const VIEW_TEXT: Record<AuditView, string> = {
  pending: '待审核',
  approved: '已审核',
  rejected: '审核不通过',
}

function TagList({ values, emptyText = '未提供' }: { values?: string[]; emptyText?: string }) {
  if (!values?.length) return <span className="oa-detail__empty-text">{emptyText}</span>
  return (
    <div className="oa-detail__tags">
      {values.map((value, index) => <Tag key={`${value}-${index}`}>{value}</Tag>)}
    </div>
  )
}

export default function OrderAuditDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { message, modal } = App.useApp()
  const [order, setOrder] = useState<OrderDetail | null>(null)
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [rejectOpen, setRejectOpen] = useState(false)
  const [reasons, setReasons] = useState<string[]>([])
  const [note, setNote] = useState('')
  const isMock = id === 'mock'

  const fetchDetail = useCallback(async () => {
    if (!id) return
    if (isMock) {
      setOrder(mockOrderDetail)
      return
    }
    setLoading(true)
    try {
      setOrder(await orderApi.getOrderDetail(id))
    } catch {
      // 错误提示由拦截器统一处理
    } finally {
      setLoading(false)
    }
  }, [id, isMock])

  useEffect(() => {
    fetchDetail()
  }, [fetchDetail])

  const view = auditViewOf(order)
  const abnormalCount = useMemo(
    () => order?.member_health_record?.filter((item) => item.is_abnormal === 1).length ?? 0,
    [order],
  )
  const address = [order?.address_region, order?.address_detail].filter(Boolean).join(' ')

  const onApprove = () => {
    if (!id) return
    if (isMock) {
      message.info('演示数据仅用于预览，不会提交审核')
      return
    }
    modal.confirm({
      title: '确认审核通过？',
      content: '通过后订单将进入后续服务流程，请确认已核对服务内容及健康信息。',
      okText: '确认通过',
      cancelText: '再检查一下',
      onOk: async () => {
        setSubmitting(true)
        try {
          await orderApi.confirmOrder(id, {})
          message.success('审核通过，订单进入后续服务流程')
          await fetchDetail()
        } finally {
          setSubmitting(false)
        }
      },
    })
  }

  const closeReject = () => {
    setRejectOpen(false)
    setReasons([])
    setNote('')
  }

  const onReject = async () => {
    if (!id) return
    if (reasons.length === 0) {
      message.warning('请至少选择一项不通过原因')
      return
    }
    if (reasons.includes('其他') && !note.trim()) {
      message.warning('选择「其他」时必须填写补充说明')
      return
    }
    if (isMock) {
      message.success('演示审核不通过提交成功，未发起接口请求')
      closeReject()
      return
    }
    setSubmitting(true)
    try {
      await orderApi.rejectOrder(id, {
        reason: reasons.join('；'),
        opinion: note.trim() || undefined,
      })
      message.success('已提交审核不通过')
      closeReject()
      await fetchDetail()
    } catch {
      // 错误提示由拦截器统一处理
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="oa-page oa-detail">
      <PageContainer
        title="订单审核详情"
        description={order ? (
          <span className="oa-detail__description">
            订单号：{order.order_no || '-'} {isMock && <Tag color="blue">模拟数据</Tag>}
          </span>
        ) : '核对订单资料与健康信息'}
        extra={<Button color="primary" variant="outlined" icon={<ArrowLeftOutlined />} onClick={() => navigate('/order-audit')}>返回审核列表</Button>}
      >
        <Spin spinning={loading}>
          {order ? (
            <>
              <section className="oa-card oa-summary">
                <div className="oa-summary__main">
                  <div className="oa-summary__eyebrow">服务订单</div>
                  <div className="oa-summary__title-row">
                    <h3>{textOrDash(order.service_name)}</h3>
                    <span className={`oa-status oa-status--${view}`}>{VIEW_TEXT[view]}</span>
                  </div>
                  <div className="oa-summary__meta">
                    <span>{ORDER_STATUS_MAP[order.order_status] ?? '审核不通过'}</span>
                    <span>订单编号 {order.order_no || '-'}</span>
                  </div>
                </div>
                <div className="oa-summary__amount">
                  <span>订单金额</span>
                  <strong>{order.amount ? `¥ ${order.amount}` : '-'}</strong>
                </div>
              </section>

              <div className="oa-detail__layout">
                <main className="oa-detail__main">
                  <section className="oa-card oa-section">
                    <div className="oa-section__header">
                      <div className="oa-section__heading">
                        <MedicineBoxOutlined />
                        <h3>服务内容</h3>
                      </div>
                      <span className="oa-section__hint">请核对服务项目与耗材</span>
                    </div>
                    <dl className="oa-info-grid">
                      <div className="oa-info-grid__item oa-info-grid__item--wide">
                        <dt>服务项目</dt>
                        <dd>{textOrDash(order.service_name)}</dd>
                      </div>
                      <div className="oa-info-grid__item oa-info-grid__item--wide">
                        <dt>包含服务</dt>
                        <dd><TagList values={order.services} /></dd>
                      </div>
                      <div className="oa-info-grid__item oa-info-grid__item--wide">
                        <dt>服务耗材</dt>
                        <dd><TagList values={order.consumables} emptyText="无耗材信息" /></dd>
                      </div>
                    </dl>
                  </section>

                  <section className="oa-card oa-section">
                    <div className="oa-section__header">
                      <div className="oa-section__heading">
                        <UserOutlined />
                        <h3>服务对象与健康信息</h3>
                      </div>
                      <Button size="small" disabled={!order.member_id} onClick={() => navigate(`/member/${order.member_id}`)}>
                        查看完整健康档案
                      </Button>
                    </div>

                    <div className="oa-member">
                      <div className="oa-member__avatar"><UserOutlined /></div>
                      <div className="oa-member__identity">
                        <strong>{textOrDash(order.member_name)}</strong>
                        <span>{genderText(order.member_gender)}</span>
                        <span>{order.member_age != null ? `${order.member_age} 岁` : '年龄未提供'}</span>
                      </div>
                      <div className="oa-member__diseases">
                        <span>慢性疾病</span>
                        <TagList values={order.member_chronic_disease} emptyText="暂无慢性疾病记录" />
                      </div>
                    </div>

                    <div className="oa-health-head">
                      <div>
                        <strong>近期健康记录</strong>
                        <span>共 {order.member_health_record?.length ?? 0} 条</span>
                      </div>
                      {abnormalCount > 0 && <span className="oa-health-head__warning">发现 {abnormalCount} 项异常，请重点核对</span>}
                    </div>
                    {order.member_health_record?.length ? (
                      <div className="oa-health-grid">
                        {order.member_health_record.map((record, index) => (
                          <div
                            className={`oa-health-card${record.is_abnormal === 1 ? ' oa-health-card--abnormal' : ''}`}
                            key={`${record.metric_id}-${record.record_time}-${index}`}
                          >
                            <div className="oa-health-card__top">
                              <span>{record.metric_name || '健康指标'}</span>
                              {record.is_abnormal === 1
                                ? <Tag color="warning">异常</Tag>
                                : <Tag color="success">正常</Tag>}
                            </div>
                            <div className="oa-health-card__value">
                              {record.metric_value || '-'} <small>{record.unit}</small>
                            </div>
                            <div className="oa-health-card__time"><ClockCircleOutlined />{fmt(record.record_time)}</div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="oa-detail__inline-empty">暂无健康记录，请结合服务对象实际情况谨慎审核</div>
                    )}
                  </section>

                  <section className="oa-card oa-section">
                    <div className="oa-section__header">
                      <div className="oa-section__heading">
                        <FileTextOutlined />
                        <h3>订单备注</h3>
                      </div>
                    </div>
                    <p className="oa-detail__remark">{textOrDash(order.remark) === '-' ? '无订单备注' : order.remark}</p>
                  </section>
                </main>

                <aside className="oa-detail__aside">
                  <section className="oa-card oa-section">
                    <div className="oa-section__heading"><FileTextOutlined /><h3>订单信息</h3></div>
                    <dl className="oa-side-list">
                      <div><dt>订单编号</dt><dd>{order.order_no || '-'}</dd></div>
                      <div><dt>订单状态</dt><dd>{ORDER_STATUS_MAP[order.order_status] ?? '审核不通过'}</dd></div>
                      <div><dt>承接机构</dt><dd>{textOrDash(order.institution_name)}</dd></div>
                      <div><dt>订单金额</dt><dd className="oa-side-list__amount">{order.amount ? `¥ ${order.amount}` : '-'}</dd></div>
                    </dl>
                  </section>

                  <section className="oa-card oa-section">
                    <div className="oa-section__heading"><PhoneOutlined /><h3>联系与服务地址</h3></div>
                    <div className="oa-contact">
                      <div className="oa-contact__person">
                        <strong>{textOrDash(order.contact_name)}</strong>
                        <span>联系人</span>
                      </div>
                      <a href={order.contact_phone ? `tel:${order.contact_phone}` : undefined}>
                        <PhoneOutlined />{textOrDash(order.contact_phone)}
                      </a>
                      <div className="oa-contact__address">
                        <EnvironmentOutlined />
                        <span>{address || '-'}</span>
                      </div>
                    </div>
                  </section>

                  <section className={`oa-card oa-section oa-audit oa-audit--${view}`}>
                    {view === 'pending' ? (
                      <>
                        <div className="oa-section__heading"><CheckCircleFilled /><h3>审核决定</h3></div>
                        <p>请确认服务内容、服务对象健康信息及地址资料无误后提交审核。</p>
                        <div className="oa-audit__notice">审核提交后将进入后续服务流程，请谨慎操作。</div>
                        <div className="oa-audit__actions">
                          <Button danger icon={<CloseOutlined />} onClick={() => setRejectOpen(true)}>审核不通过</Button>
                          <Button type="primary" icon={<CheckOutlined />} loading={submitting} onClick={onApprove}>审核通过</Button>
                        </div>
                      </>
                    ) : (
                      <div className="oa-audit__result">
                        {view === 'rejected' ? <ExclamationCircleFilled /> : <CheckCircleFilled />}
                        <div>
                          <strong>{VIEW_TEXT[view]}</strong>
                          <p>{view === 'rejected' ? '该订单未通过审核，不进入后续服务流程。' : '该订单已完成审核，可返回列表查看其他订单。'}</p>
                        </div>
                      </div>
                    )}
                  </section>
                </aside>
              </div>
            </>
          ) : !loading ? (
            <div className="oa-card"><Empty description="暂未获取到订单详情" /></div>
          ) : <div className="oa-detail__loading" />}
        </Spin>
      </PageContainer>

      <Modal
        open={rejectOpen}
        onCancel={closeReject}
        footer={null}
        width={560}
        title="审核不通过"
        okText="提交不通过"
      >
        <div className="oa-reject">
          <div className="oa-reject__tip">请选择不通过原因（可多选），选择「其他」时必须填写补充说明。</div>
          <Checkbox.Group
            className="oa-reject__reasons"
            value={reasons}
            onChange={(values) => setReasons(values as string[])}
          >
            {REJECT_REASONS.map((reason) => <Checkbox key={reason} value={reason}>{reason}</Checkbox>)}
          </Checkbox.Group>
          <div className="oa-reject__label">补充说明{reasons.includes('其他') && <span>（必填）</span>}</div>
          <Input.TextArea
            rows={4}
            maxLength={300}
            showCount
            placeholder="请填写需要补充或修正的资料，便于申请人重新提交"
            value={note}
            onChange={(event) => setNote(event.target.value)}
          />
          <div className="oa-reject__footer">
            <Button onClick={closeReject}>取消</Button>
            <Button danger type="primary" loading={submitting} onClick={onReject}>提交不通过</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
