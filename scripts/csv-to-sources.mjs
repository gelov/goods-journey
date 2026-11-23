// Farm List / QC Report CSV -> normalized JSON beside the shipment manifests, no dependencies.
// Usage: node scripts/csv-to-sources.mjs <file.csv> [more.csv ...]   (kind detected from the header row)
// Writes manifests/sources/farms.json or manifests/sources/qc.json (client data: kept local, see .gitignore).
import fs from 'node:fs';import path from 'node:path';import {createRequire} from 'node:module';import {fileURLToPath} from 'node:url';
const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..'),X=createRequire(import.meta.url)(path.join(ROOT,'src/data/sources.js'));
const files=process.argv.slice(2);if(!files.length){console.error('usage: node scripts/csv-to-sources.mjs <file.csv> [...]');process.exit(1)}
const dir=path.join(ROOT,'manifests/sources');fs.mkdirSync(dir,{recursive:true});
for(const f of files){const t=fs.readFileSync(f,'utf8'),k=X.detect(t),src={file:path.basename(f),importedAt:new Date().toISOString().slice(0,10)};
 if(!k){console.error(path.basename(f)+': not a Farm List or QC Report');process.exitCode=1;continue}
 const D=k==='farms'?X.farmsFromCSV(t,src):X.qcFromCSV(t,src);fs.writeFileSync(path.join(dir,k+'.json'),JSON.stringify(D)+'\n');
 console.log(`${k}.json: ${JSON.stringify(D.validation)}`)}
