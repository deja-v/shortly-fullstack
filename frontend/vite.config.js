import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import {  loadEnv } from 'vite'
// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    define: {
      'process.env.SOME_KEY': JSON.stringify(env.SOME_KEY)
    },
    plugins: [react()],
    // server: {
    //   proxy: {
    //     '/api': 'http://localhost:8000',
    //   },
    // },
  }
})
