import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { copyFileSync, mkdirSync } from "node:fs";
import { resolve } from "node:path";

const legacyRuntimeFiles = ["data.js", "shared.js", "pages.js", "home.js", "crash.js", "spotlight.js"];

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve("index.html"),
        reactPreview: resolve("react-preview.html"),
      },
    },
  },
  plugins: [
    react(),
    {
      name: "copy-legacy-prototype-runtime",
      closeBundle() {
        const outDir = resolve("dist/legacy/prototype");
        mkdirSync(outDir, { recursive: true });
        legacyRuntimeFiles.forEach(file => {
          copyFileSync(resolve("legacy/prototype", file), resolve(outDir, file));
        });
      },
    },
  ],
});
