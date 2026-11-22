import { createReadStream, copyFileSync, existsSync, mkdirSync, readdirSync } from "node:fs";
import { join } from "node:path";

export function pdfPlugin({ root, publishPublic }) {
  const dir = join(root, "private/downloads");

  function serve(req, res, next) {
    const url = req.url || "";
    if (!url.startsWith("/downloads/")) return next();
    const name = decodeURIComponent(url.slice("/downloads/".length).split("?")[0]);
    if (!name || name.includes("/") || name.includes("..") || !name.endsWith(".pdf")) return next();
    const file = join(dir, name);
    if (!existsSync(file)) return next();
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Cache-Control", "private, no-store");
    createReadStream(file).pipe(res);
  }

  return {
    name: "froth-pdfs",
    configureServer(server) {
      server.middlewares.use(serve);
    },
    configurePreviewServer(server) {
      if (!publishPublic) return;
      server.middlewares.use(serve);
    },
    closeBundle() {
      if (!publishPublic) return;
      const out = join(root, "dist/downloads");
      mkdirSync(out, { recursive: true });
      for (const name of readdirSync(dir)) {
        if (!name.endsWith(".pdf")) continue;
        copyFileSync(join(dir, name), join(out, name));
      }
    },
  };
}
