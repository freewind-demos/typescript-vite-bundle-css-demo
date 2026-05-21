// 引入 React 插件，让 library build 支持 TSX。
import react from '@vitejs/plugin-react'
// 引入文件系统 API，用于产物写出后合并 CSS。
import { readdir, readFile, rm, writeFile } from 'node:fs/promises'
// 引入 Node path helper，生成稳定入口路径。
import { join, resolve } from 'node:path'
// 引入 Vite 类型与 config helper。
import { defineConfig, type Plugin } from 'vite'

// 将 CSS 文本转成可安全放入 JS 字符串的源码片段。
const toJsString = (value: string) => JSON.stringify(value)

// 创建最小 CSS 注入插件：把 CSS asset 删除，并把注入逻辑 prepend 到 JS。
const injectCssIntoJs = (): Plugin => {
  // 返回 Vite/Rollup 插件对象。
  return {
    // 插件名用于构建日志与调试。
    name: 'demo-inject-css-into-js',
    // 在文件写出后处理，避开 Vite 内部 CSS asset 生成顺序。
    async writeBundle(options) {
      // 获取最终输出目录。
      const outputDir = options.dir
      // 没有输出目录时无法处理。
      if (!outputDir) {
        // 直接返回，保持构建不失败。
        return
      }
      // 读取输出目录文件。
      const files = await readdir(outputDir)
      // 找出 CSS 文件。
      const cssFiles = files.filter((file) => file.endsWith('.css'))
      // 找出 JS 文件。
      const jsFiles = files.filter((file) => file.endsWith('.js'))
      // 读取并拼接全部 CSS。
      const cssText = (
        await Promise.all(cssFiles.map((file) => readFile(join(outputDir, file), 'utf8')))
      ).join('\n')
      // 没有 CSS 时不改 JS。
      if (!cssText) {
        // 提前返回，避免注入空 style。
        return
      }
      // 生成浏览器端 style 注入代码。
      const injectCode = `const css=${toJsString(cssText)};if(typeof document!=="undefined"&&!document.querySelector("style[data-bundle-css-demo]")){const style=document.createElement("style");style.dataset.bundleCssDemo="";style.textContent=css;document.head.appendChild(style);}\n`
      // 把 CSS 注入逻辑写进每个 JS 文件顶部。
      await Promise.all(
        jsFiles.map(async (file) => {
          // 拼出 JS 文件路径。
          const jsPath = join(outputDir, file)
          // 读取原 JS 内容。
          const jsCode = await readFile(jsPath, 'utf8')
          // 写回带 style 注入逻辑的 JS。
          await writeFile(jsPath, injectCode + jsCode)
        }),
      )
      // 删除 CSS 文件，让发布目录只剩 JS。
      await Promise.all(cssFiles.map((file) => rm(join(outputDir, file))))
    },
  }
}

// 导出注入版 library build：只发布 JS 文件。
export default defineConfig({
  // React 插件先处理 TSX，自定义插件后处理产物。
  plugins: [react(), injectCssIntoJs()],
  // 配置库模式构建。
  build: {
    // 输出目录单独放置，便于与默认分离版对比。
    outDir: 'dist-lib-injected',
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
