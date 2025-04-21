import { defineConfig, externalizeDepsPlugin } from 'electron-vite';
import * as react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { resolve } from 'path';

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin()],
    root: 'src/main',
    resolve: {
      alias: {
        '@shared': resolve('src/shared'),
        '@main': resolve('src/main'),
        '@preload': resolve('src/preload'),
        '@': resolve('src/preload'),
      },
    },
  },
  preload: {
    root: 'src/preload',
    plugins: [externalizeDepsPlugin()],
    resolve: {
      alias: {
        '@': resolve('src/preload'),
        '@preload': resolve('src/preload'),
        '@shared': resolve('src/shared'),
      },
    },
  },
  renderer: {
    root: 'src/renderer',
    assetsInclude: 'src/renderer/assets',
    resolve: {
      alias: {
        '@': resolve('src/renderer/src'),
        '@renderer': resolve('src/renderer/src'),
        '@/components': resolve('src/renderer/src/components'),
        '@/hooks': resolve('src/renderer/src/hooks'),
        '@/store': resolve('src/renderer/src/store'),
        '@/lib': resolve('src/renderer/src/lib'),
        '@/locales': resolve('src/renderer/src/locales'),
      },
    },
    plugins: [react(), tailwindcss()],
  },
});
