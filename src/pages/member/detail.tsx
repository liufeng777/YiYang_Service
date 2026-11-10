/**
 * 健康会员详情
 * 聚合会员健康档案与健康档案卡；Swagger 未建模的响应对字段做安全兼容展示。
 */
import { useEffect, useState } from 'react'
import { Alert, Button, Card, Descriptions, Empty, List, Spin, Tag } from 'antd'
import { ArrowLeftOutlined } from '@ant-design/icons'
import { useNavigate, useParams } from 'react-router-dom'
import PageContainer from '@/components/PageContainer'
import { healthArchiveApi, memberApi } from '@/api'
import { MEMBER_STATUS_MAP, RISK_LEVEL_MAP, type HealthProfile } from '@/api/modules/member'
import { formatDateTime } from '@/utils'
import './index.less'

type ApiObject = Record<string, unknown>

function asObject(value: unknown): ApiObject | undefined {
  return value != null && typeof value === 'object' && !Array.isArray(value) ? value as ApiObject : undefined
}

function pick(source: ApiObject | undefined, keys: string[]) {
  if (!source) return undefined
  for (const key of keys) {
    if (source[key] != null) return source[key]
  }
  return undefined
}

function display(value: unknown): string {
  if (value == null || value === '') return '-'
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') return String(value)
  return JSON.stringify(value)
}

function ArchiveData({ value }: { value: unknown }) {
  const items = Array.isArray(value) ? value : [value]
  const meaningful = items.filter((item) => item != null && (!Array.isArray(item) || item.length > 0))
  if (meaningful.length === 0 || (meaningful.length === 1 && typeof meaningful[0] === 'object' && Object.keys(asObject(meaningful[0]) ?? {}).length === 0)) {
    return <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="暂无记录" />
  }
  return (
    <List
      dataSource={meaningful}
      renderItem={(item, index) => {
        const object = asObject(item)
        return (
          <List.Item key={index}>
            {object ? (
              <Descriptions size="small" column={{ xs: 1, md: 2, xl: 3 }}>
                {Object.entries(object).map(([key, fieldValue]) => (
                  <Descriptions.Item key={key} label={key}>{display(fieldValue)}</Descriptions.Item>
                ))}
              </Descriptions>
            ) : display(item)}
          </List.Item>
        )
      }}
    />
  )
}

export default function MemberDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [profile, setProfile] = useState<HealthProfile>()
  const [archive, setArchive] = useState<ApiObject>()
  const [loading, setLoading] = useState(false)
  const [archiveFailed, setArchiveFailed] = useState(false)

  useEffect(() => {
    if (!id) return
    let active = true
    setLoading(true)
    setArchiveFailed(false)
    Promise.allSettled([
      memberApi.getHealthProfile(id),
      healthArchiveApi.getHealthArchiveOverview(id),
    ]).then(([profileResult, archiveResult]) => {
      if (!active) return
      if (profileResult.status === 'fulfilled') setProfile(profileResult.value)
      if (archiveResult.status === 'fulfilled') setArchive(asObject(archiveResult.value))
      else setArchiveFailed(true)
    }).finally(() => {
      if (active) setLoading(false)
    })
    return () => { active = false }
  }, [id])

  const m = profile?.member
  const levels = profile?.levels && !Array.isArray(profile.levels) ? profile.levels : undefined
  const levelItems = Array.isArray(profile?.levels) ? profile.levels : []
  const riskText = levels?.risk_level != null
    ? RISK_LEVEL_MAP[levels.risk_level] ?? `等级 ${levels.risk_level}`
    : levelItems.find((item) => String(item.level_type).includes('risk'))?.level_name ?? '-'
  const careText = levels?.care_level != null
    ? `等级 ${levels.care_level}`
    : levelItems.find((item) => String(item.level_type).includes('care'))?.level_name ?? '-'

  const archiveSections = [
    { title: '主档案', value: pick(archive, ['basic', 'archive', 'main']) },
    { title: '过敏史', value: pick(archive, ['allergy', 'allergies', 'allergy_histories']) },
    { title: '既往疾病史', value: pick(archive, ['disease', 'diseases', 'disease_histories']) },
    { title: '家族史', value: pick(archive, ['family', 'families', 'family_histories']) },
    { title: '手术史', value: pick(archive, ['operation', 'operations', 'operation_histories']) },
    { title: '生活习惯', value: pick(archive, ['lifestyle', 'life_style']) },
  ]

  return (
    <PageContainer
      title="健康会员详情"
      description="查看会员基础信息、健康档案、慢病与近期指标"
      extra={<Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/member')}>返回列表</Button>}
    >
      <Spin spinning={loading}>
        <Card variant="borderless" className="mb-card">
          <Descriptions title="基本信息" bordered column={{ xs: 1, md: 2, xl: 3 }}>
            <Descriptions.Item label="姓名">{m?.name || '-'}</Descriptions.Item>
            <Descriptions.Item label="联系电话">{m?.phone || '-'}</Descriptions.Item>
            <Descriptions.Item label="性别">{m?.gender === 1 ? '男' : m?.gender === 2 ? '女' : '未知'}</Descriptions.Item>
            <Descriptions.Item label="生日">{m?.birthday || '-'}</Descriptions.Item>
            <Descriptions.Item label="档案状态">{m?.status != null ? MEMBER_STATUS_MAP[m.status] ?? `状态 ${m.status}` : '-'}</Descriptions.Item>
            <Descriptions.Item label="风险分层">{riskText}</Descriptions.Item>
            <Descriptions.Item label="照护等级">{careText}</Descriptions.Item>
            <Descriptions.Item label="紧急联系人">{m?.emergency_contact || profile?.contact?.emergency_contact || '-'}</Descriptions.Item>
            <Descriptions.Item label="紧急联系电话">{m?.emergency_phone || profile?.contact?.emergency_phone || '-'}</Descriptions.Item>
          </Descriptions>
        </Card>

        <Card variant="borderless" className="mb-card" title="慢病与健康目标">
          <div className="mb-detail__field">
            <span className="mb-detail__label">慢病</span>
            <div>
              {profile?.chronic_diseases?.length
                ? profile.chronic_diseases.map((disease) => <Tag key={`${disease.disease_id}-${disease.disease_name}`}>{disease.disease_name || disease.disease_id}</Tag>)
                : '-'}
            </div>
          </div>
          <div className="mb-detail__field mb-detail__field--full">
            <span className="mb-detail__label">当前健康目标</span>
            <div>{profile?.recent_goals?.map((goal) => goal.name).filter(Boolean).join('；') || '-'}</div>
          </div>
        </Card>

        <Card variant="borderless" className="mb-card" title="近期健康指标">
          <List
            dataSource={profile?.latest_metrics ?? []}
            locale={{ emptyText: '暂无指标记录' }}
            renderItem={(metric) => (
              <List.Item key={`${metric.metric_id}-${metric.measurement_time}`}>
                <List.Item.Meta
                  title={`${metric.metric_name_cn || metric.metric_code}：${metric.metric_value} ${metric.metric_unit || ''}`}
                  description={`测量时间：${metric.measurement_time ? formatDateTime(metric.measurement_time * 1000) : '-'}${metric.is_abnormal ? ' · 异常' : ''}`}
                />
              </List.Item>
            )}
          />
        </Card>

        {archiveFailed && (
          <Alert type="warning" showIcon title="健康档案卡加载失败" description="会员聚合信息仍可查看，请稍后重试。" />
        )}
        {!archiveFailed && archiveSections.map((section) => (
          <Card variant="borderless" className="mb-card" title={section.title} key={section.title}>
            <ArchiveData value={section.value} />
          </Card>
        ))}
      </Spin>
    </PageContainer>
  )
}
