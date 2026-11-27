/** 主档案、生活习惯与四类病史的真实 CRUD。 */
import { useCallback, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import {
  App, Button, Card, DatePicker, Form, Input, InputNumber,
  Popconfirm, Radio, Select, Space, Table, Tabs,
} from 'antd'
import Tag from '@/components/StatusTag'
import type { Dayjs } from 'dayjs'
import { healthArchiveApi } from '@/api'
import FormDrawer from '@/components/FormDrawer'
import type { ArchiveEnumOptions, HealthArchiveOverview } from '@/api/modules/health-archive'
import type { ArchiveData } from './Plan/shared'
import { toDayjs } from './Plan/shared'
import { archiveEnumColor, archiveEnumLabel } from './archive-enums'
import { formatDateTime } from '@/utils'

interface BasicProps {
  memberId: string
  overview?: HealthArchiveOverview
  loading?: boolean
  enumOptions?: ArchiveEnumOptions
}

export function BasicPanel({ memberId, overview, loading = false, enumOptions = {} }: BasicProps) {
  const { message } = App.useApp()
  const [basicForm] = Form.useForm()
  const [lifestyleForm] = Form.useForm()
  const [saving, setSaving] = useState<'basic' | 'lifestyle' | null>(null)

  useEffect(() => {
    if (!overview) return
    basicForm.setFieldsValue(overview.basic ?? overview.archive ?? overview.main ?? {})
    lifestyleForm.setFieldsValue(overview.lifestyle ?? overview.life_style ?? {})
  }, [overview, basicForm, lifestyleForm])

  const saveBasic = async () => {
    const values = await basicForm.validateFields()
    setSaving('basic')
    try {
      await healthArchiveApi.upsertHealthArchiveBasic({ ...values, member_id: Number(memberId) })
      message.success('主档案已保存')
    } catch { /* 保留输入 */ } finally { setSaving(null) }
  }

  const saveLifestyle = async () => {
    const values = await lifestyleForm.validateFields()
    setSaving('lifestyle')
    try {
      await healthArchiveApi.saveLifestyle({ ...values, member_id: Number(memberId) })
      message.success('生活习惯已保存')
    } catch { /* 保留输入 */ } finally { setSaving(null) }
  }

  const selectProps = {
    allowClear: true,
    showSearch: true,
    optionFilterProp: 'label' as const,
  }

  return (
    <div className="archive-basic-layout">
      <Card
        title="主档案" className="archive-form-card" loading={loading}
        extra={<Button type="primary" loading={saving === 'basic'} onClick={saveBasic}>保存主档案</Button>}
      >
        <Form form={basicForm} layout="vertical" className="archive-fields archive-fields--basic">
          <Form.Item name="archive_no" label="档案编号"><Input placeholder="请输入档案编号" /></Form.Item>
          <Form.Item name="blood_type" label="血型"><Select {...selectProps} options={enumOptions.blood_type} placeholder="请选择血型" /></Form.Item>
          <Form.Item name="height" label="身高"><Input placeholder="请输入身高" /></Form.Item>
          <Form.Item name="weight" label="体重"><Input placeholder="请输入体重" /></Form.Item>
          <Form.Item name="marital_status" label="婚姻状况"><Select {...selectProps} options={enumOptions.marital_status} placeholder="请选择婚姻状况" /></Form.Item>
          <Form.Item name="nation" label="民族"><Input placeholder="请输入民族" /></Form.Item>
          <Form.Item name="occupation" label="职业"><Input placeholder="请输入职业" /></Form.Item>
          <Form.Item name="remark" label="备注" className="archive-field-wide"><Input.TextArea rows={2} placeholder="补充档案备注" /></Form.Item>
        </Form>
      </Card>

      <Card
        title="生活习惯" className="archive-form-card" loading={loading}
        extra={<Button type="primary" loading={saving === 'lifestyle'} onClick={saveLifestyle}>保存生活习惯</Button>}
      >
        <Form form={lifestyleForm} layout="vertical" className="archive-lifestyle-form">
          <section className="archive-form-section">
            <h4>饮食与营养</h4>
            <div className="archive-fields archive-fields--lifestyle">
              <Form.Item name="staple_food" label="主食"><Input /></Form.Item>
              <Form.Item name="diet_habit" label="饮食习惯"><Select {...selectProps} options={enumOptions.diet_habit} placeholder="请选择饮食习惯" /></Form.Item>
              <Form.Item name="eating_mode" label="进食方式"><Select {...selectProps} options={enumOptions.eating_mode} placeholder="请选择进食方式" /></Form.Item>
              <Form.Item name="diet_desc" label="饮食描述" className="archive-field-wide"><Input.TextArea rows={2} /></Form.Item>
            </div>
          </section>
          <section className="archive-form-section">
            <h4>运动与活动</h4>
            <div className="archive-fields archive-fields--lifestyle">
              <Form.Item name="activity_level" label="活动强度"><Select {...selectProps} options={enumOptions.activity_level} placeholder="请选择活动强度" /></Form.Item>
              <Form.Item name="exercise_habit" label="运动习惯"><Select {...selectProps} options={enumOptions.exercise_habit} placeholder="请选择运动习惯" /></Form.Item>
              <Form.Item name="exercise_type" label="运动方式"><Input /></Form.Item>
              <Form.Item name="exercise_freq" label="运动频率"><Select {...selectProps} options={enumOptions.exercise_freq} placeholder="请选择运动频率" /></Form.Item>
              <Form.Item name="exercise_duration" label="运动时长"><Select {...selectProps} options={enumOptions.exercise_duration} placeholder="请选择运动时长" /></Form.Item>
            </div>
          </section>
          <section className="archive-form-section">
            <h4>睡眠情况</h4>
            <div className="archive-fields archive-fields--lifestyle">
              <Form.Item name="sleep_hour" label="睡眠时长"><Input /></Form.Item>
              <Form.Item name="sleep_quality" label="睡眠质量"><Select {...selectProps} options={enumOptions.sleep_quality} placeholder="请选择睡眠质量" /></Form.Item>
              <Form.Item name="sleep_medication" label="睡眠用药"><Select {...selectProps} options={enumOptions.sleep_medication} placeholder="请选择睡眠用药情况" /></Form.Item>
            </div>
          </section>
          <div className="archive-habit-grid">
            <section className="archive-form-section">
              <h4>吸烟情况</h4>
              <div className="archive-fields archive-fields--lifestyle">
                <Form.Item name="smoking_status" label="吸烟状态"><Select {...selectProps} options={enumOptions.smoking_status} placeholder="请选择吸烟状态" /></Form.Item>
                <Form.Item name="smoke_daily" label="每日吸烟量"><InputNumber precision={0} /></Form.Item>
                <Form.Item name="smoke_years" label="吸烟年数"><InputNumber precision={0} /></Form.Item>
              </div>
            </section>
            <section className="archive-form-section">
              <h4>饮酒情况</h4>
              <div className="archive-fields archive-fields--lifestyle">
                <Form.Item name="drink_status" label="饮酒状态"><Select {...selectProps} options={enumOptions.drink_status} placeholder="请选择饮酒状态" /></Form.Item>
                <Form.Item name="drink_type" label="饮酒类型"><Input /></Form.Item>
              </div>
            </section>
          </div>
          <section className="archive-form-section">
            <h4>感官与精神状态</h4>
            <div className="archive-fields archive-fields--lifestyle">
              <Form.Item name="vision_status" label="视力状况"><Select {...selectProps} options={enumOptions.vision_status} placeholder="请选择视力状况" /></Form.Item>
              <Form.Item name="hearing_status" label="听力状况"><Select {...selectProps} options={enumOptions.hearing_status} placeholder="请选择听力状况" /></Form.Item>
              <Form.Item name="oral_status" label="口腔状况"><Select {...selectProps} options={enumOptions.oral_status} placeholder="请选择口腔状况" /></Form.Item>
              <Form.Item name="mental_status" label="精神状况"><Select {...selectProps} options={enumOptions.mental_status} placeholder="请选择精神状况" /></Form.Item>
              <Form.Item name="occupational_hazard" label="职业危害" className="archive-field-wide"><Input.TextArea rows={2} /></Form.Item>
            </div>
          </section>
        </Form>
      </Card>
    </div>
  )
}

type RecordKind = 'allergy' | 'disease' | 'family' | 'operation'
type FieldType = 'text' | 'number' | 'date' | 'textarea' | 'radio'
interface FieldConfig { name: string; label: string; type?: FieldType; required?: boolean; render?: (record: ArchiveData) => ReactNode }

const RECORD_CONFIG: Record<RecordKind, { title: string; fields: FieldConfig[] }> = {
  allergy: {
    title: '过敏史',
    fields: [
      {
        name: 'allergen_name', label: '过敏原名称', required: true,
        render: (record) => (
          <div className="table-cell">
            <strong>{archiveEnumLabel({}, 'allergen_name', record.allergen_name)}</strong>
            {record.allergen_code != null && record.allergen_code !== '' && <span className='table-cell__span'>{archiveEnumLabel({}, 'allergen_code', record.allergen_code)}</span>}
          </div>
        ),
      },
      { name: 'allergy_type', label: '过敏类型', type: 'number' },
      { name: 'severity', label: '严重程度', type: 'number' },
      { name: 'onset_date', label: '发生日期', type: 'date' },
      { name: 'reaction', label: '过敏反应', type: 'textarea' },
      { name: 'remark', label: '备注', type: 'textarea' },
    ],
  },
  disease: {
    title: '既往疾病史',
    fields: [
      { name: 'disease_name', label: '疾病名称', required: true,},
      { name: 'diagnose_hospital', label: '诊断医院' },
      { name: 'disease_status', label: '疾病状态', type: 'number' },
      { name: 'onset_date', label: '发病日期', type: 'date' },
      { name: 'treatment_desc', label: '治疗情况', type: 'textarea' },
      { name: 'remark', label: '备注', type: 'textarea' },
    ],
  },
  family: {
    title: '家族史',
    fields: [
      { name: 'disease_name', label: '疾病名称', required: true, render: (record) => (
        <div className="table-cell">
          <strong>{archiveEnumLabel({}, 'disease_name', record.disease_name)}</strong>
          {record.icd10_code != null && record.icd10_code !== '' && <span className='table-cell__span'>{archiveEnumLabel({}, 'icd10_code', record.icd10_code)}</span>}
        </div>
      )},
      { name: 'relation', label: '亲属关系', type: 'number' },
      { name: 'onset_age', label: '发病年龄', type: 'number' },
      {
        name: 'is_dead', label: '是否已故', type: 'radio',
        render: (record) => record.is_dead == null ? '-' : Number(record.is_dead) === 1 ? '是' : '否',
      },
      { name: 'remark', label: '备注', type: 'textarea' },
    ],
  },
  operation: {
    title: '手术史',
    fields: [
      { name: 'op_name', label: '手术名称', required: true },
      { name: 'op_code', label: '手术编码' },
      { name: 'op_type', label: '手术类型', type: 'number' },
      { name: 'op_date', label: '手术日期', type: 'date' },
      { name: 'op_hospital', label: '手术医院' },
      { name: 'outcome', label: '手术结果', type: 'number' },
      { name: 'remark', label: '备注', type: 'textarea' },
    ],
  },
}

function RecordTable({ memberId, kind, enumOptions = {} }: { memberId: string; kind: RecordKind; enumOptions?: ArchiveEnumOptions }) {
  const { message } = App.useApp()
  const [form] = Form.useForm()
  const [records, setRecords] = useState<ArchiveData[]>([])
  const [loading, setLoading] = useState(false)
  const [editing, setEditing] = useState<ArchiveData | null>(null)
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const config = RECORD_CONFIG[kind]

  const load = useCallback(async () => {
    setLoading(true)
    try {
      let result: ArchiveData[] = []
      if (kind === 'allergy') result = (await healthArchiveApi.getAllergies(memberId)).list ?? []
      if (kind === 'disease') result = (await healthArchiveApi.getDiseaseHistories(memberId)).list ?? []
      if (kind === 'family') result = (await healthArchiveApi.getFamilyHistories(memberId)).list ?? []
      if (kind === 'operation') result = (await healthArchiveApi.getOperations(memberId)).list ?? []
      setRecords(result)
    } catch { /* 拦截器统一提示 */ } finally { setLoading(false) }
  }, [memberId, kind])

  useEffect(() => { load() }, [load])

  const openEditor = (record?: ArchiveData) => {
    const value = record ?? {}
    const initial = Object.fromEntries(config.fields.map((field) => [
      field.name,
      field.type === 'date'
        ? toDayjs(value[field.name])
        : field.type === 'radio' ? value[field.name] ?? 0 : value[field.name],
    ]))
    setEditing(record ?? null)
    form.setFieldsValue(initial)
    setOpen(true)
  }

  const save = async () => {
    const values = await form.validateFields()
    const data: ArchiveData = { ...values, member_id: Number(memberId) }
    for (const field of config.fields) {
      if (field.type === 'date') {
        const value = data[field.name] as Dayjs | null | undefined
        data[field.name] = value?.unix()
      }
    }
    if (editing?.id != null) data.id = editing.id
    setSaving(true)
    try {
      if (kind === 'allergy') {
        if (data.id) await healthArchiveApi.updateAllergy(data as never)
        else await healthArchiveApi.createAllergy(data as never)
      }
      if (kind === 'disease') {
        if (data.id) await healthArchiveApi.updateDiseaseHistory(data as never)
        else await healthArchiveApi.createDiseaseHistory(data as never)
      }
      if (kind === 'family') {
        if (data.id) await healthArchiveApi.updateFamilyHistory(data as never)
        else await healthArchiveApi.createFamilyHistory(data as never)
      }
      if (kind === 'operation') {
        if (data.id) await healthArchiveApi.updateOperation(data as never)
        else await healthArchiveApi.createOperation(data as never)
      }
      message.success(`${config.title}已保存`)
      setOpen(false)
      form.resetFields()
      load()
    } catch { /* 保留输入 */ } finally { setSaving(false) }
  }

  const remove = async (record: ArchiveData) => {
    if (record.id == null) return
    try {
      if (kind === 'allergy') await healthArchiveApi.deleteAllergy(memberId, record.id as number)
      if (kind === 'disease') await healthArchiveApi.deleteDiseaseHistory(memberId, record.id as number)
      if (kind === 'family') await healthArchiveApi.deleteFamilyHistory(memberId, record.id as number)
      if (kind === 'operation') await healthArchiveApi.deleteOperation(memberId, record.id as number)
      message.success(`${config.title}已删除`)
      load()
    } catch { /* 拦截器统一提示 */ }
  }

  const columns = [
    ...config.fields.filter((field) => field.type !== 'textarea').map((field) => ({
      title: field.label,
      key: field.name,
      render: (_: unknown, record: ArchiveData) => {
        if (field.render) return field.render(record)
        const value = record[field.name]
        if (field.type === 'date') return formatDateTime(Number(value) * 1000)
        const label = archiveEnumLabel(enumOptions, field.name, value)
        if (label !== '-' && enumOptions[field.name]?.length) {
          return <Tag color={archiveEnumColor(field.name, value, label)}>{label}</Tag>
        }
        return label
      },
    })),
    {
      title: '操作', key: 'action', width: 130,
      render: (_: unknown, record: ArchiveData) => (
        <Space>
          <Button size="small" onClick={() => openEditor(record)}>编辑</Button>
          <Popconfirm title={`确认删除该${config.title}记录？`} onConfirm={() => remove(record)}>
            <Button size="small" danger>删除</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ]

  return (
    <Card
      title={config.title} className="archive-table-card"
      extra={<Button type="primary" onClick={() => openEditor()}>新增记录</Button>}
    >
      <div className="archive-table-scroll">
        <Table<ArchiveData>
          rowKey={(record) => String(record.id ?? JSON.stringify(record))} size="small"
          columns={columns} dataSource={records} loading={loading} pagination={false}
          scroll={{ x: 800, y: '100%' }}
        />
      </div>
      <FormDrawer
        title={`${editing ? '编辑' : '新增'}${config.title}`} width={640}
        open={open} onClose={() => setOpen(false)} onSubmit={save} confirmLoading={saving}
      >
        <Form form={form} layout="vertical">
          {config.fields.map((field) => (
            <Form.Item
              key={field.name} name={field.name} label={field.label}
              rules={field.required ? [{ required: true, whitespace: true, message: `请填写${field.label}` }] : undefined}
            >
              {field.type === 'radio' ? (
                <Radio.Group options={[{ value: 0, label: '否' }, { value: 1, label: '是' }]} />
              ) : field.type === 'number' && enumOptions[field.name]?.length ? (
                <Select
                  allowClear showSearch optionFilterProp="label"
                  options={enumOptions[field.name]} placeholder={`请选择${field.label}`}
                />
              ) : field.type === 'number' ? <InputNumber precision={0} className="archive-full-width" />
                : field.type === 'date' ? <DatePicker className="archive-full-width" />
                  : field.type === 'textarea' ? <Input.TextArea rows={3} />
                    : <Input />}
            </Form.Item>
          ))}
        </Form>
      </FormDrawer>
    </Card>
  )
}

export function RecordsPanel({ memberId, enumOptions = {} }: BasicProps) {
  return (
    <Tabs
      size="small"
      tabPosition="top" className="archive-secondary-tabs"
      items={(Object.keys(RECORD_CONFIG) as RecordKind[]).map((kind) => ({
        key: kind,
        label: RECORD_CONFIG[kind].title,
        children: <RecordTable memberId={memberId} kind={kind} enumOptions={enumOptions} />,
      }))}
    />
  )
}
