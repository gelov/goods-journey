'use strict';
/* ================= melons from assets/melon.glb =================
   Every melon in the journey is one instance of the provided model, drawn with its colour texture and normal map. The
   geometry helpers record a melon (position, size, variety, owner id) wherever a melon used to be built as a ball, so all
   existing placements and animations are kept: melons fixed in a site are drawn per site, melons that move are drawn with
   their mover's matrix. Three versions of the model share one texture: the full mesh for the followed melon close up, and
   three simplified ones (vertex clustering) for everything else, chosen by camera distance. Until the file has loaded, a
   plain sphere stands in. */
const MEL={ready:false,ext:null,lod:{},tex:null,nrm:null,white:null,flat:null,prog:{},sites:[],T:[]};
const MELTINT={y:[1.05,1,.9],g:[.78,.98,.72],d:[.72,.56,.42]};
/* the geometry helpers call this instead of building a melon-coloured ball */
function melonKind(c){if(!c||!P)return null;if(c===P.melY)return'y';if(c===P.melG)return'g';if(c.length===3&&((c[0]===.55&&c[1]===.42)||(c[0]===.6&&c[1]===.46)))return'd';return null}
function melonInst(kind,x,y,z,r,sy){const h=Math.sin(x*12.9898+z*78.233+y*37.719)*43758.5453,f=h-Math.floor(h),s=r*(.94+f*.12);
 let m=mul(tr(x,y,z),mul(rY(f*TAU),mul(rX((f-.5)*.25),sc(s,s*(sy||.9)/.97,s))));if(XF)m=mul(XF,m);const t=MELTINT[kind];
 (MOVB?MEL.T:(MEL.sites[CUR]=MEL.sites[CUR]||[])).push(...Array.from(m),t[0],t[1],t[2],PID)}
function melBuf(list){if(!list||!list.length)return null;const b=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,b);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(list),gl.STATIC_DRAW);return{b,n:list.length/20}}
const melTake=()=>{const b=melBuf(MEL.T);MEL.T=[];return b};
function melSites(name){SITES.forEach((S,k)=>{(S.mel=S.mel||{})[name]=melBuf(MEL.sites[k])});MEL.sites=[]}
/* vertex layout: position 3, normal 3, uv 2, textured 1 */
function melUpload(a){const b=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,b);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(a),gl.STATIC_DRAW);return{b,n:a.length/9}}
function melSphere(){const a=[],N=18,M=11,v=(i,j)=>{const u=i/N,w=j/M,ph=u*TAU,th=w*Math.PI,x=Math.sin(th)*Math.cos(ph),y=Math.cos(th),z=Math.sin(th)*Math.sin(ph);return[x,y*.97,z,x,y,z,u,w,1]};
 for(let j=0;j<M;j++)for(let i=0;i<N;i++){const A=v(i,j),B=v(i+1,j),C=v(i+1,j+1),D=v(i,j+1);a.push(...A,...B,...C,...A,...C,...D)}return a}
/* simplify by clustering vertices on a grid (kept apart across texture seams), averaging position, normal and uv */
function melCluster(tris,cell){const key=(p,u)=>Math.round(p[0]/cell)+','+Math.round(p[1]/cell)+','+Math.round(p[2]/cell)+','+Math.round(u[0]*6)+','+Math.round(u[1]*6)+','+u[2],C=new Map(),idx=[];
 for(const t of tris){const k=key(t.p,[t.u[0],t.u[1],t.k]);let c=C.get(k);if(!c){c={p:[0,0,0],n:[0,0,0],u:[0,0],k:t.k,c:0,i:C.size};C.set(k,c)}c.p[0]+=t.p[0];c.p[1]+=t.p[1];c.p[2]+=t.p[2];c.n[0]+=t.n[0];c.n[1]+=t.n[1];c.n[2]+=t.n[2];c.u[0]+=t.u[0];c.u[1]+=t.u[1];c.c++;idx.push(c)}
 const a=[];for(let i=0;i<idx.length;i+=3){const A=idx[i],B=idx[i+1],D=idx[i+2];if(A===B||B===D||A===D)continue;for(const c of[A,B,D]){const nl=Math.hypot(...c.n)||1;a.push(c.p[0]/c.c,c.p[1]/c.c,c.p[2]/c.c,c.n[0]/nl,c.n[1]/nl,c.n[2]/nl,c.u[0]/c.c,c.u[1]/c.c,c.k)}}return a}
async function melTexture(J,bin,i,size){const im=J.images[i],bv=J.bufferViews[im.bufferView],bmp=await createImageBitmap(new Blob([new Uint8Array(bin,bv.byteOffset||0,bv.byteLength)],{type:im.mimeType||'image/jpeg'}));
 const c=document.createElement('canvas');c.width=c.height=size;c.getContext('2d').drawImage(bmp,0,0,size,size);const t=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,t);gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,false);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,c);
 gl.generateMipmap(gl.TEXTURE_2D);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR_MIPMAP_LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);for(const k of[gl.TEXTURE_WRAP_S,gl.TEXTURE_WRAP_T])gl.texParameteri(gl.TEXTURE_2D,k,gl.REPEAT);return t}
function melTex1(rgb){const t=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,t);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,1,1,0,gl.RGBA,gl.UNSIGNED_BYTE,new Uint8Array(rgb));gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.NEAREST);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.NEAREST);return t}
async function loadMelonModel(url){try{const r=await fetch(url,{cache:'force-cache'});if(!r.ok)throw new Error('HTTP '+r.status);const{J,bin}=glbParse(await r.arrayBuffer()),tris=[];
  /* every mesh node, with its own transform; the model's body is textured, the stem uses its flat colour */
  J.nodes.forEach(n=>{if(n.mesh==null)return;const M=qMat(n.translation||[0,0,0],n.rotation||[0,0,0,1],n.scale||[1,1,1]);for(const pr of J.meshes[n.mesh].primitives){const A=pr.attributes,p=glbAcc(J,bin,A.POSITION).d,nn=glbAcc(J,bin,A.NORMAL).d,uv=A.TEXCOORD_0!=null?glbAcc(J,bin,A.TEXCOORD_0).d:null,ix=pr.indices!=null?glbAcc(J,bin,pr.indices).d:null;
   const mat=(J.materials||[])[pr.material]||{},textured=!!(mat.pbrMetallicRoughness&&mat.pbrMetallicRoughness.baseColorTexture),cnt=ix?ix.length:p.length/3;if(!textured&&mat.pbrMetallicRoughness&&mat.pbrMetallicRoughness.baseColorFactor)MEL.stem=mat.pbrMetallicRoughness.baseColorFactor.slice(0,3).map(x=>Math.pow(x,1/2.2));
   for(let q=0;q<cnt;q++){const v=ix?ix[q]:q,x=p[v*3],y=p[v*3+1],z=p[v*3+2],a=nn[v*3],b=nn[v*3+1],c=nn[v*3+2];tris.push({p:[M[0]*x+M[4]*y+M[8]*z+M[12],M[1]*x+M[5]*y+M[9]*z+M[13],M[2]*x+M[6]*y+M[10]*z+M[14]],n:nrm([M[0]*a+M[4]*b+M[8]*c,M[1]*a+M[5]*b+M[9]*c,M[2]*a+M[6]*b+M[10]*c]),u:uv?[uv[v*2],uv[v*2+1]]:[0,0],k:textured?1:0})}}});
  const full=[];for(const t of tris)full.push(...t.p,...t.n,...t.u,t.k);
  const mats=J.materials||[],sk=mats.find(m=>m.pbrMetallicRoughness&&m.pbrMetallicRoughness.baseColorTexture)||{},bi=sk.pbrMetallicRoughness?J.textures[sk.pbrMetallicRoughness.baseColorTexture.index].source:null,ni=sk.normalTexture?J.textures[sk.normalTexture.index].source:null;
  MEL.tex=bi!=null?await melTexture(J,bin,bi,1024):MEL.white;MEL.nrm=ni!=null?await melTexture(J,bin,ni,1024):MEL.flat;
  MEL.lod.hi=melUpload(full);MEL.lod.near=melUpload(melCluster(tris,.12));MEL.lod.far=melUpload(melCluster(tris,.32));MEL.lod.tiny=melUpload(melCluster(tris,.55));MEL.ready=true;
  console.info(`Melon model: ${tris.length/3} triangles; simplified ${MEL.lod.near.n/3}, ${MEL.lod.far.n/3} and ${MEL.lod.tiny.n/3}`)}catch(e){console.warn('Melon model not used, plain spheres shown: '+e.message)}}
const VSM=`attribute vec3 aP,aN;attribute vec2 aU;attribute float aK;attribute vec4 aI0,aI1,aI2,aI3;attribute vec3 aIT;attribute float aIP;
uniform mat4 uVP,uM,uL;uniform float uGrow;varying vec3 vN,vW,vT,vD;varying vec2 vU;varying float vK,vZ;varying vec4 vS;
void main(){mat4 I=mat4(aI0,aI1,aI2,aI3);vec4 w=uM*I*vec4(aP,1.);if(w.y>0.)w.y*=uGrow;vN=mat3(uM)*mat3(I)*aN;vW=w.xyz;vU=aU;vK=aK;vT=aIT;vD=vec3(aIP,0.,0.);vS=uL*vec4(w.xyz+normalize(vN)*.12,1.);gl_Position=uVP*w;vZ=gl_Position.z*.5+.5;}`;
const FSM=(d)=>`${d?'#extension GL_OES_standard_derivatives : enable\n':''}precision highp float;varying vec3 vN,vW,vT,vD;varying vec2 vU;varying float vK,vZ;varying vec4 vS;
uniform sampler2D uSh,uTex,uNrm;uniform vec3 uKey,uEye,uStem;uniform vec2 uCen,uR;uniform float uT,uFocus,uHover,uTrk,uTrkA,uBias,uFade,uSty;
float up(vec4 c){return dot(c,vec4(1.,1./255.,1./65025.,1./16581375.));}
float shadow(){vec3 s=vS.xyz/vS.w*.5+.5;if(s.x<0.||s.x>1.||s.y<0.||s.y>1.||s.z>1.)return 1.;float a=0.;for(int i=-1;i<=1;i++)for(int j=-1;j<=1;j++)a+=(s.z-uBias>up(texture2D(uSh,s.xy+vec2(float(i),float(j))/2048.)))?0.:1.;return a/9.;}
void main(){vec3 N=normalize(vN),Vd=normalize(uEye-vW),c=vK>.5?texture2D(uTex,vU).rgb*vT:uStem;
${d?`if(vK>.5){vec3 q1=dFdx(vW),q2=dFdy(vW);vec2 t1=dFdx(vU),t2=dFdy(vU);vec3 Tg=normalize(q1*t2.t-q2*t1.t),Bt=normalize(cross(N,Tg));vec3 nm=texture2D(uNrm,vU).xyz*2.-1.;N=normalize(mat3(Tg,Bt,N)*vec3(nm.xy*.8,nm.z));}`:''}
float sh=shadow(),ndl=max(dot(N,uKey),0.),h=N.y*.5+.5;
vec3 amb=uSty>.5?mix(vec3(.33,.32,.33),vec3(.52,.58,.68),h):mix(vec3(.40,.38,.34),vec3(.60,.67,.78),h),sun=uSty>.5?vec3(1.1,1.02,.86):vec3(.98,.90,.74);
c=c*(amb+sun*ndl*sh)+pow(max(dot(N,normalize(uKey+Vd)),0.),24.)*.06*sh+pow(1.-max(dot(N,Vd),0.),4.)*.04;
c=(c*(2.51*c+.03))/(c*(2.43*c+.59)+.14);
float f=step(abs(vD.x-uFocus),.5)*step(.5,vD.x);c+=f*(.13+.1*sin(uT*4.))*vec3(1.,.9,.55);c+=step(abs(vD.x-uHover),.5)*step(.5,vD.x)*.09;
if(abs(vD.x-uTrk)<.5&&vD.x>.5){float rim=pow(1.-max(dot(N,Vd),0.),2.);c+=vec3(1.,.8,.25)*(.07+.05*sin(uT*3.)+rim*.55)*uTrkA;}
gl_FragColor=vec4(c,uFade*(1.-smoothstep(uR.x,uR.y,length(vW.xz-uCen))));}`;
const FSMS=`precision highp float;varying float vZ;void main(){vec4 e=fract(vec4(1.,255.,65025.,16581375.)*vZ);e-=e.yzww*vec4(1./255.,1./255.,1./255.,0.);gl_FragColor=e;}`;
const FSMP=`precision highp float;varying vec3 vD;void main(){float id=floor(vD.x+.5);gl_FragColor=vec4(mod(id,256.)/255.,floor(id/256.)/255.,0.,1.);}`;
function initMelons(){MEL.ext=gl.getExtension('ANGLE_instanced_arrays');const d=!!gl.getExtension('OES_standard_derivatives');MEL.prog.main=prog(VSM,FSM(d));MEL.prog.sh=prog(VSM,FSMS);MEL.prog.pick=prog(VSM,FSMP);
 MEL.white=melTex1([255,255,255,255]);MEL.flat=melTex1([128,128,255,255]);MEL.tex=MEL.white;MEL.nrm=MEL.flat;MEL.lod.sphere=melUpload(melSphere());MEL.stem=[.25,.42,.12];loadMelonModel('assets/melon.glb')}
/* draw one batch of melon instances with the program matching the pass the site is being drawn in */
function melDraw(pass,mesh,inst,M){const p=MEL.prog[pass],E=MEL.ext;if(!E||!inst)return;gl.useProgram(p.p);gl.uniformMatrix4fv(p.u.uM,false,f32(M));
 gl.bindBuffer(gl.ARRAY_BUFFER,mesh.b);for(const[k,n,o]of[['aP',3,0],['aN',3,3],['aU',2,6],['aK',1,8]]){const l=p.a[k];if(l==null||l<0)continue;gl.enableVertexAttribArray(l);gl.vertexAttribPointer(l,n,gl.FLOAT,false,36,o*4);E.vertexAttribDivisorANGLE(l,0)}
 gl.bindBuffer(gl.ARRAY_BUFFER,inst.b);const used=[];for(const[k,n,o]of[['aI0',4,0],['aI1',4,4],['aI2',4,8],['aI3',4,12],['aIT',3,16],['aIP',1,19]]){const l=p.a[k];if(l==null||l<0)continue;gl.enableVertexAttribArray(l);gl.vertexAttribPointer(l,n,gl.FLOAT,false,80,o*4);E.vertexAttribDivisorANGLE(l,1);used.push(l)}
 E.drawArraysInstancedANGLE(gl.TRIANGLES,0,mesh.n,inst.n);for(const l of used){E.vertexAttribDivisorANGLE(l,0);gl.disableVertexAttribArray(l)}
 for(const k of['aU','aK']){const l=p.a[k];if(l!=null&&l>=0)gl.disableVertexAttribArray(l)}}
function drawMelons(pass,S,vp,LVP){if(!MEL.ext||!S.mel)return;const p=MEL.prog[pass];gl.useProgram(p.p);gl.uniformMatrix4fv(p.u.uVP,false,f32(vp));
 if(pass==='main'){gl.uniformMatrix4fv(p.u.uL,false,f32(LVP||ID));gl.uniform3fv(p.u.uKey,KEY);gl.uniform3fv(p.u.uEye,S.eye);gl.uniform2f(p.u.uCen,S.c[0],S.c[1]);gl.uniform2f(p.u.uR,S.r0,S.r1);gl.uniform1f(p.u.uFade,FADE*(S.a==null?1:S.a));
  gl.uniform1f(p.u.uBias,S===PRIM?.0016:10);gl.uniform1f(p.u.uT,T);gl.uniform1f(p.u.uFocus,FOCUS);gl.uniform1f(p.u.uHover,HOVER);gl.uniform1f(p.u.uTrk,TRK.pid);gl.uniform1f(p.u.uTrkA,1+TRK.pulse*1.6);gl.uniform1f(p.u.uSty,STYLE==='industrial'?1:0);gl.uniform3fv(p.u.uStem,MEL.stem);
  gl.uniform1i(p.u.uSh,0);gl.activeTexture(gl.TEXTURE1);gl.bindTexture(gl.TEXTURE_2D,MEL.tex);gl.uniform1i(p.u.uTex,1);gl.activeTexture(gl.TEXTURE2);gl.bindTexture(gl.TEXTURE_2D,MEL.nrm);gl.uniform1i(p.u.uNrm,2);gl.activeTexture(gl.TEXTURE0)}
 if(p.u.uGrow)gl.uniform1f(p.u.uGrow,Math.max(.02,out(FADE)));
 /* level of detail by camera distance; shadows always use a coarse version */
 const lod=!MEL.ready?MEL.lod.sphere:pass==='sh'?MEL.lod.tiny:X.d<55?MEL.lod.near:X.d<140?MEL.lod.far:MEL.lod.tiny;drawThis(pass,lod,S.mel[STYLE],ID);
 for(const m of MOV){if(m.k!==S.k||!m.vis||!m.mel||!m.mel[STYLE])continue;const hi=MEL.ready&&m.pid&&m.pid===TID.melon&&X.d<70?MEL.lod.hi:lod;drawThis(pass,hi,m.mel[STYLE],m.m)}}
const drawThis=(pass,mesh,inst,M)=>melDraw(pass,mesh,inst,M);
