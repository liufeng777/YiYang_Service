/**
 * AI长者健康力测评 - 共享组件：六维健康力结果卡片
 */
import { RISK_LEVEL, mockDimensions } from './mock'
import './index.less'

export function DimensionCards() {
  return (
    <div className="as-dims">
      {mockDimensions.map((d) => (
        <div key={d.key} className={`as-dim-card as-dim-card--${d.level}`}>
          <div className="as-dim-card__name">{d.name}</div>
          <span className={`as-tag ${RISK_LEVEL[d.level].cls}`}>{RISK_LEVEL[d.level].text}</span>
          <div className="as-dim-card__summary">{d.summary}</div>
        </div>
      ))}
    </div>
  )
}
