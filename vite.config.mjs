import { readdirSync, statSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";

const root = dirname(fileURLToPath(import.meta.url));
const skip = new Set(["node_modules", "dist", "public", "src"]);

function htmlInputs(dir = root, acc = {}) {
  for (const name of readdirSync(dir)) {
    if (skip.has(name) || name.startsWith(".")) continue;
    const full = resolve(dir, name);
    if (statSync(full).isDirectory()) htmlInputs(full, acc);
    else if (name.endsWith(".html")) {
      const rel = full.slice(root.length + 1);
      acc[rel.replace(/\.html$/, "").replaceAll("/", "_")] = full;
    }
  }
  return acc;
}

export default defineConfig({
  server: { port: 3000 },
  preview: { port: 3000 },
  build: {
    outDir: "dist",
    emptyOutDir: true,
    chunkSizeWarningLimit: 1200,
    rollupOptions: {
      input: htmlInputs(),
    },
  },
});
