/**
 * 团队管理 - 批量分配管理团队（设计稿：批量分配确认.png）
 * 为所选服务对象选择一个当前机构有效团队，并确认具体健康管理师
 * TODO: 患者分配接口 API v0.1 未定义，待后端补充
 */
import { useState } from 'react'
import { Button, Select, message } from 'antd'
import { useNavigate } from 'react-router-dom'
import PageContainer from '@/components/PageContainer'
import { mockAssign as a } from './mock'
import './index.less'

export default function TeamAssign() {
  const navigate = useNavigate()
  const [patients, setPatients] = useState(a.patients)
  const [team, setTeam] = useState(a.teams[0])
  const [manager, setManager] = useState(a.managers[0])

  const onConfirm = () => {
    if (patients.length === 0) {
      message.warning('请至少保留 1 位服务对象')
      return
    }
    if (!team || !manager) {
      message.warning('请选择管理团队与健康管理师')
      return
    }
    // TODO: 分配接口待后端补充；确认后写入团队、责任医生和健康管理师
    message.success(`已为 ${patients.length} 位服务对象分配团队与健康管理师（演示）`)
    navigate('/team/unassigned')
  }

  return (
    <div className="team-page">
      <PageContainer
        title="批量分配管理团队"
        description="为所选服务对象选择一个当前机构有效团队，并确认具体健康管理师"
      >
        <div className="team-assign">
          {/* 左：已选择服务对象 */}
          <div className="team-card">
            <div className="team-section__title">已选择服务对象（{patients.length}人）</div>
            {patients.map((p) => (
              <div key={p.id} className="team-assign__patient">
                <span className="team-row__name">{p.name}</span>
                <span className="team-text--muted">{p.risk}</span>
                <span
                  className="team-text--link"
                  onClick={() => setPatients((l) => l.filter((x) => x.id !== p.id))}
                >
                  移除
                </span>
              </div>
            ))}
          </div>

          {/* 右：分配设置 */}
          <div className="team-card">
            <div className="team-section__title">分配设置</div>
            <div className="team-field">
              <div className="team-field__label">
                管理团队 <span className="team-required">*</span>
              </div>
              <Select
                value={team}
                onChange={setTeam}
                options={a.teams.map((v) => ({ value: v, label: v }))}
              />
            </div>
            <div className="team-field">
              <div className="team-field__label">团队成员与负荷</div>
              <div className="team-assign__loads">
                {a.members.map((m) => (
                  <div key={m.role} className="team-assign__load">
                    <span className="team-text--muted">{m.role}</span>
                    <span>{m.name}</span>
                    <span className="team-text--muted">{m.load}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="team-field">
              <div className="team-field__label">
                健康管理师 <span className="team-required">*</span>
              </div>
              <Select
                value={manager}
                onChange={setManager}
                options={a.managers.map((v) => ({ value: v, label: v }))}
              />
            </div>
            <div className="team-assign__suggest">
              <div className="team-assign__suggest-title">系统建议</div>
              <div className="team-assign__suggest-desc">{a.suggest}</div>
            </div>
            <div className="team-create__actions">
              <Button onClick={() => navigate('/team/unassigned')}>取消</Button>
              <Button type="primary" onClick={onConfirm}>
                确认分配
              </Button>
            </div>
          </div>
        </div>

        <div className="team-note team-note--green">{a.footerNote}</div>
      </PageContainer>
    </div>
  )
}
