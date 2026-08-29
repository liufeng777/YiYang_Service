/**
 * 咨询管理 - 电话咨询列表（设计稿：电话咨询列表.png）
 * 统一记录由机构接听并登记的电话咨询
 * TODO: 接入后端后替换为 consultApi.getConsultations（API §10.4）
 */
import { useMemo, useState } from 'react'
import { Button, Card, DatePicker, Input, Select, Table } from 'antd'
import { PlusOutlined, SearchOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import PageContainer from '@/components/PageContainer'
import {
  CONSULT_LEAD_TEXT,
  mockConsultList,
  mockConsultStats,
  type MockConsultRow,
} from './mock'
import './index.less'

interface Filters {
  keyword: string
  type?: string
  date?: string
}

export default function ConsultationList() {
  const navigate = useNavigate()
  const [filters, setFilters] = useState<Filters>({ keyword: '' })
  const [applied, setApplied] = useState<Filters>({ keyword: '' })

  const applyFilters = () => setApplied(filters)

  const resetFilters = () => {
    const init: Filters = { keyword: '' }
    setFilters(init)
    setApplied(init)
  }

  const filtered = useMemo(
    () =>
      mockConsultList.filter(
        (row) =>
          !applied.keyword ||
          [row.caller, row.target, row.content].some((v) => v.includes(applied.keyword)),
      ),
    [applied],
  )

  const stats = [
    { label: '今日来电', value: mockConsultStats.today, note: mockConsultStats.todayNote },
    { label: '需继续跟进', value: mockConsultStats.followup, note: mockConsultStats.followupNote },
    { label: '已关联档案', value: mockConsultStats.linkedProfile, note: mockConsultStats.linkedProfileNote },
    { label: '重复线索合并', value: mockConsultStats.merged, note: mockConsultStats.mergedNote },
  ]

  const renderAction = (row: MockConsultRow) => {
    if (row.leadResult === 'linked') {
      return (
        <Button type="link" size="small" onClick={() => navigate('/leads')}>
          查看线索
        </Button>
      )
    }
    if (row.leadResult === 'none') {
      return (
        <Button type="link" size="small" onClick={() => navigate('/health-record')}>
          查看档案
        </Button>
      )
    }
    return (
      <Button type="link" size="small" onClick={() => navigate('/leads')}>
        查看
      </Button>
    )
  }

  const columns = [
    { title: '来电时间', dataIndex: 'time', key: 'time', width: 110 },
    {
      title: '来电人 / 实际服务对象',
      key: 'caller',
      render: (_: unknown, row: MockConsultRow) => (
        <span className="cs-row__name">
          {row.caller} <span className="cs-row__sub">/ {row.target}</span>
        </span>
      ),
    },
    { title: '咨询来源', dataIndex: 'source', key: 'source' },
    { title: '咨询内容', dataIndex: 'content', key: 'content' },
    { title: '身份校验', dataIndex: 'identity', key: 'identity' },
    {
      title: '线索结果',
      key: 'leadResult',
      render: (_: unknown, row: MockConsultRow) => (
        <span className={row.leadResult === 'none' ? undefined : 'cs-text--warn'}>
          {CONSULT_LEAD_TEXT[row.leadResult]}
        </span>
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 100,
      render: (_: unknown, row: MockConsultRow) => renderAction(row),
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
            onClick={() => navigate('/consultation/register')}
          >
            登记电话咨询
          </Button>
        }
      >
        {/* 电话来源提示 */}
        <div className="cs-banner">
          <div className="cs-banner__title">电话来源</div>
          <div>
            护理院/驿站介绍页展示机构电话；AI健康管家无法回答时展示对应机构电话。用户拨打后，由接听机构登记咨询。
          </div>
        </div>

        {/* 统计卡 */}
        <div className="cs-stats">
          {stats.map((s) => (
            <div key={s.label} className="cs-stat">
              <div className="cs-stat__label">{s.label}</div>
              <div className="cs-stat__body">
                <span className="cs-stat__value">{s.value}</span>
                <span className="cs-stat__note">{s.note}</span>
              </div>
            </div>
          ))}
        </div>

        {/* 筛选 */}
        <Card variant="borderless" className="filter-bar">
          <Input
            prefix={<SearchOutlined />}
            placeholder="姓名 / 手机号"
            value={filters.keyword}
            onChange={(e) => setFilters((f) => ({ ...f, keyword: e.target.value.trim() }))}
            allowClear
          />
          <Select
            placeholder="咨询机构：全部"
            options={[{ value: 'current', label: '咨询机构：当前机构' }]}
            defaultValue="current"
          />
          <Select
            placeholder="咨询类型：全部"
            value={filters.type}
            onChange={(v) => setFilters((f) => ({ ...f, type: v }))}
            options={['护理院介绍页', '驿站介绍页', 'AI健康管家', '机构电话'].map((v) => ({
              value: v,
              label: `咨询类型：${v}`,
            }))}
            allowClear
          />
          <DatePicker
            placeholder="登记日期"
            onChange={(_, ds) =>
              setFilters((f) => ({ ...f, date: typeof ds === 'string' ? ds : undefined }))
            }
          />
          <Button type="primary" onClick={applyFilters}>查询</Button>
          <Button onClick={resetFilters}>重置</Button>
        </Card>

        {/* 咨询表格 */}
        <Card variant="borderless" className="list-card">
          <Table<MockConsultRow>
            rowKey="id"
            columns={columns}
            dataSource={filtered}
            pagination={false}
          />
        </Card>
      </PageContainer>
    </div>
  )
}
