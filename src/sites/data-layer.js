'use strict';
/* ================= data layer inside each site ================= */
const DCOL={d:[.56,.87,1],c:[1,.5,.42],g:[1,.82,.35],y:[.96,.77,.31]};
const DNODES=[[[-186,9,-6],[-138,10,10],[-126,7,30.5]],[[-105,9,27],[-73,22,-10],[-62,11,-12]],[[62,11,-12],[107,10,-27],[100,7,16],[113,7,13]],[[151,7,29],[141,7,19],[179,7,6],[180,12,-24]],[[200,7,14],[223,9,8]]];
const DSITE=[];let PVBO,PARR=new Float32Array(7*900);
function buildData(){for(let k=0;k<SITES.length;k++){V=[];PID=0;MAT=2;XF=null;const nd=DNODES[k];for(const n of nd){cyl(P.steel,n[0],0,n[2],.09,n[1],5);ball(k===3&&n===nd[3]?DCOL.c:DCOL.d,n[0],n[1],n[2],.55,1,8,4)}MAT=0;
  let pts=[];for(let i=0;i<nd.length-1;i++)pts=pts.concat(arc(nd[i],nd[i+1],6,Math.max(8,Math.round(Math.hypot(nd[i+1][0]-nd[i][0],nd[i+1][2]-nd[i][2])/2.6))));const p=mkPath(pts),st=[],n=Math.round(p.len/2.4);
  for(let i=0;i<=n;i++){const q=pAt(p,i/n);st.push(q[0],q[1],q[2],.42,DCOL.d[0],DCOL.d[1],DCOL.d[2])}DSITE.push({mesh:upload(V),p,st})}V=[];PVBO=gl.createBuffer()}
const SPK=(()=>{const r=prng(21),o=[];for(let k=0;k<26;k++)o.push([-225+r()*47,r()*6,3+r()*25,r()]);return o})();
function stepData(k){const D=DSITE[k],A=PARR;A.set(D.st);let i=D.st.length;const put=(x,y,z,s,c)=>{A[i++]=x;A[i++]=y;A[i++]=z;A[i++]=s;A[i++]=c[0];A[i++]=c[1];A[i++]=c[2]};
 for(let j=0;j<5;j++){const p=pAt(D.p,(T*.08+j/5)%1);put(p[0],p[1],p[2],1.25,[.85,.95,1])}
 if(k===0)for(const s of SPK){const q=(T*.22+s[3])%1;put(s[0],.8+q*7,s[2],.75*(1-q),DCOL.d)}
 if(k===2)for(let j=0;j<5;j++){const a=T*1.5+j/5*TAU;put(107+Math.cos(a)*5,8+Math.sin(a*2)*.8,-27+Math.sin(a)*4,.7,DCOL.d)}
 if(k===3)for(let z=0;z<3;z++)for(let j=0;j<4;j++){const u=(T*.35+j/4+z*.13)%1,a=[141,7,19],b=[[134,146,158][z],3.4,-4];put(lerp(a[0],b[0],u),lerp(a[1],b[1],u)+Math.sin(u*Math.PI)*4,lerp(a[2],b[2],u),.75,[[.42,.68,.95],[.97,.72,.3],[.5,.85,.56]][z])}
 return i/7}
