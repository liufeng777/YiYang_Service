/**
 * 健康档案详情 - 「健康力测评」Tab（设计稿：W-HEALTH-P1-07）
 * 最近一次测评卡 + 历次测评记录表；数据来自 assess 模块 mock
 */
import { Button, Table } from 'antd'
import { ArrowRightOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import {
  RISK_LEVEL,
  mockDimensions,
  mockProfileAssessTab,
} from '@/pages/assess/mock'
import './index.less'

/** 风险等级 → 健康档案模块 hr-tag 类名 */
const HR_RISK_CLS = {
  good: 'hr-tag--risk-low',
  attention: 'hr-tag--risk-mid',
  high: 'hr-tag--risk-high',
  insufficient: 'hr-tag--disease',
} as const

interface HistoryRow {
  id: string
  date: string
  type: string
  source: string
  risk: keyof typeof RISK_LEVEL
  riskText: string
  confirm: string
}

export function AssessTab() {
  const navigate = useNavigate()
  const t = mockProfileAssessTab

  const columns = [
    { title: '评测日期', dataIndex: 'date', key: 'date' },
    { title: '评测类型', dataIndex: 'type', key: 'type' },
    { title: '评测来源', dataIndex: 'source', key: 'source' },
    {
      title: '综合风险',
      key: 'risk',
      render: (_: unknown, row: HistoryRow) => (
        <span className={`hr-tag ${HR_RISK_CLS[row.risk]}`}>{row.riskText}</span>
      ),
    },
    { title: '专业确认', dataIndex: 'confirm', key: 'confirm' },
    {
      title: '操作',
      key: 'action',
      width: 100,
      render: (_: unknown, row: HistoryRow) => (
        <Button type="link" size="small" onClick={() => navigate(`/assessment/${row.id}`)}>
          查看详情
        </Button>
      ),
    },
  ]

  return (
    <div>
      <div className="hr-disease__header">
        <div>
          <div className="hr-disease__title">健康力测评</div>
          <div className="hr-disease__desc">
            已完成评测统一归档到健康档案；AI 分析结果以专业人员确认为准
          </div>
        </div>
        <Button type="primary" onClick={() => navigate('/assessment/create')}>
          发起健康力测评
        </Button>
      </div>

      {/* 最近一次健康力测评 */}
      <div className="hr-card">
        <div className="hr-card__header">
          <span className="hr-card__title">最近一次健康力测评</span>
          <span className="hr-tag hr-tag--risk-low">{t.latest.tag}</span>
        </div>
        <div className="hr-basic__hint">{t.latest.meta}</div>
        <div className="hr-metrics">
          {mockDimensions.map((d) => (
            <div key={d.key} className="hr-metric-card hr-metric-card--plain">
              <div className="hr-metric-card__name">{d.name}</div>
              <div className="hr-metric-card__value">
                <span className={`hr-tag ${HR_RISK_CLS[d.level]}`}>{RISK_LEVEL[d.level].text}</span>
              </div>
            </div>
          ))}
        </div>
        <Button
          type="primary"
          ghost
          className="hr-progress__cta"
          onClick={() => navigate('/assessment/A20260819001')}
        >
          查看测评详情 <ArrowRightOutlined />
        </Button>
      </div>

      {/* 历次测评记录 */}
      <div className="hr-card">
        <div className="hr-card__header">
          <span className="hr-card__title">历次测评记录</span>
        </div>
        <Table<HistoryRow> rowKey="id" columns={columns} dataSource={t.history} pagination={false} />
      </div>

      <div className="hr-footnote hr-footnote--green">
        已完成评测统一归档到健康档案，评测原始答案与AI分析留痕可在测评详情查看；不同量表得分不合并为单一总分。
      </div>
    </div>
  )
}
