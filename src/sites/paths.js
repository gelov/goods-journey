'use strict';
/* ================= paths ================= */
function mkPath(pts){const cum=[0];let L=0;for(let i=1;i<pts.length;i++){L+=Math.hypot(pts[i][0]-pts[i-1][0],pts[i][1]-pts[i-1][1],pts[i][2]-pts[i-1][2]);cum.push(L)}return{pts,cum,len:L}}
function pAt(p,u){const d=clamp(u,0,1)*p.len,c=p.cum;let i=1;while(i<c.length-1&&c[i]<d)i++;const s=clamp((d-c[i-1])/Math.max(1e-6,c[i]-c[i-1]),0,1),a=p.pts[i-1],b=p.pts[i];return[lerp(a[0],b[0],s),lerp(a[1],b[1],s),lerp(a[2],b[2],s),Math.atan2(b[0]-a[0],b[2]-a[2])]}
/* pose on a path with the heading taken from the direction of travel over a short stretch either side of the point.
   Every vehicle uses this, so corners turn smoothly and a vehicle that has stopped keeps the heading it arrived with. */
function pathPose(p,u,w,loop){const h=(w||1.8)/p.len,f=x=>loop?((x%1)+1)%1:clamp(x,0,1),a=pAt(p,f(u-h)),b=pAt(p,f(u+h)),c=pAt(p,u);return[c[0],c[1],c[2],Math.atan2(b[0]-a[0],b[2]-a[2])]}
function smooth(pts,n){const o=[];for(let i=0;i<pts.length-1;i++){const p0=pts[Math.max(0,i-1)],p1=pts[i],p2=pts[i+1],p3=pts[Math.min(pts.length-1,i+2)];for(let k=0;k<n;k++){const t=k/n,t2=t*t,t3=t2*t;o.push(p1.map((_,j)=>.5*((2*p1[j])+(-p0[j]+p2[j])*t+(2*p0[j]-5*p1[j]+4*p2[j]-p3[j])*t2+(-p0[j]+3*p1[j]-3*p2[j]+p3[j])*t3)))}}o.push(pts[pts.length-1]);return o}
function arc(a,b,lift,n){const o=[];for(let k=0;k<=n;k++){const t=k/n;o.push([lerp(a[0],b[0],t),lerp(a[1],b[1],t)+Math.sin(t*Math.PI)*lift,lerp(a[2],b[2],t)])}return o}
const xz=(a)=>a.map(p=>[p[0],0,p[1]]);

/* Catmull-Rom smoothing overshoots where a short segment meets a long one: the curve bulges backwards and a vehicle on it
   loops round. Long segments are split into even pieces first, so the curve stays on the drawn line and only rounds the corners. */
function even(pts,max){const o=[pts[0]];for(let i=1;i<pts.length;i++){const a=pts[i-1],b=pts[i],n=Math.max(1,Math.ceil(Math.hypot(b[0]-a[0],b[1]-a[1])/max));for(let k=1;k<=n;k++)o.push([lerp(a[0],b[0],k/n),lerp(a[1],b[1],k/n)])}return o}
const P2=(pts,n)=>mkPath(smooth(xz(even(pts,4)),n||6));
const RDF=P2([[-128,30.5],[-132.5,30.5],[-137,31.4],[-142,34.6],[-148,36],[-246,36]]),RDP=P2([[-176,36],[-98,36],[-92.5,33],[-92,26],[-92,6]]),
 SBR=P2([[-62,-12],[-62,1],[-56,14],[-38,25],[0,29],[80,30]],10),SUK=P2([[-80,30],[0,29],[38,25],[56,14],[62,1],[62,-12]],10),
 RDU=P2([[113,11],[113,24],[115,31],[122,34],[250,34]]),RWA=P2([[264,34],[174,34],[167,33.2],[161,30.4],[156.5,29.5],[152,29.5]]),RWD=P2([[152,29.5],[147.5,29.5],[143,30.4],[137,33.2],[130,34],[22,34]]),
 RSM=P2([[112,34],[190,34],[197,33],[200,28],[200,15]]),
 /* the same static roads driven the other way: leaving the farm eastward, reaching the supermarket from the east (legs pick the shorter) */
 RDF_E=P2([[-124,30.5],[-119.5,30.5],[-115,31.4],[-110,34.6],[-104,36],[4,36]]),RSM_E=P2([[332,34],[210,34],[203,33],[200,28],[200,15]]);
