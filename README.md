# typescript-vite-bundle-css-demo

## 简介

这个 Demo 验证：React 组件在自己的模块里 `import './BundleProbeCard.css'` 时，Vite 打包会如何处理 CSS。

核心结论：CSS import 会进入 Vite 模块图。开发模式下由 Vite 注入到页面；生产 app build 默认抽取为 `dist/assets/*.css`，并在 `dist/index.html` 里通过 `<link rel="stylesheet">` 引用。

发布组件库时，JS 与 CSS 分开发布是 Vite 官方默认行为。这样浏览器能并行加载、单独缓存 CSS，也避免 JS 执行后才出现样式。

如果想做到“用户只 import 组件 JS，CSS 自动生效”，可以把 CSS 注入 JS。本 demo 提供 `vite.lib.injected.config.ts`，构建后只输出一个 JS 文件，模块被 import 时自动创建 `<style>`。

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

### 对比组件库发布形态

```bash
pnpm run build:lib:css-file
pnpm run build:lib:css-in-js
pnpm run inspect:lib
```

期望输出类似：

```json
[
  {
    "name": "split",
    "files": ["bundle-css-demo.css", "bundle-css-demo.js"],
    "hasCssFile": true,
    "jsContainsComponentCss": false,
    "jsInjectsStyleTag": false
  },
  {
    "name": "injected",
    "files": ["bundle-css-demo.js"],
    "hasCssFile": false,
    "jsContainsComponentCss": true,
    "jsInjectsStyleTag": true
  }
]
```

`build:lib:css-file` 使用 `vite.lib.split.config.ts`，模拟 Vite 官方默认组件库发布方式：JS 文件旁边有一个 CSS 文件。

`build:lib:css-in-js` 使用 `vite.lib.injected.config.ts`，模拟单 JS 发布方式：构建后把 CSS 文本写进 JS 顶部，运行时创建 `<style>`。

## 注意事项

这个 Demo 同时验证 Vite 默认 app build、library build 默认分离 CSS、library build 注入 CSS 三种行为。

注入 CSS 到 JS 的代价：CSS 不能作为独立资源缓存；样式要等 JS 执行后才插入；SSR 或严格 CSP 场景需要额外处理。因此组件库默认分离 CSS 更常见；面向小组件、插件、低接入成本场景时，单 JS 更方便。

## 官方与插件

Vite 官方内置的是“组件库 CSS 单独产物”，不是“CSS 合并进 JS bundle”。

官方文档说明：library 如果 import CSS，会在 JS 文件旁边生成一个 CSS 文件，例如 `dist/my-lib.css`。官方建议在 `package.json` 里导出它：

```json
{
  "exports": {
    ".": {
      "import": "./dist/my-lib.js"
    },
    "./style.css": "./dist/my-lib.css"
  }
}
```

用户侧写：

```ts
import { SomeComponent } from 'my-lib'
import 'my-lib/style.css'
```

如果要“只 import JS，CSS 自动生效”，Vite 没有官方内置选项。常用社区插件：

1. `vite-plugin-css-injected-by-js`

   作用：把 CSS 加到 JS，运行时插入页面。适合想发布单个 JS 文件的小组件、widget、低接入成本场景。

   ```bash
   pnpm add -D vite-plugin-css-injected-by-js
   ```

2. `vite-plugin-lib-inject-css`

   作用：lib mode 多入口时，在 chunk 顶部自动加 CSS import。它解决“用户 import 某个组件时，对应 CSS import 也跟着进入模块图”，但通常仍然保留 CSS 文件，不等于把 CSS 文本塞进 JS。

   ```bash
   pnpm add -D vite-plugin-lib-inject-css
   ```

3. `vite-plugin-libcss`

   作用：通过 JS 里的 CSS import 语句把样式关联到 bundle。它更偏“自动关联 CSS”，不一定等价于单 JS style 注入。

   ```bash
   pnpm add -D vite-plugin-libcss
   ```

本 demo 的 `vite.lib.injected.config.ts` 是教学版后处理插件，用来说明原理。真实项目不要每次手写，优先用社区插件；只有插件行为不符合发布约束时再自写。

## 教程

1. `src/components/BundleProbeCard.tsx` 只负责声明组件，并在组件模块顶部 import `./BundleProbeCard.css`。
2. `src/App.tsx` 只 import 组件，不直接 import 组件 CSS。
3. `pnpm run build` 后，Vite 从 `src/main.tsx` 开始追踪完整模块图，发现组件依赖 CSS。
4. Vite 生产构建把 CSS 从 JS 模块图里抽取出来，写入 `dist/assets/*.css`。
5. `scripts/inspect-dist.mjs` 检查三个事实：HTML 引用了 CSS asset；CSS asset 里有组件 class；JS asset 里没有原始 CSS 文本。
6. `vite.lib.split.config.ts` 模拟组件库默认发布：产出 `bundle-css-demo.js` 与 `bundle-css-demo.css`。
7. `vite.lib.injected.config.ts` 用 `writeBundle` 读取 CSS asset，删除 CSS 文件，再把创建 `<style>` 的代码写进 JS 顶部。
8. `scripts/inspect-lib.mjs` 对比两个 library build，证明单文件发布可以做到，但需要显式构建策略。
