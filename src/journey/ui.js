'use strict';
/* ================= UI ================= */
const LAB=$('#labels'),CHIPS=[],GLB=[];
function el(t,c,h){const e=document.createElement(t);if(c)e.className=c;if(h!=null)e.innerHTML=h;return e}
function chip(k,stage,pos,html,cls){const e=el('div','dchip '+(cls||''),html);LAB.appendChild(e);const o={e,k,stage,pos};CHIPS.push(o);return o}
function glab(g,html,cls,ok,off){const e=el(cls==='gm'?'button':'div','gl '+(cls||''),html);LAB.appendChild(e);const o={e,g,ok,off:off||'translate(-50%,-50%)'};GLB.push(o);return o}
function buildUI(){
 const tk=$('#track');STAGES.forEach((s,i)=>{const b=el('button','st',`<i>${i+1}</i><span>${s.short}</span>`);b.title=s.name;b.addEventListener('click',()=>goStage(i));tk.appendChild(b);s.btn=b});
 chip(0,0,[-186,10.5,-6],'Weather conditions');chip(0,0,[-214,5,16],'Harvest information');chip(0,0,[-221,7,-12],'Fertiliser usage');
 chip(0,1,[-161,5,14],'Harvest record <span style="opacity:.6">(illustrative)</span>');chip(0,1,[-128.5,5,22],'Collection record');
 chip(1,2,[-105,11,27],'Shipping manifest');chip(1,2,[-73,23,-10],'Export documentation');
 chip(2,4,[107,12,-27],'','card').dyn=()=>{const t=tau(4);return`<b>CDS · CUSTOMS DECLARATION</b>${t<9?'Submitted':t<15?'Processing':'<span class="ok">Cleared · goods may enter the UK</span>'}<u>status shown illustratively</u>`};
 chip(2,5,[98,8,16],'Goods received: pallets &amp; boxes counted');
 chip(3,6,[141,10,19],'','card').dyn=()=>{const z=['QC bay A','QC bay B','Storage'],c=['#8ec2ff','#f7c06a','#8fe0a2'],n=Math.floor(T/10)%3;let h='<b>PROMETHEUS · PICK LIST</b>';for(let k=0;k<3;k++)h+=`<span style="color:${c[k]};${k===n?'font-weight:700':'opacity:.7'}">Pallet 0${14+k} → ${z[k]}${k===n?' ◂':''}</span><br>`;return h+'<u>illustrative lines</u>'};
 chip(3,6,[134,5,-4],'QC bay A');chip(3,6,[146,5,-4],'QC bay B');chip(3,6,[158,5,-4],'Storage');
 chip(3,7,[179,9.5,6],'<b>QC REPORT · THIRD-PARTY INSPECTOR</b>Table 1: <span class="ok">Accepted ✓</span><br>Table 2: <span class="bad">Damaged ✕ → claim</span><u>illustrative report</u>','card');
 chip(3,8,[180,13.5,-24],'Claim raised from QC report','claim');chip(4,9,[223,10.5,8],'QC records → final customer / destination');
 /* globe labels: locations (click to travel there), countries, the travelling vehicle, claim arcs */
 SITES.forEach(S=>{const o=glab(()=>S.g,`<i></i>${S.n}<small>illustrative location</small>`,'gm',()=>X.d>1700&&!(PRIM===S&&FADE>.4)&&(X.d<14000||S.k===0||S.k===2),'translate(-12px,-50%)');o.e.addEventListener('click',()=>goStage(S.st))});
 glab(()=>[-52,-13],'BRAZIL','big',()=>X.d>15000);glab(()=>[-3.5,57.2],'UNITED KINGDOM','big',()=>X.d>15000);glab(()=>[-30,22],'ATLANTIC OCEAN','big',()=>X.d>16000);
 const NM=['Lorry · farm → export port','Cargo vessel · Brazil → UK','Lorry · UK port → warehouse','Lorry · warehouse → supermarket'];
 const v=glab(()=>MARK?MARK.g:[0,0],'','veh',()=>!!MARK&&X.d>1500,'translate(-50%,-190%)');v.dyn=()=>{const m=MARK.mk,pc=Math.round(MKU[m]()*100);return`<b>${NM[m]}</b>${m===1&&VIEW.data?`Temperature ${(5.2+Math.sin(T*.3)*.2).toFixed(1)} °C · CO₂ ${(.4+Math.sin(T*.23+1)*.03).toFixed(2)} %<br>`:''}<em><s style="width:${pc}%"></s></em><u>${pc}% · illustrative route${m===1&&VIEW.data?' and readings':''} · travel time not confirmed</u>`};
 glab(()=>ull(ARCS[0][50]),'Claim → grower / originator','dchip claim',()=>VIEW.data&&STATE.idx===8&&X.d>9000&&tau(8)>6.5,'translate(-50%,-260%)');
 glab(()=>ull(ARCS[1][50]),'Financial settlement <span style="opacity:.6">(illustrative flow)</span>','dchip gold',()=>VIEW.data&&STATE.idx===8&&X.d>9000&&tau(8)>11,'translate(-50%,160%)');
 initPanel();
 $('#bPrev').onclick=()=>goStage(STATE.idx-1);$('#bNext').onclick=()=>goStage(STATE.idx+1);
 $('#bPlay').onclick=()=>{start('guided');goStage(0)};$('#bExplore').onclick=()=>{start('free');STATE.t=SCRIPT[0].home;STATE.playing=true;flyTo(()=>GLOBE_VIEW,2200)};
 $('#mGuided').onclick=()=>setMode('guided');$('#mFree').onclick=()=>setMode('free');
 $('#bData').onclick=e=>{VIEW.data=!VIEW.data;e.currentTarget.classList.toggle('on',VIEW.data);e.currentTarget.setAttribute('aria-pressed',VIEW.data)};
 $('#bOrbit').onclick=e=>{CAM.auto=!CAM.auto;CAM.last=-1e9;if(CAM.auto)userTook(),CAM.last=-1e9;e.currentTarget.classList.toggle('on',CAM.auto);e.currentTarget.setAttribute('aria-pressed',CAM.auto)};
 $('#bGlobe').onclick=()=>{if(!STATE.started)start('free');userTook();FOLLOW=null;flyTo(()=>GLOBE_VIEW,2200)};
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
function start(mode){if(STATE.started)return;STATE.started=true;document.body.classList.remove('intro');$('#hero').classList.add('hide');$('#tl').classList.remove('hide');CAM.auto=false;setMode(mode);syncTL()}
function setMode(m){STATE.mode=m;document.body.classList.toggle('guided',m==='guided');document.body.classList.toggle('free',m==='free');$('#mGuided').classList.toggle('on',m==='guided');$('#mFree').classList.toggle('on',m==='free');if(!STATE.started)return;if(m==='guided'){showPanel(STATE.idx);follow()}else{STATE.att=false;syncCtl()}}
function syncCtl(){$('#bPP').textContent=STATE.playing&&STATE.t<SCRIPT[STATE.idx].dur-.01?'❚❚':'▶';$('#bFollow').classList.toggle('on',STATE.att)}
function syncTL(){const i=STATE.idx;STAGES.forEach((s,k)=>{s.btn.classList.toggle('on',k===i);s.btn.classList.toggle('done',k<i);s.btn.setAttribute('aria-current',k===i?'step':'false')});$('#fill').style.width=`calc(${i/(STAGES.length-1)} * (100% - 48px))`;
 $('#tlName').textContent=STAGES[i].name;$('#tlCount').textContent=`Stage ${String(i+1).padStart(2,'0')} / ${STAGES.length}`;$('#bPrev').disabled=i===0;$('#bNext').disabled=i===STAGES.length-1;$('#scrub').max=SCRIPT[i].dur;STAGES[i].btn.scrollIntoView({block:'nearest',inline:'center'});syncCtl()}
/* go to a stage: in guided mode the camera flies to the stage's opening shot, then the stage plays;
   when a stage simply runs into the next one the shots already join up, so nothing needs to fly */
function goStage(i,replay){if(i<0||i>=STAGES.length)return;if(!STATE.started)start('guided');const g=STATE.mode==='guided',seq=!replay&&g&&STATE.att&&!FLY&&i===STATE.idx+1&&STATE.t>=SCRIPT[STATE.idx].dur-.05;
 STATE.idx=i;FOCUS=0;FOLLOW=null;STATE.t=g?0:SCRIPT[i].home;STATE.playing=true;syncTL();
 if(!seq){STATE.att=false;STATE.hold=true;flyTo(()=>stagePose(i),null,()=>{STATE.hold=false;STATE.att=g;syncCtl()})}
 if(g)showPanel(i);else hidePanel()}
/* stage details: text from STAGES, data chips from FIELDS, values through fieldInfo() for the shipment being followed */
let PF=[];
function esc(v){return String(v).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]))}
function chipsHTML(list){return list.map(f=>`<button type="button" data-f="${PF.push(f)-1}"${fieldInfo(f).status==='unavailable'?' class="na"':''}>${esc(f.label)}</button>`).join('')}
function showPanel(i,obj){const s=STAGES[i];STATE.panel=true;STATE.pi=i;STATE.obj=obj||null;PF=[];const ships=recs('shipments'),sh=context().one('shipment'),of=obj?entFields(obj):[];
 $('#pBody').innerHTML=`<p class="eyebrow"><img class="lg" src="assets/contained-logo.png" alt="Contained Technologies" onerror="this.remove()">Stage ${String(i+1).padStart(2,'0')} / ${STAGES.length}</p><h2>${s.name}</h2>
 <div class="ctx">Following ${ships.length>1?`<select id="selShip" aria-label="Shipment to follow">${ships.map(x=>`<option${x.id===sh.id?' selected':''}>${esc(x.id)}</option>`).join('')}</select>`:sh?`<b>${esc(sh.id)}</b>`:'no shipment'}<em class="ds ${DATA.status}">${STATUS[DATA.status]}</em></div>
 ${obj?`<div class="obj"><b>${obj.name}</b>${obj.note||''}${of.length?`<div class="tags">${chipsHTML(of)}</div>`:''}</div>`:''}
 <h3 style="--c:#f5f3ec">What’s happening</h3><p>${s.what}</p><h3 style="--c:var(--data)">Data captured</h3><div class="tags" id="stTags">${chipsHTML(FIELDS[i])}</div>
 <h3 style="--c:#c9a8ff">Data source</h3><p>${s.src}</p><h3 style="--c:var(--ok)">How it’s used</h3><p>${s.use}</p><h3 style="--c:var(--acc)">What’s next</h3><p>${s.next}</p>${s.note?`<p class="note">${s.note}</p>`:''}`;
 $('#panel').classList.add('show');document.body.classList.add('pan');$('#panel').scrollTop=0;
 /* the first data field starts open, so every stage shows real values straight away */
 const b0=$('#pBody').querySelector(of.length?'.obj [data-f]':'#stTags [data-f]');if(b0)showField(b0)}
/* a clicked chip opens its detail card right under its row of chips; clicking it again closes it */
function showField(b){const was=b.classList.contains('on'),old=$('#fd');if(old)old.remove();$('#pBody').querySelectorAll('[data-f].on').forEach(x=>x.classList.remove('on'));if(was)return;
 const d=fieldInfo(PF[+b.dataset.f]),fd=el('div','fd');fd.id='fd';b.classList.add('on');
 fd.innerHTML=`<b>${esc(d.label)}</b><dl><dt>Value</dt><dd>${esc(d.value)}</dd><dt>Source</dt><dd>${esc(d.source)}</dd>${d.record?`<dt>Record</dt><dd>${esc(d.record)}</dd>`:''}${d.linked?`<dt>Linked to</dt><dd>${esc(d.linked)}</dd>`:''}<dt>Data status</dt><dd><em class="ds ${d.status}">${STATUS[d.status]}</em></dd></dl>
 ${vizHTML(d.viz)}<div class="tr">${d.trace.map(t=>`<span class="${t.on?'on':''}${t.ids.length?'':' na'}">${t.k}${t.ids.length>3?' '+esc(t.ids[0]+' … '+t.ids[t.ids.length-1])+' ('+t.ids.length+')':t.ids.length?' '+esc(t.ids.join(', ')):': none'}</span>`).join('')}</div>`;b.parentNode.after(fd)}
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
 for(const c of CHIPS){const q=PRIM&&PRIM.k===c.k?proj(PRIM.vp,c.pos):null,ok=VIEW.data&&STATE.started&&q&&c.stage===STATE.idx&&FADE>.7&&X.d<340&&q[1]>56&&q[1]<GLS.ch-100;
  c.e.classList.toggle('show',!!ok);if(ok&&c.dyn){const h=c.dyn();if(h!==c.h){c.h=h;c.e.innerHTML=h}}if(q)c.e.style.transform=`translate(${q[0].toFixed(1)}px,${q[1].toFixed(1)}px) translate(-50%,-115%)`}}
