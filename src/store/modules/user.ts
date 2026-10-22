import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { authApi } from '@/api'
import type { StaffInstitution } from '@/api/modules/auth'

/**
 * 岗位编码（与后端 position_code 完全一致）
 * 工作台模板按岗位码选择；侧边栏按 permissions 权限码过滤
 */
export const POSITIONS = {
  ADMIN: 'Admin', // 医护管理员
  DOCTOR: 'Doctor', // 执业医师
  HEALTH_MANAGER: 'HealthMgr', // 健管师
  CARE_GIVER: 'Caregiver', // 照护人员
} as const

export type PositionCode = (typeof POSITIONS)[keyof typeof POSITIONS]

/** 用户信息（对齐登录接口 staff 对象） */
export interface UserInfo {
  id: number | string
  /** 登录手机号 */
  phone: string
  nickname: string
  avatar?: string
  /** 岗位编码，决定工作台模板 */
  positionCode: PositionCode
  /** 岗位名称，如「健康管理师」 */
  positionName: string
  /** 所属机构名称 */
  institutionName?: string
  /** 权限码列表（permissions.code），驱动侧边栏与路由守卫 */
  permissions: string[]
}

/** 用户可访问的机构（选择机构页使用） */
export interface OrgInfo {
  id: number | string
  name: string
  /** 机构类型标签，如「医养结合机构」 */
  type: string
  /** 当前用户在该机构中的角色标签，如「健康管理师」 */
  roleTag: string
  /** 数据范围说明 */
  scope: string
  /** 数据范围明细，如「慢病管理 · 上门护理」 */
  scopeDetail: string
  /** 最近访问时间文案 */
  lastVisit: string
}

interface UserState {
  token: string
  userInfo: UserInfo | null
  /** 登录接口返回的可访问机构列表（staff.institutions，选择机构页数据源） */
  institutions: StaffInstitution[]
  /** 当前进入的机构（登录后在「选择机构」页确定） */
  currentOrg: OrgInfo | null
  setToken: (token: string) => void
  setUserInfo: (userInfo: UserInfo) => void
  setCurrentOrg: (org: OrgInfo | null) => void
  /**
   * 登录（已对接真实接口）
   * - 密码登录：传 phone + password（POST /api/v1/staff/auth/login）
   * - 验证码登录：传 phone + code（POST /api/v1/staff/auth/sms-login）
   */
  login: (params: { phone: string; password?: string; code?: string }) => Promise<void>
  logout: () => void
}

/** 手机号脱敏：138****8000 */
export function maskPhone(phone: string): string {
  return phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')
}

/** 各岗位的权限码集合（后端未下发 permissions 时的兜底，对齐 src/utils/permissions.ts staffPermissions） */
const POSITION_PERMISSIONS: Record<PositionCode, string[]> = {
  // 医护管理员：本机构全量权限（后端 all:manage 语义）
  [POSITIONS.ADMIN]: ['all:manage'],
  // 执业医师：健康预警处置 + 订单审核 + 评估确认
  [POSITIONS.DOCTOR]: [
    'dashboard:view',
    'member:view', 'assessment:view', 'assessment:edit',
    'warning:view', 'warning:edit',
    'order:view', 'order:edit',
    'followup:view', 'consultation:view',
  ],
  // 健管师：健康管理全域 + 工单查看 + 咨询
  [POSITIONS.HEALTH_MANAGER]: [
    'dashboard:view',
    'lead:view', 'lead:edit',
    'member:view', 'member:edit',
    'assessment:view', 'assessment:edit',
    'followup:view', 'followup:edit',
    'warning:view', 'warning:edit',
    'work_order:view', 'consultation:view',
  ],
  // 照护人员：工单执行 + 排班查看 + 档案查看
  [POSITIONS.CARE_GIVER]: [
    'dashboard:view',
    'work_order:view', 'schedule:view',
    'member:view', 'consultation:view',
  ],
}

/** 各岗位显示名（后端未返回岗位名时回退使用） */
const POSITION_NAMES: Record<PositionCode, string> = {
  [POSITIONS.ADMIN]: '医护管理员',
  [POSITIONS.DOCTOR]: '执业医师',
  [POSITIONS.HEALTH_MANAGER]: '健管师',
  [POSITIONS.CARE_GIVER]: '照护人员',
}

/**
 * 解析后端 position_code 为前端岗位编码（登录与切换机构共用）
 * 后端岗位码与 POSITIONS 值一致（Admin / Doctor / HealthMgr / Caregiver），
 * 未识别时回退健管师（权限由后端 permissions 兜底）
 */
export function resolvePositionCode(code?: string): PositionCode {
  if (code && (Object.values(POSITIONS) as string[]).includes(code)) return code as PositionCode
  return POSITIONS.HEALTH_MANAGER
}

/**
 * 登录返回的机构成员信息 → 机构卡片视图模型（选择机构页与登录默认机构共用）
 * 数据源为 staff.institutions 各项：institution_name / brief / last_login_at / position_name
 */
export function staffInstitutionToOrg(item: StaffInstitution, fallbackRole = ''): OrgInfo {
  return {
    id: item.institution_id,
    name: item.institution_name || `机构 #${item.institution_id}`,
    type: '',
    roleTag: item.position_name || fallbackRole,
    scope: '',
    scopeDetail: item.brief || '',
    lastVisit: item.last_login_at
      ? new Date(item.last_login_at * 1000).toLocaleString('zh-CN', { hour12: false })
      : '',
  }
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      token: '',
      userInfo: null,
      institutions: [],
      currentOrg: null,
      setToken: (token) => set({ token }),
      setUserInfo: (userInfo) => set({ userInfo }),
      setCurrentOrg: (currentOrg) => set({ currentOrg }),
      /**
       * 登录（已对接真实接口）
       * - 密码登录：POST /api/v1/staff/auth/login
       * - 验证码登录：POST /api/v1/staff/auth/sms-login
       * 登录出参 staff.permissions 即当前机构（staff.institution_id，最近登录机构）的权限，
       * 驱动侧边栏；后端未下发权限码时按岗位码回退预置权限集。
       * 登录后无需选择机构，默认进入 staff.institution_id 对应的机构（currentOrg 在此设置）。
       */
      login: async (params) => {
        const res = params.password
          ? await authApi.login({ phone: params.phone, password: params.password })
          : await authApi.smsLogin({ phone: params.phone, code: params.code ?? '' })
        const staff = res.staff
        // 登录返回平铺 position_code；切换机构返回嵌套 position { id, code }
        const positionCode = resolvePositionCode(staff?.position_code ?? staff?.position?.code)
        const institutions = staff?.institutions ?? []
        // 默认机构：staff.institution_id 为最近登录机构；institutions 中找不到时取第一项兜底
        const current =
          institutions.find((item) => item.institution_id === staff?.institution_id) ??
          institutions[0]
        const currentOrg = current
          ? staffInstitutionToOrg(current, POSITION_NAMES[positionCode])
          : null
        set({
          token: res.token,
          currentOrg,
          institutions,
          userInfo: {
            id: staff?.id ?? 0,
            phone: staff?.phone || params.phone,
            nickname: staff?.name || `用户${params.phone.slice(-4)}`,
            positionCode,
            positionName:
              staff?.position_name || current?.position_name || POSITION_NAMES[positionCode],
            institutionName: current?.institution_name,
            permissions:
              staff?.permissions && staff.permissions.length > 0
                ? staff.permissions
                : POSITION_PERMISSIONS[positionCode],
          },
        })
      },
      logout: () => {
        // 服务端注销 token（失败不阻塞本地登出）
        authApi.logout().catch(() => undefined)
        set({ token: '', userInfo: null, institutions: [], currentOrg: null })
      },
    }),
    {
      name: 'yiyang_user',
      // v3：岗位码切换为后端 position_code（Admin / Doctor / HealthMgr / Caregiver），
      // 旧版本缓存直接清空（强制重新登录），避免旧岗位码导致工作台模板匹配失败
      version: 3,
      migrate: (persisted, version) => {
        if (version < 3) {
          return { token: '', userInfo: null, institutions: [], currentOrg: null } as never
        }
        return persisted as never
      },
    },
  ),
)
