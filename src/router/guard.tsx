/**
 * 路由守卫
 * - AuthGuard：未登录跳转登录页
 * - RoleGuard：已登录但角色无权访问时渲染 403
 */
import { Navigate, useLocation } from 'react-router-dom'
import type { ReactNode } from 'react'
import { useUserStore } from '@/store/modules/user'
import { hasAccess } from './menu'
import type { RouteMeta } from './routes'
import Forbidden from '@/pages/error/403'

/** 空权限数组常量（避免选择器每次返回新引用导致无限重渲染） */
const EMPTY_PERMISSIONS: string[] = []

export function AuthGuard({ children }: { children: ReactNode }) {
  const token = useUserStore((state) => state.token)
  const location = useLocation()

  if (!token) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }
  return <>{children}</>
}

/**
 * 角色守卫：路由 meta.permissions 未配置时所有登录用户可访问；
 * 配置后仅拥有任一指定权限码的用户可访问，否则渲染 403
 */
export function RoleGuard({ meta, children }: { meta: RouteMeta; children: ReactNode }) {
  const permissions = useUserStore((state) => state.userInfo?.permissions ?? EMPTY_PERMISSIONS)
  if (!hasAccess(meta, permissions)) {
    return <Forbidden />
  }
  return <>{children}</>
}
