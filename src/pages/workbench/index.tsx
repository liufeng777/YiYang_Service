/**
 * 工作台
 * - 模板由登录用户岗位（positionCode）决定，见 configs.ts 模板注册表
 * - 数值取自 GET /dashboard/overview（今日工作概览），字段按配置 key 读取（见 fields.ts）
 * - 列表面板取自 GET /dashboard/warnings（首页预警快捷清单）
 * - 指标 / 横幅 / 面板 / 快捷入口均按权限码过滤，见 view-model.ts：
 *   无对应页面权限的项不展示，保证「进入处理」跳转的页面用户都有权访问
 */
import { useEffect, useMemo, useState } from 'react'
import PageContainer from '@/components/PageContainer'
import { useUserStore } from '@/store/modules/user'
import { workbenchApi } from '@/api'
import type { DashboardOverview, DashboardWarningItem } from '@/api/modules/workbench'
import { hasAnyPermission } from '@/router/menu'
import { PERMISSIONS } from '@/router/routes'
import { workbenchConfigs, defaultWorkbenchConfig } from './configs'
import { applyRealData } from './view-model'
import {
  AlertBanner,
  MetricRow,
  MainPanel,
  StatsPanel,
  TrendPanel,
  QuickLinksRow,
} from './components'
import './index.less'

/** 空权限数组常量（避免选择器每次返回新引用导致重复请求） */
const EMPTY_PERMISSIONS: string[] = []

/** 按当前时段生成问候语 */
function greetingWord(): string {
  const hour = new Date().getHours()
  if (hour < 6) return '凌晨好'
  if (hour < 12) return '早上好'
  if (hour < 14) return '中午好'
  if (hour < 18) return '下午好'
  return '晚上好'
}

export default function Workbench() {
  const userInfo = useUserStore((state) => state.userInfo)
  const permissions = useUserStore((state) => state.userInfo?.permissions ?? EMPTY_PERMISSIONS)
  const [overview, setOverview] = useState<DashboardOverview>()
  const [warnings, setWarnings] = useState<DashboardWarningItem[]>([])
  /** 无健康预警查看权限时不请求预警清单（后端会返回 403） */
  const canViewWarnings = hasAnyPermission([PERMISSIONS.WARN_VIEW], permissions)

  useEffect(() => {
    workbenchApi
      .getOverview()
      .then((res) => setOverview(res))
      .catch(() => undefined)
    if (!canViewWarnings) return
    workbenchApi
      .getWarnings()
      .then((res) => setWarnings(res.list.slice(0, 5)))
      .catch(() => undefined)
  }, [canViewWarnings])

  const config = useMemo(() => {
    const positionCode = userInfo?.positionCode
    const base = (positionCode && workbenchConfigs[positionCode]) || defaultWorkbenchConfig
    return applyRealData(base, overview, warnings, permissions)
  }, [userInfo?.positionCode, overview, warnings, permissions])

  const title = config.greeting
    ? `${greetingWord()}，${userInfo?.nickname || '用户'}`
    : (config.title ?? '工作台')

  const hasPanels = Boolean(config.main || config.side)

  return (
    <div className="workbench-page">
      <PageContainer title={title} description={config.subtitle}>
        {config.banner && <AlertBanner config={config.banner} />}
        <MetricRow items={config.metrics} />
        {hasPanels && (
          <div
            className={`workbench-page__panels${config.main && config.side ? '' : ' workbench-page__panels--single'}`}
          >
            {config.main && <MainPanel config={config.main} />}
            {config.side?.type === 'stats' && <StatsPanel config={config.side} />}
            {config.side?.type === 'trend' && <TrendPanel config={config.side} />}
          </div>
        )}
        <QuickLinksRow title={config.quickLinksTitle} links={config.quickLinks} />
      </PageContainer>
    </div>
  )
}
