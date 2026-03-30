import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  root: path.resolve(process.cwd(), "client"),
  server: {
    port: 5173,
  },
  build: {
    outDir: path.resolve(process.cwd(), "client", "dist"),
    emptyOutDir: true,
  },
});
