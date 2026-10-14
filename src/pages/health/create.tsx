/**
 * 健康档案 - 新建健康档案（设计稿：关联会员.png / 进入完善档案.png）
 * 已对接：
 * - GET  /api/v1/staff/members  会员查询（按关键字检索是否已建档）
 * - POST /api/v1/staff/members  创建健康档案（§4）
 * 说明：民族/常住地址/疾病标签/家属授权书 API v0.1 未提供落库字段，仅作界面录入不参与提交
 */
import { useState } from 'react'
import { Button, Checkbox, DatePicker, Input, Select, App } from 'antd'
import { CheckCircleFilled, CheckOutlined, LeftOutlined, PlusOutlined, SearchOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import dayjs, { type Dayjs } from 'dayjs'
import PageContainer from '@/components/PageContainer'
import { memberApi } from '@/api'
import type { MemberItem } from '@/api/modules/member'
import './index.less'

const DISEASE_OPTIONS = ['高血压', '糖尿病', '冠心病', '慢阻肺', '骨质疏松']

interface CreatedInfo {
  id: number
  name: string
  gender: number
  birthday: string
}

/** 创建成功视图（设计稿：进入完善档案.png） */
function CreateSuccess({ info, onAgain }: { info: CreatedInfo; onAgain: () => void }) {
  const navigate = useNavigate()
  const age = dayjs().diff(dayjs(info.birthday), 'year')
  return (
    <div className="hr-success">
      <div className="hr-success__card">
        <div className="hr-success__icon">
          <CheckOutlined />
        </div>
        <div className="hr-success__title">健康档案创建成功</div>
        <div className="hr-success__subtitle">档案编号：{info.id}</div>

        <div className="hr-success__member">
          <div className="hr-success__avatar">{info.name.slice(0, 1)}</div>
          <div>
            <div className="hr-success__name">
              {info.name} · {info.gender === 1 ? '男' : '女'} · {age}岁
            </div>
            <div className="hr-success__meta">建档来源：机构手动建档</div>
          </div>
        </div>

        <div className="hr-success__note">基础建档已完成，待分配管理团队。</div>
        <div className="hr-success__actions">
          <Button onClick={onAgain}>继续新增</Button>
          <Button type="primary" onClick={() => navigate(`/health-record/${info.id}/assign`)}>
            分配管理团队
          </Button>
        </div>
      </div>
    </div>
  )
}

export default function HealthRecordCreate() {
  const navigate = useNavigate()
  const { message } = App.useApp()
  const [keyword, setKeyword] = useState('')
  const [querying, setQuerying] = useState(false)
  const [matched, setMatched] = useState<MemberItem | null>(null)
  const [name, setName] = useState('')
  const [gender, setGender] = useState<number>()
  const [birthday, setBirthday] = useState<Dayjs | null>(null)
  const [phone, setPhone] = useState('')
  const [emergencyContact, setEmergencyContact] = useState('')
  const [emergencyPhone, setEmergencyPhone] = useState('')
  const [diseases, setDiseases] = useState<string[]>([])
  const [agreed, setAgreed] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [created, setCreated] = useState<CreatedInfo | null>(null)

  const toggleDisease = (d: string) =>
    setDiseases((list) => (list.includes(d) ? list.filter((x) => x !== d) : [...list, d]))

  /** 查询是否已有会员 / 档案（命中则提示并带入基础信息） */
  const onQuery = async () => {
    if (!keyword) {
      message.warning('请输入手机号 / 会员ID / 姓名')
      return
    }
    setQuerying(true)
    try {
      const res = await memberApi.getMemberList({ page: 1, page_size: 1, keyword })
      const hit = res.list[0] ?? null
      setMatched(hit)
      if (hit) {
        setName(hit.name || '')
        setGender(hit.gender || undefined)
        setBirthday(hit.birthday ? dayjs(hit.birthday) : null)
        setPhone(hit.phone || '')
        message.info('已存在该会员档案，可直接查看或继续完善')
      } else {
        message.success('未查询到已建档会员，请填写基础信息创建档案')
      }
    } catch {
      // 错误提示由拦截器统一处理
    } finally {
      setQuerying(false)
    }
  }

  const onSubmit = async () => {
    if (!name || !gender || !birthday || !phone) {
      message.warning('请完整填写姓名、性别、出生日期、手机号')
      return
    }
    setSubmitting(true)
    try {
      const res = await memberApi.createMember({
        name,
        gender,
        birthday: birthday.format('YYYY-MM-DD'),
        phone,
        emergency_contact: emergencyContact || undefined,
        emergency_phone: emergencyPhone || undefined,
      })
      message.success('健康档案创建成功')
      setCreated({ id: res.id, name, gender, birthday: birthday.format('YYYY-MM-DD') })
    } catch {
      // 错误提示由拦截器统一处理
    } finally {
      setSubmitting(false)
    }
  }

  const reset = () => {
    setCreated(null)
    setMatched(null)
    setKeyword('')
    setName('')
    setGender(undefined)
    setBirthday(null)
    setPhone('')
    setEmergencyContact('')
    setEmergencyPhone('')
    setDiseases([])
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
          <CreateSuccess info={created} onAgain={reset} />
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
                onPressEnter={onQuery}
              />
              <Button type="primary" onClick={onQuery} loading={querying}>
                查询会员
              </Button>
            </div>
            {matched && (
              <div className="hr-create__verified">
                <div>
                  <CheckCircleFilled /> 已存在会员档案：{matched.name} · 会员ID {matched.id}
                </div>
                <div className="hr-create__verified-sub">
                  重复建档可能被服务端拒绝，建议直接前往档案详情完善
                </div>
              </div>
            )}

            {/* 2. 基础信息 */}
            <div className="hr-create__section-title">2. 基础信息</div>
            <div className="hr-create__grid">
              <div className="hr-create__field">
                <div className="hr-create__field-label">
                  姓名 <span className="hr-required">*</span>
                </div>
                <Input value={name} onChange={(e) => setName(e.target.value.trim())} placeholder="姓名" />
              </div>
              <div className="hr-create__field">
                <div className="hr-create__field-label">
                  性别 <span className="hr-required">*</span>
                </div>
                <Select
                  value={gender}
                  onChange={setGender}
                  placeholder="性别"
                  options={[
                    { value: 2, label: '女' },
                    { value: 1, label: '男' },
                  ]}
                />
              </div>
              <div className="hr-create__field">
                <div className="hr-create__field-label">
                  出生日期 <span className="hr-required">*</span>
                </div>
                <DatePicker
                  value={birthday}
                  onChange={setBirthday}
                  placeholder="出生日期"
                  format="YYYY年M月D日"
                />
              </div>
              <div className="hr-create__field">
                <div className="hr-create__field-label">
                  手机号 <span className="hr-required">*</span>
                </div>
                <Input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.trim())}
                  placeholder="手机号"
                  maxLength={11}
                />
              </div>
              <div className="hr-create__field">
                <div className="hr-create__field-label">紧急联系人</div>
                <Input
                  value={emergencyContact}
                  onChange={(e) => setEmergencyContact(e.target.value.trim())}
                  placeholder="紧急联系人姓名"
                />
              </div>
              <div className="hr-create__field">
                <div className="hr-create__field-label">紧急联系电话</div>
                <Input
                  value={emergencyPhone}
                  onChange={(e) => setEmergencyPhone(e.target.value.trim())}
                  placeholder="紧急联系电话"
                  maxLength={11}
                />
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

            <div className="hr-create__agree">
              <Checkbox checked={agreed} onChange={(e) => setAgreed(e.target.checked)}>
                已阅读并同意<span className="hr-create__agree-link">《健康档案及敏感个人信息授权书》</span>
              </Checkbox>
            </div>

            <div className="hr-create__note">
              说明：健康档案创建后进入待分配患者，由机构管理员分配健康管理团队。
            </div>
            <div className="hr-create__actions">
              <Button
                type="primary"
                disabled={!agreed}
                loading={submitting}
                onClick={onSubmit}
              >
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
                  <span className="hr-summary__value hr-text--primary">
                    {matched ? '已建档会员' : '新建档'}
                  </span>
                </div>
                <div className="hr-summary__row">
                  <span className="hr-summary__label">服务对象</span>
                  <span className="hr-summary__value">
                    {name ? `${name}${birthday ? ` · ${dayjs().diff(birthday, 'year')}岁` : ''}` : '—'}
                  </span>
                </div>
                <div className="hr-summary__row">
                  <span className="hr-summary__label">已选疾病</span>
                  <span className="hr-summary__value">
                    {diseases.length ? diseases.join('、') : '—'}
                  </span>
                </div>
                <div className="hr-summary__row">
                  <span className="hr-summary__label">紧急联系人</span>
                  <span className="hr-summary__value">{emergencyContact || '—'}</span>
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
