// 引入文件系统 promise API，用于读取 library 构建产物。
import { readdir, readFile } from 'node:fs/promises'

// 声明两个 library build 输出目录。
const builds = [
  // 默认分离 CSS 的构建目录。
  ['split', new URL('../dist-lib-split/', import.meta.url)],
  // JS 注入 CSS 的构建目录。
  ['injected', new URL('../dist-lib-injected/', import.meta.url)],
]

// 读取文本文件，统一 utf8。
const readText = async (url) => readFile(url, 'utf8')

// 分析单个输出目录。
const inspectBuild = async ([name, dir]) => {
  // 读取输出目录文件名。
  const files = (await readdir(dir)).toSorted()
  // 筛出 CSS 文件。
  const cssFiles = files.filter((file) => file.endsWith('.css'))
  // 筛出 JS 文件。
  const jsFiles = files.filter((file) => file.endsWith('.js'))
  // 读取全部 JS 内容。
  const jsText = await Promise.all(jsFiles.map((file) => readText(new URL(file, dir))))
  // 返回关键事实。
  return {
    // 构建名称。
    name,
    // 输出文件列表。
    files,
    // 是否存在单独 CSS 文件。
    hasCssFile: cssFiles.length > 0,
    // JS 是否包含组件 CSS class。
    jsContainsComponentCss: jsText.some((text) => text.includes('.bundle-probe-card')),
    // JS 是否包含 style 注入逻辑。
    jsInjectsStyleTag: jsText.some((text) => text.includes('document.createElement("style")')),
  }
}

// 并行分析两个构建目录。
const report = await Promise.all(builds.map(inspectBuild))

// 输出 JSON，直接对比默认分离与单文件注入。
console.log(JSON.stringify(report, null, 2))
