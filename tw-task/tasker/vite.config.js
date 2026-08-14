import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import { resolve } from 'path'

export default defineConfig({
  plugins: [tailwindcss()],
  build: {
    outDir: 'dist',
    minify: true,
    rollupOptions: {
      input: {
        main:     resolve(__dirname, 'index.html'),
        calendar: resolve(__dirname, 'src/pages/calendar.html'),
        tasks:    resolve(__dirname, 'src/pages/tasks.html'),
        profile:  resolve(__dirname, 'src/pages/profile.html'),
      },
    },
  },
  server: {
    port: 3000,
    open: true,
  },
})
