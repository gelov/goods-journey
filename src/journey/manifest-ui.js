'use strict';
/* ================= applying a manifest to the journey, and the picker in Settings =================
   applyManifest() is the only place that pushes shipment data into the running journey: site coordinates and names, port
   orientation, route lines, camera way-points, country labels, which stages exist, and a clean restart. Nothing from the
   previous manifest survives it. The 3D models, paths and timelines are untouched: they are the reusable scene templates. */
const introView=()=>({lon:GLOBE_VIEW.lon-10,lat:clamp(GLOBE_VIEW.lat-14,-60,60),ry:0,rx:1.45,ld:Math.log(44000)});
function applyManifest(N){const gc=(p,q,t)=>ull(slerp(llu(p[0],p[1]),llu(q[0],q[1]),t));
 SITES.forEach((S,k)=>{const l=N.loc[ROLES[k]];S.g=[l.lon,l.lat];S.n=l.label;S.note=l.illustrative?'illustrative location':''});
 /* a port's 3D quay is turned so its water faces the bearing given in the manifest */
 setPortRot(N);
 buildRoutes(N.routes);routeManifest(N);applyBrand(N);
 const f=SITES[0].g,a=SITES[2].g,w=SITES[3].g,e=SITES[4].g,mdl=gc(f,a,.5);
 VIEWS.start=[f[0]-16,clamp(f[1]-9,-70,70)];VIEWS.approach=[f[0]-7,clamp(f[1]-4,-75,75)];VIEWS.claimA=gc(w,f,.42);VIEWS.claimB=gc(w,f,.58);GLOBE_VIEW.lon=mdl[0];GLOBE_VIEW.lat=mdl[1];
 LBL[0]={t:N.origin.toUpperCase(),g:[f[0]-13,clamp(f[1]-8,-70,70)]};LBL[1]=N.dest===N.origin?null:{t:N.dest.toUpperCase(),g:[e[0]-2,clamp(e[1]+4.5,-70,78)]};
 STAGES.forEach((s,i)=>{s.off=!N.stageOn[i];s.over=N.stageOver[i]||{}});refreshStages();
 /* landing text */
 const he=document.querySelector('#hero .eyebrow'),hl=document.querySelector('#hero .lede');if(he)he.textContent=`${N.origin} → ${N.dest} · melons · ${nStages()} stages`;if(hl)hl.textContent=`Follow the journey of melons from ${N.origin} to ${N.dest}, and discover how data moves through every stage of the supply chain.`;
 SEL.shipment=null;TRK.key='';TRK.sm=null;TSUMX=-1;FOCUS=0;FOLLOW=null;$('#trkSum').classList.remove('show');for(const l of GLB)l.h=null;
 STATE.idx=0;STATE.t=0;if(STATE.started)goStage(0,true);else flyTo(()=>introView(),1600);syncTL();syncManifestUI()}
function syncManifestUI(){const sel=$('#manSel'),N=DATA.man;if(!sel)return;sel.innerHTML=MANIFESTS.map(m=>`<option value="${esc(m.key)}"${m===ACTIVE?' selected':''}>${esc(m.label)}</option>`).join('');
 syncRouteUI();$('#manInfo').innerHTML=N?`<b>${esc(N.id)}</b> · shipment ${esc(N.ref)}<br>${esc(N.loc.farm.label)}, ${esc(N.origin)} → ${esc(N.loc.supermarket.label)}, ${esc(N.dest)}<br>Vessel: ${N.vessel?esc(N.vessel):'not recorded'} · ${nStages()} stages · ${N.demo?'Demo Data':'From manifest'}`:'No manifest loaded: showing placeholder locations, with every value unavailable.'}
function showManifestErrors(title,errors){const b=$('#manErr');if(!errors){b.hidden=true;return}b.hidden=false;b.innerHTML=`${esc(title)}<ul>${errors.map(e=>`<li>${esc(e)}</li>`).join('')}</ul>`}
function initManifestUI(){const sel=$('#manSel'),file=$('#manFile');
 sel.onchange=async()=>{const r=await selectManifest(sel.value);showManifestErrors('This manifest could not be loaded. The previous one is still active.',r.ok?null:r.errors);syncManifestUI()};
 $('#manImp').onclick=()=>file.click();
 file.onchange=async()=>{const f=file.files[0];file.value='';if(!f)return;const r=await readManifestFile(f);if(!r.ok){showManifestErrors(`"${f.name}" was not loaded. The previous manifest is still active.`,r.errors);return}showManifestErrors('',null);showImportPreview(r.raw,f.name,null)};
 $('#ipCancel').onclick=()=>{$('#impPrev').hidden=true};
 if(BOOTERR)showManifestErrors('The sample manifests could not be loaded.',BOOTERR);syncManifestUI()}

/* import preview: what was recognised, what was converted, what is missing, and anything that stops it loading.
   Nothing changes in the journey until "Load this journey" is pressed. */
function showImportPreview(raw,name,opts){const P=prepareManifest(raw,opts),C=P.manifest||{},box=$('#impPrev'),ok=!P.errors.length,locs=Array.isArray(C.locations)?C.locations:[],by=r=>locs.find(l=>l&&l.role===r),ves=C.transport&&C.transport.vessel||{},M=C.manifest||{};
 const v=x=>x==null||x===''?'<dd class="na">not provided</dd>':`<dd>${esc(x)}</dd>`,place=r=>{const l=by(r);return l?l.name+(l.country?', '+l.country:''):null},li=a=>a.map(x=>`<li>${esc(x)}</li>`).join('');
 $('#ipTitle').textContent=name;
 $('#ipBody').innerHTML=`<p class="fmt">${P.format?'Recognised as: '+esc(P.format.label):'Format not recognised'}</p>`+(P.manifest?`<dl><dt>Manifest ID</dt>${v(M.id)}<dt>Product</dt>${v(M.product)}<dt>Farm</dt>${v(place('farm'))}<dt>Export port</dt>${v(place('exportPort'))}<dt>Arrival port</dt>${v(place('arrivalPort'))}
  <dt>Vessel</dt>${v(ves.name)}<dt>Voyage number</dt>${v(ves.voyage)}<dt>Warehouse</dt>${v(place('warehouse'))}<dt>Supermarket</dt>${v(place('supermarket'))}<dt>Journey stages</dt>${v(Array.isArray(C.stages)?String(C.stages.length):null)}</dl>`:'')
  +(P.converted.length?`<h3>Converted automatically (${P.converted.length})</h3><ul>${li(P.converted)}</ul>`:'')+(P.missing.length&&P.manifest?`<h3>Not provided (optional)</h3><ul>${li(P.missing)}</ul>`:'')
  +(P.needOrder?`<label class="ord">Coordinate pairs are <select id="ipOrd"><option value="">choose…</option><option value="lonlat">[longitude, latitude]</option><option value="latlon">[latitude, longitude]</option></select></label>`:'')
  +(ok?'':`<div class="bad"><h3>Must be fixed before loading (${P.errors.length})</h3><ul>${li(P.errors)}</ul></div>`);
 const go=$('#ipLoad');go.disabled=!ok;go.onclick=()=>{const id=(raw.manifest&&raw.manifest.id)||raw.manifestId||name,r=useManifest(raw,'file:'+id,'Imported · '+id,'file',opts);box.hidden=true;showManifestErrors(`"${name}" was not loaded. The previous manifest is still active.`,r.ok?null:r.errors);syncManifestUI()};
 const o=$('#ipOrd');if(o)o.onchange=()=>{if(o.value)showImportPreview(raw,name,{coordinateOrder:o.value})};
 box.hidden=false}
