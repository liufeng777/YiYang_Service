/**
 * 工作台
 * - 模板由登录用户岗位（positionCode）决定，见 configs.ts 模板注册表
 * - 侧边栏与快捷入口按权限码过滤（对齐《协同工作台-API设计》权限模型）
 * - 数据当前为设计稿示例 mock；接入后端后调用 workbenchApi.getOverview / getWarnings
 */
import { useMemo } from 'react'
import PageContainer from '@/components/PageContainer'
import { useUserStore } from '@/store/modules/user'
import { workbenchConfigs, defaultWorkbenchConfig } from './configs'
import { AlertBanner, MetricRow, MainPanel, StatsPanel, TrendPanel, QuickLinksRow } from './components'
import './index.less'

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

  const config = useMemo(() => {
    const positionCode = userInfo?.positionCode
    return (positionCode && workbenchConfigs[positionCode]) || defaultWorkbenchConfig
  }, [userInfo?.positionCode])

  const title = config.greeting
    ? `${greetingWord()}，${userInfo?.nickname ?? ''}`
    : (config.title ?? '工作台')

  return (
    <div className="workbench-page">
      <PageContainer title={title} description={config.subtitle}>
        {config.banner && <AlertBanner config={config.banner} />}
        <MetricRow items={config.metrics} />
        <div className="workbench-page__panels">
          <MainPanel config={config.main} />
          {config.side.type === 'stats' ? (
            <StatsPanel config={config.side} />
          ) : (
            <TrendPanel config={config.side} />
          )}
        </div>
        <QuickLinksRow title={config.quickLinksTitle} links={config.quickLinks} />
      </PageContainer>
    </div>
  )
}
