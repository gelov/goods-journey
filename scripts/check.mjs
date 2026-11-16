// Checks every script listed in index.html: each file must parse on its own,
// and all of them together must not declare the same top-level name twice
// (they share one global scope in the browser).
import { readFileSync } from 'node:fs';
const html = readFileSync('index.html', 'utf8');
const files = [...html.matchAll(/<script src="([^"]+)"/g)].map((m) => m[1].split('?')[0]);
let all = '';
let failed = false;
for (const f of files) {
  const code = readFileSync(f, 'utf8');
  try { new Function(code); } catch (e) { failed = true; console.error(`${f}: ${e.message}`); }
  all += code.replace(/^'use strict';/, '') + '\n';
}
try { new Function(`'use strict';\n${all}`); } catch (e) { failed = true; console.error(`combined: ${e.message}`); }
console.log(failed ? 'check failed' : `ok: ${files.length} scripts`);
process.exit(failed ? 1 : 0);
