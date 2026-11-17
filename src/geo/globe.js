'use strict';
/* ================= globe: mesh, texture, routes ================= */
let GMESH,GTEX,RVBO,RARR=new Float32Array(8*6*4200);
function buildGlobe(){const N=192,M=96,a=[];const pt=(i,j)=>llu(-180+360*i/N,-90+180*j/M);
 for(let j=0;j<M;j++)for(let i=0;i<N;i++){const A=pt(i,j),B=pt(i+1,j),Cc=pt(i+1,j+1),D=pt(i,j+1);a.push(...A,...B,...Cc,...A,...Cc,...D)}
 GMESH={b:gl.createBuffer(),n:a.length/3};gl.bindBuffer(gl.ARRAY_BUFFER,GMESH.b);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(a),gl.STATIC_DRAW);RVBO=gl.createBuffer();
 /* fallback map drawn from coarse outlines, replaced by earth.jpg when it loads */
 const LAND=[[[-80,9],[-77,8],[-72,12],[-62,10.5],[-52,5],[-50,0],[-44,-2.5],[-35,-5.5],[-35,-9],[-39,-17],[-41,-22],[-48,-28],[-53,-34],[-57,-38],[-62,-39],[-65,-45],[-68,-52],[-72,-53],[-74,-45],[-73,-37],[-71,-30],[-70,-18],[-76,-14],[-81,-5],[-80,0]],
  [[-165,62],[-160,70],[-120,70],[-85,70],[-78,62],[-64,60],[-55,52],[-66,45],[-75,36],[-81,25],[-90,30],[-97,26],[-97,18],[-87,21],[-83,10],[-78,8],[-85,12],[-95,16],[-105,20],[-112,30],[-123,38],[-125,48],[-135,58],[-150,60]],
  [[-9,37],[-9,43],[-1,44],[-4,48],[2,51],[8,54],[9,57],[5,59],[6,62],[14,68],[26,71],[40,67],[40,48],[30,45],[27,41],[22,37],[19,42],[14,45],[16,39],[12,44],[8,44],[3,43],[0,39],[-5,36]],
  [[-17,15],[-16,22],[-10,29],[-6,35.5],[10,37],[20,32],[32,31],[35,28],[43,12],[51,11],[42,-1],[40,-15],[35,-24],[27,-34],[19,-34.5],[12,-17],[9,-1],[5,5],[-8,4.5],[-13,8]],
  [[40,67],[70,73],[110,74],[140,72],[170,68],[160,60],[140,50],[130,42],[122,30],[108,20],[105,10],[98,8],[92,22],[80,8],[72,20],[60,25],[50,30],[36,36],[27,41],[30,45],[40,48]],
  [[114,-22],[122,-18],[131,-12],[142,-11],[153,-27],[146,-39],[131,-32],[115,-34]],[[-5.5,50],[1,51],[1.6,52.8],[-0.3,54.5],[-2,57.7],[-5,58.6],[-6,56.5],[-3,54],[-4.6,53.2],[-3,51.5]],[[-10,51.5],[-6,52],[-5.5,54.5],[-8,55.3],[-10,54]],[[-55,60],[-42,60],[-22,70],[-20,80],[-45,83],[-60,76],[-52,68]]];
 const c=document.createElement('canvas');c.width=2048;c.height=1024;const x=c.getContext('2d'),g=x.createLinearGradient(0,0,0,1024);g.addColorStop(0,'#2a5f8f');g.addColorStop(.5,'#1d4f80');g.addColorStop(1,'#2a5f8f');x.fillStyle=g;x.fillRect(0,0,2048,1024);
 x.fillStyle='#5f9a52';x.strokeStyle='#8fbf78';x.lineWidth=3;x.lineJoin='round';for(const q of LAND){x.beginPath();q.forEach((p,i)=>x[i?'lineTo':'moveTo']((p[0]+180)/360*2048,(90-p[1])/180*1024));x.closePath();x.fill();x.stroke()}
 x.fillStyle='#eef2f4';x.fillRect(0,0,2048,56);x.fillRect(0,970,2048,54);
 GTEX=gl.createTexture();const put=src=>{gl.bindTexture(gl.TEXTURE_2D,GTEX);gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,false);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGB,gl.RGB,gl.UNSIGNED_BYTE,src);gl.generateMipmap(gl.TEXTURE_2D);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR_MIPMAP_LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.REPEAT);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
  const e=gl.getExtension('EXT_texture_filter_anisotropic');if(e)gl.texParameterf(gl.TEXTURE_2D,e.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(8,gl.getParameter(e.MAX_TEXTURE_MAX_ANISOTROPY_EXT)))};
 put(c);const im=new Image();im.onload=()=>{setTimeout(()=>{if(typeof buildLandMask==='function')buildLandMask(im)},50);try{const mx=gl.getParameter(gl.MAX_TEXTURE_SIZE);if(im.width>mx){const d=document.createElement('canvas');d.width=mx;d.height=mx/2;d.getContext('2d').drawImage(im,0,0,d.width,d.height);put(d)}else put(im)}catch(e){put(c)}};im.src=CONFIG.earthTexture}
/* routes: unit vectors along the globe. Road routes are straight-ish illustrative lines, not real roads. */
function routePts(w,n){const s=smooth(w.map(p=>[p[0],p[1],0]),Math.ceil(n/(w.length-1)));return s.map(p=>llu(p[0],p[1]))}
const mid=(a,b,o)=>[(a[0]+b[0])/2+o[0],(a[1]+b[1])/2+o[1]];
const slerp=(a,b,t)=>{const w=Math.acos(clamp(dot(a,b),-1,1)),s=Math.sin(w)||1,k0=Math.sin((1-t)*w)/s,k1=Math.sin(t*w)/s;return[a[0]*k0+b[0]*k1,a[1]*k0+b[1]*k1,a[2]*k0+b[2]*k1]};
const arcPts=(a,b)=>{const A=llu(a[0],a[1]),B=llu(b[0],b[1]),o=[];for(let i=0;i<=100;i++)o.push(slerp(A,B,i/100));return o};
/* the four legs between the five sites. geo[r].pts (from the manifest) is used when given; otherwise a road leg is a gentle
   straight-ish line and the sea leg a great-circle line. ROUTESRC says which, so the UI never calls a made-up line the real route. */
let ROUTES=[],ARCS=[],ROUTESRC=[];
function buildRoutes(geo){const G=SITES.map(S=>S.g);ROUTES=[0,1,2,3].map(r=>{const a=G[r],b=G[r+1],c=geo&&geo[r];ROUTESRC[r]=c&&c.pts?c.source:'straight';
  if(c&&c.pts)return routePts([a,...c.pts,b],r===1?160:60);
  if(r===1){const A=llu(a[0],a[1]),B=llu(b[0],b[1]),o=[];for(let i=0;i<=160;i++)o.push(slerp(A,B,i/160));return o}
  return routePts([a,mid(a,b,[r?.1:-.14,r===3?-.04:.06]),b],60)});
 ARCS=[arcPts(G[3],G[0]),arcPts(G[0],G[3])]}
buildRoutes([null,{pts:[[-36.5,-.5],[-28,13],[-19,29],[-13,42],[-7.5,48.2],[-2.5,49.9]],source:'illustrative'}]);
/* position on a route, and a point a little further along it for the heading. The heading is taken across a short stretch
   either side, and continues past the end, so the vehicle never spins when it reaches a stop or crosses a sharp kink. */
function routeQ(r,u){const p=ROUTES[r],x=clamp(u,0,1)*(p.length-1),i=Math.min(p.length-2,Math.floor(x)),f=x-i,a=p[i],b=p[i+1];return nrm([lerp(a[0],b[0],f),lerp(a[1],b[1],f),lerp(a[2],b[2],f)])}
function routeAt(r,u){u=clamp(u,0,1);const q=routeQ(r,u),d=4/(ROUTES[r].length-1),a=routeQ(r,Math.max(0,u-d)),b=routeQ(r,Math.min(1,u+d)),t=sub(b,a);return{q,g:ull(q),nx:nrm([q[0]+t[0],q[1]+t[1],q[2]+t[2]])}}
const MKU=[()=>io(u01(tau(1),23.5,32.5)),()=>io(u01(tau(3),.5,21)),()=>io(u01(tau(5),15,24)),()=>io(u01(tau(9),9.5,17))];
const RT=r=>()=>routeAt(r,MKU[r]()).g;
/* the vehicle drawn on the map; none on a leg whose route could not be validated */
function activeMarker(){const i=STATE.idx,t=STATE.t,m=i===1&&t>=21.5?0:i===3?1:i===5&&t>=13.5?2:i===9&&t>=8.5&&t<18.5?3:-1;return m>=0&&typeof routeOK==='function'&&!routeOK(m)?-1:m}
let RN=[0,0,0];
function buildRibbons(){const A=RARR,E=X.eyeG;let i=0;
 const rib=(pts,lift,p0,p1,col,wk,al)=>{const n=pts.length-1;let pl=null,pr=null,pt=0;for(let j=Math.floor(p0*n);j<=Math.ceil(p1*n);j++){const p=pts[j],t=nrm(sub(pts[Math.min(n,j+1)],pts[Math.max(0,j-1)])),s=nrm(cross(p,t)),h=1.0008+lift*Math.sin(j/n*Math.PI),w=wk*Math.hypot(E[0]-p[0],E[1]-p[1],E[2]-p[2]),L=[p[0]*h+s[0]*w,p[1]*h+s[1]*w,p[2]*h+s[2]*w],Rr=[p[0]*h-s[0]*w,p[1]*h-s[1]*w,p[2]*h-s[2]*w],tt=j/n;
   if(pl&&i<A.length-48)for(const[v,q]of[[pl,pt],[pr,pt],[Rr,tt],[pl,pt],[Rr,tt],[L,tt]]){A[i++]=v[0];A[i++]=v[1];A[i++]=v[2];A[i++]=col[0];A[i++]=col[1];A[i++]=col[2];A[i++]=al;A[i++]=q}pl=L;pr=Rr;pt=tt}};
 for(let r=0;r<4;r++){const u=typeof routeOK==='function'&&!routeOK(r)?0:MKU[r]();if(u>0)rib(ROUTES[r],0,0,u,DCOL.y,.0017,.95);if(u<1)rib(ROUTES[r],0,u,1,DCOL.y,.0012,-.5)}RN[0]=i/8;
 if(VIEW.data)for(let r=0;r<4;r++)rib(ROUTES[r],0,0,1,DCOL.d,.0007,.95);RN[1]=i/8;
 if(VIEW.data&&STATE.idx===8){const t=tau(8),a=u01(t,5.5,10),b=u01(t,10,14.5);if(a>0)rib(ARCS[0],.2,0,a,DCOL.c,.0016,.95);if(b>0)rib(ARCS[1],.13,0,b,DCOL.g,.0016,.95)}RN[2]=i/8;
 gl.bindBuffer(gl.ARRAY_BUFFER,RVBO);gl.bufferData(gl.ARRAY_BUFFER,A.subarray(0,i),gl.DYNAMIC_DRAW)}
