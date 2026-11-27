/**
 * 人员管理 - 新增人员
 * 设计稿：普通人员基本信息.png（新增普通用户，单页表单）、
 *        专业人员基本信息.png / 新增执业资质.png / 服务授权.png（新增专业服务人员，3 步向导）
 * 已对接：
 * - GET  /api/v1/staff/positions       岗位（人员角色）选项
 * - GET  /api/v1/staff/staffs/by-phone 按完整手机号精确查找人员
 * - POST /api/v1/staff/staffs           新增人员（§7.2）
 * 说明：执业资质上传 / 服务项目授权接口待后端补充，专业人员向导的第 2/3 步暂为演示交互
 */
import { useEffect, useMemo, useState } from 'react'
import { AutoComplete, Button, Checkbox, DatePicker, Input, Segmented, Select, Steps, Switch, App } from 'antd'
import { ArrowLeftOutlined, LoadingOutlined, SearchOutlined } from '@ant-design/icons'
import { useNavigate, useSearchParams } from 'react-router-dom'
import PageContainer from '@/components/PageContainer'
import { staffApi } from '@/api'
import type { PositionItem, StaffSearchItem } from '@/api/modules/staff'
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
  const currentOrg = useUserStore((state) => state.currentOrg)
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

  /* 其他机构人员查询 */
  const [phoneSearchResults, setPhoneSearchResults] = useState<StaffSearchItem[]>([])
  const [phoneSearching, setPhoneSearching] = useState(false)
  const [phoneSearched, setPhoneSearched] = useState(false)
  const [selectedStaff, setSelectedStaff] = useState<StaffSearchItem>()

  useEffect(() => {
    const keyword = phone.trim()
    if (selectedStaff || !/^\d{11}$/.test(keyword)) {
      setPhoneSearchResults([])
      setPhoneSearching(false)
      setPhoneSearched(false)
      return
    }

    let active = true
    setPhoneSearching(true)
    setPhoneSearched(false)
    const timer = setTimeout(() => {
      staffApi.searchStaffByPhone(keyword)
        .then((list) => {
          if (!active) return
          setPhoneSearchResults(list)
          setPhoneSearched(true)
        })
        .catch(() => {
          if (!active) return
          setPhoneSearchResults([])
          message.error('人员查询失败，请稍后重试')
        })
        .finally(() => {
          if (active) setPhoneSearching(false)
        })
    }, 300)

    return () => {
      active = false
      clearTimeout(timer)
    }
  }, [phone, selectedStaff, currentOrg?.id, message])

  const handleExistingStaffSelect = (selectedPhone: string) => {
    const staff = phoneSearchResults.find((item) => item.phone === selectedPhone)
    if (!staff) return

    // setType(staff.staff_type === 2 ? 'pro' : 'normal')
    setStep(1)
    setName(staff.name)
    setGender(staff.gender)
    setIdCard(staff.id_card ?? '')
    setPhone(staff.phone)
    // setStaffNo(staff.staff_no ?? '')
    setPassword('')
    setEnabled(true)
    // setPositionCode(staff.position_code)
    // setRelations(staff.institution_id === Number(currentOrg?.id) ? ['本机构在职'] : ['多点执业'])
    setSelectedStaff(staff)
    setPhoneSearchResults([])
    message.success(`已回填${staff.name}的信息，请确认后加入当前机构`)
  }

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
    if (!currentOrg?.id) {
      message.warning('未获取到当前机构，请重新选择机构')
      return
    }
    setSubmitting(true)
    try {
      await staffApi.createStaff({
        institution_id: Number(currentOrg.id),
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
    <div className="staff-page staff-create">
      <PageContainer
        title={type === 'pro' ? '新增专业服务人员' : '新增普通用户'}
        description={desc}
        extra={<Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/staff')}>返回人员列表</Button>}
      >
        <div className="staff-create__layout">
          <div className="staff-create__header">
            {/* 人员类型切换 */}
            <div className="staff-create__type">
              <Segmented
                block
                size="large"
                value={type}
                onChange={(v) => {
                  setType(v as StaffTypeKey)
                  setStep(1)
                }}
                options={[
                  {
                    value: 'normal',
                    label: (
                      <div className="staff-create__type-option">
                        <span className="staff-create__type-title">普通用户</span>
                        <span className="staff-create__type-desc">基础信息与人员角色</span>
                      </div>
                    ),
                  },
                  {
                    value: 'pro',
                    label: (
                      <div className="staff-create__type-option">
                        <span className="staff-create__type-title">专业服务人员</span>
                        <span className="staff-create__type-desc">基础信息、执业资质与服务授权</span>
                      </div>
                    ),
                  },
                ]}
              />
            </div>

            {/* 专业人员步骤条：使用编号节点与连接线，与人员类型 Tab 区分 */}
            {type === 'pro' && (
              <Steps
                className="staff-steps"
                current={step - 1}
                onChange={(current) => setStep(current + 1)}
                items={PRO_STEPS.map((title) => ({ title }))}
              />
            )}
          </div>

          <div className="staff-create__content">
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
                <div className="staff-field__label">
                  手机号 <span className="staff-required">*</span>
                </div>
                <AutoComplete
                  value={phone}
                  options={phoneSearchResults.map((staff) => ({
                    value: staff.phone,
                    label: (
                      <div className="staff-phone-option">
                        <div className="staff-phone-option__main">
                          <strong>{staff.name}</strong>
                          <span>{staff.phone}</span>
                        </div>
                        {/* <div className="staff-phone-option__meta">
                          {staff.referral_code} · {staff.institution_name || `机构 #${staff.institution_id}`}
                        </div> */}
                      </div>
                    ),
                  }))}
                  filterOption={false}
                  defaultActiveFirstOption={false}
                  notFoundContent={phoneSearching ? '正在查询…' : phoneSearched ? '未找到其他机构人员' : null}
                  onChange={(value) => {
                    const nextPhone = value.replace(/\D/g, '').slice(0, 11)
                    setPhone(nextPhone)
                    setSelectedStaff((current) => current?.phone === nextPhone ? current : undefined)
                  }}
                  onSelect={handleExistingStaffSelect}
                  popupMatchSelectWidth={320}
                >
                  <Input
                    placeholder="请输入完整的 11 位手机号查询人员"
                    maxLength={11}
                    suffix={phoneSearching ? <LoadingOutlined /> : <SearchOutlined />}
                  />
                </AutoComplete>
                {/* {selectedStaff ? (
                  <div className="staff-field__hint staff-field__hint--selected">
                    已选择{selectedStaff.name}（{selectedStaff.institution_name || `机构 #${selectedStaff.institution_id}`}），保存后加入
                    {currentOrg?.name ?? institutionName ?? '当前机构'}
                  </div>
                ) : (
                  <div className="staff-field__hint">输入完整手机号后自动查询，选择结果可回填人员信息</div>
                )} */}
              </div>
              <div className="staff-field">
                <div className="staff-field__label">初始密码 <span className="staff-required">*</span></div>
                <Input.Password
                  placeholder="不填则由服务端生成并短信下发"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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
                <div className="staff-field__label">工号</div>
                <Input
                  placeholder="请输入工号"
                  value={staffNo}
                  onChange={(e) => setStaffNo(e.target.value)}
                />
              </div>
            </div>

            <div className="staff-section__title">机构与人员角色</div>
            <div className="staff-form__grid">
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
              <div className="staff-field">
                <div className="staff-field__label">账号状态</div>
                <div className="staff-field__switch">
                  <Switch checked={enabled} onChange={setEnabled} />
                  <span>{enabled ? '启用' : '停用'}</span>
                </div>
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
          </div>

          {/* 底部操作：固定展示，不随表单滚动 */}
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
        </div>
      </PageContainer>
    </div>
  )
}
