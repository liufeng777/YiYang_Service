/**
 * AI长者健康力测评 - 测评列表（设计稿：W-HEALTH-P1-01 / P1-01A 下载空白评测表）
 * TODO: 接入后端后对齐 API §4.1 评估列表 GET /api/v1/staff/members/:id/assessments
 */
import { useMemo, useState } from 'react'
import { Button, DatePicker, Input, Modal, Select, Table } from 'antd'
import {
  DownloadOutlined,
  FilePdfOutlined,
  PlusOutlined,
  SearchOutlined,
} from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import PageContainer from '@/components/PageContainer'
import {
  ASSESS_STATUS,
  RISK_LEVEL,
  mockAssessList,
  mockTemplates,
  type AssessRecord,
} from './mock'
import './index.less'

/** 下载空白评测表 Modal（P1-01A） */
function TemplateDownloadModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <Modal
      title="下载空白评测表"
      open={open}
      onCancel={onClose}
      footer={
        <Button type="primary" onClick={onClose}>
          关闭
        </Button>
      }
      width={640}
    >
      <div className="as-tpl-modal">
        {mockTemplates.map((t) => (
          <div key={t.id} className="as-tpl-card">
            <div className="as-tpl-card__head">
              <FilePdfOutlined className="as-tpl-card__icon" />
              <span className="as-tpl-card__name">《{t.name}》</span>
              <span className="as-tag as-tag--doing">{t.version}</span>
            </div>
            <div className="as-tpl-card__desc">{t.desc}</div>
            <div className="as-tpl-card__foot">
              <span className="as-tpl-card__updated">更新时间 {t.updatedAt}</span>
              <Button type="primary" ghost icon={<DownloadOutlined />}>
                下载PDF
              </Button>
            </div>
          </div>
        ))}
      </div>
    </Modal>
  )
}

export default function AssessList() {
  const navigate = useNavigate()
  const [keyword, setKeyword] = useState('')
  const [downloadOpen, setDownloadOpen] = useState(false)

  const list = useMemo(
    () => mockAssessList.filter((r) => !keyword || r.name.includes(keyword)),
    [keyword],
  )

  const columns = [
    {
      title: '测评对象',
      dataIndex: 'name',
      key: 'name',
      render: (v: string, row: AssessRecord) => (
        <div>
          <div className="as-row__name">{v}</div>
          <div className="as-row__sub">
            {row.gender} · {row.age}岁
          </div>
        </div>
      ),
    },
    { title: '所属机构', dataIndex: 'org', key: 'org' },
    {
      title: '评测类型 / 来源',
      key: 'type',
      render: (_: unknown, row: AssessRecord) => (
        <div>
          <div>{row.type}</div>
          <div className="as-row__sub">{row.source}</div>
        </div>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (v: AssessRecord['status']) => (
        <span className={`as-tag ${ASSESS_STATUS[v].cls}`}>{ASSESS_STATUS[v].text}</span>
      ),
    },
    {
      title: '综合风险提示',
      key: 'risk',
      render: (_: unknown, row: AssessRecord) => (
        <div>
          <div>{row.riskText}</div>
          <span className={`as-tag ${RISK_LEVEL[row.risk].cls}`}>{RISK_LEVEL[row.risk].text}</span>
        </div>
      ),
    },
    { title: '评测人员', dataIndex: 'assessor', key: 'assessor' },
    { title: '更新时间', dataIndex: 'updatedAt', key: 'updatedAt' },
    {
      title: '操作',
      key: 'action',
      width: 190,
      render: (_: unknown, row: AssessRecord) => (
        <div className="as-row__actions">
          {row.status === 'done' && (
            <Button type="link" size="small" onClick={() => navigate(`/assessment/${row.id}`)}>
              查看详情
            </Button>
          )}
          {row.status === 'pending' && (
            <Button type="link" size="small" onClick={() => navigate(`/assessment/${row.id}/analysis`)}>
              AI分析
            </Button>
          )}
          {row.status === 'in-progress' && (
            <Button type="link" size="small" onClick={() => navigate(`/assessment/${row.id}/entry`)}>
              继续录入
            </Button>
          )}
          <Button
            type="link"
            size="small"
            onClick={() =>
              navigate(`/assessment/${row.id}/entry${row.source === 'C端自主测评' ? '?mode=sync' : ''}`)
            }
          >
            原始答案
          </Button>
        </div>
      ),
    },
  ]

  return (
    <PageContainer
      title="AI长者健康力测评"
      description="统一管理C端自主测评与专业人员录入，AI分析后由专业人员确认"
      extra={
        <>
          <Button onClick={() => navigate('/assessment/templates')}>测评模板</Button>
          <Button icon={<DownloadOutlined />} onClick={() => setDownloadOpen(true)}>
            下载空白评测表
          </Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/assessment/create')}>
            新建测评
          </Button>
        </>
      }
    >
      {/* 筛选区 */}
      <div className="as-card as-filters">
        <Input
          className="as-filters__keyword"
          prefix={<SearchOutlined />}
          placeholder="测评对象姓名"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value.trim())}
          allowClear
        />
        <Select className="as-filters__item" placeholder="所属机构" allowClear options={['城东护理院', '幸福里健康驿站', '康宁护理院'].map((v) => ({ value: v, label: v }))} />
        <Select className="as-filters__item" placeholder="评测类型" allowClear options={['居家快速测评', '专业健康力评测'].map((v) => ({ value: v, label: v }))} />
        <Select className="as-filters__item" placeholder="评测来源" allowClear options={['C端自主测评', '面访问答', '电话访谈', '纸质问卷录入', '现场专业评测'].map((v) => ({ value: v, label: v }))} />
        <Select className="as-filters__item" placeholder="评测状态" allowClear options={Object.entries(ASSESS_STATUS).map(([v, s]) => ({ value: v, label: s.text }))} />
        <DatePicker.RangePicker className="as-filters__item" placeholder={['评测开始', '评测结束']} />
        <Button type="primary">查询</Button>
        <Button onClick={() => setKeyword('')}>重置</Button>
      </div>

      {/* 列表 */}
      <div className="as-card">
        <div className="as-card__header">
          <span className="as-card__title">共 128 条测评记录</span>
        </div>
        <Table<AssessRecord> rowKey="id" columns={columns} dataSource={list} pagination={false} />
      </div>

      {/* 状态说明 */}
      <div className="as-footnote as-footnote--green">
        状态说明：评测中＝专业人员录入未完成；待确认＝AI 分析已生成，等待专业人员确认；已完成＝专业人员确认后归档到健康档案，不同量表得分不合并为单一总分。
      </div>

      <TemplateDownloadModal open={downloadOpen} onClose={() => setDownloadOpen(false)} />
    </PageContainer>
  )
}
