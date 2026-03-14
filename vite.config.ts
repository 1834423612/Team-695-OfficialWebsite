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
    // Optimize code splitting
    rollupOptions: {
      output: {
        manualChunks: {
          // Split Vue core libraries
          'vue-vendor': ['vue', 'vue-router', 'pinia'],
          // Split UI component libraries
          'ui-vendor': ['@iconify/vue', '@headlessui/vue', '@heroicons/vue'],
          // Split large libraries
          'chart-vendor': ['chart.js', 'vue-chartjs'],
          // Other utility libraries
          'utils': ['axios', 'lodash', 'js-cookie']
        },
        // Optimize chunk filenames
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: 'assets/[ext]/[name]-[hash].[ext]'
      }
    },
    // Increase the chunk size warning threshold
    chunkSizeWarningLimit: 1000,
    // Enable CSS code splitting
    cssCodeSplit: true,
    // Generate source maps for production debugging (optional)
    sourcemap: false,
    // Use esbuild for minification (faster)
    minify: 'esbuild'
  },
  // Optimize dependency pre-bundling
  optimizeDeps: {
    include: [
      'vue',
      'vue-router',
      'pinia',
      'axios',
      '@iconify/vue'
    ],
    exclude: [
      // Exclude packages that do not need pre-bundling
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
