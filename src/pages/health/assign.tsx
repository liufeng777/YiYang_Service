/**
 * 健康档案 - 分配管理团队（设计稿：单个患者.png / 分配成功.png）
 * 为服务对象选择健康管理团队并指定责任医生 / 护士 / 健康管理师
 * TODO: 分配接口 API v0.1 未定义，当前为本地 mock
 */
import { useState } from 'react'
import { Button, Select } from 'antd'
import { ArrowLeftOutlined, CheckOutlined, LeftOutlined } from '@ant-design/icons'
import { useNavigate, useParams } from 'react-router-dom'
import PageContainer from '@/components/PageContainer'
import { mockAssign, mockCreateSuccess } from './mock'
import './index.less'

/** 分配成功视图（设计稿：分配成功.png） */
function AssignSuccess({ id }: { id: string }) {
  const navigate = useNavigate()
  const s = mockCreateSuccess
  return (
    <div className="hr-success">
      <div className="hr-success__card">
        <div className="hr-success__icon">
          <CheckOutlined />
        </div>
        <div className="hr-success__title">管理团队分配成功</div>
        <div className="hr-success__subtitle">档案编号：{s.profileNo}</div>

        <div className="hr-success__member">
          <div className="hr-success__avatar">{s.name.slice(0, 1)}</div>
          <div>
            <div className="hr-success__name">
              {s.name} · {s.gender} · {s.age}岁
            </div>
            <div className="hr-success__meta">
              {s.org} · {s.identity} · 建档来源：{s.source}
            </div>
            <div className="hr-success__tags">
              {s.tags.map((t) => (
                <span key={t} className="hr-tag hr-tag--risk-low">
                  {t}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="hr-success__banner">
          <div>
            <div className="hr-success__banner-title">管理归属已写入</div>
            <div className="hr-success__banner-sub">已同步运营所需字段，医疗健康明细仍按专业权限管理</div>
          </div>
          <span className="hr-success__banner-status">同步正常</span>
        </div>

        <div className="hr-success__note">已进入责任健康管理师待完善任务。</div>
        <div className="hr-success__actions">
          <Button icon={<ArrowLeftOutlined />} color="primary" variant="outlined" onClick={() => navigate('/health-record')}>返回档案列表</Button>
          <Button type="primary" onClick={() => navigate(`/health-record/${id}`)}>
            完善健康档案
          </Button>
        </div>
      </div>
    </div>
  )
}

export default function HealthAssign() {
  const { id } = useParams()
  const navigate = useNavigate()
  const memberId = id ?? '1'
  const [team, setTeam] = useState<string>()
  const [doctor, setDoctor] = useState<string>()
  const [nurse, setNurse] = useState<string>()
  const [manager, setManager] = useState<string>()
  const [done, setDone] = useState(false)
  const m = mockAssign.member

  if (done) {
    return (
      <div className="hr-page">
        <PageContainer
          title="分配管理团队"
          description="管理团队与责任人已生效，可继续完善健康档案"
          extra={
            <Button icon={<ArrowLeftOutlined />} color="primary" variant="outlined" onClick={() => navigate('/health-record')}>
              返回档案列表
            </Button>
          }
        >
          <AssignSuccess id={memberId} />
        </PageContainer>
      </div>
    )
  }

  const toOptions = (list: string[]) => list.map((v) => ({ value: v, label: v }))
  const ready = team && doctor && nurse && manager

  return (
    <div className="hr-page">
      <PageContainer
        title="分配管理团队"
        description="为当前服务对象选择有效健康管理团队，并指定责任医生、护士和健康管理师"
      >
        <div className="hr-assign">
          {/* 当前服务对象 */}
          <div className="hr-card hr-assign__member">
            <div className="hr-card__title">当前服务对象</div>
            <div className="hr-assign__member-row">
              <span className="hr-assign__member-name">
                {m.name} · {m.gender} · {m.age}岁
              </span>
              <span className="hr-assign__member-info">
                {m.risk}｜{m.diseases}
              </span>
              <span className="hr-text--primary">{m.status}</span>
            </div>
          </div>

          {/* 团队与责任人 */}
          <div className="hr-card hr-assign__form">
            <div className="hr-card__title">团队与责任人</div>
            <div className="hr-assign__fields">
              <div className="hr-assign__field">
                <div className="hr-create__field-label">
                  管理团队 <span className="hr-required">*</span>
                </div>
                <Select placeholder="请选择" value={team} onChange={setTeam} options={toOptions(mockAssign.teams)} />
              </div>
              <div className="hr-assign__field">
                <div className="hr-create__field-label">
                  责任医生 <span className="hr-required">*</span>
                </div>
                <Select placeholder="请选择" value={doctor} onChange={setDoctor} options={toOptions(mockAssign.doctors)} />
              </div>
              <div className="hr-assign__field">
                <div className="hr-create__field-label">
                  责任护士 <span className="hr-required">*</span>
                </div>
                <Select placeholder="请选择" value={nurse} onChange={setNurse} options={toOptions(mockAssign.nurses)} />
              </div>
              <div className="hr-assign__field">
                <div className="hr-create__field-label">责任健康管理师 <span className="hr-required">*</span></div>
                <Select placeholder="请选择" value={manager} onChange={setManager} options={toOptions(mockAssign.managers)} />
              </div>
            </div>

            <div className="hr-assign__note">
              <div className="hr-assign__note-title">分配说明</div>
              责任人必须来自所选团队；确认后分别承接目标制定、方案审核、档案完善和随访任务。
            </div>

            <div className="hr-create__actions">
              <Button onClick={() => navigate(-1)}>取消</Button>
              <Button type="primary" disabled={!ready} onClick={() => setDone(true)}>
                确认分配
              </Button>
            </div>
          </div>
        </div>

        <div className="hr-footnote hr-footnote--green">
          确认后写入管理团队及三类责任人；保留分配人、时间和变更记录，支持后续重新分配。
        </div>
      </PageContainer>
    </div>
  )
}
