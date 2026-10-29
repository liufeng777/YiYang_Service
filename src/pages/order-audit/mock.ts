import type { OrderDetail } from '@/api/modules/order'

const recordTime = (value: string) => Math.floor(new Date(value).getTime() / 1000)

/** 订单审核详情演示数据，通过 /order-audit/mock 访问。 */
export const mockOrderDetail: OrderDetail = {
  id: 'mock',
  order_no: 'YY202610270018',
  order_status: 2,
  amount: '368.00',
  service_id: 1008,
  service_name: '居家上门护理服务',
  services: ['生命体征测量', '伤口护理', '用药指导', '居家护理建议'],
  consumables: ['一次性护理包', '无菌敷料', '医用消毒用品'],
  institution_name: '幸福颐养·西湖服务中心',
  member_id: 10086,
  member_name: '陈秀兰',
  member_gender: 2,
  member_age: 76,
  member_chronic_disease: ['高血压', '2型糖尿病'],
  member_health_record: [
    {
      data_source: 2,
      is_abnormal: 1,
      metric_id: 1,
      metric_name: '血压',
      metric_value: '158/96',
      record_time: recordTime('2026-10-27T08:30:00+08:00'),
      unit: 'mmHg',
    },
    {
      data_source: 2,
      is_abnormal: 0,
      metric_id: 2,
      metric_name: '空腹血糖',
      metric_value: '6.4',
      record_time: recordTime('2026-10-27T07:50:00+08:00'),
      unit: 'mmol/L',
    },
    {
      data_source: 1,
      is_abnormal: 0,
      metric_id: 3,
      metric_name: '血氧饱和度',
      metric_value: '97',
      record_time: recordTime('2026-10-26T18:20:00+08:00'),
      unit: '%',
    },
    {
      data_source: 1,
      is_abnormal: 0,
      metric_id: 4,
      metric_name: '心率',
      metric_value: '78',
      record_time: recordTime('2026-10-26T18:20:00+08:00'),
      unit: '次/分',
    },
  ],
  contact_name: '李明',
  contact_phone: '138 0013 8000',
  address_region: '浙江省杭州市西湖区',
  address_detail: '文一西路 588 号 3 幢 2 单元 501 室',
  remark: '服务对象行动较缓慢，请护理人员到达前电话联系家属；家属希望安排在上午上门。',
}
