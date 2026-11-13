'use strict';
/* ================= industrial model kit =================
   Industrial variants of the cartoon kit in kit.js. Every model keeps the same origin, footprint and facing
   as its cartoon twin, so paths and animation in movers.js drive either style unchanged.
   Material codes used here: 3 painted or bare metal, 4 glass, 5 corrugated sheet (see the shader in gl.js). */
const mt=(m,fn)=>{const o=MAT;MAT=m;fn();MAT=o};
const LIT=[1,.97,.85];

function treeI(x,z,s){cyl(P.trunk,x,0,z,.22*s,3.2*s,7);SW=.6;const r=prng((Math.abs(x*31+z*17)|0)+1);for(let k=0;k<6;k++){const a=k/6*TAU+r(),d=1.1*s*r();ball(k%2?P.leaf:P.leaf2,x+Math.cos(a)*d,3.2*s+r()*1.8*s,z+Math.sin(a)*d,(1+r()*.7)*s,.85,9,5)}SW=0}
function coniferI(x,z,s){cyl(P.trunk,x,0,z,.2*s,1.4*s,7);SW=.35;for(let k=0;k<4;k++)lathe(k%2?P.leaf:P.leaf2,[[(1.9-k*.4)*s,0],[.25*s,2*s]],x,(1.1+k*1.25)*s,z,10);SW=0}
function palmI(x,z,s){const pr=[];for(let k=0;k<=8;k++)pr.push([(.3-.014*k+(k%2?.03:0))*s,k*.75*s]);pr.push([0,6.05*s]);lathe(P.trunk,pr,x,0,z,8);SW=1;
 for(let k=0;k<10;k++)Tm(mul(mul(tr(x,6*s,z),rY(k/10*TAU+x)),mul(rZ(-.25-(k%3)*.22),mul(tr(1.9*s,0,0),sc(2.3*s,.1*s,.36*s)))),()=>ball(k%2?P.leaf2:P.leaf,0,0,0,1,1,8,3));SW=0;
 for(let k=0;k<3;k++)ball(P.trunk,x+Math.cos(k*2.1)*.3*s,5.7*s,z+Math.sin(k*2.1)*.3*s,.2*s,1,6,3)}
function plantI(x,z,kind){SW=.45;for(let k=0;k<3;k++){const a=k*2.1+x;ball(k?P.leaf:P.leaf2,x+Math.cos(a)*.45,.22,z+Math.sin(a)*.45,.62,.38,7,3)}SW=0;if(kind<2)ball(kind?P.melG:P.melY,x+.35,.3,z+.4,.34,.85,8,4)}
/* drip irrigation: a header pipe and one line per crop row */
function plotI(x0,z0,x1,z1,dx){bb(P.dark,(x0+x1)/2,.2,z0+.4,x1-x0-1,.16,.16);for(let x=x0+1.5;x<x1-.8;x+=dx||2.9)bb(P.dark,x-.75,.2,(z0+z1)/2,.07,.07,z1-z0-1.2)}
function houseI(x,z,yaw,w,d,h){Tp(x,0,z,yaw,1,()=>{bb(P.conc,0,0,0,w+.8,.2,d+.8);mt(5,()=>{bb(P.white,0,.2,0,w,h,d);roof(P.steel,0,h+.2,0,w+.5,h*.26,d+.5)});
 mt(3,()=>{bb(P.steel,0,.2,d/2+.05,w*.42,h*.78,.08);for(let k=1;k<6;k++)bb(P.dark,0,.2+k*h*.13,d/2+.1,w*.42,.03,.02);bb(P.dark,-w*.36,.2,d/2+.05,.9,2,.06);cyl(P.steel,w/2+.2,.2,-d/4,.12,h,6);bb(P.steel,w/4,h+h*.2,0,.9,.7,.9)});
 mt(4,()=>bb(P.glass,w*.36,h*.55,d/2+.05,1,.7,.05))})}
function personI(shirt,hat){for(const x of[-.15,.15])bb(P.dark,x,0,0,.22,.98,.26);lathe(shirt,[[.3,.98],[.37,1.5],[.31,1.98],[.13,2.06]],0,0,0,10);for(const x of[-.44,.44])bb(shirt,x,1.2,0,.15,.78,.17);
 if(hat)lathe([.92,.82,.1],[[.375,1.22],[.4,1.74],[.33,1.96]],0,0,0,10);ball(P.skin,0,2.32,0,.27,1.1,10,5);if(hat){lathe(hat,[[.31,2.4],[.31,2.47],[.25,2.62],[0,2.67]],0,0,0,10);bb(hat,0,2.4,.27,.4,.04,.22)}}
function lorryI(cab,bx,band){const rib=shade(bx,.88);
 mt(3,()=>{bb(P.dark,0,.62,-.5,1,.28,8.6);bb(P.dark,0,.5,-4.75,2.4,.14,.12);for(const x of[-.9,.9])bb(P.dark,x,.1,.4,.12,.6,.12)});
 mt(5,()=>bb(bx,0,1.15,-1.45,2.6,3.05,6.7));
 mt(3,()=>{bb(rib,0,1.1,-1.45,2.66,.1,6.74);bb(rib,0,4.14,-1.45,2.66,.08,6.74);bb(band,0,2.45,-1.45,2.63,.4,6.72);bb(P.white,0,2.55,2.02,2,1.35,.36);bb(P.dark,0,2.75,2.21,1.5,.8,.04);
  for(const x of[-.62,0,.62])bb(P.steel,x,1.25,-4.81,.05,2.8,.05);
  bb(cab,0,.95,3.4,2.5,1.45,2);bb(cab,0,2.4,3.15,2.5,1.35,1.5);Tm(mul(tr(0,4,3.2),rX(.45)),()=>box(cab,0,0,0,2.4,.12,1.5));bb(P.dark,0,1.05,4.41,1.9,.95,.06);bb(P.steel,0,.5,4.48,2.55,.4,.22);
  for(const x of[-1.45,1.45]){bb(P.dark,x,2.8,4.05,.14,.55,.1);cyl(P.steel,x*.72,2.3,2.25,.09,2.2,6)}
  for(const x of[-1,1])Tm(mul(tr(x,.78,1.55),rX(Math.PI/2)),()=>cyl(P.steel,0,-.55,0,.3,1.1,10));
  for(const x of[-1.25,1.25])for(const z of[.95,-3.4])bb(P.dark,x,1.12,z,.6,.06,2.2)});
 mt(4,()=>{Tm(mul(tr(0,3.05,4),rX(-.32)),()=>box(P.glass,0,0,0,2.3,1.15,.08));for(const x of[-1.26,1.26])bb(P.glass,x,2.75,3.3,.04,.75,1)});
 MAT=2;for(const x of[-.95,.95])bb(LIT,x,.95,4.45,.34,.2,.04);MAT=0;
 for(const z of[3.55,1.45,.45,-2.9,-3.9])for(const x of[-1.15,1.15]){wheelX(x,.56,z,.56,.62);mt(3,()=>Tm(mul(tr(x*1.29,.56,z),rZ(Math.PI/2)),()=>cyl(P.steel,0,-.02,0,.26,.04,8)))}}
function forkliftI(){mt(3,()=>{bb(P.yel,0,.38,-.15,1.4,.85,1.8);bb(P.dark,0,.38,-1.3,1.42,1.15,.75);bb(P.yel,0,1.23,-.2,1.2,.12,1.2);bb(P.dark,0,1.3,-.55,.62,.5,.6);bb(P.dark,0,1.3,-.95,.62,1,.12);Tm(mul(tr(0,1.7,.35),rX(-.5)),()=>box(P.dark,0,0,0,.08,.9,.08));
  for(const x of[-.66,.66])for(const z of[-1,.55])bb(P.dark,x,1.2,z,.09,2.2,.09);bb(P.dark,0,3.36,-.22,1.5,.08,1.75);for(let k=0;k<5;k++)bb(P.dark,-.56+k*.28,3.44,-.22,.05,.04,1.7);
  for(const x of[-.56,.56]){bb(P.steel,x,.15,.95,.14,3.5,.2);bb(P.dark,x*.62,.3,1.02,.1,2.6,.12)}for(const y of[.5,1.9,3.5])bb(P.steel,0,y,.95,1.26,.12,.12);
  bb(P.dark,0,.35,1.16,1.3,.9,.06);for(let k=0;k<5;k++)bb(P.dark,-.6+k*.3,1.25,1.16,.04,1,.04);bb(P.dark,0,2.25,1.16,1.3,.05,.05);
  for(const x of[-.5,.5]){bb(P.steel,x,.28,1.22,.14,.75,.07);bb(P.steel,x,.28,2.05,.14,.07,1.7)}});
 for(const x of[-.78,.78]){wheelX(x,.45,.45,.45,.36);wheelX(x,.34,-1.1,.34,.3)}MAT=2;ball([1,.6,.1],.55,3.6,-.9,.14,1,6,3);for(const x of[-.5,.5])bb(LIT,x,2.9,.62,.18,.14,.05);MAT=0}
function contI(c,x,y0,z,L){L=L||8;const d=shade(c,.7);mt(5,()=>bb(c,x,y0+.08,z,2.5,2.44,L-.1));
 mt(3,()=>{for(const sx of[-1.25,1.25]){for(const sz of[-L/2+.08,L/2-.08])bb(d,x+sx,y0,z+sz,.16,2.6,.16);for(const y of[0,2.48])bb(d,x+sx,y0+y,z,.14,.12,L)}
  for(const sz of[-L/2+.06,L/2-.06])for(const y of[0,2.48])bb(d,x,y0+y,z+sz,2.6,.12,.12);for(const sx of[-.75,-.25,.25,.75])bb(P.steel,x+sx,y0+.15,z+L/2,.045,2.3,.045)})}
function palletI(x,y0,z,lv,open,tag){for(const k of[-1,0,1])bb(P.wood,x+k,y0,z,.22,.14,2.3);for(let k=0;k<5;k++)bb(P.wood,x,y0+.14,z-1.04+k*.52,2.3,.07,.3);
 for(let l=0;l<lv;l++)for(const i of[-.57,.57])for(const k of[-.57,.57]){const y=y0+.22+l*.85;bb(l%2?P.card2:P.card,x+i,y,z+k,1.1,.82,1.1);bb(shade(P.card,.8),x+i,y+.82,z+k,.16,.012,1.1);bb(P.white,x+i+.3,y+.28,z+k+.556,.36,.24,.01)}
 const ty=y0+.22+lv*.85;if(open)for(const i of[-.57,.57])for(const k of[-.57,.57])ball((i*k>0)?P.melY:P.melG,x+i,ty+.2,z+k,.42,.9,8,4);
 mt(3,()=>{for(const sx of[-1.12,1.12])for(const sz of[-1.12,1.12])bb(P.steel,x+sx,y0+.2,z+sz,.05,lv*.85,.05)});if(tag){MAT=2;bb(tag,x,ty+(open?.7:.1),z,.7,.35,.7);MAT=0}}
function crateI(x,y0,z,full){const c=P.crate;bb(c,x,y0,z,1.5,.08,1.1);for(const sz of[-.52,.52]){bb(c,x,y0,z+sz,1.5,.85,.06);bb(P.dark,x,y0+.5,z+sz*1.07,.5,.14,.02)}for(const sx of[-.72,.72])bb(c,x+sx,y0,z,.06,.85,1.1);
 if(full)for(const i of[-.42,0,.42])ball(i?P.melY:P.melG,x+i,y0+.62,z,.36,.9,8,4)}
function lampI(x,z,h){h=h||5;mt(3,()=>{cyl(P.steel,x,0,z,.13,h,8);cyl(P.steel,x,0,z,.24,.3,8);bb(P.steel,x,h,z+.5,.1,.1,1.2);bb(P.dark,x,h-.14,z+1,.5,.16,.7)});MAT=2;bb(LIT,x,h-.17,z+1,.42,.03,.6);MAT=0}
function roadI(pts,w){if(w<4)return;for(let i=0;i<pts.length-1;i++){const a=pts[i],b=pts[i+1],dx=b[0]-a[0],dz=b[1]-a[1],l=Math.hypot(dx,dz);Tm(mul(tr((a[0]+b[0])/2,0,(a[1]+b[1])/2),rY(Math.atan2(dx,dz))),()=>{for(const s of[-1,1])bb(P.white,s*(w/2-.3),.21,0,.14,.02,l)})}}
/* ship-to-shore gantry crane: same leg and boom positions as the cartoon crane, so the trolley and hoist line up */
function craneI(x0,z,dir,c){const d=shade(c,.8);mt(3,()=>{
  for(const dx of[0,-7*dir]){for(const dz of[-3.4,3.4]){bb(c,x0+dx,.95,z+dz,.75,13.05,.75);bb(P.dark,x0+dx,.25,z+dz,1,.7,2.2)}bb(c,x0+dx,1.3,z,.6,.7,6.8);bb(c,x0+dx,8,z,.5,.5,6.8)}
  for(const dz of[-3.4,3.4]){bb(c,x0+2*dir,14,z+dz,24,.9,.5);bb(d,x0+2*dir,14.9,z+dz,24,.12,.7);bb(c,x0-3.5*dir,10.5,z+dz,7.6,.45,.45);
   for(const sg of[-1,1])Tm(mul(tr(x0-3.5*dir,6.2,z+dz),rZ(sg*.72)),()=>box(d,0,0,0,.25,10.6,.25));
   bb(c,x0-dir,14.9,z+dz,.5,9,.5);for(const xb of[x0+13*dir,x0-9*dir]){const xa=x0-dir,L=Math.hypot(xb-xa,8.6);Tm(mul(tr((xa+xb)/2,19.4,z+dz),rZ(Math.atan2(-8.6,xb-xa))),()=>box(d,0,0,0,L,.16,.16))}}
  bb(c,x0-dir,23.7,z,.5,.5,7.3);bb(c,x0-9.6*dir,14,z,.8,.8,7.4);bb(c,x0+13.6*dir,14,z,.8,.8,7.4);
  bb(P.white,x0-6*dir,15.1,z,5,3,4.6);bb(P.dark,x0-6*dir,18.1,z,5.3,.2,4.9);bb(P.white,x0+3*dir,11.3,z+2.3,2.2,2,2);
  for(const dx of[0,-7*dir])bb(P.steel,x0+dx,.25,z,.25,.14,72)});
 mt(4,()=>bb(P.glass,x0+3*dir,11.6,z+3.32,1.9,1.2,.05));MAT=2;ball([1,.3,.2],x0-dir,24.4,z,.3,1,6,3);MAT=0}
/* container vessel: facing +z, y=0 at the waterline, same hull footprint as the cartoon ship */
function shipI(){mt(3,()=>{bb(P.hullR,0,-1.7,-1,7.4,1.2,26);bb(P.hull,0,-.5,-1,8,3.3,26);bb(P.white,0,-.55,-1,8.04,.12,26.02);C=P.hull;
  Q([-4,-.5,12],[-4,3.6,12],[0,3.6,18],[0,-.5,18],nrm([-6,0,4]));Q([4,3.6,12],[4,-.5,12],[0,-.5,18],[0,3.6,18],nrm([6,0,4]));
  C=P.hullR;Q([-3.7,-1.7,12],[-3.7,-.5,12],[0,-.5,17.3],[0,-1.7,17.3],nrm([-6,0,4]));Q([3.7,-.5,12],[3.7,-1.7,12],[0,-1.7,17.3],[0,-.5,17.3],nrm([6,0,4]));
  ball(P.hullR,0,-1.3,17.4,.9,.8,8,4);C=P.concD;tri([-4,3.6,12],[4,3.6,12],[0,3.6,18],[0,1,0]);bb(P.hull,0,2.8,10.8,8,.8,2.4);
  bb(P.green,0,2.8,-1.6,7.6,.1,22.4);for(const x of[-3.92,3.92])bb(P.hull,x,2.8,-1,.14,.7,24);
  cyl(P.steel,0,3.6,15,.12,3.2,6);for(const x of[-1,1])bb(P.dark,x,3.6,13.6,.8,.6,1.2);
  bb(P.white,0,2.9,-11.6,7,2.6,3.6);bb(P.white,0,5.5,-11.6,6.2,2.3,3.2);bb(P.white,0,7.8,-11.4,7.9,1.5,2.6);bb(P.dark,0,9.3,-11.4,8.1,.12,2.8);
  cyl(P.steel,0,9.4,-11.2,.1,2.6,6);bb(P.steel,0,11.4,-11.2,2.2,.12,.12);bb(P.steel,0,10.5,-11.2,1.2,.1,.1);bb(P.orange,0,5.5,-13.9,2,4.6,1.4);bb(P.dark,0,10.1,-13.9,2.1,.5,1.5);
  for(const x of[-3.7,3.7])Tm(mul(tr(x,6.2,-12.6),sc(.6,.6,1.5)),()=>ball(P.orange,0,0,0,1,1,8,4));
  for(const zz of[-5.3,-1.2,2.95,7.3])for(const x of[-3.9,-1.35,1.35,3.9])bb(P.steel,x,2.9,zz,.1,5.6,.1)});
 mt(4,()=>{bb(P.glass,0,8.3,-10.08,7.3,.7,.05);for(const x of[-3.96,3.96])bb(P.glass,x,8.3,-11.4,.05,.7,2.2);for(const y of[3.7,4.7,6.2])bb(P.glass,0,y,-9.78,5.4,.4,.05)});
 const r=prng(3),bz=[-7.4,-3.25,.9,5.05];for(let iz=0;iz<4;iz++)for(let ix=0;ix<3;ix++){const n=(ix===1&&iz>1)?2:2+Math.floor(r()*1.9);for(let k=0;k<n;k++)contI(CC[Math.floor(r()*6)],-2.7+ix*2.7,2.9+k*2.6,bz[iz],3.9)}}

/* ---- extra plant and equipment that only the industrial style has; nothing here is clickable ---- */
function extrasI(k){PID=0;
 const mast=(x,z,h)=>{mt(3,()=>{cyl(P.steel,x,0,z,.22,h,8);bb(P.steel,x,h,z,2.6,.2,.5)});MAT=2;for(const d of[-1,-.35,.35,1])bb(LIT,x+d,h-.25,z,.5,.2,.4);MAT=0};
 const shed=(x,z,w,d,h)=>{bb(P.conc,x,0,z,w+1,.2,d+1);mt(5,()=>{bb(P.white,x,.2,z,w,h,d);roof(P.steel,x,h+.2,z,w+.6,h*.22,d+.6)})};
 const rtg=(x0,x1,z,c)=>{mt(3,()=>{for(const x of[x0,x1]){for(const dz of[-4,4])bb(c,x,1.2,z+dz,.6,10.1,.6);bb(c,x,1.3,z,.5,.5,8.6)}for(const dz of[-1.2,1.2])bb(c,(x0+x1)/2,11.3,z+dz,x1-x0+1.4,.7,.5);bb(P.white,x0+2.5,9.6,z,2,1.6,2);bb(P.dark,(x0+x1)/2,10.6,z,2.2,.7,2.6)});for(const x of[x0,x1])for(const dz of[-4,4])wheelX(x,.75,z+dz,.5,.7)};
 const stacker=(x,z,yaw)=>Tp(x,.25,z,yaw,1,()=>{mt(3,()=>{bb(P.yel,0,.9,0,2.6,1.2,5.4);bb(P.dark,0,2.1,-1.6,2.4,1.3,1.6);Tm(mul(tr(0,4.2,2.2),rX(-.55)),()=>box(P.yel,0,0,0,.7,.7,8));bb(P.dark,0,5.9,5.4,6.2,.25,.8)});mt(4,()=>bb(P.glass,0,2.5,-.3,1.6,1.3,1.4));for(const zz of[1.8,-1.9])for(const xx of[-1.3,1.3])wheelX(xx,.8,zz,.8,.7)});
 const tug=(x,z,yaw)=>Tp(x,-1.5,z,yaw,1,()=>{mt(3,()=>{bb(P.hull,0,-.4,0,3.4,1.6,8);bb(P.red,0,1.2,0,3.5,.25,8.1);bb(P.white,0,1.45,.6,2.4,1.6,2.6);cyl(P.dark,0,3.05,-.2,.3,1.2,8)});mt(4,()=>bb(P.glass,0,2.3,1.92,2.1,.6,.05))});
 if(k===0){ /* farm: irrigation rig, weighbridge, fence, cold store, pump station, solar array, floodlights */
  mt(3,()=>{for(const x of[-227.2,-203.6]){for(const zz of[12.5,15.5])bb(P.steel,x,0,zz,.25,3.4,.25);wheelX(x,.5,11.6,.5,.3);wheelX(x,.5,16.4,.5,.3)}for(const zz of[13.2,14.8])bb(P.steel,-215.4,3.3,zz,23.8,.16,.16);
   for(let x=-226;x<-204;x+=1.9){bb(P.steel,x,3.3,14,.08,.08,1.7);bb(P.dark,x,1.3,14,.05,2,.05)}
   bb(P.dark,-126,.14,30.5,13,.08,3.4);for(let x=-232;x<-176;x+=4)bb(P.steel,x,0,31.2,.1,1.8,.1);bb(P.steel,-204,1.7,31.2,56,.05,.05);bb(P.steel,-204,.9,31.2,56,.03,.03);
   bb(P.blue,-147,0,-27,3.2,2.2,2.6);cyl(P.steel,-147,2.2,-27,.5,.8,8);for(const zz of[-27.6,-26.4])Tm(mul(tr(-150.5,.5,zz),rZ(Math.PI/2)),()=>cyl(P.steel,0,-2.5,0,.22,5,8))});
  shed(-105,-10,10,30,7);mt(3,()=>{for(const zz of[-19,-10,-1])bb(P.dark,-110.06,.2,zz,.1,4.4,5);bb(P.white,-105,8.2,-18,3,1.2,2.2)});
  for(let i=0;i<4;i++)Tm(mul(tr(-145+i*3.4,1.5,-6),rX(-.5)),()=>{mt(4,()=>box(P.glass,0,0,0,3,.1,2));mt(3,()=>box(P.steel,0,-.5,.3,.12,1,.12))});
  for(const[x,z]of[[-149.5,-3],[-120,22],[-175,-36]])mast(x,z,11)}
 if(k===1||k===2){const s=k===1?-1:1,q=k===1?-70:70;
  for(let z=-34;z<40;z+=4.5)Tm(mul(tr(q-s*.2,-.7,z),rX(Math.PI/2)),()=>cyl(P.dark,0,-.9,0,.55,1.8,8));
  if(k===1){ /* export port: yard gantry, reach stacker, tug, light masts, tanks, gate */
   rtg(-111.6,-94.4,-17,P.yel);stacker(-86,24,2.2);tug(-48,-34,.6);for(const[x,z]of[[-112,-34],[-112,38],[-76,38],[-78,-34]])mast(x,z,17);
   mt(3,()=>{for(const[x,z]of[[-142,-42],[-151,-44],[-146,-52]])cyl(P.white,x,0,z,4,6.5,16);bb(P.steel,-92,5.2,30,9,.4,3);for(const x of[-96.2,-87.8])bb(P.steel,x,0,30,.3,5.2,.3);bb(P.white,-96.6,.2,28,1.6,2.4,1.6)})}
  else{ /* UK port: yard gantry, reach stacker, tug, light masts, container scanner at customs */
   rtg(83.6,97.4,-28,P.blue);stacker(88,8,-1);tug(46,-32,2.4);for(const[x,z]of[[114,-34],[114,38],[76,38],[78,-34]])mast(x,z,17);
   mt(3,()=>{for(const z of[-19.4,-12.6])bb(P.white,104,.25,z,7,5.2,.7);bb(P.white,104,5.45,-16,7,.8,7.5);bb(P.yel,104,5.2,-16,7.04,.25,7.54);bb(P.dark,104,.26,-16,9,.04,4)});MAT=2;bb([.3,.9,1],104,5.3,-16,.3,.12,5);MAT=0}}
 if(k===3){ /* warehouse and QC: portal frames, sprinklers, dock leveller, barriers, roller conveyor, inspection booth, plant */
  mt(3,()=>{for(let x=127;x<=165;x+=9.5){for(const z of[-23.4,23.6])bb(P.steel,x,.25,z,.35,7.2,.35);for(const sg of[-1,1])Tm(mul(tr(x,8.2,sg*11.75),rX(sg*.065)),()=>box(P.steel,0,0,0,.3,.4,23.6));bb(P.red,x+1.2,7.1,0,.1,.1,46)}
   bb(P.red,146,7.1,-6,38,.14,.14);bb(P.steel,151,.14,27.2,7,.1,2.2);for(const x of[146.6,155.4])bb(P.yel,x,.14,26.4,.3,1,.3);
   for(let x=126;x<137;x+=2.5)bb(P.yel,x,.27,23,.12,1,.12);bb(P.yel,131,1.1,23,10.2,.1,.1);
   for(let x=172;x<=186;x+=.7)Tm(mul(tr(x,1.23,13),rX(Math.PI/2)),()=>cyl(P.steel,0,-.7,0,.1,1.4,6));for(const z of[12.2,13.8])bb(P.steel,179,1.25,z,15,.3,.06);
   for(const z of[11.6,14.4])bb(P.steel,179,.27,z,.2,3.6,.2);bb(P.steel,179,3.8,13,2.4,.25,3);bb(P.white,190.4,.25,-2,1.6,1.4,2.6);bb(P.white,180,7.4,-22,2.4,1,1.6)});
  MAT=2;for(let x=131.75;x<165;x+=9.5)for(const z of[-12,0,12])bb(LIT,x,6.9,z,1.4,.12,.5);bb([.9,.97,1],179,3.75,13,2,.06,2.6);MAT=0}
 if(k===4){ /* supermarket: dock canopy, condensers, chillers, parking bays, trolley bay, sign */
  mt(3,()=>{for(const z of[9.5,18.5])for(const x of[196.8,203.2])bb(P.steel,x,.1,z,.25,5.4,.25);bb(P.steel,200,5.5,14,7.4,.25,10);bb(P.dark,205.6,.25,14,.12,4,5);
   for(let i=0;i<3;i++){bb(P.white,214+i*8.5,.25,-21.5,3,1.8,1.6);cyl(P.dark,214+i*8.5,2.05,-21.5,.6,.1,10);bb(P.white,214+i*8.5,.25,-15.6,6.4,2.6,1.6)}
   for(let x=209;x<234;x+=3.6)bb(P.white,x,.215,28,.12,.02,5);for(const x of[236,239.5])bb(P.steel,x,.1,27,.1,1.3,.1);bb(P.steel,237.75,1.4,27,3.6,.08,.08);for(let i=0;i<4;i++)bb(P.steel,236.6+i*.7,.4,26.6,.5,.5,.8);
   bb(P.steel,246,0,29,.4,7,.4)});mt(4,()=>{for(let i=0;i<3;i++)bb(P.glass,214+i*8.5,.9,-14.78,6,1.8,.05)});MAT=2;bb(P.melY,246,7,29,2.6,2.2,.4);MAT=0}}
