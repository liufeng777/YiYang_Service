/**
 * 入住协同 - 意向列表（设计稿：16.入住协同 / 意向列表.png）
 * 登记会员入住意向并持续跟进，线下接待结果在此留痕
 * 说明：swagger.json 无入住意向相关端点（列表/新增/跟进均无），
 * 当前以本地 mock 演示完整交互，页面顶部展示「暂未对接接口」提示
 */
import { useMemo, useState } from 'react'
import { Button, Card, DatePicker, Drawer, Input, Select, Table, Tag, App } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import dayjs, { type Dayjs } from 'dayjs'
import PageContainer from '@/components/PageContainer'
import {
  FOLLOW_RESULT_OPTIONS,
  FOLLOW_STATUS_MAP,
  FOLLOW_TYPE_OPTIONS,
  INSTITUTION_OPTIONS,
  INTENT_SOURCE_OPTIONS,
  MOVE_IN_OPTIONS,
  RECEPTION_MAP,
  mockIntents,
  mockStats,
  type AdmissionIntent,
} from './mock'
import './index.less'

/** 跟进状态标签配色 */
const FOLLOW_TAG_COLOR: Record<string, string> = {
  pending: 'orange',
  invited: 'blue',
  done: 'green',
  paused: 'default',
}

/** 接待结果标签配色 */
const RECEPTION_TAG_COLOR: Record<string, string> = {
  none: 'default',
  waiting: 'blue',
  arrived: 'green',
}

interface Filters {
  keyword: string
  institution?: string
  followStatus?: string
  date?: Dayjs | null
}

export default function AdmissionList() {
  const { message } = App.useApp()
  const [list, setList] = useState<AdmissionIntent[]>(mockIntents)
  const [filters, setFilters] = useState<Filters>({ keyword: '' })
  const [applied, setApplied] = useState<Filters>({ keyword: '' })
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  /* 新增意向抽屉 */
  const [createOpen, setCreateOpen] = useState(false)
  const [form, setForm] = useState({
    memberName: '',
    contactName: '',
    targetName: '',
    contactPhone: '',
    source: undefined as string | undefined,
    institution: undefined as string | undefined,
    expectedVisit: null as Dayjs | null,
    moveIn: undefined as string | undefined,
    demand: '',
  })

  /* 跟进记录抽屉 */
  const [followTarget, setFollowTarget] = useState<AdmissionIntent | null>(null)
  const [followForm, setFollowForm] = useState({
    type: undefined as string | undefined,
    result: undefined as string | undefined,
    nextTime: null as Dayjs | null,
    reception: undefined as string | undefined,
    remark: '',
  })

  const filtered = useMemo(
    () =>
      list.filter(
        (item) =>
          (!applied.keyword ||
            item.memberName.includes(applied.keyword) ||
            item.targetName.includes(applied.keyword) ||
            item.contactPhone.includes(applied.keyword)) &&
          (!applied.institution || item.institution === applied.institution) &&
          (!applied.followStatus || item.followStatus === applied.followStatus) &&
          (!applied.date || item.createdAt.startsWith(applied.date.format('MM-DD'))),
      ),
    [list, applied],
  )

  const paged = useMemo(
    () => filtered.slice((page - 1) * pageSize, page * pageSize),
    [filtered, page, pageSize],
  )

  const onSearch = () => {
    setApplied(filters)
    setPage(1)
  }
  const onReset = () => {
    setFilters({ keyword: '' })
    setApplied({ keyword: '' })
    setPage(1)
  }

  /** 保存登记（本地 mock） */
  const onCreate = () => {
    if (!form.memberName.trim() || !form.contactPhone.trim()) {
      message.warning('请填写注册会员与联系电话')
      return
    }
    if (!form.institution) {
      message.warning('请选择意向机构')
      return
    }
    const item: AdmissionIntent = {
      id: Date.now(),
      memberName: form.memberName.trim(),
      contactName: form.contactName.trim() || form.memberName.trim(),
      targetName: form.targetName.trim() || form.memberName.trim(),
      contactPhone: form.contactPhone.trim(),
      institution: form.institution,
      source: form.source ?? '健康咨询转运营',
      lastFollow: `${dayjs().format('MM-DD')} 登记意向`,
      followStatus: 'pending',
      reception: 'none',
      createdAt: dayjs().format('MM-DD HH:mm'),
      followRecords: form.demand.trim()
        ? [{ time: dayjs().format('MM-DD HH:mm'), title: '登记意向', content: form.demand.trim() }]
        : [],
    }
    setList((prev) => [item, ...prev])
    setCreateOpen(false)
    setForm({
      memberName: '',
      contactName: '',
      targetName: '',
      contactPhone: '',
      source: undefined,
      institution: undefined,
      expectedVisit: null,
      moveIn: undefined,
      demand: '',
    })
    message.success('入住意向已登记（本地演示，接口待对接）')
  }

  /** 保存跟进（本地 mock） */
  const onFollow = () => {
    if (!followTarget) return
    if (!followForm.type || !followForm.result) {
      message.warning('请选择跟进方式与跟进结果')
      return
    }
    const record = {
      time: dayjs().format('MM-DD HH:mm'),
      title: `${followForm.type}跟进`,
      content: followForm.remark.trim() || `跟进结果：${followForm.result}`,
    }
    setList((prev) =>
      prev.map((item) =>
        item.id === followTarget.id
          ? {
              ...item,
              followRecords: [record, ...item.followRecords],
              lastFollow: `${dayjs().format('MM-DD')} ${followForm.type}跟进`,
              followStatus:
                followForm.result === '已邀约到访'
                  ? 'invited'
                  : followForm.result === '暂缓'
                    ? 'paused'
                    : item.followStatus,
              reception: (followForm.reception as AdmissionIntent['reception']) ?? item.reception,
            }
          : item,
      ),
    )
    setFollowTarget((prev) =>
      prev ? { ...prev, followRecords: [record, ...prev.followRecords] } : prev,
    )
    setFollowForm({ type: undefined, result: undefined, nextTime: null, reception: undefined, remark: '' })
    message.success('跟进记录已保存（本地演示，接口待对接）')
  }

  const columns = [
    {
      title: '会员 / 联系人',
      key: 'member',
      render: (_: unknown, row: AdmissionIntent) => (
        <span>
          {row.memberName} / {row.targetName}
        </span>
      ),
    },
    { title: '联系方式', dataIndex: 'contactPhone', key: 'contactPhone', width: 130 },
    { title: '意向机构', dataIndex: 'institution', key: 'institution', width: 130 },
    { title: '来源', dataIndex: 'source', key: 'source', width: 120 },
    { title: '最近跟进', dataIndex: 'lastFollow', key: 'lastFollow', width: 140 },
    {
      title: '跟进状态',
      dataIndex: 'followStatus',
      key: 'followStatus',
      width: 100,
      render: (v: string) => <Tag color={FOLLOW_TAG_COLOR[v]}>{FOLLOW_STATUS_MAP[v]}</Tag>,
    },
    {
      title: '接待结果',
      dataIndex: 'reception',
      key: 'reception',
      width: 100,
      render: (v: string) => <Tag color={RECEPTION_TAG_COLOR[v]}>{RECEPTION_MAP[v]}</Tag>,
    },
    {
      title: '操作',
      key: 'action',
      width: 80,
      render: (_: unknown, row: AdmissionIntent) => (
        <Button size="small" onClick={() => setFollowTarget(row)}>
          {row.followStatus === 'done' ? '查看' : '跟进'}
        </Button>
      ),
    },
  ]

  return (
    <div className="ad-page">
      <PageContainer
        title="入住协同"
        description="登记会员入住意向并持续跟进，线下接待结果在此留痕"
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setCreateOpen(true)}>
            新增入住意向
          </Button>
        }
      >
        {/* 统计卡 */}
        <div className="ad-stats">
          {mockStats.map((s) => (
            <div key={s.label} className="ad-stat">
              <div className="ad-stat__label">{s.label}</div>
              <div className="ad-stat__value">
                {s.value}
                <span className={`ad-stat__sub ad-stat__sub--${s.tone}`}>{s.sub}</span>
              </div>
            </div>
          ))}
        </div>

        {/* 筛选区 */}
        <Card variant="borderless" className="filter-bar">
          <Input
            placeholder="会员姓名 / 手机号"
            value={filters.keyword}
            onChange={(e) => setFilters((f) => ({ ...f, keyword: e.target.value.trim() }))}
            allowClear
          />
          <Select
            placeholder="意向机构：全部"
            value={filters.institution}
            onChange={(v) => setFilters((f) => ({ ...f, institution: v }))}
            options={INSTITUTION_OPTIONS.map((o) => ({ value: o, label: o }))}
            allowClear
          />
          <Select
            placeholder="跟进状态：全部"
            value={filters.followStatus}
            onChange={(v) => setFilters((f) => ({ ...f, followStatus: v }))}
            options={Object.entries(FOLLOW_STATUS_MAP).map(([value, label]) => ({ value, label }))}
            allowClear
          />
          <DatePicker
            placeholder="登记日期"
            value={filters.date}
            onChange={(v) => setFilters((f) => ({ ...f, date: v }))}
          />
          <Button type="primary" onClick={onSearch}>
            查询
          </Button>
          <Button onClick={onReset}>重置</Button>
        </Card>

        {/* 意向列表 */}
        <Card variant="borderless" className="list-card table-fill">
          <Table<AdmissionIntent>
            rowKey="id"
            columns={columns}
            dataSource={paged}
            size="small"
            pagination={{
              current: page,
              pageSize,
              total: filtered.length,
              onChange: (nextPage, nextPageSize) => {
                setPage(nextPage)
                setPageSize(nextPageSize)
              },
              showTotal: (total) => `共 ${total} 条`,
            }}
          />
        </Card>
      </PageContainer>

      {/* 新增入住意向抽屉 */}
      <Drawer
        title="新增入住意向"
        width={520}
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        footer={
          <div className="ad-drawer__footer">
            <Button onClick={() => setCreateOpen(false)}>取消</Button>
            <Button type="primary" onClick={onCreate}>
              保存登记
            </Button>
          </div>
        }
      >
        <div className="ad-section__title">基础信息</div>
        <div className="ad-form__grid">
          <div className="ad-field">
            <div className="ad-field__label">注册会员</div>
            <Input
              placeholder="如：王先生 136****5021"
              value={form.memberName}
              onChange={(e) => setForm((f) => ({ ...f, memberName: e.target.value }))}
            />
          </div>
          <div className="ad-field">
            <div className="ad-field__label">联系人</div>
            <Input
              placeholder="如：王先生（家属）"
              value={form.contactName}
              onChange={(e) => setForm((f) => ({ ...f, contactName: e.target.value }))}
            />
          </div>
          <div className="ad-field">
            <div className="ad-field__label">服务对象</div>
            <Input
              placeholder="实际入住老人姓名"
              value={form.targetName}
              onChange={(e) => setForm((f) => ({ ...f, targetName: e.target.value }))}
            />
          </div>
          <div className="ad-field">
            <div className="ad-field__label">联系电话</div>
            <Input
              placeholder="手机号"
              value={form.contactPhone}
              onChange={(e) => setForm((f) => ({ ...f, contactPhone: e.target.value }))}
            />
          </div>
        </div>

        <div className="ad-section__title">入住意向</div>
        <div className="ad-form__grid">
          <div className="ad-field">
            <div className="ad-field__label">线索来源</div>
            <Select
              placeholder="请选择"
              value={form.source}
              onChange={(v) => setForm((f) => ({ ...f, source: v }))}
              options={INTENT_SOURCE_OPTIONS.map((o) => ({ value: o, label: o }))}
            />
          </div>
          <div className="ad-field">
            <div className="ad-field__label">意向机构</div>
            <Select
              placeholder="请选择"
              value={form.institution}
              onChange={(v) => setForm((f) => ({ ...f, institution: v }))}
              options={INSTITUTION_OPTIONS.map((o) => ({ value: o, label: o }))}
            />
          </div>
          <div className="ad-field">
            <div className="ad-field__label">期望到访日期</div>
            <DatePicker
              style={{ width: '100%' }}
              value={form.expectedVisit}
              onChange={(v) => setForm((f) => ({ ...f, expectedVisit: v }))}
            />
          </div>
          <div className="ad-field">
            <div className="ad-field__label">入住时间意向</div>
            <Select
              placeholder="请选择"
              value={form.moveIn}
              onChange={(v) => setForm((f) => ({ ...f, moveIn: v }))}
              options={MOVE_IN_OPTIONS.map((o) => ({ value: o, label: o }))}
            />
          </div>
        </div>
        <div className="ad-field">
          <div className="ad-field__label">需求说明</div>
          <Input.TextArea
            rows={3}
            placeholder="需要了解护理环境、服务内容和收费标准"
            value={form.demand}
            onChange={(e) => setForm((f) => ({ ...f, demand: e.target.value }))}
          />
        </div>
        <div className="ad-note">一期仅登记意向与跟进，不处理床位、合同、费用和正式入住办理。</div>
      </Drawer>

      {/* 入住意向跟进抽屉 */}
      <Drawer
        title="入住意向跟进"
        width={520}
        open={!!followTarget}
        onClose={() => setFollowTarget(null)}
        footer={
          <div className="ad-drawer__footer">
            <Button onClick={() => setFollowTarget(null)}>取消</Button>
            <Button type="primary" onClick={onFollow}>
              保存跟进
            </Button>
          </div>
        }
      >
        {followTarget && (
          <>
            <div className="ad-follow__member">
              <div className="ad-follow__member-main">
                <span className="ad-follow__member-name">{followTarget.contactName}</span>
                <span>{followTarget.contactPhone}</span>
              </div>
              <div className="ad-follow__member-sub">
                服务对象：{followTarget.targetName}　意向机构：{followTarget.institution}
              </div>
              <div className="ad-follow__member-sub">
                来源：{followTarget.source}　登记时间：{followTarget.createdAt}
              </div>
            </div>

            <div className="ad-section__title">跟进记录</div>
            <div className="ad-records">
              {followTarget.followRecords.length === 0 && (
                <div className="ad-records__empty">暂无跟进记录</div>
              )}
              {followTarget.followRecords.map((r) => (
                <div key={r.time + r.title} className="ad-record">
                  <div className="ad-record__head">
                    <span className="ad-record__time">{r.time}</span>
                    <span className="ad-record__title">{r.title}</span>
                  </div>
                  <div className="ad-record__content">{r.content}</div>
                </div>
              ))}
            </div>

            <div className="ad-section__title">新增跟进</div>
            <div className="ad-form__grid">
              <div className="ad-field">
                <div className="ad-field__label">跟进方式</div>
                <Select
                  placeholder="请选择"
                  value={followForm.type}
                  onChange={(v) => setFollowForm((f) => ({ ...f, type: v }))}
                  options={FOLLOW_TYPE_OPTIONS.map((o) => ({ value: o, label: o }))}
                />
              </div>
              <div className="ad-field">
                <div className="ad-field__label">跟进结果</div>
                <Select
                  placeholder="请选择"
                  value={followForm.result}
                  onChange={(v) => setFollowForm((f) => ({ ...f, result: v }))}
                  options={FOLLOW_RESULT_OPTIONS.map((o) => ({ value: o, label: o }))}
                />
              </div>
              <div className="ad-field">
                <div className="ad-field__label">下次跟进时间</div>
                <DatePicker
                  showTime
                  style={{ width: '100%' }}
                  value={followForm.nextTime}
                  onChange={(v) => setFollowForm((f) => ({ ...f, nextTime: v }))}
                />
              </div>
              <div className="ad-field">
                <div className="ad-field__label">线下接待结果</div>
                <Select
                  placeholder="请选择"
                  value={followForm.reception}
                  onChange={(v) => setFollowForm((f) => ({ ...f, reception: v }))}
                  options={Object.entries(RECEPTION_MAP).map(([value, label]) => ({ value, label }))}
                />
              </div>
            </div>
            <div className="ad-field">
              <div className="ad-field__label">跟进备注</div>
              <Input.TextArea
                rows={3}
                placeholder="家属计划带老人一同参观，重点了解护理服务。"
                value={followForm.remark}
                onChange={(e) => setFollowForm((f) => ({ ...f, remark: e.target.value }))}
              />
            </div>
          </>
        )}
      </Drawer>
    </div>
  )
}
