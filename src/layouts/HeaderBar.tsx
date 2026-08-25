/**
 * 顶部导航栏：折叠按钮 + 面包屑 + 当前机构 + 搜索 + 用户信息
 */
import { useMemo } from 'react'
import { Breadcrumb, Dropdown, Layout, Avatar, Space, Button, Input } from 'antd'
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  LogoutOutlined,
  UserOutlined,
  SwapOutlined,
} from '@ant-design/icons'
import { useLocation, useNavigate } from 'react-router-dom'
import { findBreadcrumb } from '@/router/menu'
import { useAppStore } from '@/store/modules/app'
import { useUserStore } from '@/store/modules/user'

export default function HeaderBar() {
  const location = useLocation()
  const navigate = useNavigate()
  const collapsed = useAppStore((state) => state.collapsed)
  const toggleCollapsed = useAppStore((state) => state.toggleCollapsed)
  const userInfo = useUserStore((state) => state.userInfo)
  const currentOrg = useUserStore((state) => state.currentOrg)
  const logout = useUserStore((state) => state.logout)

  const breadcrumbItems = useMemo(() => findBreadcrumb(location.pathname), [location.pathname])

  return (
    <Layout.Header className="layout-header">
      <div className="layout-header__left">
        <Button
          type="text"
          icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          onClick={toggleCollapsed}
          className="layout-header__trigger"
        />
        <Breadcrumb items={breadcrumbItems} />
      </div>
      <div className="layout-header__right">
        {/* 当前机构（点击切换机构，对齐选择机构页「进入后仍可在顶部切换」） */}
        <div className="layout-header__org" onClick={() => navigate('/select-org')}>
          <span className="layout-header__field-label">当前机构</span>
          <span className="layout-header__org-name">
            {currentOrg?.name ?? '选择机构'} <SwapOutlined />
          </span>
        </div>
        {/* 全局搜索（姓名 / 手机号，回车跳转线索列表） */}
        <div className="layout-header__search">
          <span className="layout-header__field-label">搜索</span>
          <Input
            size="small"
            placeholder="姓名 / 手机号"
            allowClear
            onPressEnter={(e) =>
              navigate(`/leads?keyword=${encodeURIComponent(e.currentTarget.value.trim())}`)
            }
          />
        </div>
        <Dropdown
          menu={{
            items: [
              {
                key: 'profile',
                icon: <UserOutlined />,
                label: '个人中心',
              },
              { type: 'divider' },
              {
                key: 'logout',
                icon: <LogoutOutlined />,
                label: '退出登录',
                onClick: () => {
                  logout()
                  navigate('/login', { replace: true })
                },
              },
            ],
          }}
        >
          <Space className="layout-header__user" size={8}>
            <Avatar size={28} icon={<UserOutlined />} style={{ background: '#27866B' }} />
            <span>{userInfo?.nickname || '管理员'}</span>
          </Space>
        </Dropdown>
      </div>
    </Layout.Header>
  )
}
