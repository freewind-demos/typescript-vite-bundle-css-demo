// 引入 FC 类型，保持组件声明风格一致。
import type { FC } from 'react'
// 在组件模块内引入 CSS，这是本 demo 的核心观察点。
import './BundleProbeCard.css'

// 组件本身不暴露任何 CSS API，只通过模块 import 建立 CSS 依赖。
export const BundleProbeCard: FC = () => {
  // 返回带专属 class 的 DOM，便于构建后查找 CSS 是否被抽取。
  return (
    // class 名会出现在 CSS asset 中，用作 inspect 脚本断言。
    <section className="bundle-probe-card">
      {/* 标签用于肉眼确认组件样式已生效。 */}
      <p className="bundle-probe-label">component scoped import</p>
      {/* 标题显示 CSS 文件名，明确依赖来源。 */}
      <h2>BundleProbeCard.css</h2>
      {/* 说明 CSS import 进入 Vite 模块图，而非组件运行时局部处理。 */}
      <p>这段样式只在组件模块中被 import，但 Vite 会把它纳入整站模块图。</p>
    </section>
  )
}
