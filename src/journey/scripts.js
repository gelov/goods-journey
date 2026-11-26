'use strict';
/* ================= stage scripts: duration, free-mode home time, camera keys ================= */
/* a shot at a site carries the site (f.k): its heading is written for the site as designed (SITE_ROT0) and turns with the site when a
   manifest rotates it (coastline, route), so every scene is still framed from the same side */
const SIGN_TURN=1,SITE_ROT0=[0,.785,2.356,0,0],onSite=(k,f)=>(f.k=k,f),siteTurn=g=>g&&g.k!=null?(SITES[g.k].rot||0)-SITE_ROT0[g.k]:0;
const G=(lon,lat)=>()=>[lon,lat],GV=k=>()=>VIEWS[k],AT=(k,x,z)=>onSite(k,()=>geoOf(k,x,z)),MV=(k,m)=>onSite(k,()=>{const o=m();return geoOf(k,o.p[0],o.p[2])}),GS=k=>onSite(k,()=>SITES[k].g);
const K=(t,g,ry,rx,d)=>({t,g,ry,rx,d});
/* w: stretches of a stage that run at their own pace (start, end, multiplier). Below 1 slows the clock for work that
   should read clearly: crane loading and unloading, forklifts, lorries pulling away and travelling.
   Shots are keyed so the camera is always going somewhere: it descends toward the destination while the vehicle is
   still on its route, and keeps orbiting once it is inside a site. */
const SCRIPT=[
 {dur:18,home:13,k:[K(0,GV('start'),0,1.45,42000),K(2,GV('approach'),0,1.45,20000),K(4.6,AT(0,-198,8),0,1.45,6500),K(6.6,AT(0,-198,8),0,1.2,2400),K(8.6,AT(0,-198,8),-.75,.62,135),K(13,AT(0,-184,10),-.3,.58,104),K(18,AT(0,-156.2,12.2),.2,.55,46)]},
 {dur:34,home:2,w:[[0,25,.65],[25,32,.85],[23.6,26.6,1.7]],k:[K(0,AT(0,-156.2,12.2),.2,.55,46),K(4,TR(0,-154.6,13.5),.5,.56,34),K(8.6,TR(0,-147,19.5),.35,.6,40),K(13,TR(0,-133,16),.15,.6,44),K(16.6,TR(0,-129,19),.2,.6,50),K(19,AT(0,-128,28),-.25,.55,52),K(21.5,MV(0,()=>LORF),-.6,.5,60),K(25,RT(0),0,1.45,LD(0,5200)),K(32,RT(0),0,1.45,LD(0,1900)),K(34,RT(0),0,1.45,LD(0,950))]},
 {dur:28,home:5,w:[[4,21.5,.6]],k:[K(0,RT(0),0,1.45,LD(0,950)),K(4,AT(1,-90,10),-.3,.56,112),K(7.5,TR(1,-92,12),.35,.48,56),K(11,TR(1,-88,10),.75,.5,62),K(14.2,TR(1,-77,-7),.95,.5,58),K(18.4,TR(1,-68,-10),1.15,.55,92),K(21.5,MV(1,()=>SHBR),1.5,.6,112),K(25,MV(1,()=>SHBR),0,.9,700),K(28,RT(1),0,1.45,5200)]},
 {dur:24,home:8,w:[[4,20,1.6]],k:[K(0,RT(1),0,1.45,5200),K(4,RT(1),0,1.45,22000),K(12,RT(1),0,1.45,38000),K(20,RT(1),0,1.45,12000),K(24,RT(1),0,1.45,2600)]},
 {dur:24,home:7,w:[[4.5,24,.6]],k:[K(0,RT(1),0,1.45,2600),K(4.5,AT(2,56,8),3.4,.55,128),K(10,TR(2,64,-12),3,.56,96),K(19,TR(2,84,2),2.4,.55,72),K(24,AT(2,104,17),2.05,.5,56)]},
 {dur:26,home:2,w:[[0,12.5,.65],[12.5,17,.7],[17,24,.85],[15.6,18.6,1.7]],k:[K(0,AT(2,104,17),2.05,.5,56),K(8.5,AT(2,108,17),2.95,.55,48),K(12.5,MV(2,()=>LORU),3.2,.5,60),K(17,RT(2),0,1.45,LD(2,4200)),K(24,RT(2),0,1.45,LD(2,1700)),K(26,RT(2),0,1.45,LD(2,900))]},
 {dur:20,home:8,k:[K(0,RT(2),0,1.45,LD(2,900)),K(4,AT(3,150,22),.1,.6,72),K(8.5,TR(3,146,14),.25,.66,70),K(13,TR(3,138,0),.6,.7,64),K(20,TR(3,160,6),1.15,.66,78)]},
 {dur:16,home:4,k:[K(0,TR(3,160,6),1.15,.66,78),K(3.5,AT(3,179,10),.45,.56,46),K(16,AT(3,172,10),-.55,.5,56)]},
 {dur:20,home:3.5,k:[K(0,AT(3,172,10),-.55,.5,56),K(3,AT(3,180,-18),-.95,.5,48),K(8,GV('claimA'),0,1.45,34000),K(14.5,GV('claimB'),0,1.45,44000),K(20,AT(3,150,26),.15,.58,60)]},
 {dur:20,home:9,k:[K(0,AT(3,150,26),.15,.58,60),K(3.5,AT(3,204,4),.65,.55,52),K(9,AT(3,202,-1),.3,.5,38),K(14.5,AT(3,206,-3),-.25,.5,36),K(20,AT(3,150,26),.15,.58,60)]},
 {dur:31,home:23,w:[[4,11,.7],[11,16.5,.85],[16.5,23,.75],[9.8,12.6,1.8]],k:[K(0,AT(3,150,26),.15,.58,60),K(4,AT(3,151,28),.4,.5,50),K(8,MV(3,()=>LORW),.6,.5,60),K(11,RT(3),0,1.45,LD(3,3400)),K(16.5,RT(3),0,1.45,LD(3,1500)),K(19.5,AT(4,206,22),.2,.55,70),K(23,TR(4,208,11),.45,.5,46),K(27,AT(4,219,8),.8,.5,30),K(31,AT(4,219,8),1.25,.46,22)]}];
/* clock rate inside a stage: 1 outside the w stretches, their multiplier inside, blended over 1.5 s at each edge so pace never jumps */
/* stage-time rate. A stage plays at one steady pace while its 3D site is on screen (the slowest rate its w list asks for, at most 1),
   and only runs faster (its fastest rate, at least 1) once the camera is high enough that the site has faded: so nothing visible ever
   speeds up or slows down mid-shot, and long map and globe flights still pass quickly. The rate depends on camera height, never on stage
   time, so scrubbing and every stage keep the same timeline. */
const warp=i=>{const w=SCRIPT[i].w||[],lo=Math.min(1,...w.map(q=>q[2])),hi=Math.max(1,...w.map(q=>q[2]));return lerp(lo,hi,ss(2600,7000,X.d||0))};
const STSITE=[0,0,1,-1,2,2,3,3,3,3,4];
/* which 3D site belongs to a stage at a given stage time. Most stages have one; a stage that travels hands over to its
   destination once the camera is up at map level, so the destination can appear as the camera comes down. -1 = none. */
const STSITES={1:[[0,0],[25,1]],3:[[0,-1]],5:[[0,2],[17,3]],10:[[0,3],[13,4]]};
function stageSite(i,t){const q=STSITES[i];if(!q)return STSITE[i];let k=q[0][1];for(const e of q)if(t>=e[0])k=e[1];return k}
const dlon=(a,b)=>((b-a+540)%360)-180,dang=(a,b)=>((b-a+Math.PI)%TAU+TAU)%TAU-Math.PI;
/* journey speed: one factor for stage time, so camera, vehicles and routes stay in step. Saved per browser. */
const SPEEDS={normal:1,cinematic:1.3,fast:1.7};let SPEED='fast';try{const v=localStorage.getItem('ffts.speed');if(SPEEDS[v])SPEED=v}catch(e){}
const spd=()=>SPEEDS[SPEED];
/* The camera follows one smooth curve through a stage's keys (cubic Hermite), so it keeps moving through each key
   instead of easing to a stop there. The neighbouring key of the previous and next stage shapes the ends, so speed
   also carries across stage changes. A tangent is zero only where the motion really reverses or rests, and is
   limited so zoom and position never overshoot a key. */
function stagePose(i){const S=SCRIPT[i],k=S.k,t=clamp(STATE.t,0,S.dur),P=[],add=(q,tt)=>{const g=q.g();const h=q.ry+SIGN_TURN*siteTurn(q.g);P.push({t:tt,v:[g[0],g[1],Math.atan2(Math.sin(h),Math.cos(h)),q.rx,Math.log(typeof q.d==='function'?q.d():q.d)]})};
 if(i>0){const pk=SCRIPT[i-1].k,q=pk[pk.length-2];add(q,q.t-SCRIPT[i-1].dur)}
 for(const q of k)add(q,q.t);
 if(i<SCRIPT.length-1){const q=SCRIPT[i+1].k[1];add(q,S.dur+q.t)}
 for(let j=1;j<P.length;j++){P[j].v[0]=P[j-1].v[0]+dlon(P[j-1].v[0],P[j].v[0]);P[j].v[2]=P[j-1].v[2]+dang(P[j-1].v[2],P[j].v[2])}
 let j=i>0?1:0;const hi=j+k.length-2;while(j<hi&&P[j+1].t<=t)j++;
 const a=P[j],b=P[j+1],h=b.t-a.t,u=(t-a.t)/h,o=[],tan=(q,c)=>{const p0=P[q-1],p1=P[q],p2=P[q+1];if(!p0||!p2)return 0;const s0=(p1.v[c]-p0.v[c])/(p1.t-p0.t),s1=(p2.v[c]-p1.v[c])/(p2.t-p1.t);if(s0*s1<=0)return 0;
   const m=(p2.v[c]-p0.v[c])/(p2.t-p0.t);return Math.sign(m)*Math.min(Math.abs(m),3*Math.min(Math.abs(s0),Math.abs(s1)))},
  herm=(c,x)=>{const x2=x*x,x3=x2*x;return(2*x3-3*x2+1)*a.v[c]+(x3-2*x2+x)*h*tan(j,c)+(3*x2-2*x3)*b.v[c]+(x3-x2)*h*tan(j+1,c)};
 for(let c=0;c<5;c++)o[c]=herm(c,u);
 /* Big changes of altitude (leaving or entering a site) are flown like a map dive: the ground moves under the camera in
    proportion to how much ground is in view, so the low end stays locked in the centre while the camera rises or descends,
    and the sideways travel happens high up. The turn to north-up (and back to the site's viewing angle) is tied to altitude
    too and is finished before the map takes over, so the map itself never rotates. */
 const dz=Math.abs(b.v[4]-a.v[4]),w=ss(.8,1.8,dz);
 if(w>0){const N=24;let I=0,Iu=0,pv=Math.exp(herm(4,0));for(let n=1;n<=N;n++){const x=n/N,cv=Math.exp(herm(4,x)),seg=(pv+cv)/2/N;if(x<=u+1e-9)Iu+=seg;else if(x-1/N<u)Iu+=seg*(u-(x-1/N))*N;I+=seg;pv=cv}
  const p=Iu/I,lo=a.v[4]<b.v[4]?a:b,hi=lo===a?b:a,g=ss(0,1,(o[4]-lo.v[4])/Math.min(dz,2.4)),mix=(c,k)=>lerp(o[c],k,w);
  o[0]=mix(0,lerp(a.v[0],b.v[0],p));o[1]=mix(1,lerp(a.v[1],b.v[1],p));o[2]=mix(2,lerp(a.v[2],b.v[2],ss(0,1,p)));o[3]=mix(3,lerp(lo.v[3],hi.v[3],g))}
 /* the map is always north-up: the scene's viewing heading fades in over the whole descent from map height (about 2300 units, where
    the 3D scene takes over) down to about 150, and out again on the way up, so the turn is spread over the climb and never spins the map.
    In a dive the heading moves evenly with the ground travelled, so it meets each key exactly and never jumps. */
 o[2]*=1-ss(Math.log(150),Math.log(2300),o[4]);
 return{lon:o[0],lat:o[1],ry:o[2],rx:o[3],ld:o[4]}}
