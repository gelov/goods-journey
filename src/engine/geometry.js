'use strict';
/* ================= geometry (triangle soup: pos3 nrm3 col3 pid sway mat) ================= */
let V=[],C=[.8,.8,.8],PID=0,SW=0,MAT=0,XF=null,MOVB=false;
const ENT=[null];
function vx(p,n){if(XF){const m=XF,x=p[0],y=p[1],z=p[2];p=[m[0]*x+m[4]*y+m[8]*z+m[12],m[1]*x+m[5]*y+m[9]*z+m[13],m[2]*x+m[6]*y+m[10]*z+m[14]];n=nrm([m[0]*n[0]+m[4]*n[1]+m[8]*n[2],m[1]*n[0]+m[5]*n[1]+m[9]*n[2],m[2]*n[0]+m[6]*n[1]+m[10]*n[2]])}
 V.push(p[0],p[1],p[2],n[0],n[1],n[2],C[0],C[1],C[2],PID,SW,MAT||C.m||0);
 if(PID&&!MOVB){const b=ENT[PID].bb;for(let i=0;i<3;i++){if(p[i]<b[i])b[i]=p[i];if(p[i]>b[i+3])b[i+3]=p[i]}}}
function Q(a,b,c,d,n){vx(a,n);vx(b,n);vx(c,n);vx(a,n);vx(c,n);vx(d,n)}
function tri(a,b,c,n){vx(a,n);vx(b,n);vx(c,n)}
function box(c,cx,cy,cz,w,h,d){C=c;const x0=cx-w/2,x1=cx+w/2,y0=cy-h/2,y1=cy+h/2,z0=cz-d/2,z1=cz+d/2;
 Q([x0,y0,z1],[x1,y0,z1],[x1,y1,z1],[x0,y1,z1],[0,0,1]);Q([x1,y0,z0],[x0,y0,z0],[x0,y1,z0],[x1,y1,z0],[0,0,-1]);
 Q([x1,y0,z1],[x1,y0,z0],[x1,y1,z0],[x1,y1,z1],[1,0,0]);Q([x0,y0,z0],[x0,y0,z1],[x0,y1,z1],[x0,y1,z0],[-1,0,0]);
 Q([x0,y1,z1],[x1,y1,z1],[x1,y1,z0],[x0,y1,z0],[0,1,0]);Q([x0,y0,z0],[x1,y0,z0],[x1,y0,z1],[x0,y0,z1],[0,-1,0])}
const bb=(c,cx,y0,cz,w,h,d)=>box(c,cx,y0+h/2,cz,w,h,d);
function lathe(c,pr,cx,cy,cz,seg,flat){C=c;seg=seg||10;const n=pr.length,nn=[];
 for(let j=0;j<n;j++){const a=pr[Math.max(0,j-1)],b=pr[Math.min(n-1,j+1)],dr=b[0]-a[0],dy=b[1]-a[1],l=Math.hypot(dr,dy)||1;nn.push([dy/l,-dr/l])}
 for(let j=0;j<n-1;j++){const r0=pr[j][0],y0=pr[j][1],r1=pr[j+1][0],y1=pr[j+1][1];let n0=nn[j],n1=nn[j+1];
  if(flat){const dr=r1-r0,dy=y1-y0,l=Math.hypot(dr,dy)||1;n0=n1=[dy/l,-dr/l]}
  for(let i=0;i<seg;i++){const a0=i/seg*TAU,a1=(i+1)/seg*TAU,c0=Math.cos(a0),s0=Math.sin(a0),c1=Math.cos(a1),s1=Math.sin(a1);
   const p00=[cx+r0*c0,cy+y0,cz+r0*s0],p10=[cx+r0*c1,cy+y0,cz+r0*s1],p01=[cx+r1*c0,cy+y1,cz+r1*s0],p11=[cx+r1*c1,cy+y1,cz+r1*s1];
   const A=[n0[0]*c0,n0[1],n0[0]*s0],B=[n0[0]*c1,n0[1],n0[0]*s1],D=[n1[0]*c0,n1[1],n1[0]*s0],E=[n1[0]*c1,n1[1],n1[0]*s1];
   if(r0>1e-4){vx(p00,A);vx(p10,B);vx(p11,E)}if(r1>1e-4){vx(p00,A);vx(p11,E);vx(p01,D)}}}}
const cyl=(c,x,y0,z,r,h,seg)=>lathe(c,[[0,0],[r,0],[r,h],[0,h]],x,y0,z,seg||10,1);
function ball(c,x,y,z,r,sy,seg,rings){sy=sy||1;rings=rings||4;const pr=[];for(let k=0;k<=rings;k++){const a=-Math.PI/2+Math.PI*k/rings;pr.push([Math.max(0,r*Math.cos(a)),r*sy*Math.sin(a)])}lathe(c,pr,x,y,z,seg||8)}
function roof(c,cx,y0,cz,w,h,d){C=c;const a=[cx-w/2,y0,cz-d/2],b=[cx-w/2,y0,cz+d/2],e=[cx+w/2,y0,cz-d/2],f=[cx+w/2,y0,cz+d/2],r0=[cx,y0+h,cz-d/2],r1=[cx,y0+h,cz+d/2];
 Q(a,b,r1,r0,nrm([-h,w/2,0]));Q(f,e,r0,r1,nrm([h,w/2,0]));tri(b,f,r1,[0,0,1]);tri(e,a,r0,[0,0,-1])}
function Tm(m,fn){const o=XF;XF=o?mul(o,m):m;fn();XF=o}
const Tp=(x,y,z,yaw,s,fn)=>Tm(trs(x,y,z,yaw,s),fn);
const shade=(c,k)=>{const o=[c[0]*k,c[1]*k,c[2]*k];if(c.m)o.m=c.m;return o};
