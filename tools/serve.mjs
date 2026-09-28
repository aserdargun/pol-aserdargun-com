#!/usr/bin/env node
/* ---------------------------------------------------------------------------
 * serve.mjs — dependency-free local preview server.
 *
 * The site has no build step; this only gives it a real origin, because the
 * page is also opened straight off the filesystem. It serves the repository
 * root and nothing outside it.
 *
 * Usage: npm run dev   (http://127.0.0.1:4173, override with PORT)
 * ------------------------------------------------------------------------- */

import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PORT = Number(process.env.PORT) || 4173;
const HOST = process.env.HOST || '127.0.0.1';

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.md': 'text/markdown; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8'
};

function resolve(urlPath) {
  const decoded = decodeURIComponent(urlPath.split('?')[0].split('#')[0]);
  const target = path.join(ROOT, decoded);
  const full = path.resolve(target);
  // path confinement: never serve outside the repository root
  if (full !== ROOT && !full.startsWith(ROOT + path.sep)) return null;
  if (fs.existsSync(full) && fs.statSync(full).isDirectory()) {
    const index = path.join(full, 'index.html');
    return fs.existsSync(index) ? index : null;
  }
  return fs.existsSync(full) && fs.statSync(full).isFile() ? full : null;
}

http.createServer((req, res) => {
  const file = resolve(req.url || '/');
  if (!file) {
    res.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' });
    res.end('404 not found\n');
    return;
  }
  res.writeHead(200, {
    'content-type': TYPES[path.extname(file).toLowerCase()] || 'application/octet-stream',
    'cache-control': 'no-cache'
  });
  fs.createReadStream(file).pipe(res);
}).listen(PORT, HOST, () => {
  console.log(`POL served from ${ROOT}`);
  console.log(`  http://${HOST}:${PORT}`);
});
