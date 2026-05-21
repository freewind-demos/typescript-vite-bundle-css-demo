// 引入 Pico 基础样式，模拟真实 app 中的全局 CSS。
import '@picocss/pico/css/pico.min.css'
// 引入 React 核心运行时。
import React from 'react'
// 引入 React DOM client API，用于挂载根组件。
import ReactDOM from 'react-dom/client'
// 引入 demo 根组件。
import { App } from './App'

// 获取 HTML 中的 React 挂载点。
const rootElement = document.getElementById('root')

// 缺少挂载点时直接失败，避免静默空白页。
if (!rootElement) {
  // 抛出明确错误，方便定位 index.html 是否异常。
  throw new Error('Missing #root element')
}

// 创建 React 根并渲染 App。
ReactDOM.createRoot(rootElement).render(
  // StrictMode 保留 React dev 检查。
  <React.StrictMode>
    {/* 渲染 CSS bundle 验证页面。 */}
    <App />
  </React.StrictMode>,
)
