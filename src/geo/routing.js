'use strict';
/* ================= routing: roads for lorries, navigable water for vessels =================
   Each of the four legs between the five sites gets a route that is checked before anything moves along it:
   - road legs come from a road-network router (OSRM, CONFIG.routing.roadUrl), or from manifest geometry marked "actual";
   - the sea leg is computed on a water grid built from the Earth texture (A* that keeps off land and away from coasts where it
     can), or comes from manifest geometry once every segment of it has been checked to stay on water.
   A leg that cannot be routed is drawn as a dashed illustrative connection, labelled as such, and no vehicle travels on it.
   Results are cached (memory, and road results in localStorage). In-site vehicles (forklifts, tractor) are "stationary": they
   run on fixed paths inside their 3D site and are not routed. */
const ROUTEINFO=[{},{},{},{}];let ROUTEGEN=0,LMASK=null;
const LM={W:1440,H:720};
const lmIdx=(lon,lat)=>{const x=Math.floor(((lon+180)%360+360)%360/360*LM.W)%LM.W,y=clamp(Math.floor((90-lat)/180*LM.H),0,LM.H-1);return y*LM.W+x};
const lmLL=i=>[(i%LM.W+.5)/LM.W*360-180,90-(Math.floor(i/LM.W)+.5)/LM.H*180];
/* water mask from the day texture: ocean pixels are blue-dominant; ice and land are not. 1 = water, 2 = water next to land */
function buildLandMask(img){try{const c=document.createElement('canvas');c.width=LM.W;c.height=LM.H;const x=c.getContext('2d',{willReadFrequently:true});x.imageSmoothingEnabled=true;x.imageSmoothingQuality='high';x.drawImage(img,0,0,LM.W,LM.H);
  const d=x.getImageData(0,0,LM.W,LM.H).data,m=new Uint8Array(LM.W*LM.H);for(let i=0;i<m.length;i++){const r=d[i*4],g=d[i*4+1],b=d[i*4+2];m[i]=b>r*1.18&&b>g*.92&&!(r>165&&g>165&&b>165)?1:0}
  for(let y=0;y<LM.H;y++)for(let X=0;X<LM.W;X++){const i=y*LM.W+X;if(!m[i])continue;for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){const yy=y+dy;if(yy<0||yy>=LM.H)continue;if(!m[yy*LM.W+(X+dx+LM.W)%LM.W]){m[i]=2;dy=dx=2}}}
  LMASK=m;if(DATA.man)routeManifest(DATA.man)}catch(e){LMASK=null;console.warn('Water mask unavailable: '+e.message)}}
/* does the great-circle segment a-b stay on water? strict: open water only; otherwise coastal water counts too */
/* the last ~35 km into each port (ports, near) may cross the coastline cells; everything else must be water */
function segWater(a,b,strict,ports){const A=llu(a[0],a[1]),B=llu(b[0],b[1]),n=Math.max(2,Math.ceil(angd(a,b)/RAD/.08));for(let k=0;k<=n;k++){const q=ull(slerp(A,B,k/n));if(ports&&ports.some(p=>angd(p,q)<.32*RAD))continue;const v=LMASK[lmIdx(q[0],q[1])];if(!v||(strict&&v===2))return false}return true}
function nearWater(p,max){const i0=lmIdx(p[0],p[1]);if(LMASK[i0])return i0;const x0=i0%LM.W,y0=Math.floor(i0/LM.W);let best=-1,bd=1e9;
 for(let r=1;r<=max;r++){for(let dy=-r;dy<=r;dy++)for(let dx=-r;dx<=r;dx++){if(Math.max(Math.abs(dx),Math.abs(dy))!==r)continue;const y=y0+dy;if(y<0||y>=LM.H)continue;const i=y*LM.W+(x0+dx+LM.W)%LM.W;if(LMASK[i]){const q=dx*dx+dy*dy;if(q<bd){bd=q;best=i}}}if(best>=0)return best}return-1}
/* A* over water cells, 8 neighbours, longitude wraps; coastal cells cost more so the route keeps off the coast when it can */
function seaRoute(a,b){const s=nearWater(a,10),g=nearWater(b,10);if(s<0)return{err:'the departure port is more than about 250 km from open water on the map'};if(g<0)return{err:'the arrival port is more than about 250 km from open water on the map'};
 const N=LM.W*LM.H,G=new Float32Array(N).fill(1e30),from=new Int32Array(N).fill(-1),closed=new Uint8Array(N),cosY=new Float32Array(LM.H);for(let y=0;y<LM.H;y++)cosY[y]=Math.max(.05,Math.cos((90-(y+.5)/LM.H*180)*RAD));
 const gx=g%LM.W,gy=Math.floor(g/LM.W),h=i=>{const x=i%LM.W,y=Math.floor(i/LM.W);let dx=Math.abs(x-gx);dx=Math.min(dx,LM.W-dx);return Math.hypot(dx*cosY[y],y-gy)};
 const heap=[],push=(i,f)=>{heap.push([f,i]);let k=heap.length-1;while(k){const p=(k-1)>>1;if(heap[p][0]<=heap[k][0])break;[heap[p],heap[k]]=[heap[k],heap[p]];k=p}},pop=()=>{const t=heap[0],e=heap.pop();if(heap.length){heap[0]=e;let k=0;for(;;){const l=2*k+1,r=l+1;let m=k;if(l<heap.length&&heap[l][0]<heap[m][0])m=l;if(r<heap.length&&heap[r][0]<heap[m][0])m=r;if(m===k)break;[heap[m],heap[k]]=[heap[k],heap[m]];k=m}}return t};
 G[s]=0;push(s,h(s));let n=0;while(heap.length){const[,i]=pop();if(closed[i])continue;closed[i]=1;if(i===g)break;if(++n>1200000)return{err:'no sea passage was found within the search limit'};const x=i%LM.W,y=Math.floor(i/LM.W);
  for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){if(!dx&&!dy)continue;const yy=y+dy;if(yy<0||yy>=LM.H)continue;const j=yy*LM.W+(x+dx+LM.W)%LM.W,w=LMASK[j];if(!w||closed[j])continue;
   const c=G[i]+Math.hypot(dx*cosY[y],dy)*(w===2?2.5:1);if(c<G[j]){G[j]=c;from[j]=i;push(j,c+h(j))}}}
 if(from[g]<0&&g!==s)return{err:'the two ports are not connected by water on the map'};
 const cells=[];for(let i=g;i>=0;i=from[i])cells.push(i);cells.reverse();const P=cells.map(lmLL);
 /* straighten: keep a point only where the straight line to the next kept point would touch land */
 const out=[P[0]];let k=0;while(k<P.length-1){let j=P.length-1;while(j>k+1&&!segWater(P[k],P[j],false))j--;out.push(P[j]);k=j}
 return{pts:[a,...out,b]}}
/* evenly spaced unit vectors along a lon/lat polyline, following the globe's curvature */
/* drop back-and-forth spurs (a road router sometimes turns round on a dual carriageway near the start or end) */
function despike(P){let o=P.slice(),ch=true;while(ch&&o.length>2){ch=false;for(let i=1;i<o.length-1;i++){const a=o[i-1],b=o[i],c=o[i+1],u=[b[0]-a[0],b[1]-a[1]],v=[c[0]-b[0],c[1]-b[1]],n=Math.hypot(...u)*Math.hypot(...v);if(n>0&&(u[0]*v[0]+u[1]*v[1])/n<-.8){o.splice(i,1);ch=true;break}}}return o}
function resampleGC(pts,n){const V=pts.map(p=>llu(p[0],p[1])),L=[0];for(let i=1;i<V.length;i++)L.push(L[i-1]+Math.acos(clamp(dot(V[i-1],V[i]),-1,1)));const T=L[L.length-1]||1,o=[];let j=1;
 for(let k=0;k<=n;k++){const d=k/n*T;while(j<V.length-1&&L[j]<d)j++;const s=L[j]-L[j-1]||1;o.push(slerp(V[j-1],V[j],clamp((d-L[j-1])/s,0,1)))}return o}
const RCACHE={};
async function roadRoute(a,b){const key='ffts.road.'+[a,b].map(p=>p[0].toFixed(4)+','+p[1].toFixed(4)).join(';');if(RCACHE[key])return RCACHE[key];try{const c=JSON.parse(localStorage.getItem(key)||'null');if(c)return RCACHE[key]=c}catch(e){}
 const base=CONFIG.routing&&CONFIG.routing.roadUrl;if(!base)return{err:'no road routing service is configured'};let j;
 try{const ctl=new AbortController(),tm=setTimeout(()=>ctl.abort(),9000);const r=await fetch(`${base}${a[0]},${a[1]};${b[0]},${b[1]}?overview=full&geometries=geojson&steps=true`,{signal:ctl.signal});clearTimeout(tm);j=await r.json()}
 catch(e){return{err:'the road routing service could not be reached',retry:true}}
 if(!j||j.code!=='Ok'||!j.routes||!j.routes.length)return RCACHE[key]={err:j&&j.code==='NoRoute'?'there is no road connection between these two places':'the road routing service found no route ('+(j&&j.code||'no answer')+')'};
 const far=(j.waypoints||[]).map(w=>w.distance||0),ferry=j.routes[0].legs.some(l=>(l.steps||[]).some(s=>s.mode==='ferry'));
 let res;if(ferry)res={err:'the only road route uses a ferry crossing, so a lorry cannot drive it'};else if(Math.max(...far,0)>8000)res={err:`the ${far[0]>8000?'start':'end'} point is ${Math.round(Math.max(...far)/1000)} km from the nearest road`};
 else res={pts:j.routes[0].geometry.coordinates,km:Math.round(j.routes[0].distance/1000)};RCACHE[key]=res;try{localStorage.setItem(key,JSON.stringify(res))}catch(e){}return res}
const LEGNAME=['Farm → export port','Export port → arrival port','Arrival port → warehouse','Warehouse → supermarket'];
function setLeg(r,info,pts){ROUTEINFO[r]=info;if(pts)ROUTES[r]=resampleGC(despike(pts),r===1?240:140);else{const a=SITES[r].g,b=SITES[r+1].g;ROUTES[r]=resampleGC([a,b],60)}}
/* route every leg of a manifest; later results from an older manifest are dropped */
async function routeManifest(N){const gen=++ROUTEGEN,G=SITES.map(S=>S.g);
 for(let r=0;r<4;r++)if(ROUTEINFO[r].gen!==gen)setLeg(r,{state:'pending',gen,note:'Calculating route…'},null);syncRouteUI();
 const sea=async()=>{const c=N.routes[1];if(!LMASK)return;
  if(c&&c.pts){const P=[G[1],...c.pts,G[2]];let ok=true;for(let i=0;i<P.length-1&&ok;i++)ok=segWater(P[i],P[i+1],false,[G[1],G[2]]);
   if(ok){setLeg(1,{state:'ok',gen,src:c.source==='actual'?'from the manifest':'illustrative, from the manifest',note:'Sea route from the manifest, checked to stay on water'},P);return}}
  const res=seaRoute(G[1],G[2]);if(gen!==ROUTEGEN)return;
  if(res.pts)setLeg(1,{state:'ok',gen,src:'calculated sea route',note:'Calculated over water from the map'+(c&&c.pts?'. The sea route in the manifest crosses land, so it was not used.':''),warn:c&&c.pts?'The manifest\'s sea route crosses land and was replaced by a calculated route over water.':null},res.pts);
  else setLeg(1,{state:'invalid',gen,warn:'Sea route unavailable: '+res.err+'.'},null)};
 const road=async r=>{const c=N.routes[r];if(c&&c.pts&&c.source==='actual'){setLeg(r,{state:'ok',gen,src:'road route from the manifest',note:'Road route supplied in the manifest'},[G[r],...c.pts,G[r+1]]);return}
  const res=await roadRoute(G[r],G[r+1]);if(gen!==ROUTEGEN)return;
  if(res.pts)setLeg(r,{state:'ok',gen,src:'road network route',note:`Road route from the road network (${res.km} km)`},res.pts);
  else setLeg(r,{state:'invalid',gen,warn:`${LEGNAME[r]}: road route unavailable, ${res.err}. Shown as an illustrative connection; the lorry is not animated on this leg.`,retry:res.retry},null)};
 await Promise.all([sea(),road(0),road(2),road(3)]);if(gen===ROUTEGEN){ARCS=[arcPts(G[3],G[0]),arcPts(G[0],G[3])];syncRouteUI()}}
const routeOK=r=>ROUTEINFO[r].state==='ok';
function syncRouteUI(){const w=ROUTEINFO.map(i=>i.warn).filter(Boolean),el=$('#manRoutes');if(!el)return;const pend=ROUTEINFO.some(i=>i.state==='pending');
 el.innerHTML=(pend?'<p>Calculating routes…</p>':'')+(w.length?`<ul>${w.map(x=>`<li>${esc(x)}</li>`).join('')}</ul>${ROUTEINFO.some(i=>i.retry)?'<button id="rtRetry" type="button">Try routing again</button>':''}`:(!pend?'<p>All legs routed: roads for lorries, water for the vessel.</p>':''));
 const b=$('#rtRetry');if(b)b.onclick=()=>{for(const k in RCACHE)if(RCACHE[k].retry)delete RCACHE[k];routeManifest(DATA.man)}}
