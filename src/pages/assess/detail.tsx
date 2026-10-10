/**
 * AI长者健康力测评 - 测评详情（设计稿：W-HEALTH-P1-05）
 * TODO: 接入后端后对齐 API §4.2 评估详情 GET /api/v1/staff/assessments/:id
 */
import { Button, Card, Col, message, Row, Space } from 'antd'
import { ArrowLeftOutlined, FilePdfOutlined, ReloadOutlined } from '@ant-design/icons'
import { useNavigate, useParams } from 'react-router-dom'
import PageContainer from '@/components/PageContainer';
import { ASSESS_STATUS, mockAiAnalysis, mockAssessDetail, mockProConfirm, RISK_LEVEL, mockDimensions } from './mock'
import './index.less'

export default function AssessDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const d = mockAssessDetail
  const ai = mockAiAnalysis
  const pro = mockProConfirm

  const meta = [
    { label: '评测类型', value: d.type },
    { label: '评测来源', value: d.source },
    { label: '模板版本', value: d.version },
    { label: '评测人员', value: d.assessor },
    { label: '专业确认', value: d.confirm },
    { label: 'AI分析版本', value: d.aiVersion },
  ]

  const trace = [
    { label: '原始问卷附件', value: d.attachment, action: '查看' },
    { label: 'AI分析生成', value: `${ai.generatedAt} · ${ai.version}` },
    { label: '专业确认', value: `${pro.confirmedAt} · ${pro.doctor}` },
    { label: '模板版本', value: d.version },
  ]

  return (
    <PageContainer
      title="健康力测评详情"
      description="已完成结果归入健康档案，六维结果分别呈现，不合并为单一总分"
      extra={
        <Space>
          <Button onClick={() => navigate(`/assessment/${id ?? 'A20260819001'}/entry`)}>查看原始答案</Button>
          <Button icon={<FilePdfOutlined />} onClick={() => message.info('打开原始问卷附件（mock）')}>
            查看附件
          </Button>
          <Button icon={<ReloadOutlined />} onClick={() => navigate('/assessment/create')}>
            重新评测
          </Button>
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/assessment')}>返回测评列表</Button>
        </Space>
      }
    >
      {/* 头卡 */}
      <div className="as-card as-detail-head">
        <div className="as-detail-head__main">
          <div className="as-detail-head__name">
            {d.name} {d.gender} {d.age}岁
            <span className={`as-tag ${ASSESS_STATUS[d.status].cls}`}>{ASSESS_STATUS[d.status].text}</span>
          </div>
          <div className="as-detail-head__meta">
            <Row gutter={[16, 16]}>
              {meta.map((m) => (
                <Col xs={24} sm={12} lg={8} key={m.label}>
                  <div key={m.label} className="as-detail-head__meta-item">
                    <span className="as-detail-head__meta-label">{m.label}: </span>
                    <span className="as-detail-head__meta-value">{m.value}</span>
                  </div>
                </Col>
              ))}
            </Row>
          </div>
        </div>
      </div>

      {/* 六维健康力结果 */}
      <div className="as-card">
        <div className="as-card__header">
          <span className="as-card__title">六维健康力结果</span>
        </div>
        <div className="as-dims">
          {mockDimensions.map((d) => (
            <Card key={d.key} className={`as-dim-card as-dim-card--${d.level}`}>
              <div className='as-dim-card__header'>
                <span className="as-dim-card__name">{d.name}</span>
                <span className={RISK_LEVEL[d.level].cls}>{RISK_LEVEL[d.level].text}</span>
              </div>
              <div className="as-dim-card__summary">{d.summary}</div>
            </Card>
          ))}
    </div>
      </div>

      <div className="as-analysis">
        {/* 左：AI分析结论 + 专业确认意见 */}
        <div>
          <div className="as-card">
            <div className="as-card__header">
              <span className="as-card__title">AI分析结论</span>
              <span className="as-row__sub">{ai.version} · {ai.generatedAt}</span>
            </div>
            {ai.sections.slice(1).map((s) => (
              <div key={s.title} className="as-ai-section">
                <div className="as-ai-section__title">{s.title}</div>
                <div className="as-ai-section__content">{s.content}</div>
              </div>
            ))}
          </div>
          <div className="as-card">
            <div className="as-card__header">
              <span className="as-card__title">专业确认意见</span>
              <span className="as-row__sub">{d.confirm}</span>
            </div>
            {pro.fields.slice(0, 5).map((f) => (
              <div key={f.label} className="as-meta-list__row as-meta-list__row--align-top">
                <span className='as-meta-list__label'>{f.label}</span>
                <span className='as-meta-list__value'>{f.value}</span>
              </div>
            ))}
            <div className="as-patient-note">
              面向患者：{pro.fields[5].value}
            </div>
          </div>
        </div>

        {/* 右：附件与操作留痕 */}
        <div className="as-card as-detail-side">
          <div className="as-card__header">
            <span className="as-card__title">附件与操作留痕</span>
          </div>
          {trace.map((t) => (
            <div key={t.label} className="as-meta-list__row">
              <span className='as-meta-list__label'>{t.label}</span>
              <span>
                <span className='as-meta-list__value'>{t.value}</span>
                {t.action && (
                  <Button type="link" size="small" onClick={() => message.info('查看附件（mock）')}>
                    {t.action}
                  </Button>
                )}
              </span>
            </div>
          ))}
          <div className="as-meta-list__row">
            <span className='as-meta-list__label'>归档状态</span>
            <span className="as-tag as-tag--done">{d.archived}</span>
          </div>
        </div>
      </div>
    </PageContainer>
  )
}
