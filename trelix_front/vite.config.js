import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    base: '/',
    plugins: [react(), tailwindcss()],
    server: {
      proxy: {
        '/api': {
          target: env.VITE_API_PROXY,
          changeOrigin: true,
          "/cdn-cgi/rum": false
        }
      }
    }
  };
});