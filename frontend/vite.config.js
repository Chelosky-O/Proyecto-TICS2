import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from 'tailwindcss';
import tailwindcssVite from '@tailwindcss/vite';

export default defineConfig({
  plugins: [
    react(),
    tailwindcssVite({ tailwindcss })   // 👈 habilita Tailwind
  ],
});
