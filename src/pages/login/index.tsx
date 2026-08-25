/**
 * 登录页（设计稿：左侧品牌面板 + 右侧表单区）
 * - 登录：密码登录 / 验证码登录 双 Tab
 * - 找回密码：验证身份 → 设置新密码 → 完成
 * 登录成功后进入「选择机构」页
 */
import { useState } from 'react'
import BrandPanel from './brand-panel'
import LoginForm from './login-form'
import ForgotPassword from './forgot-form'
import './index.less'

export default function Login() {
  const [view, setView] = useState<'login' | 'forgot'>('login')

  return (
    <div className="login-page">
      <BrandPanel />
      <div className="login-page__panel">
        <div className="login-page__form">
          {view === 'login' ? (
            <LoginForm onForgot={() => setView('forgot')} />
          ) : (
            <ForgotPassword onBack={() => setView('login')} />
          )}
        </div>
      </div>
    </div>
  )
}
