/**
 * 机构管理 - 新增机构（设计稿：基本与服务信息.png）
 * 平台管理员建立机构主数据，并同步创建该机构的首个机构管理员
 * TODO: 机构创建接口 API v0.1 未定义（运营后台域），待后端补充
 */
import { useState } from 'react'
import { Button, Checkbox, DatePicker, Input, Select, message } from 'antd'
import { EnvironmentFilled } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import PageContainer from '@/components/PageContainer'
import { mockOrgCreate } from './mock'
import './index.less'

export default function InstitutionCreate() {
  const navigate = useNavigate()
  const c = mockOrgCreate
  const [name, setName] = useState('城东护理院')
  const [type, setType] = useState('护理院')
  const [creditCode, setCreditCode] = useState('91110105MA01XXXXXX')
  const [status, setStatus] = useState('运营中')
  const [shortName, setShortName] = useState('城东中心')
  const [code, setCode] = useState('ORG-001')
  const [region, setRegion] = useState('北京市 / 朝阳区')
  const [address, setAddress] = useState('幸福路88号')
  const [principal, setPrincipal] = useState('赵海')
  const [principalPhone, setPrincipalPhone] = useState('13888886666')
  const [contact, setContact] = useState('刘主任')
  const [services, setServices] = useState<string[]>(c.serviceOptions)
  const [syncScopes, setSyncScopes] = useState<string[]>(c.syncScopes)

  const onSubmit = (draft: boolean) => {
    if (!name.trim() || !creditCode.trim() || !principal.trim()) {
      message.warning('请填写机构名称、统一社会信用代码与机构负责人')
      return
    }
    // TODO: 机构创建接口待后端补充；保存后同步创建首个机构管理员账号
    message.success(
      draft ? '草稿已保存' : '机构已保存，首个机构管理员账号已创建并进入待同步状态',
    )
    if (!draft) navigate('/organization')
  }

  return (
    <div className="org-page">
      <PageContainer
        title="新增机构"
        description="平台管理员建立机构主数据，并同步创建该机构的首个机构管理员"
      >
        <div className="org-create">
          {/* 左：机构表单 */}
          <div className="org-card">
            <div className="org-section__title">机构基本信息</div>
            <div className="org-form__grid">
              <div className="org-field">
                <div className="org-field__label">
                  机构名称 <span className="org-required">*</span>
                </div>
                <Input value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div className="org-field">
                <div className="org-field__label">
                  机构类型 <span className="org-required">*</span>（护理院 / 康复机构）
                </div>
                <Select
                  value={type}
                  onChange={setType}
                  options={['护理院', '康复机构'].map((v) => ({ value: v, label: v }))}
                />
              </div>
              <div className="org-field">
                <div className="org-field__label">
                  统一社会信用代码 <span className="org-required">*</span>
                </div>
                <Input value={creditCode} onChange={(e) => setCreditCode(e.target.value)} />
              </div>
              <div className="org-field">
                <div className="org-field__label">
                  运营状态 <span className="org-required">*</span>
                </div>
                <Select
                  value={status}
                  onChange={setStatus}
                  options={['运营中', '筹备中', '已停用'].map((v) => ({ value: v, label: v }))}
                />
              </div>
              <div className="org-field">
                <div className="org-field__label">机构简称</div>
                <Input value={shortName} onChange={(e) => setShortName(e.target.value)} />
              </div>
              <div className="org-field">
                <div className="org-field__label">机构编码</div>
                <Input value={code} onChange={(e) => setCode(e.target.value)} />
              </div>
              <div className="org-field">
                <div className="org-field__label">成立日期</div>
                <DatePicker placeholder="2018-05-20" />
              </div>
            </div>

            <div className="org-section__title">地址与联系人</div>
            <div className="org-form__grid">
              <div className="org-field">
                <div className="org-field__label">
                  所在省市区 <span className="org-required">*</span>
                </div>
                <Select
                  value={region}
                  onChange={setRegion}
                  options={['北京市 / 朝阳区', '北京市 / 西城区', '北京市 / 丰台区'].map((v) => ({
                    value: v,
                    label: v,
                  }))}
                />
              </div>
              <div className="org-field">
                <div className="org-field__label">
                  详细地址 <span className="org-required">*</span>（地图选点自动回填）
                </div>
                <Input value={address} onChange={(e) => setAddress(e.target.value)} />
              </div>
              <div className="org-field">
                <div className="org-field__label">
                  机构负责人 <span className="org-required">*</span>
                </div>
                <Input value={principal} onChange={(e) => setPrincipal(e.target.value)} />
              </div>
              <div className="org-field">
                <div className="org-field__label">
                  机构负责人手机号 <span className="org-required">*</span>
                </div>
                <Input value={principalPhone} onChange={(e) => setPrincipalPhone(e.target.value)} />
              </div>
              <div className="org-field">
                <div className="org-field__label">运营联系人</div>
                <Input value={contact} onChange={(e) => setContact(e.target.value)} />
              </div>
            </div>

            <div className="org-section__title">服务能力</div>
            <Checkbox.Group
              className="org-services"
              value={services}
              onChange={(v) => setServices(v as string[])}
              options={c.serviceOptions}
            />
            <div className="org-note">{c.serviceNote}</div>
            <div className="org-note org-note--green">{c.sourceNote}</div>

            <div className="org-license">
              <div>
                <div className="org-license__name">{c.license.name}</div>
                <div className="org-license__meta">
                  许可证登记号 {c.license.no} · 有效期至 {c.license.validUntil}
                </div>
              </div>
              <span className="org-tag org-tag--green">有效</span>
              <Button onClick={() => message.info('附件上传功能待接入')}>上传或替换附件</Button>
            </div>
          </div>

          {/* 右：同步与定位 */}
          <div className="org-create__rail">
            <div className="org-card">
              <div className="org-card__header">
                <span className="org-card__title">运营平台同步</span>
              </div>
              <div className="org-field__label">同步范围</div>
              <Checkbox.Group
                className="org-sync-scopes"
                value={syncScopes}
                onChange={(v) => setSyncScopes(v as string[])}
                options={c.syncScopes}
              />
              <div className="org-field__label org-rail__gap">首个机构管理员</div>
              <div className="org-admin-box">{c.firstAdmin}</div>
              <div className="org-note org-note--warn">{c.syncTip}</div>
            </div>

            <div className="org-card">
              <div className="org-card__header">
                <span className="org-card__title">地址定位</span>
                <span className="org-geo__confirmed">
                  <EnvironmentFilled /> 已在地图确认
                </span>
              </div>
              <div className="org-geo__search">
                <Input defaultValue="幸福路88号" />
                <Button>搜索</Button>
              </div>
              <div className="org-geo__map">
                <EnvironmentFilled className="org-geo__pin" />
                <span>{name || '机构位置'}</span>
              </div>
              <div className="org-geo__meta">
                标准地址 {c.geo.address}
                <br />
                经纬度 {c.geo.lng}, {c.geo.lat}　·　
                <span className="org-text--link">重新选点</span>
              </div>
              <div className="org-note org-note--green">{c.geo.note}</div>
            </div>
          </div>
        </div>

        <div className="org-create__actions">
          <Button onClick={() => navigate('/organization')}>取消</Button>
          <Button onClick={() => onSubmit(true)}>保存草稿</Button>
          <Button type="primary" onClick={() => onSubmit(false)}>
            保存并创建管理员
          </Button>
        </div>
      </PageContainer>
    </div>
  )
}
