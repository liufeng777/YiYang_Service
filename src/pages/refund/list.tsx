/** 退款申请列表：业务审批员处理待业务审批退款。 */
import { useCallback, useEffect, useState } from 'react'
import { Button, Card, Select, Table } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { useNavigate } from 'react-router-dom'
import { refundApi } from '@/api'
import type { RefundItem } from '@/api/modules/refund'
import PageContainer from '@/components/PageContainer'
import SensitiveText from '@/components/SensitiveText'
import StatusTag from '@/components/StatusTag'
import { useUserStore } from '@/store/modules/user'
import { formatAmount, formatDateTime } from '@/utils'
import { canApproveRefund, getApprovalStageText, getRefundApprovalStage } from './shared'

const EMPTY_PERMISSIONS: string[] = []
const STATUS_COLORS: Record<number, string> = { 1: 'orange', 2: 'orange', 3: 'red', 4: 'teal' }

export default function RefundList() {
  const navigate = useNavigate()
  const permissions = useUserStore((state) => state.userInfo?.permissions ?? EMPTY_PERMISSIONS)
  const [list, setList] = useState<RefundItem[]>([])
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [total, setTotal] = useState(0)
  const [status, setStatus] = useState<number>()

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await refundApi.getRefunds({ page, page_size: pageSize, status })
      setList(res.list ?? [])
      setTotal(res.total ?? 0)
    } catch {
      /* 拦截器已提示 */
    } finally {
      setLoading(false)
    }
  }, [page, pageSize, status])

  useEffect(() => {
    load()
  }, [load])

  const columns: ColumnsType<RefundItem> = [
    { title: '退款单号', dataIndex: 'id', key: 'id', width: 100 },
    { title: '订单编号', dataIndex: 'order_no', key: 'order_no', width: 180, render: (value?: string) => value || '-' },
    {
      title: '申请会员',
      dataIndex: 'member_name',
      key: 'member_name',
      width: 130,
      render: (value?: string) => <SensitiveText allowReveal={false} type="name" value={value} />,
    },
    { title: '退款金额', dataIndex: 'amount', key: 'amount', width: 120, render: (value?: number) => formatAmount(value) },
    { title: '退款原因', dataIndex: 'reason', key: 'reason', render: (value?: string) => value || '-' },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (value?: number) => (
        <StatusTag color={value != null ? STATUS_COLORS[value] : 'default'}>
          {value != null ? refundApi.REFUND_STATUS_MAP[value] ?? `状态 ${value}` : '-'}
        </StatusTag>
      ),
    },
    {
      title: '申请时间',
      dataIndex: 'apply_time',
      key: 'apply_time',
      width: 160,
      render: (value: number | undefined, row) => formatDateTime((value ?? row.created_at) ? (value ?? row.created_at)! * 1000 : undefined),
    },
    {
      title: '操作',
      key: 'action',
      width: 110,
      fixed: 'right',
      render: (_, row) => {
        const stage = getRefundApprovalStage(row.status)
        const allowed = canApproveRefund(stage, permissions)
        return (
          <Button size="small" type={allowed ? 'primary' : 'default'} onClick={() => navigate(`/refund/${row.id}`)}>
            {allowed ? `去${getApprovalStageText(stage)}` : '查看详情'}
          </Button>
        )
      },
    },
  ]

  return (
    <PageContainer title="退款审批" description="按 payment 权限处理一级业务审批与二级财务审批">
      <Card variant="borderless" className="filter-bar">
        <Select
          allowClear
          placeholder="退款状态：全部"
          value={status}
          onChange={(value) => {
            setStatus(value)
            setPage(1)
          }}
          options={Object.entries(refundApi.REFUND_STATUS_MAP).map(([value, label]) => ({ value: Number(value), label }))}
        />
      </Card>
      <Card variant="borderless" className="list-card table-fill">
        <Table<RefundItem>
          rowKey="id"
          columns={columns}
          dataSource={list}
          loading={loading}
          size="small"
          scroll={{ x: 1130 }}
          pagination={{
            current: page,
            pageSize,
            total,
            showSizeChanger: true,
            showTotal: (value) => `共 ${value} 条`,
            onChange: (nextPage, nextPageSize) => {
              setPage(nextPage)
              setPageSize(nextPageSize)
            },
          }}
        />
      </Card>
    </PageContainer>
  )
}
