/**
 * 登录页左侧品牌面板
 * 设计稿：深绿渐变底 + 品牌标识 + 口号 + 特性卡片 + 装饰圆
 */
import { PlusOutlined, ApartmentOutlined, RetweetOutlined, SafetyCertificateOutlined } from '@ant-design/icons'
import type { ReactNode } from 'react'

interface Feature {
  icon: ReactNode
  title: string
  desc: string
}

const features: Feature[] = [
  { icon: <ApartmentOutlined />, title: '多机构协同', desc: '按机构、岗位与数据范围精确授权' },
  { icon: <RetweetOutlined />, title: '慢病闭环管理', desc: '专病档案、目标、方案和随访连续管理' },
  { icon: <SafetyCertificateOutlined />, title: '数据安全留痕', desc: '敏感健康数据分级授权，全程可追溯' },
]

export default function BrandPanel() {
  return (
    <div className="login-brand">
      <div className="login-brand__deco login-brand__deco--tr" />
      <div className="login-brand__deco login-brand__deco--bl" />

      <div className="login-brand__header">
        <span className="login-brand__logo">
          <PlusOutlined />
        </span>
        <div className="login-brand__name-wrap">
          <div className="login-brand__name">幸福颐养</div>
          <div className="login-brand__slogan">AI数字化医养服务平台</div>
        </div>
      </div>

      <h1 className="login-brand__headline">
        让专业服务更协同，
        <br />
        让健康管理更连续
      </h1>
      <p className="login-brand__desc">
        以健康档案为基础，连接多机构、专业人员、管理目标、
        <br />
        健康方案与服务履约，形成可追溯的医养协同闭环。
      </p>

      <div className="login-brand__features">
        {features.map((item) => (
          <div key={item.title} className="login-brand__feature">
            <span className="login-brand__feature-icon">{item.icon}</span>
            <div className="login-brand__feature-title">{item.title}</div>
            <div className="login-brand__feature-desc">{item.desc}</div>
          </div>
        ))}
      </div>

      <div className="login-brand__footer">© 2026 幸福颐养 · 数据安全与隐私保护</div>
    </div>
  )
}
