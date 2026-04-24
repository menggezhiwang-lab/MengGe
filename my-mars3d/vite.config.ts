import { defineConfig } from "vite"
import react from '@vitejs/plugin-react'
import { mars3dPlugin } from "vite-plugin-mars3d"

export default defineConfig({
  plugins: [react(),mars3dPlugin()],
  base: './',
  server: {
    proxy: {
      '/tdt-proxy': {
        target: 'https://t0.tianditu.gov.cn',
        changeOrigin: true,
        // 关键修改：只去掉 '/tdt-proxy' 前缀，保留后面的 '/vec_w/wmts...'
        rewrite: (path) => path.replace(/^\/tdt-proxy/, '')
      }
    }
  }
})