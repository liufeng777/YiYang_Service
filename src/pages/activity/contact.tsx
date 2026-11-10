/** 健康活动：展示真实报名联系信息，仅保留接口支持的签到与取消操作。 */
import { useCallback, useEffect, useState } from 'react'
import { App, Button, Empty, Popconfirm, Spin, Tag } from 'antd'
import { ArrowLeftOutlined } from '@ant-design/icons'
import { useNavigate, useParams } from 'react-router-dom'
import PageContainer from '@/components/PageContainer'
import { activityApi } from '@/api'
import type { ActivityItem, RegistrationItem } from '@/api/modules/activity'
import './index.less'

const STATUS_COLOR: Record<number, string> = { 1: 'blue', 2: 'green', 3: 'default' }

export default function ActivityContact() {
  const { id = '', rid = '' } = useParams<{ id: string; rid: string }>()
  const navigate = useNavigate()
  const { message } = App.useApp()
  const [activity, setActivity] = useState<ActivityItem | null>(null)
  const [registration, setRegistration] = useState<RegistrationItem | null>(null)
  const [loading, setLoading] = useState(false)
  const [acting, setActing] = useState(false)

  const registrationsPath = `/health-activity/${id}/registrations`

  const fetchDetail = useCallback(async () => {
    if (!id || !rid) return
    setLoading(true)
    try {
      const [activityDetail, registrationPage] = await Promise.all([
        activityApi.getActivityDetail(id),
        activityApi.getActivityRegistrations(id, { page: 1, page_size: 100 }),
      ])
      setActivity(activityDetail)
      setRegistration(registrationPage.list?.find((item) => String(item.id) === rid) ?? null)
    } catch {
      // 错误提示由拦截器统一处理
    } finally {
      setLoading(false)
    }
  }, [id, rid])

  useEffect(() => {
    fetchDetail()
  }, [fetchDetail])

  const onCheckin = async () => {
    setActing(true)
    try {
      await activityApi.checkinRegistration(id, rid)
      message.success('签到成功')
      navigate(registrationsPath)
    } catch {
      // 错误提示由拦截器统一处理
    } finally {
      setActing(false)
    }
  }

  const onCancel = async () => {
    setActing(true)
    try {
      await activityApi.cancelRegistration(id, rid)
      message.success('已取消报名')
      navigate(registrationsPath)
    } catch {
      // 错误提示由拦截器统一处理
    } finally {
      setActing(false)
    }
  }

  const status = registration?.status

  return (
    <div className="ac-page">
      <PageContainer
        title="报名联系信息"
        description="查看活动报名人与联系信息；签到和取消操作将直接更新报名记录"
        extra={<Button icon={<ArrowLeftOutlined />} onClick={() => navigate(registrationsPath)}>返回报名名单</Button>}
      >
        <Spin spinning={loading}>
          {registration ? (
            <div className="ac-contact">
              <div className="ac-card">
                <div className="ac-card__header">
                  <span className="ac-card__title">报名信息</span>
                  <Tag color={STATUS_COLOR[status ?? 0] ?? 'default'}>
                    {status != null ? activityApi.REG_STATUS_MAP[status] : undefined}
                  </Tag>
                </div>
                <div className="ac-contact__grid">
                  <div className="ac-field">
                    <div className="ac-field__label">报名人 / 会员</div>
                    <div>{registration.member_name || registration.contact_name}</div>
                  </div>
                  <div className="ac-field">
                    <div className="ac-field__label">联系人</div>
                    <div>{registration.contact_name}</div>
                  </div>
                  <div className="ac-field">
                    <div className="ac-field__label">联系电话</div>
                    <div>{registration.contact_phone}</div>
                  </div>
                  <div className="ac-field">
                    <div className="ac-field__label">参与人数</div>
                    <div>{registration.participant_count}</div>
                  </div>
                  <div className="ac-field">
                    <div className="ac-field__label">报名时间</div>
                    <div>{registration.created_at}</div>
                  </div>
                  <div className="ac-field">
                    <div className="ac-field__label">报名编号</div>
                    <div>{registration.id}</div>
                  </div>
                </div>
                <div className="ac-field">
                  <div className="ac-field__label">报名备注</div>
                  <div>{registration.remark}</div>
                </div>
              </div>

              <div className="ac-card ac-contact__rail">
                <div className="ac-card__header"><span className="ac-card__title">活动与可用操作</span></div>
                <div className="ac-field">
                  <div className="ac-field__label">活动名称</div>
                  <div>{activity?.title || activity?.activity_name}</div>
                </div>
                <div className="ac-field">
                  <div className="ac-field__label">活动地点</div>
                  <div>{activity?.location || activity?.address}</div>
                </div>
                <div className="ac-note-blue">
                  <div className="ac-note-blue__title">操作说明</div>
                  <p>当前接口不支持保存联系结果或身份校验。签到与取消报名会调用真实接口，请确认后操作。</p>
                </div>
                <div className="ac-contact__submit">
                  {status === 1 && (
                    <Button type="primary" loading={acting} onClick={onCheckin}>确认签到</Button>
                  )}
                  {status !== 3 && (
                    <Popconfirm title="确认取消该报名？" onConfirm={onCancel}>
                      <Button danger loading={acting}>取消报名</Button>
                    </Popconfirm>
                  )}
                </div>
              </div>
            </div>
          ) : !loading ? (
            <div className="ac-card"><Empty description="未找到对应报名记录" /></div>
          ) : null}
        </Spin>
      </PageContainer>
    </div>
  )
}
