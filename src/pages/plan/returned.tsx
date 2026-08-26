/**
 * 健康管理方案 - 方案已退回修改（设计稿：医生退回.png）
 * 医生未通过审核，方案返回原健管师修改；退回不中断患者当前执行的旧版本
 * TODO: 退回记录 / 状态流转接口 API v0.1 未定义，当前为本地 mock
 */
import { Button } from 'antd'
import { ArrowRightOutlined } from '@ant-design/icons'
import { useNavigate, useParams } from 'react-router-dom'
import PageContainer from '@/components/PageContainer'
import { mockPlanReturned } from './mock'
import './index.less'

export default function PlanReturned() {
  const { id } = useParams()
  const navigate = useNavigate()
  const r = mockPlanReturned

  return (
    <div className="plan-page">
      <PageContainer
        title="方案已退回修改"
        description="医生未通过本次审核，方案返回原健管师修改，不影响患者当前正在执行的旧版本"
        extra={<span className="plan-tag plan-tag--danger">已退回</span>}
      >
        <div className="plan-returned">
          {/* 左：退回意见与需修改模块 */}
          <div className="plan-card">
            <div className="plan-card__header">
              <span className="plan-card__title">退回意见</span>
            </div>
            <div className="plan-returned__opinion">
              <div className="plan-returned__opinion-meta">
                {r.doctor} · {r.time}
              </div>
              <p>{r.opinion}</p>
            </div>
            <div className="plan-detail__section">需修改的模块</div>
            {r.modules.map((mod) => (
              <div key={mod.name} className="plan-module-card plan-returned__module">
                <span className="plan-module-card__title">{mod.name}</span>
                <span className="plan-module-card__desc">{mod.todo}</span>
                <Button
                  type="link"
                  size="small"
                  onClick={() => navigate(`/plan/${id ?? 1}/revise`)}
                >
                  去修改 <ArrowRightOutlined />
                </Button>
              </div>
            ))}
            <div className="plan-detail__section">版本关系</div>
            <div className="plan-returned__versions">
              {r.versionNote.map((v) => (
                <div key={v}>{v}</div>
              ))}
            </div>
          </div>

          {/* 右：状态流转与责任人 */}
          <div className="plan-detail__rail">
            <div className="plan-card">
              <div className="plan-card__header">
                <span className="plan-card__title">状态流转</span>
              </div>
              <div className="plan-returned__flow">
                {r.flow.map((s, i) => (
                  <div key={s} className="plan-returned__flow-step">
                    <span className={i === 1 ? 'plan-returned__flow-node plan-returned__flow-node--current' : 'plan-returned__flow-node'}>
                      {s}
                    </span>
                    {i < r.flowTransitions.length && (
                      <span className="plan-returned__flow-arrow">↓ {r.flowTransitions[i]}</span>
                    )}
                  </div>
                ))}
              </div>
              <div className="plan-data-note plan-returned__assignee">
                <div className="plan-data-note__title">责任人</div>
                <div>当前处理人：{r.assignee.handler}</div>
                <div>要求完成时间：{r.assignee.deadline}</div>
                <div>工作台待办：{r.assignee.todo}</div>
              </div>
            </div>
            <Button type="primary" block onClick={() => navigate(`/plan/${id ?? 1}/revise`)}>
              进入修改
            </Button>
          </div>
        </div>
      </PageContainer>
    </div>
  )
}
