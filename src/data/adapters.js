'use strict';
/* ================= manifest format adapters =================
   Pipeline:  file or provider  ->  prepareManifest()  ->  canonical manifest  ->  validateManifest()  ->  journey.
   An adapter turns a recognised external structure into the canonical one (manifests/manifest.schema.json) using the
   explicit tables below. Nothing is guessed: a field that is not in a table is left alone, an unknown role or stage type
   falls through to validation and is reported, and a coordinate pair whose order cannot be established is flagged for the
   user to choose. Every change made on the way is recorded so the import preview can show it.
   To support another format, add an entry to FORMATS with a detect() and a convert(); an MCP adapter is one more entry. */
const akey=s=>String(s==null?'':s).trim().toLowerCase().replace(/[\s-]+/g,'_');
const ROLE_ALIAS={farm:'farm',grower:'farm',exportport:'exportPort',export_port:'exportPort',origin_port:'exportPort',port_of_loading:'exportPort',arrivalport:'arrivalPort',arrival_port:'arrivalPort',destination_port:'arrivalPort',import_port:'arrivalPort',port_of_discharge:'arrivalPort',
 warehouse:'warehouse',distribution_centre:'warehouse',distribution_center:'warehouse',supermarket:'supermarket',store:'supermarket',retail:'supermarket',retailer:'supermarket'};
const STAGE_ALIAS={farm:'farm',growing:'farm',cultivation:'farm',harvest:'harvest',harvesting:'harvest',packing:'harvest',loading:'harvest',exportport:'exportPort',export_port:'exportPort',port_loading:'exportPort',vessel_loading:'exportPort',
 ocean:'ocean',ocean_transport:'ocean',sea_transport:'ocean',customs:'customs',customs_clearance:'customs',unloading:'unloading',port_unloading:'unloading',warehouse:'warehouse',warehouse_allocation:'warehouse',
 qualitycontrol:'qualityControl',quality_control:'qualityControl',qc:'qualityControl',claims:'claims',claim:'claims',delivery:'delivery',supermarket:'delivery',supermarket_delivery:'delivery',retail:'delivery'};
const LEG_STAGE={road_transport:1,inland_transport:1,transport:1},MODE_ALIAS={road:'road',truck:'road',lorry:'road',sea:'sea',ocean:'sea',vessel:'sea',ship:'sea',maritime:'sea'},VEH_ALIAS={lorry:'lorry',truck:'lorry'};
const MAIN_EVENT={farm:'expectedHarvest',harvest:'harvested',exportPort:'departed',ocean:'arrived',customs:'cleared',unloading:'unloaded',warehouse:'allocated',delivery:'delivered'};
const MONTHS=['January','February','March','April','May','June','July','August','September','October','November','December'];
/* ISO dates become "12 October 2026"; anything else is kept as written and checked by validation */
function adaptDate(v,notes,where){if(typeof v!=='string')return v;const m=/^(\d{4})-(\d{2})-(\d{2})(?:[T ].*)?$/.exec(v.trim());if(!m||+m[2]<1||+m[2]>12)return v;const o=+m[3]+' '+MONTHS[+m[2]-1]+' '+m[1];notes.converted.push(`${where}: date ${v} shown as ${o}`);return o}
/* how a file writes coordinate pairs: stated in the file, chosen by the user, or established from a pair that only fits one way */
function arrayOrder(raw,opts){const said=akey(opts&&opts.coordinateOrder||raw.coordinateOrder||raw.coordinateFormat||(raw.manifest&&raw.manifest.coordinateOrder)||'');
 if(/^\[?lon|^\[?lng|geojson|^x/.test(said))return{o:'lonlat',why:opts&&opts.coordinateOrder?'as you selected':'as stated in the file'};if(/^\[?lat|^y/.test(said))return{o:'latlon',why:opts&&opts.coordinateOrder?'as you selected':'as stated in the file'};
 let o=null,clash=false;for(const l of Array.isArray(raw.locations)?raw.locations:[]){const c=l&&l.coordinates;if(!Array.isArray(c)||c.length!==2||typeof c[0]!=='number'||typeof c[1]!=='number')continue;
  const g=Math.abs(c[0])>90&&Math.abs(c[1])<=90?'lonlat':Math.abs(c[1])>90&&Math.abs(c[0])<=90?'latlon':null;if(g){if(o&&o!==g)clash=true;o=g}}
 return clash?{o:null,clash:true}:o?{o,why:'established from a pair whose first value cannot be a latitude'.replace('first',o==='lonlat'?'first':'second')}:{o:null}}
function adaptCoords(c,ord,notes,where,st){if(Array.isArray(c)){if(c.length!==2||typeof c[0]!=='number'||typeof c[1]!=='number')return c;if(!ord.o){st.needOrder=true;return c}
  if(!st.saidOrder){st.saidOrder=true;notes.converted.push(`Coordinate pairs read as [${ord.o==='lonlat'?'longitude, latitude':'latitude, longitude'}], ${ord.why}`)}return ord.o==='lonlat'?{lon:c[0],lat:c[1]}:{lon:c[1],lat:c[0]}}
 if(c&&typeof c==='object'){if(typeof c.lon==='number'&&typeof c.lat==='number')return c;for(const[a,b]of[['lng','lat'],['longitude','latitude'],['long','lat']])if(typeof c[a]==='number'&&typeof c[b]==='number'){notes.converted.push(`${where}: coordinates {${a}, ${b}} read as {lon, lat}`);return{lon:c[a],lat:c[b]}}}return c}
const FORMATS=[
 {id:'canonical',label:'Canonical manifest (schema 1.x)',
  detect:r=>Array.isArray(r.locations)&&r.locations.length>0&&r.locations.every(l=>l&&ROLES.includes(l.role)&&l.coordinates&&!Array.isArray(l.coordinates)&&typeof l.coordinates.lon==='number')&&!Array.isArray(r.transport)&&!Array.isArray(r.cargo)&&(!Array.isArray(r.stages)||r.stages.every(s=>s&&STAGE_TYPES.includes(s.type))),
  convert:r=>JSON.parse(JSON.stringify(r))},
 {id:'event-flow',label:'Demo manifest with a transport list, a cargo list and step-by-step stages',
  detect:r=>Array.isArray(r.locations)&&(Array.isArray(r.transport)||Array.isArray(r.cargo)||(Array.isArray(r.stages)&&r.stages.some(s=>s&&(s.highlightTarget!=null||LEG_STAGE[akey(s.type)])))),convert:adaptGeneral},
 {id:'canonical-variant',label:'Canonical manifest with alternative field names',
  detect:r=>Array.isArray(r.locations)&&r.locations.some(l=>l&&(ROLE_ALIAS[akey(l.role||l.type)]||ROLE_ALIAS[akey(l.role||l.type).replace(/_/g,'')])),convert:adaptGeneral}];
/* one converter for the recognised non-canonical structures; every mapping is an explicit entry in the tables above */
function adaptGeneral(raw,notes,opts,st){const M=raw.manifest&&typeof raw.manifest==='object'?raw.manifest:{},C={},role=v=>ROLE_ALIAS[akey(v)]||ROLE_ALIAS[akey(v).replace(/_/g,'')],ord=arrayOrder(raw,opts),pick=(o,...ks)=>{for(const k of ks)if(o&&o[k]!=null)return o[k]};
 if(ord.clash)notes.problems.push('Coordinate pairs in this file do not agree on an order: some only fit [longitude, latitude] and others only [latitude, longitude]. Write them as {"lon": …, "lat": …}.');
 C.schemaVersion=/^1\./.test(raw.schemaVersion||'')?raw.schemaVersion:raw.schemaVersion;
 const D=raw.demo&&typeof raw.demo==='object'?raw.demo:null;C.manifest={...M,id:pick(M,'id','manifestId')||raw.manifestId,reference:pick(M,'reference','shipmentReference','shipmentId'),demo:D?D.isDemo!==false:M.demo,description:M.description||(D&&D.disclaimer)||undefined};
 if(!M.id&&C.manifest.id)notes.converted.push('Manifest id taken from manifestId');if(D)notes.converted.push('Top-level "demo" block read as manifest.demo');
 const byId={};C.locations=(Array.isArray(raw.locations)?raw.locations:[]).map((l,i)=>{if(!l||typeof l!=='object')return l;const r=ROLES.includes(l.role)?l.role:role(l.role||l.type),w=`locations[${i}] (${l.id||'no id'})`;
  if(r&&l.role!==r)notes.converted.push(`${w}: ${l.role!=null?'role':'type'} "${l.role!=null?l.role:l.type}" read as role "${r}"`);
  const o={...l,role:r||l.role||l.type,coordinates:adaptCoords(l.coordinates,ord,notes,w,st)};if(!l.coordinateSource&&l.locationAccuracy!=null)o.coordinateSource=/^(actual|exact|verified|surveyed)$/.test(akey(l.locationAccuracy))?'actual':'illustrative';if(l.id)byId[l.id]=o.role;return o});
 C.routes=Array.isArray(raw.routes)?raw.routes.map((r,i)=>{if(!r||typeof r!=='object')return r;const from=pick(r,'from','fromLocationId','originLocationId','origin'),to=pick(r,'to','toLocationId','destinationLocationId','destination'),mode=MODE_ALIAS[akey(r.mode)]||r.mode;
  if(r.from==null&&from!=null&&!st.saidRoute){st.saidRoute=true;notes.converted.push('Routes: fromLocationId / toLocationId read as from / to')}if(mode!==r.mode&&r.mode!=null)notes.converted.push(`routes[${i}]: mode "${r.mode}" read as "${mode}"`);
  const o={id:r.id,from,to,mode};if(Array.isArray(r.geometry)&&r.geometry.length)o.geometry=r.geometry;if(r.geometrySource)o.geometrySource=r.geometrySource;else if(akey(r.geometryStatus)==='actual')o.geometrySource='actual';o._transportId=r.transportId;return o}):raw.routes;
 /* transport: an object is canonical already (vessel field names aside); a list is split into lorries, the vessel and, with the cargo list, containers */
 const legOf=r=>{const a=byId[r.from],b=byId[r.to];return a==='farm'&&b==='exportPort'?'farm-exportPort':a==='arrivalPort'&&b==='warehouse'?'arrivalPort-warehouse':a==='warehouse'&&b==='supermarket'?'warehouse-supermarket':null};
 const vesselOf=v=>({name:pick(v,'name','vesselName'),imo:pick(v,'imo','imoNumber','IMO'),voyage:pick(v,'voyage','voyageNumber','voyageNo')});
 if(Array.isArray(raw.transport)){const T={vehicles:[],containers:[]};notes.converted.push('Transport list split into vehicles, vessel and containers');
  for(const t of raw.transport){if(!t||typeof t!=='object')continue;const k=akey(t.type);if(VEH_ALIAS[k]){const legs=(Array.isArray(C.routes)?C.routes:[]).filter(r=>r&&r._transportId===t.id).map(legOf).filter(Boolean);T.vehicles.push({id:t.id,type:'lorry',legs,reference:t.reference})}
   else if(k==='vessel'||k==='ship')T.vessel=vesselOf(t);else notes.problems.push(`transport "${t.id}": type "${t.type}" is not supported (supported: lorry, truck, vessel, ship)`)}
  for(const c of Array.isArray(raw.cargo)?raw.cargo:[])if(c&&/container/.test(akey(c.type)))T.containers.push({id:c.id,containerNumber:c.containerNumber});C.transport=T}
 else if(raw.transport&&typeof raw.transport==='object'){C.transport={...raw.transport};if(raw.transport.vessel&&typeof raw.transport.vessel==='object'){const v=raw.transport.vessel,n=vesselOf(v);if(v.imo==null&&n.imo!=null||v.voyage==null&&n.voyage!=null)notes.converted.push('Vessel: imoNumber / voyageNumber read as imo / voyage');C.transport.vessel={...v,...n}}
  if(Array.isArray(raw.transport.vehicles))C.transport.vehicles=raw.transport.vehicles.map(v=>v&&VEH_ALIAS[akey(v.type)]&&v.type!=='lorry'?(notes.converted.push(`vehicle ${v.id}: type "${v.type}" read as "lorry"`),{...v,type:'lorry'}):v)}
 if(Array.isArray(C.routes))C.routes.forEach(r=>{if(r)delete r._transportId});
 const TR=raw.tracking&&typeof raw.tracking==='object'?raw.tracking:null;if(TR){const lvl=TR.level||(TR.individualMelonVerified===true&&/individual|item/.test(akey(TR.mode))?'item':TR.mode!=null?'batch':undefined);
  C.tracking={level:lvl,batchId:TR.batchId,palletId:TR.palletId,containerId:TR.containerId,crateId:TR.crateId,itemId:pick(TR,'itemId','melonId'),simulatedItem:lvl!=='item'};if(TR.level==null&&TR.mode!=null)notes.converted.push(`tracking.mode "${TR.mode}" read as level "${lvl}"`)}
 /* stages: aliases to the supported types; several steps of one type merge into one stage; travel legs are routes, not stages */
 if(Array.isArray(raw.stages)){const src=raw.stages.every(s=>s&&typeof s.order==='number')?[...raw.stages].sort((a,b)=>a.order-b.order):raw.stages,out=[],at={};let legs=0,merged=0;
  for(const s of src){if(!s||typeof s!=='object'){out.push(s);continue}const k=akey(s.type);if(LEG_STAGE[k]){legs++;continue}const t=STAGE_TYPES.includes(s.type)?s.type:STAGE_ALIAS[k]||STAGE_ALIAS[k.replace(/_/g,'')];
   if(!t){out.push({...s});continue}const evs=Array.isArray(s.events)?s.events.map(e=>e&&e.timestamp!=null?{...e,timestamp:adaptDate(e.timestamp,notes,'stage '+s.id)}:e):[];
   if(s.eventTime!=null&&MAIN_EVENT[t])evs.push({type:MAIN_EVENT[t],timestamp:adaptDate(s.eventTime,notes,'stage '+s.id),simulated:akey(s.eventStatus)==='simulated'||undefined});
   if(at[t]){merged++;at[t].events.push(...evs);continue}const o={id:s.id,type:t,locationId:s.locationId,title:s.title,summary:s.summary,data:s.data,events:evs};if(s.type!==t)notes.converted.push(`stage ${s.id}: type "${s.type}" read as "${t}"`);at[t]=o;out.push(o)}
  if(legs)notes.converted.push(`${legs} travel stage${legs>1?'s':''} (road transport) folded into the route legs`);if(merged)notes.converted.push(`${merged} step${merged>1?'s':''} merged into a stage of the same type`);
  const add=(t,after,why)=>{if(at[t]||!at[after])return;const o={id:at[after].id+'-'+t,type:t,locationId:at[after].locationId,events:[]};out.splice(out.indexOf(at[after])+(STAGE_TYPES.indexOf(t)<STAGE_TYPES.indexOf(after)?0:1),0,o);at[t]=o;notes.converted.push(why)};
  add('farm','harvest','No growing stage in the file: a farm stage was added at the harvest location, with no data');add('customs','unloading','No customs stage in the file: a customs stage was added at the arrival port, with no data');
  out.sort((a,b)=>(a&&STAGE_TYPES.includes(a.type)?STAGE_TYPES.indexOf(a.type):99)-(b&&STAGE_TYPES.includes(b.type)?STAGE_TYPES.indexOf(b.type):99));C.stages=out}else C.stages=raw.stages;
 const Q=raw.qualityControl&&typeof raw.qualityControl==='object'?raw.qualityControl:null;if(Q){C.qualityControl={...Q,date:Q.date!=null?adaptDate(Q.date,notes,'qualityControl'):adaptDate(Q.inspectionDate,notes,'qualityControl')};if(Q.date==null&&Q.inspectionDate!=null)notes.converted.push('qualityControl.inspectionDate read as date')}
 return C}
/* what the preview lists as "not provided": optional values the journey can show when present */
function missingOptional(C){const m=[],T=C.transport||{},v=T.vessel||{},TR=C.tracking||{},Q=C.qualityControl||{},has=x=>x!=null&&x!=='';
 if(!has(C.manifest&&C.manifest.product))m.push('Product');if(!has(v.name))m.push('Vessel name');if(!has(v.imo))m.push('Vessel IMO number');if(!has(v.voyage))m.push('Voyage number');
 if(!(T.containers||[]).length)m.push('Container');if(!has(TR.batchId))m.push('Batch id');if(!has(TR.palletId))m.push('Pallet id');if(!(T.vehicles||[]).length)m.push('Lorry references');
 if(typeof Q.inspected!=='number')m.push('Quality control quantities');if(!has(Q.date))m.push('Quality control date');
 const st=Array.isArray(C.stages)?C.stages:[];if(!st.some(s=>s&&(s.events||[]).some(e=>e&&has(e.timestamp))))m.push('Stage dates and times');
 if(!(Array.isArray(C.routes)?C.routes:[]).some(r=>r&&Array.isArray(r.geometry)&&r.geometry.length))m.push('Route geometry (legs will be straight lines)');if(!st.some(s=>s&&s.type==='claims'))m.push('Claims stage');return m}
/* the one entry point for any source: detect, adapt, validate. Returns everything the preview needs; nothing is activated here. */
function prepareManifest(raw,opts){const notes={converted:[],problems:[]},st={};let fmt=null,C=null;
 if(!raw||typeof raw!=='object'||Array.isArray(raw))return{format:null,manifest:null,converted:[],missing:[],errors:['The file does not contain a JSON object.'],needOrder:false};
 fmt=FORMATS.find(f=>{try{return f.detect(raw)}catch(e){return false}});
 if(!fmt)return{format:null,manifest:null,converted:[],missing:[],needOrder:false,errors:['This file\'s structure was not recognised. A manifest needs a "locations" list whose entries each have a role (or type) of farm, export port, arrival port, warehouse or supermarket. Start from the JSON template, or see docs/MANIFEST.md for the supported formats.']};
 try{C=fmt.convert(raw,notes,opts||{},st)}catch(e){return{format:fmt,manifest:null,converted:notes.converted,missing:[],needOrder:false,errors:['This file could not be converted: '+e.message]}}
 const errors=[...notes.problems];if(st.needOrder)errors.push('Coordinates are written as pairs, but the file does not say whether they are [longitude, latitude] or [latitude, longitude], and the values fit both. Choose the order below, or write them as {"lon": …, "lat": …}.');
 else errors.push(...validateManifest(C));
 return{format:fmt,manifest:C,converted:notes.converted,missing:missingOptional(C),errors,needOrder:!!st.needOrder}}
