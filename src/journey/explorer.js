'use strict';
/* ================= Shipment Explorer =================
   Loads exporter shipment manifests (normalized by src/data/shipment.js, from manifests/shipments/ or an .xlsx picked in the browser),
   and drives the journey from them: real ports and vessel, the intended customer's supermarket, and a shipment block in every stage panel.
   One shared selection state (SHIP) holds the shipment, filters and selected record; every view reads it, and changing a filter never
   restarts the journey. What the manifest does not say (farm, dates, warehouse, QC, customs, delivery) is shown as not recorded. */
/* the explorer follows one final customer's whole allocation (every record, every variety); there is no product-level filter */
const SHIP={list:[],active:null,f:{customer:''},open:false};
/* public port positions for the ports a manifest names; a port not listed here cannot be placed, and the journey says so */
const PORT_GAZ={'NATAL, BRAZIL':{name:'Port of Natal',country:'Brazil',lon:-35.205,lat:-5.766,sea:90},'NATAL':{name:'Port of Natal',country:'Brazil',lon:-35.205,lat:-5.766,sea:90},
 'DOVER':{name:'Port of Dover',country:'United Kingdom',lon:1.33,lat:51.12,sea:135},'DOVER, UK':{name:'Port of Dover',country:'United Kingdom',lon:1.33,lat:51.12,sea:135}};
const shipRecs=()=>SHIP.active?SHIPMENT.filterRecords(SHIP.active.records,SHIP.f):[],shipAll=()=>SHIP.active?SHIP.active.records:[];
/* melons per carton: the manifest's Count, trusted only if every record's Count equals the size in its own product description
   ("... SIZE 12" with Count 12); otherwise no melon total is shown */
function shipMelons(R){let n=0;for(const r of R){const m=(r.description||'').match(/SIZE\s+(\d+)/i),c=parseInt(r.count,10);if(!m||!isFinite(c)||+m[1]!==c||r.cartons==null)return null;n+=c*r.cartons}return n}
/* the followed allocation, for the tracker label */
function shipAlloc(){if(!SHIP.active||!DATA.man||DATA.man.id!==SHIP.active.id||!SHIP.f.customer)return null;const t=SHIPMENT.totals(shipRecs()),b=BRANDS[brandKey(SHIP.f.customer)];return{name:b?b.name:SHIP.f.customer,cartons:t.cartons,pallets:t.pallets,varieties:SHIPMENT.distinct(shipRecs(),'variety').length,line:`${fmtN(t.cartons,0)} cartons on ${fmtP(t.pallets)} pallets, ${SHIPMENT.distinct(shipRecs(),'variety').length} varieties`}}
const fmtN=(v,d)=>v==null?'—':Number(v).toLocaleString('en-GB',{maximumFractionDigits:d==null?2:d}),fmtP=v=>fmtN(Math.round(v*100)/100,2);
/* ---- the journey built from a shipment: only what the manifest says, the rest marked illustrative or left out ---- */
function shipJourney(S){const sh=S.shipment,dep=PORT_GAZ[(sh.portOfDeparture||'').toUpperCase()],arr=PORT_GAZ[(sh.portOfEntry||'').toUpperCase()];
 if(!dep||!arr)return{error:`The manifest's ports (${sh.portOfDeparture||'none'} → ${sh.portOfEntry||'none'}) cannot be placed on the map.`};
 const RC=SHIP.f.customer?S.records.filter(r=>r.finalCustomer===SHIP.f.customer):S.records,t=SHIPMENT.totals(RC),wk=sh.departureWeek,wkTxt=wk&&wk.week?`Week ${wk.week}, ${wk.year}`:null,cust=SHIPMENT.distinct(S.records,'finalCustomer');
 const nr=' (not in the manifest; placed for illustration)';
 return{schemaVersion:'1.0',manifest:{id:S.id,reference:`${sh.vessel} ${wk?wk.raw:''}`.trim(),demo:false,description:`Shipment manifest ${S.source.file||''}: ${SHIP.f.customer?SHIP.f.customer+' allocation':'all customers'}, ${t.records} cargo records. Farm, warehouse and store locations are not in the manifest and are shown for illustration.`,
   product:SHIPMENT.distinct(RC,'description').join(', '),quantity:{boxes:t.cartons,pallets:Math.round(t.pallets*100)/100,...(shipMelons(RC)!=null?{melons:shipMelons(RC)}:{})}},
  tracking:{level:'batch',simulatedItem:true},
  locations:[{id:'FARM',role:'farm',name:'Farm'+nr,country:dep.country,coordinates:{lon:dep.lon-.55,lat:dep.lat-.1},coordinateSource:'illustrative',note:'The manifest does not identify the farm.'},
   {id:'POL',role:'exportPort',name:dep.name,country:dep.country,coordinates:{lon:dep.lon,lat:dep.lat},coordinateSource:'actual',seaBearingDeg:dep.sea},
   {id:'POE',role:'arrivalPort',name:arr.name,country:arr.country,coordinates:{lon:arr.lon,lat:arr.lat},coordinateSource:'actual',seaBearingDeg:arr.sea},
   {id:'WH',role:'warehouse',name:'UK warehouse'+nr,country:arr.country,coordinates:{lon:arr.lon-.45,lat:arr.lat+.12},coordinateSource:'illustrative'},
   {id:'SM',role:'supermarket',name:(SHIP.f.customer||cust.join(' / ')||'Customer')+' store'+nr,country:arr.country,coordinates:{lon:arr.lon-1.3,lat:arr.lat+.35},coordinateSource:'illustrative'}],
  retailer:shipRetailer(),transport:{vessel:{name:sh.vessel||null}},
  stages:[{id:'S1',type:'farm',locationId:'FARM'},{id:'S2',type:'harvest',locationId:'FARM'},{id:'S3',type:'exportPort',locationId:'POL'},/* the departure week is not a date, so it is shown in the shipment block, not as a departure event */
   {id:'S4',type:'ocean'},{id:'S5',type:'customs',locationId:'POE'},{id:'S6',type:'unloading',locationId:'POE'},{id:'S7',type:'warehouse',locationId:'WH'},{id:'S8',type:'qualityControl',locationId:'WH'},{id:'S10',type:'delivery',locationId:'SM'}]}}
/* the supermarket wears the selected customer (or, with all customers, the one chosen to view) */
function shipRetailer(){const c=SHIP.f.customer||(SHIP.active?SHIPMENT.distinct(SHIP.active.records,'finalCustomer')[0]:'');return c?{id:c.toLowerCase(),name:BRANDS[brandKey(c)]?BRANDS[brandKey(c)].name:c,store:{name:`${BRANDS[brandKey(c)]?BRANDS[brandKey(c)].name:c} (intended customer)`}}:null}
/* ---- loading ---- */
async function shipInit(){try{const r=await fetch('manifests/shipments/index.json',{cache:'no-cache'});if(r.ok){const j=await r.json();SHIP.list=(j.shipments||[]).map(s=>({key:'s:'+s.file,label:s.label,file:s.file}))}}catch(e){}
 shipUI()}
async function shipSelect(key){const e=SHIP.list.find(x=>x.key===key);if(!e)return;if(!e.data){const r=await fetch('manifests/shipments/'+e.file,{cache:'no-cache'});e.data=await r.json()}shipUse(e.data,e.key)}
function shipUse(S,key){SHIP.active=S;SHIP.key=key;shipUI();SHIP.f={customer:SHIPMENT.distinct(S.records,'finalCustomer')[0]||''};const J=shipJourney(S);
 if(J.error){shipMsg(J.error);shipRender();return}const r=useManifest(J,'ship:'+S.id,`${S.shipment.vessel} · shipment manifest`,'shipment');if(!r.ok)shipMsg('The journey could not be built: '+r.errors.join('; '));else{shipMsg('');syncManifestUI()}shipRender()}
/* an .xlsx picked in the browser: the zip is opened with DecompressionStream, then the same normalization as the command-line importer */
async function shipReadXlsx(file){const buf=new Uint8Array(await file.arrayBuffer()),dv=new DataView(buf.buffer);let e=buf.length-22;while(e>=0&&dv.getUint32(e,true)!==0x06054b50)e--;if(e<0)throw new Error('not an .xlsx file');
 const parts={};let p=dv.getUint32(e+16,true);for(let i=0,n=dv.getUint16(e+10,true);i<n;i++){const m=dv.getUint16(p+10,true),cs=dv.getUint32(p+20,true),nl=dv.getUint16(p+28,true),xl=dv.getUint16(p+30,true),cl=dv.getUint16(p+32,true),lo=dv.getUint32(p+42,true),name=new TextDecoder().decode(buf.subarray(p+46,p+46+nl));
  const d=lo+30+dv.getUint16(lo+26,true)+dv.getUint16(lo+28,true),raw=buf.subarray(d,d+cs);parts[name]=async()=>m===0?new TextDecoder().decode(raw):await new Response(new Blob([raw]).stream().pipeThrough(new DecompressionStream('deflate-raw'))).text();p+=46+nl+xl+cl}
 const {sheet,rows}=await SHIPMENT.workbookRows(async n=>parts[n]?parts[n]():null);return SHIPMENT.normalizeShipment(rows,{file:file.name,sheet,importedAt:new Date().toISOString().slice(0,10)})}
/* ---- the explorer drawer ---- */
function shipMsg(t){const b=$('#shErr');if(b){b.hidden=!t;b.textContent=t||''}}
function shipUI(){const sel=$('#shSel');if(!sel)return;sel.innerHTML=`<option value="">Choose a shipment…</option>`+SHIP.list.map(s=>`<option value="${esc(s.key)}"${s.key===SHIP.key?' selected':''}>${esc(s.label)}</option>`).join('')}
function shipOpen(on){SHIP.open=on==null?!SHIP.open:on;$('#shipX').classList.toggle('show',SHIP.open);$('#bShip').classList.toggle('on',SHIP.open);if(SHIP.open)shipRender()}
function shipRender(){const box=$('#shBody');if(!box)return;const S=SHIP.active;if(!S){box.innerHTML='<p class="na">No shipment manifest loaded. Choose one above, or import an Excel manifest.</p>';return}
 const A=shipAll(),R=shipRecs(),t=SHIPMENT.totals(R),sh=S.shipment,v=S.validation,cust=SHIPMENT.distinct(A,'finalCustomer'),mel=shipMelons(R),vars=SHIPMENT.distinct(R,'variety');
 box.innerHTML=`<label class="shc">Final destination<select data-f="customer">${cust.map(c=>`<option${SHIP.f.customer===c?' selected':''}>${esc(c)}</option>`).join('')}</select></label>
  <dl class="shs"><dt>Vessel</dt><dd>${esc(sh.vessel||'not recorded')}</dd><dt>Departure port</dt><dd>${esc(sh.portOfDeparture||'not recorded')}</dd><dt>Destination port</dt><dd>${esc(sh.portOfEntry||'not recorded')}</dd>
  <dt>Departure week</dt><dd>${sh.departureWeek?esc(`${sh.departureWeek.raw} (week ${sh.departureWeek.week}, ${sh.departureWeek.year})`):'not recorded'}</dd><dt>Supermarket</dt><dd>${esc(SHIP.f.customer||'—')} <span class="na">(intended customer)</span></dd>
  <dt>Cartons</dt><dd>${fmtN(t.cartons,0)}</dd><dt>Pallets</dt><dd>${fmtP(t.pallets)}</dd><dt>Varieties</dt><dd>${vars.length}</dd>
  <dt>Melons</dt><dd>${mel!=null?fmtN(mel,0)+' <span class="na">(Count × Cartons; each record\'s Count matches its product size)</span>':'<span class="na">not calculable from the manifest</span>'}</dd><dt>Records</dt><dd>${t.records} of ${A.length}</dd></dl>
  <p class="shv">Checked against the manifest summary: cartons ${v.cartons.ok?'match':'differ'} (${fmtN(v.cartons.stated,0)}), pallets ${v.pallets.ok?'match':'differ'} (${fmtP(v.pallets.stated)}); ${v.skipped.length} subtotal or empty rows left out. ${cust.map(c=>{const x=SHIPMENT.totals(A.filter(r=>r.finalCustomer===c));return`${esc(c)} ${fmtN(x.cartons,0)} cartons`}).join(' + ')} = ${fmtN(SHIPMENT.totals(A).cartons,0)}. Source: ${esc(S.source.file||'')}, sheet ${esc(S.source.sheet||'')}.</p>${srcStatusHTML()}`}
/* switching customer: the journey's data, labels and store change in place; the journey keeps playing where it is */
function shipSet(f,v){if(f!=='customer')return;SHIP.f.customer=v;shipRefresh();shipRender();if(STATE.panel)showPanel(STATE.pi,STATE.obj);TRK.key=''}
function shipRefresh(){if(!SHIP.active||!DATA.man||DATA.man.id!==SHIP.active.id)return;const J=shipJourney(SHIP.active);if(J.error)return;const P=prepareManifest(J);if(P.errors.length)return;
 const N=normalizeManifest(P.manifest);DATA.records=N.records;DATA.man=N;if(ACTIVE)ACTIVE.obj=J;applyBrand(N);syncManifestUI()}
function shipBrand(){if(!DATA.man||!SHIP.active||DATA.man.id!==SHIP.active.id)return;DATA.man.retailer=shipRetailer();applyBrand(DATA.man)}
/* a click on cargo in the 3D scene opens the explorer on the records it carries (all of them: a pallet or container is not one record) */
function shipOnPick(e){if(!SHIP.active||!e)return;const cargo=[TID.crate,TID.pallet,TID.cont,TID.cargo,TID.melon].includes(e.id)||/lorry|vessel|container|pallet|crate|forklift/i.test(e.name||'');if(cargo)shipOpen(true)}
function initExplorer(){const sel=$('#shSel');if(!sel)return;$('#bShip').onclick=()=>shipOpen();$('#shX').onclick=()=>shipOpen(false);sel.onchange=()=>sel.value&&shipSelect(sel.value);
 $('#shImp').onclick=()=>$('#shFile').click();$('#shFile').onchange=async()=>{const f=$('#shFile').files[0];$('#shFile').value='';if(!f)return;if(/\.csv$/i.test(f.name)){srcImport(f);return}try{const S=await shipReadXlsx(f),k='x:'+f.name;SHIP.list=SHIP.list.filter(x=>x.key!==k).concat([{key:k,label:'Imported · '+f.name,data:S}]);SHIP.key=k;shipUI();shipUse(S,k)}catch(x){shipMsg(`"${f.name}" could not be read: ${x.message}`)}};
 const b=$('#shBody');b.addEventListener('change',e=>{const f=e.target.dataset&&e.target.dataset.f;if(f)shipSet(f,e.target.value)});
 shipInit();srcInit();if(typeof hkLoad==='function')hkLoad()}
/* ---- the shipment block in each stage panel: the filtered records, and what this stage can and cannot say from the manifest ---- */
function shipStageHTML(i){const S=SHIP.active;if(!S||!DATA.man||DATA.man.id!==S.id)return'';const R=shipRecs(),t=SHIPMENT.totals(R),sh=S.shipment,who=SHIP.f.customer||'All customers',mel=shipMelons(R),row=(k,v)=>`<dt>${k}</dt><dd>${v}</dd>`;
 const bd=(f,n)=>SHIPMENT.breakdown(R,f).slice(0,n||4).map(b=>`${esc(b.key)}: ${fmtN(b.cartons,0)} cartons`).join('<br>'),traces=SHIPMENT.distinct(R,'trace'),nr='<span class="na">not in the manifest</span>';
 /* every stage speaks for the whole allocation */
 const per={0:[row('Origin',esc((sh.portOfDeparture||'').split(',').pop().trim()||'not recorded')),row('Harvest date',nr)],
  1:[row('Products',bd('description')),row('Varieties',esc(SHIPMENT.distinct(R,'variety').join(', '))),row('Brands',esc(SHIPMENT.distinct(R,'brand').join(', '))),row('Trace codes',`${traces.length}: ${esc(traces.slice(0,6).join(', '))}${traces.length>6?'…':''}`)],
  2:[row('Port',esc(sh.portOfDeparture||'not recorded')),row('Departure week',sh.departureWeek?esc(sh.departureWeek.raw):'not recorded'),row('Containers (Nº CNTR)',SHIPMENT.distinct(R,'container').length?esc(SHIPMENT.distinct(R,'container').join(', ')):nr)],
  3:[row('Vessel',esc(sh.vessel||'not recorded')),row('Route',esc(`${sh.portOfDeparture} → ${sh.portOfEntry}`)),row('Sailing dates',nr),row('Allocation',bd('finalCustomer'))],
  4:[row('Port of entry',esc(sh.portOfEntry||'not recorded')),row('Customs status',nr)],5:[row('Cargo records',`${t.records} (open the Shipment Explorer to inspect them)`)],
  6:[row('Allocation',bd('finalCustomer')),row('Varieties',esc(SHIPMENT.distinct(R,'variety').join(', '))),row('Note','The intended customer from the manifest; not proof of stock, picking or dispatch.')],
  7:[row('Trace codes',String(traces.length))],8:[row('Claims',nr)],
  9:[row('Total Amount (manifest)',t.totalAmount?esc(fmtN(t.totalAmount,2)+' '+(sh.currency||'')):nr),row('Note','The manifest\'s line amounts for this allocation, as recorded; not an invoice. Invoice, purchase and sales records are not in the manifest, so nothing is reconciled.')],
  10:[row('Intended customer',esc(SHIP.f.customer||SHIPMENT.distinct(R,'finalCustomer').join(' / '))),row('Arriving',bd('variety',8)),row('Delivery records',nr),row('Note','The store shows the intended destination, not a confirmed delivery.')]}[i]||[];
 return`<h3 style="--c:#f2b33d">Shipment manifest</h3><dl class="dest">${row('Shipment',esc(`${sh.vessel} · ${sh.departureWeek?sh.departureWeek.raw:''}`))}${row('Customer',esc(who))}${row('Cartons',fmtN(t.cartons,0))}${row('Pallets',fmtP(t.pallets))}${row('Varieties',String(SHIPMENT.distinct(R,'variety').length))}${mel!=null?row('Melons',fmtN(mel,0)+' (Count × Cartons)'):''}${per.join('')}</dl>${i===0?farmHTML():i===7?qcHTML():''}<p><button class="chip" onclick="shipOpen(true)">Open Shipment Explorer</button></p>`}

/* ---- the allocation's full contents, under the tracker in the stage panel ----
   Variety cards (collapsible) > products (totals, record count, trace-code chips) > a compact record list; a record opens a detail view
   with every Excel field. One scrollbar (the panel's). What is open stays open from stage to stage. Viewing never changes the allocation. */
SHIP.openK=new Set();SHIP.moreK=new Set();SHIP.detail=null;
const SHIPF=[['idNavio','IDnavio'],['trace','Trace'],['finalCustomer','Final customer'],['description','Product (B1_DESCING_2)'],['variety','Variety'],['brand','Brand'],['weight','Weight'],['count','Count'],['cfrPerBox','CFR x Box'],['cartons','Cartons'],['pallets','Pallets'],
 ['netWeight','Net Weight'],['grossWeight','Gross Weight'],['totalAmount','Total Amount'],['container','Nº CNTR'],['temptale','Temptale'],['chep','Chep'],['grafted','Grafted'],['insert','Insert'],['plu','Plu'],['du','DU'],['row','Sheet row']];
const fmtV=(f,v)=>v==null||v===''?null:f==='pallets'?fmtN(v,4):f==='row'?String(v):typeof v==='number'?fmtN(v,2):String(v);
function shipAllocHTML(){return shipAlloc()?`<section id="shAl">${shipAllocInner()}</section>`:''}
function shipAllocInner(){const R=shipRecs();
 if(SHIP.detail){const r=R.find(x=>x.rid===SHIP.detail);if(r)return`<button class="alb" data-back>‹ Back to breakdown</button><div class="ald"><h4>${esc(r.idNavio||r.rid)}</h4><p>${esc(r.description||'')} · ${esc(r.variety||'')}</p>
   <dl>${SHIPF.map(([f,l])=>{const v=fmtV(f,r[f]);return`<dt>${l}</dt><dd${v==null?' class="na"':''}>${v==null?'not recorded':esc(v)}</dd>`}).join('')}</dl></div>`;SHIP.detail=null}
 const op=k=>SHIP.openK.has(k)?' open':'',fq=rs=>{const t=SHIPMENT.totals(rs);return`<span class="q">${fmtN(t.cartons,0)}<i>ctn</i></span><span class="q">${fmtP(t.pallets)}<i>plt</i></span>`};
 const byV={};for(const r of R){const v=r.variety||'Variety not recorded',d=r.description||'Product not recorded';((byV[v]=byV[v]||{})[d]=byV[v][d]||[]).push(r)}
 const V=Object.entries(byV).map(([v,ds])=>({v,ds,all:Object.values(ds).flat()})).sort((a,b)=>SHIPMENT.totals(b.all).cartons-SHIPMENT.totals(a.all).cartons);
 return`<div class="alt"><b>Cargo breakdown</b><span>${V.length} varieties · ${R.length} records</span></div>${V.map(({v,ds,all})=>`<details class="alv" data-k="v:${esc(v)}"${op('v:'+v)}><summary><b>${esc(v)}</b>${fq(all)}<i class="chev"></i></summary>
  ${Object.entries(ds).map(([d,rs])=>{const k=v+'|'+d,tr=SHIPMENT.distinct(rs,'trace'),more=SHIP.moreK.has(k),show=more?tr:tr.slice(0,4);
   return`<div class="alp"><div class="alph"><b>${esc(d)}</b>${fq(rs)}</div><div class="alm">${rs.length} records · brand ${esc(SHIPMENT.distinct(rs,'brand').join(', ')||'—')}</div>
    <div class="alc">${show.map(x=>`<span class="tc" title="Trace code">${esc(x)}</span>`).join('')}${tr.length>4?`<button class="alx" data-more="${esc(k)}">${more?'Show fewer':'Show all '+tr.length}</button>`:''}</div>
    <details class="alr" data-k="r:${esc(k)}"${op('r:'+k)}><summary>Cargo records</summary><ul>${rs.map(r=>`<li data-rec="${r.rid}"><b>${esc(r.idNavio||r.rid)}</b><span>${esc(r.trace||'—')}</span><span>${fmtN(r.cartons,0)} ctn</span><span>${fmtV('pallets',r.pallets)||'—'} plt</span></li>`).join('')}</ul></details></div>`}).join('')}</details>`).join('')}`}
document.addEventListener('toggle',e=>{const d=e.target;if(!d||d.tagName!=='DETAILS'||!d.dataset.k)return;if(d.open)SHIP.openK.add(d.dataset.k);else SHIP.openK.delete(d.dataset.k)},true);
document.addEventListener('click',e=>{const box=e.target.closest&&e.target.closest('#shAl');if(!box)return;const t=e.target.closest('[data-rec],[data-back],[data-more]');if(!t)return;
 if(t.dataset.rec)SHIP.detail=t.dataset.rec;else if(t.hasAttribute('data-back'))SHIP.detail=null;else{const k=t.dataset.more;SHIP.moreK.has(k)?SHIP.moreK.delete(k):SHIP.moreK.add(k)}
 box.innerHTML=shipAllocInner();if(t.dataset.rec||t.hasAttribute('data-back'))box.scrollIntoView({block:'nearest'})});
/* starting the journey (Play, a stage step, Prev/Next, Replay, or play on the play/pause button) closes the explorer so the journey is in
   view; choosing a shipment or customer inside the explorer does not */
document.addEventListener('click',e=>{if(!SHIP.open||!e.target.closest)return;const t=e.target.closest('#bPlay,#bExplore,#bRe,#bPrev,#bNext,#tl button,#bPP');if(!t)return;
 if(t.id==='bPP'&&STATE.playing&&STATE.t<SCRIPT[STATE.idx].dur-.01)return;/* pausing keeps it open */shipOpen(false)},true);

/* ================= Farm List and QC Report (src/data/sources.js) =================
   Loaded from manifests/sources/ (scripts/csv-to-sources.mjs) or a CSV picked in the explorer; each dataset is optional and independent.
   Stage 1 shows a farm only through a verified link; Stage 8 shows QC reports for the followed allocation, verified ones apart from
   possible ones (with the reasons and conflicts). Nothing here changes the manifest, the allocation, or the 3D journey. */
const SRC={farms:null,qc:null,msg:''};
async function srcInit(){for(const k of['farms','qc'])try{const r=await fetch('manifests/sources/'+k+'.json',{cache:'no-cache'});if(r.ok)SRC[k]=await r.json()}catch(e){}srcChanged()}
async function srcImport(f){try{const t=await f.text(),k=SOURCES.detect(t);if(!k)throw new Error('the header row is neither a Farm List nor a QC Report');
  SRC[k]=k==='farms'?SOURCES.farmsFromCSV(t,{file:f.name}):SOURCES.qcFromCSV(t,{file:f.name});SRC.msg=`${f.name}: ${SRC[k].validation.records} ${k==='farms'?'farm areas':'QC records'} imported.`;shipMsg('')}
 catch(x){shipMsg(`"${f.name}" could not be read: ${x.message}`)}srcChanged()}
function srcChanged(){shipRender();if(STATE.panel)showPanel(STATE.pi,STATE.obj)}
const srcQC=()=>SHIP.active&&SRC.qc?SOURCES.matchQC(SHIP.active,SRC.qc,SHIP.f.customer):null;
function srcStatusHTML(){const F=SRC.farms,Q=SRC.qc,m=srcQC(),fv=F&&F.validation,qv=Q&&Q.validation;
 return`<h4 class="srh">Data sources</h4>${SRC.msg?`<p class="shv">${esc(SRC.msg)}</p>`:''}<dl class="shs">
  <dt>Farm List</dt><dd>${F?`${fv.records} farm areas, ${fv.farms} farms <span class="na">(${esc(F.source.file||'')})</span>${fv.duplicateRows.length?`<br><span class="na">Repeated rows kept: ${fv.duplicateRows.join(', ')}</span>`:''}${fv.noArea.length?`<br><span class="na">Rows without areas: ${fv.noArea.join(', ')}</span>`:''}`:'<span class="na">not loaded (import farm_list.csv)</span>'}</dd>
  <dt>QC Report</dt><dd>${Q?`${qv.records} records, ${qv.vessels} vessels <span class="na">(${esc(Q.source.file||'')})</span><br><span class="na">Status values (not interpreted): ${esc(Object.entries(qv.byStatus).map(([k,v])=>k+' '+v).join(', '))}</span>`:'<span class="na">not loaded (import the QC Report CSV)</span>'}</dd>
  <dt>Farm link</dt><dd>${esc(SOURCES.linkFarm(SHIP.active,F).status==='verified'?'verified':'not linked')}</dd>
  <dt>QC links</dt><dd>${m?`${m.verified.length} verified, ${m.possible.length} possible (same vessel) for ${esc(SHIP.f.customer||'all customers')}`:'<span class="na">—</span>'}</dd></dl>`}
const srcRow=(k,v)=>`<dt>${k}</dt><dd${v==null?' class="na"':''}>${v==null?'not recorded':esc(v)}</dd>`,srcOp=k=>SHIP.openK.has(k)?' open':'';
function farmHTML(){const F=SRC.farms,L=SOURCES.linkFarm(SHIP.active,F),f=L.farm;
 const body=L.status==='verified'?`<dl class="dest">${srcRow('Farm name',f.farmName)}${srcRow('Farm code',f.farmCode)}${srcRow('Area name',f.areaName)}${srcRow('Area code',f.areaCode)}${srcRow('Location',f.location)}</dl>`
  :`<p class="na">Farm origin not yet linked to this shipment.</p><p class="na">${esc(L.reason)}</p>`;
 const dir=F?`<details class="srd" data-k="fdir"${srcOp('fdir')}><summary>View available farms <i>${F.validation.farms} farms · ${F.validation.records} areas</i></summary><ul class="srl">${F.farms.map(x=>`<li><b>${esc(x.farmName||'—')}</b><span>code ${esc(x.farmCode||'—')}</span><span>${x.areas} area${x.areas===1?'':'s'}</span><span>${esc(x.locations.join(', ')||'location not recorded')}</span></li>`).join('')}</ul><p class="na">Reference directory only; not linked to this shipment.</p></details>`:'';
 return`<details class="srs" data-k="farm"${srcOp('farm')}><summary>Farm Details</summary>${body}${dir}</details>`}
function qcCard(e,poss){const q=e.rec,k='qc:'+q.id,v=x=>x&&x!=='FALSE'?x:null;
 return`<details class="srq" data-k="${k}"${srcOp(k)}><summary><b>${esc(v(q.dateInspected)||'Not inspected')}</b><span>${esc(q.product||'')} · ${esc(q.variety||'')}</span><span class="na">status ${esc(q.status||'—')}</span></summary>
  <dl class="dest">${srcRow('Inspection date',v(q.dateInspected))}${srcRow('Product',q.product)}${srcRow('Variety',q.variety)}${srcRow('Supplier',q.supplier)}${srcRow('Customer',q.customer)}${srcRow('Inspector',q.inspector)}
  ${srcRow('Pallet traceability',q.palletTrace)}${srcRow('Box traceability',q.boxTrace)}${srcRow('Brix',q.brix)}${srcRow('Fruit weights',q.fruitWeights)}${srcRow('Boxes tested',q.boxesTested)}${srcRow('Boxes with defects',q.boxesWithDefects)}
  ${srcRow('Progressive defects',[q.progressiveDefects,q.progressiveDefectsNo].filter(Boolean).join(' · ')||null)}${srcRow('Non-progressive defects',[q.nonProgressiveDefects,q.nonProgressiveDefectsNo].filter(Boolean).join(' · ')||null)}${srcRow('Total defects %',q.totalDefectsPct)}${srcRow('Notes',q.notes)}${srcRow('Report status',q.status)}</dl>
  ${poss?`<p class="srw"><b>Why related:</b> ${esc(e.reasons.join('; '))}</p><p class="srw bad"><b>Conflicts:</b> ${esc(e.conflicts.join('; ')||'none')}</p>`:''}
  <details class="srd" data-k="${k}:raw"${srcOp(k+':raw')}><summary>All original fields (CSV row ${q.row})</summary><dl class="dest">${Object.entries(q.raw).map(([h,x])=>srcRow(esc(h),x===''?null:x)).join('')}</dl></details></details>`}
function qcHTML(){const m=srcQC();if(!m)return`<details class="srs" data-k="qc"${srcOp('qc')}><summary>Quality Control Reports</summary><p class="na">No QC Report loaded.</p></details>`;
 const V=m.verified,P=m.possible;
 return`<details class="srs" data-k="qc"${srcOp('qc')}><summary>Quality Control Reports <i>${V.length} verified</i></summary>${V.length?V.map(e=>qcCard(e,false)).join(''):'<p class="na">No QC report is verified for this allocation. A verified report needs a pallet ID in this allocation and no conflicting shipment details.</p>'}
  <p class="na">The report Status field is shown as recorded; it is not read as QC approval.</p></details>
  ${P.length?`<details class="srs" data-k="qcp"${srcOp('qcp')}><summary>Potentially Related QC Records <i>${P.length}</i></summary><p class="srw">Same vessel, but not conclusively this shipment; not counted in confirmed QC totals.${P.some(e=>e.conflicts.some(c=>c.startsWith('arrival port')))?` These inspections record arrival at ${esc([...new Set(P.map(e=>e.rec.portOfArrival))].join(', '))}; the manifest's port of entry is ${esc(SHIP.active.shipment.portOfEntry||'not recorded')}.`:''}</p>${P.map(e=>qcCard(e,true)).join('')}</details>`:''}`}
