# typescript-vite-bundle-css-demo

## 简介

这个 Demo 验证：React 组件在自己的模块里 `import './BundleProbeCard.css'` 时，Vite 打包会如何处理 CSS。

核心结论：CSS import 会进入 Vite 模块图。开发模式下由 Vite 注入到页面；生产构建默认抽取为 `dist/assets/*.css`，并在 `dist/index.html` 里通过 `<link rel="stylesheet">` 引用。

## 快速开始

### 环境要求

需要 Node.js 与 pnpm。

### 运行

```bash
pnpm install
pnpm run dev
```

### 构建并检查 CSS 产物

```bash
pnpm run build
pnpm run inspect:dist
```

期望输出类似：

```json
{
  "htmlLinksCss": true,
  "cssAssets": ["index-xxxx.css"],
  "jsAssets": ["index-xxxx.js"],
  "componentCssExtracted": true,
  "jsDoesNotContainRawCss": true
}
```

## 注意事项

这个 Demo 验证的是 Vite 默认 app build 行为。若改成 library mode、关闭 `build.cssCodeSplit`、或把组件改成动态 import，CSS 产物拆分策略会变化。

## 教程

1. `src/components/BundleProbeCard.tsx` 只负责声明组件，并在组件模块顶部 import `./BundleProbeCard.css`。
2. `src/App.tsx` 只 import 组件，不直接 import 组件 CSS。
3. `pnpm run build` 后，Vite 从 `src/main.tsx` 开始追踪完整模块图，发现组件依赖 CSS。
4. Vite 生产构建把 CSS 从 JS 模块图里抽取出来，写入 `dist/assets/*.css`。
5. `scripts/inspect-dist.mjs` 检查三个事实：HTML 引用了 CSS asset；CSS asset 里有组件 class；JS asset 里没有原始 CSS 文本。
