'use strict';
/* ================= additional client data sources: Farm List and QC Report (CSV) =================
   Two datasets beside the shipment manifest, each kept in its own model. Every original row is kept, with every original column value
   in `raw` (keyed by the CSV header) and its sheet row number; normalized fields are a convenience copy and never replace the raw text.
   Nothing here edits the manifest. Relationships between a manifest and these datasets are classified, never assumed:
     verified  - an authoritative shared identifier (a pallet ID) and no conflicting shipment detail
     possible  - some identifiers agree, but the records cannot be conclusively linked; the reasons and conflicts are listed
     not linked - nothing sufficient is shared
   The farm list has no field the manifest shares, so no farm is ever picked for a shipment by country, region or supplier.
   Works in the browser (window.SOURCES) and in Node (module.exports). Shaped so a future Prometheus MCP feed can supply the same rows. */
(function(G){
/* RFC 4180 CSV: quoted fields, doubled quotes, commas and line breaks inside quotes, CRLF, BOM */
function parseCSV(text){text=String(text).replace(/^﻿/,'');const rows=[];let row=[],f='',q=false;
 for(let i=0;i<text.length;i++){const c=text[i];
  if(q){if(c==='"'){if(text[i+1]==='"'){f+='"';i++}else q=false}else f+=c;continue}
  if(c==='"')q=true;else if(c===',' ){row.push(f);f=''}else if(c==='\n'||c==='\r'){if(c==='\r'&&text[i+1]==='\n')i++;row.push(f);rows.push(row);row=[];f=''}else f+=c}
 if(f!==''||row.length){row.push(f);rows.push(row)}return rows.filter(r=>r.length>1||r[0]!=='')}
const key=s=>String(s||'').toLowerCase().replace(/[^a-z0-9]/g,''),clean=v=>v==null||String(v).trim()===''?null:String(v).trim();
/* header row -> records keeping every column; `map` names the normalized copies */
function table(text,map,prefix){const rows=parseCSV(text);if(!rows.length)throw new Error('the file is empty');const H=rows[0].map(h=>h.trim()),idx={},missing=[];
 for(const[f,h]of Object.entries(map)){const j=H.findIndex(x=>key(x)===key(h));if(j<0)missing.push(h);else idx[f]=j}
 const records=[],ragged=[];rows.slice(1).forEach((r,n)=>{if(r.length!==H.length)ragged.push(n+2);const raw={};H.forEach((h,j)=>raw[h]=r[j]==null?'':r[j]);
  const rec={id:prefix+(n+2),row:n+2};for(const[f,j]of Object.entries(idx))rec[f]=clean(r[j]);rec.raw=raw;records.push(rec)});
 return{headers:H,records,missing,ragged}}
const FARM={farmName:'Farm Name',farmCode:'Farm Code',areaName:'Area Name',areaCode:'Area Code',location:'Location'};
const QC={produce:'Produce',purchaseOrder:'Purchase Order',supplier:'Supplier',container:'Container Number',origin:'Country Of Origin',operatingCompany:'Operating Company',
 portOfArrival:'Port Of Arrival',portOfDeparture:'Port Of Departure',status:'Status',customer:'Customer',logistics:'3rd Party Logistics',timestamp:'Timestamp',dateOfRecord:'Date Of Record',
 vessel:'Vessel ID',palletTrace:'Pallet Traceability',boxTrace:'Box Traceability',palletNumber:'Pallet Number',itemNo:'Item No',pallets:'No Of Pallets',boxes:'No Of Boxes',itemsPerBox:'Items Inside The Box',
 product:'Product',brand:'Brand',temperature:'Temperature',variety:'Variety',tempTale:'Temp Tale No',inspector:'Inspector Name',brix:'Brix',fruitWeights:'Fruit Weights',fruitWeightsTotal:'Fruit Weights Total',
 weightVariance:'Weight Variance',boxesTested:'No Of Boxes Tested',boxesWithDefects:'No of Boxes With Defects',itemsTested:'No Of Items Tested',progressiveDefects:'Progressive Defects',progressiveDefectsNo:'Progressive Defects No',
 nonProgressiveDefects:'Non Progressive Defects',nonProgressiveDefectsNo:'Non Progressive Defects No',totalDefectsPct:'Total Defects %',dateInspected:'Date Inspected',notes:'Notes',deleted:'Deleted'};
/* the dataset kind, from its header row */
function detect(text){const h=(parseCSV(String(text).slice(0,4000))[0]||[]).map(key);if(h.includes('farmcode')&&h.includes('areacode'))return'farms';if(h.includes('pallettraceability')&&h.includes('vesselid'))return'qc';return null}
function farmsFromCSV(text,source){const T=table(text,FARM,'F');if(T.missing.length)throw new Error('not a Farm List: missing '+T.missing.join(', '));
 const seen={},dup=[];for(const r of T.records){const k=[r.farmCode,r.areaName,r.areaCode].join('|');if(seen[k])dup.push(r.row);else seen[k]=1}
 const farms={};for(const r of T.records){const k=r.farmCode||'?';(farms[k]=farms[k]||{farmName:r.farmName,farmCode:r.farmCode,locations:new Set(),areas:0}).areas++;if(r.location)farms[k].locations.add(r.location)}
 return{schema:'farm-list/1',source:Object.assign({file:null},source||{}),headers:T.headers,records:T.records,
  farms:Object.values(farms).map(f=>({...f,locations:[...f.locations]})),
  validation:{records:T.records.length,farms:Object.keys(farms).length,duplicateRows:dup,raggedRows:T.ragged,noArea:T.records.filter(r=>!r.areaName).map(r=>r.row)}}}
function qcFromCSV(text,source){const T=table(text,QC,'Q');if(T.missing.length)throw new Error('not a QC Report: missing '+T.missing.join(', '));
 const by=f=>{const c={};for(const r of T.records){const k=r[f]||'(not recorded)';c[k]=(c[k]||0)+1}return c};
 return{schema:'qc-report/1',source:Object.assign({file:null},source||{}),headers:T.headers,records:T.records,
  validation:{records:T.records.length,raggedRows:T.ragged,byStatus:by('status'),vessels:Object.keys(by('vessel')).length,noPalletTrace:T.records.filter(r=>!r.palletTrace).length}}}
/* ---- relationships ---- */
const port=s=>key(String(s||'').split(',')[0]),word=s=>key(String(s||'').split(/[\s\-(]/)[0]);
/* the QC customer is compatible with a manifest customer when one name starts with the other ("ALDISUD-AT" and "ALDI") */
const custOK=(q,m)=>{const a=key(q),b=key(m);return!!a&&!!b&&(a.startsWith(b)||b.startsWith(a))};
/* QC records for one shipment and one allocation (customer), classified. `S` is a normalized shipment (src/data/shipment.js). */
function matchQC(S,qc,customer){const out={verified:[],possible:[],considered:0};if(!S||!qc)return out;const sh=S.shipment,ves=key(sh.vessel),wk=sh.departureWeek&&sh.departureWeek.raw;
 const all=S.records,mine=customer?all.filter(r=>r.finalCustomer===customer):all,pal=new Map(),box=new Set(mine.map(r=>r.trace).filter(Boolean)),palAll=new Map();
 for(const r of mine)if(r.idNavio)pal.set(r.idNavio,r);for(const r of all)if(r.idNavio)palAll.set(r.idNavio,r);
 for(const q of qc.records){if(!ves||key(q.vessel)!==ves)continue;out.considered++;const why=[],con=[],P=pal.get(q.palletTrace),PA=palAll.get(q.palletTrace);
  why.push('same vessel ('+q.vessel+')');
  if(wk&&String(q.purchaseOrder||'').includes(wk))why.push('purchase order names departure week '+wk);else con.push('purchase order "'+(q.purchaseOrder||'none')+'" does not name week '+(wk||'?'));
  if(port(q.portOfDeparture)===port(sh.portOfDeparture))why.push('same departure port');else con.push('departure port: QC '+(q.portOfDeparture||'none')+', manifest '+(sh.portOfDeparture||'none'));
  if(port(q.portOfArrival)===port(sh.portOfEntry))why.push('same arrival port');else con.push('arrival port: QC '+(q.portOfArrival||'none')+', manifest '+(sh.portOfEntry||'none'));
  if(P)why.push('pallet ID '+q.palletTrace+' is in this allocation');else if(PA)con.push('pallet ID '+q.palletTrace+' belongs to the '+PA.finalCustomer+' allocation');else con.push('pallet ID '+(q.palletTrace||'none')+' is not in the manifest');
  if(q.boxTrace&&box.has(q.boxTrace))why.push('box trace code '+q.boxTrace+' appears in this allocation (a trace code is shared by many pallets, so it does not identify one)');
  if(customer){if(custOK(q.customer,customer))why.push('customer '+q.customer+' is compatible with '+customer);else con.push('customer: QC '+(q.customer||'none')+', allocation '+customer)}
  if(P){if(key(P.description)!==key(q.product))con.push('product: QC '+q.product+', manifest '+P.description);if(word(P.variety)!==word(q.variety))con.push('variety: QC '+q.variety+', manifest '+P.variety)}
  else if(mine.some(r=>key(r.description)===key(q.product)))why.push('product '+q.product+' is in this allocation');
  const e={rec:q,reasons:why,conflicts:con,records:P?[P.rid]:[]};(P&&!con.length?out.verified:out.possible).push(e)}
 return out}
/* the farm for a shipment: only an explicit link counts (a farm/area code carried by the manifest); none exists in the current manifests */
function linkFarm(S,farms){if(!S||!farms)return{status:'none',reason:farms?'The manifest carries no farm or area code, so no farm can be linked.':'No Farm List loaded.'};
 const code=S.shipment&&(S.shipment.farmCode||S.shipment.areaCode);if(!code)return{status:'none',reason:'The manifest carries no farm or area code, so no farm can be linked.'};
 const hits=farms.records.filter(r=>r.farmCode===S.shipment.farmCode&&(!S.shipment.areaCode||r.areaCode===S.shipment.areaCode));
 return hits.length===1?{status:'verified',farm:hits[0]}:{status:'none',reason:hits.length?'The manifest code matches '+hits.length+' farm areas.':'The manifest code is not in the Farm List.'}}
const API={parseCSV,detect,farmsFromCSV,qcFromCSV,matchQC,linkFarm,custOK};
if(typeof module!=='undefined'&&module.exports)module.exports=API;else G.SOURCES=API})(typeof window!=='undefined'?window:globalThis);
