'use strict';
/* ================= model kit ================= */
const R=prng(7);
function tree(x,z,s){s=s||1;cyl(P.trunk,x,0,z,.32*s,2.4*s,6);SW=.7;ball(P.leaf,x,3.5*s,z,1.9*s,.9);ball(P.leaf2,x+.95*s,2.9*s,z+.35*s,1.3*s);ball(P.leaf3,x-.8*s,3*s,z-.45*s,1.35*s);SW=0}
function conifer(x,z,s){s=s||1;cyl(P.trunk,x,0,z,.28*s,1.2*s,6);SW=.4;lathe(P.leaf,[[1.7*s,1],[.9*s,3.2*s],[1.2*s,3.2*s],[0,6*s]],x,0,z,8);SW=0}
function palm(x,z,s){s=s||1;lathe(P.trunk,[[.34*s,0],[.24*s,3*s],[.2*s,5.6*s],[0,5.7*s]],x,0,z,6);SW=1;for(let k=0;k<6;k++)Tm(mul(mul(tr(x,5.5*s,z),rY(k/6*TAU+x)),mul(rZ(-.38),mul(tr(1.5*s,0,0),sc(1.7*s,.22*s,.6*s)))),()=>ball(k%2?P.leaf2:P.leaf,0,0,0,1,1,6,3));SW=0}
function plant(x,z,kind){SW=.5;ball(kind===2?P.leaf3:P.leaf,x,.42,z,1.05,.5,6,3);if(kind===2)ball(P.leaf2,x+.3,.8,z-.2,.5,.7,5,3);SW=0;if(kind<2)ball(kind?P.melG:P.melY,x+.55,.48,z+.5,.5,.9,6,3)}
function plot(x0,z0,x1,z1,kind,dx,dz){bb(P.bed,(x0+x1)/2,0,(z0+z1)/2,x1-x0,.18,z1-z0);for(let x=x0+1.5;x<x1-.8;x+=dx||2.9)for(let z=z0+1.3;z<z1-.8;z+=dz||2.3)plant(x+(R()-.5)*.3,z+(R()-.5)*.3,kind)}
function mound(x,z,r,n,side,top,step){for(let k=0;k<n;k++){const rr=r-k*(step||3.4),y=k*1.5;lathe(side,[[rr,y],[rr-.25,y+1.4]],x,0,z,28,1);lathe(top,[[rr-.25,y+1.4],[rr-.6,y+1.5],[0,y+1.5]],x,0,z,28)}}
function house(x,z,yaw,w,d,h,wc,rc){Tp(x,0,z,yaw,1,()=>{bb(wc,0,0,0,w,h,d);roof(rc,0,h,0,w+1,h*.62,d+1);bb(P.trunk,0,0,d/2+.03,1.2,2,.1);bb(P.glass,-w/3,h*.45,d/2+.03,1,1,.1);bb(P.glass,w/3,h*.45,d/2+.03,1,1,.1)})}
function person(shirt,hat){bb(P.dark,0,0,0,.6,.9,.45);lathe(shirt,[[.42,.9],[.5,1.5],[.36,2.1],[0,2.15]],0,0,0,8);ball(P.skin,0,2.5,0,.4);if(hat){cyl(hat,0,2.72,0,.78,.08,10);ball(hat,0,2.82,0,.36,.7,8,3)}}
const guy=(x,z,yaw,shirt,hat)=>Tp(x,0,z,yaw,1.35,()=>person(shirt,hat));
function wheelX(x,y,z,r,w){Tm(mul(tr(x,y,z),rZ(Math.PI/2)),()=>cyl(P.tyre,0,-w/2,0,r,w,10))}
function lorry(cab,bx,band){bb(P.dark,0,.7,0,2.2,.4,9);bb(bx,0,1.1,-1.3,2.7,3,6.2);bb(band,0,2.2,-1.3,2.76,.7,6.24);bb(cab,0,1.1,3.3,2.6,2.5,2.2);bb(P.glass,0,2.25,4.42,2.2,1.05,.06);bb(P.glass,1.31,2.3,3.5,.04,.9,1.2);bb(P.glass,-1.31,2.3,3.5,.04,.9,1.2);for(const z of[3.3,-.8,-3.2])for(const x of[-1.25,1.25])wheelX(x,.6,z,.62,.5)}
function forklift(){bb(P.yel,0,.45,-.4,1.5,1.05,2.3);bb(P.dark,0,1.5,-1.2,1.3,.9,.6);for(const x of[-.6,.6]){bb(P.dark,x,.25,.85,.13,3.3,.13);bb(P.steel,x*.75,.3,1.75,.16,.1,1.7)}bb(P.dark,0,3.25,-.35,1.5,.1,1.9);for(const x of[-.7,.7])for(const z of[-1.2,.5])bb(P.dark,x,1.5,z,.09,1.8,.09);for(const z of[.4,-1.1])for(const x of[-.8,.8])wheelX(x,.4,z,.42,.3);ball(P.orange,0,3.5,-.9,.2)}
function cont(c,x,y0,z,L){L=L||8;bb(c,x,y0,z,2.6,2.6,L);const d=shade(c,.82);for(let k=0;k<5;k++)bb(d,x,y0+.15,z-L/2+(k+.5)*L/5,2.68,2.3,.2)}
function pallet(x,y0,z,lv,open,tag){bb(P.wood,x,y0,z,2.3,.25,2.3);for(let l=0;l<lv;l++)for(const i of[-.57,.57])for(const k of[-.57,.57])bb(l%2?P.card2:P.card,x+i,y0+.25+l*.85,z+k,1.08,.8,1.08);const ty=y0+.25+lv*.85;
 if(open)for(const i of[-.57,.57])for(const k of[-.57,.57])ball((i*k>0)?P.melY:P.melG,x+i,ty+.2,z+k,.45,.9,6,3);if(tag){MAT=2;bb(tag,x,ty+(open?.7:.1),z,.7,.35,.7);MAT=0}}
function crate(x,y0,z,full){bb(P.crate,x,y0,z,1.5,.9,1.1);bb(shade(P.crate,.8),x,y0+.3,z,1.56,.14,1.16);if(full)for(const i of[-.4,.4])ball(i>0?P.melY:P.melG,x+i,y0+.95,z,.42,.9,6,3)}
function lamp(x,z,h){cyl(P.steel,x,0,z,.1,h||5,5);MAT=2;ball([1,.95,.75],x,(h||5)+.2,z,.32,1,6,3);MAT=0}
function road(pts,w,c){for(let i=0;i<pts.length-1;i++){const a=pts[i],b=pts[i+1],dx=b[0]-a[0],dz=b[1]-a[1],l=Math.hypot(dx,dz);Tm(mul(tr((a[0]+b[0])/2,0,(a[1]+b[1])/2),rY(Math.atan2(dx,dz))),()=>bb(c||P.asph,0,.02,0,w,.2,l+w*.5))}}
function slab(x0,x1,z0,z1,top){const cx=(x0+x1)/2,cz=(z0+z1)/2,w=x1-x0,d=z1-z0;bb(top,cx,-.7,cz,w,.7,d);bb(P.soil,cx,-4.6,cz,w,3.9,d);bb(P.soilD,cx,-8,cz,w,3.4,d)}
function crane(x0,z,dir,c){for(const dx of[0,-7*dir])for(const dz of[-3.4,3.4])bb(c,x0+dx,0,z+dz,.7,14,.7);for(const dz of[-3.4,3.4]){bb(c,x0+2*dir,14,z+dz,24,.8,.6);bb(shade(c,.85),x0-3.5*dir,7,z+dz,7.6,.4,.4)}bb(c,x0-9.6*dir,14,z,.8,.8,7.4);bb(c,x0+13.6*dir,14,z,.8,.8,7.4);bb(P.white,x0-5*dir,14.8,z,3,2.2,3);bb(P.glass,x0-5*dir,15.3,z+1.52,2.4,1,.06);bb(c,x0-3.5*dir,14.8,z,.7,6,.7);MAT=2;ball([1,.4,.3],x0-3.5*dir,21,z,.3,1,6,3);MAT=0}
function shipModel(){ // facing +z, y=0 at the waterline
 bb(P.hullR,0,-1.6,-1,7.6,1.3,26);bb(P.hull,0,-.3,-1,8,3,26);C=P.hull;
 Q([-4,-.3,12],[-4,2.7,12],[0,2.7,18],[0,-.3,18],nrm([-6,0,4]));Q([4,2.7,12],[4,-.3,12],[0,-.3,18],[0,2.7,18],nrm([6,0,4]));C=P.concD;tri([-4,2.7,12],[4,2.7,12],[0,2.7,18],[0,1,0]);
 C=P.hullR;Q([-3.8,-1.6,12],[-3.8,-.3,12],[0,-.3,17.4],[0,-1.6,17.4],nrm([-6,0,4]));Q([3.8,-.3,12],[3.8,-1.6,12],[0,-1.6,17.4],[0,-.3,17.4],nrm([6,0,4]));
 bb(P.concD,0,2.7,-1,7.6,.15,26);bb(P.white,0,2.8,-11.5,6.6,5.2,3.4);bb(P.glass,0,6.6,-9.78,6,.9,.06);bb(P.white,0,8,-11.5,7.6,.3,4);bb(P.orange,0,8.3,-12,1.6,2.4,1.6);bb(P.dark,0,10.7,-12,1.7,.4,1.7);
 const r=prng(3);for(let iz=0;iz<2;iz++)for(let ix=0;ix<3;ix++){const n=1+Math.floor(r()*2.6);for(let k=0;k<n;k++){if(ix===1&&iz===0&&k>1)continue;cont(CC[Math.floor(r()*6)],-2.7+ix*2.7,2.85+k*2.6,-3.6+iz*8.4)}}}
