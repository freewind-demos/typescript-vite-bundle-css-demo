// 引入 React server 渲染，避免浏览器环境依赖。
import { renderToStaticMarkup } from 'react-dom/server'
// 引入 Vitest 断言与测试函数。
import { expect, test } from 'vitest'
// 引入待验证页面。
import { App } from './App'

// 验证页面包含 CSS bundle 探针组件。
test('renders the css bundle probe component', () => {
  // 使用 inline snapshot 固化本 demo 的输出结构。
  expect(renderToStaticMarkup(<App />)).toMatchInlineSnapshot(
    `"<main class="container"><h1>Vite 组件 CSS 打包验证</h1><p>这个组件在自己的模块里 import CSS，build 后观察 dist 里的 JS、CSS、HTML。</p><section class="bundle-probe-card"><p class="bundle-probe-label">component scoped import</p><h2>BundleProbeCard.css</h2><p>这段样式只在组件模块中被 import，但 Vite 会把它纳入整站模块图。</p></section></main>"`,
  )
})
