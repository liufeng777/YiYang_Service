/**
 * 新增执业资质
 * 文件先经 /upload 上传，再调用 /staffs/{id}/credentials；不包含未定义的 OCR 流程。
 */
import { useEffect, useState } from 'react'
import { Alert, App, Button, Card, DatePicker, Form, Input, Spin, Upload } from 'antd'
import type { UploadFile, UploadProps } from 'antd'
import { ArrowLeftOutlined, UploadOutlined } from '@ant-design/icons'
import type { Dayjs } from 'dayjs'
import { useNavigate, useParams } from 'react-router-dom'
import PageContainer from '@/components/PageContainer'
import { staffApi, uploadApi } from '@/api'
import type { StaffDetail } from '@/api/modules/staff'
import './index.less'

interface CredentialForm {
  credential_type: string
  valid_until: Dayjs
}

export default function CredentialUpload() {
  const navigate = useNavigate()
  const { id } = useParams()
  const { message } = App.useApp()
  const [form] = Form.useForm<CredentialForm>()
  const [staff, setStaff] = useState<StaffDetail>()
  const [fileList, setFileList] = useState<UploadFile[]>([])
  const [uploadedUrls, setUploadedUrls] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const fileUrls = Object.values(uploadedUrls)

  useEffect(() => {
    if (!id) return
    setLoading(true)
    staffApi.getStaffDetail(id).then(setStaff).catch(() => undefined).finally(() => setLoading(false))
  }, [id])

  const customRequest: UploadProps['customRequest'] = async (options) => {
    const file = options.file as File & { uid: string }
    setUploading(true)
    try {
      const res = await uploadApi.uploadFile(file, 'credentials')
      if (!res.url) throw new Error('上传响应未包含 URL')
      setUploadedUrls((prev) => ({ ...prev, [file.uid]: res.url as string }))
      options.onSuccess?.(res)
      message.success(`${options.filename}上传成功`)
    } catch (error) {
      options.onError?.(error as Error)
      message.error(`${options.filename}上传失败`)
    } finally {
      setUploading(false)
    }
  }

  const submit = async () => {
    if (!id) return
    const values = await form.validateFields()
    if (!fileUrls.length) {
      message.warning('请至少成功上传一份资质文件')
      return
    }
    setSubmitting(true)
    try {
      await staffApi.createCredential(id, {
        credential_type: values.credential_type.trim(),
        valid_until: values.valid_until.format('YYYY-MM-DD'),
        file_urls: fileUrls,
      })
      message.success('执业资质已保存')
      navigate(`/staff/${id}`)
    } catch {
      // 请求失败时保留表单
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="staff-page">
      <PageContainer
        title="新增执业资质"
        description={staff ? `为 ${staff.name} 上传资质文件并登记有效期` : '上传资质文件并登记有效期'}
        extra={<Button icon={<ArrowLeftOutlined />} onClick={() => navigate(`/staff/${id}`)}>返回人员详情</Button>}
      >
        <Spin spinning={loading}>
          <Card variant="borderless" className="staff-card">
            <Alert
              type="info"
              showIcon
              title="资质请求体为通用 object"
              description="按现有 API 约定提交 credential_type、valid_until、file_urls。Swagger 未提供 OCR、统一审核或服务授权联动接口，本页不展示这些模拟步骤。"
            />
            <Form form={form} layout="vertical">
              <Form.Item name="credential_type" label="资质类型" rules={[{ required: true, whitespace: true, message: '请输入资质类型' }]}>
                <Input placeholder="如：护士执业证书" maxLength={100} />
              </Form.Item>
              <Form.Item name="valid_until" label="有效期至" rules={[{ required: true, message: '请选择有效期' }]}>
                <DatePicker />
              </Form.Item>
              <Form.Item label="资质文件" required>
                <Upload
                  multiple
                  fileList={fileList}
                  customRequest={customRequest}
                  onChange={({ fileList: nextFiles }) => setFileList(nextFiles)}
                  onRemove={(file) => {
                    setUploadedUrls((prev) => {
                      const next = { ...prev }
                      delete next[file.uid]
                      return next
                    })
                  }}
                >
                  <Button icon={<UploadOutlined />} loading={uploading}>上传文件</Button>
                </Upload>
              </Form.Item>
            </Form>
            <div className="staff-detail__actions">
              <Button onClick={() => navigate(`/staff/${id}`)}>取消</Button>
              <Button type="primary" loading={submitting} disabled={uploading} onClick={submit}>保存资质</Button>
            </div>
          </Card>
        </Spin>
      </PageContainer>
    </div>
  )
}
