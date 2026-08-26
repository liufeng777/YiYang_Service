/**
 * AI长者健康力测评 - 测评模板（设计稿：W-HEALTH-P1-06）
 * 一期仅展示两个固定、版本化模板，支持下载空白PDF，不提供在线编辑
 */
import { Button, message } from 'antd'
import { DownloadOutlined, FilePdfOutlined } from '@ant-design/icons'
import PageContainer from '@/components/PageContainer'
import { mockTemplates } from './mock'
import './index.less'

export default function AssessTemplates() {
  return (
    <PageContainer
      title="测评模板"
      description="一期仅展示两个固定、版本化模板，支持下载空白PDF，不提供在线编辑"
    >
      <div className="as-footnote as-footnote--green as-tpl-banner">
        一期范围：固定模板 · 统一录入 · AI分析 · 专业确认。预留模板ID、版本、状态、PDF地址和适用机构字段。
      </div>

      <div className="as-tpl-grid">
        {mockTemplates.map((t) => (
          <div key={t.id} className="as-card as-tpl-card as-tpl-card--page">
            <div className="as-tpl-card__head">
              <FilePdfOutlined className="as-tpl-card__icon" />
              <span className="as-tpl-card__name">《{t.name}》</span>
              <span className="as-tag as-tag--done">启用中</span>
            </div>
            <div className="as-tpl-card__desc">{t.desc}</div>
            <div className="as-meta-list">
              <div className="as-meta-list__row">
                <span>适用评测</span>
                <span>{t.applicable}</span>
              </div>
              <div className="as-meta-list__row">
                <span>主要来源</span>
                <span>{t.mainSource}</span>
              </div>
              <div className="as-meta-list__row">
                <span>版本号</span>
                <span>{t.version}</span>
              </div>
              <div className="as-meta-list__row">
                <span>更新时间</span>
                <span>{t.updatedAt}</span>
              </div>
            </div>
            <Button
              type="primary"
              ghost
              icon={<DownloadOutlined />}
              onClick={() => message.success(`开始下载《${t.name} ${t.version}》空白PDF（mock）`)}
            >
              下载空白PDF
            </Button>
          </div>
        ))}
      </div>

      <div className="as-card">
        <div className="as-card__header">
          <span className="as-card__title">后续扩展能力（一期不展开）</span>
        </div>
        <div className="as-tpl-future">
          多版本模板管理、机构级模板适用范围配置、OCR 自动识别纸质问卷、自定义题目与评分规则。
          相关字段（模板ID、版本、状态、PDF地址、适用机构）已在数据模型中预留。
        </div>
      </div>
    </PageContainer>
  )
}
