'use strict';
/* ================= math ================= */
const TAU=Math.PI*2,clamp=(v,a,b)=>v<a?a:v>b?b:v,lerp=(a,b,t)=>a+(b-a)*t,io=t=>t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2,out=t=>1-Math.pow(1-t,3),back=t=>{const c=1.70158;return 1+(c+1)*Math.pow(t-1,3)+c*Math.pow(t-1,2)};
const I=()=>new Float64Array([1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1]);
function mul(a,b){const o=new Float64Array(16);for(let c=0;c<4;c++)for(let r=0;r<4;r++)o[c*4+r]=a[r]*b[c*4]+a[4+r]*b[c*4+1]+a[8+r]*b[c*4+2]+a[12+r]*b[c*4+3];return o}
const tr=(x,y,z)=>{const m=I();m[12]=x;m[13]=y;m[14]=z;return m};
const rY=a=>{const m=I(),c=Math.cos(a),s=Math.sin(a);m[0]=c;m[2]=-s;m[8]=s;m[10]=c;return m};
const rX=a=>{const m=I(),c=Math.cos(a),s=Math.sin(a);m[5]=c;m[6]=s;m[9]=-s;m[10]=c;return m};
const rZ=a=>{const m=I(),c=Math.cos(a),s=Math.sin(a);m[0]=c;m[1]=s;m[4]=-s;m[5]=c;return m};
const sc=(x,y,z)=>{const m=I();m[0]=x;m[5]=y;m[10]=z;return m};
const trs=(x,y,z,yaw,s)=>mul(mul(tr(x,y,z),rY(yaw||0)),sc(s||1,s||1,s||1));
function persp(f,a,n,fr){const t=1/Math.tan(f/2),m=new Float64Array(16);m[0]=t/a;m[5]=t;m[10]=(fr+n)/(n-fr);m[11]=-1;m[14]=2*fr*n/(n-fr);return m}
function ortho(l,r,b,t,n,f){const m=new Float64Array(16);m[0]=2/(r-l);m[5]=2/(t-b);m[10]=-2/(f-n);m[12]=-(r+l)/(r-l);m[13]=-(t+b)/(t-b);m[14]=-(f+n)/(f-n);m[15]=1;return m}
const sub=(a,b)=>[a[0]-b[0],a[1]-b[1],a[2]-b[2]],cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]],nrm=a=>{const l=Math.hypot(a[0],a[1],a[2])||1;return[a[0]/l,a[1]/l,a[2]/l]},dot=(a,b)=>a[0]*b[0]+a[1]*b[1]+a[2]*b[2];
function lookAt(e,t,u){const z=nrm(sub(e,t)),x=nrm(cross(u,z)),y=cross(z,x),m=new Float64Array(16);m[0]=x[0];m[1]=y[0];m[2]=z[0];m[4]=x[1];m[5]=y[1];m[6]=z[1];m[8]=x[2];m[9]=y[2];m[10]=z[2];m[12]=-dot(x,e);m[13]=-dot(y,e);m[14]=-dot(z,e);m[15]=1;return m}
function prng(s){return()=>{s=(s+0x6D2B79F5)>>>0;let t=s;t=Math.imul(t^(t>>>15),t|1);t^=t+Math.imul(t^(t>>>7),t|61);return((t^(t>>>14))>>>0)/4294967296}}
const $=s=>document.querySelector(s);
const REDUCED=(()=>{try{return matchMedia('(prefers-reduced-motion: reduce)').matches}catch(e){return false}})(),MOTION=REDUCED?.02:1;
