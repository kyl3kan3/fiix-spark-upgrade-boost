import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import zlib from "node:zlib";

const ROOT = path.resolve(process.argv[2] || "dist");
const PORT = Number(process.argv[3] || 4191);
const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".webmanifest": "application/manifest+json; charset=utf-8",
  ".map": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".txt": "text/plain; charset=utf-8",
  ".xml": "application/xml; charset=utf-8",
  ".md": "text/markdown; charset=utf-8",
};
const ALREADY_COMPRESSED = new Set([".woff", ".woff2", ".png", ".jpg", ".jpeg", ".webp", ".gz"]);

function safeJoin(root, urlPath) {
  const decoded = decodeURIComponent((urlPath || "/").split("?")[0].split("#")[0]);
  const rel = decoded.replace(/^\/+/, "");
  const full = path.normalize(path.join(root, rel));
  if (!full.startsWith(root)) return null;
  return full;
}

function resolveFile(urlPath) {
  const base = safeJoin(ROOT, urlPath);
  if (!base) return null;
  const candidates = [];
  if (urlPath === "/" || urlPath === "") {
    candidates.push(path.join(ROOT, "index.html"));
  } else {
    candidates.push(base);
    if (!path.extname(base)) {
      candidates.push(`${base}.html`);
      candidates.push(path.join(base, "index.html"));
    }
  }
  for (const c of candidates) {
    try {
      const st = fs.statSync(c);
      if (st.isFile()) return c;
      if (st.isDirectory()) {
        const idx = path.join(c, "index.html");
        if (fs.existsSync(idx) && fs.statSync(idx).isFile()) return idx;
      }
    } catch {
      /* skip */
    }
  }
  return null;
}

const server = http.createServer((req, res) => {
  const start = process.hrtime.bigint();
  const urlPath = req.url || "/";
  const pathname = urlPath.split("?")[0];
  let file = resolveFile(pathname);
  let status = 200;
  if (!file) {
    const accept = req.headers.accept || "";
    if (req.method === "GET" && accept.includes("text/html")) {
      file = path.join(ROOT, "index.html");
      status = 200;
    }
  }
  if (!file || !fs.existsSync(file)) {
    res.writeHead(404, { "content-type": "text/plain; charset=utf-8", "cache-control": "no-store" });
    res.end("Not found");
    return;
  }
  const ext = path.extname(file).toLowerCase();
  const type = MIME[ext] || "application/octet-stream";
  let body = fs.readFileSync(file);
  const wantGzip =
    (req.headers["accept-encoding"] || "").includes("gzip") && !ALREADY_COMPRESSED.has(ext);
  const headers = { "content-type": type, "cache-control": "no-store", vary: "Accept-Encoding" };
  if (wantGzip) {
    body = zlib.gzipSync(body, { level: 6 });
    headers["content-encoding"] = "gzip";
  }
  headers["content-length"] = body.length;
  res.writeHead(status, headers);
  res.end(body);
  const ms = Number(process.hrtime.bigint() - start) / 1e6;
  if (ms > 20 || pathname.endsWith("/") || !ext) {
    process.stdout.write(
      `${new Date().toISOString()} ${status} ${pathname} ${ms.toFixed(1)}ms ${body.length}b gzip=${Boolean(headers["content-encoding"])}\n`,
    );
  }
});

server.listen(PORT, "127.0.0.1", () => {
  console.log(`static gzip server ${ROOT} on http://127.0.0.1:${PORT}`);
});