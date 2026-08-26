/**
 * 人员管理模块本地 mock 数据
 * 设计稿：12.人员管理/1.人员列表（人员列表 / 状态总览 / 专业服务人员 / 普通人员 /
 *        专业人员基本信息 / 普通人员基本信息 / 执业资质 / 新增执业资质 / 服务授权）
 * 接口对齐《协同工作台-API设计》§7 服务人员管理（staffmgr:view / staffmgr:manage），
 * 见 @/api/modules/staff，待后端联调后替换
 */

/** 人员类型：normal-普通用户 pro-专业服务人员 */
export type StaffType = 'normal' | 'pro'

export const STAFF_TYPE_TEXT: Record<StaffType, string> = {
  normal: '普通用户',
  pro: '专业服务人员',
}

/** 人员状态 */
export type StaffStatus = 'valid' | 'suspended'

export const STAFF_STATUS_TEXT: Record<StaffStatus, string> = {
  valid: '有效',
  suspended: '暂停',
}

/** 派单资格 */
export type DispatchStatus = 'ok' | 'no' | 'na'

export const DISPATCH_TEXT: Record<DispatchStatus, string> = {
  ok: '可派单',
  no: '不可派单',
  na: '账号正常',
}

/** 人员列表行 */
export interface MockStaffRow {
  id: string
  name: string
  phone: string
  type: StaffType
  org: string
  role: string
  /** 资质与授权摘要 */
  credential: string
  credentialTone?: 'green' | 'orange' | 'red'
  status: StaffStatus
  statusTone: 'green' | 'blue' | 'orange' | 'red'
  dispatch: DispatchStatus
  dispatchTone: 'green' | 'teal' | 'red'
}

export const mockStaffStats = {
  total: 126,
  totalNote: '在用 124人',
  normal: 72,
  normalNote: '含健康管理师',
  pro: 54,
  proNote: '需校验执业资格',
  restricted: 3,
  restrictedNote: '证照或授权异常',
}

export const mockStaffList: MockStaffRow[] = [
  {
    id: 'ST-001',
    name: '李敏',
    phone: '138****8821',
    type: 'pro',
    org: '城东护理院',
    role: '护士',
    credential: '证照待审核',
    credentialTone: 'orange',
    status: 'valid',
    statusTone: 'blue',
    dispatch: 'no',
    dispatchTone: 'teal',
  },
  {
    id: 'ST-002',
    name: '张健',
    phone: '139****2168',
    type: 'normal',
    org: '城东护理院',
    role: '机构健康管理师',
    credential: '不适用',
    status: 'valid',
    statusTone: 'green',
    dispatch: 'na',
    dispatchTone: 'green',
  },
  {
    id: 'ST-003',
    name: '王医生',
    phone: '136****0912',
    type: 'pro',
    org: '幸福护理院',
    role: '医师',
    credential: '证照有效 · 授权3项',
    credentialTone: 'green',
    status: 'valid',
    statusTone: 'orange',
    dispatch: 'ok',
    dispatchTone: 'green',
  },
  {
    id: 'ST-004',
    name: '刘敏',
    phone: '137****6610',
    type: 'normal',
    org: '安康康复中心',
    role: '机构健康管理师',
    credential: '不适用',
    status: 'valid',
    statusTone: 'green',
    dispatch: 'na',
    dispatchTone: 'green',
  },
  {
    id: 'ST-005',
    name: '赵强',
    phone: '135****2289',
    type: 'pro',
    org: '城东护理院',
    role: '护理员',
    credential: '证照已过期',
    credentialTone: 'red',
    status: 'suspended',
    statusTone: 'red',
    dispatch: 'no',
    dispatchTone: 'red',
  },
]

/* ===== 专业人员派单资格（设计稿：状态总览.png） ===== */

export interface MockQualRow {
  id: string
  name: string
  role: string
  org: string
  credentialStatus: string
  credentialTone: 'green' | 'blue' | 'red'
  authCount: string
  dispatch: 'ok' | 'no'
  limitReason: string
  audit: string
  auditTone?: 'orange' | 'blue'
  action: 'view' | 'audit'
}

export const mockQualStats = {
  ok: 42,
  okNote: '当前有效',
  pending: 6,
  pendingNote: '证照或授权待审核',
  expiring: 7,
  expiringNote: '30天内到期',
  limited: 3,
  limitedNote: '不可派单',
}

export const mockQualList: MockQualRow[] = [
  {
    id: 'ST-003',
    name: '王医生',
    role: '医师',
    org: '幸福护理院',
    credentialStatus: '有效至2029',
    credentialTone: 'green',
    authCount: '3项',
    dispatch: 'ok',
    limitReason: '—',
    audit: '无',
    action: 'view',
  },
  {
    id: 'ST-001',
    name: '李敏',
    role: '护士',
    org: '城东护理院',
    credentialStatus: '待人工审核',
    credentialTone: 'green',
    authCount: '3项待审核',
    dispatch: 'no',
    limitReason: '证照待审核',
    audit: '待处理',
    auditTone: 'orange',
    action: 'audit',
  },
  {
    id: 'ST-006',
    name: '王芳',
    role: '护士',
    org: '城东护理院',
    credentialStatus: '有效至2028',
    credentialTone: 'blue',
    authCount: '5项',
    dispatch: 'ok',
    limitReason: '—',
    audit: '无',
    action: 'view',
  },
  {
    id: 'ST-007',
    name: '周康',
    role: '康复治疗师',
    org: '安康康复中心',
    credentialStatus: '有效至2028',
    credentialTone: 'blue',
    authCount: '2项',
    dispatch: 'ok',
    limitReason: '—',
    audit: '无',
    action: 'view',
  },
  {
    id: 'ST-005',
    name: '赵强',
    role: '护理员',
    org: '城东护理院',
    credentialStatus: '已过期',
    credentialTone: 'red',
    authCount: '1项',
    dispatch: 'no',
    limitReason: '证照已过期',
    audit: '资质',
    auditTone: 'blue',
    action: 'view',
  },
]

/* ===== 人员详情（设计稿：专业服务人员.png / 普通人员.png / 执业资质.png） ===== */

export interface MockCredential {
  name: string
  uploaded: string
  validLabel: string
  validUntil: string
  statusLabel: string
  status: string
}

export interface MockStaffDetail {
  id: string
  type: StaffType
  name: string
  phone: string
  staffNo: string
  org: string
  role: string
  headTag: string
  headTagTone: 'orange' | 'green'
  status: StaffStatus
  dispatch: DispatchStatus
  dispatchNote: string
  baseFields: { label: string; value: string }[]
  baseNote: string
  credentials?: MockCredential[]
  auditTrail?: { label: string; value: string }[]
  credentialNote?: string
  authedServices?: string[]
}

/** 专业服务人员 - 李敏 */
export const mockStaffDetailPro: MockStaffDetail = {
  id: 'ST-001',
  type: 'pro',
  name: '李敏',
  phone: '138****8821',
  staffNo: 'NUR-20260811',
  org: '城东护理院',
  role: '护士',
  headTag: '资质待审核',
  headTagTone: 'orange',
  status: 'valid',
  dispatch: 'no',
  dispatchNote: '证照待人工审核',
  baseFields: [
    { label: '姓名', value: '李敏' },
    { label: '手机号（登录账号）', value: '138****8821' },
    { label: '工号', value: 'NUR-20260811' },
    { label: '所属机构', value: '城东护理院' },
    { label: '人员角色', value: '护士' },
    { label: '账号状态', value: '启用' },
    { label: '人员关系', value: '本机构在职' },
    { label: '关系有效期', value: '2026-08-11 至 2028-08-10' },
    { label: '派单状态', value: '不可派单' },
  ],
  baseNote: '资质和服务授权均审核通过后，系统才允许匹配对应项目。',
  credentials: [
    {
      name: '护士执业证',
      uploaded: '已上传 2 张',
      validLabel: '证书有效期',
      validUntil: '至 2029-05-20',
      statusLabel: '审核状态',
      status: '待人工审核',
    },
    {
      name: '专业技术资格证',
      uploaded: '已上传 1 张',
      validLabel: '资格有效期',
      validUntil: '至 2028-12-31',
      statusLabel: '核验来源',
      status: '证照照片',
    },
  ],
  auditTrail: [
    { label: '最近审核人', value: '王审核' },
    { label: '审核时间', value: '2026-08-11 10:20' },
    { label: '审核结果', value: '待审核' },
  ],
  credentialNote: '资质过期、暂停或注销后，系统自动停止相关服务派单。',
  authedServices: ['输液港维护', '上门采血', '伤口护理'],
}

/** 普通用户 - 张健 */
export const mockStaffDetailNormal: MockStaffDetail = {
  id: 'ST-002',
  type: 'normal',
  name: '张健',
  phone: '139****2168',
  staffNo: 'HM-20260116',
  org: '城东护理院',
  role: '健康管理师',
  headTag: '账号正常',
  headTagTone: 'green',
  status: 'valid',
  dispatch: 'na',
  dispatchNote: '本周登录 5 次',
  baseFields: [
    { label: '姓名', value: '张健' },
    { label: '手机号（登录账号）', value: '139****2168' },
    { label: '工号', value: 'HM-20260116' },
    { label: '所属机构', value: '城东护理院' },
    { label: '人员角色', value: '健康管理师' },
    { label: '账号状态', value: '启用' },
  ],
  baseNote: '团队关系由团队管理统一维护；普通用户不参与专业服务派单资格校验。',
}

/* ===== 新增人员（设计稿：专业人员基本信息.png / 普通人员基本信息.png / 新增执业资质.png / 服务授权.png） ===== */

export const mockStaffCreate = {
  currentOrg: '城东护理院',
  normalRoles: ['健康管理师', '机构健康管理师', '客服专员'],
  proRoles: ['护士', '医师', '护理员', '康复治疗师'],
  relations: ['本机构在职', '聘用关系有效'],
  uploads: [
    {
      name: '执业证照照片',
      required: true,
      desc: '已上传 2 张 · 护士执业证 · 有效期至 2028-08-10',
      action: '查看',
    },
    {
      name: '专业技术资格证照片',
      required: true,
      desc: '已上传 1 张 · 护师资格证 · 有效',
      action: '查看',
    },
    { name: '其他证照照片（选填）', required: false, desc: '暂未上传', action: '上传' },
  ],
  uploadNote: '审核结果、审核人、审核时间与依据保留在本步骤的审核记录中。',
  serviceOptions: ['输液港维护', '上门采血', '伤口护理', '导尿护理', '鼻饲护理', '康复训练'],
  defaultServices: ['输液港维护', '上门采血', '伤口护理'],
  serviceNote: '可选范围：运营平台有效项目 ∩ 当前机构已开通项目',
}

/* ===== 执业资质列表（设计稿：2.服务授权/资质列表.png） ===== */

/** 资质审核状态 */
export type CredentialStatus = 'pending' | 'approved' | 'expiring' | 'expired'

export const CREDENTIAL_STATUS_TEXT: Record<CredentialStatus, string> = {
  pending: '待审核',
  approved: '审核通过',
  expiring: '即将到期',
  expired: '已过期',
}

/** 资质派单状态 */
export type CredDispatchStatus = 'checking' | 'normal' | 'limited'

export const CRED_DISPATCH_TEXT: Record<CredDispatchStatus, string> = {
  checking: '待校验',
  normal: '正常',
  limited: '已限制',
}

export interface MockCredentialRow {
  id: string
  staffId: string
  name: string
  phone: string
  org: string
  role: string
  certType: string
  validUntil: string
  status: CredentialStatus
  dispatch: CredDispatchStatus
}

export const mockCredentialStats = {
  total: 256,
  totalNote: '有效 238份',
  pending: 9,
  pendingNote: '新上传 5份',
  expiring: 6,
  expiringNote: '30天内',
  expired: 2,
  expiredNote: '已限制相关服务',
}

export const mockCredentialList: MockCredentialRow[] = [
  {
    id: 'CR-001',
    staffId: 'ST-001',
    name: '李敏',
    phone: '138****8821',
    org: '城东护理院',
    role: '护士',
    certType: '护士执业证',
    validUntil: '2029-05-20',
    status: 'pending',
    dispatch: 'checking',
  },
  {
    id: 'CR-002',
    staffId: 'ST-002',
    name: '张健',
    phone: '139****2168',
    org: '城东护理院',
    role: '健康管理师',
    certType: '健康管理师三级',
    validUntil: '2028-11-08',
    status: 'approved',
    dispatch: 'normal',
  },
  {
    id: 'CR-003',
    staffId: 'ST-003',
    name: '王医生',
    phone: '136****0912',
    org: '幸福护理院',
    role: '医生',
    certType: '医师执业证',
    validUntil: '2026-08-28',
    status: 'expiring',
    dispatch: 'normal',
  },
  {
    id: 'CR-004',
    staffId: 'ST-004',
    name: '刘敏',
    phone: '137****6610',
    org: '安康康复中心',
    role: '健康管理师',
    certType: '健康管理师三级',
    validUntil: '2027-03-16',
    status: 'approved',
    dispatch: 'normal',
  },
  {
    id: 'CR-005',
    staffId: 'ST-005',
    name: '赵强',
    phone: '135****2289',
    org: '城东护理院',
    role: '护理员',
    certType: '养老护理员证',
    validUntil: '2026-07-30',
    status: 'expired',
    dispatch: 'limited',
  },
]

export const mockCertTypes = ['护士执业证', '医师执业证', '健康管理师三级', '养老护理员证', '康复治疗师证']

/* ===== 专业人员审核队列（设计稿：2.服务授权/审核队列.png） ===== */

/** 审核状态 */
export type AuditStatus = 'pending' | 'supplement' | 'approved' | 'rejected' | 'expiring'

export const AUDIT_STATUS_TEXT: Record<AuditStatus, string> = {
  pending: '待审核',
  supplement: '待补充',
  approved: '审核通过',
  rejected: '审核不通过',
  expiring: '即将到期',
}

export interface MockAuditRow {
  id: string
  staffId: string
  name: string
  phone: string
  roleOrg: string
  credential: string
  auth: string
  submittedAt: string
  status: AuditStatus
}

export const mockAuditStats = {
  pending: 6,
  pendingNote: '今日新增 2',
  supplement: 3,
  supplementNote: '已退回',
  expiring: 7,
  expiringNote: '30天内',
  monthApproved: 28,
  monthApprovedNote: '通过率 93%',
}

export const mockAuditList: MockAuditRow[] = [
  {
    id: 'AU-001',
    staffId: 'ST-001',
    name: '李敏',
    phone: '138****8821',
    roleOrg: '护士 · 城东护理院',
    credential: '2类证照待审核',
    auth: '3项待审核',
    submittedAt: '8月12日 09:36',
    status: 'pending',
  },
  {
    id: 'AU-002',
    staffId: 'ST-003',
    name: '王医生',
    phone: '136****0912',
    roleOrg: '医师 · 幸福护理院',
    credential: '医师证待审核',
    auth: '5项待审核',
    submittedAt: '8月12日 08:42',
    status: 'pending',
  },
  {
    id: 'AU-003',
    staffId: 'ST-007',
    name: '周康',
    phone: '139****6327',
    roleOrg: '康复治疗师 · 城东护理院',
    credential: '已退回补照片',
    auth: '2项',
    submittedAt: '8月11日 16:20',
    status: 'supplement',
  },
  {
    id: 'AU-004',
    staffId: 'ST-008',
    name: '刘敏',
    phone: '135****1846',
    roleOrg: '护士 · 城东护理院',
    credential: '有效至 2026-09',
    auth: '4项有效',
    submittedAt: '8月11日 14:08',
    status: 'expiring',
  },
  {
    id: 'AU-005',
    staffId: 'ST-009',
    name: '陈检验',
    phone: '137****5091',
    roleOrg: '检验人员 · 康复机构',
    credential: '资格证有效',
    auth: '2项有效',
    submittedAt: '8月11日 10:12',
    status: 'approved',
  },
  {
    id: 'AU-006',
    staffId: 'ST-010',
    name: '孙护工',
    phone: '131****7730',
    roleOrg: '护理员 · 城东护理院',
    credential: '技术资格证',
    auth: '1项被退回',
    submittedAt: '8月10日 15:56',
    status: 'rejected',
  },
]

/* ===== 专业人员统一审核（设计稿：2.服务授权/资质与服务授权统一审核.png） ===== */

export const mockAuditDetail = {
  name: '李敏',
  roleOrg: '护士 · 138****8821 · 城东护理院',
  status: '待审核',
  submittedAt: '8月12日 09:36',
  dispatch: '不可派单',
  credential: {
    name: '护士执业证',
    uploaded: '已上传正反面 2 张',
    status: '待审核',
    fields: [
      { label: '证书编号', value: '11012026008***' },
      { label: '注册机构', value: '城东护理院' },
      { label: '有效期', value: '2024-05-20 至 2029-05-20' },
      { label: '资格证', value: '护师资格证 · 已上传1张' },
    ],
    checkNote: '姓名、机构、编号与照片一致，有效期正常',
  },
  auth: {
    pendingNote: '3项待审核',
    source: '项目来源：运营平台有效项目 ∩ 当前机构已开通项目',
    items: [
      { name: '输液港维护', check: '护士角色符合' },
      { name: '上门采血', check: '护士角色符合' },
      { name: '伤口护理', check: '护士角色符合' },
    ],
    checkNote: '已选项目均符合人员角色；不单独审核操作范围和有效期',
  },
  defaultOpinion: '证照信息与本人及所属机构一致，证照在有效期内；3项服务授权均符合护士角色要求。',
  passNote: '审核通过后：证照状态=有效，3项授权=有效，人员派单资格=可派单。',
}

/* ===== 配置服务授权（设计稿：2.服务授权/完整项目多选.png） ===== */

export interface MockServiceItem {
  id: string
  name: string
  /** 分类 · 所需角色 */
  meta: string
  category: string
  /** 角色不匹配时不可选 */
  roleMismatch?: boolean
}

export const mockAuthorize = {
  staff: { id: 'ST-001', name: '李敏', roleOrg: '护士 · 城东护理院', tag: '证照待审核' },
  scope: '运营平台有效项目 ∩ 当前机构已开通且审核通过项目',
  scopeNote: '仅多选服务项目，不要求管理员填写操作范围和授权有效期。',
  categories: ['全部', '上门护理', '上门检测', '居家康复', '中医服务'],
  total: 12,
  items: [
    { id: 'SV-01', name: '输液港维护', meta: '上门护理 · 需要护士执业资质', category: '上门护理' },
    { id: 'SV-02', name: '上门采血', meta: '上门检测 · 护士或检验人员', category: '上门检测' },
    { id: 'SV-03', name: '伤口护理', meta: '上门护理 · 护士', category: '上门护理' },
    { id: 'SV-04', name: '鼻饲管护理', meta: '上门护理 · 护士 / 护理员', category: '上门护理' },
    { id: 'SV-05', name: '导尿管护理', meta: '上门护理 · 护士', category: '上门护理' },
    { id: 'SV-06', name: '雾化吸入', meta: '上门护理 · 护士', category: '上门护理' },
    {
      id: 'SV-07',
      name: '康复训练',
      meta: '居家康复 · 康复治疗师',
      category: '居家康复',
      roleMismatch: true,
    },
    { id: 'SV-08', name: '针灸', meta: '中医服务 · 中医医师', category: '中医服务', roleMismatch: true },
  ] as MockServiceItem[],
  defaultSelected: ['SV-01', 'SV-02', 'SV-03'],
  roleCheck: '护士角色符合已选 3 个项目要求',
  credentialStatus: '证照状态：待人工审核',
  note: '证照与服务授权均审核通过后，才允许匹配对应项目派单。',
  footerNote: '保存后生成授权审核记录；服务项目由运营平台维护，本工作台不创建项目。',
}

/* ===== 上传执业资质（设计稿：2.服务授权/展开.png） ===== */

export const mockCredentialUpload = {
  staff: {
    id: 'ST-001',
    name: '李敏',
    roleOrg: '护士 · 138****8821 · 城东护理院',
    tag: '专业服务人员',
  },
  headNote: '一名人员可以上传多张证照',
  certTypes: ['护士执业证', '医师执业证', '健康管理师三级', '养老护理员证', '康复治疗师证'],
  uploadTip: '支持 JPG、PNG；单张不超过 10MB，建议上传清晰正反面。',
  uploadLimit: '可上传 1—4 张，正反面可分别上传',
  uploaded: [
    { name: '护士执业证·正面', meta: 'JPG · 1.8MB' },
    { name: '护士执业证·背面', meta: 'JPG · 1.2MB' },
  ],
  ocrDoneNote: '已完成证照识别，请在右侧核对识别结果',
  ocrFields: [
    { label: '证照姓名', required: true, value: '李敏' },
    { label: '证书编号', required: true, value: '11012026008***' },
    { label: '注册 / 执业机构', required: true, value: '城东护理院' },
    { label: '专业技术职称', required: true, value: '护师' },
    { label: '证照有效期开始', required: true, value: '2024-05-20' },
    { label: '证照有效期结束', required: true, value: '2029-05-20' },
    { label: '临床工作起始日期', required: false, value: '2020-07-01' },
    { label: '核验方式', required: false, value: '人工核验' },
  ],
  ocrTip: '注册机构与当前机构一致；证书有效期正常。提交后进入待审核，审核通过前不可用于派单。',
  confirmCheck: '我已核对照片与识别信息一致',
  footerNote: '保存后可继续上传其他证照，或返回执业资质列表发起审核。',
}
