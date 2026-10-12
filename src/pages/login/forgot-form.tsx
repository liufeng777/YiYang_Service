/**
 * 找回密码流程（设计稿：验证身份 → 设置新密码 → 完成）
 * 当前为 mock 实现，接入真实后端后替换为调用重置密码接口
 */
import { useState } from 'react'
import { Button, Form, Input, App } from 'antd'
import { CheckOutlined } from '@ant-design/icons'
import SmsCodeButton from './sms-code-button'

interface ForgotPasswordProps {
  /** 返回登录 */
  onBack: () => void
}

const steps = ['验证身份', '设置新密码', '完成']

const stepHeader = [
  { title: '找回密码', subtitle: '先验证账号绑定手机号' },
  { title: '设置新密码', subtitle: '为账号设置新的登录密码' },
  { title: '密码重置成功', subtitle: '请使用新密码重新登录' },
]

const phoneRules = [
  { required: true, message: '请输入账号绑定手机号' },
  { pattern: /^1\d{10}$/, message: '请输入正确的 11 位手机号' },
]

/** 密码规则：8-20位，包含字母和数字 */
const passwordRules = [
  { required: true, message: '请输入新密码' },
  { pattern: /^(?=.*[A-Za-z])(?=.*\d).{8,20}$/, message: '密码需为8-20位，包含字母和数字' },
]

export default function ForgotPassword({ onBack }: ForgotPasswordProps) {
  const { message } = App.useApp()
  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [form] = Form.useForm()
  const phone = Form.useWatch('phone', form)

  /** 步骤条 */
  const stepBar = (
    <div className="forgot-form__steps">
      {steps.map((label, index) => (
        <div
          key={label}
          className={`forgot-form__step${index === step ? ' forgot-form__step--active' : ''}`}
        >
          {index + 1} {label}
        </div>
      ))}
    </div>
  )

  /** 第 1 步：验证身份 */
  const onVerifyFinish = () => {
    // TODO: 接入真实接口后校验短信验证码
    setStep(1)
    form.resetFields()
  }

  /** 第 2 步：设置新密码 */
  const onResetFinish = () => {
    // TODO: 接入真实接口后提交新密码
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      setStep(2)
      message.success('密码重置成功')
    }, 400)
  }

  return (
    <div className="forgot-form">
      <h1 className="login-form__title">{stepHeader[step].title}</h1>
      <p className="login-form__subtitle">{stepHeader[step].subtitle}</p>
      {step < 2 && stepBar}

      {step === 0 && (
        <Form form={form} size="large" onFinish={onVerifyFinish}>
          <Form.Item name="phone" rules={phoneRules}>
            <Input placeholder="请输入账号绑定手机号" maxLength={11} />
          </Form.Item>
          <Form.Item
            name="code"
            rules={[
              { required: true, message: '请输入6位验证码' },
              { pattern: /^\d{6}$/, message: '验证码为 6 位数字' },
            ]}
          >
            <div className="login-form__code-row">
              <Input placeholder="请输入6位验证码" maxLength={6} />
              <SmsCodeButton phone={phone} scene="login" />
            </div>
          </Form.Item>
          <Button type="primary" htmlType="submit" block className="login-form__submit">
            下一步
          </Button>
          <Button block className="login-form__ghost" onClick={onBack}>
            返回登录
          </Button>
          <p className="forgot-form__note">若手机号已更换，请联系系统管理员重置账号。</p>
        </Form>
      )}

      {step === 1 && (
        <Form form={form} size="large" onFinish={onResetFinish}>
          <Form.Item name="password" rules={passwordRules} hasFeedback>
            <Input.Password placeholder="请输入新密码" maxLength={20} />
          </Form.Item>
          <Form.Item
            name="confirm"
            dependencies={['password']}
            hasFeedback
            rules={[
              { required: true, message: '请再次输入新密码' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) return Promise.resolve()
                  return Promise.reject(new Error('两次输入的密码不一致'))
                },
              }),
            ]}
          >
            <Input.Password placeholder="请再次输入新密码" maxLength={20} />
          </Form.Item>
          <div className="forgot-form__rule">
            <p>密码需为8-20位，包含字母和数字；不能与原密码相同。</p>
            <p className="forgot-form__rule-checks">
              <span>
                <CheckOutlined /> 8-20位
              </span>
              <span>
                <CheckOutlined /> 包含字母
              </span>
              <span>
                <CheckOutlined /> 包含数字
              </span>
            </p>
          </div>
          <Button
            type="primary"
            htmlType="submit"
            block
            loading={loading}
            className="login-form__submit"
          >
            确认重置
          </Button>
          <Button block className="login-form__ghost" onClick={() => setStep(0)}>
            上一步
          </Button>
        </Form>
      )}

      {step === 2 && (
        <div className="forgot-form__success">
          <div className="forgot-form__success-icon">
            <CheckOutlined />
          </div>
          <div className="forgot-form__success-title">新密码已生效</div>
          <p className="forgot-form__success-desc">为保障账号安全，其他已登录设备将退出登录。</p>
          <Button type="primary" block className="login-form__submit" onClick={onBack}>
            返回登录
          </Button>
        </div>
      )}
    </div>
  )
}
