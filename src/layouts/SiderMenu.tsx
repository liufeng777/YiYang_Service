/**
 * 侧边栏菜单
 * 菜单数据由 @/router/menu 根据路由配置自动生成，
 * 并按当前登录用户的权限码过滤（路由 meta.permissions 控制可见性）
 */
import { useEffect, useMemo, useRef } from 'react'
import { Menu } from 'antd'
import { useLocation, useNavigate } from 'react-router-dom'
import { buildMenuItems, findOpenKeys } from '@/router/menu'
import { routes, type RouteConfig } from '@/router/routes'
import { useAppStore } from '@/store/modules/app'
import { useUserStore } from '@/store/modules/user'

/** 空权限数组常量（避免选择器每次返回新引用导致无限重渲染） */
const EMPTY_PERMISSIONS: string[] = []

/** 返回路径所属的一级导航 path（按 routes 顺序取首个前缀匹配） */
function findParentPath(pathname: string): string | undefined {
  for (const route of routes) {
    if (pathname === route.path || pathname.startsWith(`${route.path}/`)) return route.path
  }
  return undefined
}

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

  // 记录每个一级路由下最后访问的子路径，用于从其他模块切回时恢复上次查看的子页面
  const lastChildByParent = useRef<Record<string, string>>({})

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

  // 每次路由变化，若处在一级导航下的非默认子页，则记录该父级最后访问的子页路径
  useEffect(() => {
    const parent = findParentPath(location.pathname)
    if (parent && location.pathname !== parent) {
      lastChildByParent.current[parent] = location.pathname
    }
  }, [location.pathname])

  const handleMenuClick = ({ key }: { key: string }) => {
    const parentRoute = routes.find((r) => r.path === key)
    // 二级菜单项：直接导航
    if (!parentRoute) {
      navigate(key)
      return
    }
    const inParent =
      location.pathname === key || location.pathname.startsWith(`${key}/`)
    if (inParent) {
      // 已在当前父路由下（子页或父页）：点击父路由回到父页面
      navigate(getLandingPath(parentRoute))
      return
    }
    // 从其他模块切回：优先回到上次查看的子页面，否则回到父页面
    const last = lastChildByParent.current[key]
    if (last && last !== key) navigate(last)
    else navigate(getLandingPath(parentRoute))
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

