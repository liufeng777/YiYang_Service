import { useCallback, useEffect, useRef, useState } from 'react'
import { Select } from 'antd'
import { memberApi } from '@/api'
import type { MemberItem } from '@/api/modules/member'
import { maskName, maskPhone } from '@/components/SensitiveText'

interface MemberSelectProps {
  value?: number
  onChange: (value?: number) => void
  placeholder?: string
}

/** 从当前机构健康会员中远程搜索并选择，提交时使用会员 ID。 */
export default function MemberSelect({ value, onChange, placeholder = '输入姓名或手机号搜索健康会员' }: MemberSelectProps) {
  const [members, setMembers] = useState<MemberItem[]>([])
  const [selected, setSelected] = useState<MemberItem>()
  const [loading, setLoading] = useState(false)
  const requestRef = useRef(0)

  const loadMembers = useCallback(async (keyword = '') => {
    const requestId = ++requestRef.current
    setLoading(true)
    try {
      const res = await memberApi.getMemberList({
        page: 1,
        page_size: 50,
        keyword: keyword.trim() || undefined,
      })
      if (requestId === requestRef.current) setMembers(res.list ?? [])
    } catch {
      /* 拦截器已提示 */
    } finally {
      if (requestId === requestRef.current) setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadMembers()
  }, [loadMembers])

  useEffect(() => {
    if (value == null) setSelected(undefined)
  }, [value])

  const options = selected && value === selected.id && !members.some((member) => member.id === selected.id)
    ? [selected, ...members]
    : members

  return (
    <Select
      showSearch
      filterOption={false}
      value={value}
      loading={loading}
      onSearch={loadMembers}
      placeholder={placeholder}
      notFoundContent={loading ? '正在查询会员' : '暂无匹配会员'}
      onChange={(nextValue?: number) => {
        const member = options.find((item) => item.id === nextValue)
        setSelected(member)
        onChange(nextValue)
      }}
      options={options.map((member) => ({
        value: member.id,
        label: `${maskName(member.name)} · ${member.phone ? maskPhone(member.phone) : `ID ${member.id}`}`,
      }))}
      allowClear
    />
  )
}
