import { defineConfig } from 'vite';

export default defineConfig({
  // Use repo root. Do NOT point to "src".
  root: '.',
  publicDir: 'public',
  server: {
  host: 'localhost', // use localhost for Safari stability
  port: 53123,
    strictPort: true,
    // Force HMR to reuse the page port (avoid default 24678) for Safari/firewall friendliness
    hmr: {
      protocol: 'ws',
      host: 'localhost',
      port: 53123,
      clientPort: 53123,
    },
  },
  preview: {
  host: 'localhost', // use localhost for Safari stability
    port: 53124,
    strictPort: true,
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true, // cleans /dist even when root is "."
    // IMPORTANT: Do NOT set rollupOptions.input to "src/index.html".
    // Let Vite use the root index.html we added.
  },
});
