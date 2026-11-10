/** 会员慢病专病与按病种表单定义渲染的专病评估。 */
import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  App, Button, Card, DatePicker, Drawer, Form, Input, InputNumber, Modal,
  Select, Space, Switch, Table, Tag,
} from 'antd'
import type { Dayjs } from 'dayjs'
import { chronicDiseaseApi, healthArchiveApi } from '@/api'
import type { ChronicDiseaseDict } from '@/api/modules/chronic-disease'
import type { ChronicArchive } from '@/api/modules/health-archive'
import type { ArchiveData } from './shared'
import { display, formatTimestamp, JsonView, toDayjs } from './shared'
import {
  ChronicMetricFields, getChronicMetricDefinitions, metricFormValues, serializeMetricValues,
} from './chronic-metrics'

const CHRONIC_STATUS: Record<number, string> = {
  1: '控制良好', 2: '基本控制', 3: '控制不佳', 4: '急性加重期', 9: '已终止',
}
const STATUS_COLORS: Record<number, string> = { 1: 'green', 2: 'blue', 3: 'orange', 4: 'red', 9: 'default' }

function AssessmentsDrawer({ memberId, archive, onClose }: {
  memberId: string
  archive?: ChronicArchive
  onClose: () => void
}) {
  const { message } = App.useApp()
  const [form] = Form.useForm()
  const [list, setList] = useState<ArchiveData[]>([])
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [detail, setDetail] = useState<unknown>()
  const [editing, setEditing] = useState<ArchiveData>()
  const [saving, setSaving] = useState(false)
  const [dictionary, setDictionary] = useState<unknown>()
  const pageSize = 5
  const definitions = useMemo(() => getChronicMetricDefinitions(dictionary), [dictionary])

  const load = useCallback(async () => {
    if (!archive) return
    setLoading(true)
    try {
      const res = await healthArchiveApi.getChronicAssessments(archive.id, memberId, { page, page_size: pageSize })
      setList(res.list ?? [])
      setTotal(res.total ?? 0)
    } catch { /* 拦截器统一提示 */ } finally { setLoading(false) }
  }, [archive, memberId, page])

  useEffect(() => { load() }, [load])
  useEffect(() => {
    setPage(1)
    setDetail(undefined)
    setDictionary(undefined)
    if (!archive) {
      setList([])
      return
    }
    healthArchiveApi.getChronicMetricDict(archive.disease_code).then(setDictionary).catch(() => undefined)
  }, [archive?.id, archive?.disease_code])

  const openDetail = async (row: ArchiveData) => {
    if (!archive || !row.batch_no) return
    try {
      setDetail(await healthArchiveApi.getChronicAssessmentDetail(archive.id, String(row.batch_no), memberId))
    } catch { /* 拦截器统一提示 */ }
  }

  const openEditor = async (row: ArchiveData) => {
    if (!archive || !row.batch_no) return
    try {
      const res = await healthArchiveApi.getChronicAssessmentDetail(archive.id, String(row.batch_no), memberId)
      const source = { ...row, ...res }
      form.setFieldsValue({
        assess_date: toDayjs(source.assess_date),
        source: source.source,
        ...metricFormValues(source.metrics, definitions),
      })
      setEditing({ ...source, batch_no: row.batch_no })
    } catch { /* 拦截器统一提示 */ }
  }

  const save = async () => {
    if (!archive || !editing?.batch_no) return
    const values = await form.validateFields()
    setSaving(true)
    try {
      await healthArchiveApi.updateChronicAssessment(archive.id, String(editing.batch_no), memberId, {
        assess_date: (values.assess_date as Dayjs | undefined)?.unix(),
        source: values.source,
        metrics: serializeMetricValues(values, definitions),
        batch_no: String(editing.batch_no),
        disease_history_id: archive.id,
      })
      message.success('专病评估已更新')
      setEditing(undefined)
      await load()
    } catch { /* 保留输入 */ } finally { setSaving(false) }
  }

  return (
    <Drawer
      title={archive ? `专病评估 · ${archive.disease_name || archive.disease_code}` : ''}
      width={900} open={archive != null} onClose={onClose}
    >
      <Table<ArchiveData>
        rowKey={(row) => String(row.batch_no ?? row.id ?? JSON.stringify(row))}
        loading={loading} dataSource={list} scroll={{ x: 650 }}
        columns={[
          { title: '评估批次', dataIndex: 'batch_no', key: 'batch_no', render: display },
          { title: '评估时间', dataIndex: 'assess_date', key: 'assess_date', render: formatTimestamp },
          { title: '来源', dataIndex: 'source_name', key: 'source_name', render: (_: unknown, row: ArchiveData) => display(row.source_name ?? row.source) },
          { title: '指标', dataIndex: 'metrics', key: 'metrics', render: display, ellipsis: true },
          {
            title: '操作', key: 'action', width: 150,
            render: (_: unknown, row: ArchiveData) => (
              <Space>
                <Button size="small" onClick={() => openDetail(row)}>详情</Button>
                <Button size="small" onClick={() => openEditor(row)}>编辑</Button>
              </Space>
            ),
          },
        ]}
        pagination={{ current: page, pageSize, total, showSizeChanger: false, showTotal: (value) => `共 ${value} 条`, onChange: setPage }}
      />
      {detail != null && <Card size="small" title="单次评估详情" className="archive-section"><JsonView value={detail} /></Card>}
      <Modal
        title="编辑专病评估" width={760} open={editing != null} onCancel={() => setEditing(undefined)}
        onOk={save} confirmLoading={saving} destroyOnHidden
      >
        <Form form={form} layout="vertical">
          <div className="chronic-form-row">
            <Form.Item name="assess_date" label="评估日期"><DatePicker className="archive-full-width" /></Form.Item>
            <Form.Item name="source" label="来源编码"><InputNumber precision={0} /></Form.Item>
          </div>
          <ChronicMetricFields definitions={definitions} />
        </Form>
      </Modal>
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
  const [dictionary, setDictionary] = useState<unknown>()
  const [assessmentArchive, setAssessmentArchive] = useState<ChronicArchive>()
  const [statusArchive, setStatusArchive] = useState<ChronicArchive>()
  const [terminateArchive, setTerminateArchive] = useState<ChronicArchive>()
  const [acting, setActing] = useState(false)
  const definitions = useMemo(() => getChronicMetricDefinitions(dictionary), [dictionary])

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

  const selectDisease = async (code: string) => {
    const disease = diseases.find((item) => item.icd10_code === code)
    createForm.setFieldsValue({ disease_name: disease?.disease_name_cn, metrics: {}, metrics_text: '{}' })
    setDictionary(undefined)
    try { setDictionary(await healthArchiveApi.getChronicMetricDict(code)) } catch { /* 字典失败时使用 JSON 兜底 */ }
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
        metrics: serializeMetricValues(values, definitions),
        source: values.source,
        remark: values.remark,
      })
      message.success('慢病专病条目及当次评估已创建')
      setCreateOpen(false)
      createForm.resetFields()
      setDictionary(undefined)
      await load()
    } catch { /* 保留输入 */ } finally { setCreating(false) }
  }

  const updateStatus = async () => {
    if (!statusArchive) return
    const values = await statusForm.validateFields()
    setActing(true)
    try {
      await healthArchiveApi.updateChronicStatus(statusArchive.id, memberId, values)
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
      await healthArchiveApi.terminateChronicArchive(terminateArchive.id, memberId, {
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
      <Card title="慢病专病档案" extra={<Button type="primary" onClick={() => setCreateOpen(true)}>新建专病并评估</Button>}>
        <div className="archive-inline-filter">
          <Select
            allowClear placeholder="全部控制状态" value={filters.chronic_status}
            options={Object.entries(CHRONIC_STATUS).map(([value, label]) => ({ value: Number(value), label }))}
            onChange={(value) => setFilters((prev) => ({ ...prev, chronic_status: value }))}
          />
          <span>包含已终止 <Switch checked={filters.include_ended} onChange={(checked) => setFilters((prev) => ({ ...prev, include_ended: checked }))} /></span>
          <Button onClick={() => { const empty = { include_ended: false }; setFilters(empty); setApplied(empty) }}>重置</Button>
          <Button type="primary" onClick={() => setApplied({ ...filters })}>查询</Button>
        </div>
        <Table<ChronicArchive>
          rowKey="id" dataSource={list} loading={loading} pagination={false} scroll={{ x: 1000 }}
          columns={[
            { title: 'ID', dataIndex: 'id', width: 80 },
            { title: '病种编码', dataIndex: 'disease_code' },
            { title: '病种名称', dataIndex: 'disease_name', render: display },
            { title: '诊断日期', dataIndex: 'diagnose_date', render: formatTimestamp },
            {
              title: '控制状态', dataIndex: 'chronic_status',
              render: (value?: number) => value == null ? '-' : <Tag color={STATUS_COLORS[value]}>{CHRONIC_STATUS[value] ?? value}</Tag>,
            },
            { title: '备注', dataIndex: 'remark', render: display, ellipsis: true },
            {
              title: '操作', key: 'action', width: 250, fixed: 'right',
              render: (_: unknown, row: ChronicArchive) => (
                <Space wrap>
                  <Button size="small" onClick={() => setAssessmentArchive(row)}>评估记录</Button>
                  <Button size="small" disabled={row.chronic_status === 9} onClick={() => { statusForm.setFieldsValue(row); setStatusArchive(row) }}>变更状态</Button>
                  <Button size="small" danger disabled={row.chronic_status === 9} onClick={() => { terminateForm.resetFields(); setTerminateArchive(row) }}>终止</Button>
                </Space>
              ),
            },
          ]}
        />
      </Card>

      <Modal
        title="新建专病条目并录入当次评估" width={860} open={createOpen}
        onCancel={() => setCreateOpen(false)} onOk={create} confirmLoading={creating} destroyOnHidden
      >
        <Form form={createForm} layout="vertical" initialValues={{ metrics_text: '{}' }}>
          <div className="chronic-form-row">
            <Form.Item name="disease_code" label="慢病病种" rules={[{ required: true, message: '请选择慢病病种' }]}>
              <Select
                showSearch optionFilterProp="label" onChange={selectDisease}
                options={diseases.map((item) => ({ value: item.icd10_code, label: `${item.disease_name_cn}（${item.icd10_code}）` }))}
              />
            </Form.Item>
            <Form.Item name="disease_name" label="病种名称"><Input /></Form.Item>
          </div>
          <div className="chronic-form-row chronic-form-row--three">
            <Form.Item name="diagnose_date" label="诊断日期"><DatePicker className="archive-full-width" /></Form.Item>
            <Form.Item name="assess_date" label="评估日期"><DatePicker className="archive-full-width" /></Form.Item>
            <Form.Item name="source" label="来源编码"><InputNumber precision={0} /></Form.Item>
          </div>
          <ChronicMetricFields definitions={definitions} />
          <Form.Item name="remark" label="备注"><Input.TextArea rows={3} /></Form.Item>
        </Form>
      </Modal>

      <Modal
        title={`变更控制状态 · ${statusArchive?.disease_name || statusArchive?.disease_code || ''}`}
        open={statusArchive != null} onCancel={() => setStatusArchive(undefined)}
        onOk={updateStatus} confirmLoading={acting} destroyOnHidden
      >
        <Form form={statusForm} layout="vertical">
          <Form.Item name="chronic_status" label="控制状态" rules={[{ required: true, message: '请选择控制状态' }]}>
            <Select options={[1, 2, 3, 4].map((value) => ({ value, label: CHRONIC_STATUS[value] }))} />
          </Form.Item>
          <Form.Item name="remark" label="备注"><Input.TextArea rows={3} /></Form.Item>
        </Form>
      </Modal>

      <Modal
        title="终止专病管理" open={terminateArchive != null} onCancel={() => setTerminateArchive(undefined)}
        onOk={terminate} confirmLoading={acting} destroyOnHidden
      >
        <Form form={terminateForm} layout="vertical">
          <Form.Item name="end_date" label="终止日期（不填由后端按今天处理）"><DatePicker className="archive-full-width" /></Form.Item>
          <Form.Item name="reason" label="终止原因"><Input.TextArea rows={3} /></Form.Item>
        </Form>
      </Modal>

      <AssessmentsDrawer memberId={memberId} archive={assessmentArchive} onClose={() => setAssessmentArchive(undefined)} />
    </>
  )
}
