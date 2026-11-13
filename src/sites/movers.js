'use strict';
/* ================= movers (driven by stage time, so every stage can be paused and scrubbed) ================= */
const STATE={mode:'guided',idx:0,t:0,playing:false,started:false,hold:false,att:false,panel:false};
const MOV=[],ID=I();
function mover(k,pid,build,upd){const sv=[V,PID,MOVB];V=[];PID=pid;MOVB=true;MAT=0;SW=0;build();const mesh=upload(V);V=sv[0];PID=sv[1];MOVB=sv[2];const o={k,mesh,m:I(),upd,vis:true,p:[0,0,0]};MOV.push(o);if(pid&&ENT[pid]&&!ENT[pid].mover)ENT[pid].mover=o;return o}
function setM(o,x,y,z,yaw,s){o.m=trs(x,y,z,yaw,s);o.p=[x,y,z]}
const tau=i=>STATE.idx===i?STATE.t:(STATE.idx>i?1e9:-1),u01=(t,a,b)=>clamp((t-a)/(b-a),0,1);
const onPath=(o,pa,u,y)=>{const p=pAt(pa,u);setM(o,p[0],y,p[2],p[3],1)};
const EM=(k,name,stage,note)=>{CUR=k;return ent(name,stage,note)};
let LORF,LORP,LORU,LORW,LORS,SHBR,SHUK;
function buildMovers(){
 /* ---- farm ---- */
 LORF=mover(0,EM(0,'Collection lorry',1,'Carries the packed crates from the farm to the export port.'),()=>lorry(P.white,P.white,P.green),o=>{const t=tau(1);o.vis=t<17.4;onPath(o,RDF,io(u01(t,9,17.5)),.12);if(t<9)setM(o,-128,.12,30.5,Math.PI/2,1)});
 const TP=mkPath(xz([[-226,-1],[-204,-1],[-202,2],[-202,30],[-202,2],[-204,-1],[-226,-1]]));
 mover(0,EM(0,'Tractor',0,'Works the tracks between the fields.'),()=>{bb(P.green,0,.8,.2,1.6,1.1,3);bb(P.green,0,1.9,-.6,1.5,1.5,1.5);bb(P.glass,0,2.4,.17,1.3,.8,.04);for(const x of[-.95,.95]){wheelX(x,.95,-.7,.95,.5);wheelX(x,.55,1.3,.55,.4)}cyl(P.dark,.5,1.9,1.2,.1,1,5)},o=>{const p=pAt(TP,(T/40)%1);setM(o,p[0],.1,p[2],p[3],1)});
 const walker=(k,nm,stage,note,a,b,per,shirt,hat,ph)=>mover(k,EM(k,nm,stage,note),()=>person(shirt,hat),o=>{const q=((T+ph)/per)%1,f=q<.5?q*2:2-q*2,e=io(f);setM(o,lerp(a[0],b[0],e),Math.abs(Math.sin(T*6+ph))*.14*(f>.03&&f<.97?1:0),lerp(a[1],b[1],e),Math.atan2(b[0]-a[0],b[1]-a[1])+(q<.5?0:Math.PI),1.35);o.f=f});
 walker(0,'Farm worker',0,'Inspects the crop as it grows.',[-215.3,5],[-215.3,26],16,P.blue,P.straw,0);
 walker(0,'Farm worker',0,'Checks plants along the rows.',[-188.3,26],[-188.3,5],19,P.red,P.straw,4);
 walker(0,'Harvest worker',1,'Cuts ripe melons and carries them to the crates.',[-163.2,6],[-163.2,23],12,P.orange,P.straw,2);
 walker(0,'Harvest worker',1,'Brings full crates to the collection shed.',[-150,12],[-146.5,12],9,P.yel,P.straw,1);
 walker(0,'Loader',1,'Loads packed crates onto the lorry.',[-131,27],[-131,19],7,P.green,P.straw,3);
 mover(0,0,()=>{for(let k=0;k<3;k++)Tp(0,0,0,k/3*TAU,1,()=>{bb(P.steel,.5,0,0,1,.07,.07);ball(P.dark,1,0,0,.22,1,6,3)})},o=>{o.m=mul(tr(-186,6,-6),rY(T*3))});
 for(let k=0;k<5;k++)mover(0,0,()=>ball(k%2?P.melG:P.melY,0,0,0,.5,.9,6,3),o=>{const u=(T/3.2+k/5)%1,a=[-163.2+(k%2?1.6:-1.6),.6,7+k*3.6],b=k%2?[-159.9,1.2,14]:[-166.4,1.2,8+(k>2?12:0)];setM(o,lerp(a[0],b[0],u),lerp(a[1],b[1],u)+Math.sin(u*Math.PI)*3,lerp(a[2],b[2],u),0,Math.min(1,u*8,(1-u)*8))});
 const cr=EM(0,'Packed crates',1,'Crates of melons on their way to the lorry.');
 for(let k=0;k<4;k++)mover(0,cr,()=>crate(0,0,0,1),o=>{const u=(T/9+k/4)%1;o.vis=tau(1)<9.5;setM(o,-128.5,.82,lerp(15,27.4,u),0,Math.min(1,u*10,(1-u)*10))});
 /* ---- cranes ---- */
 const rig=(k,side,x0,z,dir,stage,act)=>{const xq=x0-3.5*dir,xs=side==='br'?-62:62,st={x:xq,y:10.4,c:false};
  const cid=EM(k,side==='br'?'Container being loaded':'Container being unloaded',stage,side==='br'?'Each container loaded is recorded on the shipping manifest.':'Containers come off the vessel while the customs declaration is processed.');
  mover(k,0,()=>bb(P.dark,0,-.3,0,2.4,.9,3),o=>{const a0=act(),on=a0>=0,ph=on?a0:.99,load=side==='br',A=load?xq:xs,B=load?xs:xq,yA=load?.25:8.1,yB=load?8.1:.25;
   const a=io(ph<.2?0:ph<.5?(ph-.2)/.3:ph<.7?1:1-(ph-.7)/.3);st.x=lerp(A,B,a);st.c=ph<.7&&on;st.y=ph<.2?lerp(yA,10.4,io(ph/.2)):ph<.5?10.4:ph<.7?lerp(10.4,yB,io((ph-.5)/.2)):10.4;setM(o,st.x,14,z,0,1)});
  mover(k,0,()=>{bb(P.dark,-.9,0,0,.08,1,.08);bb(P.dark,.9,0,0,.08,1,.08)},o=>{const top=st.y+2.75;o.m=mul(tr(st.x,top,z),sc(1,13.7-top,1))});
  mover(k,0,()=>bb(P.yel,0,0,0,2.9,.18,6.4),o=>setM(o,st.x,st.y+2.6,z,0,1));
  mover(k,cid,()=>cont(side==='br'?P.green:P.red,0,0,0),o=>{o.vis=st.c;setM(o,st.x,st.y,z,0,1)})};
 rig(1,'br',-73,-10,1,2,()=>{const t=tau(2);return t>=7&&t<16?((t-7)/4.5)%1:-1});
 rig(2,'uk',73,-14,-1,4,()=>{const t=tau(4);return t>=10&&t<19?((t-10)/4.5)%1:-1});
 /* ---- export port ---- */
 LORP=mover(1,EM(1,'Collection lorry',2,'Arrives from the farm with the packed melons.'),()=>lorry(P.white,P.white,P.green),o=>{const t=tau(2);o.vis=t>=0;onPath(o,RDP,io(u01(t,1,6.5)),.12)});
 const sid=EM(1,'Cargo vessel',2,'Carries the containers from Brazil to the UK. Temperature and CO₂ levels are monitored on the way.');
 SHBR=mover(1,sid,shipModel,o=>{const t=tau(2);o.vis=t<25.9;const p=pAt(SBR,io(u01(t,17,26)));setM(o,p[0],-1.5+Math.sin(T*1.1)*.12,p[2],p[3],1)});
 /* ---- UK port ---- */
 SHUK=mover(2,EM(2,'Cargo vessel',4,'Arrives from Brazil. Its containers wait for the customs declaration to be processed.'),shipModel,o=>{const t=tau(4);o.vis=t>=0;const p=pAt(SUK,out(u01(t,.5,9)));setM(o,p[0],-1.5+Math.sin(T*1.1)*.12,p[2],p[3],1)});
 for(const s of[-1,1])mover(2,0,()=>bb(P.teal,s*.65,0,0,1.3,2.5,.12),o=>{const t=tau(5),a=(t<0?0:t>8.5?1:.5+.5*Math.sin(T*.5))*1.9+.25;o.m=mul(tr(100,.91,16-s*1.3),rY(Math.PI/2-s*a))});
 const fa=EM(2,'Forklift',5,'Carries pallets from the container to the waiting lorry.');
 const FA=mkPath(xz([[101.6,16],[109.4,16]]));
 const fkA=mover(2,fa,forklift,o=>{const t=tau(5),on=t>=0&&t<8.5,q=on?(t/4.2)%1:0,f=q<.5?q*2:2-q*2,p=pAt(FA,io(f));setM(o,p[0],.25,p[2],q<.5?Math.PI/2:-Math.PI/2,1.15);o.laden=on&&q<.5});
 mover(2,fa,()=>pallet(0,.45,2.3,2),o=>{o.vis=fkA.laden;o.m=fkA.m});
 LORU=mover(2,EM(2,'Inland lorry',5,'Carries the pallets from the port to the warehouse.'),()=>lorry(P.white,P.white,P.blue),o=>{const t=tau(5);o.vis=STATE.idx>=4&&t<17.4;onPath(o,RDU,io(u01(t,9,17.5)),.3)});
 /* ---- warehouse, QC ---- */
 LORW=mover(3,EM(3,'Lorry at the loading bay',6,'Brings pallets in from the port, and later leaves with accepted melons for the supermarket.'),()=>lorry(P.white,P.white,P.yel),o=>{const t=tau(6),t9=tau(9);o.vis=t>=0&&t9<11.4;if(t9>=4)onPath(o,RWD,io(u01(t9,4,11.5)),.12);else onPath(o,RWA,out(u01(t,1,6.5)),.12)});
 const fb=EM(3,'Warehouse forklift',6,'Moves each pallet to the location the pick list gives it.'),ZX=[134,146,158];
 const fkB=mover(3,fb,forklift,o=>{const c=T/10,zi=Math.floor(c)%3,q=c%1,f=q<.5?q*2:2-q*2,p=pAt(mkPath(xz([[131,13],[ZX[zi],9],[ZX[zi],4.5]])),io(f));setM(o,p[0],.27,p[2],q<.5?p[3]:p[3]+Math.PI,1.15);o.laden=q<.5});
 mover(3,fb,()=>pallet(0,.45,2.3,2),o=>{o.vis=fkB.laden;o.m=fkB.m});
 for(let k=0;k<3;k++)mover(3,0,()=>crate(0,0,0,1),o=>{const t=tau(9),u=(t/1.4+k/3)%1;o.vis=t>=0&&t<4;setM(o,lerp(148,150.5,u),.4+Math.sin(u*Math.PI)*3.2,lerp(23.5,29.5,u),0,Math.min(1,u*8,(1-u)*8))});
 const ins=EM(3,'Third-party inspector',7,'Checks the fruit for damage and decides whether it is fit to ship to supermarket suppliers.');
 for(const[x,ph]of[[174.5,0],[183.5,2]])mover(3,ins,()=>person(P.white,null),o=>setM(o,x+Math.sin(T*.7+ph)*.9,0,6,0,1.35));
 for(const[x,ph,c]of[[174.5,0,P.melY],[183.5,1.5,[.6,.46,.27]]])mover(3,0,()=>ball(c,0,0,0,.44,.9,8,4),o=>{const q=(T/4+ph)%1;o.m=mul(mul(tr(x-.3,2+Math.sin(q*Math.PI)*1.1,7.6),rY(T*2)),rZ(.4))});
 for(let k=0;k<6;k++)mover(3,0,()=>ball(k%3?P.melY:P.melG,0,0,0,.42,.9,6,3),o=>{const u=(T/9+k/6)%1;setM(o,lerp(172,186,u),1.62,13,T+k,Math.min(1,u*12,(1-u)*12))});
 /* ---- supermarket ---- */
 LORS=mover(4,EM(4,'Delivery lorry',9,'Carries accepted melons from the warehouse to the supermarket.'),()=>lorry(P.white,P.white,P.yel),o=>{const t=tau(9);o.vis=t>=16;onPath(o,RSM,out(u01(t,16.5,22)),.12)});
 for(let k=0;k<3;k++)mover(4,0,()=>crate(0,0,0,1),o=>{const t=tau(9),u=((t-22)/1.6+k/3)%1;o.vis=t>=22&&t<26.5;setM(o,lerp(201.5,216.6,u),.5+Math.sin(u*Math.PI)*4,lerp(13,8.5,u),0,Math.min(1,u*8,(1-u)*8))});
 const sh=walker(4,'Shopper',9,'Chooses a melon from the display.',[231,19],[223.5,11.2],14,P.red,null,0);
 mover(4,0,()=>ball(P.melY,0,0,0,.46,.9,8,4),o=>{o.vis=sh.f>.9;setM(o,223,3.6+Math.sin(T*2)*.15,10.4,T,1)});
 walker(4,'Store colleague',9,'Restocks the melon display.',[204.5,10],[217,8.5],13,P.green,null,5);
}
