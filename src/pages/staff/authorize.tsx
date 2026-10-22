/**
 * 人员管理 - 配置服务授权（设计稿：2.服务授权/完整项目多选.png）
 * 选择人员可以承接的服务项目，保存后提交审核
 * TODO: 服务授权保存/审核接口 API v0.1 未单列，待后端补充
 */
import { useMemo, useState } from 'react'
import { Button, Input, message } from 'antd'
import { CheckSquareFilled } from '@ant-design/icons'
import { useNavigate, useParams } from 'react-router-dom'
import PageContainer from '@/components/PageContainer'
import { mockAuthorize as a } from './mock'
import './index.less'

export default function StaffAuthorize() {
  const navigate = useNavigate()
  const { id } = useParams()
  const [keyword, setKeyword] = useState('')
  const [category, setCategory] = useState('全部')
  const [selected, setSelected] = useState<string[]>(a.defaultSelected)

  const items = useMemo(
    () =>
      a.items.filter((it) => {
        if (category !== '全部' && it.category !== category) return false
        if (keyword && !it.name.includes(keyword)) return false
        return true
      }),
    [keyword, category],
  )

  const selectedItems = a.items.filter((it) => selected.includes(it.id))

  const toggleItem = (itemId: string, mismatch?: boolean) => {
    if (mismatch) {
      message.warning('该项目所需角色与人员角色不匹配，不可授权')
      return
    }
    setSelected((list) =>
      list.includes(itemId) ? list.filter((x) => x !== itemId) : [...list, itemId],
    )
  }

  const onSubmit = () => {
    if (selected.length === 0) {
      message.warning('请至少选择 1 个授权服务项目')
      return
    }
    // TODO: 待后端补充服务授权接口；保存后生成授权审核记录
    message.success(`已保存并提交审核（${id}），共 ${selected.length} 项授权（演示）`)
    navigate(`/staff/${id}`)
  }

  return (
    <div className="staff-page">
      <PageContainer
        title="配置服务授权"
        description={`选择${a.staff.name}可以承接的服务项目，保存后提交审核`}
        extra={<Button onClick={() => navigate(`/staff/${id}`)}>返回服务授权</Button>}
      >
        {/* 人员头卡 */}
        <div className="staff-card staff-profile">
          <div className="staff-profile__main">
            <div className="staff-profile__avatar">{a.staff.name[0]}</div>
            <div>
              <div className="staff-profile__name">{a.staff.name}</div>
              <div className="staff-profile__meta">{a.staff.roleOrg}</div>
            </div>
            <span className="status-tag status-tag--orange">{a.staff.tag}</span>
          </div>
          <div className="staff-profile__side">
            <div className="staff-profile__cell">
              <div className="staff-profile__cell-label">可选范围</div>
              <div className="staff-profile__cell-value">{a.scope}</div>
              <div className="staff-profile__cell-note">{a.scopeNote}</div>
            </div>
          </div>
        </div>

        {/* 搜索与分类 */}
        <div className="staff-card staff-auth-filter">
          <Input
            placeholder="搜索服务项目名称"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value.trim())}
            allowClear
            style={{ maxWidth: 320 }}
          />
          {a.categories.map((c) => (
            <Button
              key={c}
              type={category === c ? 'primary' : 'default'}
              onClick={() => setCategory(c)}
            >
              {c}
            </Button>
          ))}
        </div>

        {/* 项目选择区 */}
        <div className="staff-auth-layout">
          <div className="staff-card">
            <div className="staff-card__header">
              <div className="staff-card__title">可授权服务项目</div>
              <span className="staff-text--muted">
                共 {a.total} 项 · 已选择 {selected.length} 项
              </span>
            </div>
            <div className="staff-service-grid">
              {items.map((it) => {
                const checked = selected.includes(it.id)
                return (
                  <div
                    key={it.id}
                    className={`staff-service-item${checked ? ' staff-service-item--checked' : ''}${
                      it.roleMismatch ? ' staff-service-item--disabled' : ''
                    }`}
                    onClick={() => toggleItem(it.id, it.roleMismatch)}
                  >
                    <div className="staff-service-item__head">
                      {checked ? (
                        <CheckSquareFilled className="staff-service-item__check" />
                      ) : (
                        <span className="staff-service-item__box" />
                      )}
                      <span className="staff-service-item__name">{it.name}</span>
                      {it.roleMismatch && (
                        <span className="status-tag status-tag--orange">角色不匹配</span>
                      )}
                    </div>
                    <div className="staff-service-item__meta">{it.meta}</div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* 右栏：已选与校验 */}
          <div className="staff-auth-rail">
            <div className="staff-card">
              <div className="staff-card__title">已选择 {selected.length} 项</div>
              <div className="staff-auth-selected">
                {selectedItems.map((it) => (
                  <div key={it.id} className="staff-auth-selected__item">
                    <span>{it.name}</span>
                    <span
                      className="staff-text--link"
                      onClick={() => setSelected((l) => l.filter((x) => x !== it.id))}
                    >
                      移除
                    </span>
                  </div>
                ))}
              </div>
              <div className="staff-auth-verify">
                <div className="staff-auth-verify__title">人员角色校验</div>
                <div className="staff-auth-verify__row">
                  护士角色符合已选 {selected.length} 个项目要求
                </div>
                <div className="staff-auth-verify__row staff-auth-verify__row--warn">
                  {a.credentialStatus}
                </div>
              </div>
              <div className="staff-note">{a.note}</div>
            </div>
          </div>
        </div>

        {/* 底部操作 */}
        <div className="staff-card staff-auth-footer">
          <span className="staff-text--muted">{a.footerNote}</span>
          <div className="staff-detail__actions">
            <Button onClick={() => navigate(`/staff/${id}`)}>取消</Button>
            <Button type="primary" onClick={onSubmit}>
              保存并提交审核
            </Button>
          </div>
        </div>
      </PageContainer>
    </div>
  )
}
