// Static file server, no dependencies. Hosts set PORT (Render does); locally it is 8080.
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PORT = Number(process.env.PORT) || 8080;
const HOST = process.env.HOST || '0.0.0.0';
// Only these folders and index.html are public; nothing else in the repo is served.
const PUBLIC = ['index.html', 'styles', 'src', 'assets', 'manifests'];
const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.jpg': 'image/jpeg', '.png': 'image/png', '.svg': 'image/svg+xml', '.json': 'application/json', '.ico': 'image/x-icon' };

http.createServer((req, res) => {
  let rel;
  try { rel = decodeURIComponent(new URL(req.url, 'http://x').pathname).replace(/^\/+/, '') || 'index.html'; }
  catch { res.writeHead(400).end('Bad request'); return; }
  const file = path.resolve(ROOT, rel);
  const top = path.relative(ROOT, file).split(path.sep)[0];
  if (!PUBLIC.includes(top)) { res.writeHead(404).end('Not found'); return; }
  fs.stat(file, (err, st) => {
    if (err || !st.isFile()) { res.writeHead(404).end('Not found'); return; }
    res.writeHead(200, { 'Content-Type': TYPES[path.extname(file)] || 'application/octet-stream', 'Content-Length': st.size,
      'Cache-Control': rel.startsWith('assets/') ? 'public, max-age=86400' : 'no-cache' });
    if (req.method === 'HEAD') res.end(); else fs.createReadStream(file).pipe(res);
  });
}).listen(PORT, HOST, () => console.log(`Serving on http://${HOST}:${PORT}`));
