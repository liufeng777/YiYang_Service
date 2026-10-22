/**
 * 选择机构页（顶栏「切换机构」入口）
 * 数据源：登录接口返回的 staff.institutions（institution_name / brief / last_login_at / position_name），
 * 直接渲染机构卡片，无需调用机构详情接口
 */
import { useMemo, useState } from 'react'
import { Button, Checkbox, Empty, Input, Switch, Tag, App } from 'antd'
import { PlusOutlined, SearchOutlined, RightOutlined, CheckOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import {
  useUserStore,
  maskPhone,
  resolvePositionCode,
  staffInstitutionToOrg,
  type OrgInfo,
} from '@/store/modules/user'
import { authApi } from '@/api'
import './index.less'

export default function SelectOrg() {
  const navigate = useNavigate()
  const { message } = App.useApp()
  const userInfo = useUserStore((state) => state.userInfo)
  const institutions = useUserStore((state) => state.institutions)
  const logout = useUserStore((state) => state.logout)
  const setCurrentOrg = useUserStore((state) => state.setCurrentOrg)
  const setToken = useUserStore((state) => state.setToken)
  const setUserInfo = useUserStore((state) => state.setUserInfo)
  const currentOrg = useUserStore((state) => state.currentOrg)

  const orgs = useMemo(
    () => institutions.map((item) => staffInstitutionToOrg(item, userInfo?.positionName ?? '')),
    [institutions, userInfo?.positionName],
  )

  const [keyword, setKeyword] = useState('')
  const [onlyMine, setOnlyMine] = useState(true)
  const [selectedId, setSelectedId] = useState<OrgInfo['id'] | undefined>()
  const [remember, setRemember] = useState(true)
  const [entering, setEntering] = useState(false)

  const filteredOrgs = useMemo(
    () => orgs.filter((org) => !keyword || org.name.includes(keyword)),
    [orgs, keyword],
  )
  // 默认选中当前机构（顶栏「切换机构」进入时）
  const selectedOrg = orgs.find((org) => org.id === (selectedId ?? currentOrg?.id ?? orgs[0]?.id))

  const onEnter = async () => {
    if (!selectedOrg) {
      message.warning('请先选择要进入的机构')
      return
    }
    // TODO: 「记住本次选择」接入偏好设置接口后生效；当前仅记录当前机构
    void remember
    setEntering(true)
    try {
      // 切换机构：换取绑定目标机构的新 JWT 与该机构岗位、权限码（staffPermissions 子集）
      const res = await authApi.switchInstitution({ institution_id: Number(selectedOrg.id) })
      setToken(res.token)
      if (userInfo) {
        // 切换机构返回嵌套 position { id, code }，兼容平铺 position_code
        const positionCode = resolvePositionCode(
          res.position?.code ?? res.position_code,
        )
        setUserInfo({
          ...userInfo,
          positionCode,
          positionName: res.position_name || selectedOrg.roleTag,
          institutionName: selectedOrg.name,
          permissions:
            res.permissions && res.permissions.length > 0
              ? res.permissions
              : userInfo.permissions,
        })
      }
      setCurrentOrg(selectedOrg)
      message.success(`已进入${selectedOrg.name}`)
      navigate('/workbench', { replace: true })
    } catch {
      // 错误提示由拦截器统一处理，切换失败不进入
    } finally {
      setEntering(false)
    }
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
              当前租户：幸福颐养AI数字化医养服务平台 · 共 {orgs.length} 个可访问机构
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
        {filteredOrgs.length === 0 ? (
          <Empty
            description={orgs.length === 0 ? '当前账号暂无可访问机构' : '未找到匹配的机构'}
            style={{ margin: '80px auto' }}
          />
        ) : (
          <div className="select-org__cards">
            {filteredOrgs.map((org) => {
              const selected = org.id === selectedOrg?.id
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
                    {org.type && (
                      <Tag className="org-card__tag org-card__tag--type">{org.type}</Tag>
                    )}
                    {org.roleTag && (
                      <Tag className="org-card__tag org-card__tag--role">{org.roleTag}</Tag>
                    )}
                  </div>
                  {(org.scope || org.scopeDetail) && (
                    <div className="org-card__scope">
                      <div className="org-card__scope-label">数据范围</div>
                      <div className="org-card__scope-main">{org.scope}</div>
                      <div className="org-card__scope-detail">{org.scopeDetail}</div>
                    </div>
                  )}
                  {org.lastVisit && <div className="org-card__visit">最近访问：{org.lastVisit}</div>}
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
        )}

        {/* 底部操作 */}
        <div className="select-org__footer">
          <Checkbox checked={remember} onChange={(e) => setRemember(e.target.checked)}>
            记住本次选择，下次登录优先进入{selectedOrg?.name ?? ''}
          </Checkbox>
          <Button
            type="primary"
            className="select-org__enter"
            onClick={onEnter}
            disabled={!selectedOrg}
            loading={entering}
          >
            进入{selectedOrg?.name ?? '机构'}
          </Button>
          <p className="select-org__note">机构管理员可在运营管理平台维护机构信息和成员权限</p>
        </div>
      </main>
    </div>
  )
}
