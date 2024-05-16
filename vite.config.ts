import { svelte } from '@sveltejs/vite-plugin-svelte'
import path from 'path'
import { defineConfig } from 'vite'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [svelte()],
  base: '/survis2/',
  resolve: {
    alias: {
      $lib: path.resolve('./src/lib'),
    },
  },
})
