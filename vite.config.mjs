import { defineConfig } from "vite";

export default defineConfig({
  // Use repo root. Do NOT point to "src".
  root: ".",
  publicDir: "public",
  build: {
    outDir: "dist",
    emptyOutDir: true, // cleans /dist even when root is "."
    // IMPORTANT: Do NOT set rollupOptions.input to "src/index.html".
    // Let Vite use the root index.html we added.
  },
});
