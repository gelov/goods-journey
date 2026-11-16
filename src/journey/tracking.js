'use strict';
/* ================= follow one melon =================
   One representative melon is followed from the field to the shelf. STEPS is the single list that says, for every
   moment of the journey, which object carries it (the melon itself, its crate, a pallet, a lorry, the container, the
   vessel). Everything else reads that list: the gold highlight, the floating marker, the camera targets (TR in
   scripts.js), the "now" line in the panel and the closing summary.
   What is real and what is not: carrier ids (batch, pallet, container, lorries, vessel) and dates come from the
   journey records through context(). The movements of the single melon and its crate are a simulated illustration;
   the records trace batches, not individual melons, and the UI says so. */
const TID={},TRK={pid:0,pulse:0,step:null,key:''};
const hop=(a,b,u,h)=>[lerp(a[0],b[0],u),lerp(a[1],b[1],u)+Math.sin(u*Math.PI)*h,lerp(a[2],b[2],u)],mixv=(a,b,u)=>hop(a,b,u,0);
const M0=[-156.2,.75,12.2],CR0=[-154.6,.2,13.5],TBL=[176.9,1.45,7.3],HOV=[176.9,2.9,7.3],SHELF=[219.01,4.04,8.01],W0=[-79.7,.25,-10];
const PHW=mkPath(xz([[-154.6,12.3],[-150.5,17.6],[-132,18],[-130.9,15.3]])),PFA=P2([[-86,18.5],[-90,17.5],[-92,15.8],[-92,14.6]]),PFC=P2([[-92,17.4],[-89,18],[-86.5,14],[-85.5,5],[-84.5,-3],[-83.3,-8.5],[-81.5,-10],[-79.2,-10]]),
 PCH=P2([[76.5,-14],[78,-4],[82,8],[86,14],[90,16],[96,16]]),PWA=P2([[150.5,27],[151,20],[142,10],[137.5,3],[136.4,-.2]]),PWT=P2([[136.4,-.2],[137,3],[139,5.5],[141.5,6]]),
 PWB=P2([[141.5,6],[150,7],[166,6.5],[171,10],[176,15.6],[178.2,15.6]]),PWQ=P2([[178.2,15.6],[174,15.8],[171,14.5],[170.3,11],[170.2,9.5]]),PWC=P2([[170.2,9.5],[166,8],[156,12],[150,19],[148.2,22]]);
/* a forklift pose on a path, and where its forks hold a load */
const fkPose=(pa,u,yaw)=>{const p=pAt(pa,u);return{p:[p[0],.27,p[2]],yaw:yaw==null?p[3]:yaw}},forks=(f,y)=>[f.p[0]+Math.sin(f.yaw)*2.65,y==null?.8:y,f.p[2]+Math.cos(f.yaw)*2.65];
const trkCycle=side=>side==='br'?STATE.idx===2&&STATE.t>=14.8&&STATE.t<19.3:STATE.idx===4&&STATE.t>=10&&STATE.t<14.5;
/* poses of every tracked object for the current stage time (pure function of the clock, so pause and scrub work) */
let TSC=null,TSK='';
function trkScene(){const i=STATE.idx,t=STATE.t,key=i+'|'+t+'|'+T;if(key===TSK)return TSC;TSK=key;const S={},hide={vis:false,p:[0,-50,0],k:0};
 /* harvest worker (farm, stage 2) */
 let hw={k:0,vis:i===1&&t<9,p:[-153,0,10],yaw:-Math.PI/2};
 if(i===1){if(t<1.5)hw.p=mixv([-153,0,10],[-155,0,12.5],io(t/1.5));else if(t<2.3)hw.p=[-155,0,12.5];else if(t<3.4){hw.p=mixv([-155,0,12.5],[-154.6,0,12.3],io((t-2.3)/1.1));hw.yaw=0}else if(t<4.6){hw.p=[-154.6,0,12.3];hw.yaw=0}
  else{const q=pAt(PHW,io(u01(t,4.6,8)));hw.p=[q[0],0,q[2]];hw.yaw=q[3]}}S.hw=hw;
 const hand=[hw.p[0]+Math.sin(hw.yaw)*.75,1.75,hw.p[2]+Math.cos(hw.yaw)*.75];
 /* forklifts: export quay, warehouse */
 /* export quay forklift: drives up to the lorry, lifts the whole cargo load, reverses out, carries it to the platform under the crane, backs away */
 let fq;if(i<2||(i===2&&t<7))fq=fkPose(PFA,i<2?0:io(u01(t,5.3,6.9)));else if(i>2||t>=14.5)fq={p:[lerp(-79.2,-83.5,i>2?1:io(u01(t,14.5,15.6))),.27,-10],yaw:Math.PI/2};
 else if(t<7.8)fq=fkPose(PFA,1);else if(t<8.6)fq={p:[-92,.27,lerp(14.6,17.4,io((t-7.8)/.8))],yaw:Math.PI};else if(t<14){const u=io(u01(t,8.6,14)),q=pAt(PFC,u);fq={p:[q[0],.27,q[2]],yaw:lerp(Math.PI,q[3],ss(0,.14,u))}}else fq=fkPose(PFC,1);fq.k=1;fq.vis=true;S.fq=fq;
 /* the cargo load: one unit (a base carrying all the crates) from lorry to forklift to platform to crane to the container on the vessel */
 let cu={k:1,vis:false,p:[0,-50,0],yaw:Math.PI,s:1};
 if(i===2&&t>=7&&t<17.95){cu.vis=true;const PLAT=[-76.5,.4,-10];
  if(t<7.8){const u=io((t-7)/.8);cu.p=mixv([-92,1.3,9.4],forks(fq,1.5),u);cu.s=Math.min(1,u*2.5)}else if(t<14){cu.p=forks(fq,lerp(1.5,.8,u01(t,7.8,8.6)));cu.yaw=fq.yaw}
  else if(t<14.5){cu.p=mixv(forks(fq,.8),PLAT,io((t-14)/.5));cu.yaw=Math.PI/2}else if(t<14.8){cu.p=PLAT;cu.yaw=Math.PI/2}else{cu.p=[RIG.br.x,RIG.br.y+1.2,-10];cu.yaw=Math.PI/2;cu.s=1-u01(t,17.6,17.95)}}S.cargo=cu;
 let fw;if(i<6)fw=fkPose(PWA,0);else if(i===6){if(t<11.5)fw=fkPose(PWA,io(u01(t,7.5,11.5)));else if(t<14){const u=io(u01(t,12,13.6));fw=fkPose(PWT,u,lerp(Math.PI,pAt(PWB,0)[3],u))}else fw=fkPose(PWB,(t-14)/8.5)}
 else if(i===7){if(t<2.5)fw=fkPose(PWB,(6+t)/8.5);else if(t<12){const u=io(u01(t,3,9));fw=fkPose(PWQ,u,lerp(Math.PI/2,(pAt(PWC,0)[3]+TAU)%TAU,u))}else fw=fkPose(PWC,io(u01(t,12,16)))}else fw=fkPose(PWC,1);fw.k=3;fw.vis=true;S.fw=fw;
 const BAY=forks(fkPose(PWA,1),.3),QCP=forks(fkPose(PWB,1),.27),DSP=forks(fkPose(PWC,1),.3);
 /* crate */
 let cr={k:0,vis:true,p:CR0,s:1};
 /* on the conveyor the crate takes belt slot 0 (see beltSlot in movers.js), so it keeps the same spacing, height and speed as the other crates */
 if(i===1){const hd=[hand[0],1.45,hand[2]],b0=[-128.5,BELT.y,BELT.z0],b1=[-128.5,BELT.y,BELT.z0+BELT.L-.4],tB=BELT.t0+(BELT.L-.4)/BELT.v;
  if(t<4);else if(t<4.6)cr.p=mixv(CR0,hd,io((t-4)/.6));else if(t<BELT.t0-.2)cr.p=hd;else if(t<BELT.t0)cr.p=mixv(hd,b0,io((t-BELT.t0+.2)/.2));
  else if(t<tB)cr.p=[b0[0],b0[1],BELT.z0+BELT.v*(t-BELT.t0)];else if(t<tB+.6){const u=(t-tB)/.6;cr.p=hop(b1,[-126.6,2,30.5],u,1.5);cr.s=1-u*u}else cr.vis=false}
 /* at the export port the crate stays in its place on the cargo load (front right slot) and moves only with it */
 else if(i===2){const c=Math.cos(cu.yaw),n=Math.sin(cu.yaw),ox=.8*cu.s,oz=.62*cu.s;cr={k:1,vis:cu.vis,s:cu.s,yaw:cu.yaw,p:[cu.p[0]+c*ox+n*oz,cu.p[1]+.2*cu.s,cu.p[2]-n*ox+c*oz]}}
 else if(i===7){cr.k=3;if(t<2.5)cr.vis=false;else if(t<4.3){const u=(t-2.5)/1.8;cr.p=hop([QCP[0],2.3,QCP[2]],TBL,io(u),3);cr.s=Math.min(1,u*5)}else if(t<11)cr.p=TBL;else if(t<12)cr.p=hop(TBL,forks(fw),io(t-11),1.5);else cr.p=forks(fw)}
 else if(i===8){cr.k=3;cr.p=DSP}
 else if(i===9){if(t<2.4){cr.k=3;cr.p=DSP}else if(t<3.4){const u=t-2.4;cr.k=3;cr.p=hop(DSP,[151.5,2,29.5],u,2.5);cr.s=1-u*u*u}else if(t<22){cr.vis=false;cr.k=t<12?3:4}
  else{cr.k=4;if(t<23){const u=t-22;cr.p=hop([200,2,19.8],[204,.4,6],u,3);cr.s=Math.min(1,u*4)}else if(t<24)cr.p=hop([204,.4,6],[213,.4,7.5],t-23,2.5);else if(t<24.8)cr.p=hop([213,.4,7.5],[215.4,.3,8],(t-24)/.8,1.5);else cr.p=[215.4,.3,8]}}
 else if(i>1)cr.vis=false;S.crate=cr;
 /* the crate is full of melons; the followed one takes the free corner slot, at the size of its neighbours */
 const IS=.66,cy=Math.cos(cr.yaw||0),sy=Math.sin(cr.yaw||0),inCr=[cr.p[0]+(cy*.36+sy*.25)*cr.s,cr.p[1]+.6*cr.s,cr.p[2]+(-sy*.36+cy*.25)*cr.s],sz=u=>lerp(1,IS,u);
 /* the melon */
 let me={k:cr.k,vis:cr.vis,p:inCr,s:cr.s*IS};
 if(i<1)me={k:0,vis:true,p:M0,s:1};
 else if(i===1){if(t<1.5)me.p=M0;else if(t<2.3)me.p=mixv(M0,hand,io((t-1.5)/.8));else if(t<3.4)me.p=hand;else if(t<4)me.p=hop(hand,inCr,(t-3.4)/.6,.8);if(t<4)me.s=sz(u01(t,3.4,4))}
 else if(i===7){if(t<4.5)me.vis=false;else if(t<5.5)me.p=mixv(inCr,HOV,io(t-4.5));else if(t<10){me.p=[HOV[0],HOV[1]+Math.sin(T*2)*.12,HOV[2]];me.spin=T*1.6}else if(t<11)me.p=mixv(HOV,inCr,io(t-10));if(t<11)me.s=sz(1-u01(t,4.5,5.5)+u01(t,10,11))}
 else if(i===9&&t>=25)me={k:4,vis:true,p:t<26.2?hop(inCr,SHELF,io((t-25)/1.2),1.6):SHELF,s:sz(1-u01(t,25,26.2))};S.melon=me;
 /* container, its trailer at the UK quay */
 let co=hide,ch={k:2,vis:i===4&&t<22.6,p:[76.5,.25,-14],yaw:0};
 /* container CONT-001 is already in its place on the vessel; the cargo load is lowered into it */
 if(i<=2)co={k:1,vis:SHBR.vis,m:mul(SHBR.m,tr(0,5.45,2)),p:[SHBR.p[0],4,SHBR.p[2]]};
 else if(i===4){if(t<10)co={k:2,vis:t>=0,m:mul(SHUK.m,tr(0,5.45,2)),p:[SHUK.p[0],4,SHUK.p[2]]};else if(t<13.15)co={k:2,vis:true,p:[RIG.uk.x,RIG.uk.y,-14],yaw:0};
  else{const q=pAt(PCH,io(u01(t,13.6,22.4)));ch.p=[q[0],.25,q[2]];ch.yaw=t<13.6?0:q[3];co={k:2,vis:t<22.6,p:[q[0],.91,q[2]],yaw:ch.yaw}}}
 S.cont=co;S.ch=ch;S.open=i>4||(i===4&&t>=22.6);
 /* pallet */
 let pa=hide;
 if(i===6&&t>=6.5){pa={k:3,vis:true,s:1};if(t<7.5){const u=t-6.5;pa.p=hop([153.6,2,29.5],forks(fw),u,1.5);pa.s=Math.min(1,u*4)}else if(t<11.5)pa.p=forks(fw);else if(t<14)pa.p=BAY;else if(t<14.6)pa.p=hop(BAY,forks(fw),io((t-14)/.6),2);else pa.p=forks(fw)}
 else if(i===7)pa={k:3,vis:true,s:1,p:t<2.5?forks(fw):QCP};else if(i>7)pa={k:3,vis:true,s:1,p:QCP};S.pallet=pa;
 return TSC=S}
/* the one list that says who carries the melon when: [stage, from stage time, carrier] */
const STEPS=[[0,0,'melon'],[1,4,'crate'],[1,11.3,'lorryF'],[2,0,'lorryP'],[2,7,'crate'],[2,17.95,'ship'],[3,0,'ship'],[4,0,'shipUK'],[4,10,'cont'],[5,0,'open'],[5,.3,'fork'],[5,2.1,'lorryU'],
 [6,0,'lorryW'],[6,6.5,'pallet'],[7,2.5,'crate'],[7,4.5,'melon'],[7,11,'crate'],[9,3.4,'lorryW'],[9,18.5,'lorryS'],[9,22,'crate'],[9,25,'melon']];
const mvp=(k,m)=>[k,m.p[0],m.p[1]+4.6,m.p[2]],obj=o=>[o.k,o.p[0],o.p[1]+1.5,o.p[2]];
/* carrier -> object to highlight, marker position [site, x, y, z], wording, and whether its id is a record or simulated */
const CARRIER={
 melon:{pid:()=>TID.melon,pos:()=>obj(trkScene().melon),txt:()=>'the melon itself',sim:1},
 crate:{pid:()=>TID.crate,pos:()=>obj(trkScene().crate),txt:()=>'in a crate',sim:1},
 pallet:{pid:()=>TID.pallet,pos:()=>{const o=trkScene().pallet;return[o.k,o.p[0],o.p[1]+2.6,o.p[2]]},txt:c=>'on pallet '+c.pallet},
 fork:{pid:()=>FKA.pid,pos:()=>mvp(2,FKA),txt:c=>'pallet '+c.pallet+', on the forklift'},
 cont:{pid:()=>TID.cont,pos:()=>{const o=trkScene().cont;return[o.k,o.p[0],o.p[1]+3.4,o.p[2]]},txt:c=>'in container '+c.cont},
 open:{pid:()=>OPENC,pos:()=>[2,96,4.6,16],txt:c=>'in container '+c.cont+', being unloaded'},
 ship:{pid:()=>SHBR.pid,pos:()=>[1,SHBR.p[0],13,SHBR.p[2]],txt:c=>'in container '+c.cont+' on the vessel '+c.vessel},
 shipUK:{pid:()=>SHUK.pid,pos:()=>[2,SHUK.p[0],13,SHUK.p[2]],txt:c=>'in container '+c.cont+' on the vessel '+c.vessel},
 lorryF:{pid:()=>LORF.pid,pos:()=>mvp(0,LORF),txt:c=>'on lorry '+c.lorryBR},lorryP:{pid:()=>LORP.pid,pos:()=>mvp(1,LORP),txt:c=>'on lorry '+c.lorryBR},
 lorryU:{pid:()=>LORU.pid,pos:()=>mvp(2,LORU),txt:c=>'on lorry '+c.lorryUK},lorryW:{pid:()=>LORW.pid,pos:()=>mvp(3,LORW),txt:c=>STATE.idx>8?'on the delivery lorry':'on lorry '+c.lorryUK},
 lorryS:{pid:()=>LORS.pid,pos:()=>mvp(4,LORS),txt:()=>'on the delivery lorry'}};
function trkStep(){const i=STATE.idx,t=STATE.t;let s=STEPS[0];for(const q of STEPS)if(q[0]<i||(q[0]===i&&q[1]<=t))s=q;return s}
/* ids for the wording, from the journey records; '?' when a record does not have it */
function trkIds(){const c=context(),b=c.one('batch'),co=c.one('container'),sh=c.one('shipment'),tk=recs('tracking').find(x=>!sh||x.shipmentId===sh.id)||{},v=x=>x==null||x===''?'(not recorded)':String(x).replace(/ \(fictional\)/,'');
 return{batch:v(b&&b.id),pallet:v(tk.palletId||(c.one('pallet')||{}).id),cont:v(co&&co.id),vessel:v(sh&&sh.vessel),lorryBR:v(b&&b.lorry),lorryUK:v(co&&co.truck),level:tk.level||'batch',c}}
/* camera target that follows the tracked object while it is in site k, and a fixed spot otherwise */
/* it reads a smoothed position (TRK.sm, eased in trackTick), so a handoff between carriers glides instead of nudging the view */
const TR=(k,x,z)=>()=>TRK.sm&&TRK.sm[0]===k?geoOf(k,TRK.sm[1],TRK.sm[2]):geoOf(k,x,z);
/* tracked objects are movers with their own ids, so they can be highlighted and picked like anything else */
function buildTracking(){const note='Stands for the whole batch. Its own movements are a simulated illustration: the records trace batches, not single melons.';
 const dyn=(o,q,yaw)=>{o.k=q.k;o.vis=q.vis;const s=q.s==null?1:q.s;if(q.m){o.m=q.m;o.p=q.p}else{o.m=mul(trs(q.p[0],q.p[1],q.p[2],q.yaw||yaw||0,1),sc(s,s,s));o.p=q.p}ENT[o.pid]&&(ENT[o.pid].site=q.k)};
 TID.melon=EM(0,'Representative melon',1,note);mover(0,TID.melon,()=>ball(P.melY,0,0,0,.5,.92,10,5),o=>{const q=trkScene().melon;dyn(o,q,q.spin||0)});
 TID.crate=EM(0,'Crate carrying the melon',1,'The crate the representative melon travels in. Simulated illustration.');mover(0,TID.crate,()=>{crate(0,0,0,0);for(const[x,z,c]of[[-.36,-.25,P.melY],[.36,-.25,P.melG],[-.36,.25,P.melY]])ball(c,x,.6,z,.33,.92,8,4)},o=>dyn(o,trkScene().crate));
 mover(0,EM(0,'Harvest worker',1,'Picks the representative melon and carries its crate to the conveyor.'),()=>person(P.teal,P.straw),o=>{const q=trkScene().hw;o.vis=q.vis;setM(o,q.p[0],Math.abs(Math.sin(T*6))*.1,q.p[2],q.yaw,1.35)});
 mover(1,EM(1,'Quay forklift',2,'Moves cargo from the lorry to its container.'),forklift,o=>{const q=trkScene().fq;setM(o,q.p[0],.25,q.p[2],q.yaw,1.15)});
 mover(3,EM(3,'Intake forklift',6,'Moves the tracked pallet through the warehouse and to quality control.'),forklift,o=>{const q=trkScene().fw;setM(o,q.p[0],.27,q.p[2],q.yaw,1.15)});
 /* three crates on a base; the fourth place is the followed crate, which is its own object so it can carry the highlight */
 mover(1,EM(1,'Cargo load',2,'The whole load from the lorry, handled as one unit: lifted by the forklift, set on the loading platform, then craned onto the vessel.'),()=>{bb(P.wood,0,0,0,3.4,.2,2.6);for(const[x,z]of[[-.8,-.62],[.8,-.62],[-.8,.62]])crate(x,.2,z,1);bb(P.yel,0,1.12,0,3.3,.06,.12);bb(P.yel,0,1.12,0,.12,.06,2.5)},o=>dyn(o,trkScene().cargo));
 mover(1,EM(1,'Loading platform',2,'Where cargo is set down for the quay crane.'),()=>{bb(P.concD,0,0,0,4.2,.15,3.4);for(const z of[-1.6,1.6])bb(P.yel,0,.15,z,4.2,.02,.16)},o=>setM(o,-76.5,.25,-10,0,1));
 TID.cont=EM(1,'Shipping container',2,'The container that carries the batch from Brazil to the UK.');mover(1,TID.cont,()=>cont(P.teal,0,0,0),o=>dyn(o,trkScene().cont));
 mover(2,0,()=>{bb(P.dark,0,0,0,2.4,.5,8.4);for(const z of[-2.6,2.6])for(const x of[-1.1,1.1])wheelX(x,.1,z,.5,.4)},o=>{const q=trkScene().ch;o.vis=q.vis;setM(o,q.p[0],q.p[1],q.p[2],q.yaw,1)});
 mover(2,OPENC,openContainerModel,o=>{o.vis=trkScene().open;setM(o,96,.25,16,Math.PI/2,1)});
 TID.pallet=EM(3,'Pallet carrying the batch',6,'The pallet the pick list sends to quality control.');mover(3,TID.pallet,()=>pallet(0,0,0,2,false,[.95,.78,.26]),o=>dyn(o,trkScene().pallet))}
/* ---- marker, panel line, summary ---- */
let TEL=null,TSUMX=-1;
function initTrackUI(){TEL=el('div','trk');LAB.appendChild(TEL);$('#tsX').onclick=()=>{TSUMX=STATE.idx;$('#trkSum').classList.remove('show')}}
function trkText(){const s=trkStep(),id=trkIds(),ca=CARRIER[s[2]],rep=id.level==='item'?'Tracked melon':'Representative melon';return{rep,where:ca.txt(id),sim:!!ca.sim,id}}
function trackTick(dt){const s=trkStep(),pid=CARRIER[s[2]].pid();if(pid!==TRK.pid){TRK.pid=pid;TRK.pulse=1}TRK.pulse=Math.max(0,TRK.pulse-dt*1.3);TRK.step=s;
 const p=CARRIER[s[2]].pos(),a=1-Math.exp(-dt*4);if(!TRK.sm||TRK.sm[0]!==p[0])TRK.sm=[p[0],p[1],p[3]];else{TRK.sm[1]+=(p[1]-TRK.sm[1])*a;TRK.sm[2]+=(p[3]-TRK.sm[2])*a}}
function updateTrack(){if(!TEL||!TRK.step)return;const tx=trkText(),key=tx.where+DATA.status;
 if(key!==TRK.key){TRK.key=key;TEL.innerHTML=`<i></i><b>${tx.rep}</b><span>${esc(tx.where)}</span>`;TEL.classList.remove('swap');void TEL.offsetWidth;TEL.classList.add('swap')}
 const n=$('#trkNow');if(n&&n.dataset.k!==key){n.dataset.k=key;n.innerHTML=`<b>${tx.rep}</b> of batch ${esc(tx.id.batch)}: now ${esc(tx.where)}.<small>${tx.sim?'This step is a simulated illustration.':'Carrier and ids from the journey records ('+STATUS[DATA.status]+').'} Single melons are not tracked; this one stands for its batch.</small>`}
 /* position: over the object in a visible site, or over the travelling vehicle on the map */
 let q=null;const p=CARRIER[TRK.step[2]].pos();
 if(MARK&&X.d>1500)q=dot(llu(MARK.g[0],MARK.g[1]),X.eyeG)>1.004?proj(X.gvp,llu(MARK.g[0],MARK.g[1])):null;
 else if(PRIM&&PRIM.k===p[0]&&FADE>.6&&X.d<900)q=proj(PRIM.vp,[p[1],p[2],p[3]]);
 const ok=STATE.started&&q&&q[1]>24&&q[1]<GLS.ch-80;TEL.classList.toggle('show',!!ok);if(ok)TEL.style.transform=`translate(${q[0].toFixed(1)}px,${q[1].toFixed(1)}px) translate(-50%,${MARK&&X.d>1500?'95%':'-120%'})`;TEL.classList.toggle('map',!!(MARK&&X.d>1500));
 /* closing summary, once the melon is on the shelf */
 const fin=STATE.idx===9&&STATE.t>=27.5&&TSUMX!==9,su=$('#trkSum');if(STATE.idx!==9)TSUMX=-1;
 if(fin&&!su.classList.contains('show')){const c=tx.id.c,g=(k,f)=>{const r=c.one(k);return r&&r[f]!=null?esc(r[f]):'not recorded'},row=(a,b)=>`<li><b>${a}</b>${b}</li>`;
  $('#tsBody').innerHTML=`<p>${tx.rep} of batch ${esc(tx.id.batch)}, shipment ${g('shipment','id')}.</p><ol>${row('Farm',g('farm','name')+' · harvested '+g('batch','harvestDate'))}${row('Road',  'lorry '+g('batch','lorry')+' to the export port')}${row('Sea','container '+g('container','id')+' on '+g('shipment','vessel')+' · '+g('shipment','departure')+' to '+g('shipment','arrival'))}${row('Customs',g('customs','id')+' · '+g('customs','status')+' '+g('customs','cleared'))}${row('Warehouse',g('allocation','warehouse')+' · pick list '+g('allocation','id'))}${row('Quality control',g('qc','id')+' · '+g('qc','accepted')+' accepted, '+g('qc','rejected')+' rejected')}${row('Delivery',g('delivery','id')+' · '+g('delivery','date')+' · '+g('delivery','status'))}</ol><small>Ids, dates and quantities: ${STATUS[DATA.status]}. The path of this single melon and its crate is a simulated illustration of how the batch moved; individual melons are not tracked.</small>`}
 su.classList.toggle('show',fin)}
