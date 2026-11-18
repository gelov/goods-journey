'use strict';
/* ================= supermarket branding =================
   The store's geometry is fixed (world.js). Its retailer dress lives here, in two parts that are rebuilt whenever a manifest is
   applied (applyBrand): brand-coloured boards (one mover, rebuilt in every built style, old buffers freed) and text signs (canvas
   textures on quads fixed to those boards, old textures deleted). Nothing else in the scene is touched. */
let BRAND=resolveBrand(null),BRANDC=null,BRMOV=null,BRSIGN=null;
const brandCols=()=>{const m=c=>IND?metal(hexRGB(c)):hexRGB(c);return BRANDC={p:m(BRAND.primary),s:m(BRAND.secondary),a:m(BRAND.accent)}};
/* the boards: every one sits on, or hangs from, a part of the building, shelving, display or checkout */
function brandBoards(){const C=brandCols(),p=C.p,s=C.s;
 bb(p,223,7.4,-17.6,34.6,2.2,.4);bb(s,223,7.25,-17.6,34.6,.15,.42);                              /* back wall roof trim */
 bb(p,223,5.34,22,34.4,1.5,.4);bb(s,223,5.34,22.02,34.4,.14,.42);                                 /* storefront fascia on the front beam */
 bb(p,225,4.35,22,5.2,.74,.12);                                                                   /* entrance sign under the beam */
 bb(p,223,1.3,-17.67,34,.28,.06);for(const x of[206.33,239.67])bb(p,x,1.3,-9,.06,.28,17.4);       /* interior wall accent stripe */
 bb(p,246,7,29,2.6,2.2,.4);                                                                     /* pylon sign panel on its pole */
 for(const az of STORE.aisles)for(const gx of STORE.gx){bb(p,gx,2.82,az,6.8,.62,.12);bb(s,gx,2.82,az,6.8,.06,.13)}             /* aisle header panels on the gondolas */
 STORE.beams.slice(0,3).forEach(z=>{for(const d of[-.5,.5])bb(P.steel,212.6+d,4.55,z,.03,.45,.03);bb(p,212.6,3.95,z,1.7,.6,.08)}); /* aisle numbers hung from the beams */
 bb(p,222.25,3.07,-16.45,29.3,.5,.1);bb(p,238.4,3.07,-8,.1,.5,12.8);                              /* chilled and drinks fascias */
 bb(p,206.36,3.3,-10.6,.06,1.1,4.8);                                                               /* bakery sign on the west wall */
 for(const[cx,cz]of[STORE.veg,STORE.fruit]){bb(P.steel,cx,1.08,cz,.08,1.6,.08);bb(p,cx,2.6,cz,3,.7,.1)} /* produce section signs on the islands */
 bb(p,233.5,.27,4,1.6,.9,1.6);bb(P.steel,233.5,1.17,3.3,.06,.75,.06);bb(p,233.5,1.9,3.3,1.5,.7,.06);  /* promotional stand */
 for(const x of[219,226]){bb(p,x,1.35,8,5.2,.12,3.6);for(const d of[-2.2,2.2])bb(P.steel,x+d,1.47,6.12,.07,1.9,.07);bb(p,x,2.6,6.12,4.7,.82,.1)} /* display tops and header boards */
 for(const x of STORE.lanes){bb(P.steel,x,1.22,12.3,.07,1.9,.07);bb(p,x,3.1,12.3,1.3,.62,.08)}     /* checkout lane signs */
 bb(P.steel,206.8,0,25.6,.1,2.9,.1);bb(p,206.8,1.85,25.62,2.3,1.1,.06);                           /* parking sign on its post */
 for(const z of[-1,9])bb(p,240.33,1.6,z,.05,3.4,1.5)}                                              /* exterior banners on the east wall */
/* the text signs: centre, facing (+z, -x, +x), width, height, what to draw */
const SIGNS=[{c:[214,6.09,22.21],f:'+z',w:12,h:1.24,k:'name'},{c:[233,6.09,22.21],f:'+z',w:10,h:1.0,k:'promo'},{c:[225,4.72,22.07],f:'+z',w:5,h:.62,k:'entrance'},
 {c:[223,8.5,-17.39],f:'+z',w:15,h:1.7,k:'name'},{c:[246,8.1,29.21],f:'+z',w:2.4,h:2,k:'mark'},
 ...STORE.aisles.flatMap((az,a)=>STORE.gx.map((gx,g)=>({c:[gx,3.13,az+.07],f:'+z',w:6.6,h:.52,k:'aisleH'+(a*3+g)}))),...[0,1,2].map(n=>({c:[212.6,4.25,STORE.beams[n]+.05],f:'+z',w:1.6,h:.52,k:'aisleN'+(n+1)})),
 {c:[222.25,3.32,-16.39],f:'+z',w:12,h:.44,k:'chilled'},{c:[238.34,3.32,-8],f:'-x',w:6,h:.44,k:'drinks'},{c:[206.4,3.85,-10.6],f:'+x',w:4.6,h:1,k:'bakery'},
 {c:[STORE.veg[0],2.95,STORE.veg[1]+.06],f:'+z',w:2.9,h:.62,k:'veg'},{c:[STORE.fruit[0],2.95,STORE.fruit[1]+.06],f:'+z',w:2.9,h:.62,k:'fruit'},{c:[233.5,2.25,3.34],f:'+z',w:1.4,h:.62,k:'promo'},
 ...[219,226].map(x=>({c:[x,3.01,6.18],f:'+z',w:4.5,h:.7,k:'produce'})),...[219,226].flatMap(x=>[-1.4,1.4].map(d=>({c:[x+d,.82,9.73],f:'+z',w:1,h:.5,k:'price'}))),
 ...STORE.lanes.map((x,n)=>({c:[x,3.41,12.35],f:'+z',w:1.2,h:.52,k:'check'+(n+1)})),{c:[206.8,2.4,25.66],f:'+z',w:2.2,h:1,k:'parking'},
 {c:[239.6,3.7,5],f:'-x',w:4.4,h:2.2,k:'poster'},...[-1,9].map(z=>({c:[240.37,3.3,z],f:'+x',w:1.4,h:3.2,k:'banner'}))];
function brandMovers(){BRMOV=mover(4,EM(4,'Store branding',9,'The retailer’s signage and colours, from the shipment manifest.'),brandBoards,()=>{})}
/* a manifest was applied: new colours on the boards (every built style), new sign textures on the next frame */
function applyBrand(N){BRAND=resolveBrand(N&&N.retailer);BRAND.logo=null;
 if(BRAND.logoUrl){const im=new Image(),b=BRAND;im.onload=()=>{if(BRAND===b){b.logo=im;BRSIGN&&(BRSIGN.dirty=true)}};im.src=BRAND.logoUrl}
 if(BRMOV){const cur=BUILD;for(const name of Object.keys(BRMOV.meshes)){setBuild(name);V=[];PID=BRMOV.pid;MOVB=true;MAT=0;SW=0;XF=null;MEL.T=[];BRMOV.build();const old=BRMOV.meshes[name];BRMOV.meshes[name]=upload(V);if(old&&old.b)gl.deleteBuffer(old.b);melTake()}
  MOVB=false;PID=0;MAT=0;SW=0;V=[];setBuild(cur)}
 if(BRSIGN)BRSIGN.dirty=true}
/* ---- sign artwork ---- */
function signArt(k,W,H){const B=BRAND,cv=document.createElement('canvas');cv.width=W;cv.height=H;const x=cv.getContext('2d'),P_=B.primary,S_=B.secondary,A_=B.accent,light=B.style==='light';
 const fill=c=>{x.fillStyle=c;x.fillRect(0,0,W,H)},text=(t,c,maxH,y,wt)=>{let f=maxH;x.font=`${wt||800} ${f}px "Helvetica Neue",Arial,sans-serif`;while(x.measureText(t).width>W*.9&&f>8){f-=2;x.font=`${wt||800} ${f}px "Helvetica Neue",Arial,sans-serif`}x.fillStyle=c;x.textAlign='center';x.textBaseline='middle';x.fillText(t,W/2,y==null?H/2:y)};
 const sg=B.signage,on=light?P_:'#FFFFFF',bg=light?'#FFFFFF':P_;
 const nameArt=sq=>{fill(bg);if(B.logo){const s=Math.min(H*.8,W*.8),r=B.logo.width/B.logo.height||1,w=sq?s:Math.min(W*.85,H*.75*r),h=w/r;x.drawImage(B.logo,(W-w)/2,(H-h)/2,w,h);return}
  if(light){text(B.sign,P_,H*.56,H*.42);const n=5,gw=W*.1;for(let i=0;i<n;i++){x.fillStyle=S_;x.fillRect(W/2-n*gw*.55+i*gw*1.1,H*.76,gw*.9,H*.07)}}
  else{text(B.sign,on,H*.58,H*.48);x.fillStyle=S_===bg?A_:S_;x.fillRect(W*.08,H*.84,W*.84,H*.05)}};
 if(k==='name')nameArt(false);else if(k==='mark')nameArt(true);
 else if(k==='price'){fill('#FFFFFF');x.strokeStyle=P_;x.lineWidth=H*.12;x.strokeRect(0,0,W,H);text(sg.price,P_,H*.38)}
 else if(k==='parking'){fill(P_);x.fillStyle='#FFFFFF';x.fillRect(H*.12,H*.12,H*.76,H*.76);x.fillStyle=P_;x.font=`900 ${H*.62}px Arial`;x.textAlign='center';x.textBaseline='middle';x.fillText('P',H*.5,H*.53);
  x.save();x.translate(H*.45,0);const w0=W;W-=H*.9;text(sg.parking,'#FFFFFF',H*.3,H*.36,700);text(B.name,'#FFFFFF',H*.22,H*.7,500);W=w0;x.restore()}
 else if(k==='poster'||k==='banner'){fill(P_);x.fillStyle=S_===P_?A_:S_;x.fillRect(0,H*.82,W,H*.06);
  if(k==='banner'){x.save();x.translate(W/2,H/2);x.rotate(-Math.PI/2);x.translate(-H/2,-W/2);const w0=W,h0=H;W=h0;H=w0;text(B.sign,'#FFFFFF',H*.5);W=w0;H=h0;x.restore()}
  else{text(sg.promo,'#FFFFFF',H*.2,H*.38);text(B.name,'#FFFFFF',H*.13,H*.64,600)}}
 else{const t=k==='promo'?sg.promo:k==='entrance'?sg.entrance:k==='produce'?sg.produce:k==='fruit'?sg.shelves[0]:k==='veg'?sg.shelves[1]||sg.shelves[0]:k.startsWith('aisleH')?sg.aisles[+k.slice(6)%sg.aisles.length]:k.startsWith('aisleN')?sg.aisle+' '+k.slice(6):k==='chilled'?sg.chilled:k==='drinks'?sg.drinks:k==='bakery'?sg.bakery:k.startsWith('check')?sg.checkout+' '+k.slice(5):'';fill(P_);text(t,'#FFFFFF',H*.56,null,700)}
 return cv}
/* ---- drawing: unlit quads in the supermarket's frame, faded with the site ---- */
function brandSigns(){if(!BRSIGN){const pr=prog(`attribute vec3 aP;attribute vec2 aU;uniform mat4 uVP;varying vec2 vU;varying vec3 vW;void main(){vU=aU;vW=aP;gl_Position=uVP*vec4(aP,1.);}`,
  `precision mediump float;varying vec2 vU;varying vec3 vW;uniform sampler2D uTex;uniform float uA;uniform vec2 uCen,uR;void main(){vec4 c=texture2D(uTex,vU);gl_FragColor=vec4(c.rgb*.94,uA*(1.-smoothstep(uR.x,uR.y,length(vW.xz-uCen))));}`);
  BRSIGN={pr,buf:gl.createBuffer(),tex:[],dirty:true};const A=[];for(const s of SIGNS){const[cx,cy,cz]=s.c,hw=s.w/2,hh=s.h/2,o=s.f==='+z'?[[cx-hw,cz],[cx+hw,cz]]:s.f==='+x'?[[cx,cz+hw],[cx,cz-hw]]:[[cx,cz-hw],[cx,cz+hw]];
   const q=[[o[0][0],cy-hh,o[0][1],0,1],[o[1][0],cy-hh,o[1][1],1,1],[o[1][0],cy+hh,o[1][1],1,0],[o[0][0],cy+hh,o[0][1],0,0]];for(const i of[0,1,2,0,2,3])A.push(...q[i])}
  gl.bindBuffer(gl.ARRAY_BUFFER,BRSIGN.buf);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(A),gl.STATIC_DRAW)}
 if(BRSIGN.dirty){BRSIGN.dirty=false;for(const t of BRSIGN.tex)gl.deleteTexture(t);BRSIGN.tex=SIGNS.map(s=>{const W=Math.min(1024,Math.max(64,Math.round(s.w*110))),H=Math.min(1024,Math.max(32,Math.round(s.h*110))),t=gl.createTexture();
   gl.bindTexture(gl.TEXTURE_2D,t);gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,false);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,signArt(s.k,W,H));
   gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);for(const w of[gl.TEXTURE_WRAP_S,gl.TEXTURE_WRAP_T])gl.texParameteri(gl.TEXTURE_2D,w,gl.CLAMP_TO_EDGE);return t})}
 return BRSIGN}
function drawBrandSigns(){const S=SITES[4];if(!S.on||!(FADE*S.a>.01))return;const B=brandSigns(),p=B.pr;gl.useProgram(p.p);gl.uniformMatrix4fv(p.u.uVP,false,f32(S.vp));gl.uniform1f(p.u.uA,FADE*S.a);gl.uniform2f(p.u.uCen,S.c[0],S.c[1]);gl.uniform2f(p.u.uR,S.r0,S.r1);
 gl.bindBuffer(gl.ARRAY_BUFFER,B.buf);gl.enableVertexAttribArray(p.a.aP);gl.vertexAttribPointer(p.a.aP,3,gl.FLOAT,false,20,0);gl.enableVertexAttribArray(p.a.aU);gl.vertexAttribPointer(p.a.aU,2,gl.FLOAT,false,20,12);
 gl.activeTexture(gl.TEXTURE0);gl.uniform1i(p.u.uTex,0);for(let i=0;i<SIGNS.length;i++){gl.bindTexture(gl.TEXTURE_2D,B.tex[i]);gl.drawArrays(gl.TRIANGLES,i*6,6)}gl.disableVertexAttribArray(p.a.aU)}
