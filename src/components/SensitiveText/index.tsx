import { useEffect, useState } from 'react'
import { Button, Tooltip } from 'antd'
import { EyeInvisibleOutlined, EyeOutlined } from '@ant-design/icons'
import './index.less'

export type SensitiveType = 'name' | 'phone' | 'idCard' | 'address'
export type SensitiveValue = string | number | null | undefined

function characters(value: SensitiveValue) {
  return Array.from(String(value ?? '').trim())
}

/** 姓名保留首字（英文名为首字母），其余字符逐字替换为 *。 */
export function maskName(value: SensitiveValue) {
  const chars = characters(value)
  if (!chars.length) return ''
  return chars[0] + '*'.repeat(chars.length - 1)
}

function maskMiddle(value: SensitiveValue, head: number, tail: number) {
  const chars = characters(value)
  if (!chars.length) return ''
  if (chars.length <= head + tail) return '*'.repeat(chars.length)
  return chars.slice(0, head).join('') + '*'.repeat(chars.length - head - tail) + chars.slice(-tail).join('')
}

/** 手机号保留前 3 位和后 4 位。 */
export function maskPhone(value: SensitiveValue) {
  return maskMiddle(value, 3, 4)
}

/** 身份证保留前 3 位和后 4 位。 */
export function maskIdCard(value: SensitiveValue) {
  return maskMiddle(value, 3, 4)
}

/** 地址默认只显示到区；县、旗按同级行政区处理，无法识别时不暴露详细地址。 */
export function maskAddress(value: SensitiveValue) {
  const raw = String(value ?? '').trim()
  if (!raw) return ''
  const chars = Array.from(raw)
  for (let index = 0; index < chars.length; index += 1) {
    if (!['区', '县', '旗'].includes(chars[index])) continue
    // 跳过“自治区”中的“区”，继续寻找市辖区或实际区县。
    if (chars[index] === '区' && chars.slice(Math.max(0, index - 2), index).join('') === '自治') continue
    return chars.slice(0, index + 1).join('')
  }
  const city = raw.match(/^(.+?市)/)?.[1]
  if (city) return city
  const province = raw.match(/^(.+?省)/)?.[1]
  return province ?? '***'
}

export function maskSensitive(type: SensitiveType, value: SensitiveValue) {
  if (type === 'name') return maskName(value)
  if (type === 'phone') return maskPhone(value)
  if (type === 'idCard') return maskIdCard(value)
  return maskAddress(value)
}

const TYPE_LABEL: Record<SensitiveType, string> = {
  name: '姓名', phone: '手机号', idCard: '身份证号', address: '详细地址',
}

/** 详情默认脱敏并通过眼睛切换；列表可传 plain 直接显示原文，不展示切换按钮。 */
export default function SensitiveText({ type, value, className, allowReveal = true, plain = false }: {
  type: SensitiveType
  value: SensitiveValue
  className?: string
  allowReveal?: boolean
  plain?: boolean
}) {
  const [visible, setVisible] = useState(false)
  const raw = String(value ?? '').trim()

  useEffect(() => { setVisible(false) }, [raw, type])

  if (!raw) return <span className={className}>-</span>

  return (
    <span className={['sensitive-text', className].filter(Boolean).join(' ')}>
      <span className="sensitive-text__value">{plain || visible ? raw : maskSensitive(type, raw)}</span>
      {allowReveal && !plain && (
        <Tooltip title={visible ? `隐藏${TYPE_LABEL[type]}` : `查看${TYPE_LABEL[type]}`}>
          <Button
            type="text" size="small" className="sensitive-text__toggle"
            icon={visible ? <EyeInvisibleOutlined /> : <EyeOutlined />}
            aria-label={visible ? `隐藏${TYPE_LABEL[type]}` : `查看${TYPE_LABEL[type]}`}
            onClick={(event) => { event.stopPropagation(); setVisible((current) => !current) }}
          />
        </Tooltip>
      )}
    </span>
  )
}
