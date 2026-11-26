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

// Hawkeye Billing: its read-only state feed (/api/state, public JSON) relayed for the browser, which cannot read it directly (no CORS).
// GET only, one fixed upstream path, cached for a minute; nothing is ever posted to Hawkeye from here.
const HAWKEYE = process.env.HAWKEYE_URL || 'https://hawkeye-eajy.onrender.com';
let hkCache = null;
async function hawkeyeState(res) {
  try {
    if (!hkCache || Date.now() - hkCache.t > 60000) {
      const r = await fetch(HAWKEYE + '/api/state', { headers: { Accept: 'application/json' }, signal: AbortSignal.timeout(20000) });
      if (!r.ok) throw new Error('HTTP ' + r.status);
      hkCache = { t: Date.now(), body: await r.text() };
    }
    res.writeHead(200, { 'Content-Type': 'application/json', 'Cache-Control': 'no-cache' }).end(hkCache.body);
  } catch (e) { res.writeHead(502, { 'Content-Type': 'application/json' }).end(JSON.stringify({ error: 'Hawkeye unavailable: ' + e.message })); }
}

http.createServer((req, res) => {
  if (req.method === 'GET' && req.url === '/hawkeye/state') { hawkeyeState(res); return; }
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
