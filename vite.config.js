import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

const headers = { 'X-Robots-Tag': 'noindex, nofollow' };

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: { headers },
  preview: { headers },
});
