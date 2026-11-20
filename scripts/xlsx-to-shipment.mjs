// Excel shipment manifest -> normalized shipment JSON, no dependencies.
// Usage: node scripts/xlsx-to-shipment.mjs "<workbook.xlsx>" [label]
// Writes manifests/shipments/<id>.json and adds it to manifests/shipments/index.json.
import fs from 'node:fs';import path from 'node:path';import zlib from 'node:zlib';import {createRequire} from 'node:module';import {fileURLToPath} from 'node:url';
const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..'),S=createRequire(import.meta.url)(path.join(ROOT,'src/data/shipment.js'));
const file=process.argv[2];if(!file){console.error('usage: node scripts/xlsx-to-shipment.mjs <workbook.xlsx> [label]');process.exit(1)}
/* minimal zip reader: central directory, stored or deflated entries */
const buf=fs.readFileSync(file);let e=buf.length-22;while(e>=0&&buf.readUInt32LE(e)!==0x06054b50)e--;if(e<0)throw new Error('not a zip file');
const parts={};let p=buf.readUInt32LE(e+16);for(let i=0,n=buf.readUInt16LE(e+10);i<n;i++){const m=buf.readUInt16LE(p+10),cs=buf.readUInt32LE(p+20),nl=buf.readUInt16LE(p+28),xl=buf.readUInt16LE(p+30),cl=buf.readUInt16LE(p+32),lo=buf.readUInt32LE(p+42),name=buf.toString('utf8',p+46,p+46+nl);
 const d=lo+30+buf.readUInt16LE(lo+26)+buf.readUInt16LE(lo+28),raw=buf.subarray(d,d+cs);parts[name]=()=>(m===0?raw:zlib.inflateRawSync(raw)).toString('utf8');p+=46+nl+xl+cl}
const {sheet,rows}=await S.workbookRows(async n=>parts[n]?parts[n]():null);
const out=S.normalizeShipment(rows,{file:path.basename(file),sheet,importedAt:new Date().toISOString().slice(0,10)});
const v=out.validation,label=process.argv[3]||`${out.shipment.vessel||'Shipment'} · ${out.shipment.departureWeek?`Week ${out.shipment.departureWeek.week}, ${out.shipment.departureWeek.year}`:''}`;
const dir=path.join(ROOT,'manifests/shipments');fs.mkdirSync(dir,{recursive:true});const fn=out.id.toLowerCase()+'.json';fs.writeFileSync(path.join(dir,fn),JSON.stringify(out,null,1)+'\n');
const ix=path.join(dir,'index.json'),list=fs.existsSync(ix)?JSON.parse(fs.readFileSync(ix,'utf8')):{shipments:[]};list.shipments=list.shipments.filter(s=>s.file!==fn).concat([{file:fn,label}]);fs.writeFileSync(ix,JSON.stringify(list,null,1)+'\n');
console.log(`${fn}: ${v.records} records, cartons ${v.cartons.parsed} (stated ${v.cartons.stated}, ${v.cartons.ok?'ok':'MISMATCH'}), pallets ${v.pallets.parsed} (stated ${v.pallets.stated}, ${v.pallets.ok?'ok':'MISMATCH'}), amount ${v.totalAmount.parsed} (${v.totalAmount.ok?'ok':'MISMATCH'}); skipped ${v.skipped.length} rows; IDnavio repeats ${v.idNavioRepeats}, trace repeats ${v.traceRepeats}`);
