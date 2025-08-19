import { defineConfig } from 'vite';

export default defineConfig({
  root: './src',
  build: {
    outDir: '../dist',
    rollupOptions: {
      input: {
        main: './index.html',
        styles: './styles/styles.css',
      },
      output: {
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
