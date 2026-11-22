import { readdirSync, statSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig, loadEnv } from "vite";
import { pdfPlugin } from "./scripts/pdf-plugin.mjs";
import { stampHtml } from "./src/access-dates.mjs";

const root = dirname(fileURLToPath(import.meta.url));
const skip = new Set(["node_modules", "dist", "public", "src", "private", "supabase", "scripts", "test"]);

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

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, root, "");
  const publishPdfs = !(env.VITE_SUPABASE_URL && env.VITE_SUPABASE_ANON_KEY);
  return {
  server: { port: 3000 },
  preview: { port: 3000 },
  plugins: [
    {
      name: "froth-access-dates",
      transformIndexHtml(html) {
        return stampHtml(html);
      },
    },
    pdfPlugin({ root, publishPublic: publishPdfs }),
  ],
  build: {
    outDir: "dist",
    emptyOutDir: true,
    chunkSizeWarningLimit: 1200,
    rollupOptions: {
      input: htmlInputs(),
    },
  },
  };
});
