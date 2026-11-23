/** 会员慢病专病卡片、关联指标与按批次展示的专病评估。 */
import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  App, Button, Card, DatePicker, Descriptions, Drawer, Empty, Form,
  Input, Modal, Select, Spin, Tag, Timeline,
} from 'antd'
import {
  CalendarOutlined, EditOutlined, MedicineBoxOutlined, PlusOutlined,
} from '@ant-design/icons'
import dayjs, { type Dayjs } from 'dayjs'
import { chronicDiseaseApi, healthArchiveApi } from '@/api'
import FormDrawer from '@/components/FormDrawer'
import type { ChronicDiseaseDict } from '@/api/modules/chronic-disease'
import type { ChronicArchive, ChronicAssessment } from '@/api/modules/health-archive'
import type { ArchiveData } from './Plan/shared'
import { asObject, display, formatTimestamp, toDayjs } from './Plan/shared'
import {
  ChronicMetricFields, getChronicMetricDefinitions, getMetricAbnormalities,
  metricFormValues, serializeMetricValues,
} from './chronic-metrics'
import ChronicMetricDrawer from './chronic-metric-drawer'

const CHRONIC_STATUS: Record<number, string> = {
  1: '管理中', 2: '稳定', 3: '未达标', 4: '高风险', 9: '已终止',
}
const STATUS_COLORS: Record<number, string> = { 1: 'processing', 2: 'green', 3: 'orange', 4: 'red', 9: 'default' }
const DISEASE_STATUS: Record<number, string> = { 1: '正在患病', 2: '已治愈', 3: '遗留后遗症' }
const SOURCE_OPTIONS = [
  { value: 1, label: '健管师/医生录入' },
  { value: 2, label: '会员 App 自填' },
  { value: 3, label: '线下导入' },
]
const SOURCE_LABELS = Object.fromEntries(SOURCE_OPTIONS.map((item) => [item.value, item.label]))

function summaryColor(label: string) {
  // “极高危”包含“高危”，必须先判断更高风险等级。
  if (label.includes('极高危')) return 'red'
  if (label.includes('高危')) return 'volcano'
  if (label.includes('中危')) return 'orange'
  if (label.includes('低危')) return 'green'
  return 'blue'
}

function AssessmentsDrawer({ memberId, archive, onClose, onChanged }: {
  memberId: string
  archive?: ChronicArchive
  onClose: () => void
  onChanged: () => void
}) {
  const { message } = App.useApp()
  const [form] = Form.useForm()
  const [list, setList] = useState<ChronicAssessment[]>([])
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [abnormalities, setAbnormalities] = useState<Record<string, number>>({})
  const [editor, setEditor] = useState<{ mode: 'create' | 'edit'; data: ArchiveData }>()
  const [saving, setSaving] = useState(false)
  const [dictionary, setDictionary] = useState<unknown>()
  const [dictionaryLoading, setDictionaryLoading] = useState(false)
  const definitions = useMemo(() => getChronicMetricDefinitions(dictionary), [dictionary])

  const load = useCallback(async () => {
    if (!archive) return
    setLoading(true)
    try {
      const res = await healthArchiveApi.getChronicAssessments(archive.disease_history_id, memberId, { page, page_size: 1000 })
      setList(res.list ?? [])
    } catch { /* 拦截器统一提示 */ } finally { setLoading(false) }
  }, [archive, memberId, page])

  useEffect(() => { load() }, [load])
  useEffect(() => {
    let active = true
    setPage(1)
    setEditor(undefined)
    setDictionary(undefined)
    setAbnormalities({})
    form.resetFields()
    if (!archive) {
      setList([])
      return () => { active = false }
    }
    setDictionaryLoading(true)
    healthArchiveApi.getChronicMetricDict(archive.disease_code)
      .then((result) => { if (active) setDictionary(result) })
      .catch(() => undefined)
      .finally(() => { if (active) setDictionaryLoading(false) })
    return () => { active = false }
  }, [archive?.disease_history_id, archive?.disease_code])

  const openCreate = () => {
    const batchNo = list[0]?.batch_no
    if (!batchNo) {
      message.warning('暂无可用于新增评估的批次记录')
      return
    }
    form.resetFields()
    setAbnormalities({})
    form.setFieldsValue({
      assess_date: dayjs(),
      source: 1,
      ...metricFormValues({}, definitions),
    })
    setEditor({ mode: 'create', data: { batch_no: batchNo } })
  }

  const openEditor = async (row: ChronicAssessment) => {
    if (!archive || !row.batch_no) return
    try {
      const res = await healthArchiveApi.getChronicAssessmentDetail(archive.disease_history_id, String(row.batch_no), memberId)
      const assessment = asObject(res.assessment)
      const metricSource = assessment.metrics ?? res.metrics
      const source = { ...row, ...res, ...assessment }
      form.resetFields()
      setAbnormalities(getMetricAbnormalities(metricSource))
      form.setFieldsValue({
        assess_date: toDayjs(source.assess_date),
        source: source.source,
        ...metricFormValues(metricSource, definitions),
      })
      setEditor({ mode: 'edit', data: { ...source, batch_no: row.batch_no } })
    } catch { /* 拦截器统一提示 */ }
  }

  const save = async () => {
    const batchNo = String(editor?.data.batch_no ?? '')
    if (!archive || !editor || !batchNo) return
    const values = await form.validateFields()
    setSaving(true)
    const payload = {
      assess_date: (values.assess_date as Dayjs | undefined)?.unix(),
      source: values.source,
      metrics: serializeMetricValues(values, definitions),
      disease_history_id: Number(archive.disease_history_id),
      batch_no: batchNo,
    }
    try {
      // 新增评估同样复用列表第一条批次，通过更新接口写入。
      await healthArchiveApi.updateChronicAssessment(archive.disease_history_id, batchNo, memberId, payload)
      message.success(editor.mode === 'create' ? '专病评估已新增' : '专病评估已更新')
      setEditor(undefined)
      setAbnormalities({})
      form.resetFields()
      if (editor.mode === 'create' && page !== 1) setPage(1)
      else await load()
      onChanged()
    } catch { /* 保留输入 */ } finally { setSaving(false) }
  }

  return (
    <Drawer
      title={archive ? `专病评估 · ${archive.disease_name || archive.disease_code}` : ''}
      width={1000} open={archive != null} onClose={onClose} className="chronic-assessment-drawer"
      extra={(
        <Button type="primary" icon={<PlusOutlined />} loading={dictionaryLoading} onClick={openCreate}>
          新增评估
        </Button>
      )}
    >
      <Spin spinning={loading}>
        <div className="chronic-assessment-timeline">
          {list.length ? (
            <Timeline
              items={list.map((row) => ({
                color: 'blue',
                dot: <CalendarOutlined />,
                children: (
                  <article className="chronic-assessment-item">
                    <div className="chronic-assessment-item__heading">
                      <strong>{formatTimestamp(row.assess_date)}</strong>
                      {row.summary_label && <Tag color={summaryColor(row.summary_label)}>{row.summary_label}</Tag>}
                    </div>
                    <Descriptions size="small" column={{ xs: 1, sm: 3 }}>
                      <Descriptions.Item label="评估人">{display(row.assessor_name)}</Descriptions.Item>
                      <Descriptions.Item label="指标数">{row.metric_count ?? '-'}</Descriptions.Item>
                      <Descriptions.Item label="来源">{SOURCE_LABELS[row.source ?? 0] ?? display(row.source)}</Descriptions.Item>
                    </Descriptions>
                    <div className="chronic-assessment-item__footer">
                      <span>批次：{display(row.batch_no)}</span>
                      <Button size="small" icon={<EditOutlined />} onClick={() => openEditor(row)}>修改</Button>
                    </div>
                  </article>
                ),
              }))}
            />
          ) : !loading && <Empty description="暂无评估记录" />}
        </div>
      </Spin>
      <FormDrawer
        title={editor?.mode === 'create' ? '新增专病评估' : '修改专病评估'} width={1000}
        open={editor != null} onClose={() => setEditor(undefined)} onSubmit={save} confirmLoading={saving}
      >
        <Form form={form} layout="vertical">
          <div className="chronic-form-row">
            <Form.Item name="assess_date" label="评估日期"><DatePicker className="archive-full-width" /></Form.Item>
            <Form.Item name="source" label="来源"><Select allowClear options={SOURCE_OPTIONS} placeholder="请选择来源" /></Form.Item>
          </div>
          <ChronicMetricFields definitions={definitions} abnormalities={abnormalities} />
        </Form>
      </FormDrawer>
    </Drawer>
  )
}

export default function ChronicPanel({ memberId }: { memberId: string }) {
  const { message } = App.useApp()
  const [createForm] = Form.useForm()
  const [statusForm] = Form.useForm()
  const [terminateForm] = Form.useForm()
  const [list, setList] = useState<ChronicArchive[]>([])
  const [diseases, setDiseases] = useState<ChronicDiseaseDict[]>([])
  const [loading, setLoading] = useState(false)
  const [filters, setFilters] = useState<{ chronic_status?: number; include_ended: boolean }>({ include_ended: false })
  const [applied, setApplied] = useState(filters)
  const [createOpen, setCreateOpen] = useState(false)
  const [creating, setCreating] = useState(false)
  const [metricArchive, setMetricArchive] = useState<ChronicArchive>()
  const [assessmentArchive, setAssessmentArchive] = useState<ChronicArchive>()
  const [statusArchive, setStatusArchive] = useState<ChronicArchive>()
  const [terminateArchive, setTerminateArchive] = useState<ChronicArchive>()
  const [acting, setActing] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await healthArchiveApi.getChronicArchives(memberId, applied)
      setList(res.list ?? [])
    } catch { /* 拦截器统一提示 */ } finally { setLoading(false) }
  }, [memberId, applied])

  useEffect(() => { load() }, [load])
  useEffect(() => {
    chronicDiseaseApi.getChronicDiseases({ page: 1, page_size: 200 })
      .then((res) => setDiseases(res.list ?? [])).catch(() => undefined)
  }, [])
  // 打开终止弹窗时默认填入当天日期（弹窗内 Form 挂载完成后再赋值）
  useEffect(() => {
    if (terminateArchive) terminateForm.setFieldsValue({ end_date: dayjs() })
  }, [terminateArchive, terminateForm])

  const selectDisease = (code: string) => {
    const disease = diseases.find((item) => item.icd10_code === code)
    createForm.setFieldsValue({ disease_name: disease?.disease_name_cn })
  }

  const create = async () => {
    const values = await createForm.validateFields()
    setCreating(true)
    try {
      await healthArchiveApi.createChronicArchive({
        member_id: Number(memberId),
        disease_code: values.disease_code,
        disease_name: values.disease_name,
        diagnose_date: (values.diagnose_date as Dayjs | undefined)?.unix(),
        assess_date: (values.assess_date as Dayjs | undefined)?.unix(),
        source: values.source,
        remark: values.remark,
      })
      message.success('慢病专病条目已创建')
      setCreateOpen(false)
      createForm.resetFields()
      await load()
    } catch { /* 保留输入 */ } finally { setCreating(false) }
  }

  const updateStatus = async () => {
    if (!statusArchive) return
    const values = await statusForm.validateFields()
    setActing(true)
    try {
      await healthArchiveApi.updateChronicStatus(statusArchive.disease_history_id, memberId, values)
      message.success('控制状态已更新')
      setStatusArchive(undefined)
      await load()
    } catch { /* 保留输入 */ } finally { setActing(false) }
  }

  const terminate = async () => {
    if (!terminateArchive) return
    const values = await terminateForm.validateFields()
    setActing(true)
    try {
      await healthArchiveApi.terminateChronicArchive(terminateArchive.disease_history_id, memberId, {
        end_date: (values.end_date as Dayjs | undefined)?.unix(),
        reason: values.reason,
      })
      message.success('专病管理已终止')
      setTerminateArchive(undefined)
      await load()
    } catch { /* 保留输入 */ } finally { setActing(false) }
  }

  return (
    <>
      <Card
        title="慢病专病档案" className="archive-panel-card chronic-panel-card"
        extra={<Button type="primary" onClick={() => setCreateOpen(true)}>新建专病</Button>}
      >
        <div className="archive-inline-filter">
          <Select
            allowClear placeholder="全部控制状态" value={filters.chronic_status}
            options={Object.entries(CHRONIC_STATUS).map(([value, label]) => ({ value: Number(value), label }))}
            onChange={(value) => setFilters((prev) => ({ ...prev, chronic_status: value }))}
          />
          {/* <Checkbox
            checked={filters.include_ended}
            onChange={(event) => setFilters((prev) => ({ ...prev, include_ended: event.target.checked }))}
          >包含已终止</Checkbox> */}
          <Button onClick={() => { const empty = { include_ended: false }; setFilters(empty); setApplied(empty) }}>重置</Button>
          <Button type="primary" onClick={() => setApplied({ ...filters })}>查询</Button>
        </div>
        <Spin spinning={loading}>
          <div className="chronic-card-list">
            {list.length ? list.map((row) => (
              <Card key={row.disease_history_id} size="small" className="chronic-card">
                <div className="chronic-card__heading">
                  <div className="chronic-card__title">
                    <MedicineBoxOutlined />
                    <div>
                      <strong>{display(row.disease_name)}</strong>
                      <span>{row.disease_code}</span>
                    </div>
                  </div>
                  <div className="chronic-card__status">
                    {row.last_risk_level_label && <Tag color="orange">{row.last_risk_level_label}</Tag>}
                    {row.disease_status != null && <Tag>{DISEASE_STATUS[row.disease_status] ?? row.disease_status}</Tag>}
                    <Tag color={STATUS_COLORS[row.chronic_status]}>{CHRONIC_STATUS[row.chronic_status] ?? display(row.chronic_status)}</Tag>
                  </div>
                </div>
                <Descriptions size="small" column={2}>
                  <Descriptions.Item label="评估次数">{row.assessment_count ?? '-'}</Descriptions.Item>
                  <Descriptions.Item label="最近评估">{formatTimestamp(row.last_assess_date)}</Descriptions.Item>
                  {row.chronic_status === 9 && <Descriptions.Item label="终止日期">{formatTimestamp(row.chronic_end_date)}</Descriptions.Item>}
                </Descriptions>
                <div className="chronic-card__description">
                  <span>治疗情况</span><p>{display(row.treatment_desc)}</p>
                  <span>备注</span><p>{display(row.remark)}</p>
                </div>
                <div className="chronic-card__actions">
                  <Button size="small" onClick={() => setMetricArchive(row)}>关联指标</Button>
                  <Button size="small" onClick={() => setAssessmentArchive(row)}>评估记录</Button>
                  <Button size="small" disabled={row.chronic_status === 9} onClick={() => { statusForm.setFieldsValue(row); setStatusArchive(row) }}>变更状态</Button>
                  <Button size="small" danger disabled={row.chronic_status === 9} onClick={() => { terminateForm.resetFields(); setTerminateArchive(row) }}>终止</Button>
                </div>
              </Card>
            )) : !loading && <Empty description="暂无慢病专病档案" />}
          </div>
        </Spin>

      </Card>

      <FormDrawer
        title="新建专病" width={760} open={createOpen}
        onClose={() => setCreateOpen(false)} onSubmit={create} confirmLoading={creating}
      >
        <Form form={createForm} layout="vertical">
          <div className="chronic-form-row">
            <Form.Item name="disease_code" label="慢病病种" rules={[{ required: true, message: '请选择慢病病种' }]}>
              <Select
                showSearch optionFilterProp="label" onChange={selectDisease} placeholder="请选择慢病病种"
                options={diseases.map((item) => ({ value: item.icd10_code, label: `${item.disease_name_cn}（${item.icd10_code}）` }))}
              />
            </Form.Item>
            <Form.Item name="disease_name" label="病种名称"><Input placeholder="选择病种后自动带出，可修改" /></Form.Item>
          </div>
          <div className="chronic-form-row chronic-form-row--three">
            <Form.Item name="diagnose_date" label="诊断日期"><DatePicker className="archive-full-width" /></Form.Item>
            <Form.Item name="assess_date" label="评估日期"><DatePicker className="archive-full-width" /></Form.Item>
            <Form.Item name="source" label="来源"><Select allowClear options={SOURCE_OPTIONS} placeholder="请选择来源" /></Form.Item>
          </div>
          <Form.Item name="remark" label="备注"><Input.TextArea rows={3} placeholder="补充本次专病建档说明" /></Form.Item>
        </Form>
      </FormDrawer>

      <FormDrawer
        title={`变更控制状态 · ${statusArchive?.disease_name || statusArchive?.disease_code || ''}`}
        open={statusArchive != null} onClose={() => setStatusArchive(undefined)}
        onSubmit={updateStatus} confirmLoading={acting}
      >
        <Form form={statusForm} layout="vertical">
          <Form.Item name="chronic_status" label="控制状态" rules={[{ required: true, message: '请选择控制状态' }]}>
            <Select options={[1, 2, 3, 4].map((value) => ({ value, label: CHRONIC_STATUS[value] }))} />
          </Form.Item>
          <Form.Item name="remark" label="备注"><Input.TextArea rows={3} /></Form.Item>
        </Form>
      </FormDrawer>

      <Modal
        title="终止专病管理" open={terminateArchive != null} onCancel={() => setTerminateArchive(undefined)}
        onOk={terminate} confirmLoading={acting} destroyOnHidden
      >
        <Form form={terminateForm} layout="vertical">
          <Form.Item name="end_date" label="终止日期"><DatePicker className="archive-full-width" /></Form.Item>
          <Form.Item name="reason" label="终止原因"><Input.TextArea rows={3} /></Form.Item>
        </Form>
      </Modal>

      <ChronicMetricDrawer archive={metricArchive} onClose={() => setMetricArchive(undefined)} />
      <AssessmentsDrawer
        memberId={memberId} archive={assessmentArchive}
        onClose={() => setAssessmentArchive(undefined)} onChanged={() => { void load() }}
      />
    </>
  )
}
