'use strict';
/* ================= model kit ================= */
let R=prng(7);
function tree(x,z,s){s=s||1;return IND?treeI(x,z,s):treeD(x,z,s)}
function conifer(x,z,s){s=s||1;return IND?coniferI(x,z,s):coniferD(x,z,s)}
function palm(x,z,s){s=s||1;return IND?palmI(x,z,s):palmD(x,z,s)}
function plant(x,z,kind){return IND?plantI(x,z,kind):plantD(x,z,kind)}
function plot(x0,z0,x1,z1,kind,dx,dz){if(IND)plotI(x0,z0,x1,z1,dx);else plotD(x0,z0,x1,z1,dx);bb(P.bed,(x0+x1)/2,0,(z0+z1)/2,x1-x0,.18,z1-z0);for(let x=x0+1.5;x<x1-.8;x+=dx||2.9)for(let z=z0+1.3;z<z1-.8;z+=dz||2.3){const px=x+(R()-.5)*.3,pz=z+(R()-.5)*.3;if(IND)plant(px,pz,kind);else Tp(0,.3,0,0,1,()=>plant(px,pz,kind))}}
function mound(x,z,r,n,side,top,step){for(let k=0;k<n;k++){const rr=r-k*(step||3.4),y=k*1.5;if(IND){lathe(side,[[rr,y],[rr-.25,y+1.4]],x,0,z,28,1);lathe(top,[[rr-.25,y+1.4],[rr-.6,y+1.5],[0,y+1.5]],x,0,z,28)}
 else{lathe(P.soilD,[[rr+.2,y],[rr,y+.55]],x,0,z,32,1);lathe(side,[[rr,y+.55],[rr-.2,y+1.3]],x,0,z,32,1);lathe(top,[[rr-.05,y+1.25],[rr-.2,y+1.5],[rr-.7,y+1.5],[0,y+1.5]],x,0,z,32)}}}
function house(x,z,yaw,w,d,h,wc,rc){return IND?houseI(x,z,yaw,w,d,h):houseD(x,z,yaw,w,d,h,wc,rc)}
/* people: the shared worker model in people.js, in every style */
function person(shirt,hat,role){workerFull(lookFor(shirt,hat,role))}
const guy=(x,z,yaw,shirt,hat,role)=>Tp(x,0,z,yaw,1.35,()=>person(shirt,hat,role));
function wheelX(x,y,z,r,w){Tm(mul(tr(x,y,z),rZ(Math.PI/2)),()=>cyl(P.tyre,0,-w/2,0,r,w,10))}
/* vehicles, cargo and lamps use the detailed models in kit-industrial.js in both styles; only the palette differs */
const lorry=(cab,bx,band,open)=>lorryI(cab,bx,band,open),forklift=nf=>forkliftI(nf),cont=(c,x,y0,z,L)=>contI(c,x,y0,z,L||8),pallet=(x,y0,z,lv,open,tag)=>palletI(x,y0,z,lv,open,tag),crate=(x,y0,z,full)=>crateI(x,y0,z,full),lamp=(x,z,h)=>lampI(x,z,h);
function road(pts,w,c){roadI(pts,w);for(let i=0;i<pts.length-1;i++){const a=pts[i],b=pts[i+1],dx=b[0]-a[0],dz=b[1]-a[1],l=Math.hypot(dx,dz);Tm(mul(tr((a[0]+b[0])/2,0,(a[1]+b[1])/2),rY(Math.atan2(dx,dz))),()=>bb(c||P.asph,0,.02,0,w,.2,l+w*.5))}}
function slab(x0,x1,z0,z1,top){const cx=(x0+x1)/2,cz=(z0+z1)/2,w=x1-x0,d=z1-z0;bb(top,cx,-.7,cz,w,.7,d);bb(P.soil,cx,-4.6,cz,w,3.9,d);bb(P.soilD,cx,-8,cz,w,3.4,d)}
const crane=(x0,z,dir,c)=>craneI(x0,z,dir,c),shipModel=()=>shipI();
