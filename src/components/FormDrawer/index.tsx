import type { ReactNode } from 'react'
import { Button, Drawer, Space } from 'antd'
import './index.less'

interface FormDrawerProps {
  title: ReactNode
  open: boolean
  onClose: () => void
  onSubmit: () => void
  confirmLoading?: boolean
  width?: number | string
  okText?: string
  cancelText?: string
  className?: string
  children: ReactNode
}

/** 新增、编辑表单的统一抽屉，底部保留明确的取消与提交操作。 */
export default function FormDrawer({
  title,
  open,
  onClose,
  onSubmit,
  confirmLoading = false,
  width = 560,
  okText = '保存',
  cancelText = '取消',
  className,
  children,
}: FormDrawerProps) {
  return (
    <Drawer
      title={title} open={open} onClose={onClose} width={width}
      className={['form-drawer', className].filter(Boolean).join(' ')} destroyOnHidden
      footer={(
        <Space className="form-drawer__actions">
          <Button onClick={onClose}>{cancelText}</Button>
          <Button type="primary" loading={confirmLoading} onClick={onSubmit}>{okText}</Button>
        </Space>
      )}
    >
      {children}
    </Drawer>
  )
}
