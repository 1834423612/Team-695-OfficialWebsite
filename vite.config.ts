import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import Icons from 'unplugin-icons/vite'
import IconsResolver from 'unplugin-icons/resolver'
import Components from 'unplugin-vue-components/vite'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    Components({
      resolvers: [
        IconsResolver(),
      ]
    }),
    Icons({ autoInstall: true }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    }
  },
  build: {
    // 代码分割优化
    rollupOptions: {
      output: {
        manualChunks: {
          // 将Vue核心库分离
          'vue-vendor': ['vue', 'vue-router', 'pinia'],
          // 将UI组件库分离
          'ui-vendor': ['@iconify/vue', '@headlessui/vue', '@heroicons/vue'],
          // 将大型库分离
          'chart-vendor': ['chart.js', 'vue-chartjs'],
          // 其他工具库
          'utils': ['axios', 'lodash', 'js-cookie']
        },
        // 优化chunk文件名
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: 'assets/[ext]/[name]-[hash].[ext]'
      }
    },
    // 增加chunk大小警告阈值
    chunkSizeWarningLimit: 1000,
    // 启用CSS代码分割
    cssCodeSplit: true,
    // 生成source map用于生产环境调试（可选）
    sourcemap: false,
    // 使用esbuild进行压缩（更快）
    minify: 'esbuild'
  },
  // 优化依赖预构建
  optimizeDeps: {
    include: [
      'vue',
      'vue-router',
      'pinia',
      'axios',
      '@iconify/vue'
    ],
    exclude: [
      // 排除不需要预构建的包
    ]
  },
  server: {
    host: true,
    open: true,
    proxy: {
      '/api/sso': {
        target: 'https://sso.team695.com',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/api\/sso/, ''),
        headers: {
          'Referer': 'https://sso.team695.com'
        }
      }
    }
  }
})
