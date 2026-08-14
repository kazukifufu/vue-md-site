import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
  // --- ここから追加 ---
  build: {
    rollupOptions: {
      output: {
        // 動的インポート（記事コンポーネント等）で出力されるJSファイル名を英数字ハッシュ値のみに指定
        chunkFileNames: 'assets/chunk-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',

        // ファイル名から日本語（非ASCII文字）や不正な文字を取り除く安全処理
        sanitizeFileName(name) {
          const match = /^[a-z]:/i.test(name)
          const driveLetter = match ? name.slice(0, 2) : ''
          return (
            driveLetter +
            name
              .slice(driveLetter.length)
              .replace(/[^\x00-\x7F]/g, '') // 日本語などの全角文字を除去
              .replace(/[\x00-\x1F\x7F<>:"/\\|?*]/g, '')
              .trim()
          )
        }
      }
    }
  }
  // --- ここまで追加 ---
})