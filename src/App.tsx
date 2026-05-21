// 引入 FC 类型，按项目约定声明 React 组件。
import type { FC } from 'react'
// 引入自带 CSS import 的组件，App 不直接 import 该组件 CSS。
import { BundleProbeCard } from './components/BundleProbeCard'

// App 只组合页面结构，用来观察下层组件 CSS 是否被 Vite 追踪。
export const App: FC = () => {
  // 返回可视页面，构建后检查 CSS 产物。
  return (
    // 使用 Pico container 控制页面宽度。
    <main className="container">
      {/* 标题说明本 demo 的验证目标。 */}
      <h1>Vite 组件 CSS 打包验证</h1>
      {/* 文案提示读者查看 dist 中的 HTML、JS、CSS。 */}
      <p>这个组件在自己的模块里 import CSS，build 后观察 dist 里的 JS、CSS、HTML。</p>
      {/* 这里仅引用组件，不直接引用组件 CSS。 */}
      <BundleProbeCard />
    </main>
  )
}
