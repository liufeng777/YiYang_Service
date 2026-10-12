/**
 * 暂未对接接口提示
 * 用于接口尚未提供（API 文档未定义或服务端未实现）的页面/区块：
 * 页面保留设计稿结构，顶部展示本提示，数据区展示空状态
 */
import { Alert } from 'antd'
import { ApiOutlined } from '@ant-design/icons'

interface NoApiNoticeProps {
  /** 补充说明（默认：该模块接口尚未提供，页面暂无法展示真实数据） */
  description?: string
  className?: string
}

export default function NoApiNotice({ description, className }: NoApiNoticeProps) {
  return (
    <Alert
      type="info"
      showIcon
      icon={<ApiOutlined />}
      message="暂未对接接口"
      description={description ?? '该模块接口尚未提供，页面暂无法展示真实数据，当前为空状态。'}
      className={className}
      style={{ marginBottom: 16 }}
    />
  )
}
