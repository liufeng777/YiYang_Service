/** 按慢病病种展示专病评估关联指标定义。 */
import { useEffect, useState } from 'react'
import { Drawer, Empty, Table, Tag } from 'antd'
import { healthArchiveApi } from '@/api'
import type { ChronicArchive } from '@/api/modules/health-archive'
import { display } from './Plan/shared'
import { getChronicMetricDefinitions, type ChronicMetricDefinition } from './chronic-metrics'

export default function ChronicMetricDrawer({ archive, onClose }: {
  archive?: ChronicArchive
  onClose: () => void
}) {
  const [definitions, setDefinitions] = useState<ChronicMetricDefinition[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    let active = true
    setDefinitions([])
    if (!archive?.disease_code) {
      setLoading(false)
      return () => { active = false }
    }
    setLoading(true)
    healthArchiveApi.getChronicMetricDict(archive.disease_code)
      .then((result) => { if (active) setDefinitions(getChronicMetricDefinitions(result)) })
      .catch(() => { if (active) setDefinitions([]) })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [archive?.disease_history_id, archive?.disease_code])

  return (
    <Drawer
      title={archive ? `关联指标 · ${archive.disease_name || archive.disease_code}` : '关联指标'}
      width={1100} open={archive != null} onClose={onClose} destroyOnHidden
      className="chronic-metric-drawer" extra={<span>{definitions.length} 项指标</span>}
    >
      <div className="chronic-metric-drawer__content">
        <Table<ChronicMetricDefinition>
          rowKey="code" size="small" loading={loading} dataSource={definitions}
          pagination={false} scroll={{ x: 1440, y: 'calc(100vh - 210px)' }}
          locale={{ emptyText: <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="该病种暂无关联指标定义" /> }}
          columns={[
            { title: '指标名称', dataIndex: 'label', key: 'label', width: 160, fixed: 'left', render: display },
            { title: '指标编码', dataIndex: 'code', key: 'code', width: 130, render: display },
            { title: '单位', dataIndex: 'unit', key: 'unit', width: 90, render: display },
            {
              title: '数据类型', dataIndex: 'dataType', key: 'dataType', width: 100,
              render: (value?: number) => value === 1 ? '数值' : value === 2 ? '文本' : display(value),
            },
            {
              title: '录入要求', dataIndex: 'required', key: 'required', width: 100,
              render: (value?: boolean) => value ? <Tag color="red">必填</Tag> : <Tag>选填</Tag>,
            },
            {
              title: '多值', dataIndex: 'isMulti', key: 'isMulti', width: 80,
              render: (value?: boolean) => value ? <Tag color="blue">多值</Tag> : '单值',
            },
            {
              title: '指标来源', dataIndex: 'derived', key: 'derived', width: 110,
              render: (value?: boolean) => value ? <Tag color="purple">派生指标</Tag> : <Tag color="green">直接录入</Tag>,
            },
            {
              title: '指标字典', dataIndex: 'fromMetricDict', key: 'fromMetricDict', width: 110,
              render: (value?: boolean) => value ? <Tag color="cyan">字典关联</Tag> : <Tag>专病自定义</Tag>,
            },
            { title: '参考范围', dataIndex: 'refRangeText', key: 'refRangeText', width: 150, render: display },
            { title: '分组', dataIndex: 'group', key: 'group', width: 120, render: display },
            { title: '排序', dataIndex: 'sortOrder', key: 'sortOrder', width: 70, render: display },
          ]}
        />
      </div>
    </Drawer>
  )
}
