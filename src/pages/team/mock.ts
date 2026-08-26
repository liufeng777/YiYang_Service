/**
 * 团队管理模块本地 mock 数据
 * 设计稿：13.团队管理（团队列表 / 新建编辑团队 / 选择人员抽屉 / 成员与在管患者 /
 *        成员在管患者抽屉 / 待分配患者 / 批量分配确认）
 * TODO: 团队管理接口 API v0.1（《协同工作台-API设计》）未定义，待后端补充
 */

/* ===== 团队列表 ===== */

export interface MockTeamRow {
  id: string
  name: string
  code: string
  org: string
  doctor: string
  nurse: string
  manager: string
  patientCount: number
  patientTone: 'blue' | 'green' | 'orange' | 'teal' | 'red'
  status: 'enabled' | 'disabled'
}

export const mockTeamStats = {
  total: 8,
  totalNote: '全部启用',
  members: 48,
  membersNote: '医12 · 护18 · 健管18',
  patients: 624,
  patientsNote: '本机构',
  unassigned: 23,
  unassignedNote: '待分配团队',
}

export const mockTeamList: MockTeamRow[] = [
  {
    id: 'TEAM-001',
    name: '城东慢病管理一组',
    code: 'TEAM-001',
    org: '城东护理院',
    doctor: '王医生',
    nurse: '李护士等2人',
    manager: '张健等3人',
    patientCount: 68,
    patientTone: 'blue',
    status: 'enabled',
  },
  {
    id: 'TEAM-002',
    name: '城东慢病管理二组',
    code: 'TEAM-002',
    org: '城东护理院',
    doctor: '张医生',
    nurse: '周护士等2人',
    manager: '刘健等2人',
    patientCount: 51,
    patientTone: 'green',
    status: 'enabled',
  },
  {
    id: 'TEAM-003',
    name: '城东高血压管理组',
    code: 'TEAM-003',
    org: '城东护理院',
    doctor: '李医生',
    nurse: '王护士',
    manager: '赵健等2人',
    patientCount: 56,
    patientTone: 'orange',
    status: 'enabled',
  },
  {
    id: 'TEAM-004',
    name: '安康康复健康管理组',
    code: 'TEAM-004',
    org: '安康康复中心',
    doctor: '周医生',
    nurse: '陈护士等2人',
    manager: '孙健等2人',
    patientCount: 42,
    patientTone: 'teal',
    status: 'enabled',
  },
  {
    id: 'TEAM-005',
    name: '城东糖尿病管理组',
    code: 'TEAM-005',
    org: '城东护理院',
    doctor: '王医生',
    nurse: '李护士',
    manager: '张健等2人',
    patientCount: 63,
    patientTone: 'red',
    status: 'enabled',
  },
]

/* ===== 新建/编辑团队 + 选择人员抽屉 ===== */

export type TeamRole = 'doctor' | 'nurse' | 'manager'

export const TEAM_ROLE_TEXT: Record<TeamRole, string> = {
  doctor: '医生',
  nurse: '护士',
  manager: '健康管理师',
}

export interface MockMemberCandidate {
  id: string
  name: string
  role: TeamRole
  phone: string
  /** in-已在本团队 other-在其他团队 none-未分配团队 */
  teamState: 'in' | 'other' | 'none'
}

export const mockTeamCreate = {
  banner:
    '团队用于健康管理责任人选择和任务协作；患者建档时再从团队成员中指定三类责任人，不用于服务派单或服务授权。',
  currentOrg: '城东护理院（当前机构）',
  roles: [
    {
      key: 'doctor' as TeamRole,
      desc: '可被指定为责任医生：制定管理目标，审核健康管理方案及服务订单',
      selected: ['王医生'],
      tag: '136****0912',
      tagTone: 'blue',
    },
    {
      key: 'nurse' as TeamRole,
      desc: '可被指定为责任护士：参与健康指标复测和护理协作',
      selected: ['李敏', '周护士'],
      tag: '2人已选择',
      tagTone: 'green',
    },
    {
      key: 'manager' as TeamRole,
      desc: '可被指定为责任健康管理师：完善档案、执行随访和落实健康方案',
      selected: ['张健', '赵健', '刘健'],
      tag: '3人已选择',
      tagTone: 'orange',
    },
  ],
  footerNote:
    '保存团队后，建档时先选择团队，再分别指定责任医生、责任健康管理师和责任护士；同一患者同时关联三名责任人。',
  candidates: [
    { id: 'M-01', name: '李敏', role: 'nurse', phone: '138****8821', teamState: 'in' },
    { id: 'M-02', name: '周护士', role: 'nurse', phone: '135****7730', teamState: 'in' },
    { id: 'M-03', name: '王芳', role: 'nurse', phone: '137****6029', teamState: 'other' },
    { id: 'M-04', name: '刘晓敏', role: 'nurse', phone: '136****3906', teamState: 'none' },
    { id: 'M-05', name: '陈蕾', role: 'nurse', phone: '139****1842', teamState: 'none' },
    { id: 'M-06', name: '王医生', role: 'doctor', phone: '136****0912', teamState: 'in' },
    { id: 'M-07', name: '李医生', role: 'doctor', phone: '137****5521', teamState: 'none' },
    { id: 'M-08', name: '张健', role: 'manager', phone: '139****2168', teamState: 'in' },
    { id: 'M-09', name: '赵健', role: 'manager', phone: '137****6521', teamState: 'in' },
    { id: 'M-10', name: '刘健', role: 'manager', phone: '138****9034', teamState: 'in' },
  ] as MockMemberCandidate[],
}

/* ===== 成员与在管患者（团队详情） ===== */

export interface MockTeamMemberRow {
  id: string
  name: string
  staffNo: string
  role: TeamRole
  phone: string
  patientCount: number
  todayTodo: string
  patients: { name: string; tone: 'blue' | 'green' | 'orange' | 'red' }[]
  status: '正常'
}

export const mockTeamDetail = {
  id: 'TEAM-001',
  name: '城东慢病管理一组',
  stats: [
    { label: '团队成员', value: 6, note: '医1 · 护2 · 健管3', noteTone: 'green' },
    { label: '医生', value: 1, note: '责任患者 18人', noteTone: 'blue' },
    { label: '护士', value: 2, note: '责任患者 26人', noteTone: 'orange' },
    { label: '健康管理师', value: 3, note: '责任患者 68人', noteTone: 'red' },
  ],
  members: [
    {
      id: 'M-06',
      name: '王医生',
      staffNo: 'DOC-018',
      role: 'doctor',
      phone: '136****0912',
      patientCount: 18,
      todayTodo: '目标/方案审核 3',
      patients: [
        { name: '张红', tone: 'blue' },
        { name: '李建国', tone: 'blue' },
      ],
      status: '正常',
    },
    {
      id: 'M-08',
      name: '张健',
      staffNo: 'HM-026',
      role: 'manager',
      phone: '139****2168',
      patientCount: 24,
      todayTodo: '随访任务 5',
      patients: [
        { name: '王桂兰', tone: 'green' },
        { name: '赵德明', tone: 'green' },
      ],
      status: '正常',
    },
    {
      id: 'M-01',
      name: '李敏',
      staffNo: 'NUR-032',
      role: 'nurse',
      phone: '138****8899',
      patientCount: 12,
      todayTodo: '指标复测 4',
      patients: [
        { name: '刘秀英', tone: 'orange' },
        { name: '周老太', tone: 'orange' },
      ],
      status: '正常',
    },
    {
      id: 'M-09',
      name: '赵健',
      staffNo: 'HM-031',
      role: 'manager',
      phone: '137****6521',
      patientCount: 22,
      todayTodo: '随访任务 3',
      patients: [
        { name: '陈素琴', tone: 'green' },
        { name: '孙明', tone: 'green' },
      ],
      status: '正常',
    },
    {
      id: 'M-02',
      name: '周护士',
      staffNo: 'NUR-041',
      role: 'nurse',
      phone: '135****7730',
      patientCount: 14,
      todayTodo: '指标复测 2',
      patients: [
        { name: '高玉珍', tone: 'red' },
        { name: '徐建国', tone: 'red' },
      ],
      status: '正常',
    },
  ] as MockTeamMemberRow[],
  footerNote: '同一患者可分别关联三类责任人，并同时出现在对应成员的责任患者清单中。',
}

/** 成员在管患者抽屉 */
export const mockMemberPatients = {
  title: '王医生的在管患者',
  sub: '医生 · 在管18人 · 今日方案审核3项',
  banner: '患者归属决定该成员的健康管理待办，不影响服务订单派单。',
  total: 18,
  list: [
    { name: '张红', sexAge: '女 · 69岁', diseases: '高血压 · 糖尿病', status: '方案待审核', statusTone: 'green', lastAt: '8月12日' },
    { name: '李建国', sexAge: '男 · 72岁', diseases: '高血压', status: '本月随访完成', statusTone: 'teal', lastAt: '8月10日' },
    { name: '王桂兰', sexAge: '女 · 76岁', diseases: '糖尿病', status: '指标异常1项', statusTone: 'orange', lastAt: '8月9日' },
    { name: '赵德明', sexAge: '男 · 68岁', diseases: '慢阻肺', status: '方案执行中', statusTone: 'teal', lastAt: '8月8日' },
    { name: '刘秀英', sexAge: '女 · 71岁', diseases: '高血压', status: '待复测', statusTone: 'teal', lastAt: '8月7日' },
    { name: '陈素琴', sexAge: '女 · 74岁', diseases: '糖尿病', status: '随访待办', statusTone: 'teal', lastAt: '8月6日' },
  ],
}

/* ===== 待分配患者 ===== */

export interface MockUnassignedRow {
  id: string
  name: string
  memberId: string
  source: string
  archiveStatus: string
  risk: string
  riskTone: 'orange' | 'red' | 'green'
  disease: string
  archivedAt: string
  suggestTeam: string
}

export const mockUnassignedStats = { total: 18, today: 5, highRisk: 3 }

export const mockUnassignedList: MockUnassignedRow[] = [
  {
    id: 'P-001',
    name: '王淑兰',
    memberId: 'JK202608021',
    source: 'C端医护服务',
    archiveStatus: '待完善',
    risk: '橙色',
    riskTone: 'orange',
    disease: '糖尿病',
    archivedAt: '今日 09:20',
    suggestTeam: '城东慢病一组',
  },
  {
    id: 'P-002',
    name: '李建国',
    memberId: 'JK202608019',
    source: '活动线索转化',
    archiveStatus: '待完善',
    risk: '红色',
    riskTone: 'red',
    disease: '高血压',
    archivedAt: '昨日 16:42',
    suggestTeam: '心脑血管团队',
  },
  {
    id: 'P-003',
    name: '陈芳',
    memberId: 'JK202608011',
    source: '机构批量导入',
    archiveStatus: '基础完整',
    risk: '绿色',
    riskTone: 'green',
    disease: '暂无专病',
    archivedAt: '08-11 14:10',
    suggestTeam: '综合管理二组',
  },
  {
    id: 'P-004',
    name: '赵明',
    memberId: 'JK202608006',
    source: '电话咨询转化',
    archiveStatus: '待完善',
    risk: '橙色',
    riskTone: 'orange',
    disease: '慢阻肺',
    archivedAt: '08-10 10:28',
    suggestTeam: '呼吸管理团队',
  },
]

export const mockUnassignedNote =
  '分配后：团队医生、护士和健管师建立共同管理关系；患者进入对应健管师的“在管患者”列表。'

/* ===== 批量分配确认 ===== */

export const mockAssign = {
  patients: [
    { id: 'P-001', name: '王淑兰', risk: '橙色｜高血压、糖尿病' },
    { id: 'P-002', name: '李建国', risk: '红色｜高血压' },
    { id: 'P-003', name: '陈芳', risk: '绿色｜暂无专病' },
  ],
  teams: ['城东慢病管理一组', '城东慢病管理二组', '城东高血压管理组', '城东糖尿病管理组'],
  members: [
    { role: '责任医生', name: '王医生', load: '在管18' },
    { role: '护士', name: '李护士', load: '在管26' },
  ],
  managers: ['张敏（在管68｜待办12）', '张健（在管24｜待办5）', '赵健（在管22｜待办3）'],
  suggest: '优先选择专病匹配且负荷未超限的团队；红色风险对象分配后立即进入健管师待办。',
  footerNote: '确认后写入团队、责任医生和健康管理师；保留分配人、时间及变更记录，支持后续重新分配。',
}
