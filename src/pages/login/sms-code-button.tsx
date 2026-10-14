/**
 * 获取短信验证码按钮（60s 倒计时）
 * 已对接 POST /api/v1/staff/auth/sms-code；登录与找回密码流程共用
 */
import { useEffect, useRef, useState } from 'react'
import { Button, App } from 'antd'
import { authApi } from '@/api'

interface SmsCodeButtonProps {
  /** 接收验证码的手机号（必填校验通过后才可发送） */
  phone?: string
  /** 验证码场景（swagger：login | reset） */
  scene?: 'login' | 'reset'
}

export default function SmsCodeButton({ phone, scene = 'login' }: SmsCodeButtonProps) {
  const { message } = App.useApp()
  const [countdown, setCountdown] = useState(0)
  const [sending, setSending] = useState(false)
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

  const sendCode = async () => {
    if (!phone || !/^1\d{10}$/.test(phone)) {
      message.warning('请先输入正确的 11 位手机号')
      return
    }
    setSending(true)
    try {
      await authApi.sendSmsCode({ phone, scene })
      message.success('验证码已发送')
      setCountdown(60)
      timer.current = setInterval(() => setCountdown((s) => s - 1), 1000)
    } finally {
      setSending(false)
    }
  }

  return (
    <Button
      className="login-form__code-btn"
      onClick={sendCode}
      loading={sending}
      disabled={countdown > 0}
    >
      {countdown > 0 ? `${countdown}s 后重发` : '获取验证码'}
    </Button>
  )
}
