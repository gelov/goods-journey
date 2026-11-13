'use strict';
/* ================= map tiles: a real road map draped on the globe, loaded level by level as the camera descends ================= */
const VT=`attribute vec3 aP;attribute vec2 aU;uniform mat4 uVP;varying vec3 vP;varying vec2 vU;void main(){vP=aP;vU=aU;gl_Position=uVP*vec4(aP,1.);}`;
const FT=`precision highp float;varying vec3 vP;varying vec2 vU;uniform sampler2D uTex;uniform vec3 uEye;uniform float uA;void main(){vec3 N=normalize(vP),V=normalize(uEye-vP);vec3 c=texture2D(uTex,vU).rgb;c=mix(c,vec3(.6,.76,1.),pow(1.-max(dot(N,V),0.),3.2)*.55);gl_FragColor=vec4(c,uA);}`;
const TILES=new Map();let TLOAD=0;
function tileGet(z,x,y){const n=1<<z;if(y<0||y>=n)return null;x=((x%n)+n)%n;const k=z+'/'+x+'/'+y;let t=TILES.get(k);if(!t){t={z,x,y,st:0};TILES.set(k,t)}t.used=NOW;return t}
function tileLoad(t){if(t.st||TLOAD>=8)return;t.st=1;TLOAD++;const im=new Image();im.crossOrigin='anonymous';
 im.onload=()=>{TLOAD--;try{t.tex=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,t.tex);gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,false);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGB,gl.RGB,gl.UNSIGNED_BYTE,im);
   const pot=!(im.width&(im.width-1))&&!(im.height&(im.height-1));if(pot)gl.generateMipmap(gl.TEXTURE_2D);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,pot?gl.LINEAR_MIPMAP_LINEAR:gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
   const e=gl.getExtension('EXT_texture_filter_anisotropic');if(e)gl.texParameterf(gl.TEXTURE_2D,e.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(8,gl.getParameter(e.MAX_TEXTURE_MAX_ANISOTROPY_EXT)));
   const n=1<<t.z,a=[],Gd=8,pt=(i,j)=>{const u=i/Gd,v=j/Gd,q=llu((t.x+u)/n*360-180,Math.atan(Math.sinh(Math.PI*(1-2*(t.y+v)/n)))/RAD);return[q[0],q[1],q[2],u,v]};
   for(let j=0;j<Gd;j++)for(let i=0;i<Gd;i++){const A=pt(i,j),B=pt(i+1,j),Cc=pt(i+1,j+1),D=pt(i,j+1);a.push(...A,...B,...Cc,...A,...Cc,...D)}
   t.vbo=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,t.vbo);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(a),gl.STATIC_DRAW);t.n=a.length/5;t.t0=NOW;t.st=2}catch(e){t.st=3}};
 im.onerror=()=>{TLOAD--;t.st=3};im.src=CONFIG.tiles.url.replace('{z}',t.z).replace('{x}',t.x).replace('{y}',t.y).replace('{s}','abcd'[(t.x+t.y)%4])}
function drawTiles(){const A=1-ss(9000,17000,X.d);if(A<.01||!CONFIG.tiles||!CONFIG.tiles.url)return;
 const lat=clamp(POSE.lat,-84,84),wdeg=(2*X.d*.2553*X.a)/(RS*Math.cos(lat*RAD))/RAD,z=clamp(Math.round(Math.log2(360*GLS.cw/(wdeg*(CONFIG.tiles.px||256)))),3,CONFIG.tiles.maxZoom),p=PR.tl;
 gl.useProgram(p.p);gl.uniformMatrix4fv(p.u.uVP,false,f32(X.gvp));gl.uniform3fv(p.u.uEye,X.eyeG);gl.activeTexture(gl.TEXTURE0);gl.uniform1i(p.u.uTex,0);gl.enable(gl.BLEND);gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);gl.enableVertexAttribArray(p.a.aP);gl.enableVertexAttribArray(p.a.aU);
 for(let L=Math.max(2,z-3);L<=z;L++){const n=1<<L,cx=Math.floor((POSE.lon+180)/360*n),cy=Math.floor((1-Math.asinh(Math.tan(lat*RAD))/Math.PI)/2*n);
  for(const[dx,dy]of TORD){const t=tileGet(L,cx+dx,cy+dy);if(!t)continue;if(!t.st&&L>=z-2)tileLoad(t);if(t.st!==2)continue;
   gl.uniform1f(p.u.uA,A*Math.min(1,(NOW-t.t0)/350));gl.bindTexture(gl.TEXTURE_2D,t.tex);gl.bindBuffer(gl.ARRAY_BUFFER,t.vbo);gl.vertexAttribPointer(p.a.aP,3,gl.FLOAT,false,20,0);gl.vertexAttribPointer(p.a.aU,2,gl.FLOAT,false,20,12);gl.drawArrays(gl.TRIANGLES,0,t.n)}}
 gl.disableVertexAttribArray(p.a.aU);
 if(TILES.size>280)for(const[k,t]of TILES)if(NOW-t.used>6000&&t.st!==1){if(t.tex)gl.deleteTexture(t.tex);if(t.vbo)gl.deleteBuffer(t.vbo);TILES.delete(k)}}
const TORD=(()=>{const o=[];for(let y=-2;y<=2;y++)for(let x=-2;x<=2;x++)o.push([x,y]);return o.sort((a,b)=>Math.hypot(a[0],a[1])-Math.hypot(b[0],b[1]))})();
