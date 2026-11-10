import { http } from '@/utils/request'

export interface UploadResult {
  key?: string
  url?: string
  [key: string]: unknown
}

export function uploadFile(file: File, dir?: string) {
  const form = new FormData()
  form.append('file', file)
  if (dir) form.append('dir', dir)
  return http.post<UploadResult>('/v1/staff/upload', form, { headers: { 'Content-Type': 'multipart/form-data' } })
}

export function uploadFiles(files: File[], dir?: string) {
  const form = new FormData()
  files.forEach((file) => form.append('files', file))
  if (dir) form.append('dir', dir)
  return http.post<{ list: UploadResult[]; count: number }>('/v1/staff/upload/batch', form, { headers: { 'Content-Type': 'multipart/form-data' } })
}

export function deleteUploadedFile(key: string) {
  return http.delete<null>(`/v1/staff/upload/${encodeURIComponent(key)}`)
}
