/**
 * 角色管理 - 新建角色 / 目录权限配置（设计稿：14.角色管理/目录权限配置.png）
 * 由系统管理员统一配置，供全系统所有机构使用；待办和数据范围由系统规则默认生成
 * TODO: 角色管理接口 API v0.1 未定义（运营后台域），待后端补充
 */
import { useState } from 'react'
import { Button, Checkbox, Input, message } from 'antd'
import { useNavigate } from 'react-router-dom'
import PageContainer from '@/components/PageContainer'
import { mockRoleCreate as c } from './mock'
import './index.less'

export default function RoleCreate() {
  const navigate = useNavigate()
  const [step, setStep] = useState(2)
  const [name, setName] = useState(c.defaultName)
  const [code, setCode] = useState(c.defaultCode)
  const [status, setStatus] = useState('启用')
  const [catalogs, setCatalogs] = useState<string[]>(
    c.catalogs.filter((x) => x.checked).map((x) => x.key),
  )

  const toggleCatalog = (key: string) =>
    setCatalogs((l) => (l.includes(key) ? l.filter((x) => x !== key) : [...l, key]))

  const onSave = (draft: boolean) => {
    if (!name.trim()) {
      message.warning('请填写角色名称')
      return
    }
    if (catalogs.length === 0) {
      message.warning('请至少勾选 1 个工作台目录')
      return
    }
    // TODO: 角色保存接口待后端补充；保存后对选择该角色的人员统一生效并记录操作日志
    message.success(draft ? '草稿已保存' : '角色已保存并统一生效（演示）')
    if (!draft) navigate('/role')
  }

  return (
    <div className="role-page">
      <PageContainer
        title="新建角色"
        description="由系统管理员统一配置，供全系统所有机构使用；待办和数据范围由系统规则默认生成。"
      >
        {/* 步骤条 */}
        <div className="role-card">
          <div className="role-steps">
            {c.steps.map((s, i) => (
              <div
                key={s}
                className={`role-steps__item${step === i + 1 ? ' role-steps__item--active' : ''}${
                  step > i + 1 ? ' role-steps__item--done' : ''
                }`}
                onClick={() => setStep(i + 1)}
              >
                <span className="role-steps__no">{i + 1}</span>
                {s}
              </div>
            ))}
          </div>
        </div>

        <div className="role-create">
          {/* 左：基本信息 + 目录权限 + 默认规则 */}
          <div className="role-card">
            <div className="role-section__title">角色基本信息</div>
            <div className="role-form__grid">
              <div className="role-field">
                <div className="role-field__label">
                  角色名称 <span className="role-required">*</span>
                </div>
                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="请输入角色名称" />
              </div>
              <div className="role-field">
                <div className="role-field__label">角色来源</div>
                <Input value={c.source} disabled />
              </div>
              <div className="role-field">
                <div className="role-field__label">角色编码</div>
                <Input value={code} onChange={(e) => setCode(e.target.value)} placeholder="如 CHRONIC_MANAGER" />
              </div>
              <div className="role-field">
                <div className="role-field__label">角色状态</div>
                <Input value={status} onChange={(e) => setStatus(e.target.value)} />
              </div>
              <div className="role-field">
                <div className="role-field__label">创建日期</div>
                <Input value={c.createdAt} disabled />
              </div>
            </div>

            <div className="role-section__title">目录与操作权限</div>
            <div className="role-field__label">{c.catalogLabel}</div>
            <div className="role-catalogs">
              {c.catalogs.map((cat) => (
                <Checkbox
                  key={cat.key}
                  checked={catalogs.includes(cat.key)}
                  onChange={() => toggleCatalog(cat.key)}
                >
                  {cat.label}
                </Checkbox>
              ))}
            </div>
            <div className="role-note role-note--green">{c.catalogNote}</div>

            <div className="role-section__title">系统默认规则（只读）</div>
            <div className="role-form__grid role-form__grid--2">
              {c.defaultRules.map((r) => (
                <div key={r.label} className="role-field">
                  <div className="role-field__label">{r.label}</div>
                  <Input value={r.value} disabled />
                </div>
              ))}
            </div>
          </div>

          {/* 右：操作权限 */}
          <div className="role-card role-create__rail">
            <div className="role-section__title">操作权限</div>
            <div className="role-card__sub">{c.opNote}</div>
            {c.operations.map((op) => (
              <div key={op.key} className="role-op">
                <div>
                  <div className="role-op__name">{op.name}</div>
                  <div className={`role-op__state role-op__state--${op.stateTone}`}>{op.state}</div>
                </div>
                <Button onClick={() => message.success(`配置「${op.name}」权限（演示）`)}>
                  设置
                </Button>
              </div>
            ))}
            <div className="role-note role-note--warn">{c.opTip}</div>
          </div>
        </div>

        {/* 底部操作 */}
        <div className="role-create__actions">
          <Button onClick={() => navigate('/role')}>取消</Button>
          <Button onClick={() => onSave(true)}>保存草稿</Button>
          <Button type="primary" onClick={() => onSave(false)}>
            保存角色
          </Button>
        </div>
      </PageContainer>
    </div>
  )
}
