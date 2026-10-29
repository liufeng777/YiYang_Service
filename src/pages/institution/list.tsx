/**
 * 机构信息（设计稿：11.机构管理/基本与服务信息.png）
 * 已对接 GET /api/v1/staff/institutions/current：
 * 展示当前登录机构的基本信息与已启用服务列表（所有岗位可见，不挂权限）
 * 说明：机构列表/新增/同步运营平台等平台侧端点 swagger 未定义，
 * 新增机构、机构详情页保留本地 mock 演示，未接入真实接口
 */
import { useEffect, useState } from 'react'
import { Table, Tag } from 'antd'
import PageContainer from '@/components/PageContainer'
import { institutionApi } from '@/api'
import type { CurrentInstitution, InstitutionService } from '@/api/modules/institution'
import './index.less'

const typeText: Record<number, string> = {
  1: '护理院',
  2: '驿站',
}

export default function InstitutionInfo() {
  const [detail, setDetail] = useState<CurrentInstitution | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setLoading(true)
    institutionApi
      .getCurrentInstitution()
      .then((res) => setDetail(res))
      .catch(() => undefined)
      .finally(() => setLoading(false))
  }, [])

  const services = detail?.enabled_services ?? [];
  const institution = detail?.institution ?? null

  const serviceColumns = [
    {
      title: '服务名称',
      key: 'service_name',
      dataIndex: 'service_name'
    },
    {
      title: '服务分类',
      key: 'service_category_name',
      dataIndex: 'service_category_name'
    },
    {
      title: '单价',
      key: 'price',
      dataIndex: 'price'
    },
    {
      title: '单位',
      dataIndex: 'unit',
      key: 'unit',
    },
    {
      title: '服务方式',
      dataIndex: 'is_home_service',
      key: 'is_home_service',
      width: 120,
      render: (v) => <Tag>{v === 1 ? '上门' : '到店'}</Tag>
    }
  ]

  return (
    <div className="org-page">
      <PageContainer
        title="机构信息"
        description="当前登录机构的基本信息与已启用服务（数据来自当前机构接口）"
      >
        {/* 基本信息 */}
        {institution && <div className="org-card">
          <div className="org-card__header">
            <span className="org-card__title">基本信息</span>
            <Tag color={institution.type === 1 ? 'blue' : 'purple'} variant='outlined'>{typeText[institution.type]}</Tag>
          </div>
          <div className="org-info-grid">
            <div>
              <div className="org-kv__label">机构名称</div>
              <div className="org-info-grid__value">
                {institution.name} {institution.name_en || ''}
              </div>
            </div>
            <div>
              <div className="org-kv__label">机构地址</div>
              <div className="org-info-grid__value">{institution.address || '-'}</div>
            </div>
            <div>
              <div className="org-kv__label">联系人</div>
              <div className="org-info-grid__value">{institution.manager_name || '-'} ({institution.manager_phone})</div>
            </div>
            <div>
              <div className="org-kv__label">联系电话</div>
              <div className="org-info-grid__value">{institution.contact_phone || '-'}</div>
            </div>
            <div>
              <div className="org-kv__label">服务范围</div>
              <div className="org-info-grid__value">{institution.service_radius_km + 'km'}</div>
            </div>
          </div>
          {institution.description && (
            <div className="org-note" style={{ marginTop: 12 }}>
              {institution.description}
            </div>
          )}
        </div>}

        {/* 服务信息 */}
        <div className="org-card">
          <div className="org-card__header">
            <span className="org-card__title">已启用服务</span>
            <span className="org-kv__label">共 {services.length} 项</span>
          </div>
          <Table<InstitutionService>
            rowKey={(row) => row.service_id}
            columns={serviceColumns}
            dataSource={services}
            loading={loading}
            size="small"
            pagination={false}
            locale={{ emptyText: '暂无已启用服务' }}
          />
        </div>
      </PageContainer>
    </div>
  )
}
