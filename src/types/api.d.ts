/**
 * 全局通用类型定义
 */

/** 后端统一响应结构（约定：code === 0 表示成功） */
export interface Result<T = unknown> {
  code: number
  message: string
  data: T
}

/** 分页返回结构（服务端实际字段：page / page_size） */
export interface PageResult<T = unknown> {
  list: T[]
  total: number
  page: number
  page_size: number
}

/** 分页查询参数（服务端实际字段：page / page_size） */
export interface PageParams {
  page: number
  page_size: number
  [key: string]: unknown
}

/** 选项项（下拉框通用） */
export interface OptionItem {
  label: string
  value: string | number
  disabled?: boolean
}
