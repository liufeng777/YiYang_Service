import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
// 统一字体：Noto Sans SC（本地打包，离线/内网环境可用，无需依赖 Google Fonts CDN）
import '@fontsource/noto-sans-sc/400.css'
import '@fontsource/noto-sans-sc/500.css'
import '@fontsource/noto-sans-sc/700.css'
import '@/styles/global.less'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
