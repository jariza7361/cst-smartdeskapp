import { defineConfig } from 'vite';

export default defineConfig({
  root: './',
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: './index.html'
      },
      output: {
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: (assetInfo) => {
          if (assetInfo.name.endsWith('.css')) {
            return 'assets/[name]-[hash].css';
          }
          return 'assets/[name]-[hash][extname]';
        },
      },
    },
  },
});
