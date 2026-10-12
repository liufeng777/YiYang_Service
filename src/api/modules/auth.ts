import { http } from '@/utils/request'

/**
 * 登录认证（协同工作台端 §1 登录与账号）
 * 网关前缀：/api/v1/staff
 */

/** 登录账号信息（login / profile 出参 staff 对象） */
export interface StaffProfile {
  id: number
  institution_id: number
  institution_name?: string
  /** 1-本端协同人员 2-小程序服务人员 */
  staff_type: number
  name: string
  phone: string
  avatar_url?: string
  title?: string
  position?: {
    id: number
    position_name: string
    position_code: string
  }
  /** 权限码列表，驱动侧边栏与页面权限 */
  permissions?: string[]
}

/** 登录出参 */
export interface LoginResult {
  token: string
  expires_in: number
  staff: StaffProfile
}

/** 登录（手机号+密码，公开） */
export function login(data: { phone: string; password: string }) {
  return http.post<LoginResult>('/v1/staff/auth/login', data)
}

/** 登录（短信验证码，公开） */
export function smsLogin(data: { phone: string; sms_code: string }) {
  return http.post<LoginResult>('/v1/staff/auth/sms-login', data)
}

/** 发送短信验证码（公开，scene：login / change-phone） */
export function sendSmsCode(data: { phone: string; scene: 'login' | 'change-phone' }) {
  return http.post<{ sms_trace_id: string; expires_in: number }>('/v1/staff/auth/sms-code', data)
}

/** 当前账号信息（登录态，含机构与权限码） */
export function getProfile() {
  return http.get<StaffProfile>('/v1/staff/auth/profile')
}

/** 修改密码（登录态，成功后作废当前 token） */
export function changePassword(data: { old_password: string; new_password: string }) {
  return http.post<null>('/v1/staff/auth/change-password', data)
}

/** 登出（登录态，服务端注销 token） */
export function logout() {
  return http.post<null>('/v1/staff/auth/logout')
}
