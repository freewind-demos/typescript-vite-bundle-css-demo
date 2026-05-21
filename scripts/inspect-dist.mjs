// 引入文件系统 promise API，用于读取构建产物。
import { readdir, readFile } from 'node:fs/promises'
// 引入 path join，拼接 asset 文件路径。
import { join } from 'node:path'

// 定位 dist 目录，脚本要求先执行 pnpm run build。
const distDir = new URL('../dist/', import.meta.url)
// 定位 Vite 默认 asset 输出目录。
const assetsDir = new URL('./assets/', distDir)

// 读取文本文件，统一 utf8。
const readText = async (url) => readFile(url, 'utf8')

// 列出目录文件名，并排序保证输出稳定。
const listFiles = async (url) => {
  // 读取目录内所有文件名。
  const names = await readdir(url)
  // 返回排序后的文件名，便于 snapshot 或人工对比。
  return names.toSorted()
}

// 获取 assets 下所有产物文件名。
const assetNames = await listFiles(assetsDir)
// 读取构建后的入口 HTML。
const html = await readText(new URL('./index.html', distDir))
// 筛出 CSS asset。
const cssAssets = assetNames.filter((name) => name.endsWith('.css'))
// 筛出 JS asset。
const jsAssets = assetNames.filter((name) => name.endsWith('.js'))
// 读取全部 CSS 内容，用于查找组件 class。
const cssText = await Promise.all(cssAssets.map((name) => readText(join(assetsDir.pathname, name))))
// 读取全部 JS 内容，用于确认原始 CSS 没留在 JS 文本中。
const jsText = await Promise.all(jsAssets.map((name) => readText(join(assetsDir.pathname, name))))

// 生成最小报告，直接回答 CSS bundle 行为。
const report = {
  // HTML 是否通过 link 标签引用 CSS asset。
  htmlLinksCss: html.includes('rel="stylesheet"'),
  // 构建出的 CSS 文件列表。
  cssAssets,
  // 构建出的 JS 文件列表。
  jsAssets,
  // 组件 CSS class 是否被抽取到 CSS asset。
  componentCssExtracted: cssText.some((text) => text.includes('.bundle-probe-card')),
  // JS asset 是否不包含原始 CSS 文本。
  jsDoesNotContainRawCss: jsText.every((text) => !text.includes('.bundle-probe-card')),
}

// 输出 JSON，方便人读，也方便工具继续处理。
console.log(JSON.stringify(report, null, 2))
