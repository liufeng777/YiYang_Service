/**
 * ============================================================
 * 路由 / 菜单 统一配置（单一数据源）
 * - 本文件同时驱动：侧边栏菜单 + 路由表
 * - 约定：
 *   1. 导航项 path 为绝对路径；每个导航项为单页（children 中 '' 默认页承载组件）
 *   2. component 使用 React.lazy 懒加载，页面文件放在 src/pages 对应目录
 *   3. meta.hideInMenu = true 表示不进菜单（如详情页）
 *   4. meta.group 配置侧边栏分组标题（如「健康管理」），数组顺序即菜单顺序
 *   5. meta.permissions 控制访问权限（对齐后端 staffPermissions 权限码模型，
 *      见 src/utils/permissions.ts）：
 *      登录 / 切换机构接口返回 permissions 权限码数组（如 lead:view / plan:edit），
 *      用户拥有任一指定权限码即可在侧边栏看到并访问该导航；
 *      all:manage 为机构管理员全量权限，放行所有导航；
 *      不配置表示所有登录用户可见/可访问
 * - 菜单结构按设计稿（医养服务工作台）：工作台 + 健康管理 / 服务履约 /
 *   活动与客户运营 / 组织与人员 四个分组
 * ============================================================
 */
import { lazy } from 'react'
import type { ReactNode } from 'react'
import {
  DashboardOutlined,
  ExperimentOutlined,
  ScheduleOutlined,
  AlertOutlined,
  ToolOutlined,
  WarningOutlined,
  CarryOutOutlined,
  MessageOutlined,
  HomeOutlined,
  BankOutlined,
  UserOutlined,
  TeamOutlined,
} from '@ant-design/icons'
import type { LazyExoticComponent, ComponentType } from 'react'

export type LazyComponent = LazyExoticComponent<ComponentType>

/**
 * 权限码常量（与后端 permissions 保持一致，见 src/utils/permissions.ts staffPermissions）
 * 侧边栏菜单、路由守卫、工作台快捷入口共用此权限码过滤；
 * 后端返回 all:manage 时表示机构管理员全量权限（menu.hasAccess 中特判放行）
 */
export const PERMISSIONS = {
  /** 工作台首页 */
  DASHBOARD: 'dashboard:view',
  /** 线索 */
  LEAD_VIEW: 'lead:view',
  /** 健康会员 / 健康档案 */
  HEALTH_VIEW: 'member:view',
  /** 健康力测评（评估） */
  HEALTH_ASSESS: 'assessment:view',
  /** 随访管理 */
  FOLLOWUP: 'followup:view',
  /** 预警管理 */
  WARN_VIEW: 'warning:view',
  /** 服务工单 */
  WO_VIEW: 'work_order:view',
  /** 异常处理（派单/改派/催单） */
  WO_DISPATCH: 'work_order:edit',
  /** 健康活动（运营后台域，预留权限码） */
  ACTIVITY_VIEW: 'activity:view',
  /** 咨询管理 */
  CONSULT_VIEW: 'consultation:view',
  /** 预约到访（入住协同复用） */
  APPT_VIEW: 'appointment:view',
  /** 机构管理（运营后台域，预留权限码） */
  ORG_VIEW: 'org:view',
  /** 人员管理 */
  STAFFMGR_VIEW: 'staff:view',
  /** 团队管理（预留权限码） */
  TEAM_VIEW: 'team:view',
  /** 角色管理（运营后台域，预留权限码） */
  ROLE_VIEW: 'role:view',
} as const

export type PermissionCode = (typeof PERMISSIONS)[keyof typeof PERMISSIONS]

export interface RouteMeta {
  /** 菜单 / 面包屑显示名称 */
  title: string
  /** 导航图标 */
  icon?: ReactNode
  /** 是否在菜单中隐藏 */
  hideInMenu?: boolean
  /** 是否需要登录（默认 true） */
  public?: boolean
  /** 侧边栏分组标题（相同 group 的相邻导航归入一组，仅作展示分组） */
  group?: string
  /**
   * 允许访问的权限码列表（拥有任一即可）。
   * 不配置（undefined）表示所有登录用户可见；配置后侧边栏与路由均按权限码过滤
   */
  permissions?: string[]
}

export interface RouteConfig {
  /** 导航项为绝对路径；子级为相对路径（'' 表示默认页） */
  path: string
  meta: RouteMeta
  /** 懒加载组件（含子路由时，子级配置 component） */
  component?: LazyComponent
  children?: RouteConfig[]
}

/** 业务路由表（登录后展示，数组顺序即侧边栏顺序） */
export const routes: RouteConfig[] = [
  {
    path: '/workbench',
    meta: { title: '工作台', icon: <DashboardOutlined />, permissions: [PERMISSIONS.DASHBOARD] },
    children: [
      {
        path: '',
        meta: { title: '工作台' },
        component: lazy(() => import('@/pages/workbench/index')),
      },
    ],
  },

  /* ===== 健康管理 ===== */
  {
    path: '/member',
    meta: { title: '健康会员', icon: <TeamOutlined />, group: '健康管理', permissions: [PERMISSIONS.HEALTH_VIEW] },
    children: [
      {
        path: '',
        meta: { title: '健康会员列表' },
        component: lazy(() => import('@/pages/member/list')),
      },
      {
        path: ':id',
        meta: { title: '健康会员详情', hideInMenu: true },
        component: lazy(() => import('@/pages/member/detail')),
      },
    ],
  },
  // {
  //   // 线索管理：已从侧边栏移除（被「健康会员」替代），路由与代码文件暂时保留，
  //   // 全部子级 hideInMenu 使导航不在侧边栏展示，工作台/活动等模块内的既有链接仍可用
  //   path: '/leads',
  //   meta: { title: '线索管理', icon: <AimOutlined />, group: '健康管理', permissions: [PERMISSIONS.LEAD_VIEW] },
  //   children: [
  //     {
  //       path: '',
  //       meta: { title: '线索登记', hideInMenu: true },
  //       component: lazy(() => import('@/pages/leads/index')),
  //     },
  //     {
  //       path: 'create',
  //       meta: { title: '新增线索', hideInMenu: true },
  //       component: lazy(() => import('@/pages/leads/edit')),
  //     },
  //     {
  //       path: 'edit/:id',
  //       meta: { title: '编辑线索', hideInMenu: true },
  //       component: lazy(() => import('@/pages/leads/edit')),
  //     },
  //     {
  //       path: ':id/verify',
  //       meta: { title: '完成实名认证', hideInMenu: true },
  //       component: lazy(() => import('@/pages/leads/verify')),
  //     },
  //     {
  //       path: ':id/convert-success',
  //       meta: { title: '转档成功', hideInMenu: true },
  //       component: lazy(() => import('@/pages/leads/convert-success')),
  //     },
  //   ],
  // },
  // {
  //   path: '/health-record',
  //   meta: { title: '健康档案', icon: <FolderOutlined />, group: '健康管理', permissions: [PERMISSIONS.HEALTH_VIEW] },
  //   children: [
  //     {
  //       path: '',
  //       meta: { title: '档案列表' },
  //       component: lazy(() => import('@/pages/health')),
  //     },
  //     {
  //       path: 'create',
  //       meta: { title: '新建健康档案', hideInMenu: true },
  //       component: lazy(() => import('@/pages/health/create')),
  //     },
  //     {
  //       path: 'import',
  //       meta: { title: '批量导入', hideInMenu: true },
  //       component: lazy(() => import('@/pages/health/import')),
  //     },
  //     {
  //       path: ':id',
  //       meta: { title: '档案概览', hideInMenu: true },
  //       component: lazy(() => import('@/pages/health/profile')),
  //     },
  //     {
  //       path: ':id/disease/:diseaseKey',
  //       meta: { title: '专病档案', hideInMenu: true },
  //       component: lazy(() => import('@/pages/health/disease')),
  //     },
  //     {
  //       path: ':id/assign',
  //       meta: { title: '分配管理团队', hideInMenu: true },
  //       component: lazy(() => import('@/pages/health/assign')),
  //     },
  //     {
  //       path: ':id/risk-level',
  //       meta: { title: '分层分级详情', hideInMenu: true },
  //       component: lazy(() => import('@/pages/health/risk-level')),
  //     },
  //     {
  //       path: ':id/risk-change',
  //       meta: { title: '分层变化处理', hideInMenu: true },
  //       component: lazy(() => import('@/pages/health/risk-change')),
  //     },
  //   ],
  // },
  {
    path: '/assessment',
    meta: { title: '健康力测评', icon: <ExperimentOutlined />, group: '健康管理', permissions: [PERMISSIONS.HEALTH_ASSESS] },
    children: [
      {
        path: '',
        meta: { title: '测评列表' },
        component: lazy(() => import('@/pages/assess/list')),
      },
      {
        path: 'create',
        meta: { title: '新建健康力测评', hideInMenu: true },
        component: lazy(() => import('@/pages/assess/create')),
      },
      {
        path: 'templates',
        meta: { title: '测评模板', hideInMenu: true },
        component: lazy(() => import('@/pages/assess/templates')),
      },
      {
        path: ':id',
        meta: { title: '健康力测评详情', hideInMenu: true },
        component: lazy(() => import('@/pages/assess/detail')),
      },
      {
        path: ':id/entry',
        meta: { title: '健康力测评录入', hideInMenu: true },
        component: lazy(() => import('@/pages/assess/entry')),
      },
      {
        path: ':id/analysis',
        meta: { title: 'AI分析与专业确认', hideInMenu: true },
        component: lazy(() => import('@/pages/assess/analysis')),
      },
    ],
  },
  {
    path: '/followup',
    meta: { title: '随访管理', icon: <ScheduleOutlined />, group: '健康管理', permissions: [PERMISSIONS.FOLLOWUP] },
    children: [
      {
        path: '',
        meta: { title: '我的随访' },
        component: lazy(() => import('@/pages/followup/index')),
      },
      {
        path: 'create',
        meta: { title: '创建健康预警回访', hideInMenu: true },
        component: lazy(() => import('@/pages/followup/create')),
      },
      {
        path: ':id/execute',
        meta: { title: '执行随访', hideInMenu: true },
        component: lazy(() => import('@/pages/followup/execute')),
      },
    ],
  },
  {
    path: '/warning',
    meta: { title: '健康预警', icon: <AlertOutlined />, group: '健康管理', permissions: [PERMISSIONS.WARN_VIEW] },
    children: [
      {
        path: '',
        meta: { title: '预警列表' },
        component: lazy(() => import('@/pages/warning/index')),
      },
      {
        path: ':id/handle',
        meta: { title: '健康预警医生处置', hideInMenu: true },
        component: lazy(() => import('@/pages/warning/handle')),
      },
      {
        path: ':id/close',
        meta: { title: '关闭健康预警', hideInMenu: true },
        component: lazy(() => import('@/pages/warning/close')),
      },
    ],
  },

  /* ===== 服务履约 ===== */
  {
    path: '/work-order',
    meta: {
      title: '服务工单',
      icon: <ToolOutlined />,
      group: '服务履约',
      permissions: [PERMISSIONS.WO_VIEW],
    },
    children: [
      {
        path: '',
        meta: { title: '服务工单' },
        component: lazy(() => import('@/pages/work-order/index')),
      },
      {
        path: ':id',
        meta: { title: '服务工单详情', hideInMenu: true },
        component: lazy(() => import('@/pages/work-order/detail')),
      },
      {
        path: ':id/audit',
        meta: { title: '审核服务订单', hideInMenu: true },
        component: lazy(() => import('@/pages/work-order/audit')),
      },
      {
        path: ':id/audit-result',
        meta: { title: '审核通过', hideInMenu: true },
        component: lazy(() => import('@/pages/work-order/audit-result')),
      },
    ],
  },
  {
    path: '/exception',
    meta: {
      title: '工单异常',
      icon: <WarningOutlined />,
      group: '服务履约',
      permissions: [PERMISSIONS.WO_DISPATCH],
    },
    children: [
      {
        path: '',
        meta: { title: '异常列表' },
        component: lazy(() => import('@/pages/exception/index')),
      },
      {
        path: ':id/health',
        meta: { title: '健康异常处理', hideInMenu: true },
        component: lazy(() => import('@/pages/exception/health')),
      },
      {
        path: ':id/wo',
        meta: { title: '工单异常处理', hideInMenu: true },
        component: lazy(() => import('@/pages/exception/wo')),
      },
    ],
  },

  /* ===== 活动与客户运营 ===== */
  {
    path: '/health-activity',
    meta: { title: '健康活动', icon: <CarryOutOutlined />, group: '活动与客户运营', permissions: [PERMISSIONS.ACTIVITY_VIEW] },
    children: [
      {
        path: '',
        meta: { title: '健康活动' },
        component: lazy(() => import('@/pages/activity/index')),
      },
      {
        path: ':id/registrations',
        meta: { title: '报名名单', hideInMenu: true },
        component: lazy(() => import('@/pages/activity/registrations')),
      },
      {
        path: ':id/registrations/:rid/contact',
        meta: { title: '联系确认', hideInMenu: true },
        component: lazy(() => import('@/pages/activity/contact')),
      },
      {
        path: ':id/check-in',
        meta: { title: '现场签到', hideInMenu: true },
        component: lazy(() => import('@/pages/activity/checkin')),
      },
    ],
  },
  {
    path: '/consultation',
    meta: { title: '咨询管理', icon: <MessageOutlined />, group: '活动与客户运营', permissions: [PERMISSIONS.CONSULT_VIEW] },
    children: [
      {
        path: '',
        meta: { title: '咨询管理' },
        component: lazy(() => import('@/pages/consultation/index')),
      },
      {
        path: 'register',
        meta: { title: '登记电话咨询', hideInMenu: true },
        component: lazy(() => import('@/pages/consultation/register')),
      },
    ],
  },
  {
    // 入住协同：登记会员入住意向并持续跟进（设计稿：16.入住协同）
    // swagger 无对应接口，页面以本地 mock 演示完整交互（见 BasicLayout NO_API_PREFIXES）
    path: '/admission',
    meta: {
      title: '入住协同',
      icon: <HomeOutlined />,
      group: '活动与客户运营',
      permissions: [PERMISSIONS.APPT_VIEW, PERMISSIONS.LEAD_VIEW],
    },
    children: [
      {
        path: '',
        meta: { title: '入住协同' },
        component: lazy(() => import('@/pages/admission/index')),
      },
    ],
  },

  /* ===== 组织与人员 ===== */
  {
    path: '/organization',
    meta: { title: '机构信息', icon: <BankOutlined />, group: '组织与人员', permissions: [PERMISSIONS.ORG_VIEW] },
    children: [
      {
        path: '',
        meta: { title: '机构列表' },
        component: lazy(() => import('@/pages/institution/list')),
      },
      {
        path: 'create',
        meta: { title: '新增机构', hideInMenu: true },
        component: lazy(() => import('@/pages/institution/create')),
      },
      {
        path: ':id',
        meta: { title: '机构详情', hideInMenu: true },
        component: lazy(() => import('@/pages/institution/detail')),
      },
    ],
  },
  {
    path: '/staff',
    meta: { title: '人员管理', icon: <UserOutlined />, group: '组织与人员', permissions: [PERMISSIONS.STAFFMGR_VIEW] },
    children: [
      {
        path: '',
        meta: { title: '人员列表' },
        component: lazy(() => import('@/pages/staff/list')),
      },
      {
        path: 'credentials',
        meta: { title: '执业资质', hideInMenu: true },
        component: lazy(() => import('@/pages/staff/credentials')),
      },
      {
        path: 'qualification',
        meta: { title: '派单资格', hideInMenu: true },
        component: lazy(() => import('@/pages/staff/qualification')),
      },
      {
        path: 'audit',
        meta: { title: '资质审核', hideInMenu: true },
        component: lazy(() => import('@/pages/staff/audit')),
      },
      {
        path: 'audit/:id',
        meta: { title: '专业人员统一审核', hideInMenu: true },
        component: lazy(() => import('@/pages/staff/audit-detail')),
      },
      {
        path: 'create',
        meta: { title: '新增人员', hideInMenu: true },
        component: lazy(() => import('@/pages/staff/create')),
      },
      {
        path: ':id',
        meta: { title: '人员详情', hideInMenu: true },
        component: lazy(() => import('@/pages/staff/detail')),
      },
      {
        path: ':id/authorize',
        meta: { title: '配置服务授权', hideInMenu: true },
        component: lazy(() => import('@/pages/staff/authorize')),
      },
      {
        path: ':id/credential-upload',
        meta: { title: '上传执业资质', hideInMenu: true },
        component: lazy(() => import('@/pages/staff/credential-upload')),
      },
    ],
  },
  {
    path: '/team',
    meta: { title: '团队管理', icon: <TeamOutlined />, group: '组织与人员', permissions: [PERMISSIONS.TEAM_VIEW] },
    children: [
      {
        path: '',
        meta: { title: '团队列表' },
        component: lazy(() => import('@/pages/team/list')),
      },
      {
        path: 'create',
        meta: { title: '新建团队', hideInMenu: true },
        component: lazy(() => import('@/pages/team/create')),
      },
      {
        path: 'unassigned',
        meta: { title: '待分配患者', hideInMenu: true },
        component: lazy(() => import('@/pages/team/unassigned')),
      },
      {
        path: 'assign',
        meta: { title: '批量分配管理团队', hideInMenu: true },
        component: lazy(() => import('@/pages/team/assign')),
      },
      {
        path: ':id',
        meta: { title: '团队详情', hideInMenu: true },
        component: lazy(() => import('@/pages/team/detail')),
      },
    ],
  }
]
