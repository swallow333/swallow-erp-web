import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue(), vueDevTools()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },

  // 开发服务器配置
  server: {
    port: 5173,
    host: '0.0.0.0', // 允许局域网访问
    open: true, // 自动打开浏览器

    // 代理配置
    proxy: {
      // 方式1：简单代理（推荐）
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },

      // 方式2：如果需要多个代理
      // '/auth': {
      //     target: 'http://localhost:8080',
      //     changeOrigin: true
      // },
      // '/users': {
      //     target: 'http://localhost:8080',
      //     changeOrigin: true
      // }
    },
  },
})
