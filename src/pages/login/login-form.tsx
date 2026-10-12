/**
 * 登录表单：密码登录 / 验证码登录 双 Tab
 * 已对接真实登录接口（auth/login、auth/sms-login、auth/sms-code）
 */
import { useState } from 'react'
import { Button, Form, Input, Tabs, App } from 'antd'
import { useNavigate } from 'react-router-dom'
import { useUserStore } from '@/store/modules/user'
import SmsCodeButton from './sms-code-button'

interface LoginFormProps {
  /** 点击「忘记密码」进入找回密码流程 */
  onForgot: () => void
}

interface PasswordForm {
  phone: string
  password: string
}

interface SmsForm {
  phone: string
  code: string
}

const phoneRules = [
  { required: true, message: '请输入登录手机号' },
  { pattern: /^1\d{10}$/, message: '请输入正确的 11 位手机号' },
]

export default function LoginForm({ onForgot }: LoginFormProps) {
  const navigate = useNavigate()
  const { message } = App.useApp()
  const [loading, setLoading] = useState(false)
  const [tab, setTab] = useState<'password' | 'sms'>('password')
  const login = useUserStore((state) => state.login)
  const [smsForm] = Form.useForm<SmsForm>()
  const smsPhone = Form.useWatch('phone', smsForm)

  const doLogin = async (params: { phone: string; password?: string; code?: string }) => {
    setLoading(true)
    try {
      await login(params)
      message.success('登录成功')
      // 登录成功后进入「选择机构」页（设计稿流程）
      navigate('/select-org', { replace: true })
    } finally {
      setLoading(false)
    }
  }

  const onPasswordFinish = (values: PasswordForm) => doLogin(values)
  const onSmsFinish = (values: SmsForm) => doLogin(values)

  return (
    <div className="login-form">
      <h1 className="login-form__title">登录医养服务工作台</h1>
      <p className="login-form__subtitle">
        {tab === 'sms' ? '使用登录手机号接收短信验证码' : '使用账号密码登录工作台'}
      </p>

      <Tabs
        activeKey={tab}
        onChange={(key) => setTab(key as 'password' | 'sms')}
        items={[
          {
            key: 'password',
            label: '密码登录',
            children: (
              <Form<PasswordForm> size="large" onFinish={onPasswordFinish}>
                <Form.Item name="phone" rules={phoneRules}>
                  <Input placeholder="请输入登录手机号" maxLength={11} />
                </Form.Item>
                <Form.Item
                  name="password"
                  rules={[{ required: true, message: '请输入登录密码' }]}
                >
                  <Input.Password placeholder="请输入登录密码" />
                </Form.Item>
                <div className="login-form__forgot">
                  <Button type="link" onClick={onForgot}>
                    忘记密码？
                  </Button>
                </div>
                <Button
                  type="primary"
                  htmlType="submit"
                  block
                  loading={loading}
                  className="login-form__submit"
                >
                  登 录
                </Button>
              </Form>
            ),
          },
          {
            key: 'sms',
            label: '验证码登录',
            children: (
              <Form<SmsForm> form={smsForm} size="large" onFinish={onSmsFinish}>
                <Form.Item name="phone" rules={phoneRules}>
                  <Input placeholder="请输入登录手机号" maxLength={11} />
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
                    <SmsCodeButton phone={smsPhone} scene="login" />
                  </div>
                </Form.Item>
                <p className="login-form__helper">验证码将发送至账号绑定手机号，有效期5分钟</p>
                <Button
                  type="primary"
                  htmlType="submit"
                  block
                  loading={loading}
                  className="login-form__submit"
                >
                  登 录
                </Button>
                <div className="login-form__tip">验证码请勿告知他人；连续失败将触发账号保护。</div>
              </Form>
            ),
          },
        ]}
      />
    </div>
  )
}
