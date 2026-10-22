/**
 * 菜单构建工具
 * 将 routes 配置转换为 antd Menu items，并辅助面包屑等查找
 * 菜单按当前登录用户权限码过滤：meta.permissions 未配置表示所有登录用户可见
 */
import type { MenuProps } from 'antd'
import { routes, type RouteConfig, type RouteMeta } from './routes'

/** 机构管理员全量权限码（后端 staffPermissions 中的 all:manage） */
export const ALL_MANAGE_PERMISSION = 'all:manage'

export type MenuItems = NonNullable<MenuProps['items']>

/** 拼接子路由完整路径 */
function joinPath(parent: string, child: string) {
  if (!child) return parent
  return `${parent}/${child}`.replace(/\/+/g, '/')
}

/**
 * 判断用户权限是否可访问某个路由 meta
 * - meta.permissions 未配置 / 为空数组：所有登录用户可访问
 * - 用户拥有 all:manage（机构管理员全量权限）：放行所有导航
 * - 配置后：用户拥有任一指定权限码即可访问
 */
export function hasAccess(meta: RouteMeta, userPermissions: string[]): boolean {
  if (!meta.permissions || meta.permissions.length === 0) return true
  if (userPermissions.includes(ALL_MANAGE_PERMISSION)) return true
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
 * - 按 meta.group 渲染分组标题（设计稿：健康管理 / 服务履约 / 活动与客户运营 / 组织与人员）
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

/** 面包屑项：title 展示文案，path 用于点击跳转 */
export interface BreadcrumbItem {
  title: string
  path: string
}

interface PagePattern {
  /** 完整路径模式，如 /assessment/:id/entry */
  pattern: string
  title: string
}

/** 展开某一级导航下的所有页面路径模式（默认页 '' 不重复占位） */
function expandPages(route: RouteConfig, base: string): PagePattern[] {
  const list: PagePattern[] = []
  for (const child of route.children ?? []) {
    if (!child.path) continue
    const pattern = joinPath(base, child.path)
    list.push({ pattern, title: child.meta.title })
    list.push(...expandPages(child, pattern))
  }
  return list
}

/** 路径模式与给定路径段精确匹配（':xxx' 为参数段，段数需一致） */
function matchPattern(pattern: string, segments: string[]): boolean {
  const patternSegs = pattern.split('/').filter(Boolean)
  if (patternSegs.length !== segments.length) return false
  return patternSegs.every((seg, index) => seg.startsWith(':') || seg === segments[index])
}

/**
 * 根据路径构建面包屑（支持多级嵌套与路径参数）
 * - 一级导航默认页只显示一级标题，避免「工作台 / 工作台」式重复
 * - 详情 / 编辑等隐藏页按路径参数逐级补全（如 健康力测评 / 健康力测评详情）
 * - 相邻层级同名时去重，每一项携带可跳转路径，末级为当前页
 */
export function findBreadcrumb(pathname: string): BreadcrumbItem[] {
  for (const route of routes) {
    if (!(pathname === route.path || pathname.startsWith(`${route.path}/`))) continue

    // 一级导航落点：有默认页（''）时用一级路径；否则落到第一个可见二级导航，
    // 避免面包屑点击一级项时跳到无匹配路由的空白页
    const defaultChild = route.children?.find((c) => !c.path && !c.meta.hideInMenu)
    const firstVisibleChild = route.children?.find((c) => !c.meta.hideInMenu)
    const landingPath = defaultChild
      ? route.path
      : firstVisibleChild
        ? joinPath(route.path, firstVisibleChild.path)
        : route.path

    const crumbs: BreadcrumbItem[] = [{ title: route.meta.title, path: landingPath }]
    const pages = expandPages(route, route.path)
    const segments = pathname.split('/').filter(Boolean)

    // 逐级累积前缀，前缀恰好完整匹配某个页面路径模式时补一级面包屑
    for (let depth = 2; depth <= segments.length; depth += 1) {
      const prefixSegs = segments.slice(0, depth)
      const hit = pages.find((page) => matchPattern(page.pattern, prefixSegs))
      if (hit && hit.title !== crumbs[crumbs.length - 1].title) {
        crumbs.push({ title: hit.title, path: `/${prefixSegs.join('/')}` })
      }
    }
    return crumbs
  }
  return []
}

/** 根据路径查找页面标题（用于 document.title），取最深匹配页面 */
export function findPageTitle(pathname: string): string {
  for (const route of routes) {
    if (!(pathname === route.path || pathname.startsWith(`${route.path}/`))) continue
    const segments = pathname.split('/').filter(Boolean)
    const hit = expandPages(route, route.path).find((page) => matchPattern(page.pattern, segments))
    if (hit) return hit.title === route.meta.title ? route.meta.title : `${hit.title} - ${route.meta.title}`
    const defaultChild = route.children?.find((c) => !c.path)
    if (defaultChild && pathname === route.path && defaultChild.meta.title !== route.meta.title) {
      return `${defaultChild.meta.title} - ${route.meta.title}`
    }
    return route.meta.title
  }
  return ''
}
