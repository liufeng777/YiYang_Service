import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { authApi } from '@/api'

/**
 * 岗位编码（对齐登录接口 staff.position.position_code）
 * 工作台模板按岗位码选择；侧边栏按 permissions 权限码过滤
 */
export const POSITIONS = {
  /** 健康管理师 */
  HEALTH_MANAGER: 'HEALTH_MANAGER',
  /** 护理院养老顾问 */
  CARE_CONSULTANT: 'CARE_CONSULTANT',
  /** 机构管理员 */
  ORG_ADMIN: 'ORG_ADMIN',
  /** 健康驿站运营专员 */
  STATION_OPERATOR: 'STATION_OPERATOR',
  /** 平台管理员 */
  PLATFORM_ADMIN: 'PLATFORM_ADMIN',
  /** 审核医生 */
  REVIEW_DOCTOR: 'REVIEW_DOCTOR',
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
  /** 当前进入的机构（登录后在「选择机构」页确定） */
  currentOrg: OrgInfo | null
  setToken: (token: string) => void
  setUserInfo: (userInfo: UserInfo) => void
  setCurrentOrg: (org: OrgInfo | null) => void
  /**
   * 登录（当前为 mock 实现，接入真实后端后替换为调用登录接口）
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

/** 各岗位的权限码集合（mock，对齐《协同工作台-API设计》权限码前缀） */
const POSITION_PERMISSIONS: Record<PositionCode, string[]> = {
  // 健康管理师：客户与健康管理全域 + 工单查看 + 咨询
  HEALTH_MANAGER: [
    'staff:dashboard',
    'lead:view', 'lead:followup',
    'health:view', 'health:record', 'health:profile', 'health:assess',
    'health:goal', 'health:plan', 'health:plan-ai',
    'staff:followup', 'warn:view', 'warn:handle',
    'wo:view', 'consult:view',
  ],
  // 护理院养老顾问：线索跟进转化 + 预约到访 + 咨询 + 活动 + 工单查看
  CARE_CONSULTANT: [
    'staff:dashboard',
    'lead:view', 'lead:assign', 'lead:followup', 'lead:convert',
    'health:view',
    'appt:view', 'appt:manage',
    'consult:view', 'consult:reply',
    'activity:view', 'wo:view',
  ],
  // 机构管理员：本机构全域（人员/排班/派单/订单/预约/团队）
  ORG_ADMIN: [
    'staff:dashboard',
    'lead:view', 'lead:assign', 'lead:followup',
    'health:view',
    'staff:followup', 'warn:view',
    'wo:view', 'wo:dispatch', 'order:view', 'order:manage',
    'schedule:view', 'schedule:manage',
    'staffmgr:view', 'staffmgr:manage', 'team:view',
    'appt:view', 'appt:manage', 'consult:view', 'activity:view',
  ],
  // 健康驿站运营专员：活动 + 线索 + 预约 + 工单查看
  STATION_OPERATOR: [
    'staff:dashboard',
    'activity:view',
    'lead:view', 'lead:followup', 'lead:convert',
    'appt:view', 'appt:manage',
    'consult:view', 'wo:view',
  ],
  // 平台管理员：跨机构视角（机构/角色/人员概况/订单）
  PLATFORM_ADMIN: [
    'staff:dashboard',
    'org:view', 'role:view', 'staffmgr:view',
    'wo:view', 'order:view',
  ],
  // 审核医生：健康预警 + 订单审核 + 目标与方案终审
  REVIEW_DOCTOR: [
    'staff:dashboard',
    'health:view', 'health:assess', 'health:goal', 'health:plan',
    'warn:view', 'warn:handle',
    'order:view', 'order:manage', 'staff:followup',
  ],
}

/** 各岗位显示名（后端未返回岗位名时回退使用） */
const POSITION_NAMES: Record<PositionCode, string> = {
  HEALTH_MANAGER: '健康管理师',
  CARE_CONSULTANT: '养老顾问',
  ORG_ADMIN: '机构管理员',
  STATION_OPERATOR: '运营专员',
  PLATFORM_ADMIN: '平台管理员',
  REVIEW_DOCTOR: '审核医生',
}

/**
 * 后端 position_code（如 Admin / Doctor / HealthMgr / Caregiver / NURSE_HEAD）
 * → 前端岗位编码映射；未识别时回退健康管理师（权限最少的工作台模板之一由权限码兜底）
 */
const BACKEND_POSITION_MAP: Record<string, PositionCode> = {
  Admin: POSITIONS.ORG_ADMIN,
  Doctor: POSITIONS.REVIEW_DOCTOR,
  HealthMgr: POSITIONS.HEALTH_MANAGER,
  Nurse: POSITIONS.HEALTH_MANAGER,
  Caregiver: POSITIONS.HEALTH_MANAGER,
}

function resolvePositionCode(code?: string): PositionCode {
  if (!code) return POSITIONS.HEALTH_MANAGER
  if ((Object.values(POSITIONS) as string[]).includes(code)) return code as PositionCode
  return BACKEND_POSITION_MAP[code] ?? POSITIONS.HEALTH_MANAGER
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      token: '',
      userInfo: null,
      currentOrg: null,
      setToken: (token) => set({ token }),
      setUserInfo: (userInfo) => set({ userInfo }),
      setCurrentOrg: (currentOrg) => set({ currentOrg }),
      /**
       * 登录（已对接真实接口）
       * - 密码登录：POST /api/v1/staff/auth/login
       * - 验证码登录：POST /api/v1/staff/auth/sms-login
       * 登录出参 staff.permissions 驱动侧边栏；后端未下发权限码时按岗位码回退预置权限集
       */
      login: async (params) => {
        const res = params.password
          ? await authApi.login({ phone: params.phone, password: params.password })
          : await authApi.smsLogin({ phone: params.phone, sms_code: params.code ?? '' })
        const staff = res.staff
        const positionCode = resolvePositionCode(staff?.position?.position_code)
        set({
          token: res.token,
          currentOrg: null,
          userInfo: {
            id: staff?.id ?? 0,
            phone: staff?.phone || params.phone,
            nickname: staff?.name || `用户${params.phone.slice(-4)}`,
            positionCode,
            positionName: staff?.position?.position_name || POSITION_NAMES[positionCode],
            institutionName: staff?.institution_name,
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
        set({ token: '', userInfo: null, currentOrg: null })
      },
    }),
    {
      name: 'yiyang_user',
      // v2：userInfo 结构由 roles 切换为 positionCode + permissions，
      // 旧版本缓存直接清空（强制重新登录），避免旧结构引发渲染异常
      version: 2,
      migrate: (persisted, version) => {
        if (version < 2) {
          return { token: '', userInfo: null, currentOrg: null } as never
        }
        return persisted as never
      },
    },
  ),
)
