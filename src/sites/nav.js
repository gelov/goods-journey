'use strict';
/* ================= ground and obstacles for people =================
   Built from each site's own geometry when a style is built, so it always matches what is drawn:
   - ground: the highest walkable surface (upward faces lower than 0.45, such as floors, quays, pads and kerbs) on a 0.5 grid;
   - blocked: cells crossed by vertical faces from above knee height (0.65) up to head height; low crops and kerbs can be stepped past (walls, glass, racks, crates, pallets, machinery,
     tables, trunks), grown by one cell so a person keeps clear of them. Vegetation that sways is ignored.
   Walkers get obstacle-aware paths (A*, then straightened) between their two ends; everyone stands on the ground height. */
const NAVR=.5;
function buildNav(k,arrs,name){const S=SITES[k],R=S.r0,n=Math.ceil(2*R/NAVR),x0=S.c[0]-R,z0=S.c[1]-R,G=new Float32Array(n*n).fill(-1e9),B=new Uint8Array(n*n);
 const ci=x=>Math.floor((x-x0)/NAVR),cj=z=>Math.floor((z-z0)/NAVR),mark=(x,z)=>{const i=ci(x),j=cj(z);if(i>=0&&j>=0&&i<n&&j<n)B[j*n+i]=1};
 for(const A of arrs){if(!A)continue;for(let t=0;t+35<A.length;t+=36){if(A[t+10]>0)continue;const ax=A[t],ay=A[t+1],az=A[t+2],bx=A[t+12],by=A[t+13],bz=A[t+14],cx=A[t+24],cy=A[t+25],cz=A[t+26];
   const ux=bx-ax,uy=by-ay,uz=bz-az,vx=cx-ax,vy=cy-ay,vz=cz-az,nx=uy*vz-uz*vy,ny=uz*vx-ux*vz,nz=ux*vy-uy*vx,l=Math.hypot(nx,ny,nz);if(l<1e-9)continue;const fy=ny/l;
   if(fy>.9){if(Math.max(ay,by,cy)>.45)continue;const i0=Math.max(0,ci(Math.min(ax,bx,cx))),i1=Math.min(n-1,ci(Math.max(ax,bx,cx))),j0=Math.max(0,cj(Math.min(az,bz,cz))),j1=Math.min(n-1,cj(Math.max(az,bz,cz))),d=ux*vz-uz*vx;if(Math.abs(d)<1e-9)continue;
    for(let j=j0;j<=j1;j++)for(let i=i0;i<=i1;i++){const px=x0+(i+.5)*NAVR-ax,pz=z0+(j+.5)*NAVR-az,s=(px*vz-pz*vx)/d,r=(ux*pz-uz*px)/d;if(s<-.01||r<-.01||s+r>1.01)continue;const y=ay+s*uy+r*vy,q=j*n+i;if(y>G[q])G[q]=y}}
   else if(Math.abs(fy)<.35){const lo=Math.min(ay,by,cy),hi=Math.max(ay,by,cy);if(hi<.65||lo>1.9)continue;
    for(const[p,q]of[[[ax,az],[bx,bz]],[[bx,bz],[cx,cz]],[[cx,cz],[ax,az]]]){const L=Math.hypot(q[0]-p[0],q[1]-p[1]),m=Math.max(1,Math.ceil(L/.25));for(let s=0;s<=m;s++)mark(lerp(p[0],q[0],s/m),lerp(p[1],q[1],s/m))}}}}
 const D=new Uint8Array(n*n);for(let j=0;j<n;j++)for(let i=0;i<n;i++){if(!B[j*n+i])continue;for(let dj=-1;dj<=1;dj++)for(let di=-1;di<=1;di++){const a=i+di,b=j+dj;if(a>=0&&b>=0&&a<n&&b<n)D[b*n+a]=1}}
 (S.nav=S.nav||{})[name]={n,x0,z0,G,B:D}}
const navOf=k=>{const S=SITES[k];return S&&S.nav&&S.nav[STYLE]};
/* the walking surface under a point (0 off the map) */
function groundAt(k,x,z){const N=navOf(k);if(!N)return 0;const i=Math.floor((x-N.x0)/NAVR),j=Math.floor((z-N.z0)/NAVR);if(i<0||j<0||i>=N.n||j>=N.n)return 0;const g=N.G[j*N.n+i];return g>-1e8?Math.max(0,g):0}
function navBlocked(k,x,z){const N=navOf(k);if(!N)return false;const i=Math.floor((x-N.x0)/NAVR),j=Math.floor((z-N.z0)/NAVR);return i>=0&&j>=0&&i<N.n&&j<N.n&&!!N.B[j*N.n+i]}
/* obstacle-aware path between two points: A* on the grid, no corner cutting, then straightened where the line is clear */
function navPath(k,a,b){const N=navOf(k);if(!N)return null;const n=N.n,B=N.B,id=p=>{const i=Math.floor((p[0]-N.x0)/NAVR),j=Math.floor((p[1]-N.z0)/NAVR);return i<0||j<0||i>=n||j>=n?-1:j*n+i};
 const free=c=>{if(c<0)return-1;if(!B[c])return c;const i0=c%n,j0=Math.floor(c/n);for(let r=1;r<8;r++)for(let dj=-r;dj<=r;dj++)for(let di=-r;di<=r;di++){if(Math.max(Math.abs(di),Math.abs(dj))!==r)continue;const i=i0+di,j=j0+dj;if(i>=0&&j>=0&&i<n&&j<n&&!B[j*n+i])return j*n+i}return-1};
 const s=free(id(a)),g=free(id(b));if(s<0||g<0)return null;const ctr=c=>[N.x0+(c%n+.5)*NAVR,N.z0+(Math.floor(c/n)+.5)*NAVR];
 const Gs=new Float32Array(n*n).fill(1e30),from=new Int32Array(n*n).fill(-1),done=new Uint8Array(n*n),gx=g%n,gy=Math.floor(g/n),h=c=>Math.hypot(c%n-gx,Math.floor(c/n)-gy),H=[];
 const push=(c,f)=>{H.push([f,c]);let k2=H.length-1;while(k2){const p=(k2-1)>>1;if(H[p][0]<=H[k2][0])break;[H[p],H[k2]]=[H[k2],H[p]];k2=p}},pop=()=>{const t=H[0],e=H.pop();if(H.length){H[0]=e;let k2=0;for(;;){const l=2*k2+1,r=l+1;let m=k2;if(l<H.length&&H[l][0]<H[m][0])m=l;if(r<H.length&&H[r][0]<H[m][0])m=r;if(m===k2)break;[H[m],H[k2]]=[H[k2],H[m]];k2=m}}return t};
 Gs[s]=0;push(s,h(s));let it=0;while(H.length&&it++<200000){const[,c]=pop();if(done[c])continue;done[c]=1;if(c===g)break;const i=c%n,j=Math.floor(c/n);
  for(let dj=-1;dj<=1;dj++)for(let di=-1;di<=1;di++){if(!di&&!dj)continue;const x=i+di,y=j+dj;if(x<0||y<0||x>=n||y>=n)continue;const q=y*n+x;if(B[q]||done[q])continue;if(di&&dj&&(B[j*n+x]||B[y*n+i]))continue;const cst=Gs[c]+(di&&dj?1.414:1);if(cst<Gs[q]){Gs[q]=cst;from[q]=c;push(q,cst+h(q))}}}
 if(g!==s&&from[g]<0)return null;const cells=[];for(let c=g;c>=0;c=from[c])cells.push(c);cells.reverse();const P=cells.map(ctr);P[0]=B[id(a)]?P[0]:a;P[P.length-1]=B[id(b)]?P[P.length-1]:b;
 const clear=(p,q)=>{const L=Math.hypot(q[0]-p[0],q[1]-p[1]),m=Math.max(1,Math.ceil(L/(NAVR*.5)));for(let t=0;t<=m;t++){const c=id([lerp(p[0],q[0],t/m),lerp(p[1],q[1],t/m)]);if(c<0||B[c])return false}return true};
 const out=[P[0]];let i=0;while(i<P.length-1){let j=P.length-1;while(j>i+1&&!clear(P[i],P[j]))j--;out.push(P[j]);i=j}return out}
