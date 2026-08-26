/**
 * 团队管理 - 待分配患者（设计稿：待分配患者.png）
 * 处理自动建档、批量导入或线索转化后尚未归属管理团队的服务对象
 * TODO: 患者分配接口 API v0.1 未定义，待后端补充
 */
import { useMemo, useState } from 'react'
import { Button, Input, Select, Table, message } from 'antd'
import { useNavigate } from 'react-router-dom'
import PageContainer from '@/components/PageContainer'
import {
  mockUnassignedList,
  mockUnassignedNote,
  mockUnassignedStats,
  type MockUnassignedRow,
} from './mock'
import './index.less'

interface Filters {
  keyword: string
  source?: string
  risk?: string
  dateRange?: string
}

const SOURCE_OPTIONS = ['C端医护服务', '活动线索转化', '机构批量导入', '电话咨询转化']
const RISK_OPTIONS = ['红色', '橙色', '绿色']
const DATE_OPTIONS = ['最近30天', '最近7天', '今日']

export default function TeamUnassigned() {
  const navigate = useNavigate()
  const [filters, setFilters] = useState<Filters>({ keyword: '' })
  const [selected, setSelected] = useState<string[]>([])

  const filtered = useMemo(
    () =>
      mockUnassignedList.filter((row) => {
        if (
          filters.keyword &&
          ![row.name, row.memberId].some((v) => v.includes(filters.keyword))
        )
          return false
        if (filters.source && row.source !== filters.source) return false
        if (filters.risk && row.risk !== filters.risk) return false
        return true
      }),
    [filters],
  )

  const stats = [
    { label: '待分配患者', value: mockUnassignedStats.total, note: '' },
    { label: '今日新增', value: mockUnassignedStats.today, note: '' },
    { label: '高风险待分配', value: mockUnassignedStats.highRisk, note: '', valueTone: 'orange' },
  ]

  const columns = [
    {
      title: '服务对象',
      key: 'name',
      render: (_: unknown, row: MockUnassignedRow) => (
        <span>
          <span className="team-row__name">{row.name}</span>{' '}
          <span className="team-row__sub">{row.memberId}</span>
        </span>
      ),
    },
    { title: '来源', dataIndex: 'source', key: 'source' },
    { title: '档案状态', dataIndex: 'archiveStatus', key: 'archiveStatus' },
    {
      title: '风险/专病',
      key: 'risk',
      render: (_: unknown, row: MockUnassignedRow) => (
        <span className={`team-text--${row.riskTone}`}>
          {row.risk}｜{row.disease}
        </span>
      ),
    },
    { title: '建档时间', dataIndex: 'archivedAt', key: 'archivedAt' },
    { title: '建议团队', dataIndex: 'suggestTeam', key: 'suggestTeam' },
    {
      title: '操作',
      key: 'action',
      width: 80,
      render: (_: unknown, row: MockUnassignedRow) => (
        <span className="team-text--link" onClick={() => navigate(`/team/assign?ids=${row.id}`)}>
          分配
        </span>
      ),
    },
  ]

  return (
    <div className="team-page">
      <PageContainer
        title="待分配患者"
        description="处理自动建档、批量导入或线索转化后尚未归属管理团队的服务对象"
        extra={
          <Button
            type="primary"
            onClick={() => {
              if (selected.length === 0) {
                message.warning('请先勾选需要分配的服务对象')
                return
              }
              navigate(`/team/assign?ids=${selected.join(',')}`)
            }}
          >
            批量分配团队
          </Button>
        }
      >
        {/* 统计卡 */}
        <div className="team-stats team-stats--3">
          {stats.map((s) => (
            <div key={s.label} className="team-stat">
              <div className="team-stat__label">{s.label}</div>
              <div className="team-stat__body">
                <span
                  className={`team-stat__value${s.valueTone ? ` team-stat__value--${s.valueTone}` : ''}`}
                >
                  {s.value}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* 筛选 */}
        <div className="team-filters team-filters--inline">
          <Input
            placeholder="姓名 / 手机号 / 会员ID"
            value={filters.keyword}
            onChange={(e) => setFilters((f) => ({ ...f, keyword: e.target.value.trim() }))}
            allowClear
            style={{ maxWidth: 220 }}
          />
          <Select
            placeholder="来源：全部"
            value={filters.source}
            onChange={(v) => setFilters((f) => ({ ...f, source: v }))}
            options={SOURCE_OPTIONS.map((v) => ({ value: v, label: `来源：${v}` }))}
            allowClear
            style={{ minWidth: 160 }}
          />
          <Select
            placeholder="风险等级：全部"
            value={filters.risk}
            onChange={(v) => setFilters((f) => ({ ...f, risk: v }))}
            options={RISK_OPTIONS.map((v) => ({ value: v, label: `风险等级：${v}` }))}
            allowClear
            style={{ minWidth: 160 }}
          />
          <Select
            placeholder="建档日期：最近30天"
            value={filters.dateRange}
            onChange={(v) => setFilters((f) => ({ ...f, dateRange: v }))}
            options={DATE_OPTIONS.map((v) => ({ value: v, label: `建档日期：${v}` }))}
            allowClear
            style={{ minWidth: 170 }}
          />
          <Button type="primary">查询</Button>
        </div>

        {/* 患者表格 */}
        <div className="team-list">
          <Table<MockUnassignedRow>
            rowKey="id"
            columns={columns}
            dataSource={filtered}
            pagination={false}
            rowSelection={{
              selectedRowKeys: selected,
              onChange: (keys) => setSelected(keys as string[]),
            }}
          />
        </div>

        <div className="team-note team-note--green">{mockUnassignedNote}</div>
      </PageContainer>
    </div>
  )
}
