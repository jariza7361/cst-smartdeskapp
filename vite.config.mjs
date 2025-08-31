import { defineConfig } from "vite";
export default defineConfig({
  publicDir: "public",
  build: { outDir: "dist", assetsDir: "assets", rollupOptions: { input: "index.html" } },
  server: { port: 5173, strictPort: true }
});
