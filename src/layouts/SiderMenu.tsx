/**
 * 侧边栏菜单
 * 菜单数据由 @/router/menu 根据路由配置自动生成，
 * 并按当前登录用户的权限码过滤（路由 meta.permissions 控制可见性）
 */
import { useMemo } from 'react'
import { Menu } from 'antd'
import { useLocation, useNavigate } from 'react-router-dom'
import { buildMenuItems, findOpenKeys } from '@/router/menu'
import { routes, type RouteConfig } from '@/router/routes'
import { useAppStore } from '@/store/modules/app'
import { useUserStore } from '@/store/modules/user'

/** 空权限数组常量（避免选择器每次返回新引用导致无限重渲染） */
const EMPTY_PERMISSIONS: string[] = []

/** 一级导航的落点路径：有默认页('')用一级路径，否则落到第一个可见二级导航，避免跳到空白页 */
function getLandingPath(route: RouteConfig): string {
  const defaultChild = route.children?.find((c) => !c.path && !c.meta.hideInMenu)
  const firstVisibleChild = route.children?.find((c) => !c.meta.hideInMenu)
  if (defaultChild) return route.path
  if (firstVisibleChild) return `${route.path}/${firstVisibleChild.path}`.replace(/\/+/g, '/')
  return route.path
}

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

  const handleMenuClick = ({ key }: { key: string }) => {
    const parentRoute = routes.find((r) => r.path === key)
    // 二级菜单项直接导航；一级导航始终进入默认页，避免从详情页返回时仍恢复详情。
    navigate(parentRoute ? getLandingPath(parentRoute) : key)
  }

  return (
    <Menu
      theme="dark"
      mode="inline"
      inlineCollapsed={collapsed}
      items={items}
      selectedKeys={selectedKeys}
      defaultOpenKeys={openKeys}
      onClick={handleMenuClick}
      style={{ borderInlineEnd: 'none' }}
    />
  )
}

