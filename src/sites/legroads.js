'use strict';
/* ================= roads along the lorry legs =================
   Each site has its own fixed road, but the lorry's leg (globe.js) leaves it wherever the validated road route demands, and that part
   differs with every manifest. Here the leg's own path (the same points the lorry drives) is laid as road inside each site it crosses,
   with the existing road builder, so the lorry is always on a road and the road bends with the route. Rebuilt whenever a leg's path
   changes (a new manifest, a route arriving), with the old buffers freed. Not for the vessel or for legs whose route is unvalidated. */
const LRMOV=[],LRKEY=[],LRPTS=[[],[],[],[],[]];
function legRoadMovers(){for(let k=0;k<5;k++)LRMOV[k]=mover(k,0,()=>{for(const pts of LRPTS[k])if(pts.length>1)smoothRoad(pts,5)},()=>{})}
/* one continuous road surface along a centreline: Catmull-Rom through the points, sampled about every unit, a strip of constant width
   with its edges offset along the averaged normal, curb faces down to the ground, and (Industrial) edge lines that follow the same curve
   just above the surface, so there are no seams, overlapping boxes or crossing markings at bends */
function smoothRoad(pts,w){const P0=[pts[0]];for(const p of pts)if(Math.hypot(p[0]-P0[P0.length-1][0],p[1]-P0[P0.length-1][1])>.6)P0.push(p);if(P0.length<2)return;
 const c=smooth(P0.map(p=>[p[0],0,p[1]]),3).map(p=>[p[0],p[2]]),n=c.length,N=c.map((p,i)=>{const a=c[Math.max(0,i-1)],b=c[Math.min(n-1,i+1)],dx=b[0]-a[0],dz=b[1]-a[1],l=Math.hypot(dx,dz)||1;return[-dz/l,dx/l]});
 const Y=.22,off=(i,d,y)=>[c[i][0]+N[i][0]*d,y,c[i][1]+N[i][1]*d],strip=(d0,d1,y,col)=>{C=col;for(let i=0;i<n-1;i++)Q(off(i,d0,y),off(i+1,d0,y),off(i+1,d1,y),off(i,d1,y),[0,1,0])};
 strip(-w/2,w/2,Y,P.asph);C=shade(P.asph,.8);for(const s of[-1,1])for(let i=0;i<n-1;i++){const a=off(i,s*w/2,Y),b=off(i+1,s*w/2,Y),a0=off(i,s*w/2,.02),b0=off(i+1,s*w/2,.02);Q(a0,b0,b,a,[N[i][0]*s,0,N[i][1]*s])}
 if(IND&&w>=4)for(const s of[-1,1])strip(s*(w/2-.42),s*(w/2-.28),Y+.012,P.white)}
/* every stretch of a leg path inside site k (the route can leave a site and come back in), in site coordinates, a point every ~2.5 units */
function legRoadIn(k,P){const S=SITES[k],runs=[];let o=null;for(const q of P){const g=ull(q),p=siteOfGeo(k,g[0],g[1]);if(Math.hypot(p[0]-S.c[0],p[1]-S.c[1])>S.r1+6){o=null;continue}
  if(!o){o=[];runs.push(o)}if(!o.length||Math.hypot(p[0]-o[o.length-1][0],p[1]-o[o.length-1][1])>=2.5)o.push(p)}return runs}
function legRoadsTick(){if(!LRMOV.length||!ROUTES.length)return;let ch=false;
 for(const r of[0,2,3]){const L=LEGS[r];if(!ROUTES[r]||ROUTES[r].length<2)continue;legBuild(L);const key=routeOK(r)?L.poly:null;if(LRKEY[r]!==key||LRKEY['p'+r]!==L.poly){LRKEY[r]=key;LRKEY['p'+r]=L.poly;ch=true}}
 if(!ch)return;for(const a of LRPTS)a.length=0;
 /* one road per site along the lorry's whole path through it: facility road, join and route alike, so nothing is laid twice. An unvalidated
    leg gets road only along its two site paths (the part between is not a real road) */
 for(const r of[0,2,3]){const L=LEGS[r];if(!ROUTES[r]||ROUTES[r].length<2)continue;legBuild(L);const P=L.poly,sec=L.cut.sec,parts=LRKEY[r]?[P]:[P.slice(0,sec[0]),P.slice(P.length-sec[4])];
  for(const part of parts){LRPTS[L.dk].push(...legRoadIn(L.dk,part));LRPTS[L.ak].push(...legRoadIn(L.ak,part))}}
 const cur=BUILD;for(const o of LRMOV)for(const name of Object.keys(o.meshes)){setBuild(name);V=[];PID=0;MOVB=true;MAT=0;SW=0;XF=null;MEL.T=[];o.build();const old=o.meshes[name];o.meshes[name]=upload(V);if(old&&old.b)gl.deleteBuffer(old.b);melTake()}
 MOVB=false;PID=0;MAT=0;SW=0;V=[];setBuild(cur)}
