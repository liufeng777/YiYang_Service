/**
 * 获取短信验证码按钮（60s 倒计时，mock 发送）
 * 登录与找回密码流程共用
 */
import { useEffect, useRef, useState } from 'react'
import { Button, App } from 'antd'

export default function SmsCodeButton() {
  const { message } = App.useApp()
  const [countdown, setCountdown] = useState(0)
  const timer = useRef<ReturnType<typeof setInterval>>(null)

  useEffect(() => {
    if (countdown <= 0 && timer.current) {
      clearInterval(timer.current)
      timer.current = null
    }
  }, [countdown])

  useEffect(
    () => () => {
      if (timer.current) clearInterval(timer.current)
    },
    [],
  )

  const sendCode = () => {
    // TODO: 接入真实短信接口后替换为调用发送验证码 API
    message.success('验证码已发送（mock）')
    setCountdown(60)
    timer.current = setInterval(() => setCountdown((s) => s - 1), 1000)
  }

  return (
    <Button className="login-form__code-btn" onClick={sendCode} disabled={countdown > 0}>
      {countdown > 0 ? `${countdown}s 后重发` : '获取验证码'}
    </Button>
  )
}
