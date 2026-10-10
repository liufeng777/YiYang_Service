/**
 * 健康档案 - 档案详情（设计稿：健康概览.png / 专病档案Tab.png / 3.健康档案详情/）
 * 会员头卡 + 8 个 Tab：健康概览 / 基础信息 / 健康史 / 专病档案 / 健康指标 / 检查检验 / 健康记录 / 用药记录
 * 数据当前为 mock（见 ./mock.ts）；接入后端后替换为 memberApi.getHealthProfile
 */
import { useMemo, useState } from 'react'
import { Avatar, Button, Table, Tabs } from 'antd'
import { ArrowRightOutlined, PlusOutlined } from '@ant-design/icons'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import PageContainer from '@/components/PageContainer'
import {
  mockMedications,
  mockMedicationSummary,
  mockProfile,
  type MedicationItem,
} from './mock'
import { BasicInfoTab, ExamTab, HistoryTab, MetricsTab, RecordsTab } from './profile-tabs'
import { AssessTab } from './assess-tab'
import './index.less'

const RISK_TEXT = { high: '高风险', mid: '中风险', low: '低风险' } as const

const TAB_ITEMS = [
  '健康概览',
  '基础信息',
  '健康史',
  '专病档案',
  '健康指标',
  '检查检验',
  '健康记录',
  '用药记录',
  '健康力测评',
]

/** 健康概览 Tab */
function OverviewTab() {
  const { id } = useParams()
  const navigate = useNavigate()
  const p = mockProfile
  const ov = p.overview
  return (
    <div className="hr-profile__panels">
      <div className="hr-profile__main">
        {/* 健康概况 */}
        <div className="hr-card">
          <div className="hr-card__header">
            <span className="hr-card__title">健康概况</span>
            <span className="hr-tag hr-tag--risk-low">档案完整度 {ov.completeness}%</span>
          </div>
          <div className="hr-overview-grid">
            <div className="hr-overview-item">
              <div className="hr-overview-item__label">身高 / 体重</div>
              <div className="hr-overview-item__value">
                {ov.height} / {ov.weight}
              </div>
            </div>
            <div className="hr-overview-item">
              <div className="hr-overview-item__label">BMI</div>
              <div className="hr-overview-item__value">
                {ov.bmi} <span className="hr-text--warn">{ov.bmiStatus}</span>
              </div>
            </div>
            <div className="hr-overview-item">
              <div className="hr-overview-item__label">血压</div>
              <div className="hr-overview-item__value">{ov.bp}</div>
            </div>
            <div className="hr-overview-item">
              <div className="hr-overview-item__label">劳动 / 活动强度</div>
              <div className="hr-overview-item__value">{ov.activity}</div>
              <div className="hr-overview-item__sub">{ov.activityConfirm}</div>
            </div>
            <div className="hr-overview-item">
              <div className="hr-overview-item__label">血糖</div>
              <div className="hr-overview-item__value">{ov.glucose}</div>
            </div>
            <div className="hr-overview-item">
              <div className="hr-overview-item__label">过敏史</div>
              <div className="hr-overview-item__value">{ov.allergy}</div>
            </div>
            <div className="hr-overview-item">
              <div className="hr-overview-item__label">健康风险</div>
              <div className="hr-overview-item__value hr-text--danger">{ov.riskText}</div>
            </div>
          </div>
        </div>

        {/* 关键健康指标 */}
        <div className="hr-card">
          <div className="hr-card__header">
            <span className="hr-card__title">关键健康指标</span>
            <Button type="link" size="small">
              查看全部健康数据 <ArrowRightOutlined />
            </Button>
          </div>
          <div className="hr-metrics">
            {p.metrics.map((m) => (
              <div key={m.code} className="hr-metric-card">
                <div className="hr-metric-card__name">{m.name}</div>
                <div className="hr-metric-card__value">
                  {m.value} <span className="hr-metric-card__unit">{m.unit}</span>
                </div>
                <span className={`hr-tag hr-tag--risk-${m.level}`}>{m.status}</span>
                <div className="hr-metric-card__trend">
                  查看趋势 <ArrowRightOutlined />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 最近健康记录 */}
        <div className="hr-card">
          <div className="hr-card__header">
            <span className="hr-card__title">最近健康记录</span>
            <Button type="link" size="small">
              查看全部记录 <ArrowRightOutlined />
            </Button>
          </div>
          <div className="hr-timeline">
            {p.recentRecords.map((r) => (
              <div key={r.id} className="hr-timeline__item">
                <span className={`hr-dot hr-dot--${r.dot}`} />
                <div className="hr-timeline__body">
                  <div className="hr-timeline__head">
                    <span className="hr-timeline__date">{r.date}</span>
                    <span className="hr-timeline__title">{r.title}</span>
                  </div>
                  <div className="hr-timeline__summary">{r.summary}</div>
                </div>
                <span className="hr-timeline__operator">{r.operator}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 右栏 */}
      <div className="hr-profile__side">
        <div className="hr-card">
          <div className="hr-card__header">
            <span className="hr-card__title">专病档案</span>
            <Button type="link" size="small" icon={<PlusOutlined />}>
              添加病种
            </Button>
          </div>
          <div className="hr-side-list">
            {p.diseaseProfiles.slice(0, 2).map((d) => (
              <div
                key={d.id}
                className="hr-side-item"
                onClick={() => navigate(`/health-record/${id ?? 1}/disease/${d.key}`)}
              >
                <div className="hr-side-item__head">
                  <span className={`hr-dot hr-dot--${d.dot}`} />
                  <span className="hr-side-item__name">{d.name.replace('专病档案', '档案')}</span>
                  <span className={`hr-tag hr-tag--risk-${d.statusLevel}`}>{d.status}</span>
                </div>
                <div className="hr-side-item__sub">
                  {d.summary} · {d.updated}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="hr-card">
          <div className="hr-card__header">
            <span className="hr-card__title">健康管理进展</span>
            <span className="hr-tag hr-tag--risk-low">{p.progress.planTag}</span>
          </div>
          <div className="hr-progress">
            <div className="hr-progress__row">
              <span className="hr-progress__label">管理目标</span>
              <span className="hr-progress__value">
                {p.progress.goals} <span className="hr-progress__sub">{p.progress.goalsDone}</span>
              </span>
            </div>
            <div className="hr-progress__row">
              <span className="hr-progress__label">健康管理方案</span>
              <span className="hr-progress__value">
                {p.progress.plan} <span className="hr-progress__sub">{p.progress.planWeek}</span>
              </span>
            </div>
            <div className="hr-progress__row">
              <span className="hr-progress__label">本月随访</span>
              <span className="hr-progress__value">
                {p.progress.followups} <span className="hr-progress__sub">{p.progress.nextFollowup}</span>
              </span>
            </div>
            <div className="hr-progress__row">
              <span className="hr-progress__label">最近评估</span>
              <span className="hr-progress__value hr-text--danger">
                {p.progress.assessment} <span className="hr-progress__sub">{p.progress.assessmentDate}</span>
              </span>
            </div>
            <Button type="primary" block className="hr-progress__cta">
              查看健康管理 <ArrowRightOutlined />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

/** 专病档案 Tab */
function DiseaseTab() {
  const { id } = useParams()
  const navigate = useNavigate()
  return (
    <div>
      <div className="hr-disease__header">
        <div>
          <div className="hr-disease__title">专病档案</div>
          <div className="hr-disease__desc">
            按病种维护必要的诊断与分层信息；检查检验和用药均从独立 Tab 引用，不重复录入。
          </div>
        </div>
        <Button type="primary" icon={<PlusOutlined />}>
          添加专病档案
        </Button>
      </div>
      <div className="hr-disease__grid">
        {mockProfile.diseaseProfiles.map((d) => (
          <div key={d.id} className="hr-disease-card">
            <div className="hr-disease-card__head">
              <span className={`hr-dot hr-dot--${d.dot}`} />
              <span className="hr-disease-card__name">{d.name}</span>
              <span className={`hr-tag hr-tag--risk-${d.statusLevel}`}>{d.status}</span>
            </div>
            <div className="hr-disease-card__summary">{d.summary}</div>
            <div className="hr-disease-card__updated">{d.updated}</div>
            <div className="hr-disease-card__footer">
              <Button
                className="hr-disease-card__cta"
                onClick={() => navigate(`/health-record/${id ?? 1}/disease/${d.key}`)}
              >
                {d.done ? '进入档案' : '完善档案'} <ArrowRightOutlined />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

/** 用药记录 Tab（设计稿：用药记录.png） */
function MedicationTab() {
  const [subTab, setSubTab] = useState<'current' | 'history' | 'pending'>('current')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const s = mockMedicationSummary
  const list = mockMedications[subTab]

  const columns = [
    { title: '药品信息', dataIndex: 'name', key: 'name' },
    { title: '用法用量', dataIndex: 'usage', key: 'usage' },
    { title: '开始日期', dataIndex: 'start', key: 'start' },
    { title: '数据来源', dataIndex: 'source', key: 'source' },
    {
      title: '依从性',
      dataIndex: 'adherence',
      key: 'adherence',
      render: (_: unknown, row: MedicationItem) => (
        <span className={`hr-med-adherence hr-med-adherence--${row.level}`}>{row.adherence}</span>
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 70,
      render: () => (
        <Button type="link" size="small">
          编辑
        </Button>
      ),
    },
  ]

  return (
    <div>
      <div className="hr-disease__header">
        <div>
          <div className="hr-disease__title">用药记录</div>
          <div className="hr-disease__desc">
            统一维护当前用药、历史用药、依从性与不良反应；不要求健管师按病种分类。
          </div>
        </div>
        <Button type="primary" icon={<PlusOutlined />}>
          新增用药
        </Button>
      </div>

      <div className="hr-med">
        {/* 左：用药列表 */}
        <div className="hr-card hr-med__main">
          <div className="hr-card__header">
            <span className="hr-card__title">
              当前用药 <span className="hr-med__count">{s.current}</span>
            </span>
          </div>
          <div className="hr-med__subtabs">
            {(
              [
                { key: 'current', label: `当前用药 ${s.current}` },
                { key: 'history', label: `历史用药 ${mockMedications.history.length}` },
                { key: 'pending', label: `待确认 ${s.pending}` },
              ] as const
            ).map((t) => (
              <span
                key={t.key}
                className={subTab === t.key ? 'hr-quick hr-quick--active' : 'hr-quick'}
                onClick={() => setSubTab(t.key)}
              >
                {t.label}
              </span>
            ))}
          </div>
          <Table<MedicationItem>
            rowKey="id"
            columns={columns}
            dataSource={list}
            pagination={{
              current: page,
              pageSize,
              total: list.length,
              onChange: (nextPage, nextPageSize) => {
                setPage(nextPage)
                setPageSize(nextPageSize)
              },
              showTotal: (total) => `共 ${total} 条`,
            }}
          />
        </div>

        {/* 右：用药概况 + 健管师提示 */}
        <div className="hr-med__side">
          <div className="hr-card">
            <div className="hr-card__header">
              <span className="hr-card__title">用药概况</span>
            </div>
            <div className="hr-med-summary">
              <div className="hr-med-summary__item">
                <div className="hr-med-summary__value">{s.current}</div>
                <div className="hr-med-summary__label">当前用药</div>
              </div>
              <div className="hr-med-summary__item">
                <div className="hr-med-summary__value hr-med-summary__value--ok">{s.regular}</div>
                <div className="hr-med-summary__label">规律服用</div>
              </div>
              <div className="hr-med-summary__item">
                <div className="hr-med-summary__value hr-med-summary__value--warn">{s.pending}</div>
                <div className="hr-med-summary__label">待确认</div>
              </div>
            </div>
            <div className="hr-med-summary__foot">
              最近核对：{s.lastCheck} · {s.checker}
            </div>
          </div>

          <div className="hr-med-tip">
            <div className="hr-med-tip__title">健管师需要做什么</div>
            <p>
              核对药品名称、剂量、频次、是否正在服用及不良反应；无需判断药物对应哪一种疾病。
            </p>
            <p>处方归属和治疗病种由医生或系统数据提供。</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function HealthProfile() {
  const { id } = useParams()
  const [searchParams] = useSearchParams()
  const [tab, setTab] = useState(() => searchParams.get('tab') ?? '健康概览')
  // TODO: 接入后端后按 id 调 memberApi.getHealthProfile(id)
  const p = mockProfile
  void id

  const tabContent = useMemo(() => {
    if (tab === '健康概览') return <OverviewTab />
    if (tab === '基础信息') return <BasicInfoTab />
    if (tab === '健康史') return <HistoryTab />
    if (tab === '专病档案') return <DiseaseTab />
    if (tab === '健康指标') return <MetricsTab />
    if (tab === '检查检验') return <ExamTab />
    if (tab === '健康记录') return <RecordsTab />
    if (tab === '用药记录') return <MedicationTab />
    if (tab === '健康力测评') return <AssessTab />
    return <div className="hr-card hr-card--placeholder">「{tab}」内容待接入后端数据后实现</div>
  }, [tab])

  return (
    <div className="hr-page">
      <PageContainer
        title={`${p.name}的健康档案`}
        description="集中查看基础资料、专病档案、健康数据与健康管理进展"
        extra={<Button type="primary">疾病与专病档案</Button>}
      >
        {/* 会员信息卡 */}
        <div className="hr-member">
          <div className="hr-member__left">
            <Avatar className="hr-avatar" size={56}>
              {p.name.slice(0, 1)}
            </Avatar>
            <div>
              <div className="hr-member__head">
                <span className="hr-member__name">{p.name}</span>
                {p.diseases.map((d, i) => (
                  <span key={d} className={i === 0 ? 'hr-tag hr-tag--risk-low' : 'hr-tag hr-tag--disease'}>
                    {d}
                  </span>
                ))}
                <span className={`hr-tag hr-tag--risk-${p.risk}`}>{RISK_TEXT[p.risk]}</span>
              </div>
              <div className="hr-member__sub">
                {p.gender} · {p.age}岁 · 档案编号 {p.profileNo}
              </div>
            </div>
          </div>
          <div className="hr-member__meta">
            <div className="hr-member__meta-item">
              <div className="hr-member__meta-label">责任医生</div>
              <div className="hr-member__meta-value">{p.doctor}</div>
            </div>
            <div className="hr-member__meta-item">
              <div className="hr-member__meta-label">健康管理师</div>
              <div className="hr-member__meta-value">{p.manager}</div>
            </div>
            <div className="hr-member__meta-item">
              <div className="hr-member__meta-label">当前机构</div>
              <div className="hr-member__meta-value">{p.org}</div>
            </div>
          </div>
        </div>

        {/* Tab 栏 */}
        <div className="hr-tabs">
          <Tabs activeKey={tab} onChange={setTab} items={TAB_ITEMS.map((t) => ({ key: t, label: t }))} />
        </div>

        {tabContent}
      </PageContainer>
    </div>
  )
}
