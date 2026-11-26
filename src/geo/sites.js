'use strict';
/* ================= sites & geography =================
   Every location is its own 3D site, placed on the globe at the coordinates of the active manifest
   (CONFIG.geo is only the fallback used if no manifest can be loaded).
   One camera pose (lon, lat, heading, pitch, distance) drives everything: far away it shows the globe,
   close up it shows the site standing on the globe's surface. No scene switching. */
const RAD=Math.PI/180,RS=12500,LMIN=Math.log(14),LMAX=Math.log(60000);
const SITES=[
 {n:'Melon farm',c:[-172,0],g:CONFIG.geo.farm,r0:140,r1:200,st:0},
 {n:'Export port',c:[-84,0],g:CONFIG.geo.brPort,r0:130,r1:185,st:2,sea:[-70,1],rot:.785},
 {n:'UK port',c:[92,0],g:CONFIG.geo.ukPort,r0:130,r1:185,st:4,sea:[70,-1],rot:2.356},
 {n:'Warehouse & QC',c:[156,0],g:CONFIG.geo.wh,r0:105,r1:150,st:6},
 {n:'Supermarket',c:[222,0],g:CONFIG.geo.sm,r0:90,r1:130,st:10}];
SITES.forEach((s,k)=>s.k=k);
/* set by applyManifest: camera way-points on the globe, and the big country labels */
const VIEWS={start:[-54,-14],approach:[-45,-9],claimA:[-30,22],claimB:[-8,30]},LBL=[];
let CUR=0;const VV=SITES.map(()=>[]);const site=k=>{CUR=k;V=VV[k];PID=0;MAT=0;SW=0};
const llu=(lon,lat)=>{const a=lon*RAD,b=lat*RAD;return[Math.cos(b)*Math.sin(a),Math.sin(b),Math.cos(b)*Math.cos(a)]};
const ull=p=>[Math.atan2(p[0],p[2])/RAD,Math.asin(clamp(p[1],-1,1))/RAD];
function Qm(lon,lat){const a=lon*RAD,b=lat*RAD,sl=Math.sin(a),cl=Math.cos(a),sp=Math.sin(b),cp=Math.cos(b),m=I();m[0]=cl;m[4]=0;m[8]=-sl;m[1]=cp*sl;m[5]=sp;m[9]=cp*cl;m[2]=sp*sl;m[6]=-cp;m[10]=sp*cl;return m}
const tp=m=>{const o=I();for(let i=0;i<3;i++)for(let j=0;j<3;j++)o[i*4+j]=m[j*4+i];return o};
const xp=(m,p)=>[m[0]*p[0]+m[4]*p[1]+m[8]*p[2]+m[12],m[1]*p[0]+m[5]*p[1]+m[9]*p[2]+m[13],m[2]*p[0]+m[6]*p[1]+m[10]*p[2]+m[14]];
const f32=m=>new Float32Array(m);
function geoOf(k,x,z){const S=SITES[k],dx=x-S.c[0],dz=z-S.c[1],c=Math.cos(S.rot||0),s=Math.sin(S.rot||0),lat=S.g[1]-(-s*dx+c*dz)/RS/RAD;return[S.g[0]+(c*dx+s*dz)/(RS*Math.cos(lat*RAD))/RAD,lat]}
const angd=(a,b)=>Math.acos(clamp(dot(llu(a[0],a[1]),llu(b[0],b[1])),-1,1));
const ss=(a,b,x)=>{const t=clamp((x-a)/(b-a),0,1);return t*t*(3-2*t)};
