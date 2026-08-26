/**
 * 机构管理 - 机构详情（设计稿：同步运营平台.png）
 * 机构主数据详情 + 运营平台同步记录
 * TODO: 机构详情 / 同步接口 API v0.1 未定义（运营后台域），待后端补充
 */
import { Button, message } from 'antd'
import { EnvironmentFilled } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import PageContainer from '@/components/PageContainer'
import { mockOrgDetail } from './mock'
import './index.less'

export default function InstitutionDetail() {
  const navigate = useNavigate()
  const d = mockOrgDetail

  return (
    <div className="org-page">
      <PageContainer
        title={d.name}
        description={`机构编码 ${d.code} · 机构类型：${d.type}`}
        extra={
          <span className="org-detail__extra">
            <Button onClick={() => navigate('/organization/create')}>编辑机构</Button>
            <Button
              type="primary"
              onClick={() => message.success('已发起同步，同步结果将记录在右侧同步记录')}
            >
              立即同步
            </Button>
          </span>
        }
      >
        {/* 概要卡 */}
        <div className="org-card org-detail__head">
          <div>
            <div className="org-detail__name">
              {d.name}
              <span className="org-tag org-tag--green">{d.status}</span>
              <span className="org-tag org-tag--blue">{d.type}</span>
            </div>
            <div className="org-detail__meta">统一社会信用代码：{d.creditCode}</div>
            <div className="org-detail__meta">
              {d.address} · 负责人：{d.principal} · {d.phone}
            </div>
          </div>
          <div className="org-detail__sync">
            <div className="org-detail__sync-label">运营平台同步</div>
            <div className="org-detail__sync-value">{d.syncState}</div>
            <div className="org-detail__sync-time">{d.syncTime}</div>
          </div>
        </div>

        <div className="org-detail">
          <div className="org-detail__main">
            {/* 机构信息 */}
            <div className="org-card">
              <div className="org-card__header">
                <span className="org-card__title">机构信息</span>
              </div>
              <div className="org-info-grid">
                {d.info.map((i) => (
                  <div key={i.label} className="org-info-grid__item">
                    <div className="org-field__label">{i.label}</div>
                    <div className="org-info-grid__value">{i.value}</div>
                  </div>
                ))}
              </div>
              <div className="org-field__label org-rail__gap">服务能力</div>
              <div className="org-detail__services">
                {d.services.map((s) => (
                  <span key={s} className="org-service-tag">
                    {s}
                  </span>
                ))}
                <div className="org-license org-license--inline">
                  <div>
                    <div className="org-license__name">
                      机构资质 <span className="org-tag org-tag--green">{d.license.status}</span>
                    </div>
                    <div className="org-license__meta">
                      {d.license.name}
                      <br />
                      {d.license.no}
                      <br />
                      有效期至 {d.license.validUntil}
                    </div>
                  </div>
                  <span
                    className="org-text--link"
                    onClick={() => message.info('附件查看功能待接入')}
                  >
                    查看附件 ›
                  </span>
                </div>
              </div>
            </div>

            {/* 地址定位与 C 端展示 */}
            <div className="org-card">
              <div className="org-card__header">
                <span className="org-card__title">地址定位与 C 端展示</span>
              </div>
              <div className="org-detail__geo">
                <div className="org-geo__map org-geo__map--detail">
                  <EnvironmentFilled className="org-geo__pin" />
                </div>
                <div>
                  <div className="org-field__label">公开展示信息</div>
                  {d.cside.map((c) => (
                    <div key={c.label} className="org-kv">
                      <span className="org-kv__label">{c.label}</span>
                      <span className="org-kv__value">{c.value}</span>
                    </div>
                  ))}
                  <div className="org-note">{d.csideNote}</div>
                </div>
              </div>
              <div className="org-detail__geo-meta">
                {d.geo.address}
                <br />
                {d.geo.lng}, {d.geo.lat}
              </div>
            </div>
          </div>

          {/* 右：同步记录 */}
          <div className="org-card org-detail__rail">
            <div className="org-card__header">
              <span className="org-card__title">同步记录</span>
            </div>
            <div className="org-sync-timeline">
              {d.syncRecords.map((r) => (
                <div key={r.time} className="org-sync-item">
                  <span className={`org-sync-item__dot ${r.ok ? '' : 'org-sync-item__dot--fail'}`} />
                  <div>
                    <div className="org-sync-item__time">{r.time}</div>
                    <div className={r.ok ? 'org-sync-item__title' : 'org-sync-item__title org-text--danger'}>
                      {r.title}
                    </div>
                    <div className="org-sync-item__desc">{r.desc}</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="org-note org-note--warn">{d.syncFailNote}</div>
            <Button
              className="org-detail__logs"
              onClick={() => message.info('全部同步日志功能待接入')}
            >
              查看全部同步日志
            </Button>
          </div>
        </div>
      </PageContainer>
    </div>
  )
}
