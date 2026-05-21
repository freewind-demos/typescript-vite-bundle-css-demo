// 引入 React 插件，让 library build 支持 TSX。
import react from '@vitejs/plugin-react'
// 引入 Node path helper，生成稳定入口路径。
import { resolve } from 'node:path'
// 引入 Vite config helper，保留配置类型提示。
import { defineConfig } from 'vite'

// 导出默认 library build：JS 与 CSS 分离输出。
export default defineConfig({
  // 注册 React 插件。
  plugins: [react()],
  // 配置库模式构建。
  build: {
    // 输出目录单独放置，便于与 app build 对比。
    outDir: 'dist-lib-split',
    // 每次构建前清空该输出目录。
    emptyOutDir: true,
    // 配置组件库入口与文件名。
    lib: {
      // 入口指向组件 public API。
      entry: resolve(__dirname, 'src/components/index.ts'),
      // 库名仅用于需要命名的格式。
      name: 'BundleCssDemo',
      // 只产出 ESM，更贴近现代组件库发布。
      formats: ['es'],
      // 固定 JS 文件名，方便 inspect。
      fileName: () => 'bundle-css-demo.js',
    },
    // React 作为 peer dependency，不打进组件库 JS。
    rollupOptions: {
      // 排除 React 运行时依赖。
      external: ['react', 'react/jsx-runtime'],
    },
  },
})
