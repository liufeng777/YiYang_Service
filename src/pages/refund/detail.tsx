/** 退款详情与业务审批：通过、驳回均复用既有退款审批接口。 */
import { useCallback, useEffect, useState } from 'react'
import { Alert, App, Button, Card, Descriptions, Empty, Image, Input, Modal, Space, Spin, Timeline } from 'antd'
import { ArrowLeftOutlined } from '@ant-design/icons'
import { useNavigate, useParams } from 'react-router-dom'
import { refundApi } from '@/api'
import type { RefundDetail, RefundLog } from '@/api/modules/refund'
import PageContainer from '@/components/PageContainer'
import SensitiveText from '@/components/SensitiveText'
import StatusTag from '@/components/StatusTag'
import { useUserStore } from '@/store/modules/user'
import { formatAmount, formatDateTime } from '@/utils'
import { canApproveRefund, getApprovalStageText, getRefundApprovalStage } from './shared'
import './index.less'

const EMPTY_PERMISSIONS: string[] = []
const STATUS_COLORS: Record<number, string> = { 1: 'orange', 2: 'orange', 3: 'red', 4: 'teal' }
const APPROVER_TYPE_MAP: Record<string, string> = { staff: '业务审批', finance: '财务审批' }
const ACTION_MAP: Record<string, string> = { approve: '审批通过', reject: '审批驳回' }

export default function RefundDetailPage() {
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const { message } = App.useApp()
  const permissions = useUserStore((state) => state.userInfo?.permissions ?? EMPTY_PERMISSIONS)
  const [refund, setRefund] = useState<RefundDetail | null>(null)
  const [logs, setLogs] = useState<RefundLog[]>([])
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [approve, setApprove] = useState<boolean | null>(null)
  const [opinion, setOpinion] = useState('')

  const load = useCallback(async () => {
    if (!id) return
    setLoading(true)
    try {
      const [detail, logResult] = await Promise.all([
        refundApi.getRefundDetail(id),
        refundApi.getRefundLogs(id),
      ])
      setRefund(detail)
      setLogs(logResult ?? [])
    } catch {
      /* 拦截器已提示 */
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    load()
  }, [load])

  const closeApproval = () => {
    setApprove(null)
    setOpinion('')
  }

  const submitApproval = async () => {
    if (approve === null || !id) return
    setSubmitting(true)
    try {
      await refundApi.approveRefund(id, { approve, opinion: opinion.trim() || undefined })
      message.success(approve ? '业务审批已通过' : '退款申请已驳回')
      closeApproval()
      await load()
    } catch {
      /* 拦截器已提示 */
    } finally {
      setSubmitting(false)
    }
  }

  const status = refund?.status

  return (
    <PageContainer
      title="退款详情"
      description="核对退款申请信息并提交业务审批结果"
      extra={<Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/refund')}>返回退款列表</Button>}
    >
      <Spin spinning={loading}>
        {refund ? (
          <Space direction="vertical" size="middle" className="rf-detail">
            <Card variant="borderless" title="退款信息">
              <Descriptions column={2} size="small">
                <Descriptions.Item label="退款单号">{refund.id}</Descriptions.Item>
                <Descriptions.Item label="订单编号">{refund.order_no || '-'}</Descriptions.Item>
                <Descriptions.Item label="申请会员"><SensitiveText type="name" value={refund.member_name} /></Descriptions.Item>
                <Descriptions.Item label="退款金额">{formatAmount(refund.amount)}</Descriptions.Item>
                <Descriptions.Item label="退款状态">
                  <StatusTag color={status != null ? STATUS_COLORS[status] : 'default'}>
                    {status != null ? refundApi.REFUND_STATUS_MAP[status] ?? `状态 ${status}` : '-'}
                  </StatusTag>
                </Descriptions.Item>
                <Descriptions.Item label="申请时间">{formatDateTime((refund.apply_time ?? refund.created_at) ? (refund.apply_time ?? refund.created_at)! * 1000 : undefined)}</Descriptions.Item>
                <Descriptions.Item label="退款原因" span={2}>{refund.reason || '-'}</Descriptions.Item>
                <Descriptions.Item label="审批意见" span={2}>{refund.opinion || '-'}</Descriptions.Item>
              </Descriptions>
              {!!refund.images?.length && (
                <Image.PreviewGroup>
                  <Space wrap className="rf-detail__images">
                    {refund.images.map((image, index) => <Image key={`${image}-${index}`} src={image} />)}
                  </Space>
                </Image.PreviewGroup>
              )}
            </Card>

            <Card variant="borderless" title="业务审批">
              {status === 1 && canApprove ? (
                <Space>
                  <Button danger onClick={() => setApprove(false)}>审批驳回</Button>
                  <Button type="primary" onClick={() => setApprove(true)}>审批通过</Button>
                </Space>
              ) : status === 1 ? (
                <Alert type="info" showIcon title="当前账号无退款业务审批权限" description="仅具备业务审批权限的角色或机构管理员可以处理该退款。" />
              ) : (
                <span>当前退款无需业务审批。</span>
              )}
            </Card>

            <Card variant="borderless" title="审批记录">
              {logs.length ? (
                <Timeline
                  items={logs.map((log) => ({
                    key: log.id,
                    children: (
                      <div>
                        <strong>{ACTION_MAP[log.action ?? ''] ?? log.action ?? '审批操作'}</strong>
                        <div>{APPROVER_TYPE_MAP[log.approver_type ?? ''] ?? log.approver_type ?? '-'} · {log.approver_name || '-'}</div>
                        <div>{log.opinion || '未填写审批意见'}</div>
                        <div>{formatDateTime(log.created_at ? log.created_at * 1000 : undefined)}</div>
                      </div>
                    ),
                  }))}
                />
              ) : <Empty description="暂无审批记录" />}
            </Card>
          </Space>
        ) : !loading ? <Card variant="borderless"><Empty description="未找到退款信息" /></Card> : null}
      </Spin>

      <Modal
        open={approve !== null}
        title={approve ? '确认业务审批通过？' : '确认驳回退款申请？'}
        okText={approve ? '确认通过' : '确认驳回'}
        cancelText="取消"
        okButtonProps={{ danger: approve === false, loading: submitting }}
        cancelButtonProps={{ disabled: submitting }}
        onOk={submitApproval}
        onCancel={closeApproval}
        maskClosable={!submitting}
      >
        <Input.TextArea
          rows={4}
          maxLength={300}
          showCount
          value={opinion}
          onChange={(event) => setOpinion(event.target.value)}
          placeholder="请填写审批意见（选填）"
        />
      </Modal>
    </PageContainer>
  )
}
