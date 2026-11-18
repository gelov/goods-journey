'use strict';
/* ================= supermarket interior =================
   The shop floor inside the existing building (x 206.3 to 239.7, z -17.7 to 21.7), laid out like a real store:
   chilled cabinets along the back wall, two rows of double-sided grocery aisles, a bakery on the west wall, drinks fridges on the
   east wall, fruit and vegetable islands with a watermelon bin in front, the two melon displays (world.js, unchanged: the tracked
   melon ends on the first), and three checkout lanes by the entrance. Everything here is neutral; the retailer's colours and
   signs sit on top of it (brand.js). Products are low-poly and part of the site mesh, so the whole floor is one draw. */
const STORE={aisles:[-11.2,-5.2],gx:[214.5,223,231.5],gl:7,beams:[-14.2,-8.2,-2.2],lanes:[229.8,233.3,236.8],veg:[212.5,15],fruit:[220,15]};
function storeInterior(){const r=prng(31),pick=a=>a[Math.floor(r()*a.length)];
 const BOXC=[[.85,.25,.2],[.95,.75,.2],[.25,.45,.75],[.3,.62,.35],[.9,.55,.2],[.6,.35,.65],[.92,.9,.82],[.2,.6,.65]],TINC=[[.75,.2,.18],[.25,.5,.3],[.85,.7,.25],[.3,.35,.7]],BOTC=[[.2,.45,.25],[.55,.15,.15],[.85,.85,.9],[.95,.6,.15],[.25,.4,.75]];
 /* floor tiles: a faint grid on the shop floor */
 const ln=shade(P.floor,.9);for(let x=208;x<240;x+=2)bb(ln,x,.27,2,.04,.006,39.4);for(let z=-17;z<22;z+=2)bb(ln,223,.27,z,33.4,.006,.04);
 /* ceiling beams over the aisles, resting on the side walls, with light strips under them */
 for(const z of STORE.beams){bb(P.steel,223,5.0,z,33.4,.18,.2);MAT=2;for(let x=209;x<238;x+=7)bb([1,.98,.9],x+2,4.9,z,4.4,.1,.3);MAT=0}
 /* --- grocery gondolas: double-sided, four shelves a side, stocked with boxes, tins, jars and bottles, price strips on every edge --- */
 const item=(x,y,z,kind,s)=>{if(kind===0){const h=.4+r()*.2;bb(pick(BOXC),x,y,z,.3,h,.2*s)}else if(kind===1){const c=pick(TINC);cyl(c,x,y,z,.085,.2,6);cyl(P.steel,x,y+.2,z,.085,.015,6)}
  else if(kind===2){const c=pick(BOTC);cyl(c,x,y,z,.07,.3,6);cyl(c,x,y+.3,z,.03,.1,5)}else{cyl([.85,.55,.3],x,y,z,.09,.16,6);cyl(P.dark,x,y+.16,z,.092,.03,6)}};
 for(const az of STORE.aisles)for(const[g,gx]of STORE.gx.entries()){const L=STORE.gl,D=1.6;bb(P.white,gx,.27,az,L,.32,D);bb(P.white,gx,.27,az,L,2.55,.12);for(const e of[-1,1])bb(P.white,gx+e*L/2,.27,az,.08,2.55,D);
  for(let l=0;l<4;l++){const y=.59+l*.56;for(const sd of[-1,1]){const sz=az+sd*D/4;bb(P.steel,gx,y,sz,L-.1,.04,D/2-.08);bb([.96,.96,.93],gx,y-.08,az+sd*(D/2-.03),L-.12,.09,.025);
   const kind=(g+l+(sd>0?0:2)+(az>-8?1:0))%4,step=kind===0?.34:.2;for(let x=gx-L/2+.25;x<gx+L/2-.15;x+=step)if(r()>.06)item(x,y+.04,sz+sd*.08,kind,1)}}}
 /* --- chilled cabinets along the back wall: shelves of milk, yoghurt, cheese and juice behind glass --- */
 const fridge=(x0,x1,zb,face)=>{const W=x1-x0,cx=(x0+x1)/2,d=1.25,zf=zb+face*d,zc=zb+face*d/2;bb(P.white,cx,.27,zc,W,.42,d);bb(P.white,cx,2.72,zc,W,.35,d);bb(P.dark,cx,.69,zb+face*.05,W,2.03,.1);
  for(let x=x0;x<=x1+.01;x+=W/4)bb(P.white,x,.27,zc,.08,2.8,d);
  for(let l=0;l<4;l++){const y=.75+l*.5;bb(P.steel,cx,y,zc,W-.1,.03,d-.2);for(let x=x0+.2;x<x1-.1;x+=.22){const k=(l+Math.floor((x-x0)/1.7))%4;
   if(k===0){cyl([.95,.95,.95],x,y+.03,zc,.07,.28,6);cyl([.2,.45,.8],x,y+.31,zc,.04,.05,5)}else if(k===1){cyl(pick([[.95,.85,.9],[.95,.95,.8],[.85,.9,.98]]),x,y+.03,zc,.07,.12,6)}else if(k===2)bb([.96,.8,.3],x,y+.03,zc,.18,.1,.24);else bb(pick([[.95,.6,.15],[.9,.3,.25],[.4,.7,.3]]),x,y+.03,zc,.16,.3,.12)}}
  glassI(()=>{const y0=.69,y1=2.72;Q([face>0?x0:x1,y0,zf],[face>0?x1:x0,y0,zf],[face>0?x1:x0,y1,zf],[face>0?x0:x1,y1,zf],[0,0,face])})};
 fridge(207.6,236.9,-17.7,1);
 /* drinks fridges on the east wall, facing into the store */
 Tp(239.7,0,-8,-Math.PI/2,1,()=>{const x0=-6.4,x1=6.4,d=1.25;bb(P.white,0,.27,d/2,12.8,.42,d);bb(P.white,0,2.72,d/2,12.8,.35,d);bb(P.dark,0,.69,.05,12.8,2.03,.1);for(let x=x0;x<=x1+.01;x+=3.2)bb(P.white,x,.27,d/2,.08,2.8,d);
  for(let l=0;l<4;l++){const y=.75+l*.5;bb(P.steel,0,y,d/2,12.7,.03,d-.2);for(let x=x0+.2;x<x1-.1;x+=.2){const c=pick(BOTC);cyl(c,x,y+.03,d/2,.065,.3,6);cyl(c,x,y+.33,d/2,.03,.07,5)}}
  glassI(()=>Q([x0,.69,d],[x1,.69,d],[x1,2.72,d],[x0,2.72,d],[0,0,1]))});
 /* --- bakery on the west wall: angled racks of loaves, baguettes and rolls --- */
 for(const z of[-14.6,-10.6,-6.6])Tp(206.3,0,z,Math.PI/2,1,()=>{bb(P.wood,0,.27,.75,3.4,.5,1.5);for(const x of[-1.65,1.65])bb(P.steel,x,.27,.75,.06,2.2,1.5);bb(P.steel,0,.27,.08,3.4,2.2,.06);
  for(let l=0;l<3;l++)Tm(mul(tr(0,.95+l*.55,.55+l*-.12),rX(.32)),()=>{bb(P.wood,0,0,.25,3.3,.04,.8);bb(P.wood,0,0,.64,3.3,.12,.03);for(let x=-1.4;x<1.45;x+=l===1?.24:.44){
   if(l===0)Tm(mul(tr(x,.1,.3),sc(1,.75,1.6)),()=>ball([.72,.48,.24],0,0,0,.16,1,6,3));else if(l===1)ball([.82,.6,.32],x,.08,.3,.09,.8,6,3);else Tm(mul(tr(x,.07,.35),rX(Math.PI/2)),()=>cyl([.85,.65,.35],0,-.3,0,.05,.6,5))}})});
 /* --- produce: wooden islands with bins tilted toward each aisle --- */
 const fruitPiece={
  apR:(x,z)=>ball([.78,.12,.12],x,.058,z,.062,.95,6,3),apG:(x,z)=>ball([.55,.78,.25],x,.058,z,.062,.95,6,3),org:(x,z)=>ball([.96,.56,.12],x,.066,z,.066,1,6,3),
  man:(x,z)=>Tm(mul(tr(x,.06,z),sc(1.35,1,1)),()=>ball([.95,.68,.2],0,0,0,.066,.9,6,3)),
  ban:(x,z)=>{for(let k=-1;k<=1;k++)Tm(mul(mul(tr(x,.07,z),rY(k*.25)),rZ(Math.PI/2+k*.12)),()=>cyl([.96,.86,.25],0,-.2,0,.045,.4,5))},
  grp:(x,z)=>{for(let k=0;k<6;k++)ball([.42,.18,.45],x+(k%3-1)*.06,.06+Math.floor(k/3)*.07,z+(k%2)*.05,.05,1,5,2)},
  pin:(x,z)=>{lathe([.8,.6,.22],[[0,0],[.11,.02],[.12,.18],[.09,.3],[0,.31]],x,0,z,7);lathe([.25,.55,.25],[[.08,0],[.0,.2]],x,.3,z,6)},
  car:(x,z)=>Tm(mul(tr(x,.05,z),rX(Math.PI/2)),()=>{lathe([.95,.5,.12],[[0,-.18],[.05,-.14],[.035,.14],[0,.16]],0,0,0,6)}),
  let:(x,z)=>{ball([.45,.72,.3],x,.08,z,.11,.75,7,3);ball([.65,.85,.45],x,.12,z,.07,.8,6,3)},tom:(x,z)=>{ball([.85,.15,.1],x,.05,z,.056,.9,6,3);bb([.3,.5,.2],x,.1,z,.03,.02,.03)},
  cab:(x,z)=>ball([.7,.84,.55],x,.1,z,.11,.9,7,3),bro:(x,z)=>{cyl([.55,.72,.4],x,0,z,.025,.1,5);for(let k=0;k<4;k++)ball([.2,.45,.2],x+(k%2-.5)*.06,.12,z+(k>1?.035:-.035),.05,.9,5,2)},
  pep:(x,z)=>{ball(pick([[.85,.12,.1],[.95,.8,.15],[.3,.6,.2]]),x,.066,z,.06,1.1,6,3);bb([.3,.45,.2],x,.13,z,.015,.03,.015)},cuc:(x,z)=>Tm(mul(tr(x,.05,z),rX(Math.PI/2)),()=>cyl([.2,.42,.2],0,-.17,0,.05,.34,6)),
  pot:(x,z)=>Tm(mul(tr(x,.04,z),sc(1.2,1,1)),()=>ball([.66,.5,.32],0,0,0,.052,.75,6,3))};
 /* spacing per bin, so each kind sits snugly at its own size (melons and watermelons are larger: world.js MELR) */
 const SP={apR:.135,apG:.135,org:.14,man:.17,ban:.42,grp:.2,pin:.3,car:.14,let:.23,tom:.12,cab:.24,bro:.17,pep:.13,cuc:.12,pot:.12};
 const island=([cx,cz],kinds)=>{bb(P.wood,cx,.27,cz,5.4,.75,3.2);bb(shade(P.wood,.85),cx,1.02,cz,5.5,.06,3.3);
  kinds.forEach((kd,i)=>{const sd=i<4?-1:1,bx=cx-2.02+(i%4)*1.35;Tm(mul(tr(bx,1.08,cz+sd*.78),rX(sd*.3)),()=>{const w=1.25,d=1.35;bb(P.wood,0,0,0,w,.05,d);for(const e of[-1,1]){bb(P.wood,e*w/2,0,0,.04,.16,d);bb(P.wood,0,0,e*d/2,w,.16,.04)}
   const s=SP[kd];for(let x=-w/2+s/2+.04;x<w/2-s/3;x+=s)for(let z=-d/2+s/2+.04;z<d/2-s/3;z+=s*.95)fruitPiece[kd](x+(r()-.5)*.03,z+(r()-.5)*.03)})})};
 island(STORE.veg,['car','let','tom','cab','bro','pep','cuc','pot']);island(STORE.fruit,['apR','apG','org','man','ban','grp','pin','pin']);
 /* watermelons in a deep crate in front of the islands */
 bb(P.wood,211.5,.27,7,2.6,.8,2.2);for(let i=0;i<4;i++)for(let k=0;k<4;k++)Tm(mul(tr(210.45+i*.7,1.07+.2,6.05+k*.62),sc(1.3,1,1)),()=>ball((i+k)%2?[.18,.42,.2]:[.22,.48,.24],0,0,0,.23,.85,8,3));
 /* --- checkout lanes: counter, conveyor, scanner, POS screen and card reader, bagging shelf --- */
 for(const x of STORE.lanes){bb(P.white,x,.27,14.4,1.2,.95,4);bb(P.dark,x,1.22,13.4,.95,.04,2.2);bb(P.steel,x,1.22,15.9,1.2,.06,1);bb(P.dark,x+.3,1.22,14.75,.4,.12,.4);
  bb(P.dark,x+.45,1.26,15.1,.08,.5,.08);Tm(mul(tr(x+.45,1.8,15.1),rX(-.3)),()=>box(P.dark,0,0,0,.4,.3,.04));MAT=2;Tm(mul(tr(x+.45,1.8,15.12),rX(-.3)),()=>box([.55,.8,1],0,0,0,.34,.24,.01));MAT=0;bb(P.dark,x-.35,1.22,15.0,.12,.2,.08)}
 /* baskets stacked at the lanes, trolleys parked inside the entrance */
 for(const x of[228.3,238.6])for(let k=0;k<4;k++){bb([.2,.55,.3],x,.27+k*.13,18.6,.7,.24,.45);bb(P.dark,x,.52+k*.13,18.6,.72,.02,.04)}
 for(let i=0;i<5;i++)Tp(208.4+i*.62,0,20.3,0,1,()=>{for(const x of[-.3,.3])bb(P.steel,x,.55,.1,.03,.55,1.1);bb(P.steel,0,.55,-.42,.62,.55,.03);bb(P.steel,0,.55,.62,.62,.55,.03);bb(P.steel,0,.55,.1,.62,.03,1.1);
  bb(P.steel,0,.25,.1,.5,.03,.9);for(const z of[-.35,.55])for(const x of[-.22,.22])cyl(P.dark,x,.27,z,.05,.06,5);bb(P.dark,0,1.15,-.55,.62,.05,.05)});
 /* small promotional stand: boxes stacked on the brand-coloured plinth (brand.js) */
 for(let i=0;i<3;i++)for(let k=0;k<2;k++)bb(pick(BOXC),233.1+i*.4-.4,1.17+k*.42,4+k*.1,.34,.4,.6)}
