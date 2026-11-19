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
/* ---- travel legs: one vehicle from its departure site, along the route, into the arrival site ----
   Each leg is a single path on the globe: the departure site's road or channel, the route, the arrival site's approach.
   One clock moves the vehicle along it without stopping (speeding up as it leaves, slowing as it arrives), and one draw
   (render.js) shows it the whole way, so the camera can zoom out and in while it keeps moving. The vehicle's copies inside the
   sites are hidden while the leg runs; the site movers use the same easing (ein / eout) so their matrices match. */
const ein=x=>x*x,eout=x=>1-(1-x)*(1-x);
const gAt=(i,t)=>{let g=t;for(let j=0;j<i;j++)g+=SCRIPT[j].dur;return g},gNow=()=>gAt(STATE.idx,STATE.t);
const LEGS=[{r:0,dm:()=>LORF,am:()=>LORP,dj:[-137,31.4],aj:[-92,26],dk:0,dp:()=>RDF,d:[1,19.5,25.5],dy:.12,ak:1,ap:()=>RDP,a:[2,1,6.5],ay:.12,mesh:()=>LORF},
 {r:1,dm:()=>SHBR,am:()=>SHUK,dk:1,dp:()=>SBR,d:[2,20.6,26],dy:-1.5,ak:2,ap:()=>SUK,a:[4,.5,9],ay:-1.5,mesh:()=>SHBR,ship:true},
 {r:2,dm:()=>LORU,am:()=>LORW,dj:[113,24],aj:[156.5,29.5],dk:2,dp:()=>RDU,d:[5,11.3,17.5],dy:.3,ak:3,ap:()=>RWA,a:[6,1,6.5],ay:.12,mesh:()=>LORW},
 {r:3,dm:()=>LORW,am:()=>LORS,dj:[147.5,29.5],aj:[200,28],dk:3,dp:()=>RWD,d:[9,4,11.5],dy:.12,ak:4,ap:()=>RSM,a:[9,16.5,22],ay:.12,mesh:()=>LORS}];
const LEGON=[false,false,false,false];
function legBuild(L){const R=ROUTES[L.r];if(L.R===R&&L.poly&&L.sty===STYLE)return L;L.R=R;L.sty=STYLE;
 const toU=(k,pa)=>pa.pts.map(p=>{const g=geoOf(k,p[0],p[2]);return llu(g[0],g[1])}),n=R.length,ang=(p,q)=>Math.acos(clamp(dot(p,q),-1,1)),dir=(a,b)=>nrm(sub(b,a));
 const cD=llu(SITES[L.dk].g[0],SITES[L.dk].g[1]),cA=llu(SITES[L.ak].g[0],SITES[L.ak].g[1]),near=.32*RAD;
 /* water test from the coarse mask the sea routing uses (0 land, 1 open water, 2 coastal water, cells about 28 km): a vessel may not
    touch land, a lorry may not run over open water. Within about 35 km of a port the mask is too coarse to judge, so that is allowed. */
 const wet=q=>{if(typeof LMASK==='undefined'||!LMASK)return null;const g=ull(q);return LMASK[lmIdx(g[0],g[1])]},bad=q=>{if(ang(q,cD)<near||ang(q,cA)<near)return false;const w=wet(q);return w!=null&&(L.ship?w===0:w===1)},okPath=P=>!P.some(bad);
 /* A site unit is about 510 m, so a site's own road or channel can run 60 to 90 km out, far enough to cross a real coastline (a port's
    approach channel from Dover reaching France). The leg keeps each site path up to the first point where it would go somewhere its
    vehicle cannot (counted outward from the quay or farm), and lets the validated route carry the vehicle from there. */
 const Df=toU(L.dk,L.dp()),Af=toU(L.ak,L.ap());let de=1;while(de<Df.length-1&&!bad(Df[de+1]))de++;let as=Af.length-2;while(as>0&&!bad(Af[as-1]))as--;
 /* a lorry leaves its site where the facility road reaches the site's edge road (dj) and arrives where that road turns in (aj): the site's
    old through-road is gone, and the road out to the route is generated along the leg itself (legroads.js). Unvalidated routes keep the
    whole site path, so the lorry at least stays on its site road. */
 const okR=typeof routeOK!=='function'||routeOK(L.r),nearPt=(pa,c)=>{let bi=0,bd=1e9;pa.pts.forEach((p,i)=>{const d=Math.hypot(p[0]-c[0],p[2]-c[1]);if(d<bd){bd=d;bi=i}});return bi};
 if(okR&&L.dj)de=Math.max(1,Math.min(de,nearPt(L.dp(),L.dj)));if(okR&&L.aj)as=Math.min(Af.length-2,Math.max(as,nearPt(L.ap(),L.aj)));
 const kr=(L.ship?10:5)/RS,cand=(a,b,c,r,q)=>{const o=[];for(let j=a;j<=b;j++)if(ang(R[j],c)>=r)o.push(j);return o.sort((u,v)=>ang(R[u],q)-ang(R[v],q)).slice(0,16)},tR=j=>dir(R[Math.max(0,j-1)],R[Math.min(n-1,j+1)]);
 /* joins: from the end of the kept site path to a route point outside that site path's reach (nearest first to a point lined up with
    the road), by the shortest drivable path (dubins, below). If none passes the water test, the site path is cut back further toward
    the quay or farm and tried again: close in, inside the port's own zone, a clean join always exists */
 const stepD=Math.max(1,Math.round(de/24)),stepA=Math.max(1,Math.round((Af.length-1-as)/24));let J0=null,i0=-1,J1=null,i1=-1;
 /* among the candidates, the join that makes the whole drive shortest (join plus the rest of the route) is tried first, so the road never
    loops to reach a nearer point */
 const rc=[0];for(let j=1;j<n;j++)rc.push(rc[j-1]+ang(R[j-1],R[j]));const allIn=(a,b,c,r)=>{const o=[];for(let j=a;j<=b;j++)if(ang(R[j],c)>=r)o.push(j);return o};
 for(let d=de;d>=1&&!J0;d-=stepD){const De=Df[d],t=dir(Df[d-1],De),r=ang(cD,De);const C=allIn(0,Math.floor((n-1)*.6),cD,r).map(j=>[j,dubins(De,t,R[j],tR(j),kr,true)+rc[n-1]-rc[j]]).sort((u,v)=>u[1]-v[1]).slice(0,16);
  for(const[j]of C){const P=dubins(De,t,R[j],tR(j),kr);if(okPath(P)){J0=P;i0=j;de=d;break}}}
 if(!J0){i0=0;while(i0<n-2&&ang(R[i0],cD)<ang(cD,Df[de]))i0++;J0=dubins(Df[de],dir(Df[de-1],Df[de]),R[i0],tR(i0),kr)}
 for(let a=as;a<=Af.length-2&&!J1;a+=stepA){const A0=Af[a],t=dir(A0,Af[a+1]),r=ang(cA,A0);const C=allIn(Math.min(n-1,i0+1),n-1,cA,r).map(j=>[j,rc[j]-rc[i0]+dubins(R[j],tR(j),A0,t,kr,true)]).sort((u,v)=>u[1]-v[1]).slice(0,16);
  for(const[j]of C){const P=dubins(R[j],tR(j),A0,t,kr);if(okPath(P)){J1=P;i1=j;as=a;break}}}
 if(!J1){i1=n-1;while(i1>i0+1&&ang(R[i1],cA)<ang(cA,Af[as]))i1--;J1=dubins(R[i1],tR(i1),Af[as],dir(Af[as],Af[as+1]),kr)}
 const D=Df.slice(0,de+1),A=Af.slice(as);
 L.cut={de,as,nD:Df.length,nA:Af.length,sec:[D.length,J0.length,i1-i0+1,J1.length,A.length]};
 let poly=[...D,...J0,...R.slice(i0,i1+1),...J1,...A];
 /* inside the farm, port, warehouse and supermarket, the stretch between the facility road and the site's built-up edge is re-planned
    round the buildings (siteroute.js); the lorry and the generated road (legroads.js) both follow the result */
 if(!L.ship&&okR&&typeof siteDetour==='function'){const loc=(k,q)=>{const g=ull(q);return siteOfGeo(k,g[0],g[1])},geo=(k,p)=>{const g=geoOf(k,p[0],p[1]);return llu(g[0],g[1])},hd=(k,p,q)=>{const u=loc(k,p),v=loc(k,q),l=Math.hypot(v[0]-u[0],v[1]-u[1])||1;return[(v[0]-u[0])/l,(v[1]-u[1])/l]};
  const out=(k,q)=>{const S=SITES[k],p=loc(k,q);return Math.hypot(p[0]-S.c[0],p[1]-S.c[1])>S.r0-8};let dEnd=D.length;
  {const k=L.dk;let e=D.length;while(e<poly.length-A.length&&!out(k,poly[e]))e++;if(e<poly.length-A.length-1){const P=siteDetour(k,loc(k,D[D.length-1]),hd(k,D[D.length-2],D[D.length-1]),loc(k,poly[e]),hd(k,poly[e],poly[e+1]));
   if(P){const mid=P.slice(1,-1).map(p=>geo(k,p));poly=[...poly.slice(0,D.length),...mid,...poly.slice(e)];dEnd=D.length+mid.length}}}
  {const k=L.ak,a0=poly.length-A.length;let e=a0-1;while(e>dEnd&&!out(k,poly[e]))e--;
   /* sites close together (the whole route inside both): start from the first point past the departure detour that this site's grid covers */
   if(e<=dEnd){e=Math.max(dEnd,1);const S=SITES[k];while(e<a0-1){const p=loc(k,poly[e]);if(Math.hypot(p[0]-S.c[0],p[1]-S.c[1])<S.r0-2)break;e++}}
   if(e>=dEnd&&e<a0-1){const P=siteDetour(k,loc(k,poly[e]),hd(k,poly[e-1],poly[e]),loc(k,A[0]),hd(k,A[0],A[1]));
   if(P){const mid=P.slice(1,-1).map(p=>geo(k,p));poly=[...poly.slice(0,e+1),...mid,...poly.slice(a0)]}}}}
 const cum=[0];for(let i=1;i<poly.length;i++)cum.push(cum[i-1]+ang(poly[i-1],poly[i]));
 L.poly=poly;L.cum=cum;L.Ld=cum[D.length-1];L.La=cum[cum.length-1]-cum[poly.length-A.length];L.i0=i0;L.i1=i1;
 /* cruise speed where the vehicle leaves one site and enters the next: no faster than either site path allows (from rest) and no faster
    than the route's average, so a short road never makes it stop halfway; the site paths' end slopes (bd, ba) are set to meet it */
 const Td=L.d[2]-L.d[1],Ta=L.a[2]-L.a[1],T=gAt(L.a[0],L.a[1])-gAt(L.d[0],L.d[2]),Lr=cum[cum.length-1]-L.Ld-L.La;
 L.vc=Math.min(2*L.Ld/Td,2*L.La/Ta,Lr/T);L.bd=L.vc*Td/L.Ld;L.ba=L.vc*Ta/L.La;return L}
/* ease from rest to slope b at x=1 (b=2 is x*x); the arrival is its mirror */
const fB=(x,b)=>(3-b)*x*x+(b-2)*x*x*x,legE=(r,ph,x)=>{const L=LEGS[r];if(!ROUTES[r]||ROUTES[r].length<2)return ph==='d'?ein(x):eout(x);legBuild(L);return ph==='d'?fB(x,L.bd):1-fB(1-x,L.ba)};
function legAt(L,s){const c=L.cum,P=L.poly;s=clamp(s,0,c[c.length-1]);let i=1;while(i<c.length-1&&c[i]<s)i++;const f=clamp((s-c[i-1])/Math.max(1e-12,c[i]-c[i-1]),0,1),a=P[i-1],b=P[i];return nrm([lerp(a[0],b[0],f),lerp(a[1],b[1],f),lerp(a[2],b[2],f)])}
/* distance along the leg (radians) at global time g: ease in over the departure path, a Hermite curve over the route starting and
   ending at the cruise speed, ease out over the arrival path */
function legS(L,g){legBuild(L);const G0=gAt(L.d[0],L.d[1]),G1=gAt(L.d[0],L.d[2]),G2=gAt(L.a[0],L.a[1]),G3=gAt(L.a[0],L.a[2]),tot=L.cum[L.cum.length-1],Lr=tot-L.Ld-L.La;
 if(g<=G0)return 0;if(g<G1)return L.Ld*fB((g-G0)/(G1-G0),L.bd);if(g>=G3)return tot;if(g>=G2)return L.Ld+Lr+L.La*(1-fB(1-(g-G2)/(G3-G2),L.ba));
 const T=G2-G1,x=(g-G1)/T,m0=L.vc*T,m1=L.vc*T,x2=x*x,x3=x2*x;return L.Ld+(x3-2*x2+x)*m0+(-2*x3+3*x2)*Lr+(x3-x2)*m1}
/* heading from the path a little either side: tight on the site roads, wider out on the route so turns there are gentle */
function legPose(L){const g=gNow(),s=legS(L,g),q=legAt(L,s),tot=L.cum[L.cum.length-1],fr=(L.ship?60:25)/RS,far=ss(0,1,(s-L.Ld)/fr)*ss(0,1,(tot-L.La-s)/fr),w=lerp(L.ship?9:3.5,L.ship?40:14,far)/RS,a=legAt(L,s-w),b=legAt(L,s+w),G1=gAt(L.d[0],L.d[2]),G2=gAt(L.a[0],L.a[1]);
 return{q,g:ull(q),t:sub(b,a),y:g<G1?L.dy:g>=G2?L.ay:lerp(L.dy,L.ay,(g-G1)/(G2-G1)),ru:L.R.length>1?clamp((L.i0+(s-L.Ld)/Math.max(1e-9,L.cum[L.cum.length-1]-L.Ld-L.La)*(L.i1-L.i0))/(L.R.length-1),0,1):0}}
/* the shortest drivable path between two poses on the globe with a minimum turning radius (a Dubins path: turn, straight or turn, turn).
   Worked in a flat frame tangent at the start (the joins are short next to the Earth), sampled and put back on the sphere.
   At most one turn at each end, so no circling, no cusp and no reversal. */
function dubins(P0,t0,P1,t1,rho,lenOnly){const up=Math.abs(P0[1])<.99?[0,1,0]:[1,0,0],e=nrm(cross(up,P0)),nn=cross(P0,e),to2=p=>[dot(p,e),dot(p,nn)],hd=t=>Math.atan2(dot(t,nn),dot(t,e)),TAU=2*Math.PI,md=x=>((x%TAU)+TAU)%TAU;
 const q1=to2(P1),th0=hd(t0),th1=hd(t1),dx=q1[0],dy=q1[1],d=Math.hypot(dx,dy)/rho,ph=Math.atan2(dy,dx),a=md(th0-ph),b=md(th1-ph),sa=Math.sin(a),sb=Math.sin(b),ca=Math.cos(a),cb=Math.cos(b),cab=Math.cos(a-b),C=[];
 let t2=2+d*d-2*cab+2*d*(sa-sb);if(t2>=0){const at=Math.atan2(cb-ca,d+sa-sb);C.push(['LSL',md(-a+at),Math.sqrt(t2),md(b-at)])}
 t2=2+d*d-2*cab+2*d*(sb-sa);if(t2>=0){const at=Math.atan2(ca-cb,d-sa+sb);C.push(['RSR',md(a-at),Math.sqrt(t2),md(-b+at)])}
 t2=-2+d*d+2*cab+2*d*(sa+sb);if(t2>=0){const p=Math.sqrt(t2),at=Math.atan2(-ca-cb,d+sa+sb)-Math.atan2(-2,p);C.push(['LSR',md(-a+at),p,md(-md(b)+at)])}
 t2=-2+d*d+2*cab-2*d*(sa+sb);if(t2>=0){const p=Math.sqrt(t2),at=Math.atan2(ca+cb,d-sa-sb)-Math.atan2(2,p);C.push(['RSL',md(a-at),p,md(b-at)])}
 t2=(6-d*d+2*cab+2*d*(sa-sb))/8;if(Math.abs(t2)<=1){const p=md(TAU-Math.acos(t2)),t=md(a-Math.atan2(ca-cb,d-sa+sb)+p/2);C.push(['RLR',t,p,md(a-b-t+p)])}
 t2=(6-d*d+2*cab+2*d*(sb-sa))/8;if(Math.abs(t2)<=1){const p=md(TAU-Math.acos(t2)),t=md(-a-Math.atan2(ca-cb,d+sa-sb)+p/2);C.push(['LRL',t,p,md(md(b)-a-t+p)])}
 if(!C.length)return lenOnly?9:[];C.sort((u,v)=>(u[1]+u[2]+u[3])-(v[1]+v[2]+v[3]));if(lenOnly)return(C[0][1]+C[0][2]+C[0][3])*rho;const [w,...L]=C[0],tot=L[0]+L[1]+L[2],N=Math.max(8,Math.ceil(tot*rho/(1.2/RS))),o=[];
 let x=0,y=0,th=th0;const step=tot/N;let seg=0,left=L[0];for(let i=0;i<N-1;i++){let r=step;while(r>1e-12&&seg<3){const dd=Math.min(r,left),c=w[seg];
   if(c==='S'){x+=rho*dd*Math.cos(th);y+=rho*dd*Math.sin(th)}else if(c==='L'){x+=rho*(Math.sin(th+dd)-Math.sin(th));y+=rho*(-Math.cos(th+dd)+Math.cos(th));th+=dd}else{x+=rho*(-Math.sin(th-dd)+Math.sin(th));y+=rho*(Math.cos(th-dd)-Math.cos(th));th-=dd}
   r-=dd;left-=dd;if(left<=1e-12){seg++;left=L[seg]||0}}o.push(nrm(P0.map((v,j)=>v+x*e[j]+y*nn[j])))}
 return o}
/* the yellow line: the leg's path resampled evenly (the full path has thousands of points; the ribbon buffer holds a few thousand for all) */
function legRib(L){legBuild(L);if(L.rib&&L.ribOf===L.poly)return L.rib;const n=220,tot=L.cum[L.cum.length-1],o=[];for(let i=0;i<=n;i++)o.push(legAt(L,tot*i/n));L.ribOf=L.poly;return L.rib=o}
/* how far along its path (as a fraction of the path's points) the leg's vehicle is now: 0 before it leaves, 1 once it has arrived */
function legFrac(L){legBuild(L);return clamp(legS(L,gNow())/L.cum[L.cum.length-1],0,1)}
/* the leg running now, if any (from the moment its vehicle leaves until it has stopped at the far site) */
function activeLeg(){const g=gNow();for(const L of LEGS)if(g>=gAt(L.d[0],L.d[1])&&g<gAt(L.a[0],L.a[2]))return L;return null}
/* after the movers update: hide the site copies of the travelling vehicle (and what rides on it), and note which leg runs */
/* site coordinates of a point on the globe (the inverse of geoOf) */
function siteOfGeo(k,lon,lat){const S=SITES[k],c=Math.cos(S.rot||0),sn=Math.sin(S.rot||0),E=(lon-S.g[0])*RAD*RS*Math.cos(lat*RAD),Nn=(S.g[1]-lat)*RAD*RS;return[S.c[0]+c*E-sn*Nn,S.c[1]+sn*E+c*Nn]}
function legPost(){const L=activeLeg();for(let r=0;r<4;r++)LEGON[r]=!!L&&L.r===r;if(!L)return;for(const m of MOV)if(m.leg!=null&&(Array.isArray(m.leg)?m.leg.includes(L.r):m.leg===L.r))m.vis=false;
 /* the vehicle's site copy (hidden) stands where the travelling vehicle is, so the camera, labels and anything riding on it stay with it */
 const g=gNow(),arr=g>=gAt(L.a[0],L.a[1]),o=arr?L.am():L.dm(),k=arr?L.ak:L.dk,s=legS(L,g),q=legAt(L,s),b=legAt(L,s+(L.ship?9:3.5)/RS),gq=ull(q),gb=ull(b),p=siteOfGeo(k,gq[0],gq[1]),pb=siteOfGeo(k,gb[0],gb[1]),P=legPose(L);
 setM(o,p[0],P.y+(L.ship?Math.sin(T*1.1)*.12:0),p[1],Math.atan2(pb[0]-p[0],pb[1]-p[1]),1)}
const MKU=[0,1,2,3].map(r=>()=>{const L=LEGS[r],g=gNow();if(g<gAt(L.d[0],L.d[2]))return 0;if(g>=gAt(L.a[0],L.a[1]))return 1;return legPose(L).ru});
/* the camera target for a leg: where its vehicle is */
const RT=r=>()=>legPose(LEGS[r]).g;
/* the vehicle drawn on the map; none on a leg whose route could not be validated */
function activeMarker(){const L=activeLeg();return L?L.r:-1}
let RN=[0,0,0];
function buildRibbons(){const A=RARR,E=X.eyeG;let i=0;
 const rib=(pts,lift,p0,p1,col,wk,al)=>{const n=pts.length-1;let pl=null,pr=null,pt=0;for(let j=Math.floor(p0*n);j<=Math.ceil(p1*n);j++){const p=pts[j],t=nrm(sub(pts[Math.min(n,j+1)],pts[Math.max(0,j-1)])),s=nrm(cross(p,t)),h=1.0008+lift*Math.sin(j/n*Math.PI),w=wk*Math.hypot(E[0]-p[0],E[1]-p[1],E[2]-p[2]),L=[p[0]*h+s[0]*w,p[1]*h+s[1]*w,p[2]*h+s[2]*w],Rr=[p[0]*h-s[0]*w,p[1]*h-s[1]*w,p[2]*h-s[2]*w],tt=j/n;
   if(pl&&i<A.length-48)for(const[v,q]of[[pl,pt],[pr,pt],[Rr,tt],[pl,pt],[Rr,tt],[L,tt]]){A[i++]=v[0];A[i++]=v[1];A[i++]=v[2];A[i++]=col[0];A[i++]=col[1];A[i++]=col[2];A[i++]=al;A[i++]=q}pl=L;pr=Rr;pt=tt}};
 /* the yellow line is the leg's own path (site road, route, arrival approach), so it shows exactly where the vehicle goes */
 /* no line for a leg whose route could not be validated: it would show a path the vehicle cannot really take */
 for(let r=0;r<4;r++){if(typeof routeOK==='function'&&!routeOK(r))continue;const L=LEGS[r],P=legRib(L),u=legFrac(L);if(u>0)rib(P,0,0,u,DCOL.y,.0017,.95);if(u<1)rib(P,0,u,1,DCOL.y,.0012,-.5)}RN[0]=i/8;
 if(VIEW.data)for(let r=0;r<4;r++)rib(ROUTES[r],0,0,1,DCOL.d,.0007,.95);RN[1]=i/8;
 if(VIEW.data&&STATE.idx===8){const t=tau(8),a=u01(t,5.5,10),b=u01(t,10,14.5);if(a>0)rib(ARCS[0],.2,0,a,DCOL.c,.0016,.95);if(b>0)rib(ARCS[1],.13,0,b,DCOL.g,.0016,.95)}RN[2]=i/8;
 gl.bindBuffer(gl.ARRAY_BUFFER,RVBO);gl.bufferData(gl.ARRAY_BUFFER,A.subarray(0,i),gl.DYNAMIC_DRAW)}
