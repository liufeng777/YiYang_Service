/**
 * 健康档案 - 新建健康档案（设计稿：关联会员.png / 进入完善档案.png）
 * 关联实名会员 → 基础信息 → 健康概况 → 家属授权 → 创建成功
 * 会员查询 / 创建当前为 mock；接入后端后替换为 memberApi.createMember
 */
import { useState } from 'react'
import { Button, Checkbox, DatePicker, Input, Select } from 'antd'
import { CheckCircleFilled, CheckOutlined, LeftOutlined, PlusOutlined, SearchOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import dayjs from 'dayjs'
import PageContainer from '@/components/PageContainer'
import { mockCreateSuccess, mockVerifiedMember } from './mock'
import './index.less'

const DISEASE_OPTIONS = ['高血压', '糖尿病', '冠心病', '慢阻肺', '骨质疏松']

/** 创建成功视图（设计稿：进入完善档案.png） */
function CreateSuccess({ onAgain }: { onAgain: () => void }) {
  const navigate = useNavigate()
  const s = mockCreateSuccess
  return (
    <div className="hr-success">
      <div className="hr-success__card">
        <div className="hr-success__icon">
          <CheckOutlined />
        </div>
        <div className="hr-success__title">健康档案创建成功</div>
        <div className="hr-success__subtitle">档案编号：{s.profileNo}</div>

        <div className="hr-success__member">
          <div className="hr-success__avatar">{s.name.slice(0, 1)}</div>
          <div>
            <div className="hr-success__name">
              {s.name} · {s.gender} · {s.age}岁
            </div>
            <div className="hr-success__meta">
              {s.org} · {s.identity} · 建档来源：{s.source}
            </div>
            <div className="hr-success__tags">
              {s.tags.map((t) => (
                <span key={t} className="hr-tag hr-tag--risk-low">
                  {t}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="hr-success__banner">
          <div>
            <div className="hr-success__banner-title">基础档案同步成功</div>
            <div className="hr-success__banner-sub">已同步运营所需字段，医疗健康明细仍按专业权限管理</div>
          </div>
          <span className="hr-success__banner-status">同步正常</span>
        </div>

        <div className="hr-success__note">基础建档已完成，待分配管理团队。</div>
        <div className="hr-success__actions">
          <Button onClick={onAgain}>继续新增</Button>
          <Button type="primary" onClick={() => navigate('/health-record/1/assign')}>
            分配管理团队
          </Button>
        </div>
      </div>
    </div>
  )
}

export default function HealthRecordCreate() {
  const navigate = useNavigate()
  const [keyword, setKeyword] = useState('138****4628')
  const [verified, setVerified] = useState(false)
  const [diseases, setDiseases] = useState<string[]>([])
  const [guardian, setGuardian] = useState<string>()
  const [agreed, setAgreed] = useState(false)
  const [created, setCreated] = useState(false)

  const m = verified ? mockVerifiedMember : null

  const toggleDisease = (d: string) =>
    setDiseases((list) => (list.includes(d) ? list.filter((x) => x !== d) : [...list, d]))

  const reset = () => {
    setCreated(false)
    setVerified(false)
    setKeyword('')
    setDiseases([])
    setGuardian(undefined)
    setAgreed(false)
  }

  if (created) {
    return (
      <div className="hr-page">
        <PageContainer
          title="新建健康档案"
          description="档案已建立，可继续完善健康评估与管理方案"
          extra={
            <Button icon={<LeftOutlined />} onClick={() => navigate('/health-record')}>
              返回档案列表
            </Button>
          }
        >
          <CreateSuccess onAgain={reset} />
        </PageContainer>
      </div>
    )
  }

  return (
    <div className="hr-page">
      <PageContainer
        title="新建健康档案"
        description="关联实名会员并在一个页面完成基础建档，后续再进入档案持续完善"
        extra={
          <Button icon={<LeftOutlined />} onClick={() => navigate('/health-record')}>
            返回档案列表
          </Button>
        }
      >
        <div className="hr-create">
          {/* 左：表单 */}
          <div className="hr-card hr-create__form">
            {/* 1. 关联实名会员 */}
            <div className="hr-create__section-title">1. 关联实名会员</div>
            <div className="hr-create__section-desc">
              支持手机号、会员ID或姓名查询；仅实名会员可建立健康档案
            </div>
            <div className="hr-create__field-label">会员查询</div>
            <div className="hr-create__query">
              <Input
                placeholder="手机号 / 会员ID / 姓名"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value.trim())}
              />
              <Button type="primary" onClick={() => keyword && setVerified(true)}>
                查询会员
              </Button>
            </div>
            {m && (
              <div className="hr-create__verified">
                <div>
                  <CheckCircleFilled /> 已关联实名会员：{m.name} · {m.gender} · {m.age}岁 · 会员ID{' '}
                  {m.memberId}
                </div>
                <div className="hr-create__verified-sub">当前机构尚未建立健康档案，可继续创建</div>
              </div>
            )}

            {/* 2. 基础信息 */}
            <div className="hr-create__section-title">2. 基础信息</div>
            <div className="hr-create__grid">
              <div className="hr-create__field">
                <div className="hr-create__field-label">
                  姓名 <span className="hr-required">*</span>
                </div>
                <Input value={m?.name} placeholder="姓名" disabled={!verified} />
              </div>
              <div className="hr-create__field">
                <div className="hr-create__field-label">
                  性别 <span className="hr-required">*</span>
                </div>
                <Select
                  value={m?.gender}
                  placeholder="性别"
                  disabled={!verified}
                  options={[
                    { value: '女', label: '女' },
                    { value: '男', label: '男' },
                  ]}
                />
              </div>
              <div className="hr-create__field">
                <div className="hr-create__field-label">
                  出生日期 <span className="hr-required">*</span>
                </div>
                <DatePicker
                  value={m ? dayjs('1959-03-12') : null}
                  placeholder="出生日期"
                  disabled={!verified}
                  format="YYYY年M月D日"
                />
              </div>
              <div className="hr-create__field">
                <div className="hr-create__field-label">
                  手机号 <span className="hr-required">*</span>
                </div>
                <Input value={m?.phone} placeholder="手机号" disabled />
              </div>
              <div className="hr-create__field">
                <div className="hr-create__field-label">民族</div>
                <Select
                  value={m?.nation}
                  placeholder="民族"
                  disabled={!verified}
                  options={[{ value: '汉族', label: '汉族' }]}
                />
              </div>
              <div className="hr-create__field">
                <div className="hr-create__field-label">
                  常住地址 <span className="hr-required">*</span>
                </div>
                <Input value={m?.address} placeholder="常住地址" disabled={!verified} />
              </div>
            </div>

            {/* 3. 健康概况 */}
            <div className="hr-create__section-title">3. 健康概况</div>
            <div className="hr-create__section-desc">
              选择已确诊疾病；支持搜索与手动添加，专病档案在后续完善阶段建立
            </div>
            <div className="hr-create__field-label">搜索疾病</div>
            <Input prefix={<SearchOutlined />} placeholder="请输入疾病名称" className="hr-create__disease-search" />
            <div className="hr-create__diseases">
              {DISEASE_OPTIONS.map((d) => (
                <span
                  key={d}
                  className={
                    diseases.includes(d) ? 'hr-disease-chip hr-disease-chip--active' : 'hr-disease-chip'
                  }
                  onClick={() => toggleDisease(d)}
                >
                  {diseases.includes(d) && <CheckOutlined />} {d}
                </span>
              ))}
              <span className="hr-disease-chip hr-disease-chip--add">
                <PlusOutlined /> 手动添加
              </span>
            </div>

            {/* 4. 家属授权 */}
            <div className="hr-create__section-title">4. 家属授权（如由家属代办）</div>
            <div className="hr-create__section-desc">
              建档阶段仅记录授权对象及授权书勾选，不设置授权有效期
            </div>
            <div className="hr-create__field-label">授权给</div>
            <Select
              value={guardian}
              onChange={setGuardian}
              placeholder="选择家属"
              style={{width: 400}}
              options={[{ value: '沈晓晨（女儿）', label: '沈晓晨（女儿）' }]}
            />
            <div className="hr-create__agree">
              <Checkbox checked={agreed} onChange={(e) => setAgreed(e.target.checked)}>
                已阅读并同意<span className="hr-create__agree-link">《健康档案及敏感个人信息授权书》</span>
              </Checkbox>
            </div>

            <div className="hr-create__note">
              说明：健康档案创建后进入待分配患者，由机构管理员分配健康管理团队。
            </div>
            <div className="hr-create__actions">
              <Button>保存草稿</Button>
              <Button type="primary" disabled={!verified || !agreed} onClick={() => setCreated(true)}>
                创建健康档案
              </Button>
            </div>
          </div>

          {/* 右：建档摘要 */}
          <div className="hr-create__aside">
            <div className="hr-card hr-create__summary">
              <div className="hr-card__title">建档摘要</div>
              <div className="hr-summary">
                <div className="hr-summary__row">
                  <span className="hr-summary__label">会员身份</span>
                  <span className="hr-summary__value hr-text--primary">{m ? '实名会员' : '—'}</span>
                </div>
                <div className="hr-summary__row">
                  <span className="hr-summary__label">服务对象</span>
                  <span className="hr-summary__value">
                    {m ? `${m.name} · ${m.age}岁` : '—'}
                  </span>
                </div>
                <div className="hr-summary__row">
                  <span className="hr-summary__label">已选疾病</span>
                  <span className="hr-summary__value">
                    {diseases.length ? diseases.join('、') : '—'}
                  </span>
                </div>
                <div className="hr-summary__row">
                  <span className="hr-summary__label">家属授权</span>
                  <span className="hr-summary__value">{guardian ?? '—'}</span>
                </div>
              </div>
              <div className="hr-create__flow">
                <div className="hr-create__flow-title">建档后流程</div>
                <ul>
                  <li>建档后进入待分配患者</li>
                  <li>由机构管理员分配管理团队</li>
                  <li>团队成员共同管理患者</li>
                  <li>支持后续重新分配</li>
                </ul>
              </div>
              <div className="hr-create__aside-note">
                创建后进入健康档案详情，继续完善健康史、专病档案、检查检验和生活方式信息。
              </div>
            </div>
          </div>
        </div>
      </PageContainer>
    </div>
  )
}
