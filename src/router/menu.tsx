/**
 * 菜单构建工具
 * 将 routes 配置转换为 antd Menu items，并辅助面包屑等查找
 * 菜单按当前登录用户权限码过滤：meta.permissions 未配置表示所有登录用户可见
 */
import type { MenuProps } from 'antd'
import { routes, type RouteConfig, type RouteMeta } from './routes'

export type MenuItems = NonNullable<MenuProps['items']>

/** 拼接子路由完整路径 */
function joinPath(parent: string, child: string) {
  if (!child) return parent
  return `${parent}/${child}`.replace(/\/+/g, '/')
}

/**
 * 判断用户权限是否可访问某个路由 meta
 * - meta.permissions 未配置 / 为空数组：所有登录用户可访问
 * - 配置后：用户拥有任一指定权限码即可访问
 */
export function hasAccess(meta: RouteMeta, userPermissions: string[]): boolean {
  if (!meta.permissions || meta.permissions.length === 0) return true
  return meta.permissions.some((code) => userPermissions.includes(code))
}

/** 按用户权限码过滤路由表（导航与子级均过滤；导航下无可访问子级时整组剔除） */
export function filterRoutesByPermissions(
  list: RouteConfig[],
  userPermissions: string[],
): RouteConfig[] {
  return list
    .filter((route) => hasAccess(route.meta, userPermissions))
    .map((route) => {
      if (!route.children) return route
      const children = route.children.filter((child) =>
        // 子级未单独配置 permissions 时继承导航的可见性
        hasAccess({ ...child.meta, permissions: child.meta.permissions }, userPermissions),
      )
      return { ...route, children }
    })
    .filter((route) => !route.children || route.children.length > 0)
}

/**
 * 构建侧边栏菜单项
 * - 按 userPermissions 过滤，仅渲染当前权限可见的导航
 * - 按 meta.group 渲染分组标题（设计稿：客户与健康管理 / 服务履约 / 活动与客户运营 / 组织与人员）
 * - 无 group 的导航（如工作台）直接渲染为普通菜单项
 */
export function buildMenuItems(userPermissions: string[]): MenuItems {
  const visibleRoutes = filterRoutesByPermissions(routes, userPermissions)
  const items: MenuItems = []
  let lastGroup: string | undefined

  for (const route of visibleRoutes) {
    const { meta, children = [] } = route
    const visibleChildren = children.filter((c) => !c.meta.hideInMenu)
    if (visibleChildren.length === 0) continue

    // 分组标题：进入新分组时插入 group 项
    if (meta.group && meta.group !== lastGroup) {
      items.push({ type: 'group', label: meta.group, key: `group-${meta.group}` })
    }
    lastGroup = meta.group

    // 单页导航：渲染为普通菜单项（取默认页路径作为 key）
    if (visibleChildren.length === 1 && visibleChildren[0].path === '') {
      items.push({
        key: route.path,
        icon: meta.icon,
        label: meta.title,
      })
      continue
    }

    // 含二级导航：渲染子菜单（预留）
    items.push({
      key: route.path,
      icon: meta.icon,
      label: meta.title,
      children: visibleChildren.map((child) => ({
        key: joinPath(route.path, child.path),
        label: child.meta.title,
      })),
    })
  }
  return items
}

/** 根据当前路径查找菜单中的父级 key（用于展开子菜单） */
export function findOpenKeys(pathname: string): string[] {
  const keys: string[] = []
  for (const route of routes) {
    if (pathname.startsWith(route.path) && route.children?.some((c) => !c.meta.hideInMenu)) {
      keys.push(route.path)
      break
    }
  }
  return keys
}

/** 根据路径构建面包屑（一级 -> 二级） */
export function findBreadcrumb(pathname: string): Array<{ title: string }> {
  for (const route of routes) {
    if (!pathname.startsWith(route.path)) continue
    const crumb: Array<{ title: string }> = [{ title: route.meta.title }]
    const child = route.children?.find((c) => pathname === joinPath(route.path, c.path))
    if (child) crumb.push({ title: child.meta.title })
    return crumb
  }
  return []
}

/** 根据路径查找页面标题（用于 document.title） */
export function findPageTitle(pathname: string): string {
  for (const route of routes) {
    if (!pathname.startsWith(route.path)) continue
    const child = route.children?.find((c) => pathname === joinPath(route.path, c.path))
    if (child) return `${child.meta.title} - ${route.meta.title}`
    return route.meta.title
  }
  return ''
}
