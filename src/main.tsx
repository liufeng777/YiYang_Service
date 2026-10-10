import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
// 统一字体：Noto Sans SC（在线引用 Google Fonts CDN，见 index.html）
import '@/styles/global.less'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
