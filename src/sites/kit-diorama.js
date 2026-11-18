'use strict';
/* ================= diorama model kit (the "Cartoon" style) =================
   Detailed miniature-landscape models: varied trees, vines and crops, timbered houses, layered earth, rocks,
   grass tufts and flowers. Vehicles, cranes, containers and the vessel reuse the detailed models in
   kit-industrial.js with this style's natural palette. Same origins and footprints as before, so paths,
   animation, picking and camera shots are unchanged. Surface texture comes from material codes read by the
   shader in gl.js: 6 foliage, 7 grass, 8 soil, 9 wood, 10 stone/concrete, 11 roof tiles. */
const hsh=(x,z)=>prng((Math.abs(x*31.7+z*17.3)*10|0)+1);
const LEAVES=()=>[P.leaf,P.leaf2,P.leaf3];
/* LOWD: scenery scattered far from the action is built with fewer triangles */
let LOWD=false;
function blob(c,x,y,z,r,sy,big){if(LOWD)ball(c,x,y,z,r,sy||.85,7,3);else ball(c,x,y,z,r,sy||.85,big?11:9,big?6:4)}
function trunkD(x,z,s,h,r0){lathe(P.trunk,[[r0*1.6*s,0],[r0*s,.5*s],[r0*.8*s,h*.6*s],[r0*.55*s,h*s]],x,0,z,7)}
/* four tree shapes, picked from the position: round broadleaf, tall oval, flat-topped, multi-stem */
function treeD(x,z,s){const r=hsh(x,z),L=LEAVES(),k=Math.floor(r()*4),lc=()=>shade(L[Math.floor(r()*3)],.86+r()*.3);s*=.9+r()*.35;
 const limb=(y,l,t)=>{const a=r()*TAU;Tm(mul(mul(tr(x,y*s,z),rY(a)),rZ(-t)),()=>cyl(P.trunk,0,0,0,.1*s,l*s,5))};
 if(k===0){trunkD(x,z,s,3.4,.3);limb(2.3,1.5,.85);limb(2.6,1.3,.8);SW=.7;blob(lc(),x,4.5*s,z,1.75*s,.9,1);
  for(let i=0;i<6;i++){const a=i/6*TAU+r(),d=(1.2+r()*.5)*s;blob(lc(),x+Math.cos(a)*d,(3.5+r()*1.1)*s,z+Math.sin(a)*d,(1+r()*.45)*s)}
  for(let i=0;i<3;i++){const a=r()*TAU;blob(lc(),x+Math.cos(a)*.7*s,(5.4+r()*.5)*s,z+Math.sin(a)*.7*s,(.85+r()*.3)*s)}}
 else if(k===1){trunkD(x,z,s,3,.24);SW=.6;for(let i=0;i<6;i++){const t=i/5;blob(lc(),x+(r()-.5)*.5*s,(2.6+t*5)*s,z+(r()-.5)*.5*s,(1.35-t*.7+r()*.2)*s,1.15,i<2)}}
 else if(k===2){trunkD(x,z,s,4.2,.26);for(let i=0;i<3;i++)limb(3.2,2,.95);SW=.7;blob(lc(),x,4.9*s,z,1.5*s,.5,1);
  for(let i=0;i<7;i++){const a=i/7*TAU+r(),d=(1.6+r()*.6)*s;blob(lc(),x+Math.cos(a)*d,(4.5+r()*.5)*s,z+Math.sin(a)*d,(1.05+r()*.4)*s,.5)}}
 else{for(let i=0;i<3;i++)limb(0,2.6,.28);SW=.6;for(let i=0;i<7;i++){const a=r()*TAU,d=r()*1.3*s;blob(lc(),x+Math.cos(a)*d,(2.3+r()*1.5)*s,z+Math.sin(a)*d,(.8+r()*.45)*s)}}
 SW=0}
function coniferD(x,z,s){const r=hsh(x,z),n=6,c0=shade(P.leaf,.8),c1=shade(P.leaf,1.02);s*=.9+r()*.4;cyl(P.trunk,x,0,z,.2*s,1.6*s,6);SW=.35;
 for(let k=0;k<n;k++){const rr=(2-1.55*k/(n-1))*s;lathe(k%2?c0:c1,[[rr*.3,-.15*s],[rr,0],[rr*.62,.55*s],[rr*.22,1.5*s]],x,(1.1+k*1.05)*s,z,9)}
 lathe(c1,[[.3*s,0],[0,1.1*s]],x,(1.3+n*1.05)*s,z,6);SW=0}
/* leaning ringed trunk, folded fronds that droop in four segments */
function palmD(x,z,s){const r=hsh(x,z),a0=r()*TAU,bx=Math.cos(a0),bz=Math.sin(a0),n=9;s*=.9+r()*.3;let tx=x,tz=z;
 for(let k=0;k<n;k++){const t=k/n,o=1.1*s*t*t,rr=(.34-.14*t)*s;tx=x+bx*o;tz=z+bz*o;lathe(shade(P.trunk,k%2?.9:1.06),[[rr*1.14,0],[rr,.2*s],[rr*.95,.72*s]],tx,k*.7*s,tz,7)}
 const top=n*.7*s,nf=LOWD?7:10,ns=LOWD?2:3;SW=1;for(let k=0;k<nf;k++){let m=mul(mul(tr(tx,top,tz),rY(k/nf*TAU+r())),rZ(.55-(k%3)*.25));C=shade(k%2?P.leaf2:P.leaf,.9+r()*.25);
  for(let j=0;j<ns;j++){const L=(LOWD?1.9:1.35)*(1-.14*j)*s,w=(.8-.2*j)*s;for(const sg of[-1,1])Tm(mul(mul(m,tr(L/2,0,0)),rX(sg*.38)),()=>{const A=[-L/2,0,0],B=[L/2,0,0],D=[L/2,0,sg*w/2*.7],E=[-L/2,0,sg*w/2];Q(A,B,D,E,[0,1,0]);Q(E,D,B,A,[0,1,0])});m=mul(mul(m,tr(L,0,0)),rZ(-.5))}}
 SW=0;for(let k=0;k<3;k++)ball([.36,.27,.18],tx+Math.cos(k*2.1)*.32*s,top-.25*s,tz+Math.sin(k*2.1)*.32*s,.22*s,1,6,3)}
/* melon vine: a rosette of flat leaves, two runners, one or two fruit. kind 2 = seedling */
function plantD(x,z,kind){const r=hsh(x,z),L=LEAVES();SW=.45;
 if(kind===2){for(let k=0;k<4;k++)Tm(mul(mul(tr(x,.2,z),rY(k*1.57+r())),rZ(.7)),()=>ball(L[1+k%2],.35,0,0,.34,.3,6,3));SW=0;return}
 for(let k=0;k<6;k++){const a=k/6*TAU+r(),d=.25+r()*.55;Tm(mul(mul(tr(x+Math.cos(a)*d,.3+r()*.22,z+Math.sin(a)*d),rY(-a)),rZ(.25)),()=>ball(shade(L[k%3],.9+r()*.2),0,0,0,.46,.22,6,3))}
 SW=0;for(let k=0;k<2;k++){const l=.9+r()*.5;Tm(mul(tr(x,.2,z),rY(r()*TAU)),()=>{box(P.leaf,l/2,0,0,l,.05,.05);ball(L[2],l,.08,0,.26,.25,5,3)})}
 const a=r()*TAU,mc=kind?P.melG:P.melY;ball(mc,x+Math.cos(a)*.62,.07+MELR*.92,z+Math.sin(a)*.62,MELR,.92,8,4);if(r()>.5)ball(mc,x-Math.cos(a)*.5,.08+MELR*.9,z-Math.sin(a)*.6,MELR*.95,.92,7,3)}
/* raised bed with a dark earth edge and one planting ridge per crop row */
function plotD(x0,z0,x1,z1,dx){const cx=(x0+x1)/2,cz=(z0+z1)/2;bb(P.soilD,cx,-.02,cz,x1-x0+1,.3,z1-z0+1);
 for(let x=x0+1.5;x<x1-.8;x+=dx||2.9){bb(P.bed,x,.18,cz,1.8,.22,z1-z0-.7);bb(shade(P.bed,1.12),x,.4,cz,1.2,.12,z1-z0-1.1)}}
function roofD(c,w,h,d,y0){const a=Math.atan2(h,w/2),l=Math.hypot(h,w/2)+.45;for(const sg of[-1,1])Tm(mul(tr(sg*w/4,y0+h/2-.08,0),rZ(-sg*a)),()=>box(c,0,0,0,l,.2,d));bb(shade(c,.78),0,y0+h-.08,0,.36,.2,d+.1)}
/* stone plinth, timber corner posts, framed and shuttered windows with flower boxes, door with step, thick tiled roof, chimney */
function houseD(x,z,yaw,w,d,h,wc,rc){const r=hsh(x,z),H=h+.35,rh=h*.62,wr=w+1.2,gh=w/2*rh/(wr/2),sh=[P.green,P.blue,P.wood][Math.floor(r()*3)];
 Tp(x,0,z,yaw,1,()=>{bb(P.concD,0,0,0,w+.35,.35,d+.35);bb(wc,0,.35,0,w,h,d);C=wc;tri([-w/2,H,d/2],[w/2,H,d/2],[0,H+gh,d/2],[0,0,1]);tri([w/2,H,-d/2],[-w/2,H,-d/2],[0,H+gh,-d/2],[0,0,-1]);
  for(const a of[-1,1])for(const b of[-1,1])bb(P.wood,a*w/2,.35,b*d/2,.24,h,.24);for(const b of[-1,1])bb(P.wood,0,H-.22,b*(d/2+.02),w+.2,.22,.1);
  roofD(rc,wr,rh,d+1.1,H-.02);bb(P.brick,w*.24,H+rh*.2,-d*.18,.75,rh*.95,.75);bb(P.concD,w*.24,H+rh*1.15,-d*.18,.95,.14,.95);
  bb(P.concD,0,0,d/2+.45,1.8,.2,.7);bb(P.wood,0,.35,d/2+.04,1.36,2.25,.1);bb(shade(sh,.8),0,.35,d/2+.08,1.1,2.1,.08);ball(P.yel,.38,1.4,d/2+.16,.07,1,5,3);
  const win=(wx,wz,ry,fl)=>Tm(mul(tr(wx,.35+h*.56,wz),rY(ry)),()=>{box(P.white,0,0,0,1.25,1.25,.1);box(P.glass,0,0,.04,1.02,1.02,.06);box(P.white,0,0,.08,.07,1.02,.03);box(P.white,0,0,.08,1.02,.07,.03);box(P.concD,0,-.68,.08,1.45,.1,.26);
   for(const s of[-1,1])box(sh,s*.86,0,.02,.42,1.2,.07);if(fl){box(P.wood,0,-.86,.2,1.2,.24,.3);for(let k=0;k<4;k++)ball(k%2?[.9,.4,.45]:[.95,.8,.4],-.42+k*.28,-.68,.22,.13,1,5,3)}});
  win(-w/3,d/2,0,1);win(w/3,d/2,0,1);win(0,-d/2,Math.PI);win(w/2,0,Math.PI/2);win(-w/2,0,-Math.PI/2)})}
function personD(shirt,hat){for(const x of[-.16,.16]){bb([.26,.3,.42],x,.1,0,.24,.88,.28);bb(P.dark,x,0,.06,.26,.12,.4)}lathe(shirt,[[.3,.96],[.38,1.5],[.33,1.98],[.13,2.06]],0,0,0,10);
 for(const x of[-.45,.45]){bb(shirt,x,1.42,0,.16,.58,.18);bb(P.skin,x,1,0,.13,.44,.14)}ball(P.skin,0,2.32,0,.27,1.1,10,5);
 if(hat){cyl(hat,0,2.5,0,.62,.05,12);lathe(hat,[[.3,2.5],[.27,2.72],[0,2.78]],0,0,0,10)}else lathe([.25,.18,.12],[[.285,2.34],[.27,2.56],[0,2.63]],0,0,0,9)}
/* small scenery */
function bushD(x,z,s){const r=hsh(x,z),L=LEAVES();SW=.4;for(let k=0;k<4;k++){const a=r()*TAU,d=r()*.7*s;blob(shade(L[k%3],.85+r()*.3),x+Math.cos(a)*d,(.5+r()*.4)*s,z+Math.sin(a)*d,(.6+r()*.4)*s,.8)}SW=0}
function rockD(x,z,s,y){const r=hsh(x,z);Tm(mul(mul(tr(x,(y||0)+.1*s,z),rY(r()*TAU)),sc((.7+r()*.8)*s,(.45+r()*.4)*s,(.6+r()*.6)*s)),()=>ball(shade(P.concD,.8+r()*.35),0,0,0,1,1,6,3))}
function tuftD(x,z,s){const r=hsh(x,z);SW=.9;C=shade(P.grass2,.78+r()*.35);for(let k=0;k<6;k++){const a=r()*TAU,dx=Math.cos(a)*.14*s,dz=Math.sin(a)*.14*s,px=x+(r()-.5)*.6*s,pz=z+(r()-.5)*.6*s,h=(.5+r()*.6)*s;
  tri([px-dz,0,pz+dx],[px+dz,0,pz-dx],[px+dx*2.2,h,pz+dz*2.2],[0,1,0]);tri([px+dz,0,pz-dx],[px-dz,0,pz+dx],[px+dx*2.2,h,pz+dz*2.2],[0,1,0])}SW=0}
const PETAL=[[.96,.95,.9],[.95,.8,.35],[.9,.45,.5],[.62,.5,.85]];
function flowerD(x,z,k){cyl(P.leaf2,x,0,z,.035,.42,4);ball(PETAL[k%4],x,.48,z,.15,.75,5,3)}
function reedD(x,z,h){cyl(P.leaf3,x,0,z,.05,h,4);cyl([.36,.26,.17],x,h,z,.09,.45,5)}
function hayD(x,z,yaw){Tm(mul(mul(tr(x,.75,z),rY(yaw)),rZ(Math.PI/2)),()=>cyl(P.straw,0,-.65,0,.75,1.3,12))}
/* per-site scenery: natural shoreline, pond life, building trim, then dense planting everywhere that is free */
function extrasD(k){const S=SITES[k],r=prng(101+k),cx=S.c[0],uk=k>1;
 const RECT=[[-400,400,31.5,39.5]].concat([
  [[-230,-149,-4.2,.8],[-204,-200,-1,34],[-177,-173,-1,34],[-135,-117,27,34],[-232,-200,-44,-30]],[[-95,-89,19,37]],[[110,116.5,6,35],[164,216,-47,-37]],[[176.5,179.5,-20,-7],[138,164,26,33]],[[197,203,11,35],[210,232,25,31],[194,252,41,44]]][k]);
 for(const e of ENT)if(e&&(e.site===S||e.site===k)&&e.bb[0]<=e.bb[3]&&(e.bb[3]-e.bb[0])*(e.bb[5]-e.bb[2])<6000)RECT.push([e.bb[0],e.bb[3],e.bb[2],e.bb[5]]);
 const land=x=>!S.sea||(S.sea[1]>0?x<S.sea[0]-2:x>S.sea[0]+2),clear=(x,z,p)=>land(x)&&!RECT.some(q=>x>q[0]-p&&x<q[1]+p&&z>q[2]-p&&z<q[3]+p),T=(x,z,s)=>(uk?(r()>.5?conifer:tree):(r()>.6?palm:tree))(x,z,s);
 /* the busy middle of the site */
 for(let i=0;i<1500;i++){const x=cx+(r()*2-1)*68,z=(r()*2-1)*52,t=r();
  if(t<.5){if(clear(x,z,.6))tuftD(x,z,1+r()*.6)}else if(t<.64){if(clear(x,z,.8))for(let j=0;j<4;j++)flowerD(x+(r()-.5)*1.6,z+(r()-.5)*1.6,i+j)}
  else if(t<.82){if(clear(x,z,2))bushD(x,z,.8+r()*.6)}else if(t<.88){if(clear(x,z,1.6))rockD(x,z,.5+r()*.6)}else if(clear(x,z,4))T(x,z,.8+r()*.5)}
 /* the surrounding countryside: groves, undergrowth, boulders */
 const far=(x,z)=>land(x)&&(Math.abs(x-cx)>70||Math.abs(z)>54)&&clear(x,z,3);
 scatter(k,24,(x,z)=>{for(let i=0;i<7;i++){const a=r()*TAU,d=2+r()*8,px=x+Math.cos(a)*d,pz=z+Math.sin(a)*d;if(far(px,pz)&&Math.abs(pz-35)>7)T(px,pz,.8+r()*.6)}},far);
 scatter(k,110,(x,z,s)=>bushD(x,z,s),far);scatter(k,50,(x,z,s)=>rockD(x,z,s),far);scatter(k,320,(x,z,s)=>tuftD(x,z,s*1.5),far);scatter(k,60,(x,z)=>{for(let j=0;j<5;j++)flowerD(x+(r()-.5)*2.4,z+(r()-.5)*2.4,j)},far);
 /* coast outside the quay: an earth bank in two layers and a line of boulders at the waterline */
 if(S.sea){const sx=S.sea[0],o=S.sea[1]>0?1:-1;for(const zc of[-112,116]){bb(P.soil,sx-o*.2,-.9,zc,.8,.88,150);bb(P.soilD,sx-o*.1,-2.4,zc,1,1.5,150)}
  for(let z=-186;z<190;z+=2.4)if(z<-38||z>42){rockD(sx+o*(.4+r()*1.2),z+r(),1+r()*.9,-1.5);if(r()>.6)rockD(sx-o*(1+r()*2),z+r(),.5+r()*.5)}}
 const trim=(x,z,w,h,d)=>{bb(P.concD,x,0,z,w+.5,.4,d+.5);for(const s of[-1,1]){for(let q=z-d/2+2.5;q<z+d/2-1.5;q+=3.4)bb(P.glass,x+s*(w/2+.03),h*.55,q,.08,1.1,2);bb(P.steel,x+s*(w/2+.35),h-.1,z,.3,.22,d+.6)}for(let q=z-d/2+3;q<z+d/2-2;q+=5.5)bb(P.steel,x,h+2.45,q,.9,.5,.9)};
 if(k===0){for(let i=0;i<22;i++){const a=i/22*TAU+r()*.2;reedD(-140+Math.cos(a)*(7.4+r()*.8),-22+Math.sin(a)*(7.4+r()*.8),1.1+r()*.9)}
  for(const[a,b]of[[-142,-24],[-137,-20],[-141,-18.5]])cyl(P.leaf2,a,.14,b,.55,.04,8);for(let i=0;i<5;i++)bb(P.wood,-133.4+i*.5-1,.34,-22,.42,.1,2.2);for(const a of[-134.6,-132.2])cyl(P.trunk,a,-.4,-21,.12,.8,5);
  for(const[a,b,c]of[[-150,-8,.3],[-148.2,-9.4,1.2],[-151.6,-10,2.2],[-183,-34,.6],[-181,-35.4,1.9]])hayD(a,b,c);
  for(let i=0;i<9;i++)rockD(-196+Math.cos(i*.7+1)*19.6,-23+Math.sin(i*.7+1)*19.6,.6+r()*.5);
  bb(P.wood,-178.4,0,3.4,.14,2.6,.14);bb(P.wood,-178.4,1.75,3.4,1.9,.12,.12);Tp(-178.4,1.1,3.4,0,.55,()=>personD(P.red,P.straw))}
 if(k===1){for(const z of[-18,10])trim(-134,z,18,6,22);for(const z of[25,29])bushD(-110.6,z,1);bb(P.steel,-102.6,5.65,25.4,1.4,.8,1.1)}
 if(k===2){trim(146,-16,20,6,26);for(let q=102.5;q<=111.5;q+=3)bushD(q,-21.4,.8);bb(P.steel,110,6.15,-29.5,1.4,.8,1.1)}
 if(k===3){for(let q=173;q<=187;q+=2.3)if(Math.abs(q-178)>2)bushD(q,-18.2,.9);bb(P.steel,183,7.4,-22,1.5,.8,1.2);for(let q=120;q<=170;q+=2.4)bushD(q,-27.4,1)}
 if(k===4){for(let q=208;q<=238;q+=6){bb(P.wood,q,.25,23.6,2.2,.7,1.1);bushD(q,24,.75)}for(let q=205;q<=236;q+=10.3){bb(P.conc,q,0,32.2,1.6,.3,1.6);T(q,32.2,.75)}for(let q=0;q<6;q++){bb(q%2?P.white:P.green,208+q*5.2,7.2,-16.2,5.2,.12,2.4)}}}
