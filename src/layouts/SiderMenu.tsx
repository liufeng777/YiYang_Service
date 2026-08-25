/**
 * 侧边栏菜单
 * 菜单数据由 @/router/menu 根据路由配置自动生成，
 * 并按当前登录用户的权限码过滤（路由 meta.permissions 控制可见性）
 */
import { useMemo } from 'react'
import { Menu } from 'antd'
import { useLocation, useNavigate } from 'react-router-dom'
import { buildMenuItems, findOpenKeys } from '@/router/menu'
import { useAppStore } from '@/store/modules/app'
import { useUserStore } from '@/store/modules/user'

/** 空权限数组常量（避免选择器每次返回新引用导致无限重渲染） */
const EMPTY_PERMISSIONS: string[] = []

export default function SiderMenu() {
  const navigate = useNavigate()
  const location = useLocation()
  const collapsed = useAppStore((state) => state.collapsed)
  const permissions = useUserStore((state) => state.userInfo?.permissions ?? EMPTY_PERMISSIONS)

  const items = useMemo(() => buildMenuItems(permissions), [permissions])
  const selectedKeys = useMemo(() => {
    // 二级菜单取完整路径作为 key，一级菜单取一级路径
    const matched = items
      .flatMap((item: any) =>
        item?.children ? item.children.map((c: any) => c.key) : [item?.key],
      )
      .filter((key: string) => location.pathname.startsWith(key))
    return matched.length ? [matched[0]] : [location.pathname]
  }, [items, location.pathname])
  const openKeys = useMemo(() => findOpenKeys(location.pathname), [location.pathname])

  return (
    <Menu
      theme="dark"
      mode="inline"
      inlineCollapsed={collapsed}
      items={items}
      selectedKeys={selectedKeys}
      defaultOpenKeys={openKeys}
      onClick={({ key }) => navigate(key)}
      style={{ borderInlineEnd: 'none' }}
    />
  )
}
