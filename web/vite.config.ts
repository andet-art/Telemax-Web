import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost/telemax', // ✅ root path of your PHP backend
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '/api'), // ✅ keeps /api in the path
      },
    },
  },
});
