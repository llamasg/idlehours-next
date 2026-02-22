import {defineConfig} from 'vite'

export default defineConfig({
  base: '/studio/',
  build: {
    outDir: 'dist',
  },
  server: {
    proxy: {
      '/igdb': {
        target: 'https://api.igdb.com/v4',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/igdb/, ''),
      },
    },
  },
})
