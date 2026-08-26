/**
 * 人员管理 - 上传执业资质（设计稿：2.服务授权/展开.png）
 * 为专业人员上传证照照片，系统识别后提交人工审核
 * TODO: 接口见 @/api/modules/staff（§7.3 资质新增 POST /staff/staffs/:id/credentials），
 *       证照 OCR 识别接口待后端补充
 */
import { useState } from 'react'
import { Button, Checkbox, Input, Select, message } from 'antd'
import { CheckCircleFilled, PlusOutlined } from '@ant-design/icons'
import { useNavigate, useParams } from 'react-router-dom'
import PageContainer from '@/components/PageContainer'
import { mockCredentialUpload as u } from './mock'
import './index.less'

export default function CredentialUpload() {
  const navigate = useNavigate()
  const { id } = useParams()
  const [certType, setCertType] = useState(u.certTypes[0])
  const [files, setFiles] = useState(u.uploaded)
  const [confirmed, setConfirmed] = useState(false)

  const onSave = () => {
    if (files.length === 0) {
      message.warning('请至少上传 1 张证照照片')
      return
    }
    if (!confirmed) {
      message.warning('请先勾选「我已核对照片与识别信息一致」')
      return
    }
    // TODO: staffApi.createCredential(id, {...})；OCR 识别字段以后端返回为准
    message.success('证照已保存并提交人工审核（演示）')
    navigate(`/staff/${id ?? u.staff.id}`)
  }

  return (
    <div className="staff-page">
      <PageContainer
        title="上传执业资质"
        description={`为${u.staff.name}（护士）上传证照照片，系统识别后提交人工审核`}
        extra={<Button onClick={() => navigate(`/staff/${id ?? u.staff.id}`)}>返回执业资质</Button>}
      >
        {/* 人员头卡 */}
        <div className="staff-card staff-profile">
          <div className="staff-profile__main">
            <div className="staff-profile__avatar">{u.staff.name[0]}</div>
            <div>
              <div className="staff-profile__name">{u.staff.name}</div>
              <div className="staff-profile__meta">{u.staff.roleOrg}</div>
            </div>
            <span className="staff-tag staff-tag--blue">{u.staff.tag}</span>
          </div>
          <div className="staff-profile__side">
            <span className="staff-text--muted">{u.headNote}</span>
          </div>
        </div>

        <div className="staff-upload-layout">
          {/* 左：上传证照照片 */}
          <div className="staff-card">
            <div className="staff-card__title">1. 上传证照照片</div>
            <div className="staff-card__sub">{u.uploadTip}</div>
            <div className="staff-field">
              <div className="staff-field__label">
                证照类型 <span className="staff-required">*</span>
              </div>
              <Select
                value={certType}
                onChange={setCertType}
                options={u.certTypes.map((v) => ({ value: v, label: v }))}
              />
            </div>
            <div
              className="staff-upload-box"
              onClick={() => {
                setFiles((f) => [...f, { name: `${certType}·照片${f.length + 1}`, meta: 'JPG · 1.0MB' }])
                message.success('照片已上传（演示）')
              }}
            >
              <PlusOutlined className="staff-upload-box__icon" />
              <div className="staff-upload-box__title">点击上传证照照片</div>
              <div className="staff-upload-box__sub">{u.uploadLimit}</div>
              <Button type="primary">选择图片</Button>
            </div>
            <div className="staff-field__label">已上传</div>
            <div className="staff-uploaded">
              {files.map((f, i) => (
                <div key={`${f.name}-${i}`} className="staff-uploaded__item">
                  <div className="staff-uploaded__name">{f.name}</div>
                  <div className="staff-uploaded__meta">{f.meta}</div>
                  <span
                    className="staff-text--danger staff-uploaded__del"
                    onClick={() => setFiles((l) => l.filter((_, x) => x !== i))}
                  >
                    删除
                  </span>
                </div>
              ))}
            </div>
            {files.length > 0 && (
              <div className="staff-note staff-note--check">
                <CheckCircleFilled /> {u.ocrDoneNote}
              </div>
            )}
          </div>

          {/* 右：核对识别结果 */}
          <div className="staff-card">
            <div className="staff-card__header">
              <div className="staff-card__title">2. 核对识别结果</div>
              <span className="staff-tag staff-tag--green">系统已识别</span>
            </div>
            <div className="staff-card__sub">识别内容可修改；无法识别的字段再人工填写。</div>
            <div className="staff-form__grid staff-form__grid--2">
              {u.ocrFields.map((f) => (
                <div key={f.label} className="staff-field">
                  <div className="staff-field__label">
                    {f.label} {f.required && <span className="staff-required">*</span>}
                  </div>
                  <Input defaultValue={f.value} />
                </div>
              ))}
            </div>
            <div className="staff-note staff-note--warn">{u.ocrTip}</div>
            <Checkbox checked={confirmed} onChange={(e) => setConfirmed(e.target.checked)}>
              {u.confirmCheck}
            </Checkbox>
          </div>
        </div>

        {/* 底部操作 */}
        <div className="staff-card staff-auth-footer">
          <span className="staff-text--muted">{u.footerNote}</span>
          <div className="staff-detail__actions">
            <Button onClick={() => navigate(`/staff/${id ?? u.staff.id}`)}>取消</Button>
            <Button type="primary" onClick={onSave}>
              保存并返回
            </Button>
          </div>
        </div>
      </PageContainer>
    </div>
  )
}
