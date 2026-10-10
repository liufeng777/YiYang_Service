/**
 * AI长者健康力测评 - 新建测评（设计稿：W-HEALTH-P1-02）
 * 三步：选择评测对象 → 评测类型与来源 → 评测模板与原始留痕
 * TODO: 接入后端后对齐 API §4.5 发起评估 POST /api/v1/staff/members/:id/assessments
 */
import { useState } from 'react'
import { Button, Input, Radio, Select, message, Upload, UploadProps } from 'antd'
import { ArrowLeftOutlined, UploadOutlined, SearchOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import PageContainer from '@/components/PageContainer'
import { mockTemplates, type AssessSource, type AssessType } from './mock'
const { Dragger } = Upload;
import './index.less'

const TYPE_OPTIONS: { value: AssessType; desc: string }[] = [
  { value: '居家快速测评', desc: '患者或家属居家填写，快速筛查六维健康力' },
  { value: '专业健康力评测', desc: '由医护或健管师通过面访、电话或现场评测完成' },
]

const SOURCE_OPTIONS: AssessSource[] = ['面访问答', '电话访谈', '纸质问卷录入', '现场专业评测']

export default function AssessCreate() {
  const navigate = useNavigate()
  const [keyword, setKeyword] = useState('')
  const [found, setFound] = useState(false)
  const [type, setType] = useState<AssessType>('专业健康力评测')
  const [source, setSource] = useState<AssessSource>('纸质问卷录入')
  const [templateId, setTemplateId] = useState('T-PRO')

  const template = mockTemplates.find((t) => t.id === templateId);

  const props: UploadProps = {
    name: 'file',
    multiple: false,
    action: '',
    onChange(info) {
      const { status } = info.file;
      if (status !== 'uploading') {
        console.log(info.file, info.fileList);
      }
      if (status === 'done') {
        message.success(`${info.file.name} file uploaded successfully.`);
      }
      if (status === 'error') {
        message.error(`${info.file.name} file upload failed.`);
      }
    },
    onDrop(e) {
      console.log('Dropped files', e.dataTransfer.files);
    },
  };


  return (
    <PageContainer
      title="新建健康力测评"
      description="选择评测对象与模板，录入完成后由 AI 辅助分析、专业人员确认"
      extra={
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/assessment')}>返回测评列表</Button>
        
      }
    >
      {/* 1 选择评测对象 */}
      <div className="as-card as-target">
        <div>
          <div className="as-card__header">
            <span className="as-card__title">1. 选择评测对象</span>
          </div>
          <div className="as-create__search">
            <Input
              prefix={<SearchOutlined />}
              placeholder="输入姓名 / 手机号 / 档案编号查找对象"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value.trim())}
              onPressEnter={() => setFound(true)}
            />
            <Button type="primary" onClick={() => (keyword ? setFound(true) : message.info('请输入查找内容'))}>
              查询档案
            </Button>
          </div>
        </div>
        {found && (
          <div className="as-member-hit">
            <div className="as-member-hit__main">
              <div style={{display: 'flex', justifyContent: 'space-between'}}>
                <span className="as-member-hit__name">张桂芳 女 67岁</span>
                <span className="as-tag as-tag--done">已关联健康档案</span>
              </div>
              <span className="as-member-hit__meta">手机号: 138****6021</span>
              <span className="as-member-hit__meta">档案: HF202608120038</span>
              <div className="as-member-hit__meta">所属机构: 城东护理院</div>
            </div>
            
          </div>
        )}
      </div>

      {/* 2 评测类型与来源 */}
      <div className="as-card">
        <div className="as-card__header">
          <span className="as-card__title">2. 评测类型与来源</span>
        </div>
        <Radio.Group
          className="as-type-cards"
          value={type}
          onChange={(e) => setType(e.target.value as AssessType)}
        >
          {TYPE_OPTIONS.map((o) => (
            <Radio key={o.value} value={o.value} className="as-type-card">
              <div className="as-type-card__name">{o.value}</div>
              <div className="as-type-card__desc">{o.desc}</div>
            </Radio>
          ))}
        </Radio.Group>
        <div className="as-create__source">
          <span className="as-create__source-label">评测来源</span>
          <Radio.Group
            value={source}
            onChange={(e) => setSource(e.target.value as AssessSource)}
            options={SOURCE_OPTIONS.map((s) => ({ value: s, label: s }))}
          />
        </div>
      </div>

      {/* 3 评测模板与原始留痕 */}
      <div className="as-card">
        <div className="as-card__header">
          <span className="as-card__title">3. 评测模板与原始留痕</span>
        </div>
        <div className="as-create__tpl">
          <div className="as-create__tpl-field">
            <span className="as-create__source-label">评测模板</span>
            <Select
              value={templateId}
              onChange={setTemplateId}
              options={mockTemplates.map((t) => ({ value: t.id, label: `《${t.name} ${t.version}》` }))}
            />
          </div>
          <div className="as-create__tpl-field">
            <span className="as-create__source-label">本次使用版本</span>
            <Input value={template?.version} disabled />
          </div>
        </div>
        <div className="as-upload-box">
            <Dragger {...props}>
              <Button>
                <UploadOutlined /> 上传文件
              </Button>
              <p className="as-upload-box__hint">上传问卷照片或扫描件</p>
              <p className="as-upload-box__btn">
              支持 JPG / PNG / PDF，作为原始留痕；一期不做OCR识别
          </p>
          </Dragger>
        </div>
        <div className="as-footnote">
          模板ID、版本、来源、PDF地址、模板状态已作为基础字段预留，后续支持多版本模板管理。
        </div>
        {/* 底部操作 */}
        <div className="as-footer-actions">
          <Button onClick={() => navigate('/assessment')}>取消</Button>
          <Button onClick={() => message.success('草稿已保存（mock）')}>保存草稿</Button>
          <Button
            type="primary"
            disabled={!found}
            onClick={() => navigate('/assessment/A20260819001/entry')}
          >
            开始录入
          </Button>
        </div>
      </div>
    </PageContainer>
  )
}
