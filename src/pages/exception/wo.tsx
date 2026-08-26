/**
 * 异常处理 - 工单异常处理（设计稿：履约处置与闭环.png）
 * 处理影响本次履约的问题，完成联系、改期、取消或重新派单并闭环
 * TODO: 工单异常处置闭环接口 API v0.1 未定义，待后端补充
 */
import { useState } from 'react'
import { Button, Checkbox, Input, Select, Upload, message } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import PageContainer from '@/components/PageContainer'
import { mockWoException } from './mock'
import './index.less'

export default function ExceptionWo() {
  const navigate = useNavigate()
  const e = mockWoException
  const [record, setRecord] = useState('')
  const [resolution, setResolution] = useState(e.resolutions[0])
  const [woAction, setWoAction] = useState(e.woActions[0])
  const [note, setNote] = useState(e.defaultNote)
  const [confirmed, setConfirmed] = useState(true)

  const onSaveRecord = () => {
    if (!record.trim()) {
      message.warning('请输入本次处理过程')
      return
    }
    // TODO: 处理记录接口待后端补充
    message.success('处理记录已保存')
    setRecord('')
  }

  const onFinish = () => {
    if (!note.trim()) {
      message.warning('请填写结果说明')
      return
    }
    if (!confirmed) {
      message.warning('请确认已完成必要沟通及后续安排')
      return
    }
    // TODO: 工单异常闭环接口待后端补充；改约/取消/重派走 workOrderApi（API §9.4/9.6）
    message.success('工单异常已闭环，处理结果已同步更新工单')
    navigate('/exception')
  }

  return (
    <div className="ex-page">
      <PageContainer
        title="工单异常处理"
        description="处理影响本次履约的问题，完成联系、改期、取消或重新派单并闭环"
        extra={
          <span className="ex-detail__extra">
            <span className="ex-tag ex-tag--blue">处理中</span>
            <Button onClick={() => navigate('/exception')}>返回列表</Button>
          </span>
        }
      >
        {/* 异常摘要 */}
        <div className="ex-card ex-summary">
          <div className="ex-summary__title">
            {e.title}
            <span className="ex-tag ex-tag--blue">工单异常</span>
          </div>
          <div className="ex-summary__meta">
            {e.id} · 工单 {e.woNo} · 服务项目：{e.service}
          </div>
          <div className="ex-summary__meta">
            上报人：{e.reporter}　上报时间：{e.reportedAt}　责任人：{e.owner}　要求完成：{e.deadline}
          </div>
        </div>

        <div className="ex-detail">
          {/* 左：处理记录 */}
          <div className="ex-card">
            <div className="ex-card__header">
              <span className="ex-card__title">处理记录</span>
            </div>
            <div className="ex-timeline">
              {e.records.map((r) => (
                <div key={r.time} className="ex-timeline__item">
                  <span className={`ex-timeline__dot ${r.current ? 'ex-timeline__dot--current' : ''}`} />
                  <span className="ex-timeline__time">{r.time}</span>
                  <div className="ex-timeline__body">
                    <div className="ex-timeline__title">{r.title}</div>
                    <div className="ex-timeline__desc">{r.desc}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="ex-card__header ex-card__header--gap">
              <span className="ex-card__title">新增处理记录</span>
            </div>
            <div className="ex-field">
              <div className="ex-field__label">
                处理内容 <span className="ex-required">*</span>
              </div>
              <Input.TextArea
                rows={4}
                placeholder="请输入本次处理过程"
                value={record}
                onChange={(ev) => setRecord(ev.target.value)}
              />
            </div>
            <div className="ex-detail__actions">
              <Button type="primary" onClick={onSaveRecord}>
                保存记录
              </Button>
            </div>
          </div>

          {/* 右：工单处理结果 */}
          <div className="ex-card ex-detail__side">
            <div className="ex-card__header">
              <span className="ex-card__title">工单处理结果</span>
            </div>
            <div className="ex-note">确认异常已处理完成后提交</div>
            <div className="ex-field">
              <div className="ex-field__label">
                处理方式 <span className="ex-required">*</span>
              </div>
              <Select
                value={resolution}
                onChange={setResolution}
                options={e.resolutions.map((v) => ({ value: v, label: v }))}
              />
            </div>
            <div className="ex-field">
              <div className="ex-field__label">
                工单动作 <span className="ex-required">*</span>
              </div>
              <Select
                value={woAction}
                onChange={setWoAction}
                options={e.woActions.map((v) => ({ value: v, label: v }))}
              />
            </div>
            <div className="ex-field">
              <div className="ex-field__label">
                结果说明 <span className="ex-required">*</span>
              </div>
              <Input.TextArea rows={4} value={note} onChange={(ev) => setNote(ev.target.value)} />
            </div>
            <div className="ex-field">
              <div className="ex-field__label">附件（选填）</div>
              <Upload beforeUpload={() => false} maxCount={3}>
                <div className="ex-upload">
                  <PlusOutlined /> 上传图片或文件
                </div>
              </Upload>
            </div>
            <Checkbox checked={confirmed} onChange={(ev) => setConfirmed(ev.target.checked)}>
              确认已完成必要沟通及后续安排
            </Checkbox>
            <div className="ex-detail__actions">
              <Button type="primary" onClick={onFinish}>
                完成工单异常
              </Button>
            </div>
          </div>
        </div>
      </PageContainer>
    </div>
  )
}
