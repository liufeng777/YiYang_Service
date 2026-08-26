/**
 * 角色管理模块本地 mock 数据（设计稿：14.角色管理/角色列表.png / 目录权限配置.png）
 * TODO: 角色管理接口 API v0.1 未定义（运营后台域预留权限码 role:view），待后端补充
 */

/* ===== 角色列表 ===== */

/** 配置类型：preset-系统预置（不可删除） custom-自定义（系统配置） */
export type RoleConfigType = 'preset' | 'custom'

export const ROLE_TYPE_TEXT: Record<RoleConfigType, string> = {
  preset: '系统预置',
  custom: '系统配置',
}

export interface MockRoleRow {
  id: string
  name: string
  code: string
  type: RoleConfigType
  scope: string
  userCount: number
  updatedAt: string
  dateTone: 'blue' | 'teal' | 'orange' | 'red'
  status: 'enabled' | 'disabled'
}

export const mockRoleStats = {
  total: 8,
  totalNote: '启用 7个',
  preset: 6,
  presetNote: '不可删除',
  custom: 2,
  customNote: '系统管理员维护',
  disabled: 1,
  disabledNote: '全系统使用',
}

export const mockRoleList: MockRoleRow[] = [
  {
    id: 'ROLE-001',
    name: '系统管理员',
    code: 'SYS_ADMIN',
    type: 'preset',
    scope: '全部功能与全局配置',
    userCount: 2,
    updatedAt: '2026-08-10',
    dateTone: 'blue',
    status: 'enabled',
  },
  {
    id: 'ROLE-002',
    name: '机构管理员',
    code: 'ORG_ADMIN',
    type: 'preset',
    scope: '机构、人员、资质、团队',
    userCount: 8,
    updatedAt: '2026-08-09',
    dateTone: 'teal',
    status: 'enabled',
  },
  {
    id: 'ROLE-003',
    name: '健康管理师',
    code: 'HEALTH_MANAGER',
    type: 'preset',
    scope: '档案、目标、方案、随访',
    userCount: 36,
    updatedAt: '2026-08-08',
    dateTone: 'orange',
    status: 'enabled',
  },
  {
    id: 'ROLE-004',
    name: '方案审核医生',
    code: 'PLAN_DOCTOR',
    type: 'preset',
    scope: '方案审核、专病管理',
    userCount: 12,
    updatedAt: '2026-08-07',
    dateTone: 'teal',
    status: 'enabled',
  },
  {
    id: 'ROLE-005',
    name: '服务调度员',
    code: 'DISPATCHER',
    type: 'custom',
    scope: '服务工单、异常处理',
    userCount: 6,
    updatedAt: '2026-08-06',
    dateTone: 'red',
    status: 'disabled',
  },
]

export const mockRoleModules = [
  '线索管理',
  '健康档案',
  '管理目标',
  '健康管理方案',
  '随访管理',
  '服务工单',
  '预警管理',
  '组织与人员',
]

/* ===== 新建角色 / 目录权限配置 ===== */

export const mockRoleCreate = {
  steps: ['基本信息', '目录权限', '操作权限'],
  defaultName: '慢病管理专员',
  source: '系统配置',
  defaultCode: 'CHRONIC_MANAGER',
  createdAt: '2026-08-11',
  catalogLabel: '工作台目录权限',
  catalogs: [
    { key: 'dashboard', label: '工作台', checked: true },
    { key: 'health', label: '健康档案', checked: true },
    { key: 'assess', label: '健康力测评', checked: false },
    { key: 'goal', label: '管理目标', checked: true },
    { key: 'plan', label: '健康管理方案', checked: true },
    { key: 'followup', label: '随访管理', checked: true },
    { key: 'risk', label: '风险处置', checked: true },
  ],
  catalogNote: '勾选角色可进入的工作台目录；右侧配置相应操作权限。',
  defaultRules: [
    { label: '首页待办', value: '按已授权目录自动生成' },
    { label: '数据范围', value: '当前机构及负责对象' },
  ],
  opNote: '同一目录可分别设置查看、新增编辑、审核发布和删除权限',
  operations: [
    { key: 'view', name: '查看', state: '允许', stateTone: 'orange' },
    { key: 'edit', name: '新增与编辑', state: '允许', stateTone: 'orange' },
    { key: 'audit', name: '审核与发布', state: '需单独授权', stateTone: 'muted' },
    { key: 'delete', name: '删除', state: '不允许', stateTone: 'muted' },
  ],
  opTip: '保存后，对选择该角色的人员统一生效并记录操作日志；人员角色在人员管理中维护。',
}
