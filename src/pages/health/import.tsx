/**
 * 健康档案 - 批量导入（设计稿：上传与校验.png / 导入结果.png）
 * TODO: 导入相关接口 API v0.1 未定义，当前以本地状态演示完整流程
 */
import { useState } from 'react'
import { Button, Checkbox, Select, Upload } from 'antd'
import {
  CheckOutlined,
  DownloadOutlined,
  FileExcelOutlined,
  ArrowLeftOutlined,
  PlusOutlined,
} from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import PageContainer from '@/components/PageContainer'
import { mockImportPreview, mockImportResult } from './mock'
import './index.less'

/** 导入结果视图（设计稿：导入结果.png） */
function ImportResult() {
  const navigate = useNavigate()
  const r = mockImportResult
  return (
    <div className="hr-success">
      <div className="hr-success__card">
        <div className="hr-success__icon">
          <CheckOutlined />
        </div>
        <div className="hr-success__title">批量导入完成</div>
        <div className="hr-success__subtitle">导入批次：{r.batchNo}</div>

        <div className="hr-success__member">
          <div className="hr-success__avatar">
            <FileExcelOutlined />
          </div>
          <div>
            <div className="hr-success__name">本次导入汇总</div>
            <div className="hr-success__meta">
              创建{r.created}份 · 关联{r.linked}份 · 失败{r.failed}份 · 待实名{r.pendingRealname}份
            </div>
            <div className="hr-success__tags">
              <span className="hr-tag hr-tag--risk-low">创建{r.created}</span>
              <span className="hr-tag hr-tag--disease">关联{r.linked}</span>
              <span className="hr-tag hr-tag--risk-mid">失败{r.failed}</span>
              <span className="hr-tag hr-tag--risk-mid">待实名{r.pendingRealname}</span>
            </div>
          </div>
        </div>

        <div className="hr-success__banner">
          <div>
            <div className="hr-success__banner-title">{r.created}份最小健康档案已创建</div>
            <div className="hr-success__banner-sub">已同步运营所需字段，医疗健康明细仍按专业权限管理</div>
          </div>
          <span className="hr-success__banner-status">同步正常</span>
        </div>

        <div className="hr-success__note">新建档案统一进入待分配团队；失败明细可下载修改后重新导入。</div>
        <div className="hr-success__actions">
          <Button icon={<DownloadOutlined />}>下载失败明细</Button>
          <Button type="primary" onClick={() => navigate('/health-record')}>
            查看导入档案
          </Button>
        </div>
      </div>
    </div>
  )
}

export default function HealthRecordImport() {
  const navigate = useNavigate()
  const [fileName, setFileName] = useState<string | null>(mockImportPreview.fileName)
  const [confirmed, setConfirmed] = useState(false)
  const [done, setDone] = useState(false)
  const p = mockImportPreview

  if (done) {
    return (
      <div className="hr-page">
        <PageContainer
          title="批量导入健康档案"
          description="导入已完成，可查看创建、关联和失败明细"
          extra={
            <Button icon={<ArrowLeftOutlined />} color="primary" variant="outlined" onClick={() => navigate('/health-record')}>
              返回档案列表
            </Button>
          }
        >
          <ImportResult />
        </PageContainer>
      </div>
    )
  }

  const previewFields: Array<{ label: string; value: string | number }> = [
    { label: '总记录', value: fileName ?? '' },
    { label: '可创建档案', value: p.creatable },
    { label: '已有关联档案', value: p.linked },
    { label: '校验失败', value: p.failed },
    { label: '实名匹配', value: `${p.realnameMatched} / ${p.total}` },
    { label: '注册会员待实名', value: `${p.pendingRealname} / ${p.total}` },
    { label: '必填字段完整', value: `${p.requiredComplete} / ${p.total}` },
    { label: '手机号重复', value: p.phoneDuplicated },
  ]

  return (
    <div className="hr-page">
      <PageContainer
        title="批量导入健康档案"
        description="下载标准模板并上传 Excel，系统自动校验会员、实名状态、重复档案和必填字段"
        extra={
          <Button icon={<ArrowLeftOutlined />} color="primary" variant="outlined" onClick={() => navigate('/health-record')}>
            返回档案列表
          </Button>
        }
      >
        {/* 文件信息条 */}
        {fileName && (
          <div className="hr-import__filebar">
            <div className="hr-import__filebar-left">
              <span className="hr-import__file-icon">
                <FileExcelOutlined />
              </span>
              <div>
                <div className="hr-import__file-name">{fileName}</div>
                <div className="hr-import__file-meta">{p.fileMeta}</div>
              </div>
            </div>
            <div className="hr-import__filebar-right">
              <span className="hr-tag hr-tag--disease">{p.scope}</span>
              <span className="hr-import__file-note">{p.note}</span>
            </div>
          </div>
        )}

        <div className="hr-import__panels">
          {/* 1. 下载模板并上传文件 */}
          <div className="hr-card hr-import__card">
            <div className="hr-card__title">1. 下载模板并上传文件</div>
            <div className="hr-import__desc">
              仅支持 XLSX；请勿修改表头。导入对象必须能够完成实名匹配。
            </div>
            <div className="hr-create__field-label">导入模板</div>
            <Select
              value="健康档案导入模板 V1.0"
              options={[{ value: '健康档案导入模板 V1.0', label: '健康档案导入模板 V1.0' }]}
            />
            <Upload.Dragger
              className="hr-import__dragger"
              accept=".xlsx"
              showUploadList={false}
              beforeUpload={(file) => {
                setFileName(file.name)
                return false
              }}
            >
              <div className="hr-import__dragger-plus">
                <PlusOutlined />
              </div>
              <div className="hr-import__dragger-text">拖拽或点击上传 Excel</div>
              <div className="hr-import__dragger-hint">单个文件不超过20MB，最多5000条记录</div>
              <Button type="primary">选择文件</Button>
            </Upload.Dragger>

            {fileName && (
              <>
                <div className="hr-create__field-label hr-import__files-label">已选择文件</div>
                <div className="hr-import__files">
                  <div className="hr-import__file-card">
                    <div className="hr-import__file-card-name">{fileName}</div>
                    <div className="hr-import__file-card-meta">XLSX · 86KB · 120条</div>
                    <Button type="link" danger size="small" onClick={() => setFileName(null)}>
                      删除
                    </Button>
                  </div>
                  <div className="hr-import__file-card hr-import__file-card--tpl">
                    <div className="hr-import__file-card-name">下载标准模板</div>
                    <div className="hr-import__file-card-meta">模板版本 V1.0</div>
                    <Button type="link" danger size="small">
                      删除
                    </Button>
                  </div>
                </div>
                <div className="hr-import__parsed">
                  <CheckOutlined /> 文件解析完成，请核对右侧校验与匹配结果
                </div>
              </>
            )}
          </div>

          {/* 2. 校验与匹配预览 */}
          <div className="hr-card hr-import__card">
            <div className="hr-card__header">
              <span className="hr-card__title">2. 校验与匹配预览</span>
              {fileName && <span className="hr-tag hr-tag--risk-low">校验完成</span>}
            </div>
            <div className="hr-import__desc">
              错误记录不会导入；重复档案只做关联，不新建第二份档案。
            </div>
            {fileName ? (
              <>
                <div className="hr-import__preview">
                  {previewFields.map((f) => (
                    <div key={f.label} className="hr-import__preview-item">
                      <div className="hr-import__preview-label">{f.label}</div>
                      <div className="hr-import__preview-value">{f.value}</div>
                    </div>
                  ))}
                </div>
                <div className="hr-import__note">
                  <span className="hr-import__note-label">处理说明</span>
                  {p.summary}
                </div>
                <Checkbox checked={confirmed} onChange={(e) => setConfirmed(e.target.checked)}>
                  我已确认校验结果和重复档案处理规则
                </Checkbox>
              </>
            ) : (
              <div className="hr-import__empty">上传文件后展示校验与匹配预览</div>
            )}
          </div>
        </div>

        {/* 底部操作条 */}
        <div className="hr-import__footer">
          <span className="hr-import__footer-note">
            确认后创建最小健康档案并进入待分配团队；操作人、文件和结果完整留痕。
          </span>
          <div className="hr-import__footer-actions">
            <Button onClick={() => navigate('/health-record')}>取消</Button>
            <Button type="primary" disabled={!fileName || !confirmed} onClick={() => setDone(true)}>
              确认导入
            </Button>
          </div>
        </div>
      </PageContainer>
    </div>
  )
}
