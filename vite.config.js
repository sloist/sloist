import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    // SPA 라우팅: 모든 경로를 index.html로 폴백
    historyApiFallback: true,
  },
})
