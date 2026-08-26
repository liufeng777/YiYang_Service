/**
 * 人员管理 - 新增人员
 * 设计稿：普通人员基本信息.png（新增普通用户，单页表单）、
 *        专业人员基本信息.png / 新增执业资质.png / 服务授权.png（新增专业服务人员，3 步向导）
 * TODO: 接口见 @/api/modules/staff（§7.2 新增人员 / 7.3 资质新增），待后端联调后替换
 */
import { useMemo, useState } from 'react'
import { Button, Checkbox, DatePicker, Input, Segmented, Select, Switch, message } from 'antd'
import { useNavigate, useSearchParams } from 'react-router-dom'
import PageContainer from '@/components/PageContainer'
import { mockStaffCreate as c } from './mock'
import './index.less'

type StaffTypeKey = 'normal' | 'pro'

const PRO_STEPS = ['基本信息', '执业资质', '服务授权']

export default function StaffCreate() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [type, setType] = useState<StaffTypeKey>(
    searchParams.get('type') === 'pro' ? 'pro' : 'normal',
  )
  const [step, setStep] = useState(() => {
    const s = Number(searchParams.get('step'))
    return s >= 1 && s <= 3 ? s : 1
  })

  /* 基本信息（两类人员共用 + 专业人员扩展） */
  const [name, setName] = useState('')
  const [gender, setGender] = useState<string>()
  const [idCard, setIdCard] = useState('')
  const [phone, setPhone] = useState('')
  const [staffNo, setStaffNo] = useState('')
  const [enabled, setEnabled] = useState(true)
  const [role, setRole] = useState<string>()
  const [relations, setRelations] = useState<string[]>(['本机构在职'])
  const [services, setServices] = useState<string[]>(c.defaultServices)

  const desc = useMemo(() => {
    if (type === 'normal') return '填写普通用户基础信息，所属机构默认为当前登录机构'
    const stepDesc = [
      '填写基本信息、人员角色与任职关系',
      '上传执业资质照片并填写必要证照信息',
      '选择人员可执行的机构已开通服务项目',
    ][step - 1]
    return `步骤 ${step}/3：${stepDesc}`
  }, [type, step])

  const validBase = name.trim() && gender && idCard.trim() && phone.trim() && role

  const onSaveNormal = () => {
    if (!validBase) {
      message.warning('请填写姓名、性别、身份证号、手机号与人员角色')
      return
    }
    // TODO: staffApi.createStaff({ staff_type: 1, ... })，phone 唯一，新增时设定初始密码
    message.success('普通用户已保存，初始密码已短信发送（演示）')
    navigate('/staff')
  }

  const onSubmitPro = () => {
    if (services.length === 0) {
      message.warning('请至少选择 1 个授权服务项目')
      return
    }
    // TODO: staffApi.createStaff + createCredential + 服务授权，提交后进入人工审核
    message.success('已提交审核，资质与服务授权审核通过后可派单（演示）')
    navigate('/staff')
  }

  return (
    <div className="staff-page">
      <PageContainer
        title={type === 'pro' ? '新增专业服务人员' : '新增普通用户'}
        description={desc}
      >
        {/* 人员类型切换 */}
        <div className="staff-create__type">
          <Segmented
            value={type}
            onChange={(v) => {
              setType(v as StaffTypeKey)
              setStep(1)
            }}
            options={[
              { value: 'normal', label: '普通用户' },
              { value: 'pro', label: '专业服务人员' },
            ]}
          />
        </div>

        {/* 专业人员步骤条 */}
        {type === 'pro' && (
          <div className="staff-steps">
            {PRO_STEPS.map((s, i) => (
              <div
                key={s}
                className={`staff-steps__item${step === i + 1 ? ' staff-steps__item--active' : ''}`}
                onClick={() => setStep(i + 1)}
              >
                <span className="staff-steps__no">{i + 1}</span>
                {s}
              </div>
            ))}
          </div>
        )}

        {/* 步骤 1 / 普通用户：基本信息 */}
        {(type === 'normal' || step === 1) && (
          <div className="staff-card">
            <div className="staff-section__title">
              {type === 'pro' ? '人员基本信息' : '人员信息'}
            </div>
            <div className="staff-form__grid">
              <div className="staff-field">
                <div className="staff-field__label">
                  姓名 <span className="staff-required">*</span>
                </div>
                <Input placeholder="请输入姓名" value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div className="staff-field">
                <div className="staff-field__label">
                  性别 <span className="staff-required">*</span>
                </div>
                <Select
                  placeholder="请选择"
                  value={gender}
                  onChange={setGender}
                  options={['男', '女'].map((v) => ({ value: v, label: v }))}
                />
              </div>
              <div className="staff-field">
                <div className="staff-field__label">
                  身份证号 <span className="staff-required">*</span>
                </div>
                <Input
                  placeholder="请输入身份证号"
                  value={idCard}
                  onChange={(e) => setIdCard(e.target.value)}
                />
              </div>
              <div className="staff-field">
                <div className="staff-field__label">
                  手机号 <span className="staff-required">*</span>
                </div>
                <Input
                  placeholder="请输入手机号（登录账号）"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
              <div className="staff-field">
                <div className="staff-field__label">工号</div>
                <Input
                  placeholder="请输入工号"
                  value={staffNo}
                  onChange={(e) => setStaffNo(e.target.value)}
                />
              </div>
              <div className="staff-field">
                <div className="staff-field__label">账号状态</div>
                <div className="staff-field__switch">
                  <Switch checked={enabled} onChange={setEnabled} />
                  <span>{enabled ? '启用' : '停用'}</span>
                </div>
              </div>
            </div>

            <div className="staff-section__title">机构与人员角色</div>
            <div className="staff-form__grid staff-form__grid--2">
              <div className="staff-field">
                <div className="staff-field__label">所属机构（当前）</div>
                <Input value={c.currentOrg} disabled />
              </div>
              <div className="staff-field">
                <div className="staff-field__label">
                  人员角色 <span className="staff-required">*</span>
                </div>
                <Select
                  placeholder="请选择人员角色"
                  value={role}
                  onChange={setRole}
                  options={(type === 'pro' ? c.proRoles : c.normalRoles).map((v) => ({
                    value: v,
                    label: v,
                  }))}
                />
              </div>
            </div>

            {type === 'pro' && (
              <>
                <div className="staff-field">
                  <div className="staff-field__label">人员关系</div>
                  <Checkbox.Group
                    value={relations}
                    onChange={(v) => setRelations(v as string[])}
                    options={c.relations}
                  />
                </div>
                <div className="staff-section__title">人员关系有效期</div>
                <div className="staff-form__grid staff-form__grid--2">
                  <div className="staff-field">
                    <div className="staff-field__label">
                      有效期开始 <span className="staff-required">*</span>
                    </div>
                    <DatePicker placeholder="2026-08-11" />
                  </div>
                  <div className="staff-field">
                    <div className="staff-field__label">
                      有效期结束 <span className="staff-required">*</span>
                    </div>
                    <DatePicker placeholder="2028-08-10" />
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* 步骤 2：执业资质 */}
        {type === 'pro' && step === 2 && (
          <div className="staff-card">
            <div className="staff-card__header">
              <div>
                <div className="staff-card__title">执业资质</div>
                <div className="staff-card__sub">
                  证照照片用于证明合法执业；无法在线核验时由资质审核员人工审核
                </div>
              </div>
              <Button type="primary" onClick={() => message.success('上传资质（演示）')}>
                + 上传资质
              </Button>
            </div>
            {c.uploads.map((u) => (
              <div key={u.name} className="staff-upload">
                <div>
                  <div className="staff-upload__name">
                    {u.name} {u.required && <span className="staff-required">*</span>}
                  </div>
                  <div className="staff-upload__desc">{u.desc}</div>
                </div>
                <Button onClick={() => message.success(`${u.action}（演示）`)}>{u.action}</Button>
              </div>
            ))}
            <div className="staff-note">{c.uploadNote}</div>
          </div>
        )}

        {/* 步骤 3：服务授权 */}
        {type === 'pro' && step === 3 && (
          <div className="staff-card">
            <div className="staff-card__header">
              <div>
                <div className="staff-card__title">服务授权</div>
                <div className="staff-card__sub">从当前机构已开通且审核通过的服务项目中多选</div>
              </div>
              <Button type="primary" onClick={() => message.success('展开选择服务项目（演示）')}>
                展开选择服务项目
              </Button>
            </div>
            <div className="staff-field">
              <div className="staff-field__label">
                授权服务项目 <span className="staff-required">*</span>
              </div>
              <Select
                mode="multiple"
                placeholder="请选择服务项目"
                value={services}
                onChange={setServices}
                options={c.serviceOptions.map((v) => ({ value: v, label: v }))}
                maxTagCount="responsive"
              />
            </div>
            <div className="staff-field">
              <div className="staff-field__label">已选项目</div>
              <div className="staff-auth-tags">
                {services.map((s) => (
                  <span key={s} className="staff-auth-tag">
                    {s}
                  </span>
                ))}
                <span className="staff-text--muted">{c.serviceNote}</span>
              </div>
            </div>
          </div>
        )}

        {/* 底部操作 */}
        <div className="staff-create__actions">
          {type === 'normal' ? (
            <>
              <Button onClick={() => navigate('/staff')}>取消</Button>
              <Button type="primary" onClick={onSaveNormal}>
                保存普通用户
              </Button>
            </>
          ) : (
            <>
              {step === 1 ? (
                <Button onClick={() => navigate('/staff')}>取消</Button>
              ) : (
                <Button onClick={() => setStep(step - 1)}>上一步</Button>
              )}
              {step < 3 ? (
                <Button
                  type="primary"
                  onClick={() => {
                    if (step === 1 && !validBase) {
                      message.warning('请填写姓名、性别、身份证号、手机号与人员角色')
                      return
                    }
                    setStep(step + 1)
                  }}
                >
                  下一步：{PRO_STEPS[step]}
                </Button>
              ) : (
                <Button type="primary" onClick={onSubmitPro}>
                  提交审核并完成
                </Button>
              )}
            </>
          )}
        </div>
      </PageContainer>
    </div>
  )
}
