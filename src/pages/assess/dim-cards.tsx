/**
 * AI长者健康力测评 - 六维健康力结果卡片组
 * 供 AI分析确认页（analysis.tsx）复用，样式与详情页（detail.tsx）一致
 */
import { Card } from 'antd'
import { RISK_LEVEL, mockDimensions } from './mock'

export function DimensionCards() {
  return (
    <div className="as-dims">
      {mockDimensions.map((d) => (
        <Card key={d.key} className={`as-dim-card as-dim-card--${d.level}`}>
          <div className="as-dim-card__header">
            <span className="as-dim-card__name">{d.name}</span>
            <span className={RISK_LEVEL[d.level].cls}>{RISK_LEVEL[d.level].text}</span>
          </div>
          <div className="as-dim-card__summary">{d.summary}</div>
        </Card>
      ))}
    </div>
  )
}
