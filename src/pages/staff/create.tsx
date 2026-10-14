/**
 * 人员管理 - 新增人员
 * 设计稿：普通人员基本信息.png（新增普通用户，单页表单）、
 *        专业人员基本信息.png / 新增执业资质.png / 服务授权.png（新增专业服务人员，3 步向导）
 * 已对接：
 * - GET  /api/v1/staff/positions  岗位（人员角色）选项
 * - POST /api/v1/staff/staffs     新增人员（§7.2）
 * 说明：执业资质上传 / 服务项目授权接口待后端补充，专业人员向导的第 2/3 步暂为演示交互
 */
import { useEffect, useMemo, useState } from 'react'
import { Button, Checkbox, DatePicker, Input, Segmented, Select, Switch, App } from 'antd'
import { useNavigate, useSearchParams } from 'react-router-dom'
import PageContainer from '@/components/PageContainer'
import { staffApi } from '@/api'
import type { PositionItem } from '@/api/modules/staff'
import { useUserStore } from '@/store/modules/user'
import './index.less'

type StaffTypeKey = 'normal' | 'pro'

const PRO_STEPS = ['基本信息', '执业资质', '服务授权']

/** 人员关系选项（字典接口待补充，先按设计稿固定项） */
const RELATION_OPTIONS = ['本机构在职', '多点执业', '外部协作']

export default function StaffCreate() {
  const navigate = useNavigate()
  const { message } = App.useApp()
  const [searchParams] = useSearchParams()
  const institutionName = useUserStore((state) => state.userInfo?.institutionName)
  const [type, setType] = useState<StaffTypeKey>(
    searchParams.get('type') === 'pro' ? 'pro' : 'normal',
  )
  const [step, setStep] = useState(() => {
    const s = Number(searchParams.get('step'))
    return s >= 1 && s <= 3 ? s : 1
  })

  /* 岗位（人员角色）选项 */
  const [positions, setPositions] = useState<PositionItem[]>([])
  useEffect(() => {
    staffApi
      .getPositions()
      .then((res) => setPositions(res.list))
      .catch(() => {
        // 错误提示由拦截器统一处理
      })
  }, [])

  /* 基本信息（两类人员共用 + 专业人员扩展） */
  const [name, setName] = useState('')
  const [gender, setGender] = useState<number>()
  const [idCard, setIdCard] = useState('')
  const [phone, setPhone] = useState('')
  const [staffNo, setStaffNo] = useState('')
  const [password, setPassword] = useState('')
  const [enabled, setEnabled] = useState(true)
  const [positionCode, setPositionCode] = useState<string>()
  const [relations, setRelations] = useState<string[]>(['本机构在职'])
  const [submitting, setSubmitting] = useState(false)

  const desc = useMemo(() => {
    if (type === 'normal') return '填写普通用户基础信息，所属机构默认为当前登录机构'
    const stepDesc = [
      '填写基本信息、人员角色与任职关系',
      '上传执业资质照片并填写必要证照信息',
      '选择人员可执行的机构已开通服务项目',
    ][step - 1]
    return `步骤 ${step}/3：${stepDesc}`
  }, [type, step])

  const validBase = name.trim() && gender && phone.trim() && positionCode

  const doCreate = async (staffType: number) => {
    if (!validBase) {
      message.warning('请填写姓名、性别、手机号与人员角色')
      return
    }
    setSubmitting(true)
    try {
      await staffApi.createStaff({
        name: name.trim(),
        phone: phone.trim(),
        gender,
        id_card: idCard.trim() || undefined,
        staff_type: staffType,
        position_code: positionCode,
        status: enabled ? 1 : 0,
        password: password.trim() || undefined,
      })
      message.success(
        staffType === 1
          ? '人员已保存'
          : '人员已保存；执业资质与服务授权接口待补充，请稍后在详情页维护',
      )
      navigate('/staff')
    } catch {
      // 错误提示由拦截器统一处理
    } finally {
      setSubmitting(false)
    }
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
                  options={[
                    { value: 1, label: '男' },
                    { value: 2, label: '女' },
                  ]}
                />
              </div>
              <div className="staff-field">
                <div className="staff-field__label">身份证号</div>
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
                  maxLength={11}
                />
              </div>
              <div className="staff-field">
                <div className="staff-field__label">初始密码</div>
                <Input.Password
                  placeholder="不填则由服务端生成并短信下发"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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
                <Input value={institutionName ?? '当前机构'} disabled />
              </div>
              <div className="staff-field">
                <div className="staff-field__label">
                  人员角色 <span className="staff-required">*</span>
                </div>
                <Select
                  placeholder="请选择人员角色"
                  value={positionCode}
                  onChange={setPositionCode}
                  options={positions.map((p) => ({ value: p.position_code, label: p.position_name }))}
                  showSearch
                  optionFilterProp="label"
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
                    options={RELATION_OPTIONS}
                  />
                </div>
                <div className="staff-section__title">人员关系有效期</div>
                <div className="staff-form__grid staff-form__grid--2">
                  <div className="staff-field">
                    <div className="staff-field__label">有效期开始</div>
                    <DatePicker placeholder="开始日期" />
                  </div>
                  <div className="staff-field">
                    <div className="staff-field__label">有效期结束</div>
                    <DatePicker placeholder="结束日期" />
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* 步骤 2：执业资质（接口待补充，演示交互） */}
        {type === 'pro' && step === 2 && (
          <div className="staff-card">
            <div className="staff-card__header">
              <div>
                <div className="staff-card__title">执业资质</div>
                <div className="staff-card__sub">
                  证照照片用于证明合法执业；无法在线核验时由资质审核员人工审核
                </div>
              </div>
            </div>
            <div className="staff-note">
              执业资质上传接口待后端补充；人员创建成功后可在「人员详情 - 执业资质」中维护。
            </div>
          </div>
        )}

        {/* 步骤 3：服务授权（接口待补充，演示交互） */}
        {type === 'pro' && step === 3 && (
          <div className="staff-card">
            <div className="staff-card__header">
              <div>
                <div className="staff-card__title">服务授权</div>
                <div className="staff-card__sub">从当前机构已开通且审核通过的服务项目中多选</div>
              </div>
            </div>
            <div className="staff-note">
              服务项目列表与授权接口待后端补充；当前先保存人员基本信息。
            </div>
          </div>
        )}

        {/* 底部操作 */}
        <div className="staff-create__actions">
          {type === 'normal' ? (
            <>
              <Button onClick={() => navigate('/staff')}>取消</Button>
              <Button type="primary" loading={submitting} onClick={() => doCreate(1)}>
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
                      message.warning('请填写姓名、性别、手机号与人员角色')
                      return
                    }
                    setStep(step + 1)
                  }}
                >
                  下一步：{PRO_STEPS[step]}
                </Button>
              ) : (
                <Button type="primary" loading={submitting} onClick={() => doCreate(2)}>
                  提交并完成
                </Button>
              )}
            </>
          )}
        </div>
      </PageContainer>
    </div>
  )
}
