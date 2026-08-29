/**
 * 健康档案详情 - 新版 Tab 内容（设计稿：3.健康档案详情/）
 * 基础信息 / 健康史 / 健康指标 / 健康记录 / 检查检验（列表 + 报告详情 + 手动录入向导）
 * TODO: 以上接口 API v0.1 未定义，当前为 mock（见 ./mock.ts）
 */
import { useMemo, useState } from 'react'
import { Button, Input, Table } from 'antd'
import {
  ArrowLeftOutlined,
  DownloadOutlined,
  PlusOutlined,
  SearchOutlined,
} from '@ant-design/icons'
import {
  mockBasicInfo,
  mockExamReport,
  mockExams,
  mockExamStats,
  mockExamWizard,
  mockHealthEvents,
  mockHealthHistory,
  mockMetricsTab,
  type ExamItem,
} from './mock'
import './index.less'

/* ================= 基础信息 ================= */

export function BasicInfoTab() {
  const b = mockBasicInfo
  return (
    <div>
      <div className="hr-disease__header">
        <div>
          <div className="hr-disease__title">基础信息</div>
          <div className="hr-disease__desc">
            维护健康管理所需的最小身份与联系信息；不采集医保卡号、婚姻状况、文化程度和职业
          </div>
        </div>
        <Button type="primary">编辑基础信息</Button>
      </div>

      <div className="hr-basic">
        <div className="hr-basic__left">
          <div className="hr-card">
            <div className="hr-card__header">
              <span className="hr-card__title">身份与联系方式</span>
            </div>
            <div className="hr-basic__hint">实名信息仅用于服务核验，页面默认脱敏展示</div>
            <div className="hr-basic__grid">
              {b.identity.map((f) => (
                <div
                  key={f.label}
                  className={f.span ? 'hr-basic__item hr-basic__item--span' : 'hr-basic__item'}
                >
                  <div className="hr-overview-item__label">{f.label}</div>
                  <div className="hr-overview-item__value">{f.value}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="hr-card">
            <div className="hr-card__header">
              <span className="hr-card__title">紧急联系人</span>
            </div>
            <div className="hr-basic__grid hr-basic__grid--2">
              {b.emergency.map((f) => (
                <div key={f.label} className="hr-basic__item">
                  <div className="hr-overview-item__label">{f.label}</div>
                  <div className="hr-overview-item__value">{f.value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="hr-basic__right">
          <div className="hr-card">
            <div className="hr-card__header">
              <span className="hr-card__title">服务对象与账号关系</span>
            </div>
            <div className="hr-basic__hint">区分“谁在使用账号”和“谁接受服务”</div>
            <div className="hr-basic__item">
              <div className="hr-overview-item__label">健康服务对象</div>
              <div className="hr-overview-item__value">{b.relation.target}</div>
            </div>
            <div className="hr-basic__item hr-basic__item--gap">
              <div className="hr-overview-item__label">账号操作人</div>
              <div className="hr-overview-item__value">{b.relation.operator}</div>
              {b.relation.authorized && <span className="hr-tag hr-tag--risk-low">已获档案授权</span>}
            </div>
          </div>

          <div className="hr-card">
            <div className="hr-card__header">
              <span className="hr-card__title">管理归属</span>
            </div>
            <div className="hr-basic__grid hr-basic__grid--2">
              {b.belonging.map((f) => (
                <div key={f.label} className="hr-basic__item">
                  <div className="hr-overview-item__label">{f.label}</div>
                  <div className="hr-overview-item__value">{f.value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="hr-footnote hr-footnote--green">
        检索健康档案支持手机号、会员ID或姓名；不支持使用身份证号检索。实名信息及联系方式默认脱敏。
      </div>
    </div>
  )
}

/* ================= 健康史 ================= */

export function HistoryTab() {
  const h = mockHealthHistory
  return (
    <div>
      <div className="hr-disease__header">
        <div>
          <div className="hr-disease__title">健康史</div>
          <div className="hr-disease__desc">
            集中维护既往疾病、过敏、家族史与生活方式，为分层分级和AI方案生成提供依据
          </div>
        </div>
        <Button type="primary">编辑健康史</Button>
      </div>

      <div className="hr-basic">
        <div className="hr-basic__left">
          <div className="hr-card">
            <div className="hr-card__header">
              <span className="hr-card__title">既往健康史</span>
            </div>
            <div className="hr-basic__hint">只记录诊断事实与关键时间，检查检验和用药不在这里重复填写</div>
            <div className="hr-history-list">
              {h.past.map((r) => (
                <div key={r.label} className="hr-history-list__row">
                  <span className="hr-history-list__label">{r.label}</span>
                  <span className="hr-history-list__value">{r.value}</span>
                  <span className="hr-history-list__note">{r.note}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="hr-basic__right">
          <div className="hr-card">
            <div className="hr-card__header">
              <span className="hr-card__title">风险因素与补充</span>
            </div>
            {h.risks.map((r) => (
              <div key={r.label} className="hr-basic__item hr-basic__item--gap">
                <div className="hr-overview-item__label">{r.label}</div>
                <div className="hr-overview-item__value">{r.value}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="hr-card">
        <div className="hr-card__header">
          <span className="hr-card__title">饮食、运动与活动强度</span>
        </div>
        <div className="hr-basic__hint">用于AI饮食与运动方案生成，也可在随访中持续更新</div>
        <div className="hr-basic__grid hr-basic__grid--4">
          {h.lifestyle.map((f) => (
            <div key={f.label} className="hr-basic__item">
              <div className="hr-overview-item__label">{f.label}</div>
              <div className="hr-overview-item__value">{f.value}</div>
              {f.affectsPlan && <span className="hr-tag hr-tag--risk-low">影响方案生成</span>}
            </div>
          ))}
        </div>
      </div>

      <div className="hr-footnote hr-footnote--yellow">
        信息来源：首次建档、用户自填或健康管理师随访。最近更新：{h.updated} {h.updater}。
      </div>
    </div>
  )
}

/* ================= 健康指标 ================= */

/** 近7日血压趋势（SVG 折线，颜色走 less） */
function BpTrendChart() {
  const t = mockMetricsTab.trend
  const W = 700
  const H = 240
  const PAD_X = 40
  const PAD_TOP = 16
  const PAD_BOTTOM = 30
  const x = (i: number) => PAD_X + (i * (W - PAD_X * 2)) / (t.days.length - 1)
  const y = (v: number) => PAD_TOP + (160 - v) * ((H - PAD_TOP - PAD_BOTTOM) / 110)

  const line = (values: number[]) =>
    values.map((v, i) => `${x(i)},${y(v)}`).join(' ')

  return (
    <svg className="hr-trend" viewBox={`0 0 ${W} ${H}`} role="img" aria-label={t.title}>
      <polyline className="hr-trend__line hr-trend__line--sbp" points={line(t.systolic)} />
      <polyline className="hr-trend__line hr-trend__line--dbp" points={line(t.diastolic)} />
      {t.systolic.map((v, i) => (
        <circle key={`s${i}`} className="hr-trend__dot hr-trend__dot--sbp" cx={x(i)} cy={y(v)} r={4} />
      ))}
      {t.diastolic.map((v, i) => (
        <circle key={`d${i}`} className="hr-trend__dot hr-trend__dot--dbp" cx={x(i)} cy={y(v)} r={4} />
      ))}
      {t.days.map((d, i) => (
        <text key={d} className="hr-trend__label" x={x(i)} y={H - 8} textAnchor="middle">
          {d}
        </text>
      ))}
    </svg>
  )
}

export function MetricsTab() {
  const m = mockMetricsTab
  return (
    <div>
      <div className="hr-disease__header">
        <div>
          <div className="hr-disease__title">健康指标</div>
          <div className="hr-disease__desc">
            查看用户自测、服务人员记录与设备同步的指标；检查检验数据仍在独立Tab维护
          </div>
        </div>
        <Button type="primary">记录健康指标</Button>
      </div>

      <div className="hr-metrics hr-metrics--5">
        {m.cards.map((c) => (
          <div key={c.name} className="hr-metric-card hr-metric-card--plain">
            <div className="hr-metric-card__name">{c.name}</div>
            <div className="hr-metric-card__value">
              {c.value} <span className="hr-metric-card__unit">{c.unit}</span>
            </div>
            <span className={`hr-tag hr-tag--risk-${c.level}`}>{c.status}</span>
          </div>
        ))}
      </div>

      <div className="hr-metrics-panels">
        <div className="hr-card">
          <div className="hr-card__header">
            <span className="hr-card__title">{m.trend.title}</span>
          </div>
          <div className="hr-basic__hint">{m.trend.target}</div>
          <BpTrendChart />
          <div className="hr-trend-summary">{m.trend.summary}</div>
        </div>

        <div className="hr-card">
          <div className="hr-card__header">
            <span className="hr-card__title">最新指标记录</span>
          </div>
          <div className="hr-basic__hint">所有数据保留来源与记录时间</div>
          <div className="hr-latest-list">
            {m.latest.map((r) => (
              <div key={r.id} className="hr-latest-list__row">
                <div>
                  <div className="hr-latest-list__time">{r.time}</div>
                  <div className="hr-latest-list__source">{r.source}</div>
                </div>
                <span className="hr-latest-list__text">{r.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="hr-footnote hr-footnote--green">
        健康指标可由用户、服务人员或设备记录；异常值触发固定阈值预警。检查检验指标请从“检查检验”Tab查看。
      </div>
    </div>
  )
}

/* ================= 健康记录 ================= */

export function RecordsTab() {
  const [keyword, setKeyword] = useState('')
  const [appliedKeyword, setAppliedKeyword] = useState('')
  const events = useMemo(
    () =>
      mockHealthEvents.filter(
        (e) => !appliedKeyword || e.title.includes(appliedKeyword) || e.summary.includes(appliedKeyword),
      ),
    [appliedKeyword],
  )
  return (
    <div>
      <div className="hr-disease__header">
        <div>
          <div className="hr-disease__title">健康记录</div>
          <div className="hr-disease__desc">
            按时间汇总诊疗、评估、随访与服务事件；详情返回原业务记录，避免重复维护
          </div>
        </div>
        <span className="hr-tag hr-tag--risk-low">只读汇总</span>
      </div>

      <div className="hr-card">
        <div className="filter-row">
          <span className="hr-records__filter">记录类型：全部</span>
          <span className="hr-records__filter">时间：最近一年</span>
          <Input
            placeholder="关键词：事件名称 / 记录人"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value.trim())}
            allowClear
          />
          <Button type="primary" onClick={() => setAppliedKeyword(keyword)}>查询</Button>
        </div>
      </div>

      <div className="hr-card">
        <div className="hr-card__header">
          <span className="hr-card__title">健康事件时间轴</span>
        </div>
        <div className="hr-basic__hint">按事件发生时间倒序展示</div>
        <div className="hr-timeline">
          {events.map((e) => (
            <div key={e.id} className="hr-timeline__item">
              <span className={`hr-dot hr-dot--${e.dot}`} />
              <div className="hr-timeline__body">
                <div className="hr-timeline__head">
                  <span className="hr-timeline__date">{e.time}</span>
                  <span className="hr-timeline__title">{e.title}</span>
                </div>
                <div className="hr-timeline__summary">{e.summary}</div>
              </div>
              <span className="hr-tag hr-tag--risk-low">{e.module}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="hr-footnote hr-footnote--green">
        健康记录是跨模块索引，不复制原业务数据；点击事件可进入随访、管理目标、工单或指标原记录。
      </div>
    </div>
  )
}

/* ================= 检查检验 ================= */

/** 报告详情（查看详情.png） */
function ExamReportView({ onBack, onManualEntry }: { onBack: () => void; onManualEntry: () => void }) {
  const r = mockExamReport
  return (
    <div>
      <div className="hr-disease__header">
        <div>
          <div className="hr-disease__title">检查检验报告详情</div>
          <div className="hr-disease__desc">来源：{r.source}</div>
        </div>
        <Button icon={<ArrowLeftOutlined />} onClick={onBack}>
          返回列表
        </Button>
      </div>

      <div className="hr-card">
        <div className="hr-report-fields">
          {r.fields.map((f) => (
            <div key={f.label} className="hr-report-fields__item">
              <div className="hr-overview-item__label">{f.label}</div>
              <div className="hr-report-fields__value">{f.value}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="hr-report">
        <div className="hr-card">
          <div className="hr-card__header">
            <span className="hr-card__title">报告原件</span>
          </div>
          <div className="hr-report-paper">
            <div className="hr-report-paper__title">{r.original.title}</div>
            <div className="hr-report-paper__subtitle">{r.original.subtitle}</div>
            {r.original.rows.map((row) => (
              <div key={row.name} className="hr-report-paper__row">
                <span>{row.name}</span>
                <span className={row.abnormal ? 'hr-text--danger' : ''}>{row.value}</span>
                <span className="hr-report-paper__unit">{row.unit}</span>
              </div>
            ))}
          </div>
          <div className="hr-report__download">
            <Button icon={<DownloadOutlined />}>下载原件</Button>
          </div>
        </div>

        <div className="hr-card">
          <div className="hr-card__header">
            <span className="hr-card__title">用户填写的信息</span>
          </div>
          <div className="hr-basic__item">
            <div className="hr-overview-item__label">报告名称</div>
            <div className="hr-overview-item__value">{r.userInfo.name}</div>
          </div>
          <div className="hr-basic__item hr-basic__item--gap">
            <div className="hr-overview-item__label">备注</div>
            <div className="hr-overview-item__value">{r.userInfo.remark}</div>
          </div>

          <div className="hr-report__process">
            <div className="hr-report__process-title">本期处理方式</div>
            C 端上传报告保留原件和用户填写的信息，不自动识别为结构化指标。
          </div>

          <div className="hr-overview-item__label">健管师操作</div>
          <div className="hr-report__actions">
            <Button type="primary">标记已查看</Button>
            <Button onClick={onManualEntry}>按报告手动录入</Button>
          </div>
          <div className="hr-basic__hint hr-report__hint">
            如需用于分层分级、管理目标或趋势分析，健管师可按报告内容进入对应项目的手动录入表单。
          </div>
          <div className="hr-footnote hr-footnote--green">
            报告原件不可修改，保留上传人和上传时间。
          </div>
        </div>
      </div>
    </div>
  )
}

/** 手动录入向导（选择项目.png / 血脂检查.png） */
function ExamWizard({ onBack }: { onBack: () => void }) {
  const [step, setStep] = useState(1)
  const [selected, setSelected] = useState<string | null>('血脂检查')
  const [keyword, setKeyword] = useState('')
  const w = mockExamWizard

  if (step === 2) {
    const l = w.lipid
    return (
      <div>
        <div className="hr-disease__header">
          <div>
            <div className="hr-disease__title">录入{l.name}</div>
            <div className="hr-disease__desc">字段、缩写、单位及参考范围来自附件 Excel</div>
          </div>
          <span className="hr-wizard__step">步骤 2 / 2</span>
        </div>

        <div className="hr-card">
          <div className="hr-report-fields">
            <div className="hr-report-fields__item">
              <div className="hr-overview-item__label">
                检查日期 <span className="hr-required">*</span>
              </div>
              <Input defaultValue={l.form.date} />
            </div>
            <div className="hr-report-fields__item">
              <div className="hr-overview-item__label">
                医疗机构 <span className="hr-required">*</span>
              </div>
              <Input defaultValue={l.form.org} />
            </div>
            <div className="hr-report-fields__item">
              <div className="hr-overview-item__label">报告编号（选填）</div>
              <Input placeholder="请输入" />
            </div>
            <div className="hr-report-fields__item">
              <div className="hr-overview-item__label">数据来源</div>
              <Input value={l.form.source} disabled />
            </div>
            <div className="hr-report-fields__item">
              <div className="hr-overview-item__label">录入人</div>
              <Input value={l.form.operator} disabled />
            </div>
          </div>
        </div>

        <div className="hr-wizard-step2">
          <div className="hr-card">
            <div className="hr-card__header">
              <span className="hr-card__title">检验指标</span>
            </div>
            <table className="hr-lab-table">
              <thead>
                <tr>
                  <th>项目</th>
                  <th>结果</th>
                  <th>单位</th>
                  <th>参考范围</th>
                  <th>判断</th>
                </tr>
              </thead>
              <tbody>
                {l.indicators.map((ind) => (
                  <tr key={ind.name}>
                    <td>{ind.name}</td>
                    <td>
                      <Input defaultValue={ind.value} className="hr-lab-table__input" />
                    </td>
                    <td className="hr-lab-table__muted">{ind.unit}</td>
                    <td className="hr-lab-table__muted">{ind.range}</td>
                    <td>
                      <span className={`hr-tag hr-tag--risk-${ind.level}`}>{ind.judge}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="hr-footnote hr-footnote--blue">
              数值支持小数点后2位；单位和参考范围自动带入，不允许健管师自行修改。
            </div>
          </div>

          <div className="hr-card">
            <div className="hr-card__header">
              <span className="hr-card__title">报告附件（选填）</span>
            </div>
            <div className="hr-upload-box">
              <PlusOutlined /> 上传报告原件
              <div className="hr-upload-box__hint">支持 JPG、PNG、PDF</div>
            </div>
            <div className="hr-overview-item__label hr-wizard__remark-label">备注（选填）</div>
            <Input.TextArea rows={3} placeholder="请输入补充说明" />
            <div className="hr-footnote hr-footnote--yellow">
              发现 {l.abnormalCount} 项异常
              <br />
              保存后写入健康档案，并触发固定阈值判断。
            </div>
            <Button type="primary" block onClick={onBack}>
              保存记录
            </Button>
          </div>
        </div>

        <div className="hr-footnote hr-footnote--green">
          检查检验指标保存后可被专病档案、随访问卷和管理目标引用，不在这些页面重复录入。
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="hr-disease__header">
        <div>
          <div className="hr-disease__title">手动录入检查检验</div>
          <div className="hr-disease__desc">先选择检查检验项目，系统再按 Excel 字段模板加载录入项</div>
        </div>
        <span className="hr-wizard__step">步骤 1 / 2</span>
      </div>

      <div className="hr-wizard">
        <div className="hr-card hr-wizard__cats">
          <div className="hr-card__title">项目分类</div>
          {w.categories.map((c, i) => (
            <div key={c} className={i === 0 ? 'hr-wizard__cat hr-wizard__cat--active' : 'hr-wizard__cat'}>
              {c}
            </div>
          ))}
        </div>

        <div className="hr-card hr-wizard__main">
          <div className="hr-wizard__search">
            <Input
              prefix={<SearchOutlined />}
              placeholder="输入项目名称或缩写，如 HbA1c、eGFR"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value.trim())}
            />
            <Button type="primary">搜索</Button>
          </div>

          <div className="hr-wizard__group-title">常用实验室检验</div>
          <div className="hr-wizard__items">
            {w.labItems
              .filter((it) => !keyword || it.name.includes(keyword))
              .map((it) => (
                <div
                  key={it.name}
                  className={
                    selected === it.name ? 'hr-wizard__item hr-wizard__item--active' : 'hr-wizard__item'
                  }
                  onClick={() => setSelected(it.name)}
                >
                  <div>
                    <div className="hr-wizard__item-name">{it.name}</div>
                    <div className="hr-wizard__item-count">{it.count}项</div>
                  </div>
                  {selected === it.name && <span className="hr-tag hr-tag--risk-low">已选择</span>}
                </div>
              ))}
          </div>

          <div className="hr-wizard__group-title">常用检查</div>
          <div className="hr-wizard__items">
            {w.commonItems
              .filter((n) => !keyword || n.includes(keyword))
              .map((n) => (
                <div
                  key={n}
                  className={selected === n ? 'hr-wizard__item hr-wizard__item--active' : 'hr-wizard__item'}
                  onClick={() => setSelected(n)}
                >
                  <div className="hr-wizard__item-name">{n}</div>
                  {selected === n && <span className="hr-tag hr-tag--risk-low">已选择</span>}
                </div>
              ))}
          </div>

          <div className="hr-wizard__footer">
            <div className="hr-wizard__selected">
              {selected
                ? `已选择：${selected}${selected === w.lipid.name ? ` · 将加载 ${w.lipid.fields.join('、')}` : ''}`
                : '请选择检查检验项目'}
            </div>
            <div className="hr-wizard__footer-actions">
              <Button onClick={onBack}>取消</Button>
              <Button type="primary" disabled={!selected} onClick={() => setStep(2)}>
                下一步
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

/** 检查检验 Tab 主组件（列表 / 报告详情 / 手动录入） */
export function ExamTab() {
  const [view, setView] = useState<'list' | 'report' | 'wizard'>('list')

  if (view === 'report') {
    return <ExamReportView onBack={() => setView('list')} onManualEntry={() => setView('wizard')} />
  }
  if (view === 'wizard') {
    return <ExamWizard onBack={() => setView('list')} />
  }

  const stats = [
    { label: '全部记录', value: mockExamStats.total },
    { label: '手动录入', value: mockExamStats.manual },
    { label: 'C端上传', value: mockExamStats.upload },
    { label: '异常项目', value: mockExamStats.abnormal, warn: true },
  ]

  const columns = [
    { title: '日期', dataIndex: 'date', key: 'date' },
    {
      title: '检查检验项目',
      dataIndex: 'name',
      key: 'name',
      render: (v: string) => <span className="hr-row__metric">{v}</span>,
    },
    {
      title: '来源',
      dataIndex: 'source',
      key: 'source',
      render: (v: ExamItem['source']) =>
        v === 'manual' ? (
          <span className="hr-tag hr-tag--risk-low">手动录入</span>
        ) : (
          <span className="hr-tag hr-tag--disease">C端上传</span>
        ),
    },
    { title: '机构', dataIndex: 'org', key: 'org' },
    { title: '结果摘要', dataIndex: 'summary', key: 'summary' },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (v: string, row: ExamItem) => (
        <span className={`hr-exam-status hr-exam-status--${row.statusLevel}`}>{v}</span>
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 110,
      render: (_: unknown, row: ExamItem) => (
        <Button size="small" onClick={() => setView('report')}>
          {row.action}
        </Button>
      ),
    },
  ]

  return (
    <div>
      <div className="hr-disease__header">
        <div>
          <div className="hr-disease__title">检查检验</div>
          <div className="hr-disease__desc">统一查看手动录入与用户在 C 端上传的报告</div>
        </div>
        <Button type="primary" onClick={() => setView('wizard')}>
          手动录入
        </Button>
      </div>

      <div className="hr-stats">
        {stats.map((s) => (
          <div key={s.label} className="hr-stat">
            <div className="hr-stat__label">{s.label}</div>
            <div className={s.warn ? 'hr-stat__value hr-stat__value--warn' : 'hr-stat__value'}>{s.value}</div>
          </div>
        ))}
      </div>

      <div className="hr-card">
        <div className="filter-row">
          <Input placeholder="全部类型" />
          <Input placeholder="全部分类" />
          <Input placeholder="最近一年" />
          <Input placeholder="项目名称 / 机构" />
          <Button>重置</Button>
          <Button type="primary">查询</Button>
        </div>
      </div>

      <div className="hr-card hr-exam__table">
        <Table<ExamItem> rowKey="id" columns={columns} dataSource={mockExams} pagination={false} />
      </div>

      <div className="hr-footnote hr-footnote--green">
        记录按“一次检查检验数据包”保存；同一份报告下的指标不会拆成多条记录。
      </div>
    </div>
  )
}
