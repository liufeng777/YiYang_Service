/**
 * 咨询管理 - 咨询记录列表（设计稿：电话咨询列表.png）
 * 已对接 GET /api/v1/staff/consultations（服务端分页，支持 status / keyword 筛选）
 * 人工回复已对接 PUT /api/v1/staff/consultations/:id
 * 「登记电话咨询」已对接 POST /api/v1/staff/consultations
 */
import { useCallback, useEffect, useState } from 'react'
import { Button, Card, Input, Modal, Select, Table, App } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import PageContainer from '@/components/PageContainer'
import { consultApi } from '@/api'
import type { ConsultationItem } from '@/api/modules/consult'
import { formatDateTime } from '@/utils'
import ConsultationRegister from './register'
import './index.less'

const STATUS_MAP: Record<number, string> = { 1: '待回复', 2: '已回复' }
/** 咨询类型（服务端字典待确认，先按常见值展示） */
const TYPE_MAP: Record<number, string> = { 1: 'AI 健康管家', 2: '人工客服', 3: '电话咨询' }

export default function ConsultationList() {
  const { message } = App.useApp()
  const [registerOpen, setRegisterOpen] = useState(false)
  const [status, setStatus] = useState<number>()
  const [appliedStatus, setAppliedStatus] = useState<number>()
  const [list, setList] = useState<ConsultationItem[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [keyword, setKeyword] = useState('')
  const [appliedKeyword, setAppliedKeyword] = useState('')
  const [replyTarget, setReplyTarget] = useState<ConsultationItem | null>(null)
  const [answer, setAnswer] = useState('')
  const [replying, setReplying] = useState(false)

  const fetchList = useCallback(async () => {
    setLoading(true)
    try {
      const res = await consultApi.getConsultations({
        page,
        page_size: pageSize,
        status: appliedStatus,
        keyword: appliedKeyword || undefined,
      })
      setList(res.list)
      setTotal(res.total)
    } catch {
      // 错误提示由拦截器统一处理
    } finally {
      setLoading(false)
    }
  }, [page, pageSize, appliedStatus, appliedKeyword])

  useEffect(() => {
    fetchList()
  }, [fetchList])

  const onReply = async () => {
    if (!replyTarget || !answer.trim()) {
      message.warning('请输入回复内容')
      return
    }
    setReplying(true)
    try {
      await consultApi.updateConsultation(replyTarget.id, { answer: answer.trim(), status: 2 })
      message.success('回复成功')
      setReplyTarget(null)
      setAnswer('')
      fetchList()
    } catch {
      // 错误提示由拦截器统一处理
    } finally {
      setReplying(false)
    }
  }

  const columns = [
    {
      title: '咨询人',
      key: 'member_name',
      dataIndex: 'member_name',
      render: (v) => v || '-'
    },
    {
      title: '联系人',
      key: 'contact',
      render: (_: unknown, row: ConsultationItem) => (
        <div className='table-cell'>
          <strong>{row.contact_name || '-'}</strong>
          <span>{row.contact_phone || ''}</span>
        </div>
      ),
    },
    {
      title: '咨询类型',
      dataIndex: 'consultation_type',
      key: 'consultation_type',
      width: 120,
      render: (v: number) => TYPE_MAP[v] ?? `-`,
    },
    { title: '咨询内容', dataIndex: 'question', key: 'question', ellipsis: true },
    {
      title: '咨询时间',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 150,
      render: (v: number) => (v ? formatDateTime(v * 1000) : '-'),
    },
    {
      title: '回复内容',
      key: 'answer',
      ellipsis: true,
      render: (_: unknown, row: ConsultationItem) =>
        row.answer ? (
          <span>
            {row.answer}
            {row.responder_name ? <span className="cs-row__sub">（{row.responder_name}）</span> : null}
          </span>
        ) : (
          <span className="cs-row__sub">-</span>
        ),
    },
    {
      title: '状态',
      key: 'status',
      width: 100,
      render: (_: unknown, row: ConsultationItem) => (
        <span className={row.status === 1 ? 'status-tag status-tag--orange' : 'status-tag status-tag--green'}>
          {STATUS_MAP[row.status] ?? '-'}
        </span>
      ),
    },
    {
      title: '满意度',
      width: 100,
      key: 'satisfaction_score',
      dataIndex: 'satisfaction_score',
      render: (v: number, row: ConsultationItem) => (
        row.status === 1 ? '-' : `${v}分`
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 100,
      render: (_: unknown, row: ConsultationItem) =>
        row.status === 1 ? (
          <Button
            size="small"
            onClick={() => {
              setReplyTarget(row)
              setAnswer('')
            }}
          >
            回复
          </Button>
        ) : (
          <Button size="small" disabled>
            回复
          </Button>
        ),
    },
  ]

  return (
    <div className="cs-page">
      <PageContainer
        title="咨询管理"
        description="统一记录由机构接听并登记的电话咨询"
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setRegisterOpen(true)}
          >
            登记电话咨询
          </Button>
        }
      >
        {/* 电话来源提示 */}
        {/* <div className="cs-banner">
          <div className="cs-banner__title">电话来源</div>
          <div>
            护理院/驿站介绍页展示机构电话；AI健康管家无法回答时展示对应机构电话。用户拨打后，由接听机构登记咨询。
          </div>
        </div> */}

        {/* 筛选 */}
        <Card variant="borderless" className="filter-bar">
          <Input
            placeholder="姓名 / 手机号 / 咨询内容"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value.trim())}
            allowClear
          />
          <Select
            placeholder="全部状态"
            value={status}
            onChange={setStatus}
            options={Object.entries(STATUS_MAP).map(([value, label]) => ({
              value: Number(value),
              label,
            }))}
            allowClear
          />
          <Button
            onClick={() => {
              setStatus(undefined)
              setAppliedStatus(undefined)
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
              setAppliedStatus(status)
              setAppliedKeyword(keyword)
              setPage(1)
            }}
          >
            查询
          </Button>
        </Card>

        {/* 咨询表格 */}
        <Card variant="borderless" className="list-card table-fill">
          <Table<ConsultationItem>
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

      <Modal
        title="人工回复"
        open={!!replyTarget}
        onOk={onReply}
        onCancel={() => setReplyTarget(null)}
        confirmLoading={replying}
        okText="提交回复"
        cancelText="取消"
      >
        <div style={{ marginBottom: 12 }}>
          <strong>咨询内容：</strong>
          {replyTarget?.question}
        </div>
        <Input.TextArea
          rows={4}
          placeholder="请输入回复内容"
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
        />
      </Modal>

      <ConsultationRegister
        open={registerOpen}
        onClose={() => setRegisterOpen(false)}
        onSuccess={() => {
          setRegisterOpen(false)
          fetchList()
        }}
      />
    </div>
  )
}
