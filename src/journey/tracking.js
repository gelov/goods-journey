'use strict';
/* ================= follow one melon =================
   One representative melon is followed from the field to the shelf. STEPS is the single list that says, for every
   moment of the journey, which object carries it (the melon itself, its crate, a pallet, a lorry, the container, the
   vessel). Everything else reads that list: the gold highlight, the floating marker, the camera targets (TR in
   scripts.js), the "now" line in the panel and the closing summary.
   What is real and what is not: carrier ids (batch, pallet, container, lorries, vessel) and dates come from the
   journey records through context(). The movements of the single melon and its crate are a simulated illustration;
   the records trace batches, not individual melons, and the UI says so. */
let FARMER=null,MOV_TAG=0;const TID={},TRK={pid:0,pulse:0,step:null,key:''};
const hop=(a,b,u,h)=>[lerp(a[0],b[0],u),lerp(a[1],b[1],u)+Math.sin(u*Math.PI)*h,lerp(a[2],b[2],u)],mixv=(a,b,u)=>hop(a,b,u,0);
const M0=[-156.2,.25+MELR*.92,12.2],CR0=[-154.6,.2,13.5],TBL=[176.9,1.45,7.3],HOV=[176.9,2.9,7.3],SHELF=[219,1.47+MELR*.92+MSTACK.layers*MSTACK.dy,8+MSTEP/2],W0=[-79.7,.25,-10];
/* farm cart: route from the collection point outside the greenhouse door to the conveyor, and the picker's walks around it */
/* export quay forklift routes: up to the lorry's rear, reverse out turning, round the lorry to the waiting container, into its door, back out and park */
const PQ1=P2([[-84,20],[-88,18.6],[-91.4,16.6],[-92,15],[-92,13.25]]),PQR=P2([[-92,11.85],[-92,13.6],[-92.8,15.6],[-94.4,16.8]]),
 PQ3=P2([[-94.4,16.8],[-91.5,14.2],[-88,12.5],[-85.6,8.6],[-83.4,3.2],[-79.4,-.6],[-76.6,-2.6],[-76.5,-3.4]]),PQ4=P2([[-76.5,-3.4],[-76.5,-4.85]]),
 PQ5=P2([[-76.5,-4.85],[-76.5,-1.8],[-78.6,.8],[-82.6,2.2],[-86,2.4]]),PQ5Y=Math.PI/2;
const CART_R=P2([[-146.8,20],[-142,20.2],[-137.5,19.6],[-134.6,18.2],[-133.4,16.4],[-133.4,15.4]],8),CART_SLOT=[-1.15,0,1.15],CART_DECK=.67,
 PHC=P2([[-154.6,12.3],[-152.1,12.4],[-151.9,15.4],[-150.4,16.3],[-148.4,17.4],[-145.65,18.4]]),PHH=P2([[-145.65,18.4],[-148.6,18.6],[-149.4,19.4],[-149.35,20]]),PHU=P2([[-133.4,17.95],[-132,17.3],[-131.7,15.4]]),
 UNLOAD=[-131.7,0,15.4],UNLOADS=[14.47,15.33,16.2],PFA=P2([[-86,18.5],[-90,17.5],[-92,15.8],[-92,14.6]]),PFC=P2([[-92,17.4],[-89,18],[-86.5,14],[-85.5,5],[-84.5,-3],[-83.3,-8.5],[-81.5,-10],[-79.2,-10]]),
 PTUG=P2([[76.5,-14],[76.5,-5],[77.6,-1.4],[80.5,.6],[85,1.2],[95,1.5],[99.5,4.5],[100.5,8],[98.5,11.5],[93,15.6],[88.3,16]]),PWA=P2([[150.5,27],[151,20],[142,10],[137.5,3],[136.4,-.2]]),PWT=P2([[136.4,-.2],[137,3],[139,5.5],[141.5,6]]),
 PWB=P2([[141.5,6],[150,7],[166,6.5],[171,10],[176,15.6],[178.2,15.6]]),PWQ=P2([[178.2,15.6],[174,15.8],[171,14.5],[170.3,11],[170.2,9.5]]),PWC=P2([[170.2,9.5],[166,8],[156,12],[150,19],[148.2,22]]);
/* a forklift pose on a path, and where its forks hold a load */
const fkPose=(pa,u,yaw)=>{const p=pathPose(pa,u,2.5);return{p:[p[0],.27,p[2]],yaw:yaw==null?p[3]:yaw}},forks=(f,y)=>[f.p[0]+Math.sin(f.yaw)*2.65,y==null?.8:y,f.p[2]+Math.cos(f.yaw)*2.65];
/* the quay forklift reverses out on the heading it arrived with */
let FQY_=null;const FQYf=()=>FQY_==null?(FQY_=pathPose(PFA,1,2.5)[3]):FQY_;
/* UK quay: a terminal tractor tows the container's trailer from under the crane, round to the unloading spot (trailer centre 96,16, heading -x,
   so the doors face the forklift). The trailer rides the path; the tractor sits on the path a fixed hitch distance ahead of it. */
const TUGD=7.7,angL=(a,b,f)=>a+((((b-a)%(2*Math.PI))+3*Math.PI)%(2*Math.PI)-Math.PI)*f;
function tugPair(t){const L=PTUG.len,u=io(u01(t,13.6,22.4)),st=TUGD+u*(L-TUGD),q=pathPose(PTUG,st/L,1.6),e=ss(.94,1,u),ec=e,P_=Math.PI/2;
 /* hitch at the end of the tow bar; the trailer centre is the point behind it on the path 4.35 m away, and the trailer points at the hitch */
 const H=[q[0]-Math.sin(q[3])*3.35,q[2]-Math.cos(q[3])*3.35];let sc=st-TUGD,a;for(let n=0;n<8;n++){a=pAt(PTUG,Math.max(0,sc)/L);sc+=Math.hypot(a[0]-H[0],a[2]-H[1])-4.35}
 const cy=Math.atan2(H[0]-a[0],H[1]-a[2]),ah=pathPose(PTUG,Math.min(1,(st+2.5)/L),1.6)[3];
 return{ch:{p:[lerp(a[0],96,ec),.25,lerp(a[2],16,ec)],yaw:angL(cy,-P_,ec)},tug:{p:[lerp(q[0],96-TUGD,e),.25,lerp(q[2],16,e)],yaw:angL(q[3],-P_,e),steer:u>0&&u<1?clamp(angL(0,ah-q[3],1)*3,-2.4,2.4):0}}}
/* UK unloading forklift. Everything about the lorry end comes from the parked lorry's own pose (start of RDU): the pallet slot just inside
   its rear doors, the pose that puts the forks under that slot, and a straight run-up behind it. */
const UKP={pick:[98.3,.91,16],start:[104.5,16]},PUA=P2([[104.5,16],[100.95,16]]),PUR=P2([[100.95,16],[102.5,16],[104.3,16.6],[105.4,17.8],[105.5,18.8]]),trap=(x,a)=>x<a?x*x/(2*a*(1-a)):x>1-a?1-(1-x)*(1-x)/(2*a*(1-a)):(x-a/2)/(1-a);
let UKL_=null;function ukLoad(){if(UKL_)return UKL_;const q=pathPose(RDU,0,3.5),M=trs(q[0],.3,q[2],q[3],1),LY=q[3],d=[Math.sin(LY),Math.cos(LY)],slot=xp(M,[0,1.25,-3.4]),
 at=k=>[slot[0]-d[0]*k,slot[2]-d[1]*k],load=at(2.65),app=at(5.65),pre=at(8.15);
 const path=P2([[105.5,18.8],[105.6,14],[105.9,7],[106.6,2.4],[108,-.9],[110.6,-2],pre,app]);return UKL_={LY,slot,load,app,path,y0:pathPose(path,0,2.5)[3]}}
const trkCycle=side=>side==='br'?STATE.idx===2&&STATE.t>=16&&STATE.t<20.5:STATE.idx===4&&STATE.t>=10&&STATE.t<14.5;
/* poses of every tracked object for the current stage time (pure function of the clock, so pause and scrub work) */
let TSC=null,TSK='';
function trkScene(){const i=STATE.idx,t=STATE.t,key=i+'|'+t+'|'+T;if(key===TSK)return TSC;TSK=key;const S={},hide={vis:false,p:[0,-50,0],k:0};
 /* harvest worker (farm, stage 2) */
 /* the farm cart: waits loaded at the collection point, pushed to the conveyor (9.2-12.8), pulled back empty (17.1-21.3). The farmer's walks
    are timed so every walk and push runs at about the same pace */
 const cU=i!==1?0:t<9.2?0:t<12.8?trap(u01(t,9.2,12.8),.15):t<17.1?1:1-trap(u01(t,17.1,21.3),.12),cq=pathPose(CART_R,cU,2.5),cY=cq[3],cf=[Math.sin(cY),Math.cos(cY)];
 S.cart={p:[cq[0],0,cq[2]],yaw:cY,roll:cU*CART_R.len/.35};const onCart=j=>[cq[0]+cf[0]*CART_SLOT[j],CART_DECK,cq[2]+cf[1]*CART_SLOT[j]],reach=FARMER&&FARMER.charOn&&FARMER.cHandsL?Math.max(.3,(FARMER.cHandsL[0][2]+FARMER.cHandsL[1][2])/2*1.35):.87,behind=[cq[0]-cf[0]*(2.02+reach),0,cq[2]-cf[1]*(2.02+reach)];
 /* the picker: picks the melon (0-4), lifts the crate and walks it out to the cart (4-8), pushes the cart to the conveyor, unloads
    the three crates onto the belt as their slots come round, and pulls the empty cart back */
 let hw={k:0,vis:i===1,p:[-152,0,10],yaw:-Math.PI/2,walk:0,bend:0,carry:0,reach:0};
 if(i===1){/* walking: a short speed-up, a steady pace, a short slow-down (about half a second each), never a sprint mid-walk */
 const wk=(a,b)=>trap(u01(t,a,b),clamp(.5/(b-a),.06,.35)),W=(pa,a,b)=>{const u=wk(a,b),q=pathPose(pa,u,1);hw.p=[q[0],0,q[2]];hw.yaw=q[3];hw.walk=1;hw.phase=u*pa.len/.95*Math.PI};
  if(t<1.5){hw.p=mixv([-152,0,10],[-155,0,12.5],io(t/1.5));hw.walk=1;hw.phase=io(t/1.5)*3.9/.95*Math.PI}else if(t<2.3){hw.p=[-155,0,12.5];hw.bend=ss(1.5,1.8,t)*(1-ss(2,2.3,t));hw.reach=1}
  else if(t<3.4){hw.p=mixv([-155,0,12.5],[-154.6,0,12.3],io((t-2.3)/1.1));hw.yaw=0;hw.walk=1}else if(t<4){hw.p=[-154.6,0,12.3];hw.yaw=0;hw.bend=.6}
  else if(t<4.6){hw.p=[-154.6,0,12.3];hw.yaw=0;hw.bend=.8*(1-ss(4.3,4.6,t));hw.carry=ss(4.2,4.6,t)}
  else if(t<7.4){W(PHC,4.6,7.4);hw.arm='carry';hw.yaw=dang(0,hw.yaw)*ss(4.6,5.1,t);hw.yaw+=dang(hw.yaw,0)*ss(6.95,7.4,t);hw.carry=1}else if(t<8){hw.p=[-145.65,0,18.4];hw.yaw=0;hw.arm=t<7.75?'carry':null;hw.carry=1-ss(7.7,8,t);hw.bend=.35*Math.sin(Math.PI*u01(t,7.4,8))}
  else if(t<9.2){W(PHH,8,9.2);hw.yaw=hw.yaw+dang(hw.yaw,Math.PI/2)*ss(8.8,9.2,t)}else if(t<12.8){hw.p=behind;hw.yaw=cY;hw.walk=1;hw.carry=1;hw.arm='push';hw.phase=cU*CART_R.len/.95*Math.PI}else if(t<13.7)W(PHU,12.8,13.7)
  else if(t<16.2){hw.p=UNLOAD;const j=UNLOADS.findIndex(e=>t<e+.05),e=UNLOADS[Math.max(0,j)],u=u01(t,e-.75,e);hw.yaw=lerp(-Math.PI/2,Math.PI/2,ss(.36,.56,u));hw.bend=u<.45?.45*Math.sin(Math.PI*u/.45):0;hw.carry=u>.2&&u<.95?1:0;hw.arm=u>.3&&u<.92?'carry':null;hw.reach=0}
  else if(t<17.1){const uu=wk(16.2,17.1),q=pathPose(PHU,1-uu,1);hw.p=[q[0],0,q[2]];hw.yaw=q[3]+Math.PI;hw.walk=1;hw.phase=uu*PHU.len/.95*Math.PI}else{hw.p=behind;hw.yaw=cY+Math.PI;hw.walk=t<21.3?1:0;hw.carry=1;hw.arm='push';hw.phase=(1-cU)*CART_R.len/.95*Math.PI}}S.hw=hw;
 /* a crate held by the farmer hangs from his two hands (grip on the end boards, just under the rim), kept clear of his body.
    The hands are read from the drawn character each frame; before the first frame, a fixed point in front of him is used. */
 const hf=[Math.sin(hw.yaw),Math.cos(hw.yaw)],H=FARMER&&FARMER.hands?FARMER.hands():null,hand=H?[(H[0][0]+H[1][0])/2,(H[0][1]+H[1][1])/2,(H[0][2]+H[1][2])/2]:[hw.p[0]+hf[0]*.75,1.75,hw.p[2]+hf[1]*.75],
  dm=(hand[0]-hw.p[0])*hf[0]+(hand[2]-hw.p[2])*hf[1],off=Math.max(0,.92-dm),hd=[hand[0]+hf[0]*off,Math.max(.2,hand[1]-.52),hand[2]+hf[1]*off],B0=[-128.5,BELT.y,BELT.z0],BL=[-126.6,2,30.5];
 /* a crate unloaded from the cart: lifted off its slot, carried to the belt, rides its belt slot, then lifted into the lorry */
 const viaBelt=(o,j,e)=>{const c=onCart(j),tE=e+(BELT.L-.4)/BELT.v;if(t<e-.75){o.p=c;o.yaw=cY}else if(t<e-.4){const u=io(u01(t,e-.75,e-.4));o.p=hop(c,hd,u,.25);o.yaw=cY+dang(cY,hw.yaw)*u}else if(t<e){const u=io(u01(t,e-.4,e));o.p=hop(hd,B0,u,.25);o.yaw=hw.yaw+dang(hw.yaw,0)*u}
  else if(t<tE){o.p=[B0[0],B0[1],BELT.z0+BELT.v*(t-e)];o.yaw=0}else if(t<tE+.6){const u=(t-tE)/.6;o.p=hop([B0[0],B0[1],BELT.z0+BELT.L-.4],BL,u,1.5);o.s=1-u*u;o.yaw=0}else o.vis=false};
 /* forklifts: export quay, warehouse */
 /* export quay forklift: drives up to the lorry, lifts the whole cargo load, reverses out, carries it to the platform under the crane, backs away */
 /* export port, in order: the lorry stops (6.5), its rear doors open (6.6-7.5), the forklift drives up and slides its forks under the
    pallet (7.5-9.3), lifts and reverses out (9.3-10.6), carries the load to the container waiting by the crane with its doors open,
    sets the pallet inside (13.4-14.1), backs away (14.1-16); the container doors close (15.2-16); the crane lifts the container onto
    the vessel (16-20.5) and the vessel leaves (20.6). Each object has one owner at a time: lorry, forks, container, crane, vessel. */
 const CQ=[-76.5,.25,-10],cs=i===2?t:i>2?1e9:-1,LY=Math.atan2(LORP.m[8],LORP.m[10]),inLorry=xp(LORP.m,[0,1.25,-3.2]),liftPh=i===2&&t>=16?(t-16)/4.5:0;
 let fq,lift=.38;const fl=(pa,u,yaw)=>{const p=pathPose(pa,u,2.5);return{p:[p[0],.27,p[2]],yaw:yaw==null?p[3]:yaw}};
 if(cs<8.7)fq=fl(PQ1,cs<7.5?0:io(u01(cs,7.5,8.7)));else if(cs<9.7){fq=fl(PQ1,1);fq.p[2]=lerp(PQ1.pts[PQ1.pts.length-1][2],11.85,io(u01(cs,8.7,9.3)))}
 else if(cs<10.6){const u=io(u01(cs,9.7,10.6)),q=pathPose(PQR,u,2.5);fq={p:[q[0],.27,q[2]],yaw:q[3]+Math.PI}}else if(cs<13.4){fq=fl(PQ3,io(u01(cs,10.6,13.4)));fq.yaw+=dang(fq.yaw,Math.PI)*ss(12.8,13.4,cs)}
 else if(cs<14.1)fq=fl(PQ4,io(u01(cs,13.4,13.85)));else if(cs<16){const u=io(u01(cs,14.1,16)),q=pathPose(PQ5,u,2.5);fq={p:[q[0],.27,q[2]],yaw:q[3]+Math.PI}}else fq=fl(PQ5,1,PQ5Y);
 /* fork height: low while driving, up to the lorry floor before entering, a little higher to lift clear, down to the container floor */
 if(cs<7.5)lift=.38;else if(cs<8.7)lift=lerp(.38,inLorry[1]-.06,ss(7.5,8.4,cs));else if(cs<9.3)lift=inLorry[1]-.06;else if(cs<10.6)lift=inLorry[1]-.06+.16*ss(9.3,9.7,cs);
 else if(cs<13.4)lift=lerp(inLorry[1]+.1,.62,ss(10.6,11.2,cs))+(.44-.62)*ss(12.6,13.3,cs);else if(cs<14.1)lift=lerp(.44,.37,ss(13.85,14.1,cs));else lift=.31;
 fq.k=1;fq.vis=true;fq.lift=lift;S.fq=fq;
 /* the pallet load: in the lorry, then on the forks once they lift (9.3), then in the container (14.1), which the crane and vessel carry */
 const IN_CONT=mul(tr(0,.12,2.4),rY(Math.PI)),cm=co=>mul(trs(co.p[0],co.p[1],co.p[2],co.yaw||0,1),IN_CONT);
 let cu={k:1,vis:i===2,p:inLorry,yaw:LY,s:1};
 if(i===2&&cs>=9.3&&cs<14.1){const f=forks(fq,lift);cu.p=[f[0],lift,f[2]];cu.yaw=fq.yaw}
 if(i===2&&cs>=14.1){const C=liftPh<.15?{p:CQ,yaw:0}:liftPh<.72?{p:[RIG.br.x,RIG.br.y,-10],yaw:0}:{m:mul(SHBR.m,tr(0,8.1,2))},M=C.m?mul(C.m,IN_CONT):cm(C);cu.p=[M[12],M[13],M[14]];cu.yaw=Math.atan2(M[8],M[10])}
 S.cargo=cu;
 let fw;if(i<6)fw=fkPose(PWA,0);else if(i===6){if(t<11.5)fw=fkPose(PWA,io(u01(t,7.5,11.5)));else if(t<14){const u=io(u01(t,12,13.6));fw=fkPose(PWT,u,lerp(pathPose(PWA,1,2.5)[3],pathPose(PWB,0,2.5)[3],u))}else fw=fkPose(PWB,(t-14)/8.5)}
 else if(i===7){if(t<2.5)fw=fkPose(PWB,(6+t)/8.5);else if(t<12){const u=io(u01(t,3,9));fw=fkPose(PWQ,u,lerp(Math.PI/2,(pathPose(PWC,0,2.5)[3]+TAU)%TAU,u))}else fw=fkPose(PWC,io(u01(t,12,16)))}else fw=fkPose(PWC,1);fw.k=3;fw.vis=true;S.fw=fw;
 const BAY=forks(fkPose(PWA,1),.3),QCP=forks(fkPose(PWB,1),.27),DSP=forks(fkPose(PWC,1),.3);
 /* crate */
 let cr={k:0,vis:true,p:CR0,s:1};
 /* on the conveyor the crate takes belt slot 0 (see beltSlot in movers.js), so it keeps the same spacing, height and speed as the other crates */
 if(i===1){if(t<4);else if(t<4.6){cr.p=mixv(CR0,hd,io((t-4)/.6));cr.yaw=hw.yaw*ss(4,4.6,t)}else if(t<7.4){cr.p=hd;cr.yaw=hw.yaw}else if(t<8){const u=io(u01(t,7.4,8));cr.p=hop(hd,onCart(2),u,.25);cr.yaw=hw.yaw+dang(hw.yaw,cY)*u}else viaBelt(cr,2,UNLOADS[2])}
 else if(i===2){const c=Math.cos(cu.yaw),n=Math.sin(cu.yaw),ox=.58*cu.s,oz=.78*cu.s;cr={k:1,vis:cu.vis,s:cu.s,yaw:cu.yaw+Math.PI/2,p:[cu.p[0]+c*ox+n*oz,cu.p[1]+.2*cu.s,cu.p[2]-n*ox+c*oz]}}
 else if(i===7){cr.k=3;if(t<2.5)cr.vis=false;else if(t<4.3){const u=(t-2.5)/1.8;cr.p=hop([QCP[0],2.3,QCP[2]],TBL,io(u),3);cr.s=Math.min(1,u*5)}else if(t<11)cr.p=TBL;else if(t<12)cr.p=hop(TBL,forks(fw),io(t-11),1.5);else cr.p=forks(fw)}
 else if(i===8||i===9){cr.k=3;cr.p=DSP}
 else if(i===10){if(t<2.4){cr.k=3;cr.p=DSP}else if(t<3.4){const u=t-2.4;cr.k=3;cr.p=hop(DSP,[151.5,2,29.5],u,2.5);cr.s=1-u*u*u}else if(t<22){cr.vis=false;cr.k=t<12?3:4}
  else{cr.k=4;if(t<23){const u=t-22;cr.p=hop([200,2,19.8],[204,.4,6],u,3);cr.s=Math.min(1,u*4)}else if(t<24)cr.p=hop([204,.4,6],[213,.4,7.5],t-23,2.5);else if(t<24.8)cr.p=hop([213,.4,7.5],[215.4,.3,8],(t-24)/.8,1.5);else cr.p=[215.4,.3,8]}}
 else if(i>1)cr.vis=false;S.crate=cr;
 /* the cart's other two crates, already loaded at the collection point */
 S.cc=[0,1].map(j=>{const o={k:0,vis:i<=1,p:onCart(j),yaw:cY,s:1};if(i===1)viaBelt(o,j,UNLOADS[j]);return o});
 /* the crate is full of melons; the followed one takes the free corner slot, at the size of its neighbours */
 const IS=1,cy=Math.cos(cr.yaw||0),sy=Math.sin(cr.yaw||0),[tx,tz]=CRATE_TRK,ty=CRATE_Y+MELR*.92,inCr=[cr.p[0]+(cy*tx+sy*tz)*cr.s,cr.p[1]+ty*cr.s,cr.p[2]+(-sy*tx+cy*tz)*cr.s],sz=u=>lerp(1,IS,u);
 /* the melon */
 let me={k:cr.k,vis:cr.vis,p:inCr,s:cr.s*IS};
 if(i<1)me={k:0,vis:true,p:M0,s:1};
 else if(i===1){if(t<1.5)me.p=M0;else if(t<2.3)me.p=mixv(M0,hand,io((t-1.5)/.8));else if(t<3.4)me.p=hand;else if(t<4)me.p=hop(hand,inCr,(t-3.4)/.6,.8);if(t<4)me.s=sz(u01(t,3.4,4))}
 else if(i===7){if(t<4.5)me.vis=false;else if(t<5.5)me.p=mixv(inCr,HOV,io(t-4.5));else if(t<10){me.p=[HOV[0],HOV[1]+Math.sin(T*2)*.12,HOV[2]];me.spin=T*1.6}else if(t<11)me.p=mixv(HOV,inCr,io(t-10));if(t<11)me.s=sz(1-u01(t,4.5,5.5)+u01(t,10,11))}
 else if(i===10&&t>=25)me={k:4,vis:true,p:t<26.2?hop(inCr,SHELF,io((t-25)/1.2),1.6):SHELF,s:sz(1-u01(t,25,26.2))};S.melon=me;
 /* container, its trailer at the UK quay */
 let co=hide;const tp=tugPair(i===4?t:1e9),ch={k:2,vis:i===4&&t<22.6,p:tp.ch.p,yaw:tp.ch.yaw};
 /* the tractor and its driver: the driver walks over, climbs into the cab before the container is set down, and stays at the wheel */
 const tg=S.tug={k:2,vis:i===4||i===5,...tp.tug},door=[76.5+1.7,-14+TUGD+.9],W0=[86,-2];
 if(i===4&&t<8.6){const w=io(u01(t,3.5,8)),d=Math.hypot(door[0]-W0[0],door[1]-W0[1]),wu=u01(t,3.5,8);S.drv={vis:true,sit:0,p:[lerp(W0[0],door[0],w),0,lerp(W0[1],door[1],w)],yaw:t<8?Math.atan2(door[0]-W0[0],door[1]-W0[1]):-Math.PI/2,phase:w*d*2.2,amt:Math.min(1,wu*6,(1-wu)*6)}}
 else S.drv={vis:tg.vis,sit:1};
 /* container CONT-001 is already in its place on the vessel; the cargo load is lowered into it */
 const onShip=()=>{const M=mul(SHBR.m,tr(0,8.1,2));return{k:1,vis:SHBR.vis,m:M,p:[M[12],M[13],M[14]]}};
 if(i<2)co=onShip();else if(i===2){co=liftPh<.15?{k:1,vis:true,p:CQ,yaw:0}:liftPh<.72?{k:1,vis:true,p:[RIG.br.x,RIG.br.y,-10],yaw:0}:onShip()}
 else if(i===4){if(t<10)co={k:2,vis:t>=0,m:mul(SHUK.m,tr(0,8.1,2)),p:[SHUK.p[0],6.6,SHUK.p[2]]};else if(t<13.15)co={k:2,vis:true,p:[RIG.uk.x,RIG.uk.y,-14],yaw:Math.PI};/* same heading as on the vessel: doors aft */
  else co={k:2,vis:t<22.6,p:[ch.p[0],.75,ch.p[2]],yaw:ch.yaw+Math.PI}}/* sits on the trailer deck, doors at the trailer's rear */
 S.cont=co;
 /* door angles: lorry rear doors open once it has stopped; the container's doors are open while it waits, then close */
 /* UK unloading: forward into the container, lift, reverse out swinging round, drive round to the lorry's rear, straight in, set down, reverse out */
 {const U=ukLoad(),ut=i===5?t:i>5?1e9:-1,sy=U.slot[1],AT=(p,y)=>({p:[p[0],.27,p[1]],yaw:y});let f,lf;
  if(ut<.4)f=fl(PUA,0);else if(ut<2.1)f=fl(PUA,trap(u01(ut,.4,1.6),.35));else if(ut<3.4){const u=trap(u01(ut,2.1,3.4),.35),q=pathPose(PUR,u,2.5);/* settles on the heading it drives off with */f={p:[q[0],.27,q[2]],yaw:angL(angL(-Math.PI/2,q[3]+Math.PI,ss(0,.35,u)),U.y0,ss(.6,1,u))}}
  else if(ut<8.4)f=fl(U.path,trap(u01(ut,3.4,8.4),.2));else if(ut<9.5){const u=trap(u01(ut,8.4,9.1),.35);f=AT([lerp(U.app[0],U.load[0],u),lerp(U.app[1],U.load[1],u)],U.LY)}
  else{const u=trap(u01(ut,9.5,10.3),.35);f=AT([lerp(U.load[0],U.app[0],u),lerp(U.load[1],U.app[1],u)],U.LY)}
  lf=ut<1.6?lerp(.4,.86,ss(.4,1.3,ut)):ut<1.8?lerp(.86,.91,ss(1.6,1.8,ut)):ut<3.4?lerp(.91,1.05,ss(1.8,2.1,ut)):ut<7.6?lerp(1.05,.6,ss(3.4,4,ut)):ut<9.1?lerp(.6,sy+.07,ss(7.6,8.4,ut)):ut<9.5?lerp(sy+.07,sy-.1,ss(9.1,9.5,ut)):lerp(sy-.1,.4,ss(10.3,10.9,ut));
  f.k=2;f.vis=true;f.lift=lf;S.fu=f;S.doorsU=ss(7,7.8,ut)*(1-ss(10.5,11.1,ut));
  /* its pallet: in the container's doorway until the forks lift it (1.8), on the forks, then in the lorry (9.3), which carries it away */
  S.pu=ut<1.8?{k:2,vis:i===5||(i===4&&t>=22.6),p:UKP.pick,yaw:Math.PI/2}:ut<9.3?(()=>{const w=forks(f,lf);return{k:2,vis:true,p:w,yaw:f.yaw}})():{k:2,vis:i===5&&LORU.vis,m:mul(LORU.m,tr(0,1.25,-3.4)),p:xp(LORU.m,[0,1.25,-3.4])}}
 S.doors={lorry:i<2?0:i>2?1:ss(6.6,7.5,cs),cont:i===2?1-ss(15.2,16,cs):i<2?1:0};S.ch=ch;S.open=i>4||(i===4&&t>=22.6);
 /* pallet */
 let pa=hide;
 if(i===6&&t>=6.5){pa={k:3,vis:true,s:1};if(t<7.5){const u=t-6.5;pa.p=hop([153.6,2,29.5],forks(fw),u,1.5);pa.s=Math.min(1,u*4)}else if(t<11.5)pa.p=forks(fw);else if(t<14)pa.p=BAY;else if(t<14.6)pa.p=hop(BAY,forks(fw),io((t-14)/.6),2);else pa.p=forks(fw)}
 else if(i===7)pa={k:3,vis:true,s:1,p:t<2.5?forks(fw):QCP};else if(i>7)pa={k:3,vis:true,s:1,p:QCP};S.pallet=pa;
 return TSC=S}
/* the one list that says who carries the melon when: [stage, from stage time, carrier] */
const STEPS=[[0,0,'melon'],[1,4,'crate'],[1,19.3,'lorryF'],[2,0,'lorryP'],[2,9.3,'crate'],[2,14.1,'cont'],[2,19.24,'ship'],[3,0,'ship'],[4,0,'shipUK'],[4,10,'cont'],[5,0,'open'],[5,1.8,'fork'],[5,9.3,'lorryU'],
 [6,0,'lorryW'],[6,6.5,'pallet'],[7,2.5,'crate'],[7,4.5,'melon'],[7,11,'crate'],[10,3.4,'lorryW'],[10,18.5,'lorryS'],[10,22,'crate'],[10,25,'melon']];
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
 lorryU:{pid:()=>LORU.pid,pos:()=>mvp(2,LORU),txt:c=>'on lorry '+c.lorryUK},lorryW:{pid:()=>LORW.pid,pos:()=>mvp(3,LORW),txt:c=>STATE.idx>9?(c.lorryDel?'on lorry '+c.lorryDel:'on the delivery lorry'):'on lorry '+c.lorryUK},
 lorryS:{pid:()=>LORS.pid,pos:()=>mvp(4,LORS),txt:c=>c.lorryDel?'on lorry '+c.lorryDel:'on the delivery lorry'}};
function trkStep(){const i=STATE.idx,t=STATE.t;let s=STEPS[0];for(const q of STEPS)if(q[0]<i||(q[0]===i&&q[1]<=t))s=q;return s}
/* ids for the wording, from the journey records; '?' when a record does not have it */
function trkIds(){const c=context(),b=c.one('batch'),co=c.one('container'),sh=c.one('shipment'),tk=recs('tracking').find(x=>!sh||x.shipmentId===sh.id)||{},v=x=>x==null||x===''?'(not recorded)':String(x).replace(/ \(fictional\)/,'');
 return{batch:v(b&&b.id),pallet:v(tk.palletId||(c.one('pallet')||{}).id),cont:v(co&&co.id),vessel:v(sh&&sh.vessel),lorryBR:v(b&&b.lorry),lorryUK:v(co&&co.truck),lorryDel:(c.one('delivery')||{}).lorry||null,level:tk.level||'batch',c}}
/* camera target that follows the tracked object while it is in site k, and a fixed spot otherwise */
/* it reads a smoothed position (TRK.sm, eased in trackTick), so a handoff between carriers glides instead of nudging the view */
const TR=(k,x,z)=>onSite(k,()=>TRK.sm&&TRK.sm[0]===k?geoOf(k,TRK.sm[1],TRK.sm[2]):geoOf(k,x,z));
/* tracked objects are movers with their own ids, so they can be highlighted and picked like anything else */
function buildTracking(){const note='Stands for the whole batch. Its own movements are a simulated illustration: the records trace batches, not single melons.';
 const dyn=(o,q,yaw)=>{o.k=q.k;o.vis=q.vis;const s=q.s==null?1:q.s;if(q.m){o.m=q.m;o.p=q.p}else{o.m=mul(trs(q.p[0],q.p[1],q.p[2],q.yaw||yaw||0,1),sc(s,s,s));o.p=q.p}ENT[o.pid]&&(ENT[o.pid].site=q.k)};
 TID.melon=EM(0,'Representative melon',1,note);mover(0,TID.melon,()=>ball(P.melY,0,0,0,MELR,.92,10,5),o=>{const q=trkScene().melon;dyn(o,q,q.spin||0)});
 /* the melon is life size, so a small glowing marker hovers over it; it grows with camera distance to stay visible */
 mover(0,TID.melon,()=>{MAT=2;lathe([1,.8,.25],[[0,0],[.09,.12],[0,.24]],0,0,0,6);MAT=0},o=>{const q=trkScene().melon,s=clamp(X.d/30,1,4),p=q.m?[q.m[12],q.m[13],q.m[14]]:q.p;o.k=q.k;o.vis=!!q.vis&&STATE.started;
  o.m=mul(tr(p[0],p[1]+MELR*(q.s||1)+(.1+.14*s)+.05*s*Math.sin(T*3),p[2]),mul(rY(T*1.6),sc(s,s,s)));o.p=p});
 TID.crate=EM(0,'Crate carrying the melon',1,'The crate the representative melon travels in. Simulated illustration.');mover(0,TID.crate,()=>{crate(0,0,0,0);crateMelons(0,0,0,CRATE_TRK)},o=>dyn(o,trkScene().crate));
 /* the picker: walks to the plant, bends to cut the melon, stands with it, sets it in the crate, then carries the crate to the belt */
 FARMER=workerRig(0,EM(0,'Harvest worker',1,'Picks the representative melon, takes the crates to the conveyor on a farm cart and unloads them.'),P.teal,P.straw,'harvest',()=>{const q=trkScene().hw;
  return{vis:q.vis,p:[q.p[0],0,q.p[2]],yaw:q.yaw,s:1.35,phase:q.phase||0,amt:q.walk,bend:q.bend,reachR:q.reach,carry:q.carry,armPose:q.arm}});
 /* the farm cart: flat bed, rails, push handle at the back; two axles that turn with the distance rolled */
 const CRT=EM(0,'Farm cart',1,'Carries harvested crates from the greenhouse to the conveyor.');
 const cartO=mover(0,CRT,()=>{bb(P.wood,0,.55,0,1.7,.12,3.5);for(const x of[-.82,.82])bb(P.steel,x,.42,0,.08,.13,3.5);for(const z of[-1.7,1.7])bb(P.steel,0,.67,z,1.7,.18,.06);/* handle bar at the pushing farmer's hand height */for(const x of[-.8,.8]){bb(P.steel,x,.67,-1.78,.06,.55,.06);Tm(mul(tr(x,1.5,-1.93),rX(.28)),()=>box(P.steel,0,0,0,.06,.72,.06))}bb(P.dark,0,1.82,-2.02,1.7,.08,.08)},o=>{const q=trkScene().cart;setM(o,q.p[0],0,q.p[2],q.yaw,1)});
 for(const z of[-1.25,1.25])mover(0,CRT,()=>{for(const x of[-.92,.92])wheelX(x,0,0,.35,.18);bb(P.steel,0,-.04,0,1.7,.08,.08)},o=>{const q=trkScene().cart;o.m=mul(trs(q.p[0],0,q.p[2],q.yaw,1),mul(tr(0,.35,z),rX(q.roll)));o.p=q.p});
 for(const j of[0,1])mover(0,CRT,()=>crate(0,0,0,1),o=>{const q=trkScene().cc[j];o.vis=q.vis;const s=q.s==null?1:q.s;o.m=mul(trs(q.p[0],q.p[1],q.p[2],q.yaw||0,1),sc(s,s,s));o.p=q.p});
 const QF=EM(1,'Quay forklift',2,'Takes the pallet from the lorry to the shipping container.'),qf=mover(1,QF,()=>forklift(true),o=>{const q=trkScene().fq;setM(o,q.p[0],.25,q.p[2],q.yaw,1.15)});forkliftOperator(1,qf,'port');
 /* its fork carriage rides up and down the mast; the tines' top is the height the pallet sits at */
 mover(1,QF,()=>mt(3,()=>{bb(P.dark,0,0,1.16,1.3,.9,.06);for(let k=0;k<5;k++)bb(P.dark,-.6+k*.3,.9,1.16,.04,1,.04);for(const x of[-.5,.5]){bb(P.steel,x,-.07,1.22,.14,.75,.07);bb(P.steel,x,-.07,2.05,.14,.07,1.7)}}),o=>{const q=trkScene().fq;o.m=trs(q.p[0],q.lift,q.p[2],q.yaw,1.15);o.p=q.p});
 forkliftOperator(3,mover(3,EM(3,'Intake forklift',6,'Moves the tracked pallet through the warehouse and to quality control.'),forklift,o=>{const q=trkScene().fw;setM(o,q.p[0],.27,q.p[2],q.yaw,1.15)}),'warehouse');
 /* three crates on a base; the fourth place is the followed crate, which is its own object so it can carry the highlight */
 /* the pallet load: a pallet with four crates turned across it (the followed crate is its own object in the front right place), sized to
    fit inside the lorry's box and the container */
 MOV_TAG=MOV.length;mover(1,TID.cargo=EM(1,'Cargo load',2,'The load from the lorry on one pallet: lifted out by the forklift and set inside the shipping container.'),()=>{bb(P.wood,0,0,0,2.3,.2,3.1);for(const z of[-1.2,0,1.2])bb(shade(P.wood,.8),0,-.02,z,2.3,.06,.3);for(const[x,z]of[[-.58,-.78],[.58,-.78],[-.58,.78]])Tp(x,.2,z,Math.PI/2,1,()=>crate(0,0,0,1))},o=>dyn(o,trkScene().cargo));MOV[MOV_TAG].leg=0;
 /* the lorry's rear doors, hinged at the back corners of its box */
 MOV_TAG=MOV.length;for(const sd of[-1,1])mover(1,EM(1,'Lorry doors',2,'Open once the lorry has stopped.'),()=>{bb(LRED,-sd*.64,0,0,1.28,2.95,.06);for(const y of[.4,1.45,2.5])bb(P.steel,-sd*.64,y,-.05,1.2,.06,.04);bb(P.steel,-sd*1.18,.2,-.06,.06,2.6,.05)},o=>{const a=trkScene().doors.lorry*1.85;o.vis=LORP.vis;o.m=mul(LORP.m,mul(tr(sd*1.3,1.17,-4.83),rY(-sd*a)));o.p=LORP.p});MOV[MOV_TAG].leg=MOV[MOV_TAG+1].leg=0;
 /* the shipping container: an open-ended shell (so the load is visible going in) with two doors at its +z end that swing round the hinges */
 TID.cont=EM(1,'Shipping container',2,'The container that carries the batch from Brazil to the UK.');const CW=2.44,CH=2.6,CL=8;
 const contO=mover(1,TID.cont,()=>{mt(5,()=>{for(const x of[-1,1])bb(P.teal,x*(CW/2-.03),.12,0,.06,CH-.2,CL);bb(P.teal,0,.12,-CL/2+.03,CW,CH-.2,.06)});bb(P.dark,0,0,0,CW,.12,CL);bb(P.teal,0,CH-.1,0,CW,.1,CL);
  mt(3,()=>{for(const x of[-1,1])for(const z of[-1,1])bb(shade(P.teal,.7),x*(CW/2-.08),0,z*(CL/2-.08),.16,CH,.16);for(const x of[-1,1])bb(shade(P.teal,.7),x*(CW/2-.06),CH-.16,0,.12,.16,CL)})},o=>dyn(o,trkScene().cont));
 MOV_TAG=MOV.length;for(const sd of[-1,1])mover(1,TID.cont,()=>{mt(5,()=>bb(P.teal,-sd*CW/4,0,0,CW/2-.02,CH-.24,.06));mt(3,()=>{for(const x of[.25,.75])bb(P.steel,-sd*CW/2*x,.1,.05,.05,CH-.44,.05);bb(P.dark,-sd*(CW/2-.12),CH*.45,.07,.08,.2,.04)})},
  o=>{const a=trkScene().doors.cont*2.55;o.vis=contO.vis;o.k=contO.k;/* the doors travel with the container from site to site */o.m=mul(contO.m,mul(tr(sd*CW/2,.12,CL/2),rY(sd*a)));o.p=contO.p});contO.leg=MOV[MOV_TAG].leg=MOV[MOV_TAG+1].leg=1;const CDOOR=[MOV[MOV_TAG],MOV[MOV_TAG+1]];
 /* what rides on the vessel while it travels (drawn with it, render.js): the container and its closed doors */
 LEGCARGO=()=>[[contO,tr(0,8.1,2)],...CDOOR.map((o,j)=>[o,mul(tr(0,8.1,2),tr((j?1:-1)*CW/2,.12,CL/2))])];
 /* the travelling vehicles' site copies, hidden while their leg runs (globe.js) */
 LORF.leg=LORP.leg=0;SHBR.leg=SHUK.leg=1;LORU.leg=2;LORW.leg=[2,3];LORS.leg=3;
 /* what rides inside a closed lorry box or container while it travels: the tracked crate, the melon and its marker (farm lorry, vessel,
    delivery lorry) and the cargo load (port lorry, then the container). Their own placement comes from the vehicle's site path, but the
    vehicle is drawn on its leg, so they go with the leg: not drawn at a spot the vehicle has left, and the label follows the vehicle */
 for(const m of MOV){if(m.pid===TID.crate||m.pid===TID.melon)m.leg=[0,1,3];else if(m.pid===TID.cargo)m.leg=[0,1]}
 mover(2,0,()=>{bb(P.dark,0,0,0,2.4,.5,8.4);for(const z of[-2.6,2.6])for(const x of[-1.1,1.1])wheelX(x,.1,z,.5,.4);bb(P.steel,0,.12,4.2,.5,.22,.3)},o=>{const q=trkScene().ch;o.vis=q.vis;setM(o,q.p[0],q.p[1],q.p[2],q.yaw,1)});
 /* terminal tractor: open-sided one-man cab on the right, engine on the left, tow bar back to the trailer's hitch eye */
 TID.tug=EM(2,'Terminal tractor',4,'Tows the container on its trailer from the quay crane to the unloading area.');
 const TUG=mover(2,TID.tug,()=>{bb(P.dark,0,.3,0,1.9,.4,4.6);bb(P.steel,0,.7,-1.2,1.9,.12,2.1);bb(P.steel,0,.34,-2.95,.18,.18,1.3);bb(P.dark,0,.24,-3.5,.34,.34,.3);
  mt(5,()=>{bb(P.yel,.4,.7,1.15,1.3,.65,2);bb(P.yel,-.55,.7,1.35,.8,.95,1.6);bb(P.yel,.4,2.8,1.15,1.5,.12,2.1)});bb(P.dark,.4,1.35,.55,.9,.2,.6);bb(P.dark,.4,1.55,.3,.9,.6,.12);
  for(const x of[-.3,1.1])for(const z of[.2,2.1])bb(P.dark,x,1.35,z,.08,1.45,.08);mt(4,()=>bb(P.glass,.4,1.45,2.12,1.3,1.2,.05));
  bb(P.steel,0,.25,2.35,1.95,.35,.15);MAT=2;for(const x of[-.7,.7])bb(LIT,x,.85,2.31,.3,.16,.04);MAT=0;
  for(const x of[-.95,.95]){wheelX(x,.5,1.5,.5,.4);wheelX(x,.5,-1.3,.5,.5)}},o=>dyn(o,trkScene().tug));
 mover(2,TID.tug,()=>{Tm(rX(Math.PI/2),()=>cyl(P.dark,0,-.03,0,.2,.06,10));bb(P.dark,0,-.03,-.1,.06,.06,.4)},o=>{const q=trkScene().tug;o.vis=q.vis;o.k=2;o.m=mul(TUG.m,mul(tr(.4,1.95,1.5),mul(rX(-.55),rZ(q.steer))));o.p=TUG.p});
 workerRig(2,TID.tug,[.24,.38,.62],null,'port',()=>{const d=trkScene().drv;return d.sit?{vis:d.vis,base:mul(TUG.m,tr(.4,0,0)),seat:[1.6-HIP*WK*1.35,.75,1.35],sit:1,p:[0,0,0]}:{vis:d.vis,p:d.p,yaw:d.yaw,s:1.35,phase:d.phase,amt:d.amt}});
 /* UK forklift's fork carriage and pallet, and the inland lorry's rear doors (hinged at the back corners of its box) */
 mover(2,FKA.pid,()=>mt(3,()=>{bb(P.dark,0,0,1.16,1.3,.9,.06);for(let k=0;k<5;k++)bb(P.dark,-.6+k*.3,.9,1.16,.04,1,.04);for(const x of[-.5,.5]){bb(P.steel,x,-.07,1.22,.14,.75,.07);bb(P.steel,x,-.07,2.05,.14,.07,1.7)}}),o=>{const q=trkScene().fu;o.vis=FKA.vis;o.m=trs(q.p[0],q.lift,q.p[2],q.yaw,1.15);o.p=q.p});
 MOV_TAG=MOV.length;mover(2,FKA.pid,()=>pallet(0,0,0,2,true),o=>dyn(o,trkScene().pu));MOV[MOV_TAG].leg=2;
 MOV_TAG=MOV.length;for(const sd of[-1,1])mover(2,LORU.pid,()=>{bb(LRED,-sd*.64,0,0,1.28,2.95,.06);for(const y of[.4,1.45,2.5])bb(P.steel,-sd*.64,y,-.05,1.2,.06,.04);bb(P.steel,-sd*1.18,.2,-.06,.06,2.6,.05)},o=>{const a=trkScene().doorsU*1.85;o.vis=LORU.vis;o.m=mul(LORU.m,mul(tr(sd*1.3,1.17,-4.83),rY(-sd*a)));o.p=LORU.p});MOV[MOV_TAG].leg=MOV[MOV_TAG+1].leg=2;
 mover(2,OPENC,openContainerModel,o=>{o.vis=trkScene().open;setM(o,96,.25,16,Math.PI/2,1)});
 TID.pallet=EM(3,'Pallet carrying the batch',6,'The pallet the pick list sends to quality control.');mover(3,TID.pallet,()=>pallet(0,0,0,2,false,[.95,.78,.26]),o=>dyn(o,trkScene().pallet))}
/* ---- marker, panel line, summary ---- */
let TEL=null,TSUMX=-1;
function initTrackUI(){TEL=el('div','trk');LAB.appendChild(TEL);$('#tsX').onclick=()=>{TSUMX=STATE.idx;$('#trkSum').classList.remove('show')}}
function trkText(){const s=trkStep(),id=trkIds(),ca=CARRIER[s[2]],al=typeof shipAlloc==='function'?shipAlloc():null,rep=al?al.name+' allocation':id.level==='item'?'Tracked melon':'Representative melon';/* for a whole allocation: no single melon, and ids the manifest lacks are simply left out */
 const w=ca.txt(id),where=al?(s[2]==='melon'?'at the farm':w.replace(/ \(not recorded\)/g,'').replace(/\s+/g,' ')):w;return{rep,where,sim:!!ca.sim,id,al}}
function trackTick(dt){const s=trkStep(),pid=CARRIER[s[2]].pid();if(pid!==TRK.pid){TRK.pid=pid;TRK.pulse=1}TRK.pulse=Math.max(0,TRK.pulse-dt*1.3);TRK.step=s;
 const p=CARRIER[s[2]].pos(),a=1-Math.exp(-dt*4);if(!TRK.sm||TRK.sm[0]!==p[0])TRK.sm=[p[0],p[1],p[3]];else{TRK.sm[1]+=(p[1]-TRK.sm[1])*a;TRK.sm[2]+=(p[3]-TRK.sm[2])*a}}
function updateTrack(){if(!TEL||!TRK.step)return;const tx=trkText(),key=tx.where+DATA.status;
 if(key!==TRK.key){TRK.key=key;TEL.innerHTML=`<i></i><b>${tx.rep}</b><span>${esc(tx.where)}</span>`;TEL.classList.remove('swap');void TEL.offsetWidth;TEL.classList.add('swap')}
 const n=$('#trkNow');if(n&&n.dataset.k!==key){n.dataset.k=key;n.innerHTML=tx.al?`<div class="alh"><b>${esc(tx.al.name)}</b><span>${esc(tx.where)}</span></div><div class="alk"><div><em>${fmtN(tx.al.cartons,0)}</em><small>cartons</small></div><div><em>${fmtP(tx.al.pallets)}</em><small>pallets</small></div><div><em>${tx.al.varieties}</em><small>varieties</small></div></div><small>Intended customer allocation from the manifest, not a confirmed delivery.</small>`:`<b>${tx.rep}</b> of batch ${esc(tx.id.batch)}: now ${esc(tx.where)}.<small>${tx.sim?'This step is a simulated illustration.':'Carrier and ids from the journey records ('+STATUS[DATA.status]+').'} Single melons are not tracked; this one stands for its batch.</small>`}
 /* position: over the object in a visible site, or over the travelling vehicle on the map */
 let q=null;const p=CARRIER[TRK.step[2]].pos();
 if(MARK&&X.d>1500)q=dot(llu(MARK.g[0],MARK.g[1]),X.eyeG)>1.004?proj(X.gvp,llu(MARK.g[0],MARK.g[1])):null;
 else if(PRIM&&PRIM.k===p[0]&&FADE>.6&&X.d<900)q=proj(PRIM.vp,[p[1],p[2],p[3]]);
 const ok=STATE.started&&q&&q[1]>24&&q[1]<GLS.ch-80;TEL.classList.toggle('show',!!ok);if(ok)TEL.style.transform=`translate(${q[0].toFixed(1)}px,${q[1].toFixed(1)}px) translate(-50%,${MARK&&X.d>1500?'95%':'-120%'})`;TEL.classList.toggle('map',!!(MARK&&X.d>1500));
 /* closing summary, once the melon is on the shelf */
 const fin=STATE.idx===10&&STATE.t>=27.5&&TSUMX!==10,su=$('#trkSum');if(STATE.idx!==10)TSUMX=-1;
 if(fin&&!su.classList.contains('show')){const c=tx.id.c,g=(k,f)=>{const r=c.one(k);return r&&r[f]!=null?esc(r[f]):'not recorded'},row=(a,b)=>`<li><b>${a}</b>${b}</li>`;
  $('#tsBody').innerHTML=`<p>${tx.rep} of batch ${esc(tx.id.batch)}, shipment ${g('shipment','id')}.</p><ol>${row('Farm',g('farm','name')+' · harvested '+g('batch','harvestDate'))}${row('Road',  'lorry '+g('batch','lorry')+' to the export port')}${row('Sea','container '+g('container','id')+' on '+g('shipment','vessel')+' · '+g('shipment','departure')+' to '+g('shipment','arrival'))}${row('Customs',g('customs','id')+' · '+g('customs','status')+' '+g('customs','cleared'))}${row('Warehouse',g('allocation','warehouse')+' · pick list '+g('allocation','id'))}${row('Quality control',g('qc','id')+' · '+g('qc','accepted')+' accepted, '+g('qc','rejected')+' rejected')}${row('Delivery',g('delivery','id')+' · '+g('delivery','date')+' · '+g('delivery','status'))}</ol><small>Ids, dates and quantities: ${STATUS[DATA.status]}. The path of this single melon and its crate is a simulated illustration of how the batch moved; individual melons are not tracked.</small>`}
 su.classList.toggle('show',fin)}
