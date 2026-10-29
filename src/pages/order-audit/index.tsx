/**
 * 订单审核 - 审核列表（设计稿：17.订单审核）
 * 已对接 GET /api/v1/staff/orders/pending-confirm（待确认/待审核订单队列，支持 keyword 筛选）
 * 操作「去审核」进入 /order-audit/:id 审核详情
 */
import { useCallback, useEffect, useState } from 'react'
import { Button, Card, Input, Table } from 'antd'
import { useNavigate } from 'react-router-dom'
import PageContainer from '@/components/PageContainer'
import { orderApi } from '@/api'
import { ORDER_STATUS_MAP, type OrderItem } from '@/api/modules/order'
import { formatDateTime } from '@/utils'
import './index.less'

/** 审核状态标签配色（oa-tag--*） */
const STATUS_TONE: Record<number, string> = {
  1: 'orange',
  2: 'orange',
  3: 'blue',
  4: 'green',
  5: 'gray',
  6: 'blue',
  7: 'purple',
  8: 'red',
}

export default function OrderAuditList() {
  const navigate = useNavigate()
  const [keyword, setKeyword] = useState('')
  const [appliedKeyword, setAppliedKeyword] = useState('')
  const [list, setList] = useState<OrderItem[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  const fetchList = useCallback(async () => {
    setLoading(true)
    try {
      const res = await orderApi.getPendingConfirmOrders({
        page,
        page_size: pageSize,
        keyword: appliedKeyword || undefined,
      })
      setList(res.list)
      setTotal(res.total)
    } catch {
      // 错误提示由拦截器统一处理
    } finally {
      setLoading(false)
    }
  }, [page, pageSize, appliedKeyword])

  useEffect(() => {
    fetchList()
  }, [fetchList])

  const columns = [
    {
      title: '订单号',
      key: 'order_no',
      render: (_: unknown, row: OrderItem) => (
        <div className="table-cell">
          <strong>{row.order_no || '-'}</strong>
          <span>{row.created_at ? formatDateTime(row.created_at * 1000) : '-'}</span>
        </div>
      ),
    },
    {
      title: '服务对象',
      key: 'member_name',
      dataIndex: 'member_name'
      
    },
    { 
      title: '服务项目',
      dataIndex: 'service_name',
      key: 'service_name',
      render: (_: unknown, row: OrderItem) => (
        <div className="table-cell">
          <strong>
            {row.service_name || '-'}
            {row.service_count && ` (${row.service_count}次)`}
          </strong>
          {row.remark && <span>{row.remark}</span>}
        </div>
      ),
    },
    {
      title: '订单金额',
      key: 'amount',
      render: (_: unknown, row: OrderItem) => (
        <div className="table-cell">
          <strong>{row.amount != null ? `¥${row.amount}` : '-'}</strong>
          <span>{row.paid_at ? formatDateTime(row.paid_at * 1000) : '-'}</span>
        </div>
      ),
    },
    {
      title: '状态',
      key: 'status',
      render: (_: unknown, row: OrderItem) => (
        <span className={`status-tag status-tag--${STATUS_TONE[row.status ?? 0] ?? 'blue'}`}>
          {ORDER_STATUS_MAP[row.status ?? 0] ?? '待审核'}
        </span>
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 120,
      render: (_: unknown, row: OrderItem) => (
        <Button size="small" onClick={() => navigate(`/order-audit/${row.id}`)}>
          去审核
        </Button>
      ),
    },
  ]

  return (
    <div className="oa-page">
      <PageContainer
        title="订单审核"
        description="核对服务适用性、相关禁忌与申请资料，完成订单审核"
        extra={<Button onClick={() => navigate('/order-audit/mock')}>预览模拟订单</Button>}
      >
        {/* 筛选 */}
        <Card variant="borderless" className="filter-bar">
          <Input
            placeholder="订单号 / 姓名 / 手机号"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value.trim())}
            allowClear
          />
          <Button
            onClick={() => {
              setKeyword('')
              setAppliedKeyword('')
              setPage(1)
            }}
          >
            重置
          </Button>
          <Button
            type="primary"
            onClick={() => {
              setAppliedKeyword(keyword)
              setPage(1)
            }}
          >
            查询
          </Button>
        </Card>

        {/* 审核列表 */}
        <Card variant="borderless" className="list-card table-fill">
          <Table<OrderItem>
            rowKey="id"
            columns={columns}
            dataSource={list}
            loading={loading}
            pagination={{
              current: page,
              pageSize,
              total,
              onChange: (nextPage, nextPageSize) => {
                setPage(nextPage)
                setPageSize(nextPageSize)
              },
              showSizeChanger: true,
              showTotal: (total) => `共 ${total} 条`,
            }}
          />
        </Card>
      </PageContainer>
    </div>
  )
}
