import { defineConfig } from 'electron-vite';
import react from '@vitejs/plugin-react';
import path from 'path';

const resolve = (p: string) => path.resolve(__dirname, p);

// Main external modules to exclude from bundling
const externals = [
  'electron'
];

export default defineConfig({
  main: {
    root: 'src/main',
    build: {
      rollupOptions: {
        external: externals
      }
    }
  },
  preload: {
    root: 'src/preload',
    build: {
      rollupOptions: {
        external: externals
      }
    }
  },
  renderer: {
    root: 'src/renderer',
    resolve: {
      alias: {
        '@renderer': resolve('src/renderer/src'),
        '@shared': resolve('src/shared')
      }
    },
    plugins: [react()],
  },
});