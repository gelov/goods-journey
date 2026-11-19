'use strict';
/* ================= obstacle-free road inside a site =================
   The lorry's leg (globe.js) follows the validated road route, which knows nothing of the 3D farm or port. Inside a site, the stretch
   between the facility road and the site's edge is re-planned here so it goes round buildings, greenhouses, tanks and trees:
   A* on a 1-unit grid made from the walkers' obstacle grid (nav.js), with every obstacle grown by the road's half width plus clearance
   (which also closes doorways), then straightened where clear and rounded only where the rounding stays clear. */
const RGR=1,RG_CLEAR=4.2,RG_EDGE=2.8;
function roadGrid(k){const N=navOf(k);if(!N)return null;const S=SITES[k];S.rg=S.rg||{};if(S.rg[STYLE])return S.rg[STYLE];
 const f=Math.round(RGR/NAVR),n=Math.floor(N.n/f),B0=new Uint8Array(n*n);for(let j=0;j<n;j++)for(let i=0;i<n;i++){let b=0;for(let dj=0;dj<f&&!b;dj++)for(let di=0;di<f;di++)if(N.B[(j*f+dj)*N.n+i*f+di]){b=1;break}B0[j*n+i]=b}
 /* grow obstacles by a disc of radius r cells */
 const grow=r=>{const o=new Uint8Array(n*n),off=[];for(let dj=-r;dj<=r;dj++)for(let di=-r;di<=r;di++)if(di*di+dj*dj<=r*r)off.push([di,dj]);
  for(let j=0;j<n;j++)for(let i=0;i<n;i++){if(!B0[j*n+i])continue;for(const[di,dj]of off){const a=i+di,b=j+dj;if(a>=0&&b>=0&&a<n&&b<n)o[b*n+a]=1}}return o};
 return S.rg[STYLE]={n,x0:N.x0,z0:N.z0,B:grow(Math.ceil(RG_CLEAR/RGR)),E:grow(Math.ceil(RG_EDGE/RGR))}}
/* a path in site k from a (leaving along heading ha) to b (arriving along hb), clear of obstacles; null if there is none */
function siteDetour(k,a,ha,b,hb){const G=roadGrid(k);if(!G)return null;const n=G.n,id=p=>{const i=Math.floor((p[0]-G.x0)/RGR),j=Math.floor((p[1]-G.z0)/RGR);return i<0||j<0||i>=n||j>=n?-1:j*n+i},ctr=c=>[G.x0+(c%n+.5)*RGR,G.z0+(Math.floor(c/n)+.5)*RGR];
 const clearOn=(M,p,q)=>{const L=Math.hypot(q[0]-p[0],q[1]-p[1]),m=Math.max(1,Math.ceil(L/(RGR*.4)));for(let t=0;t<=m;t++){const c=id([lerp(p[0],q[0],t/m),lerp(p[1],q[1],t/m)]);if(c<0||M[c])return false}return true};
 /* lead out of the facility road and into the approach along their headings, a few units, so the road meets them straight */
 const a1=[a[0]+ha[0]*5,a[1]+ha[1]*5],b1=[b[0]-hb[0]*5,b[1]-hb[1]*5];
 const near=p=>{const c=id(p);if(c<0)return-1;if(!G.B[c])return c;const i0=c%n,j0=Math.floor(c/n);for(let r=1;r<12;r++)for(let dj=-r;dj<=r;dj++)for(let di=-r;di<=r;di++){if(Math.max(Math.abs(di),Math.abs(dj))!==r)continue;const i=i0+di,j=j0+dj;if(i>=0&&j>=0&&i<n&&j<n&&!G.B[j*n+i])return j*n+i}return-1};
 const s=near(a1),g=near(b1);if(s<0||g<0)return null;
 const Gs=new Float32Array(n*n).fill(1e30),from=new Int32Array(n*n).fill(-1),done=new Uint8Array(n*n),gx=g%n,gy=Math.floor(g/n),h=c=>Math.hypot(c%n-gx,Math.floor(c/n)-gy),H=[];
 const push=(c,f)=>{H.push([f,c]);let q=H.length-1;while(q){const p=(q-1)>>1;if(H[p][0]<=H[q][0])break;[H[p],H[q]]=[H[q],H[p]];q=p}},pop=()=>{const t=H[0],e=H.pop();if(H.length){H[0]=e;let q=0;for(;;){const l=2*q+1,r=l+1;let m=q;if(l<H.length&&H[l][0]<H[m][0])m=l;if(r<H.length&&H[r][0]<H[m][0])m=r;if(m===q)break;[H[m],H[q]]=[H[q],H[m]];q=m}}return t};
 Gs[s]=0;push(s,h(s));let it=0;while(H.length&&it++<300000){const[,c]=pop();if(done[c])continue;done[c]=1;if(c===g)break;const i=c%n,j=Math.floor(c/n);
  for(let dj=-1;dj<=1;dj++)for(let di=-1;di<=1;di++){if(!di&&!dj)continue;const x=i+di,y=j+dj;if(x<0||y<0||x>=n||y>=n)continue;const q=y*n+x;if(G.B[q]||done[q])continue;if(di&&dj&&(G.B[j*n+x]||G.B[y*n+i]))continue;const cst=Gs[c]+(di&&dj?1.414:1);if(cst<Gs[q]){Gs[q]=cst;from[q]=c;push(q,cst+h(q))}}}
 if(g!==s&&from[g]<0)return null;const cells=[];for(let c=g;c>=0;c=from[c])cells.push(c);cells.reverse();
 let P=[a,a1,...cells.map(ctr),b1,b];
 /* straighten: keep only the turning points the clearance grid needs */
 const st=[P[0]];let i=0;while(i<P.length-1){let j=P.length-1;while(j>i+1&&!clearOn(G.B,P[i],P[j]))j--;st.push(P[j]);i=j}P=st;
 /* round the corners (Chaikin), keeping each round only while the road edge stays clear */
 for(let r=0;r<4;r++){const o=[P[0]];for(let q=0;q<P.length-1;q++){const u=P[q],v=P[q+1];o.push([u[0]*.75+v[0]*.25,u[1]*.75+v[1]*.25],[u[0]*.25+v[0]*.75,u[1]*.25+v[1]*.75])}o.push(P[P.length-1]);
  let ok=true;for(let q=1;q<o.length-2&&ok;q++)ok=clearOn(G.E,o[q],o[q+1]);if(!ok)break;P=o}
 /* even spacing for the lorry and the road builder */
 const out=[P[0]];for(let q=1;q<P.length;q++){const u=P[q-1],v=P[q],L=Math.hypot(v[0]-u[0],v[1]-u[1]),m=Math.max(1,Math.ceil(L/1.5));for(let t=1;t<=m;t++)out.push([lerp(u[0],v[0],t/m),lerp(u[1],v[1],t/m)])}return out}
