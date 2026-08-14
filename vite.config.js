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
        main: resolve(__dirname, 'index.html'),
        shop: resolve(__dirname, 'shop.html'),
        product: resolve(__dirname, 'product.html'),
        checkout: resolve(__dirname, 'checkout.html'),
        landing: resolve(__dirname, 'landing.html'),
        dashboard: resolve(__dirname, 'dashboard.html'),
        uikit: resolve(__dirname, 'uikit.html'),
        compare: resolve(__dirname, 'compare.html'),
        rfq: resolve(__dirname, 'rfq.html'),
        warranty: resolve(__dirname, 'warranty.html'),
        returns: resolve(__dirname, 'returns.html'),
        brands: resolve(__dirname, 'brands.html'),
      },
    },
  },
  server: {
    port: 3010,
    strictPort: false,
    open: true,
    watch: {
      ignored: ['**/tw-task/**', '**/node_modules/**', '**/dist/**'],
    },
  },
  publicDir: 'public',
})
