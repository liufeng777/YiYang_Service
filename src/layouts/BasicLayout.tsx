/**
 * 基础布局：侧边栏 + 顶部导航 + 内容区
 */
import { Layout } from 'antd'
import { Outlet, useLocation } from 'react-router-dom'
import SiderMenu from './SiderMenu'
import HeaderBar from './HeaderBar'
import NoApiNotice from '@/components/NoApiNotice'
import { useAppStore } from '@/store/modules/app'
import './layout.less'

const { Sider, Content } = Layout

/**
 * 接口尚未提供的页面路由前缀（命中即在内容区顶部展示「暂未对接接口」提示）
 * 注意：仅收录无接口的页面/子页面，已对接的列表页（如 /staff、/followup）不在此列
 */
const NO_API_PREFIXES = [
  // 整个模块无接口
  '/assess',
  '/team',
  '/role',
  // 健康档案子页面（列表 /health 已对接）
  '/health/import',
  '/health/profile',
  '/health/disease',
  '/health/assign',
  '/health/risk-level',
  '/health/risk-change',
  // 随访子页面（列表已对接；创建/执行为问卷向导，接口待补充）
  '/followup/create',
  // 人员管理子页面（列表/新增/详情已对接）
  '/staff/credentials',
  '/staff/qualification',
  '/staff/audit',
  '/staff/authorize',
  '/staff/credential-upload',
  // 线索子页面（列表已对接；编辑/实名/转化页待联调）
  '/leads/edit',
  '/leads/verify',
  '/leads/convert-success',
]

/** 随访执行页路径形如 /followup/123/execute */
const NO_API_PATTERNS = [/^\/followup\/\d+\/execute/]

function isNoApiPage(pathname: string) {
  if (NO_API_PATTERNS.some((re) => re.test(pathname))) return true
  return NO_API_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`))
}

export default function BasicLayout() {
  const collapsed = useAppStore((state) => state.collapsed)
  const { pathname } = useLocation()
  return (
    <Layout className="basic-layout">
      <Sider
        width={220}
        collapsedWidth={64}
        collapsed={collapsed}
        collapsible
        trigger={null}
        className="basic-layout__sider"
      >
        <div className="basic-layout__logo">
          {collapsed ? (
            <span className="basic-layout__logo-title">颐养</span>
          ) : (
            <>
              <span className="basic-layout__logo-title">幸福颐养</span>
              <span className="basic-layout__logo-sub">医养服务工作台</span>
            </>
          )}
        </div>
        <SiderMenu />
      </Sider>
      <Layout className="basic-layout__main">
        <HeaderBar />
        <Content className="basic-layout__content">
          {isNoApiPage(pathname) && <NoApiNotice />}
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  )
}
