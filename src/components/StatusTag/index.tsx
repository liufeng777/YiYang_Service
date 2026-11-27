import type { HTMLAttributes } from 'react'

type StatusTone = 'green' | 'blue' | 'orange' | 'red' | 'teal' | 'purple' | 'gray'

interface StatusTagProps extends HTMLAttributes<HTMLSpanElement> {
  /** 兼容原 antd Tag 的 outlined 等参数；统一后不再产生页面级外观差异。 */
  variant?: string
}

const COLOR_TONE_MAP: Record<string, StatusTone> = {
  green: 'green',
  success: 'green',
  lime: 'green',
  blue: 'blue',
  geekblue: 'blue',
  cyan: 'blue',
  processing: 'blue',
  orange: 'orange',
  warning: 'orange',
  gold: 'orange',
  volcano: 'orange',
  red: 'red',
  error: 'red',
  teal: 'teal',
  purple: 'purple',
  magenta: 'purple',
  gray: 'gray',
  grey: 'gray',
  default: 'gray',
}

/** 全局状态标签：兼容现有 Tag 的 color 配置，统一输出 .status-tag。 */
export default function StatusTag({
  color = 'default',
  variant,
  className,
  children,
  ...rest
}: StatusTagProps) {
  void variant
  const tone = COLOR_TONE_MAP[color] ?? 'gray'
  return (
    <span {...rest} className={`status-tag status-tag--${tone}${className ? ` ${className}` : ''}`}>
      {children}
    </span>
  )
}
