// 引入 React 插件，让 Vite 能处理 TSX 与 React fast refresh。
import react from '@vitejs/plugin-react'
// 引入 Vite config helper，保留类型提示。
import { defineConfig } from 'vite'

// 导出最小配置，只保留本 demo 必需的 React 插件。
export default defineConfig({
  // 注册 React 插件，避免无关配置干扰 CSS bundle 观察。
  plugins: [react()],
})
