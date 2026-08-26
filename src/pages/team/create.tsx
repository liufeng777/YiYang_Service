/**
 * 团队管理 - 新建/编辑团队（设计稿：新建编辑团队.png + 选择人员抽屉.png）
 * 建立机构健康管理团队，维护医生、护士和健康管理师成员池
 * TODO: 团队管理接口 API v0.1 未定义，待后端补充
 */
import { useMemo, useState } from 'react'
import { Button, Drawer, Input, Switch, message } from 'antd'
import { CheckOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import PageContainer from '@/components/PageContainer'
import {
  TEAM_ROLE_TEXT,
  mockTeamCreate as c,
  type TeamRole,
} from './mock'
import './index.less'

const ROLE_BADGE: Record<TeamRole, string> = { doctor: '医', nurse: '护', manager: '健' }
const TEAM_STATE_TEXT = { in: '已在本团队', other: '在其他团队', none: '未分配团队' } as const

export default function TeamCreate() {
  const navigate = useNavigate()
  const [name, setName] = useState('城东慢病管理三组')
  const [enabled, setEnabled] = useState(true)
  const [drawerRole, setDrawerRole] = useState<TeamRole | null>(null)
  const [drawerTab, setDrawerTab] = useState<TeamRole>('nurse')
  const [keyword, setKeyword] = useState('')
  const [picked, setPicked] = useState<string[]>(
    c.candidates.filter((m) => m.teamState === 'in').map((m) => m.id),
  )

  const candidates = useMemo(
    () =>
      c.candidates.filter((m) => {
        if (m.role !== drawerTab) return false
        if (keyword && ![m.name, m.phone].some((v) => v.includes(keyword))) return false
        return true
      }),
    [drawerTab, keyword],
  )

  const openDrawer = (role: TeamRole) => {
    setDrawerRole(role)
    setDrawerTab(role)
    setKeyword('')
  }

  const onSave = () => {
    if (!name.trim()) {
      message.warning('请填写团队名称')
      return
    }
    // TODO: 团队创建/编辑接口待后端补充
    message.success('团队已保存，成员将成为建档时的责任人候选（演示）')
    navigate('/team')
  }

  return (
    <div className="team-page">
      <PageContainer title="新建团队" description="建立机构健康管理团队，维护医生、护士和健康管理师成员池">
        <div className="team-note team-note--green">{c.banner}</div>

        {/* 团队基本信息 */}
        <div className="team-card">
          <div className="team-section__title">团队基本信息</div>
          <div className="team-form__grid">
            <div className="team-field">
              <div className="team-field__label">
                团队名称 <span className="team-required">*</span>
              </div>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="请输入团队名称" />
            </div>
            <div className="team-field">
              <div className="team-field__label">所属机构</div>
              <Input value={c.currentOrg} disabled />
            </div>
            <div className="team-field">
              <div className="team-field__label">团队状态</div>
              <div className="team-field__switch">
                <Switch checked={enabled} onChange={setEnabled} />
                <span>{enabled ? '启用' : '停用'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* 团队成员 */}
        <div className="team-card">
          <div className="team-section__title">团队成员</div>
          <div className="team-card__sub">
            仅选择当前机构状态有效的医生、护士、健康管理师；这些成员将成为建档时的责任人候选。
          </div>
          {c.roles.map((r) => (
            <div key={r.key} className="team-role">
              <div className={`team-role__badge team-role__badge--${r.key}`}>{ROLE_BADGE[r.key]}</div>
              <div className="team-role__info">
                <div className="team-role__name">{TEAM_ROLE_TEXT[r.key]}</div>
                <div className="team-role__desc">{r.desc}</div>
              </div>
              <div className="team-role__selected">
                <div className="team-role__selected-label">已选成员</div>
                <div className="team-role__selected-names">{r.selected.join('、')}</div>
              </div>
              <span className={`team-tag team-tag--${r.tagTone}`}>{r.tag}</span>
              <Button onClick={() => openDrawer(r.key)}>选择人员</Button>
            </div>
          ))}
          <div className="team-note">{c.footerNote}</div>
        </div>

        <div className="team-create__actions">
          <Button onClick={() => navigate('/team')}>取消</Button>
          <Button type="primary" onClick={onSave}>
            保存团队
          </Button>
        </div>
      </PageContainer>

      {/* 选择人员抽屉 */}
      <Drawer
        open={drawerRole !== null}
        onClose={() => setDrawerRole(null)}
        width={560}
        closable={false}
        title={
          <div className="team-drawer__head">
            <div>
              <div className="team-drawer__title">选择团队成员</div>
              <div className="team-drawer__sub">仅显示当前机构状态有效的医生、护士、健康管理师</div>
            </div>
            <Button onClick={() => setDrawerRole(null)}>关闭</Button>
          </div>
        }
        footer={
          <div className="team-drawer__footer">
            <span>已选择 {picked.length} 人</span>
            <div className="team-drawer__footer-actions">
              <Button onClick={() => setDrawerRole(null)}>取消</Button>
              <Button
                type="primary"
                onClick={() => {
                  message.success('已更新团队成员选择（演示）')
                  setDrawerRole(null)
                }}
              >
                确认选择
              </Button>
            </div>
          </div>
        }
      >
        <div className="team-drawer__tabs">
          {(Object.keys(TEAM_ROLE_TEXT) as TeamRole[]).map((r) => (
            <Button
              key={r}
              type={drawerTab === r ? 'primary' : 'default'}
              onClick={() => setDrawerTab(r)}
            >
              {TEAM_ROLE_TEXT[r]}
            </Button>
          ))}
        </div>
        <Input
          placeholder="搜索姓名、手机号或工号"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value.trim())}
          allowClear
          className="team-drawer__search"
        />
        <div className="team-drawer__count">
          {TEAM_ROLE_TEXT[drawerTab]} · 可选择 {candidates.length} 人
        </div>
        {candidates.map((m) => {
          const checked = picked.includes(m.id)
          return (
            <div
              key={m.id}
              className={`team-candidate${checked ? ' team-candidate--checked' : ''}`}
              onClick={() =>
                setPicked((l) => (l.includes(m.id) ? l.filter((x) => x !== m.id) : [...l, m.id]))
              }
            >
              <div className="team-candidate__avatar">{m.name[0]}</div>
              <div className="team-candidate__info">
                <div className="team-candidate__name">{m.name}</div>
                <div className="team-candidate__meta">
                  {TEAM_ROLE_TEXT[m.role]} · {m.phone}
                </div>
              </div>
              <span className={`team-tag team-tag--${m.teamState === 'in' ? 'green' : m.teamState === 'other' ? 'orange' : 'blue'}`}>
                {TEAM_STATE_TEXT[m.teamState]}
              </span>
              <span className={`team-candidate__check${checked ? ' team-candidate__check--on' : ''}`}>
                {checked && <CheckOutlined />}
              </span>
            </div>
          )
        })}
      </Drawer>
    </div>
  )
}
