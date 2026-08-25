/**
 * 健康档案 - 专病档案详情（设计稿：高血压/糖尿病/冠心病/慢阻肺/Drawer.png）
 * 四个病种共用一套布局，字段由 mock 配置驱动；编辑走右侧抽屉
 * TODO: 专病档案详情/编辑接口 API v0.1 未定义，当前为 mock（见 ./mock.ts）
 */
import { useMemo, useState } from 'react'
import { Avatar, Button, DatePicker, Drawer, Input, Progress, Select, Tabs } from 'antd'
import { ArrowRightOutlined, CheckOutlined } from '@ant-design/icons'
import { useNavigate, useParams } from 'react-router-dom'
import dayjs from 'dayjs'
import PageContainer from '@/components/PageContainer'
import { mockDiseaseDetails, mockProfile, type DiseaseChipGroup } from './mock'
import './index.less'

const TAB_ITEMS = [
  '健康概览',
  '基础信息',
  '健康史',
  '专病档案',
  '健康指标',
  '检查检验',
  '健康记录',
  '用药记录',
]

/** 会员信息卡（与档案详情页一致） */
function MemberCard() {
  const p = mockProfile
  return (
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
            <span className={`hr-tag hr-tag--risk-${p.risk}`}>高风险</span>
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
  )
}

/** 编辑专病档案抽屉（设计稿：Drawer.png） */
function EditDrawer({
  open,
  title,
  fields,
  chipGroups,
  note,
  onClose,
}: {
  open: boolean
  title: string
  fields: NonNullable<(typeof mockDiseaseDetails)[string]['drawer']['fields']>
  chipGroups: DiseaseChipGroup[]
  note: string
  onClose: () => void
}) {
  const [chips, setChips] = useState<Record<string, string[]>>({})
  const selectedOf = (g: DiseaseChipGroup) => chips[g.label] ?? g.selected

  const toggle = (g: DiseaseChipGroup, opt: string) => {
    const cur = selectedOf(g)
    setChips((m) => ({
      ...m,
      [g.label]: cur.includes(opt) ? cur.filter((x) => x !== opt) : [...cur, opt],
    }))
  }

  return (
    <Drawer
      title={title}
      width={600}
      open={open}
      onClose={onClose}
      footer={
        <div className="hr-drawer__footer">
          <Button onClick={onClose}>取消</Button>
          <Button type="primary" onClick={onClose}>
            保存并提交
          </Button>
        </div>
      }
    >
      <div className="hr-drawer__banner">由责任医生确认后生效，变更会保留版本记录</div>

      <div className="hr-drawer__section-title">疾病基本信息</div>
      <div className="hr-drawer__grid">
        {fields.map((f) => (
          <div key={f.key} className="hr-drawer__field">
            <div className="hr-create__field-label">{f.label}</div>
            {f.type === 'date' && <DatePicker defaultValue={dayjs(f.value)} format="YYYY年M月D日" />}
            {f.type === 'select' && (
              <Select defaultValue={f.value} options={(f.options ?? []).map((o) => ({ value: o, label: o }))} />
            )}
            {f.type === 'input' && <Input defaultValue={f.value} />}
          </div>
        ))}
      </div>

      {chipGroups.map((g) => (
        <div key={g.label}>
          <div className="hr-drawer__section-title">{g.label}</div>
          <div className="hr-drawer__chips">
            {g.options.map((opt) => {
              const active = selectedOf(g).includes(opt)
              const cls = `hr-chip hr-chip--${g.tone}${active ? ' hr-chip--active' : ''}`
              return (
                <span key={opt} className={cls} onClick={() => toggle(g, opt)}>
                  {active && <CheckOutlined />} {opt}
                </span>
              )
            })}
          </div>
        </div>
      ))}

      <div className="hr-drawer__section-title">补充说明</div>
      <Input.TextArea rows={3} defaultValue={note} />
    </Drawer>
  )
}

export default function DiseaseProfile() {
  const { id, diseaseKey } = useParams()
  const navigate = useNavigate()
  const [drawerOpen, setDrawerOpen] = useState(false)
  // TODO: 接入后端后按 id + diseaseKey 调专病档案详情接口
  void id
  const d = mockDiseaseDetails[diseaseKey ?? 'hypertension'] ?? mockDiseaseDetails.hypertension

  const goalBtn = useMemo(
    () => (
      <Button block className="hr-disease-goal__cta">
        查看完整管理目标 <ArrowRightOutlined />
      </Button>
    ),
    [],
  )

  return (
    <div className="hr-page">
      <PageContainer
        title={d.title}
        description="记录病种事实与临床依据；管理目标及执行方案在“健康管理”中维护"
        extra={
          <Button type="primary" onClick={() => setDrawerOpen(true)}>
            编辑专病档案
          </Button>
        }
      >
        <MemberCard />

        <div className="hr-tabs">
          <Tabs
            activeKey="专病档案"
            onChange={(k) => navigate(`/health-record/${id ?? 1}?tab=${encodeURIComponent(k)}`)}
            items={TAB_ITEMS.map((t) => ({ key: t, label: t }))}
          />
        </div>

        <div className="hr-disease-detail">
          {/* 左栏 */}
          <div className="hr-disease-detail__main">
            {/* 疾病基本信息 */}
            <div className="hr-card">
              <div className="hr-card__header">
                <span className="hr-card__title">疾病基本信息</span>
                <span className="hr-text--primary hr-disease-detail__confirmed">已由责任医生确认</span>
              </div>
              <div className="hr-overview-grid">
                {d.baseFields.map((f) => (
                  <div key={f.label} className="hr-overview-item">
                    <div className="hr-overview-item__label">{f.label}</div>
                    <div
                      className={
                        f.danger ? 'hr-overview-item__value hr-text--danger' : 'hr-overview-item__value'
                      }
                    >
                      {f.value}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 关键指标与最近数据 */}
            <div className="hr-card">
              <div className="hr-card__header">
                <span className="hr-card__title">关键指标与最近数据</span>
                <span className="hr-disease-detail__hint">目标值来自已生效管理目标，仅在此展示</span>
              </div>
              <div className="hr-metrics">
                {d.metrics.map((m) => (
                  <div key={m.name} className="hr-metric-card">
                    <div className="hr-metric-card__name">{m.name}</div>
                    <div className="hr-metric-card__value">
                      {m.value} <span className="hr-metric-card__unit">{m.unit}</span>
                    </div>
                    <div className="hr-metric-card__target">{m.target}</div>
                    <span className={`hr-tag hr-tag--risk-${m.level}`}>{m.status}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* 临床依据与病种动态 */}
            <div className="hr-card">
              <div className="hr-card__header">
                <span className="hr-card__title">临床依据与病种动态</span>
                <Button type="link" size="small">
                  查看全部记录 <ArrowRightOutlined />
                </Button>
              </div>
              <div className="hr-timeline">
                {d.timeline.map((r) => (
                  <div key={r.id} className="hr-timeline__item">
                    <span className={`hr-dot hr-dot--${r.dot}`} />
                    <div className="hr-timeline__body">
                      <div className="hr-timeline__head">
                        <span className="hr-timeline__date">{r.date}</span>
                        <span className="hr-timeline__title">{r.title}</span>
                      </div>
                      <div className="hr-timeline__summary">{r.summary}</div>
                    </div>
                    <span className="hr-timeline__operator">{r.source}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 右栏 */}
          <div className="hr-disease-detail__side">
            {/* 管理目标摘要 */}
            <div className="hr-card">
              <div className="hr-card__header">
                <span className="hr-card__title">管理目标摘要</span>
                <span className="hr-tag hr-tag--risk-low">{d.goal.planTag}</span>
              </div>
              <div className="hr-disease-goal">
                <div className="hr-disease-goal__label">管理周期</div>
                <div className="hr-disease-goal__value">{d.goal.period}</div>
                <div className="hr-disease-goal__label">核心目标</div>
                <div className="hr-disease-goal__core">{d.goal.core}</div>
                <div className="hr-disease-goal__note">{d.goal.coreNote}</div>
                {goalBtn}
              </div>
            </div>

            {/* 并发症与危险因素 */}
            <div className="hr-card">
              <div className="hr-card__header">
                <span className="hr-card__title">并发症与危险因素</span>
              </div>
              {d.complications.map((g) => (
                <div key={g.groupLabel} className="hr-disease-comp">
                  <div className="hr-disease-comp__label">{g.groupLabel}</div>
                  <div className="hr-disease-comp__tags">
                    {g.tags.map((t) => (
                      <span key={t.text} className={`hr-tag hr-tag--risk-${t.level}`}>
                        {t.text}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* 档案质量与更新 */}
            <div className="hr-card">
              <div className="hr-card__header">
                <span className="hr-card__title">档案质量与更新</span>
              </div>
              <div className="hr-quality">
                <div className="hr-quality__head">
                  <span className="hr-quality__label">完整度</span>
                  <span className="hr-quality__value">{d.quality.completeness}%</span>
                </div>
                <Progress percent={d.quality.completeness} showInfo={false} />
                {d.quality.rows.map((r) => (
                  <div key={r.label} className="hr-quality__row">
                    <span className="hr-quality__label">{r.label}</span>
                    <span className={r.warn ? 'hr-quality__row-value hr-text--warn' : 'hr-quality__row-value'}>
                      {r.value}
                    </span>
                  </div>
                ))}
                <div className="hr-quality__foot">档案变更将保留版本与操作人记录</div>
              </div>
            </div>
          </div>
        </div>
      </PageContainer>

      <EditDrawer
        open={drawerOpen}
        title={`编辑${d.name}专病档案`}
        fields={d.drawer.fields}
        chipGroups={d.drawer.chipGroups}
        note={d.drawer.note}
        onClose={() => setDrawerOpen(false)}
      />
    </div>
  )
}
