/**
 * 线索模块 mock 数据（设计稿示例）
 * 接入后端后删除，页面改调 leadApi（GET /v1/staff/leads 等）
 */
import type { LeadDetail, LeadItem } from '@/api/modules/lead'

export const mockLeads: LeadItem[] = [
  {
    id: 1,
    lead_no: 'LEAD20260812001',
    institution_id: 1,
    source_type: 1,
    contact_name: '张女士',
    contact_phone: '139****2168',
    contact_identity: 2,
    demand_type: 1,
    demand_detail: '希望了解费用并预约参观',
    status: 2,
    owner_staff_name: '周敏',
    created_at: 1786558500, // 2026-08-12 10:35
  },
  {
    id: 2,
    lead_no: 'LEAD20260812002',
    institution_id: 1,
    source_type: 2,
    contact_name: '陈女士',
    contact_phone: '138****6721',
    contact_identity: 1,
    demand_type: 2,
    demand_detail: '活动现场咨询慢病管理服务',
    status: 2,
    owner_staff_name: '周敏',
    created_at: 1786554000, // 2026-08-12 09:20
  },
  {
    id: 3,
    lead_no: 'LEAD20260811003',
    institution_id: 1,
    source_type: 1,
    contact_name: '王先生',
    contact_phone: '136****5021',
    contact_identity: 2,
    demand_type: 3,
    demand_detail: '母亲术后希望接受康复服务',
    status: 3,
    owner_staff_name: '周敏',
    created_at: 1786492800, // 2026-08-11 16:40
  },
  {
    id: 4,
    lead_no: 'LEAD20260811004',
    institution_id: 1,
    source_type: 3,
    contact_name: '李先生',
    contact_phone: '158****1840',
    contact_identity: 1,
    demand_type: 4,
    demand_detail: '了解上门护理项目和费用',
    status: 1,
    created_at: 1786483800, // 2026-08-11 14:10
  },
]

/** 实名认证 / 转档成功页使用的线索详情 mock（对应设计稿陈女士线索） */
export const mockVerifyLead: LeadDetail = {
  id: 2,
  lead_no: 'LEAD20260812002',
  institution_id: 1,
  source_type: 2,
  contact_name: '陈女士',
  contact_phone: '138****6721',
  contact_identity: 1,
  demand_type: 2,
  demand_detail: '活动现场咨询高血压与糖尿病慢病管理服务',
  status: 2,
  owner_staff_name: '周敏',
  created_at: 1786554000,
  followup_records: [],
  transfer_records: [],
}

/** 转档成功页的档案信息 mock */
export const mockConvertResult = {
  profileNo: 'HF202608120038',
  memberName: '陈女士',
  memberAge: 67,
  source: '用户线索转档',
  orgName: '城东养老中心',
  status: '档案待完善 · 未纳管',
}
