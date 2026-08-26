/**
 * 机构管理模块本地 mock 数据（设计稿：机构列表.png / 基本与服务信息.png / 同步运营平台.png）
 * TODO: 机构主数据维护接口（平台管理员：新增机构/编辑/同步运营平台/同步日志）
 *       API v0.1 未定义（机构管理为运营后台域预留），待后端补充
 */

/** 同步状态 */
export type OrgSyncStatus = 'synced' | 'pending' | 'failed'

export const ORG_SYNC_TEXT: Record<OrgSyncStatus, string> = {
  synced: '已同步',
  pending: '待同步',
  failed: '同步失败',
}

/** 机构列表行 */
export interface MockOrgRow {
  id: string
  name: string
  /** 统一信用代码或机构编码 */
  codeLabel: string
  code: string
  type: '护理院' | '康复机构'
  /** 服务能力 */
  services: string[]
  staffCount: number
  status: '运营中' | '已停用'
  syncStatus: OrgSyncStatus
  updatedAt: string
}

export const mockOrgStats = {
  total: 8,
  totalNote: '7家运营中',
  staff: 126,
  staffNote: '含待审核 9人',
  pendingSync: 2,
  pendingSyncNote: '信息有更新',
  licenseWarning: 3,
  licenseWarningNote: '30天内到期',
}

export const mockOrgList: MockOrgRow[] = [
  {
    id: 'ORG-001',
    name: '城东护理院',
    codeLabel: '统一信用代码',
    code: '91110105MA01****',
    type: '护理院',
    services: ['上门护理', '上门检测', '生活照护'],
    staffCount: 38,
    status: '运营中',
    syncStatus: 'synced',
    updatedAt: '08-11 09:20',
  },
  {
    id: 'ORG-003',
    name: '幸福护理院',
    codeLabel: '机构编码',
    code: 'ORG-003',
    type: '护理院',
    services: ['上门护理', '居家康复', '安宁疗护'],
    staffCount: 29,
    status: '运营中',
    syncStatus: 'pending',
    updatedAt: '08-11 08:45',
  },
  {
    id: 'ORG-004',
    name: '安康康复中心',
    codeLabel: '机构编码',
    code: 'ORG-004',
    type: '康复机构',
    services: ['上门检测', '生活照护'],
    staffCount: 18,
    status: '运营中',
    syncStatus: 'failed',
    updatedAt: '08-10 16:32',
  },
  {
    id: 'ORG-005',
    name: '阳光康复中心',
    codeLabel: '机构编码',
    code: 'ORG-005',
    type: '康复机构',
    services: ['居家康复', '中医服务'],
    staffCount: 24,
    status: '运营中',
    syncStatus: 'synced',
    updatedAt: '08-09 13:16',
  },
  {
    id: 'ORG-006',
    name: '康宁护理院',
    codeLabel: '机构编码',
    code: 'ORG-006',
    type: '护理院',
    services: ['上门护理', '安宁疗护'],
    staffCount: 17,
    status: '运营中',
    syncStatus: 'synced',
    updatedAt: '08-08 10:05',
  },
]

/* ===== 新增机构（设计稿：基本与服务信息.png） ===== */

export const mockOrgCreate = {
  serviceOptions: ['上门护理', '上门检测', '生活照护', '居家康复', '中医服务', '安宁疗护'],
  serviceNote: '服务项目由运营平台统一维护并同步；本机构仅选择申请开通的项目',
  sourceNote: '项目目录来源：运营平台同步｜机构仅申请开通，不在工作台新建服务项目',
  license: {
    name: '医疗机构执业许可证',
    no: 'PDY00001-11010519A5201',
    validUntil: '2029-12-31',
  },
  syncScopes: ['机构基本信息', '服务能力', '联系人信息', '机构状态'],
  firstAdmin: '赵海 · 138****6666',
  syncTip: '保存机构后同步创建机构管理员账号，并进入待同步状态。',
  geo: {
    address: '北京市朝阳区幸福路88号',
    lng: '116.486520',
    lat: '39.921630',
    note: '仅维护定位；服务半径由运营平台配置',
  },
}

/* ===== 机构详情（设计稿：同步运营平台.png，城东护理院） ===== */

export const mockOrgDetail = {
  id: 'ORG-001',
  name: '城东护理院',
  code: 'ORG-001',
  type: '护理院',
  creditCode: '91110105MA01XXXXXX',
  address: '北京市朝阳区幸福路88号',
  principal: '赵海',
  phone: '010-88886666',
  status: '运营中',
  syncState: '已同步',
  syncTime: '今天 09:20',
  info: [
    { label: '机构类型', value: '护理院' },
    { label: '成立日期', value: '2018-05-20' },
    { label: '运营联系人', value: '刘主任 138****2168' },
    { label: '服务对象', value: '机构长者、社区居家老人' },
    { label: '机构管理员', value: '赵海 · 138****6666' },
    { label: '人员与团队维护', value: '由本机构管理员负责' },
  ],
  services: ['上门护理', '上门检测', '生活照护', '居家康复', '中医服务', '安宁疗护'],
  license: {
    name: '医疗机构执业许可证',
    no: 'PDY00001-11010519A5201',
    validUntil: '2029-12-31',
    status: '有效',
  },
  geo: {
    address: '北京市朝阳区幸福路88号',
    lng: '116.486520',
    lat: '39.921630',
  },
  cside: [
    { label: 'C端名称', value: '城东护理院' },
    { label: '联系电话', value: '010-88886666' },
    { label: '营业时间', value: '08:00—20:00' },
  ],
  csideNote: '定位已同步 · 服务半径由运营平台配置',
  syncRecords: [
    { time: '今天 09:20', title: '同步成功', desc: '机构联系人信息更新', ok: true },
    { time: '08月10日 16:32', title: '同步成功', desc: '服务能力新增“长期照护”', ok: true },
    { time: '08月08日 10:05', title: '同步成功', desc: '运营状态更新', ok: true },
    { time: '08月01日 09:00', title: '同步失败', desc: '运营平台接口超时', ok: false },
  ],
  syncFailNote: '同步失败记录进入平台管理员待办，可重试并查看接口返回信息。',
}
