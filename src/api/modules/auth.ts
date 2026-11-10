import { http } from '@/utils/request'

/** 医护协同工作台认证，网关前缀 /api/v1/staff。 */
export interface StaffProfile {
  id: number
  name: string
  phone: string
  institution_id: number
  /** 1-本端协同人员 2-小程序服务人员 */
  staff_type: number
  title?: string
  position?: { id: number; code: string }
  position_code?: string
  position_name?: string
  permissions?: string[]
  institutions: StaffInstitution[]
}

export interface StaffInstitution {
  brief: string
  institution_id: number
  institution_name: string
  last_login_at: number
  position_code: string
  position_name: string
}

export interface LoginResult {
  token: string
  expires_in: number
  staff: StaffProfile
}

/** staff.StaffLoginRequest */
export function login(data: { phone: string; password: string }) {
  return http.post<LoginResult>('/v1/staff/auth/login', data)
}

/** staff.StaffSmsLoginRequest */
export function smsLogin(data: { phone: string; code: string }) {
  return http.post<LoginResult>('/v1/staff/auth/sms-login', data)
}

/** staff.StaffSmsCodeRequest，scene 仅支持 login | reset。 */
export function sendSmsCode(data: { phone: string; scene: 'login' | 'reset' }) {
  return http.post<{ sms_trace_id: string; expires_in: number }>('/v1/staff/auth/sms-code', data)
}

export function getProfile() {
  return http.get<StaffProfile>('/v1/staff/auth/profile')
}

/** staff.StaffChangePasswordRequest */
export function changePassword(data: { old_password: string; new_password: string }) {
  return http.post<null>('/v1/staff/auth/change-password', data)
}

export function refreshToken() {
  return http.post<{ token: string; expires_in?: number }>('/v1/staff/auth/refresh')
}

/** staff.SwitchInstitutionRequest */
export function switchInstitution(data: { institution_id: number }) {
  return http.post<{ token: string; expires_in: number } & StaffProfile>(
    '/v1/staff/auth/switch-institution',
    data,
  )
}

export function logout() {
  return http.post<null>('/v1/staff/auth/logout')
}
