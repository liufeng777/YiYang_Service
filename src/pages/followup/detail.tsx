/** 随访详情：展示主记录、分组子项及回访结果。 */
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Button, Card, Descriptions, Empty, Space, Spin } from 'antd'
import { ArrowLeftOutlined, PlayCircleOutlined } from '@ant-design/icons'
import { useNavigate, useParams } from 'react-router-dom'
import PageContainer from '@/components/PageContainer'
import SensitiveText from '@/components/SensitiveText'
import { followupApi } from '@/api'
import {
  FOLLOWUP_RESULT_MAP,
  FOLLOWUP_STATUS_MAP,
  FOLLOWUP_TYPE_MAP,
  type FollowupDetailResponse,
} from '@/api/modules/followup'
import {
  display,
  followupSource,
  formatDate,
  formatDateTime,
  getFollowupGroups,
  getFollowupMain,
  pick,
} from './utils'
import './index.less'

const TYPE_TONE: Record<number, string> = { 1: 'blue', 2: 'orange' }
const RESULT_TONE: Record<number, string> = { 1: 'green', 2: 'gray', 3: 'orange' }

export default function FollowupDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [detail, setDetail] = useState<FollowupDetailResponse>({})
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    if (!id) return
    setLoading(true)
    try {
      setDetail(await followupApi.getFollowupDetail(id))
    } catch {
      // 错误提示由拦截器统一处理。
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => { load() }, [load])

  const followup = useMemo(() => getFollowupMain(detail), [detail])
  const groups = useMemo(() => getFollowupGroups(detail), [detail])
  const remark = pick(followup, ['remark', 'summary', 'supplement'])

  return (
    <div className="fu-page">
      <PageContainer
        title="随访详情"
        description="查看随访任务、结构化子项和回访结果"
        extra={(
          <Space>
            {followup.status === 1 && (
              <Button type="primary" icon={<PlayCircleOutlined />} onClick={() => navigate(`/followup/${id}/execute`)}>
                开始回访
              </Button>
            )}
            <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/followup')}>返回列表</Button>
          </Space>
        )}
      >
        <Spin spinning={loading}>
          <Card variant="borderless" className="fu-card">
            <Descriptions title="任务信息" column={{ xs: 1, sm: 2, lg: 3 }} bordered>
              <Descriptions.Item label="服务对象"><SensitiveText type="name" value={followup.member_name} /></Descriptions.Item>
              <Descriptions.Item label="性别 / 年龄">
                {Number(followup.gender ?? followup.member_gender) === 1 ? '男' : Number(followup.gender ?? followup.member_gender) === 2 ? '女' : '未知'}
                {Number(followup.age ?? followup.member_age) > 0 ? ` / ${Number(followup.age ?? followup.member_age)} 岁` : ' / 年龄未知'}
              </Descriptions.Item>
              <Descriptions.Item label="随访类型">
                <span className={`status-tag status-tag--${TYPE_TONE[Number(followup.followup_type)] ?? 'gray'}`}>
                  {FOLLOWUP_TYPE_MAP[Number(followup.followup_type)] ?? display(followup.followup_type)}
                </span>
              </Descriptions.Item>
              <Descriptions.Item label="当前状态">
                <span className={`status-tag status-tag--${followup.status === 2 ? 'green' : 'orange'}`}>
                  {FOLLOWUP_STATUS_MAP[Number(followup.status)] ?? display(followup.status)}
                </span>
              </Descriptions.Item>
              <Descriptions.Item label="来源">{display(followup.source_name) !== '-' ? display(followup.source_name) : followupSource(followup.source_type, followup.source_id)}</Descriptions.Item>
              <Descriptions.Item label="负责人">{display(followup.staff_name ?? followup.staff_id)}</Descriptions.Item>
              <Descriptions.Item label="计划回访时间">{formatDateTime(followup.plan_time ?? followup.next_followup_date)}</Descriptions.Item>
              <Descriptions.Item label="上次随访时间">{formatDateTime(followup.last_followup_time)}</Descriptions.Item>
              <Descriptions.Item label="开始随访时间">{formatDateTime(followup.start_time)}</Descriptions.Item>
              <Descriptions.Item label="完成时间">{formatDateTime(followup.finish_time ?? followup.followup_time)}</Descriptions.Item>
              <Descriptions.Item label="创建时间">{formatDateTime(followup.created_at)}</Descriptions.Item>
              <Descriptions.Item label="更新时间">{formatDateTime(followup.updated_at)}</Descriptions.Item>
              {Number(followup.followup_type) === 2 && Number(followup.warning_id) > 0 && (
                <Descriptions.Item label="健康预警">
                  <Space size={8}>
                    <span>#{String(followup.warning_id)}</span>
                    <Button type="link" size="small" onClick={() => navigate(`/warning/${followup.warning_id}/handle`)}>查看预警详情</Button>
                  </Space>
                </Descriptions.Item>
              )}
              {followup.followup_name && <Descriptions.Item label="任务说明" span={2}>{followup.followup_name}</Descriptions.Item>}
              {followup.respond_relation_name && <Descriptions.Item label="响应关系">{followup.respond_relation_name}</Descriptions.Item>}
            </Descriptions>

            <section className="fu-detail-section">
              <h3 className="fu-section-title">随访子项</h3>
              {groups.length ? groups.map((group) => (
                <Card key={group.key} size="small" title={group.label} className="fu-item-group">
                  <Descriptions column={{ xs: 1, sm: 2, lg: 3 }} size="small">
                    {group.fields.map((field) => (
                      <Descriptions.Item key={field.key} label={field.label}>
                        {display(field.value)}{field.unit && field.value != null && field.value !== '' ? ` ${field.unit}` : ''}
                      </Descriptions.Item>
                    ))}
                  </Descriptions>
                </Card>
              )) : <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="该随访暂无子项" />}
            </section>

            <section className="fu-detail-section">
              <h3 className="fu-section-title">回访结果</h3>
              <Descriptions column={{ xs: 1, sm: 2 }} bordered>
                <Descriptions.Item label="随访结果">
                  {!Number(followup.result) ? '-' : (
                    <span className={`status-tag status-tag--${RESULT_TONE[Number(followup.result)] ?? 'gray'}`}>
                      {FOLLOWUP_RESULT_MAP[Number(followup.result)] ?? display(followup.result)}
                    </span>
                  )}
                </Descriptions.Item>
                <Descriptions.Item label="下次随访日期">{formatDate(followup.next_followup_date)}</Descriptions.Item>
                <Descriptions.Item label="补充说明" span={2}>
                  <span className="fu-pre-wrap">{display(remark)}</span>
                </Descriptions.Item>
              </Descriptions>
            </section>
          </Card>
        </Spin>
      </PageContainer>
    </div>
  )
}
