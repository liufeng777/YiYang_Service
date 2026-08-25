/**
 * 选择机构页（设计稿：登录成功后选择本次进入的机构）
 * 当前为 mock 数据，接入真实后端后替换为查询可访问机构接口
 */
import { useMemo, useState } from 'react'
import { Button, Checkbox, Input, Switch, Tag, App } from 'antd'
import { PlusOutlined, SearchOutlined, RightOutlined, CheckOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { useUserStore, maskPhone, type OrgInfo } from '@/store/modules/user'
import './index.less'

/** Mock：当前用户可访问的机构列表（设计稿示例数据） */
const mockOrgs: OrgInfo[] = [
  {
    id: 1,
    name: '城东颐养中心',
    type: '医养结合机构',
    roleTag: '健康管理师',
    scope: '本机构健康档案及管理任务',
    scopeDetail: '慢病管理 · 上门护理 · 健康评估',
    lastVisit: '2026-08-10 09:12',
  },
  {
    id: 2,
    name: '幸福护理院',
    type: '护理院',
    roleTag: '协同健康管理师',
    scope: '授权服务对象及协同任务',
    scopeDetail: '入住照护 · 护理服务 · 康复支持',
    lastVisit: '2026-08-07 16:40',
  },
  {
    id: 3,
    name: '康复照护中心',
    type: '康复机构',
    roleTag: '项目协调员',
    scope: '康复项目与服务工单',
    scopeDetail: '康复评估 · 训练计划 · 居家康复',
    lastVisit: '2026-08-05 10:18',
  },
]

export default function SelectOrg() {
  const navigate = useNavigate()
  const { message } = App.useApp()
  const userInfo = useUserStore((state) => state.userInfo)
  const logout = useUserStore((state) => state.logout)
  const setCurrentOrg = useUserStore((state) => state.setCurrentOrg)

  const [keyword, setKeyword] = useState('')
  const [onlyMine, setOnlyMine] = useState(true)
  const [selectedId, setSelectedId] = useState<OrgInfo['id']>(mockOrgs[0].id)
  const [remember, setRemember] = useState(true)

  const orgs = useMemo(
    () => mockOrgs.filter((org) => !keyword || org.name.includes(keyword)),
    [keyword],
  )
  const selectedOrg = mockOrgs.find((org) => org.id === selectedId)

  const onEnter = () => {
    if (!selectedOrg) {
      message.warning('请先选择要进入的机构')
      return
    }
    // TODO: 「记住本次选择」接入真实后端后由偏好设置接口处理；mock 下始终记录当前机构
    void remember
    setCurrentOrg(selectedOrg)
    message.success(`已进入${selectedOrg.name}`)
    navigate('/workbench', { replace: true })
  }

  const onLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <div className="select-org">
      {/* 顶部导航 */}
      <header className="select-org__header">
        <div className="select-org__brand">
          <span className="select-org__logo">
            <PlusOutlined />
          </span>
          <div>
            <div className="select-org__brand-name">幸福颐养</div>
            <div className="select-org__brand-sub">医养服务工作台</div>
          </div>
        </div>
        <div className="select-org__user">
          <span className="select-org__avatar">{(userInfo?.nickname ?? '用')[0]}</span>
          <div className="select-org__user-info">
            <div className="select-org__user-name">{userInfo?.nickname ?? '用户'}</div>
            <div className="select-org__user-account">
              账号 {userInfo ? maskPhone(userInfo.phone) : ''}
            </div>
          </div>
          <Button type="link" className="select-org__logout" onClick={onLogout}>
            退出登录
          </Button>
        </div>
      </header>

      <main className="select-org__body">
        <div className="select-org__title-row">
          <div>
            <h1 className="select-org__title">选择本次进入的机构</h1>
            <p className="select-org__subtitle">
              当前租户：幸福颐养AI数字化医养服务平台 · 共 {mockOrgs.length} 个可访问机构
            </p>
          </div>
          <Input
            className="select-org__search"
            placeholder="搜索机构名称"
            prefix={<SearchOutlined />}
            allowClear
            onChange={(e) => setKeyword(e.target.value.trim())}
          />
        </div>

        <div className="select-org__banner">
          <span>机构决定本次会话的数据范围、角色权限和待办任务；进入后仍可在顶部切换。</span>
          <span className="select-org__banner-filter">
            仅显示我有权限的机构
            <Switch checked={onlyMine} onChange={setOnlyMine} size="small" />
          </span>
        </div>

        {/* 机构卡片 */}
        <div className="select-org__cards">
          {orgs.map((org) => {
            const selected = org.id === selectedId
            return (
              <div
                key={org.id}
                className={`org-card${selected ? ' org-card--selected' : ''}`}
                onClick={() => setSelectedId(org.id)}
              >
                {selected && (
                  <span className="org-card__badge">
                    <CheckOutlined /> 已选择
                  </span>
                )}
                <span className="org-card__icon">{org.name[0]}</span>
                <div className="org-card__name">{org.name}</div>
                <div className="org-card__tags">
                  <Tag className="org-card__tag org-card__tag--type">{org.type}</Tag>
                  <Tag className="org-card__tag org-card__tag--role">{org.roleTag}</Tag>
                </div>
                <div className="org-card__scope">
                  <div className="org-card__scope-label">数据范围</div>
                  <div className="org-card__scope-main">{org.scope}</div>
                  <div className="org-card__scope-detail">{org.scopeDetail}</div>
                </div>
                <div className="org-card__visit">最近访问：{org.lastVisit}</div>
                <div className="org-card__action">
                  {selected ? (
                    <span className="org-card__current">当前选择</span>
                  ) : (
                    <span className="org-card__pick">
                      选择此机构 <RightOutlined />
                    </span>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* 底部操作 */}
        <div className="select-org__footer">
          <Checkbox checked={remember} onChange={(e) => setRemember(e.target.checked)}>
            记住本次选择，下次登录优先进入{selectedOrg?.name ?? ''}
          </Checkbox>
          <Button type="primary" className="select-org__enter" onClick={onEnter}>
            进入{selectedOrg?.name ?? '机构'}
          </Button>
          <p className="select-org__note">机构管理员可在运营管理平台维护机构信息和成员权限</p>
        </div>
      </main>
    </div>
  )
}
