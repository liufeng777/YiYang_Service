/** 检测项字典管理：分类、检测项、参考范围与慢病关联。 */
import { useCallback, useEffect, useMemo, useState } from 'react'
import type { Key } from 'react'
import {
  App, Button, Card, Descriptions, Drawer, Dropdown, Empty, Form, Input,
  InputNumber, Modal, Popconfirm, Select, Space, Table, Tag, Tooltip, Tree,
} from 'antd'
import type { DataNode } from 'antd/es/tree'
import {
  ArrowLeftOutlined, CheckCircleOutlined, EditOutlined, FolderOutlined,
  MoreOutlined, PlusOutlined, StopOutlined,
} from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import PageContainer from '@/components/PageContainer'
import { chronicDiseaseApi, metricApi } from '@/api'
import type { ChronicDiseaseDict } from '@/api/modules/chronic-disease'
import type { MetricCategory, MetricItem, RefRange } from '@/api/modules/metric'
import type { ApiData } from '@/api/modules/common'
import './index.less'

const SCOPE_MAP: Record<number, string> = { 1: '常规', 2: '慢病专有', 3: '慢病派生' }
const GENDER_MAP: Record<number, string> = { 0: '不限', 1: '男', 2: '女' }

interface CategoryTreeNode extends DataNode {
  category: MetricCategory
  children?: CategoryTreeNode[]
}

function text(value: unknown) {
  if (value == null || value === '') return '-'
  return typeof value === 'object' ? JSON.stringify(value) : String(value)
}

function flattenCategories(categories: MetricCategory[], depth = 0): Array<{ item: MetricCategory; depth: number }> {
  return categories.flatMap((item) => [
    { item, depth },
    ...flattenCategories(item.children ?? [], depth + 1),
  ])
}

function toTreeData(categories: MetricCategory[]): CategoryTreeNode[] {
  return categories.map((item) => ({
    key: item.id,
    title: item.category_name,
    category: item,
    children: toTreeData(item.children ?? []),
  }))
}

interface CategoryPanelProps {
  categories: MetricCategory[]
  loading: boolean
  selectedId?: number
  onSelect: (id?: number) => void
  reload: () => Promise<void>
}

function CategoryPanel({ categories, loading, selectedId, onSelect, reload }: CategoryPanelProps) {
  const { message } = App.useApp()
  const [form] = Form.useForm()
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<MetricCategory | null>(null)
  const [saving, setSaving] = useState(false)
  const [actingId, setActingId] = useState<number>()
  const [expandedKeys, setExpandedKeys] = useState<Key[]>([])
  const treeData = useMemo(() => toTreeData(categories), [categories])
  const options = flattenCategories(categories).map(({ item, depth }) => ({
    value: item.id,
    label: `${'　'.repeat(depth)}${item.category_name}`,
  }))

  useEffect(() => {
    setExpandedKeys(flattenCategories(categories).map(({ item }) => item.id))
  }, [categories])

  const openEditor = (row?: MetricCategory, parent?: MetricCategory) => {
    setEditing(row ?? null)
    form.resetFields()
    form.setFieldsValue(row ? {
      category_name: row.category_name,
      category_code: row.category_code,
      sort_order: row.sort_order,
    } : {
      category_name: '', category_code: '', parent_id: parent?.id ?? 0,
      category_level: (parent?.category_level ?? 0) + 1, sort_order: 0,
    })
    setOpen(true)
  }

  const save = async () => {
    const values = await form.validateFields()
    setSaving(true)
    try {
      if (editing) {
        await metricApi.updateMetricCategory(editing.id, {
          category_name: values.category_name,
          category_code: values.category_code,
          sort_order: values.sort_order,
        })
      } else {
        await metricApi.createMetricCategory(values)
      }
      message.success(`分类已${editing ? '更新' : '新增'}`)
      setOpen(false)
      form.resetFields()
      await reload()
    } catch { /* 保留输入 */ } finally { setSaving(false) }
  }

  const toggleStatus = async (row: MetricCategory) => {
    setActingId(row.id)
    try {
      await metricApi.setMetricCategoryStatus(row.id, { status: row.status === 1 ? 9 : 1 })
      message.success('分类状态已更新')
      await reload()
    } catch { /* 拦截器统一提示 */ } finally { setActingId(undefined) }
  }

  const renderTitle = (node: CategoryTreeNode) => {
    const row = node.category
    return (
      <div className="mm-tree-node">
        <span className="mm-tree-node__name" title={row.category_name}>{row.category_name}</span>
        <span className="mm-tree-node__code" title={row.category_code || '未设置编码'}>{row.category_code || '无编码'}</span>
        {row.status !== 1 && <Tag className="mm-tree-node__status">停用</Tag>}
        <Dropdown
          trigger={['hover']}
          disabled={actingId === row.id}
          menu={{
            items: [
              { key: 'edit', icon: <EditOutlined />, label: '编辑分类' },
              { key: 'add', icon: <PlusOutlined />, label: '新增子类' },
              row.status === 1
                ? { key: 'disable', icon: <StopOutlined />, label: '停用分类', danger: true }
                : { key: 'enable', icon: <CheckCircleOutlined />, label: '启用分类' },
            ],
            onClick: ({ key, domEvent }) => {
              domEvent.stopPropagation()
              if (key === 'edit') openEditor(row)
              if (key === 'add') openEditor(undefined, row)
              if (key === 'disable' || key === 'enable') toggleStatus(row)
            },
          }}
        >
          <Button
            type="text" size="small" className="mm-tree-node__actions"
            icon={<MoreOutlined />} loading={actingId === row.id} aria-label={`管理分类 ${row.category_name}`}
            onClick={(event) => event.stopPropagation()}
          />
        </Dropdown>
      </div>
    )
  }

  return (
    <Card
      className="mm-category-card"
      title={<Space><FolderOutlined />检测项分类</Space>}
      loading={loading}
      extra={(
        <Tooltip title="新增一级分类">
          <Button type="text" icon={<PlusOutlined />} aria-label="新增一级分类" onClick={() => openEditor()} />
        </Tooltip>
      )}
    >
      <Button
        block type="text" icon={<FolderOutlined />}
        className={`mm-tree-all${selectedId == null ? ' is-active' : ''}`}
        onClick={() => onSelect(undefined)}
      >
        全部检测项
      </Button>
      {treeData.length > 0 ? (
        <Tree<CategoryTreeNode>
          blockNode showLine treeData={treeData}
          expandedKeys={expandedKeys} onExpand={setExpandedKeys}
          selectedKeys={selectedId == null ? [] : [selectedId]}
          onSelect={(keys) => onSelect(keys.length > 0 ? Number(keys[0]) : undefined)}
          titleRender={(node) => renderTitle(node)}
        />
      ) : (
        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="暂无分类" />
      )}
      <Drawer
        title={editing ? '编辑检测项分类' : '新增检测项分类'} width={480} open={open}
        onClose={() => setOpen(false)} destroyOnHidden
        footer={(
          <div className="mm-drawer-footer">
            <Button onClick={() => setOpen(false)}>取消</Button>
            <Button type="primary" loading={saving} onClick={save}>保存</Button>
          </div>
        )}
      >
        <Form form={form} layout="vertical" requiredMark="optional">
          <Form.Item name="category_name" label="分类名称" rules={[{ required: true, whitespace: true, message: '请输入分类名称' }]}>
            <Input placeholder="请输入分类名称" maxLength={50} showCount />
          </Form.Item>
          <Form.Item name="category_code" label="分类编码">
            <Input placeholder="请输入分类编码" maxLength={50} />
          </Form.Item>
          {!editing && (
            <>
              <Form.Item name="parent_id" label="父级分类">
                <Select options={[{ value: 0, label: '无（一级分类）' }, ...options]} />
              </Form.Item>
              <Form.Item name="category_level" label="层级">
                <InputNumber min={1} precision={0} className="mm-full-width" />
              </Form.Item>
            </>
          )}
          <Form.Item name="sort_order" label="排序">
            <InputNumber precision={0} className="mm-full-width" />
          </Form.Item>
        </Form>
      </Drawer>
    </Card>
  )
}

interface MetricFilters { keyword: string; status?: number; metric_scope?: 0 | 1 | 2 | 3 }

function MetricsPanel({ categories, selectedCategoryId }: { categories: MetricCategory[]; selectedCategoryId?: number }) {
  const { message } = App.useApp()
  const [form] = Form.useForm()
  const [rangeForm] = Form.useForm()
  const [diseaseForm] = Form.useForm()
  const [filters, setFilters] = useState<MetricFilters>({ keyword: '' })
  const [applied, setApplied] = useState<MetricFilters>({ keyword: '' })
  const [list, setList] = useState<MetricItem[]>([])
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [editorOpen, setEditorOpen] = useState(false)
  const [editing, setEditing] = useState<MetricItem | null>(null)
  const [saving, setSaving] = useState(false)
  const [actingCode, setActingCode] = useState<string>()
  const [selected, setSelected] = useState<MetricItem>()
  const [detail, setDetail] = useState<MetricItem>()
  const [ranges, setRanges] = useState<RefRange[]>([])
  const [diseases, setDiseases] = useState<ApiData[]>([])
  const [diseaseDict, setDiseaseDict] = useState<ChronicDiseaseDict[]>([])
  const [detailLoading, setDetailLoading] = useState(false)
  const [rangeOpen, setRangeOpen] = useState(false)
  const [rangeEditing, setRangeEditing] = useState<RefRange | null>(null)
  const [diseaseOpen, setDiseaseOpen] = useState(false)

  const categoryOptions = useMemo(() => flattenCategories(categories).map(({ item, depth }) => ({
    value: item.id, label: `${'　'.repeat(depth)}${item.category_name}`,
  })), [categories])
  const categoryNames = useMemo(() => new Map(flattenCategories(categories).map(({ item }) => [item.id, item.category_name])), [categories])
  const selectedCategory = useMemo(
    () => flattenCategories(categories).find(({ item }) => item.id === selectedCategoryId)?.item,
    [categories, selectedCategoryId],
  )

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await metricApi.getMetrics({
        page, page_size: pageSize,
        keyword: applied.keyword || undefined,
        category_id: selectedCategoryId,
        status: applied.status,
        metric_scope: applied.metric_scope,
      })
      setList(res.list ?? [])
      setTotal(res.total ?? 0)
    } catch { /* 拦截器统一提示 */ } finally { setLoading(false) }
  }, [page, pageSize, applied, selectedCategoryId])

  useEffect(() => { load() }, [load])
  useEffect(() => { setPage(1) }, [selectedCategoryId])

  const openEditor = (row?: MetricItem) => {
    setEditing(row ?? null)
    form.resetFields()
    form.setFieldsValue(row ? { ...row } : {
      data_type: 1, is_multi: 0, metric_scope: 1, sort_order: 0,
      category_id: selectedCategoryId,
    })
    setEditorOpen(true)
  }

  const saveMetric = async () => {
    const values = await form.validateFields()
    setSaving(true)
    try {
      if (editing) {
        await metricApi.updateMetric(editing.metric_code, {
          category_id: values.category_id,
          data_type: values.data_type,
          metric_group: values.metric_group,
          metric_name_cn: values.metric_name_cn,
          metric_name_en: values.metric_name_en,
          option_json: values.option_json,
          remark: values.remark,
          unit_symbol: values.unit_symbol,
        })
      } else {
        await metricApi.createMetric(values)
      }
      message.success(`检测项已${editing ? '更新' : '新增'}`)
      setEditorOpen(false)
      form.resetFields()
      await load()
    } catch { /* 保留输入 */ } finally { setSaving(false) }
  }

  const toggleStatus = async (row: MetricItem) => {
    setActingCode(row.metric_code)
    try {
      await metricApi.setMetricStatus(row.metric_code, { status: row.status === 1 ? 9 : 1 })
      message.success('检测项状态已更新')
      await load()
    } catch { /* 拦截器统一提示 */ } finally { setActingCode(undefined) }
  }

  const removeMetric = async (row: MetricItem) => {
    try {
      await metricApi.deleteMetric(row.metric_code)
      message.success('检测项已删除')
      await load()
    } catch { /* 拦截器统一提示 */ }
  }

  const loadDetail = useCallback(async () => {
    if (!selected) return
    setDetailLoading(true)
    try {
      const [metricDetail, refRanges, metricDiseases] = await Promise.all([
        metricApi.getMetricDetail(selected.metric_code),
        metricApi.getRefRanges(selected.metric_code),
        metricApi.getMetricDiseases(selected.metric_code),
      ])
      setDetail(metricDetail)
      setRanges(refRanges ?? [])
      setDiseases(metricDiseases ?? [])
    } catch { /* 拦截器统一提示 */ } finally { setDetailLoading(false) }
  }, [selected])

  useEffect(() => { loadDetail() }, [loadDetail])
  useEffect(() => {
    if (!selected) return
    chronicDiseaseApi.getChronicDiseases({ page: 1, page_size: 200 })
      .then((res) => setDiseaseDict(res.list ?? [])).catch(() => undefined)
  }, [selected?.metric_code])

  const openConfig = (row: MetricItem) => {
    setSelected(row)
    setDetail(undefined)
    setRanges([])
    setDiseases([])
  }

  const openRangeEditor = (row?: RefRange) => {
    setRangeEditing(row ?? null)
    rangeForm.setFieldsValue(row ? { ...row } : { gender: 0, is_default: 2, sort_order: 0 })
    setRangeOpen(true)
  }

  const saveRange = async () => {
    if (!selected) return
    const values = await rangeForm.validateFields()
    setSaving(true)
    try {
      await metricApi.saveRefRange(selected.metric_code, { ...values, id: rangeEditing?.id })
      message.success('参考范围已保存')
      setRangeOpen(false)
      rangeForm.resetFields()
      await loadDetail()
    } catch { /* 保留输入 */ } finally { setSaving(false) }
  }

  const removeRange = async (row: RefRange) => {
    if (row.id == null) return
    try {
      await metricApi.deleteRefRange(row.id)
      message.success('参考范围已删除')
      await loadDetail()
    } catch { /* 拦截器统一提示 */ }
  }

  const setDefaultRange = async (row: RefRange) => {
    if (row.id == null) return
    try {
      await metricApi.setRefRangeDefault(row.id, { is_default: row.is_default === 1 ? 0 : 1 })
      message.success('默认范围已更新')
      await loadDetail()
    } catch { /* 拦截器统一提示 */ }
  }

  const addDisease = async () => {
    if (!selected) return
    const values = await diseaseForm.validateFields()
    setSaving(true)
    try {
      await metricApi.createMetricDisease(selected.metric_code, values)
      message.success('慢病关联已新增')
      setDiseaseOpen(false)
      diseaseForm.resetFields()
      await loadDetail()
    } catch { /* 保留输入 */ } finally { setSaving(false) }
  }

  const removeDisease = async (row: ApiData) => {
    const linkId = row.id ?? row.link_id
    if (linkId == null) {
      message.warning('该关联记录未返回关联 ID，无法删除')
      return
    }
    try {
      await metricApi.deleteMetricDisease(linkId as number)
      message.success('慢病关联已删除')
      await loadDetail()
    } catch { /* 拦截器统一提示 */ }
  }

  return (
    <>
      <Card
        className="mm-metrics-card"
        title="检测项列表"
        extra={<Button type="primary" icon={<PlusOutlined />} onClick={() => openEditor()}>新增检测项</Button>}
      >
        <div className="mm-list-context">
          <FolderOutlined />
          <span>当前分类</span>
          <strong>{selectedCategory?.category_name ?? '全部分类'}</strong>
          {selectedCategory?.category_code && <code>{selectedCategory.category_code}</code>}
        </div>
        <Card variant="borderless" className="filter-bar">
          <Input
            placeholder="编码 / 中文名 / 英文名 / 缩写" value={filters.keyword} allowClear
            onChange={(event) => setFilters((prev) => ({ ...prev, keyword: event.target.value.trim() }))}
            onPressEnter={() => { setApplied({ ...filters }); setPage(1) }}
          />
          <Select
            allowClear placeholder="全部范围" value={filters.metric_scope}
            options={Object.entries(SCOPE_MAP).map(([value, label]) => ({ value: Number(value), label }))}
            onChange={(value) => setFilters((prev) => ({ ...prev, metric_scope: value }))}
          />
          <Select
            allowClear placeholder="全部状态" value={filters.status}
            options={[{ value: 1, label: '启用' }, { value: 2, label: '停用' }]}
            onChange={(value) => setFilters((prev) => ({ ...prev, status: value }))}
          />
          <Button onClick={() => { const empty = { keyword: '' }; setFilters(empty); setApplied(empty); setPage(1) }}>重置</Button>
          <Button type="primary" onClick={() => { setApplied({ ...filters }); setPage(1) }}>查询</Button>
        </Card>
        <Table<MetricItem>
          rowKey="metric_code" dataSource={list} loading={loading} scroll={{ x: 1250 }}
          columns={[
            { title: '检测项编码', dataIndex: 'metric_code', fixed: 'left' },
            { title: '中文名称', dataIndex: 'metric_name_cn' },
            { title: '分类', dataIndex: 'category_id', render: (value: number) => categoryNames.get(value) ?? value },
            { title: '范围', dataIndex: 'metric_scope', render: (value?: number) => value ? SCOPE_MAP[value] ?? value : '常规' },
            { title: '数据类型', dataIndex: 'data_type', render: (value?: number) => value === 2 ? '枚举' : '数值' },
            { title: '单位', key: 'unit', render: (_: unknown, row: MetricItem) => text(row.metric_unit ?? row.unit_symbol) },
            {
              title: '状态', dataIndex: 'status',
              render: (value?: number) => <Tag color={value === 1 ? 'green' : 'default'}>{value === 1 ? '启用' : '停用'}</Tag>,
            },
            {
              title: '操作', key: 'action', width: 300, fixed: 'right',
              render: (_: unknown, row: MetricItem) => (
                <Space>
                  <Button size="small" type="primary" onClick={() => openConfig(row)}>配置</Button>
                  <Button size="small" onClick={() => openEditor(row)}>编辑</Button>
                  <Button size="small" loading={actingCode === row.metric_code} onClick={() => toggleStatus(row)}>{row.status === 1 ? '停用' : '启用'}</Button>
                  <Popconfirm title="确认删除该检测项？" onConfirm={() => removeMetric(row)}>
                    <Button size="small" danger>删除</Button>
                  </Popconfirm>
                </Space>
              ),
            },
          ]}
          pagination={{
            current: page, pageSize, total, showSizeChanger: true,
            showTotal: (value) => `共 ${value} 条`,
            onChange: (nextPage, nextSize) => { setPage(nextPage); setPageSize(nextSize) },
          }}
        />
      </Card>

      <Drawer
        title={editing ? `编辑检测项 · ${editing.metric_name_cn}` : '新增检测项'} width={720}
        open={editorOpen} onClose={() => setEditorOpen(false)} destroyOnHidden
        footer={(
          <div className="mm-drawer-footer">
            <Button onClick={() => setEditorOpen(false)}>取消</Button>
            <Button type="primary" loading={saving} onClick={saveMetric}>保存</Button>
          </div>
        )}
      >
        <Form form={form} layout="vertical" className="mm-form-grid" requiredMark="optional">
          <Form.Item name="metric_code" label="检测项编码" rules={[{ required: true, whitespace: true, message: '请输入检测项编码' }]}>
            <Input disabled={editing != null} placeholder="请输入检测项编码" />
          </Form.Item>
          <Form.Item name="category_id" label="所属分类" rules={[{ required: true, message: '请选择所属分类' }]}>
            <Select showSearch optionFilterProp="label" options={categoryOptions} placeholder="请选择所属分类" />
          </Form.Item>
          <Form.Item name="metric_name_cn" label="中文名称" rules={[{ required: true, whitespace: true, message: '请输入中文名称' }]}><Input placeholder="请输入中文名称" /></Form.Item>
          <Form.Item name="metric_name_en" label="英文名称"><Input placeholder="请输入英文名称" /></Form.Item>
          {!editing && <Form.Item name="abbreviation" label="缩写"><Input placeholder="请输入缩写" /></Form.Item>}
          <Form.Item name="data_type" label="数据类型"><Select options={[{ value: 1, label: '数值' }, { value: 2, label: '枚举' }]} /></Form.Item>
          {!editing && <Form.Item name="metric_scope" label="指标范围"><Select options={Object.entries(SCOPE_MAP).map(([value, label]) => ({ value: Number(value), label }))} /></Form.Item>}
          {!editing && <Form.Item name="is_multi" label="是否多选"><Select options={[{ value: 0, label: '否' }, { value: 1, label: '是' }]} /></Form.Item>}
          <Form.Item name="metric_group" label="慢病表单分组"><Input placeholder="请输入表单分组" /></Form.Item>
          {!editing && <Form.Item name="metric_unit" label="单位"><Input placeholder="例如：mmol/L" /></Form.Item>}
          <Form.Item name="unit_symbol" label="单位符号"><Input placeholder="请输入单位符号" /></Form.Item>
          {!editing && <Form.Item name="sort_order" label="排序"><InputNumber precision={0} /></Form.Item>}
          <Form.Item
            name="option_json" label="枚举选项 JSON" className="mm-field-wide"
            rules={[{ validator: (_: unknown, value: string) => {
              if (!value) return Promise.resolve()
              try { JSON.parse(value); return Promise.resolve() } catch { return Promise.reject(new Error('请输入有效 JSON')) }
            } }]}
          >
            <Input.TextArea rows={4} placeholder="枚举类型可填写选项 JSON" />
          </Form.Item>
          <Form.Item name="remark" label="备注" className="mm-field-wide"><Input.TextArea rows={4} placeholder="请输入备注" /></Form.Item>
        </Form>
      </Drawer>

      <Drawer
        title={`检测项配置 · ${selected?.metric_name_cn ?? ''}`} width={920}
        open={selected != null} loading={detailLoading} onClose={() => setSelected(undefined)}
      >
        <div className="mm-detail">
          <Descriptions bordered size="small" column={{ xs: 1, sm: 2 }}>
            <Descriptions.Item label="检测项编码">{detail?.metric_code ?? selected?.metric_code}</Descriptions.Item>
            <Descriptions.Item label="中文名称">{detail?.metric_name_cn ?? selected?.metric_name_cn}</Descriptions.Item>
            <Descriptions.Item label="指标范围">{SCOPE_MAP[Number(detail?.metric_scope ?? selected?.metric_scope)] ?? '常规'}</Descriptions.Item>
            <Descriptions.Item label="数据类型">{(detail?.data_type ?? selected?.data_type) === 2 ? '枚举' : '数值'}</Descriptions.Item>
            <Descriptions.Item label="单位">{text(detail?.metric_unit ?? detail?.unit_symbol ?? selected?.metric_unit ?? selected?.unit_symbol)}</Descriptions.Item>
            <Descriptions.Item label="分组">{text(detail?.metric_group ?? selected?.metric_group)}</Descriptions.Item>
          </Descriptions>

          <Card
            size="small" title="参考范围" className="mm-detail__section"
            extra={<Button size="small" type="primary" onClick={() => openRangeEditor()}>新增范围</Button>}
          >
            <Table<RefRange>
              rowKey={(row) => String(row.id ?? JSON.stringify(row))} dataSource={ranges} pagination={false} size="small"
              columns={[
                { title: '性别', dataIndex: 'gender', render: (value?: number) => GENDER_MAP[value ?? 0] ?? value },
                { title: '年龄', key: 'age', render: (_: unknown, row: RefRange) => `${text(row.age_min)} ~ ${text(row.age_max)}` },
                { title: '下限', dataIndex: 'ref_lower', render: text },
                { title: '上限', dataIndex: 'ref_upper', render: text },
                { title: '默认', dataIndex: 'is_default', render: (value?: number) => value === 1 ? <Tag color="green">默认</Tag> : '-' },
                { title: '排序', dataIndex: 'sort_order', render: text },
                {
                  title: '操作', key: 'action', width: 210,
                  render: (_: unknown, row: RefRange) => (
                    <Space>
                      <Button size="small" onClick={() => openRangeEditor(row)}>编辑</Button>
                      <Button size="small" onClick={() => setDefaultRange(row)}>{row.is_default === 1 ? '取消默认' : '设为默认'}</Button>
                      <Popconfirm title="确认删除该参考范围？" onConfirm={() => removeRange(row)}><Button size="small" danger>删除</Button></Popconfirm>
                    </Space>
                  ),
                },
              ]}
            />
          </Card>

          <Card
            size="small" title="关联慢病" className="mm-detail__section"
            extra={<Button size="small" type="primary" onClick={() => { diseaseForm.setFieldsValue({ is_required: 0, sort_order: 0 }); setDiseaseOpen(true) }}>新增关联</Button>}
          >
            <Table<ApiData>
              rowKey={(row) => String(row.id ?? row.link_id ?? JSON.stringify(row))} dataSource={diseases} pagination={false} size="small"
              columns={[
                { title: '病种编码', dataIndex: 'disease_code', render: text },
                { title: '病种名称', key: 'disease_name', render: (_: unknown, row: ApiData) => text(row.disease_name_cn ?? row.disease_name) },
                { title: '必填', dataIndex: 'is_required', render: (value: unknown) => Number(value) === 1 ? '是' : '否' },
                { title: '排序', dataIndex: 'sort_order', render: text },
                {
                  title: '操作', key: 'action', width: 90,
                  render: (_: unknown, row: ApiData) => (
                    <Popconfirm title="确认删除该慢病关联？" onConfirm={() => removeDisease(row)}><Button size="small" danger>删除</Button></Popconfirm>
                  ),
                },
              ]}
            />
          </Card>
        </div>
      </Drawer>

      <Modal
        title={rangeEditing ? '编辑参考范围' : '新增参考范围'} open={rangeOpen}
        onCancel={() => setRangeOpen(false)} onOk={saveRange} confirmLoading={saving} destroyOnHidden
      >
        <Form form={rangeForm} layout="vertical" className="mm-form-grid">
          <Form.Item name="gender" label="适用性别"><Select options={Object.entries(GENDER_MAP).map(([value, label]) => ({ value: Number(value), label }))} /></Form.Item>
          <Form.Item name="is_default" label="是否默认"><Select options={[{ value: 1, label: '默认' }, { value: 2, label: '非默认' }]} /></Form.Item>
          <Form.Item name="age_min" label="年龄下限"><InputNumber precision={0} min={0} /></Form.Item>
          <Form.Item name="age_max" label="年龄上限"><InputNumber precision={0} min={0} /></Form.Item>
          <Form.Item name="ref_lower" label="参考下限"><Input /></Form.Item>
          <Form.Item name="ref_upper" label="参考上限"><Input /></Form.Item>
          <Form.Item name="sort_order" label="排序"><InputNumber precision={0} /></Form.Item>
        </Form>
      </Modal>

      <Modal
        title="新增检测项-慢病关联" open={diseaseOpen} onCancel={() => setDiseaseOpen(false)}
        onOk={addDisease} confirmLoading={saving} destroyOnHidden
      >
        <Form form={diseaseForm} layout="vertical">
          <Form.Item name="disease_code" label="慢病病种" rules={[{ required: true, message: '请选择慢病病种' }]}>
            <Select
              showSearch optionFilterProp="label"
              options={diseaseDict.map((item) => ({ value: item.icd10_code, label: `${item.disease_name_cn}（${item.icd10_code}）` }))}
            />
          </Form.Item>
          <Form.Item name="is_required" label="该病种下是否必填"><Select options={[{ value: 0, label: '否' }, { value: 1, label: '是' }]} /></Form.Item>
          <Form.Item name="sort_order" label="表单排序"><InputNumber precision={0} /></Form.Item>
        </Form>
      </Modal>
    </>
  )
}

export default function MetricManagement() {
  const navigate = useNavigate()
  const [categories, setCategories] = useState<MetricCategory[]>([])
  const [selectedCategoryId, setSelectedCategoryId] = useState<number>()
  const [loading, setLoading] = useState(false)

  const loadCategories = useCallback(async () => {
    setLoading(true)
    try {
      const res = await metricApi.getMetricCategories()
      const tree = Array.isArray(res) ? res : (res as unknown as { list?: MetricCategory[] }).list ?? []
      setCategories(tree)
    } catch { /* 拦截器统一提示 */ } finally { setLoading(false) }
  }, [])

  useEffect(() => { loadCategories() }, [loadCategories])

  return (
    <PageContainer
      title="检测项管理"
      description="按分类维护检测项、参考范围及慢病表单关联"
      extra={<Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/health-record')}>返回健康档案</Button>}
    >
      <div className="mm-page">
        <aside className="mm-page__sidebar">
          <CategoryPanel
            categories={categories} loading={loading} selectedId={selectedCategoryId}
            onSelect={setSelectedCategoryId} reload={loadCategories}
          />
        </aside>
        <section className="mm-page__content">
          <MetricsPanel categories={categories} selectedCategoryId={selectedCategoryId} />
        </section>
      </div>
    </PageContainer>
  )
}
