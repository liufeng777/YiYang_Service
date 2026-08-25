/**
 * 管理目标 - 会员信息条（发起目标制定 / 制定管理目标向导共用）
 * 展示会员基本信息、病种标签、责任团队与当前管理周期
 */
import { Avatar } from 'antd'
import { mockGoalMember } from './mock'

export default function GoalMemberBar() {
  const m = mockGoalMember
  return (
    <div className="goal-member">
      <div className="goal-member__main">
        <Avatar className="goal-member__avatar" size={44}>
          {m.name.slice(0, 1)}
        </Avatar>
        <div>
          <div className="goal-member__name">
            {m.name}
            <span className="goal-member__meta">
              {m.gender} · {m.age}岁
            </span>
            {m.diseases.map((d) => (
              <span key={d.name} className={`goal-tag goal-tag--${d.color}`}>
                {d.name}
              </span>
            ))}
            <span className="goal-tag goal-tag--orange">分层：{m.level}</span>
          </div>
          <div className="goal-member__sub">
            当前管理周期：{m.periodStart} 至 {m.periodEnd}
          </div>
        </div>
      </div>
      <div className="goal-member__side">
        <div className="goal-member__item">
          <span className="goal-member__label">责任医生</span>
          <span>{m.doctor}</span>
        </div>
        <div className="goal-member__item">
          <span className="goal-member__label">责任健管师</span>
          <span>{m.manager}</span>
        </div>
      </div>
    </div>
  )
}
