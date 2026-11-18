'use strict';
/* ================= movers (driven by stage time, so every stage can be paused and scrubbed) ================= */
const STATE={mode:'guided',idx:0,t:0,playing:false,started:false,hold:false,att:false,panel:false};
const MOV=[],ID=I();
function mover(k,pid,build,upd){const sv=[V,PID,MOVB];V=[];PID=pid;MOVB=true;MAT=0;SW=0;MEL.T=[];build();const mesh=upload(V);const mel=melTake();V=sv[0];PID=sv[1];MOVB=sv[2];const o={k,meshes:{[BUILD]:mesh},mel:{[BUILD]:mel},build,pid,m:I(),upd,vis:true,p:[0,0,0]};MOV.push(o);if(pid&&ENT[pid]&&!ENT[pid].mover)ENT[pid].mover=o;return o}
function setM(o,x,y,z,yaw,s){o.m=trs(x,y,z,yaw,s);o.p=[x,y,z]}
const tau=i=>STATE.idx===i?STATE.t:(STATE.idx>i?1e9:-1),u01=(t,a,b)=>clamp((t-a)/(b-a),0,1);
const onPath=(o,pa,u,y)=>{const p=pathPose(pa,u,3.5);setM(o,p[0],y,p[2],p[3],1)};
const EM=(k,name,stage,note)=>{CUR=k;return ent(name,stage,note)};
/* the journey's lorries are a strong red in every style, so the one travelling on the map is easy to spot */
const LRED=[.86,.15,.13];
let LORF,LORP,LORU,LORW,LORS,SHBR,SHUK,FKA;const RIG={};
/* the farm conveyor: start z, length, slots, speed in units per stage second, the stage time slot 0 enters, top surface height */
const BELT={z0:15.5,L:11.7,n:3,v:4.5,t0:16.2,y:.9};
function beltSlot(k){const c=STATE.idx===1?STATE.t:T*.35+100,d=BELT.v*(c-BELT.t0)+k*BELT.L/BELT.n,m=((d%BELT.L)+BELT.L)%BELT.L;return{z:BELT.z0+m,u:m/BELT.L,cyc:Math.floor(d/BELT.L)}}
function buildMovers(){
 /* ---- farm ---- */
 LORF=mover(0,EM(0,'Collection lorry',1,'Carries the packed crates from the farm to the export port.'),()=>lorry(LRED,LRED,P.white),o=>{const t=tau(1);o.vis=t<25.4;onPath(o,RDF,legE(0,'d',u01(t,19.5,25.5)),.12);if(t<19.5)setM(o,-128,.12,30.5,-Math.PI/2,1)});
 /* a worker walking between two points and back, pausing at each end; the stride follows the distance actually covered */
 const walker=(k,nm,stage,note,a,b,per,shirt,hat,ph)=>{const role=/Shopper/.test(nm)?'shopper':/colleague/.test(nm)?'store':/Harvest|Loader/.test(nm)?'harvest':/Farm/.test(nm)?'farm':null,L=Math.hypot(b[0]-a[0],b[1]-a[1]),hd=Math.atan2(b[0]-a[0],b[1]-a[1]),S={f:0};
  /* the route between the two ends goes round walls and equipment; it is planned once per style from the site's obstacles */
  const PC={},route=()=>{if(PC[STYLE])return PC[STYLE];const p=navPath(k,a,b)||[a,b],cum=[0];for(let i=1;i<p.length;i++)cum.push(cum[i-1]+Math.hypot(p[i][0]-p[i-1][0],p[i][1]-p[i-1][1]));return PC[STYLE]={p,cum,L:cum[cum.length-1]||1}};
  const at=(R,d)=>{d=clamp(d,0,R.L);let i=1;while(i<R.p.length-1&&R.cum[i]<d)i++;const A=R.p[i-1],B=R.p[i],u=(d-R.cum[i-1])/((R.cum[i]-R.cum[i-1])||1);return[lerp(A[0],B[0],u),lerp(A[1],B[1],u)]};
  const o=workerRig(k,EM(k,nm,stage,note),shirt,hat,role,()=>{const R=route(),q=((T+ph)/per)%1,f=q<.5?q*2:2-q*2,e=io(f),d=e*R.L;S.f=f;const p=at(R,d),bk=q<.5?1:-1,p0=at(R,d-.6*bk),p1=at(R,d+.6*bk);
   return{p:[p[0],0,p[1]],yaw:Math.hypot(p1[0]-p0[0],p1[1]-p0[1])>.05?Math.atan2(p1[0]-p0[0],p1[1]-p0[1]):hd+(q<.5?0:Math.PI),s:1.35,phase:d/.95*Math.PI,amt:Math.min(1,Math.sin(Math.PI*f)*3)}});
  Object.defineProperty(o,'f',{get:()=>S.f});return o};
 walker(0,'Farm worker',0,'Inspects the crop as it grows.',[-214.35,4.6],[-214.35,26.4],16,P.blue,P.straw,0);
 walker(0,'Farm worker',0,'Checks plants along the rows.',[-187.85,26.4],[-187.85,4.6],19,P.red,P.straw,4);
 walker(0,'Harvest worker',1,'Cuts ripe melons and carries them to the crates.',[-164.7,5],[-164.7,24],12,P.orange,P.straw,2);
 walker(0,'Harvest worker',1,'Brings full crates to the collection shed.',[-150,12],[-146.5,12],9,P.yel,P.straw,1);
 walker(0,'Loader',1,'Loads packed crates onto the lorry.',[-131,27],[-131,19],7,P.green,P.straw,3);
 /* people standing at their posts in the ports, warehouse and supermarket: animated so they can use the rigged characters */
 for(const[k,x,z,yaw,shirt,role,nm]of[[1,-80,10,1,P.yel,'port','Port worker'],[1,-78,-22,2.5,P.orange,'port','Port worker'],[1,-96,20,0,P.yel,'port','Port worker'],
  [2,101,12.5,2.4,P.yel,'port','Port worker'],[2,84,4,4,P.yel,'port','Port worker'],[2,98,-8,1,P.orange,'port','Port worker'],[3,141,17,3.14,P.blue,'warehouse','Warehouse operative'],
  [4,234.4,15,-Math.PI/2,P.green,'store','Cashier'],[4,230.9,15,-Math.PI/2,P.green,'store','Cashier'],[4,216,-6.5,2.8,P.orange,'shopper','Shopper']])workerRig(k,EM(k,nm,{1:2,2:4,3:6,4:9}[k],role==='port'?'Works on the quay.':role==='warehouse'?'Reads the pick list at the warehouse terminal.':role==='store'?'Serves at a checkout.':'Browsing the shelves.'),shirt,role==='port'?P.white:null,role,()=>({p:[x,0,z],yaw,s:1.35}));
 /* packers at the collection shed: stand at the tables and reach down into the crates now and then */
 for(const[x,z,yaw,shirt,ph]of[[-143.5,10.5,1.6,P.orange,0],[-139,6.2,3.1,P.blue,2.3]])workerRig(0,EM(0,'Packer',1,'Packs melons into crates at the collection shed.'),shirt,P.straw,'harvest',()=>{const w=Math.sin(T*.55+ph);return{p:[x,0,z],yaw,s:1.35,bend:w>.35?.55:.08,reachR:ss(.2,.7,w)}});
 mover(0,0,()=>{for(let k=0;k<3;k++)Tp(0,0,0,k/3*TAU,1,()=>{bb(P.steel,.5,0,0,1,.07,.07);ball(P.dark,1,0,0,.22,1,6,3)})},o=>{o.m=mul(tr(-186,6,-6),rY(T*3))});
 for(let k=0;k<5;k++)mover(0,0,()=>ball(k%2?P.melG:P.melY,0,0,0,MELR,.9,6,3),o=>{const u=(T/3.2+k/5)%1,a=[-164.7+(k%2?1.6:-1.6),.6,7+k*3.6],b=k%2?[-159.9,1.2,14]:[-166.4,1.2,8+(k>2?12:0)];setM(o,lerp(a[0],b[0],u),lerp(a[1],b[1],u)+Math.sin(u*Math.PI)*3,lerp(a[2],b[2],u),0,Math.min(1,u*8,(1-u)*8))});
 const cr=EM(0,'Packed crates',1,'Crates of melons on their way to the lorry.');
 /* conveyor: three evenly spaced slots on one belt clock. In stage 2 the clock is stage time (so pause and seek hold),
    and the tracked crate (tracking.js) rides slot 0 for one pass, during which the ordinary crate in that slot is not drawn. */
 for(let k=0;k<BELT.n;k++)mover(0,cr,()=>crate(0,0,0,1),o=>{const s=beltSlot(k);/* in the harvest stage the belt carries only the cart's crates (tracking.js); elsewhere it runs on its own */o.vis=STATE.idx===0;setM(o,-128.5,BELT.y,s.z,0,Math.min(1,s.u*10,(1-s.u)*10))});
 /* ---- cranes ---- */
 const rig=(k,side,x0,z,dir,stage,act)=>{const xq=x0-3.5*dir,xs=side==='br'?-62:62,st={x:xq,y:10.4,c:false};RIG[side]=st;
  const cid=EM(k,side==='br'?'Container being loaded':'Container being unloaded',stage,side==='br'?'Each container loaded is recorded on the shipping manifest.':'Containers come off the vessel while the customs declaration is processed.');
  mover(k,0,()=>bb(P.dark,0,-.3,0,2.4,.9,3),o=>{const a0=act(),on=a0>=0,ph=on?a0:.99,load=side==='br',tk=trkCycle(side),A=load?xq:xs,B=load?xs:xq,yA=load?.25:tk?6.6:8.1,yB=load?(tk?6.6:8.1):tk?.75:.25;
   /* the followed container's lift: lower the spreader onto it, lift, travel, lower into its slot, release and return */
   if(tk&&load){const a=io(ph<.3?0:ph<.55?(ph-.3)/.25:ph<.72?1:1-(ph-.72)/.28);st.x=lerp(A,B,a);st.c=ph>=.15&&ph<.72;st.y=ph<.15?lerp(10.4,yA,io(ph/.15)):ph<.3?lerp(yA,10.4,io((ph-.15)/.15)):ph<.55?10.4:ph<.72?lerp(10.4,yB,io((ph-.55)/.17)):lerp(yB,10.4,io(Math.min(1,(ph-.72)/.12)));setM(o,st.x,14,z,0,1);return}
   const a=io(ph<.2?0:ph<.5?(ph-.2)/.3:ph<.7?1:1-(ph-.7)/.3);st.x=lerp(A,B,a);st.c=ph<.7&&on;st.y=ph<.2?lerp(yA,10.4,io(ph/.2)):ph<.5?10.4:ph<.7?lerp(10.4,yB,io((ph-.5)/.2)):10.4;setM(o,st.x,14,z,0,1)});
  mover(k,0,()=>{bb(P.dark,-.9,0,0,.08,1,.08);bb(P.dark,.9,0,0,.08,1,.08)},o=>{const top=st.y+2.75;o.m=mul(tr(st.x,top,z),sc(1,13.7-top,1))});
  mover(k,0,()=>bb(P.yel,0,0,0,2.9,.18,6.4),o=>setM(o,st.x,st.y+2.6,z,0,1));
  mover(k,cid,()=>cont(side==='br'?P.green:P.red,0,0,0),o=>{o.vis=st.c&&!trkCycle(side);setM(o,st.x,st.y,z,0,1)});
  /* the last container unloaded stays where the crane set it down (released at 70% of the second cycle: 10+4.5+.7*4.5) */
  if(side==='uk')mover(k,cid,()=>cont(P.red,0,0,0),o=>{o.vis=tau(stage)>=17.65;setM(o,xq,.25,z,0,1)})};
 /* export crane: one ordinary container early, then the tracked cargo load (14.8 to 19.3) once the forklift has set it on the platform */
 rig(1,'br',-73,-10,1,2,()=>{const t=tau(2);return t>=16&&t<20.5?(t-16)/4.5:-1});
 rig(2,'uk',73,-14,-1,4,()=>{const t=tau(4);return t>=10&&t<19?((t-10)/4.5)%1:-1});
 /* ---- export port ---- */
 LORP=mover(1,EM(1,'Collection lorry',2,'Arrives from the farm with the packed melons.'),()=>lorry(LRED,LRED,P.white,true),o=>{const t=tau(2);o.vis=t>=0;onPath(o,RDP,legE(0,'a',u01(t,1,6.5)),.12)});
 const sid=EM(1,'Cargo vessel',2,'Carries the containers from Brazil to the UK. Temperature and CO₂ levels are monitored on the way.');
 SHBR=mover(1,sid,shipModel,o=>{const t=tau(2);o.vis=t<25.9;const p=pathPose(SBR,legE(1,'d',u01(t,20.6,26)),9);setM(o,p[0],-1.5+Math.sin(T*1.1)*.12,p[2],p[3],1)});
 /* ---- UK port ---- */
 SHUK=mover(2,EM(2,'Cargo vessel',4,'Arrives from Brazil. Its containers wait for the customs declaration to be processed.'),shipModel,o=>{const t=tau(4);o.vis=t>=0;const p=pathPose(SUK,legE(1,'a',u01(t,.5,9)),9);setM(o,p[0],-1.5+Math.sin(T*1.1)*.12,p[2],p[3],1)});
 for(const s of[-1,1])mover(2,0,()=>bb(P.teal,s*.65,0,0,1.3,2.5,.12),o=>{const t=tau(5),a=(t<0?0:ss(0,.4,t))*1.9+.25;/* fully open before the forklift reaches the doorway */o.vis=trkScene().open;o.m=mul(tr(100,.91,16-s*1.3),rY(Math.PI/2-s*a))});
 const fa=EM(2,'Forklift',5,'Takes the pallet out of the container and loads it through the rear doors of the lorry.');
 /* route, fork height and pallet hand-offs: trkScene().fu in tracking.js */
 const fkA=FKA=mover(2,fa,()=>forklift(true),o=>{const q=trkScene().fu;setM(o,q.p[0],.25,q.p[2],q.yaw,1.15)});forkliftOperator(2,fkA,'port');
 LORU=mover(2,EM(2,'Inland lorry',5,'Carries the pallets from the port to the warehouse.'),()=>lorry(LRED,LRED,P.white,true),o=>{const t=tau(5);o.vis=STATE.idx>=4&&t<17.4;onPath(o,RDU,legE(2,'d',u01(t,11.3,17.5)),.3)});
 /* ---- warehouse, QC ---- */
 LORW=mover(3,EM(3,'Lorry at the loading bay',6,'Brings pallets in from the port, and later leaves with accepted melons for the supermarket.'),()=>lorry(LRED,LRED,P.white),o=>{const t=tau(6),t9=tau(9);o.vis=t>=0&&t9<11.4;if(t9>=4)onPath(o,RWD,legE(3,'d',u01(t9,4,11.5)),.12);else onPath(o,RWA,legE(2,'a',u01(t,1,6.5)),.12)});
 const fb=EM(3,'Warehouse forklift',6,'Moves each pallet to the location the pick list gives it.'),ZX=[134,146,158];
 const FKB=ZX.map(x=>P2([[131,13],[134.5,12.4],[(134.5+x)/2,10.4],[x,8.6],[x,4.5]],5)),FKY=Math.atan2(3.5,-.6);
 const fkB=mover(3,fb,forklift,o=>{const c=T/10,zi=Math.floor(c)%3,q=c%1,f=q<.5?q*2:2-q*2,p=pathPose(FKB[zi],io(f),2.2);
  /* it waits at its bay while the intake forklift carries the tracked pallet through the same floor, so the two never cross */
  const w=STATE.idx===6?ss(4.5,6.5,STATE.t):STATE.idx===7?1-ss(15,16,STATE.t):0;/* at its base every trip starts on the same heading, so switching to the next bay does not snap it round */
  setM(o,lerp(p[0],131,w),.27,lerp(p[2],13,w),lerp(FKY,p[3],ss(0,.12,f)),1.15);o.laden=q<.5&&w<.02});
 mover(3,fb,()=>pallet(0,.45,2.3,2),o=>{o.vis=fkB.laden;o.m=fkB.m});forkliftOperator(3,fkB,'warehouse');
 for(let k=0;k<3;k++)mover(3,0,()=>crate(0,0,0,1),o=>{const t=tau(9),u=(t/1.4+k/3)%1;o.vis=t>=0&&t<2.2;setM(o,lerp(150.2,152,u),.4+Math.sin(u*Math.PI)*3.2,lerp(23.5,29.5,u),0,Math.min(1,u*8,(1-u)*8))});
 const ins=EM(3,'Third-party inspector',7,'Checks the fruit for damage and decides whether it is fit to ship to supermarket suppliers.');
 /* inspectors shuffle along their table and reach out to the fruit in front of them */
 for(const[x,ph]of[[174.5,0],[183.5,2]])workerRig(3,ins,P.white,null,'qc',()=>{const u=Math.sin(T*.7+ph),v=Math.cos(T*.7+ph);return{p:[x+u*.9,0,5.5],yaw:0,s:1.35,phase:u*5,amt:Math.min(1,Math.abs(v)*.8),reachR:ss(.2,.9,Math.sin(T*1.3+ph)),bend:.12}});
 for(const[x,ph,c]of[[174.5,0,P.melY],[183.5,1.5,[.6,.46,.27]]])mover(3,0,()=>ball(c,0,0,0,MELR,.9,8,4),o=>{const q=(T/4+ph)%1;o.m=mul(mul(tr(x-.3,2+Math.sin(q*Math.PI)*1.1,7.6),rY(T*2)),rZ(.4))});
 for(let k=0;k<6;k++)mover(3,0,()=>ball(k%3?P.melY:P.melG,0,0,0,MELR,.9,6,3),o=>{const u=(T/9+k/6)%1;setM(o,lerp(172,186,u),1.37,13,T+k,Math.min(1,u*12,(1-u)*12))});
 /* ---- supermarket ---- */
 LORS=mover(4,EM(4,'Delivery lorry',9,'Carries accepted melons from the warehouse to the supermarket.'),()=>lorry(LRED,LRED,P.white),o=>{const t=tau(9);o.vis=t>=16;onPath(o,RSM,legE(3,'a',u01(t,16.5,22)),.12)});
 for(let k=0;k<3;k++)mover(4,0,()=>crate(0,0,0,1),o=>{const t=tau(9),u=((t-24.9)/1.6+k/3)%1;o.vis=t>=24.9&&t<28.5;setM(o,lerp(201.5,214.5,u),.5+Math.sin(u*Math.PI)*4,lerp(13,10.6,u),0,Math.min(1,u*8,(1-u)*8))});
 const sh=walker(4,'Shopper',9,'Chooses a melon from the display.',[226.5,19.6],[223.5,11.2],14,P.red,null,0);
 /* more of the store at work: a shopper walking the aisles, two browsing the produce, a colleague restocking an aisle */
 walker(4,'Shopper',9,'Walks the aisles with a basket.',[236.4,-2],[209.6,-14],18,P.blue,null,3);
 for(const[x,z,yaw,c,nm,note]of[[220,17.6,Math.PI,P.yel,'Shopper','Choosing fruit.'],[208.5,15,Math.PI/2,P.teal,'Shopper','Looking over the vegetables.']])workerRig(4,EM(4,nm,9,note),c,null,'shopper',()=>({p:[x,0,z],yaw,s:1.35,phase:Math.sin(T*.6+x)*.4,amt:.15,reachR:ss(.3,.9,Math.sin(T*.9+z))*.7,bend:.08}));
 workerRig(4,EM(4,'Store colleague',9,'Restocks the grocery aisle.'),P.green,null,'store',()=>({p:[227,0,-9.7],yaw:Math.PI,s:1.35,reachR:ss(.1,.9,Math.sin(T*1.1)),bend:.1+.08*Math.sin(T*1.1)}));
 /* the melon the shopper picks up, held in front of them */
 mover(4,0,()=>ball(P.melY,0,0,0,MELR,.9,8,4),o=>{o.vis=sh.f>.9;setM(o,223.45,1.72+Math.sin(T*2)*.03,10.75,T*.3,1)});
 walker(4,'Store colleague',9,'Restocks the melon display.',[204.5,10],[217,8.5],13,P.green,null,5);
}
