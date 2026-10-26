/**
 * 异常处理 - 健康异常处理（设计稿：风险处置.png）
 * 核实患者健康状况、完成风险分级并转交医生或健康管理团队跟进
 * TODO: 健康异常处置接口 API v0.1 未定义，待后端补充
 */
import { useState } from 'react'
import { Button, Input, Select, message } from 'antd'
import { ArrowLeftOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import PageContainer from '@/components/PageContainer'
import { mockHealthException } from './mock'
import './index.less'

export default function ExceptionHealth() {
  const navigate = useNavigate()
  const e = mockHealthException
  const [riskLevel, setRiskLevel] = useState('紧急')
  const [target, setTarget] = useState<string>()
  const [deadline, setDeadline] = useState(e.defaultDeadline)
  const [note, setNote] = useState('')

  const onSubmit = () => {
    if (!target) {
      message.warning('请选择转交对象')
      return
    }
    // TODO: 健康异常处置接口待后端补充
    message.success('健康处置已提交，已生成健康风险待办并同步至患者健康档案')
    navigate('/exception')
  }

  return (
    <div className="ex-page">
      <PageContainer
        title="健康异常处理"
        description="核实患者健康状况、完成风险分级并转交医生或健康管理团队跟进"
        extra={
          <span className="ex-detail__extra">
            <span className="ex-tag ex-tag--red">待受理</span>
            <Button icon={<ArrowLeftOutlined />} color="primary" variant="outlined" onClick={() => navigate('/exception')}>返回列表</Button>
          </span>
        }
      >
        <div className="ex-banner ex-banner--danger">{e.banner}</div>

        <div className="ex-detail">
          <div className="ex-detail__main">
            {/* 原始上报 */}
            <div className="ex-card">
              <div className="ex-card__header">
                <span className="ex-card__title">原始上报</span>
                <span className="ex-card__header-tags">
                  <span className="ex-tag ex-tag--green">服务人员助手端</span>
                  <span className="ex-tag ex-tag--red">健康异常</span>
                </span>
              </div>
              <div className="ex-kv">
                <span className="ex-kv__label">异常编号</span>
                <span className="ex-kv__value">{e.id}</span>
              </div>
              <div className="ex-kv">
                <span className="ex-kv__label">异常类型</span>
                <span className="ex-kv__value">{e.report.type}</span>
              </div>
              <div className="ex-kv ex-kv--top">
                <span className="ex-kv__label">异常描述</span>
                <span className="ex-kv__value ex-kv__value--normal">{e.report.desc}</span>
              </div>
              <div className="ex-kv">
                <span className="ex-kv__label">上报人员</span>
                <span className="ex-kv__value">{e.report.reporter}</span>
              </div>
              <div className="ex-kv">
                <span className="ex-kv__label">上报时间</span>
                <span className="ex-kv__value">{e.report.reportedAt}</span>
              </div>
              <div className="ex-kv">
                <span className="ex-kv__label">附件</span>
                <span className="ex-kv__value ex-kv__value--normal">
                  {e.report.attachments.map((a) => (
                    <span key={a} className="ex-tag ex-tag--blue">
                      {a}
                    </span>
                  ))}
                </span>
              </div>
            </div>

            {/* 关联订单与工单 */}
            <div className="ex-card">
              <div className="ex-card__header">
                <span className="ex-card__title">关联订单与工单</span>
              </div>
              <div className="ex-kv">
                <span className="ex-kv__label">订单编号</span>
                <span className="ex-kv__value ex-text--primary">{e.order.orderNo}</span>
              </div>
              <div className="ex-kv">
                <span className="ex-kv__label">工单编号</span>
                <span className="ex-kv__value ex-text--primary">{e.order.woNo}</span>
              </div>
              <div className="ex-kv">
                <span className="ex-kv__label">服务项目</span>
                <span className="ex-kv__value">{e.order.service}</span>
              </div>
              <div className="ex-kv">
                <span className="ex-kv__label">服务对象</span>
                <span className="ex-kv__value">{e.order.member}</span>
              </div>
              <div className="ex-kv">
                <span className="ex-kv__label">预约时间</span>
                <span className="ex-kv__value">{e.order.appointment}</span>
              </div>
              <div className="ex-kv">
                <span className="ex-kv__label">服务地址</span>
                <span className="ex-kv__value">{e.order.address}</span>
              </div>
              <div className="ex-kv">
                <span className="ex-kv__label">执行人员</span>
                <span className="ex-kv__value">{e.order.staff}</span>
              </div>
            </div>
          </div>

          {/* 健康风险处置 */}
          <div className="ex-card ex-detail__side">
            <div className="ex-card__header">
              <span className="ex-card__title">健康风险处置</span>
            </div>
            <div className="ex-note">提交后生成健康风险待办，并同步至患者健康档案</div>
            <div className="ex-field">
              <div className="ex-field__label">
                健康风险等级 <span className="ex-required">*</span>
              </div>
              <Select
                value={riskLevel}
                onChange={setRiskLevel}
                options={e.riskLevels.map((v) => ({ value: v, label: v }))}
              />
            </div>
            <div className="ex-field">
              <div className="ex-field__label">
                转交对象 <span className="ex-required">*</span>
              </div>
              <Select
                placeholder="请选择医生或健康管理团队"
                value={target}
                onChange={setTarget}
                options={e.transferTargets.map((v) => ({ value: v, label: v }))}
              />
            </div>
            <div className="ex-field">
              <div className="ex-field__label">
                要求响应时间 <span className="ex-required">*</span>
              </div>
              <Input value={deadline} onChange={(ev) => setDeadline(ev.target.value)} />
            </div>
            <div className="ex-field">
              <div className="ex-field__label">受理备注</div>
              <Input.TextArea
                rows={4}
                placeholder="可填写电话确认结果、处理要求等"
                value={note}
                onChange={(ev) => setNote(ev.target.value)}
              />
            </div>
            <div className="ex-tips">
              {e.tips.map((t) => (
                <div key={t}>· {t}</div>
              ))}
            </div>
            <div className="ex-detail__actions">
              <Button onClick={() => message.success('已标记误报，异常单关闭')}>标记误报</Button>
              <Button type="primary" onClick={onSubmit}>
                提交健康处置
              </Button>
            </div>
          </div>
        </div>
      </PageContainer>
    </div>
  )
}
