/**
 * 健康活动 - 现场签到（设计稿：现场签到.png）
 * 按报名名单或手机号完成签到，临时到场人员可补登记
 * TODO: 现场签到接口 API v0.1 未定义，待后端补充
 */
import { useMemo, useState } from 'react'
import { Button, Input, Modal, Table, message } from 'antd'
import { PlusOutlined, SearchOutlined } from '@ant-design/icons'
import PageContainer from '@/components/PageContainer'
import { mockCheckinList, mockCheckinStats, type MockCheckinRow } from './mock'
import './index.less'

export default function ActivityCheckin() {
  const [keyword, setKeyword] = useState('')
  const [list, setList] = useState(mockCheckinList)
  const [walkInOpen, setWalkInOpen] = useState(false)
  const [walkInName, setWalkInName] = useState('')
  const [walkInPhone, setWalkInPhone] = useState('')

  const filtered = useMemo(
    () =>
      list.filter(
        (row) => !keyword || row.name.includes(keyword) || row.phone.includes(keyword),
      ),
    [list, keyword],
  )

  const checkin = (row: MockCheckinRow) => {
    // TODO: 签到接口待后端补充
    setList((l) =>
      l.map((r) => (r.id === row.id ? { ...r, checkedInAt: '现在' } : r)),
    )
    message.success(`${row.name} 已签到`)
  }

  const undo = (row: MockCheckinRow) => {
    setList((l) => l.map((r) => (r.id === row.id ? { ...r, checkedInAt: null } : r)))
    message.success(`已撤销 ${row.name} 的签到`)
  }

  const onWalkIn = () => {
    if (!walkInName.trim() || !walkInPhone.trim()) {
      message.warning('请填写姓名与手机号')
      return
    }
    // TODO: 临时到场补登记接口待后端补充
    setList((l) => [
      ...l,
      {
        id: `WI${Date.now()}`,
        name: walkInName,
        phone: walkInPhone,
        accountType: '待校验',
        profileStatus: '待校验',
        confirmStatus: '已确认',
        checkedInAt: '现在',
      },
    ])
    message.success('临时到场人员已补登记并完成签到')
    setWalkInOpen(false)
    setWalkInName('')
    setWalkInPhone('')
  }

  const stats = [
    { label: '报名', value: mockCheckinStats.signed },
    { label: '已确认', value: mockCheckinStats.confirmed },
    { label: '已签到', value: mockCheckinStats.checkedIn },
    { label: '未签到', value: mockCheckinStats.notCheckedIn },
    { label: '临时到场', value: mockCheckinStats.walkIn },
  ]

  const columns = [
    {
      title: '参与人',
      dataIndex: 'name',
      key: 'name',
      render: (v: string) => <span className="ac-row__name">{v}</span>,
    },
    { title: '手机号', dataIndex: 'phone', key: 'phone' },
    { title: '账号身份', dataIndex: 'accountType', key: 'accountType' },
    { title: '档案状态', dataIndex: 'profileStatus', key: 'profileStatus' },
    {
      title: '确认状态',
      key: 'confirmStatus',
      render: (_: unknown, row: MockCheckinRow) => (
        <span className={row.confirmStatus === '待再次联系' ? 'ac-text--warn' : undefined}>
          {row.confirmStatus}
        </span>
      ),
    },
    {
      title: '签到状态',
      key: 'checkedInAt',
      render: (_: unknown, row: MockCheckinRow) =>
        row.checkedInAt ? (
          <span className="ac-text--success">已签到 {row.checkedInAt}</span>
        ) : (
          <span className="ac-row__sub">未签到</span>
        ),
    },
    {
      title: '操作',
      key: 'action',
      width: 120,
      render: (_: unknown, row: MockCheckinRow) =>
        row.checkedInAt ? (
          <Button type="link" size="small" onClick={() => undo(row)}>
            撤销
          </Button>
        ) : row.confirmStatus === '待再次联系' ? (
          <Button type="link" size="small" onClick={() => checkin(row)}>
            签到并补充
          </Button>
        ) : (
          <Button type="link" size="small" onClick={() => checkin(row)}>
            签到
          </Button>
        ),
    },
  ]

  return (
    <div className="ac-page">
      <PageContainer
        title="现场签到"
        description="按报名名单或手机号完成签到，临时到场人员可补登记"
      >
        {/* 统计条 */}
        <div className="ac-checkin-stats">
          {stats.map((s) => (
            <div key={s.label} className="ac-checkin-stat">
              <div className="ac-checkin-stat__label">{s.label}</div>
              <div className="ac-checkin-stat__value">{s.value}</div>
            </div>
          ))}
        </div>

        {/* 搜索 */}
        <div className="ac-filters">
          <Input
            className="ac-filters__search"
            prefix={<SearchOutlined />}
            placeholder="输入姓名、手机号或会员ID"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value.trim())}
            allowClear
          />
          <div className="ac-filters__actions">
            <Button type="primary">查询</Button>
            <Button icon={<PlusOutlined />} onClick={() => setWalkInOpen(true)}>
              临时到场
            </Button>
          </div>
        </div>

        {/* 签到表格 */}
        <div className="ac-list">
          <Table<MockCheckinRow>
            rowKey="id"
            columns={columns}
            dataSource={filtered}
            pagination={false}
          />
        </div>
      </PageContainer>

      <Modal
        open={walkInOpen}
        title="临时到场补登记"
        onCancel={() => setWalkInOpen(false)}
        onOk={onWalkIn}
        okText="登记并签到"
      >
        <div className="ac-field">
          <div className="ac-field__label">
            姓名 <span className="ac-required">*</span>
          </div>
          <Input value={walkInName} onChange={(e) => setWalkInName(e.target.value)} />
        </div>
        <div className="ac-field">
          <div className="ac-field__label">
            手机号 <span className="ac-required">*</span>
          </div>
          <Input value={walkInPhone} onChange={(e) => setWalkInPhone(e.target.value)} />
        </div>
        <div className="ac-note-blue">补登记后系统自动校验身份；无档案者将按规则创建“待跟进”线索。</div>
      </Modal>
    </div>
  )
}
