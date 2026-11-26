'use strict';
/* ================= UI ================= */
const LAB=$('#labels'),CHIPS=[],GLB=[];
function el(t,c,h){const e=document.createElement(t);if(c)e.className=c;if(h!=null)e.innerHTML=h;return e}
function chip(k,stage,pos,html,cls){const e=el('div','dchip '+(cls||''),html);LAB.appendChild(e);const o={e,k,stage,pos};CHIPS.push(o);return o}
function glab(g,html,cls,ok,off){const e=el(cls==='gm'?'button':'div','gl '+(cls||''),html);LAB.appendChild(e);const o={e,g,ok,off:off||'translate(-50%,-50%)'};GLB.push(o);return o}
function buildUI(){
 const tk=$('#track');STAGES.forEach((s,i)=>{const b=el('button','st',`<i>${i+1}</i><span>${s.short}</span>`);b.addEventListener('click',()=>goStage(i));tk.appendChild(b);s.btn=b});
 chip(0,0,[-186,10.5,-6],'Weather conditions').posI=[-186,8.4,-6];chip(0,0,[-214,5,16],'Harvest information');chip(0,0,[-221,7,-12],'Fertiliser usage');
 chip(0,1,[-161,5,14],'Harvest record <span style="opacity:.6">(illustrative)</span>');chip(0,1,[-128.5,5,22],'Collection record');
 chip(1,2,[-105,11,27],'Shipping manifest');chip(1,2,[-73,23,-10],'Export documentation');
 chip(2,4,[107,12,-27],'','card').dyn=()=>{const t=tau(4);const cu=context().one('customs')||{};return`<b>CUSTOMS DECLARATION${cu.id?' · '+esc(cu.id):''}</b>${t<9?'Submitted':t<15?'Processing':'<span class="ok">Cleared · goods may enter the UK</span>'}<u>status shown illustratively</u>`};
 chip(2,5,[98,8,16],'Goods received: pallets &amp; boxes counted');
 chip(3,6,[141,10,19],'','card').dyn=()=>{const z=['QC bay A','QC bay B','Storage'],c=['#8ec2ff','#f7c06a','#8fe0a2'],n=Math.floor(T/10)%3;const al=context().one('allocation')||{};let h=`<b>${esc((al.system||'Warehouse system').toUpperCase())} · PICK LIST${al.id?' '+esc(al.id):''}</b>`;for(let k=0;k<3;k++)h+=`<span style="color:${c[k]};${k===n?'font-weight:700':'opacity:.7'}">Pallet 0${14+k} → ${z[k]}${k===n?' ◂':''}</span><br>`;return h+'<u>illustrative lines</u>'};
 chip(3,6,[134,5,-4],'QC bay A');chip(3,6,[146,5,-4],'QC bay B');chip(3,6,[158,5,-4],'Storage');
 chip(3,7,[179,9.5,6],'<b>QC REPORT · THIRD-PARTY INSPECTOR</b>Table 1: <span class="ok">Accepted ✓</span><br>Table 2: <span class="bad">Damaged ✕ → claim</span><u>illustrative report</u>','card');
 chip(3,8,[180,13.5,-24],'Claim raised from QC report','claim');chip(4,9,[223,10.5,8],'QC records → final customer / destination');
 /* globe labels: locations (click to travel there), countries, the travelling vehicle, claim arcs */
 SITES.forEach(S=>{const o=glab(()=>S.g,'','gm',()=>X.d>1700&&!(PRIM===S&&FADE>.4)&&(X.d<14000||S.k===0||S.k===2),'translate(-12px,-50%)');o.dyn=()=>`<i></i>${esc(S.n)}<small>${S.note==null?'illustrative location':S.note}</small>`;o.e.addEventListener('click',()=>goStage(S.st))});
 for(let k=0;k<2;k++)glab(()=>LBL[k]?LBL[k].g:[0,0],'','big',()=>!!LBL[k]&&X.d>15000).dyn=()=>esc(LBL[k].t);
 /* the travelling vehicle: its name, ids and readings come from the manifest; the route line says whether it is real geometry */
 const v=glab(()=>MARK?MARK.g:[0,0],'','veh',()=>!!MARK&&X.d>1500,'translate(-50%,-190%)');v.dyn=()=>{const m=MARK.mk,pc=Math.round(MKU[m]()*100),N=DATA.man,c=context().one('container')||{},id=N&&N.lorries[m>1?m-1:0];
  const nm=m===1?`Vessel ${esc(N&&N.vessel?N.vessel:'(name not recorded)')} · ${esc(N?N.origin:'')} → ${esc(N?N.dest:'')}`:`Lorry${id?' '+esc(id):''} · ${['farm → export port','','arrival port → warehouse','warehouse → supermarket'][m]}`;
  const rd=m===1&&VIEW.data?(c.tempC!=null||c.co2P!=null?`${c.tempC!=null?'Temperature '+c.tempC+' °C (average)':''}${c.tempC!=null&&c.co2P!=null?' · ':''}${c.co2P!=null?'CO₂ '+c.co2P+' %':''}<br>`:'Container readings not recorded<br>'):'';
  return`<b>${nm}</b>${rd}<em><s style="width:${pc}%"></s></em><u>${pc}% · ${esc(ROUTEINFO[m].src||'route')} · travel time not shown</u>`};
 /* a leg without a valid route says so where it is drawn */
 for(let r=0;r<4;r++){const o=glab(()=>{const p=ROUTES[r][Math.floor(ROUTES[r].length/2)];return ull(p)},'','dchip warnl',()=>!routeOK(r)&&STATE.started&&X.d>1500&&X.d<26000,'translate(-50%,-50%)');o.dyn=()=>ROUTEINFO[r].state==='pending'?'Calculating route…':'Illustrative connection · no valid '+(r===1?'sea':'road')+' route'}
 glab(()=>ull(ARCS[0][50]),'Claim → grower / originator','dchip claim',()=>VIEW.data&&STATE.idx===8&&X.d>9000&&tau(8)>6.5,'translate(-50%,-260%)');
 glab(()=>ull(ARCS[1][50]),'Financial settlement <span style="opacity:.6">(illustrative flow)</span>','dchip gold',()=>VIEW.data&&STATE.idx===8&&X.d>9000&&tau(8)>11,'translate(-50%,160%)');
 initPanel();
 $('#bHome').onclick=goHome;$('#bPrev').onclick=()=>goStage(STATE.idx-1);$('#bNext').onclick=()=>goStage(STATE.idx+1);
 $('#bPlay').onclick=()=>{start('guided');goStage(0)};$('#bExplore').onclick=()=>{start('free');STATE.t=SCRIPT[0].home;STATE.playing=true;flyTo(()=>GLOBE_VIEW,2200)};
 $('#mGuided').onclick=()=>setMode('guided');$('#mFree').onclick=()=>setMode('free');
 $('#bData').onclick=e=>{VIEW.data=!VIEW.data;e.currentTarget.classList.toggle('on',VIEW.data);e.currentTarget.setAttribute('aria-pressed',VIEW.data)};
 $('#bOrbit').onclick=e=>{CAM.auto=!CAM.auto;CAM.last=-1e9;if(CAM.auto)userTook(),CAM.last=-1e9;e.currentTarget.classList.toggle('on',CAM.auto);e.currentTarget.setAttribute('aria-pressed',CAM.auto)};
 $('#bGlobe').onclick=()=>{userTook();FOLLOW=null;flyTo(()=>STATE.started?GLOBE_VIEW:introView(),2200)};
 $('#bMore').onclick=e=>{const t=e.currentTarget.parentNode,o=t.classList.toggle('open');e.currentTarget.setAttribute('aria-expanded',o)};
 $('#bFollow').onclick=follow;$('#bReset').onclick=()=>{if(!STATE.started)return;FOCUS=0;FOLLOW=null;if(STATE.mode==='guided')follow();else{const t=STATE.t;flyTo(()=>{const s=STATE.t;STATE.t=SCRIPT[STATE.idx].home;const p=stagePose(STATE.idx);STATE.t=s;return p});void t}};
 $('#zIn').onclick=()=>{userTook();tween(POSE,'ld',clamp(POSE.ld-.5,LMIN,LMAX),350,out)};$('#zOut').onclick=()=>{userTook();tween(POSE,'ld',clamp(POSE.ld+.5,LMIN,LMAX),350,out)};
 $('#rL').onclick=()=>{userTook();tween(POSE,'ry',POSE.ry-.5,450,out)};$('#rR').onclick=()=>{userTook();tween(POSE,'ry',POSE.ry+.5,450,out)};
 $('#pX').onclick=hidePanel;$('#pOpen').onclick=()=>showPanel(STATE.idx);
 $('#bPP').onclick=()=>{if(STATE.t>=SCRIPT[STATE.idx].dur-.01){goStage(STATE.idx);return}STATE.playing=!STATE.playing;STATE.hold=false;syncCtl()};
 $('#bRe').onclick=()=>{STATE.t=0;goStage(STATE.idx,true)};
 const sc=$('#scrub');sc.addEventListener('input',()=>{STATE.t=+sc.value;STATE.playing=false;STATE.hold=false;FLY=null;FOLLOW=null;if(STATE.mode==='guided')STATE.att=true;syncCtl()});
 addEventListener('keydown',e=>{if(e.target&&e.target.tagName==='INPUT')return;if(e.key==='ArrowRight'){if(!STATE.started){start('guided');goStage(0)}else goStage(STATE.idx+1)}else if(e.key==='ArrowLeft')goStage(STATE.idx-1);else if(e.key===' '){e.preventDefault();if(STATE.started)$('#bPP').click()}else if(e.key==='Escape')hidePanel();else if(e.key==='g'||e.key==='G')$('#bGlobe').click()})}
const GLOBE_VIEW={lon:-20,lat:24,ry:0,rx:1.45,ld:Math.log(44000)};
function follow(){if(!STATE.started)return;FOCUS=0;FOLLOW=null;flyTo(()=>stagePose(STATE.idx),null,()=>{STATE.att=true;syncCtl()})}
/* back to the start screen: the journey resets to stage 1 and the camera returns to the globe; settings stay as chosen */
function goHome(){if(!STATE.started)return;STATE.started=false;STATE.idx=0;STATE.t=0;STATE.playing=false;STATE.att=false;STATE.hold=false;FLY=null;FOLLOW=null;FOCUS=0;
 hidePanel();$('#trkSum').classList.remove('show');TSUMX=-1;document.body.classList.add('intro');$('#hero').classList.remove('hide');$('#tl').classList.add('hide');
 CAM.auto=true;CAM.last=-1e9;$('#bOrbit').classList.add('on');$('#bOrbit').setAttribute('aria-pressed',true);flyTo(()=>introView(),2200);syncTL()}
function start(mode){if(STATE.started)return;STATE.started=true;document.body.classList.remove('intro');$('#hero').classList.add('hide');$('#tl').classList.remove('hide');CAM.auto=false;setMode(mode);syncTL()}
function setMode(m){STATE.mode=m;document.body.classList.toggle('guided',m==='guided');document.body.classList.toggle('free',m==='free');$('#mGuided').classList.toggle('on',m==='guided');$('#mFree').classList.toggle('on',m==='free');if(!STATE.started)return;if(m==='guided'){showPanel(STATE.idx);follow()}else{STATE.att=false;syncCtl()}}
function syncCtl(){$('#bPP').textContent=STATE.playing&&STATE.t<SCRIPT[STATE.idx].dur-.01?'❚❚':'▶';$('#bFollow').classList.toggle('on',STATE.att)}
function syncTL(){const i=STATE.idx;STAGES.forEach((s,k)=>{s.btn.classList.toggle('on',k===i);s.btn.classList.toggle('done',k<i);s.btn.setAttribute('aria-current',k===i?'step':'false')});$('#fill').style.width=`calc(${(ord(i)-1)/Math.max(1,nStages()-1)} * (100% - 48px))`;
 $('#tlName').textContent=stageName(i);$('#tlCount').textContent=`Stage ${String(ord(i)).padStart(2,'0')} / ${nStages()}`;$('#bPrev').disabled=ord(i)<=1;$('#bNext').disabled=ord(i)>=nStages();$('#scrub').max=SCRIPT[i].dur;STAGES[i].btn.scrollIntoView({block:'nearest',inline:'center'});syncCtl()}
/* go to a stage: in guided mode the camera flies to the stage's opening shot, then the stage plays;
   when a stage simply runs into the next one the shots already join up, so nothing needs to fly */
function goStage(i,replay){const dir=i>=STATE.idx?1:-1;while(STAGES[i]&&STAGES[i].off)i+=dir;if(i<0||i>=STAGES.length)return;if(!STATE.started)start('guided');const g=STATE.mode==='guided',seq=!replay&&g&&STATE.att&&!FLY&&i===STATE.idx+1&&STATE.t>=SCRIPT[STATE.idx].dur-.05;
 STATE.idx=i;FOCUS=0;FOLLOW=null;STATE.t=g?0:SCRIPT[i].home;STATE.playing=true;syncTL();
 STATE.hold=false;if(!seq){STATE.att=false;flyTo(()=>stagePose(i),null,()=>{STATE.att=g;syncCtl()})}
 if(g)showPanel(i);else hidePanel()}
/* stage details: text from STAGES, data chips from FIELDS, values through fieldInfo() for the shipment being followed */
let PF=[];
function esc(v){return String(v).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]))}
/* only fields the manifest actually holds get a chip (0 and false are values; missing, empty and placeholders are not); the data is untouched */
function chipsHTML(list){return list.filter(f=>fieldInfo(f).status!=='unavailable').map(f=>`<button type="button" data-f="${PF.push(f)-1}">${esc(f.label)}</button>`).join('')}
function showPanel(i,obj){const s=STAGES[i];STATE.panel=true;STATE.pi=i;STATE.obj=obj||null;PF=[];const ships=recs('shipments'),sh=context().one('shipment'),of=obj?entFields(obj):[];
 $('#pBody').innerHTML=`<p class="eyebrow"><img class="lg" src="assets/contained-logo.png" alt="Contained Technologies" onerror="this.remove()">Stage ${String(ord(i)).padStart(2,'0')} / ${nStages()}</p><h2>${esc(stageName(i))}</h2>
 <div class="ctx">Following ${ships.length>1?`<select id="selShip" aria-label="Shipment to follow">${ships.map(x=>`<option${x.id===sh.id?' selected':''}>${esc(x.id)}</option>`).join('')}</select>`:sh?`<b>${esc(sh.id)}</b>`:'no shipment'}<em class="ds ${DATA.status}">${STATUS[DATA.status]}</em></div><div class="tnow" id="trkNow"></div>${typeof shipAllocHTML==='function'?shipAllocHTML():''}
 ${obj?`<div class="obj"><b>${obj.name}</b>${obj.note||''}${(h=>h?`<div class="tags">${h}</div>`:'')(of.length?chipsHTML(of):'')}</div>`:''}
 <h3 style="--c:#f5f3ec">What’s happening</h3><p>${esc(stageWhat(i))}</p>${(h=>h?`<h3 style="--c:var(--data)">Data captured</h3><div class="tags" id="stTags">${h}</div>`:'')(chipsHTML(FIELDS[i]))}${i===9&&typeof billHTML==='function'?billHTML():''}${i===10?destHTML():''}${typeof shipStageHTML==='function'?shipStageHTML(i):''}
 <h3 style="--c:#c9a8ff">Data source</h3><p>${esc(tx(s.src))}</p><h3 style="--c:var(--ok)">How it’s used</h3><p>${esc(tx(s.use))}</p><h3 style="--c:var(--acc)">What’s next</h3><p>${esc(tx(s.next))}</p>${s.note?`<p class="note">${esc(tx(s.note))}</p>`:''}`;
 $('#panel').classList.add('show');document.body.classList.add('pan');$('#panel').scrollTop=0;
 /* the first data field starts open, so every stage shows real values straight away */
 const b0=$('#pBody').querySelector(of.length?'.obj [data-f]':'#stTags [data-f]');if(b0)showField(b0)}
/* a clicked chip opens its detail card right under its row of chips; clicking it again closes it */
/* the supermarket stage: who and where the shipment ends up, from the active manifest only; fields it does not have are left out */
/* the Invoice stage's Hawkeye Billing block. Every value comes from the manifest's billing data or a matched Hawkeye record; a field or
   stage with no data is hidden or marked unavailable, and the journey reaching this stage completes nothing. The office animation only
   highlights the section it is illustrating (billSync). */
function billHTML(){const H=hkFor(DATA.man),b=H.b||{},r=H.rec,cur=b.currency||'',num=v=>typeof v==='number'?v.toLocaleString('en-GB',{minimumFractionDigits:2,maximumFractionDigits:2}):v,
  amt=b.invoiceAmount!=null?num(b.invoiceAmount)+(cur?' '+cur:''):r&&r.value!=null?'£'+num(r.value)+' net (Hawkeye)':null,row=(k,v)=>v==null||v===''?'':`<dt>${k}</dt><dd>${esc(String(v))}</dd>`;
 const det=[row('Customer',b.customer||(r&&r.depot?'Depot '+r.depot:null)),row('Purchase order',b.purchaseOrder||(r&&r.po)),row('Sales order',b.salesOrder||(r&&r.so)),row('Invoice number',b.invoiceNumber),row('Invoice date',b.invoiceDate),row('Invoice amount',amt),row('Payment due date',b.paymentDueDate),row('Invoice status',b.invoiceStatus),row('Payment status',b.paymentStatus)].join('');
 const IC={done:['✓','Done'],wait:['●','Waiting for a person'],held:['■','Held by a gate'],idle:['○','Not yet']},stg=(r?r.stages:HAWKEYE.STAGES.map((x,i)=>({name:x[0],what:x[1],gate:HAWKEYE.GATES.includes(i),status:null})));
 const flow=stg.map(x=>{const k=x.status==='wait'&&x.gate?'held':x.status,ic=IC[k];return`<li class="hs ${k||'na'}"${x.name==='Draft'?' data-ph="gen"':''}><i>${ic?ic[0]:'◌'}</i><span>${esc(x.what)}<small>${esc(x.name)}${x.gate?' · gate':''}</small></span><em>${ic?ic[1]:'—'}</em></li>`}).join('')
  +`<li class="hs ${b.paymentStatus?'done':'na'}"><i>${b.paymentStatus?'✓':'◌'}</i><span>Payment status<small>from Sage</small></span><em>${b.paymentStatus?esc(b.paymentStatus):'—'}</em></li>`;
 const pq=b.purchaseQuantity,sq=b.salesQuantity,pv=b.purchaseCost,sv=b.salesValue,rec=[row('Purchased quantity',typeof pq==='number'?pq.toLocaleString('en-GB'):pq),row('Sold quantity',typeof sq==='number'?sq.toLocaleString('en-GB'):sq),row('Purchase value',pv!=null?num(pv)+(cur?' '+cur:''):null),row('Sales value',sv!=null?num(sv)+(cur?' '+cur:''):null),
  typeof pq==='number'&&typeof sq==='number'?`<dt>Quantity</dt><dd class="${pq===sq?'ok':'bad'}">${pq===sq?'Match':'Differs by '+Math.abs(pq-sq).toLocaleString('en-GB')}</dd>`:'',typeof pv==='number'&&typeof sv==='number'?`<dt>Value</dt><dd>${(sv-pv>=0?'Sales exceed purchases by ':'Purchases exceed sales by ')+num(Math.abs(sv-pv))+(cur?' '+cur:'')}</dd>`:'',row('Reconciliation status',b.reconciliationStatus)].join('');
 return`<section class="hk"><div class="hkh"><b>Hawkeye Billing</b><span>Melon&amp;Co UK · Finance</span></div>
  <h3 style="--c:#f2b33d" data-ph="gen">Invoice details</h3>${det?`<dl class="dest">${det}</dl>`:`<p class="na">No matching Hawkeye billing record for this shipment${H.refs.length?' (no live record with PO or sales order '+esc(H.refs.join(', '))+')':': the manifest carries no purchase order, sales order or Hawkeye record'}.</p>`}
  <h3 style="--c:#c9a8ff">Billing workflow</h3><ul class="hsl">${flow}</ul>${r?`<p class="na">Hawkeye record ${esc(H.how)}${r.note?': '+esc(r.note):''}</p>`:''}
  <h3 style="--c:var(--ok)" data-ph="rec">Purchase &amp; sales reconciliation</h3>${rec?`<dl class="dest">${rec}</dl>`:'<p class="na">Awaiting linked financial records.</p>'}
  <p><a class="chip hkl" href="${esc(H.url)}" target="_blank" rel="noopener noreferrer">View in Hawkeye ↗</a></p>
  <p class="na">${HAWKEYE.live?`Hawkeye live feed: ${HAWKEYE.live.rows.length} records (${esc(HAWKEYE.live.title||'')}, as of ${esc(HAWKEYE.live.asOf||'—')}).`:HAWKEYE.err?'Hawkeye live feed unavailable ('+esc(HAWKEYE.err)+').':'Hawkeye live feed not loaded.'} The office animation is illustrative and never changes a billing record.</p></section>`}
/* the office animation's phase, mirrored in the panel: invoice generation (shipment data to invoice, 3–12.5 s), then reconciliation (11.5 s on) */
(function billSync(){const h=document.querySelector('#pBody .hk');if(h){const t=STATE.idx===9?STATE.t:-1,ph=t>=3&&t<11.5?'gen':t>=11.5?'rec':'';if(h.dataset.on!==ph){h.dataset.on=ph;h.querySelectorAll('[data-ph]').forEach(e=>e.classList.toggle('hl',e.dataset.ph===ph))}}requestAnimationFrame(billSync)})();
function destHTML(){const N=DATA.man,c=context(),one=k=>c.one(k)||{},d=one('delivery'),q=one('qc'),bt=one('batch'),L=N&&N.loc.supermarket,R=N&&N.retailer,B=BRAND;
 const rows=[['Retailer',R?B.name+(B.fictional?' (demo assignment)':''):null],['Store',R?B.storeName:null],['Destination',L?L.label+(L.country?', '+L.country:'')+(L.illustrative?' (illustrative location)':''):null],
  ['Shipment',N&&N.ref],['Delivery date',d.date],['Delivery status',d.status],['Batch',bt.id],['QC report',q.id?q.id+(q.accepted!=null&&q.rejected!=null?` · ${q.accepted} accepted, ${q.rejected} rejected`:''):null]].filter(r=>r[1]!=null&&r[1]!=='');
 return rows.length?`<h3 style="--c:${esc(B.primary)}">Destination</h3><dl class="dest">${rows.map(r=>`<dt>${r[0]}</dt><dd>${esc(r[1])}</dd>`).join('')}</dl>`:''}
function showField(b){const was=b.classList.contains('on'),old=$('#fd');if(old)old.remove();$('#pBody').querySelectorAll('[data-f].on').forEach(x=>x.classList.remove('on'));if(was)return;
 const d=fieldInfo(PF[+b.dataset.f]),fd=el('div','fd');fd.id='fd';b.classList.add('on');
 fd.innerHTML=`<b>${esc(d.label)}</b><dl><dt>Value</dt><dd>${esc(d.value)}</dd>${d.source?`<dt>Source</dt><dd>${esc(d.source)}</dd>`:''}${d.record?`<dt>Record</dt><dd>${esc(d.record)}</dd>`:''}${d.linked?`<dt>Linked to</dt><dd>${esc(d.linked)}</dd>`:''}${d.status&&d.status!=='unavailable'?`<dt>Data status</dt><dd><em class="ds ${d.status}">${STATUS[d.status]}</em></dd>`:''}</dl>
 ${vizHTML(d.viz)}<div class="tr">${d.trace.filter(t=>t.ids.length).map(t=>`<span class="${t.on?'on':''}${t.ids.length?'':' na'}">${t.k}${t.ids.length>3?' '+esc(t.ids[0]+' … '+t.ids[t.ids.length-1])+' ('+t.ids.length+')':t.ids.length?' '+esc(t.ids.join(', ')):': none'}</span>`).join('')}</div>`;b.parentNode.after(fd)}
/* small visuals for fields that hold several values: a readings line chart, or a results table with bars */
function vizHTML(v){if(!v)return'';const d=v[1];
 if(v[0]==='line'){const ys=d.map(p=>p[1]),lo=Math.min(...ys),hi=Math.max(...ys),W=280,H=64,x=i=>6+i*(W-12)/(d.length-1),y=t=>H-8-(t-lo)/((hi-lo)||1)*(H-18);
  return`<figure class="viz"><svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Readings from ${esc(d[0][0])} to ${esc(d[d.length-1][0])}, ${lo} to ${hi}"><polyline points="${d.map((p,i)=>x(i).toFixed(1)+','+y(p[1]).toFixed(1)).join(' ')}"/>${d.map((p,i)=>`<circle cx="${x(i).toFixed(1)}" cy="${y(p[1]).toFixed(1)}" r="2.2"><title>${esc(p[0])}: ${p[1]}°C</title></circle>`).join('')}</svg>
  <figcaption><span>${esc(d[0][0])}</span><span>${d.length} daily readings · ${lo.toFixed(1)}–${hi.toFixed(1)}°C</span><span>${esc(d[d.length-1][0])}</span></figcaption></figure>`}
 const tot=d.reduce((a,r)=>a+r[1],0)||1;return`<table class="viz">${d.map((r,i)=>`<tr><td>${esc(r[0])}</td><td>${r[1].toLocaleString('en-GB')}</td><td><i class="${i?'bad':'ok'}" style="width:${Math.max(2,r[1]/tot*100).toFixed(1)}%"></i></td><td>${esc(r[2]||'')}</td></tr>`).join('')}</table>`}
function initPanel(){const p=$('#pBody');p.addEventListener('click',e=>{const b=e.target.closest('[data-f]');if(b)showField(b)});
 p.addEventListener('change',e=>{if(e.target.id==='selShip'){SEL.shipment=e.target.value;showPanel(STATE.pi,STATE.obj)}})}
function hidePanel(){STATE.panel=false;document.body.classList.remove('pan');$('#panel').classList.remove('show')}

function updateLabels(){
 for(const l of GLB){const g=l.g(),p=llu(g[0],g[1]),q=l.ok()&&dot(p,X.eyeG)>1.004?proj(X.gvp,p):null,ok=STATE.started&&q&&q[1]>50&&q[1]<GLS.ch-90||(!STATE.started&&q&&l.e.classList.contains('big'));l.e.classList.toggle('show',!!ok);
  if(ok){if(l.dyn){const h=l.dyn();if(h!==l.h){l.h=h;l.e.innerHTML=h}}l.e.style.transform=`translate(${q[0].toFixed(1)}px,${q[1].toFixed(1)}px) ${l.off}`}}
 for(const c of CHIPS){const q=PRIM&&PRIM.k===c.k?proj(PRIM.vp,STYLE==='industrial'&&c.posI||c.pos):null,ok=VIEW.data&&STATE.started&&q&&c.stage===STATE.idx&&FADE>.7&&X.d<340&&q[1]>56&&q[1]<GLS.ch-100;
  c.e.classList.toggle('show',!!ok);if(ok&&c.dyn){const h=c.dyn();if(h!==c.h){c.h=h;c.e.innerHTML=h}}if(q)c.e.style.transform=`translate(${q[0].toFixed(1)}px,${q[1].toFixed(1)}px) translate(-50%,-115%)`}}

/* after a manifest change: stage buttons show only the stages it has, renumbered, with its names */
function refreshStages(){STAGES.forEach((s,i)=>{s.btn.style.display=s.off?'none':'';s.btn.title=stageName(i);s.btn.firstChild.textContent=ord(i)})}
