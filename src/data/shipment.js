'use strict';
/* ================= shipment manifests (Excel) =================
   A shipment manifest is the exporter's cargo breakdown: one row per cargo line (product, brand, trace code, intended customer, cartons,
   pallets). This module reads it from an .xlsx workbook (the zip is opened by the caller: the browser or scripts/xlsx-to-shipment.mjs),
   separates the summary block from the records, normalizes the records, validates them against the summary, and filters and totals them.
   It is a data layer only: nothing here draws, and nothing is invented. Identifiers stay strings, fractional pallets stay fractional,
   subtotal rows are dropped, and every record keeps its original cell values for traceability. Works in the browser and in Node. */
(function(G){
/* ---- reading the two XML parts of a workbook that matter: shared strings and one worksheet ---- */
const unxml=s=>s.replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&quot;/g,'"').replace(/&apos;/g,"'").replace(/&#(\d+);/g,(m,n)=>String.fromCharCode(+n)).replace(/&amp;/g,'&');
function sharedStrings(xml){const o=[];if(!xml)return o;for(const m of xml.matchAll(/<si>([\s\S]*?)<\/si>/g)){let t='';for(const x of m[1].matchAll(/<t(?:\s[^>]*)?>([\s\S]*?)<\/t>/g))t+=x[1];o.push(unxml(t))}return o}
/* rows as {row number: {column letter: text}}, values exactly as stored (numbers stay their stored text) */
function sheetRows(xml,ss){const rows={};for(const m of xml.matchAll(/<row\b[^>]*\br="(\d+)"[^>]*>([\s\S]*?)<\/row>/g)){const r={};
  for(const c of m[2].matchAll(/<c\b([^>]*?)(?:\/>|>([\s\S]*?)<\/c>)/g)){const at=c[1],ref=(at.match(/\br="([A-Z]+)\d+"/)||[])[1],t=(at.match(/\bt="([^"]+)"/)||[])[1],body=c[2]||'';if(!ref)continue;
   let v=null;const vm=body.match(/<v>([\s\S]*?)<\/v>/);if(t==='s'&&vm)v=ss[+vm[1]];else if(t==='inlineStr'){let s='';for(const x of body.matchAll(/<t(?:\s[^>]*)?>([\s\S]*?)<\/t>/g))s+=x[1];v=unxml(s)}else if(vm)v=unxml(vm[1]);
   if(v!=null&&String(v).trim()!=='')r[ref]=String(v)}
  if(Object.keys(r).length)rows[+m[1]]=r}return rows}
/* the first worksheet in workbook order, given a function that returns a part's text by path */
async function workbookRows(read){const wb=await read('xl/workbook.xml'),rels=await read('xl/_rels/workbook.xml.rels');if(!wb)throw new Error('not an Excel workbook (no xl/workbook.xml)');
 const first=wb.match(/<sheet\b[^>]*>/);if(!first)throw new Error('the workbook has no sheets');const name=(first[0].match(/\bname="([^"]*)"/)||[])[1]||'Sheet1',rid=(first[0].match(/\br:id="([^"]+)"/)||[])[1];
 let target='worksheets/sheet1.xml';if(rid&&rels){const r=rels.match(new RegExp('<Relationship\\b[^>]*Id="'+rid+'"[^>]*>'));const tg=r&&(r[0].match(/\bTarget="([^"]+)"/)||[])[1];if(tg)target=tg.replace(/^\/?xl\//,'').replace(/^\//,'')}
 const sheet=await read('xl/'+target);if(!sheet)throw new Error('worksheet '+target+' is missing');return{sheet:unxml(name),rows:sheetRows(sheet,sharedStrings(await read('xl/sharedStrings.xml')))}}
/* ---- the columns of the cargo breakdown, matched by header text (case, quotes and spacing ignored) ---- */
const COLS=[['container','Nº CNTR'],['description','B1_DESCING_2'],['variety','Variety'],['brand','Brand'],['weight','Weight'],['temptale','Temptale'],['idNavio','IDnavio'],['chep','Chep'],
 ['trace','Trace'],['grafted','Grafted'],['insert','Insert'],['plu','Plu'],['du','DU'],['finalCustomer','Final Custome'],['count','Count'],['cfrPerBox','CFR x Box'],['cartons','Cartons'],['pallets','Pallets'],
 ['netWeight','Net Weight'],['grossWeight','Gross Weight'],['totalAmount','Total Amount']];
const NUMERIC=new Set(['cfrPerBox','cartons','pallets','netWeight','grossWeight','totalAmount']);
const key=s=>String(s).toLowerCase().replace(/['"\s]/g,'').replace(/º/g,'o'),clean=s=>s==null?null:(String(s).trim()===''?null:String(s).trim()),num=s=>{const v=parseFloat(s);return isFinite(v)?v:null};
const SUMMARY={customer:'Customer',departureWeek:'Departure Week',vessel:'Vessel',portOfEntry:'Port Of Entry',currency:'Currency',portOfDeparture:'Port of Departure',cartons:'Cartons',pallets:'Pallets',totalAmount:'Total Amount'};
/* rows -> {shipment, records, validation}. Throws if no cargo header row is found. */
function normalizeShipment(rows,source){const nums=Object.keys(rows).map(Number).sort((a,b)=>a-b),hdrKey=key('B1_DESCING_2');
 const hRow=nums.find(n=>Object.values(rows[n]).some(v=>key(v)===hdrKey)||Object.values(rows[n]).some(v=>key(v)===key('Nº CNTR')));if(hRow==null)throw new Error('no cargo header row (Nº CNTR / B1_DESCING_2) was found');
 const H=rows[hRow],col={},unknown=[];for(const[c,v]of Object.entries(H)){const k=COLS.find(x=>key(x[1])===key(v));if(k)col[k[0]]=c;else unknown.push(clean(v))}
 /* summary: label/value pairs in the rows above the header (label in one cell, value in the next column) */
 const raw={},letters='ABCDEFGHIJKLMNOPQRSTUVWXYZ';for(const n of nums){if(n>=hRow)break;const r=rows[n];for(const[c,v]of Object.entries(r)){const nx=letters[letters.indexOf(c)+1];if(nx&&r[nx]!=null)for(const[f,lab]of Object.entries(SUMMARY))if(key(v)===key(lab))raw[f]=r[nx]}}
 const wk=clean(raw.departureWeek),m=wk&&wk.match(/^(\d{4})(\d{2})$/);
 const shipment={customer:clean(raw.customer),vessel:clean(raw.vessel),departureWeek:wk?{raw:wk,year:m?+m[1]:null,week:m?+m[2]:null}:null,portOfDeparture:clean(raw.portOfDeparture),portOfEntry:clean(raw.portOfEntry),
  currency:clean(raw.currency),stated:{cartons:num(raw.cartons),pallets:num(raw.pallets),totalAmount:num(raw.totalAmount)},summaryRaw:raw};
 /* records: rows below the header with a product description; product subtotal rows ("... Total") and grand totals are left out */
 const records=[],skipped=[];for(const n of nums){if(n<=hRow)continue;const r=rows[n],d=clean(r[col.description]),a=clean(r.A);
  if(!d){if(a&&/total/i.test(a))skipped.push({row:n,reason:'grand total'});else if(Object.keys(r).length)skipped.push({row:n,reason:'no product description'});continue}
  if(/\btotal$/i.test(d)){skipped.push({row:n,reason:'product subtotal'});continue}
  const rec={rid:'R'+n,row:n};for(const[f,c]of Object.entries(col)){const v=r[c];rec[f]=NUMERIC.has(f)?num(v):clean(v)}rec.raw=Object.fromEntries(Object.entries(col).map(([f,c])=>[f,r[c]==null?null:r[c]]));records.push(rec)}
 const tot=totals(records),st=shipment.stated,chk=(a,b,tol)=>a==null||b==null?null:Math.abs(a-b)<=tol;
 const validation={records:records.length,skipped,unknownColumns:unknown.filter(Boolean),cartons:{stated:st.cartons,parsed:tot.cartons,ok:chk(st.cartons,tot.cartons,.5)},
  pallets:{stated:st.pallets,parsed:+tot.pallets.toFixed(6),ok:chk(st.pallets,tot.pallets,.01)},totalAmount:{stated:st.totalAmount,parsed:+tot.totalAmount.toFixed(2),ok:chk(st.totalAmount,tot.totalAmount,.01)},
  missing:COLS.filter(c=>!col[c[0]]).map(c=>c[1]),idNavioRepeats:repeats(records,'idNavio'),traceRepeats:repeats(records,'trace')};
 return{schema:'shipment-manifest/1',id:['SHIP',(shipment.vessel||'vessel').replace(/\W+/g,'-'),wk||''].join('-').replace(/-+$/,''),source:Object.assign({sheet:null,file:null},source||{},{headerRow:hRow}),shipment,records,validation}}
const repeats=(R,f)=>{const c={};for(const r of R)if(r[f])c[r[f]]=(c[r[f]]||0)+1;return Object.values(c).filter(v=>v>1).length};
/* ---- filtering and totals ---- */
function totals(R){const t={records:R.length,cartons:0,pallets:0,netWeight:0,grossWeight:0,totalAmount:0};for(const r of R){t.cartons+=r.cartons||0;t.pallets+=r.pallets||0;t.netWeight+=r.netWeight||0;t.grossWeight+=r.grossWeight||0;t.totalAmount+=r.totalAmount||0}return t}
/* f: {customer, variety, description, brand, trace, cargo} (empty = any); trace and cargo match as text */
function filterRecords(R,f){f=f||{};const q=s=>String(s||'').toLowerCase().trim(),tr=q(f.trace),cg=q(f.cargo);
 return R.filter(r=>(!f.customer||r.finalCustomer===f.customer)&&(!f.variety||r.variety===f.variety)&&(!f.description||r.description===f.description)&&(!f.brand||r.brand===f.brand)&&(!tr||q(r.trace).includes(tr))&&(!cg||q(r.idNavio).includes(cg)||q(r.container).includes(cg)||q(r.rid)===cg))}
const distinct=(R,f)=>[...new Set(R.map(r=>r[f]).filter(Boolean))].sort();
/* grouped totals, e.g. by customer or variety */
function breakdown(R,f){const g={};for(const r of R){const k=r[f]||'(not recorded)';(g[k]=g[k]||[]).push(r)}return Object.entries(g).map(([k,v])=>({key:k,...totals(v)})).sort((a,b)=>b.cartons-a.cartons)}
const API={sharedStrings,sheetRows,workbookRows,normalizeShipment,totals,filterRecords,distinct,breakdown};
if(typeof module!=='undefined'&&module.exports)module.exports=API;else G.SHIPMENT=API})(typeof window!=='undefined'?window:globalThis);
