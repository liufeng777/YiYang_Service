/**
 * 线索管理 - 转档成功（设计稿：自动建档成功.png）
 * 实名认证完成后系统自动创建最小健康档案
 */
import { Button } from 'antd'
import { CheckOutlined } from '@ant-design/icons'
import { useNavigate, useParams } from 'react-router-dom'
import { mockConvertResult } from './mock'
import './index.less'

export default function LeadConvertSuccess() {
  const navigate = useNavigate()
  const { id } = useParams()

  // TODO: 接入后端后由 leadApi.convertLead 出参渲染（档案编号 / 服务对象 / 状态）
  const result = mockConvertResult
  void id

  const rows = [
    { label: '档案编号', value: result.profileNo },
    { label: '服务对象', value: `${result.memberName} · ${result.memberAge}岁` },
    { label: '档案来源', value: result.source },
    { label: '所属机构', value: result.orgName },
  ]

  return (
    <div className="lead-page lead-success">
      <div className="lead-success__card">
        <div className="lead-success__icon">
          <CheckOutlined />
        </div>
        <h1 className="lead-success__title">实名认证完成，健康档案已自动创建</h1>
        <p className="lead-success__subtitle">最小健康档案已生成，当前为"档案待完善 / 未纳管"</p>

        <div className="lead-success__rows">
          {rows.map((row) => (
            <div key={row.label} className="lead-success__row">
              <span className="lead-success__label">{row.label}</span>
              <span className="lead-success__value">{row.value}</span>
            </div>
          ))}
          <div className="lead-success__row">
            <span className="lead-success__label">当前状态</span>
            <span className="lead-success__value lead-success__value--status">{result.status}</span>
          </div>
        </div>

        <div className="lead-success__actions">
          <Button onClick={() => navigate('/leads')}>返回线索列表</Button>
          <Button type="primary" onClick={() => navigate('/health-record')}>
            查看健康档案
          </Button>
        </div>
      </div>
    </div>
  )
}
