'use strict';
/* ================= rigged characters from GLB (glTF 2.0) =================
   A small loader for one skinned humanoid: mesh, skin, node hierarchy, animation clips and base colour (factor, or a texture
   sampled per vertex). Skinning runs on the CPU into the engine's usual vertex layout, so characters get the same lighting,
   shadows, highlight, picking and fade as everything else, with no extra shader. Workers use the model when one is configured
   (CONFIG.characters.url, or ?characters=path for a test) and the camera is close; otherwise, and if loading fails, they use
   the built-in worker model. */
const CHAR={models:{}};
function glbParse(buf){const dv=new DataView(buf);if(dv.getUint32(0,true)!==0x46546C67)throw new Error('not a .glb file');let o=12,json=null,bin=null;
 while(o<buf.byteLength){const len=dv.getUint32(o,true),ty=dv.getUint32(o+4,true),c=buf.slice(o+8,o+8+len);if(ty===0x4E4F534A)json=JSON.parse(new TextDecoder().decode(c));else if(ty===0x004E4942)bin=c;o+=8+len}
 if(!json||!bin)throw new Error('missing JSON or binary chunk');return{J:json,bin}}
function glbAcc(J,bin,i){const a=J.accessors[i],bv=J.bufferViews[a.bufferView],n={SCALAR:1,VEC2:2,VEC3:3,VEC4:4,MAT4:16}[a.type],TA={5126:Float32Array,5125:Uint32Array,5123:Uint16Array,5121:Uint8Array,5122:Int16Array,5120:Int8Array}[a.componentType];
 const es=TA.BYTES_PER_ELEMENT,st=bv.byteStride||n*es,base=(bv.byteOffset||0)+(a.byteOffset||0),out=new Float32Array(a.count*n),dv=new DataView(bin),rd={5126:(p)=>dv.getFloat32(p,true),5125:(p)=>dv.getUint32(p,true),5123:(p)=>dv.getUint16(p,true),5121:(p)=>dv.getUint8(p),5122:(p)=>dv.getInt16(p,true),5120:(p)=>dv.getInt8(p)}[a.componentType];
 const nm=a.normalized?{5121:255,5123:65535,5120:127,5122:32767}[a.componentType]||1:1;for(let k=0;k<a.count;k++)for(let c=0;c<n;c++)out[k*n+c]=rd(base+k*st+c*es)/nm;return{d:out,n,count:a.count}}
const qMat=(t,q,s)=>{const[x,y,z,w]=q,m=I();m[0]=(1-2*(y*y+z*z))*s[0];m[1]=2*(x*y+z*w)*s[0];m[2]=2*(x*z-y*w)*s[0];m[4]=2*(x*y-z*w)*s[1];m[5]=(1-2*(x*x+z*z))*s[1];m[6]=2*(y*z+x*w)*s[1];m[8]=2*(x*z+y*w)*s[2];m[9]=2*(y*z-x*w)*s[2];m[10]=(1-2*(x*x+y*y))*s[2];m[12]=t[0];m[13]=t[1];m[14]=t[2];return m};
async function loadCharacterModel(url,heightM){try{const r=await fetch(url,{cache:'force-cache'});if(!r.ok)throw new Error('HTTP '+r.status);const{J,bin}=glbParse(await r.arrayBuffer());
  const N=J.nodes||[],par=N.map(()=>-1);N.forEach((n,i)=>(n.children||[]).forEach(c=>par[c]=i));const order=[];const visit=i=>{order.push(i);(N[i].children||[]).forEach(visit)};N.forEach((n,i)=>{if(par[i]<0)visit(i)});
  /* every skinned mesh in the file (characters are often split into head, body, clothes) is merged; their skins are joined
     into one joint list by node, so each mesh's joint indices are remapped */
  const SM=N.map((n,i)=>i).filter(i=>N[i].mesh!=null&&N[i].skin!=null);if(!SM.length)throw new Error('no skinned mesh in the file');
  const joints=[],jix={},ibmL=[];for(const i of SM){const sk=J.skins[N[i].skin],ib=sk.inverseBindMatrices!=null?glbAcc(J,bin,sk.inverseBindMatrices).d:null;sk.joints.forEach((j,k)=>{if(jix[j]==null){jix[j]=joints.length;joints.push(j);ibmL.push(ib?Array.from(ib.subarray(k*16,k*16+16)):Array.from(I()))}})}
  const ibm=new Float32Array(ibmL.flat());
  const P=[],Nr=[],Co=[],Jn=[],Wt=[];const imgs={};
  for(const mi of SM){const remap=J.skins[N[mi].skin].joints.map(j=>jix[j]);
  for(const pr of J.meshes[N[mi].mesh].primitives){const A=pr.attributes,pos=glbAcc(J,bin,A.POSITION),nor=A.NORMAL!=null?glbAcc(J,bin,A.NORMAL):null,uv=A.TEXCOORD_0!=null?glbAcc(J,bin,A.TEXCOORD_0):null,jo=glbAcc(J,bin,A.JOINTS_0),we=glbAcc(J,bin,A.WEIGHTS_0);
   const ix=pr.indices!=null?glbAcc(J,bin,pr.indices).d:Float32Array.from({length:pos.count},(_,k)=>k),mat=(J.materials||[])[pr.material]||{},pb=mat.pbrMetallicRoughness||{},f=pb.baseColorFactor||[.8,.8,.8,1];
   let tex=null;if(pb.baseColorTexture){const ti=J.textures[pb.baseColorTexture.index].source;tex=imgs[ti]||(imgs[ti]=await glbImage(J,bin,ti))}
   for(const v of ix){P.push(pos.d[v*3],pos.d[v*3+1],pos.d[v*3+2]);Nr.push(...(nor?[nor.d[v*3],nor.d[v*3+1],nor.d[v*3+2]]:[0,1,0]));for(let c=0;c<4;c++){Jn.push(remap[jo.d[v*4+c]]||0);Wt.push(we.d[v*4+c])}
    let c=[f[0],f[1],f[2]];if(tex&&uv){const u=uv.d[v*2],w=uv.d[v*2+1],x=Math.min(tex.w-1,Math.max(0,Math.floor((u-Math.floor(u))*tex.w))),y=Math.min(tex.h-1,Math.max(0,Math.floor((w-Math.floor(w))*tex.h))),k=(y*tex.w+x)*4;c=[c[0]*tex.d[k]/255,c[1]*tex.d[k+1]/255,c[2]*tex.d[k+2]/255]}
    /* the scene shader expects colours in display space; glTF colours are linear */Co.push(...c.map(x=>Math.pow(x,1/2.2)))}}}
  const clips={};(J.animations||[]).forEach((an,ai)=>{const ch=an.channels.map(c=>{const s=an.samplers[c.sampler];return{node:c.target.node,path:c.target.path,t:glbAcc(J,bin,s.input).d,v:glbAcc(J,bin,s.output),step:s.interpolation==='STEP'}}).filter(c=>c.path!=='weights');
   const dur=Math.max(...ch.map(c=>c.t[c.t.length-1]),.001);clips[an.name||('clip'+ai)]={ch,dur}});
  const nameIx={};N.forEach((n,i)=>{if(n.name)nameIx[n.name]=i});const M={nameIx,N,par,order,joints,ibm,P:new Float32Array(P),Nr:new Float32Array(Nr),Co:new Float32Array(Co),Jn:new Uint16Array(Jn),Wt:new Float32Array(Wt),clips,names:Object.keys(clips),n:P.length/3};
  /* fit: feet on the ground, centred, scaled to the configured height, measured in the bind pose */
  const W=charWorld(M,null,0),jm=charJoints(M,W);const tmp=new Float32Array(M.n*3);skinInto(M,jm,tmp,null);let lo=[1e9,1e9,1e9],hi=[-1e9,-1e9,-1e9];for(let k=0;k<M.n;k++)for(let c=0;c<3;c++){lo[c]=Math.min(lo[c],tmp[k*3+c]);hi[c]=Math.max(hi[c],tmp[k*3+c])}
  const C=CONFIG.characters||{},s=(heightM||C.heightM||1.8)*WK/Math.max(.01,hi[1]-lo[1]);M.fit=mul(mul(rY((C.rotateYDeg||0)*RAD),sc(s,s,s)),tr(-(lo[0]+hi[0])/2,-lo[1],-(lo[2]+hi[2])/2));
  return M}catch(e){console.warn('Character model '+url+' not used: '+e.message);return{err:e.message}}}
async function glbImage(J,bin,i){const im=J.images[i],bv=J.bufferViews[im.bufferView],blob=new Blob([new Uint8Array(bin,bv.byteOffset||0,bv.byteLength)],{type:im.mimeType||'image/png'}),bmp=await createImageBitmap(blob),c=document.createElement('canvas');
 c.width=Math.min(512,bmp.width);c.height=Math.min(512,bmp.height);const x=c.getContext('2d');x.drawImage(bmp,0,0,c.width,c.height);return{w:c.width,h:c.height,d:x.getImageData(0,0,c.width,c.height).data}}
/* sample a clip at time t into each node's local transform, then walk the hierarchy */
/* poses the files do not include, made by bending named bones (radians, about the character's left-right axis at the joint;
   negative swings a limb forwards). sit: driving a forklift. */
/* carry: both arms forward and slightly out, elbows bent, to hold a crate by its end boards; push: forearms forward at waist
   height onto a handle. These start from the idle clip's arms (armsFrom), so walking does not swing a held load. Values are
   [forward/back, twist, out] in radians, applied at the joint in the character's frame. */
const CHAR_POSES={carry:{armsFrom:'idle','UpperArm.L':[-.95,0,.42],'UpperArm.R':[-.95,0,-.42],'LowerArm.L':[-.55,0,0],'LowerArm.R':[-.55,0,0]},
 push:{armsFrom:'idle','UpperArm.L':[-.5,0,.12],'UpperArm.R':[-.5,0,-.12],'LowerArm.L':[-.45,0,0],'LowerArm.R':[-.45,0,0]},
 sit:{'UpperLeg.L':-1.45,'UpperLeg.R':-1.45,'LowerLeg.L':1.5,'LowerLeg.R':1.5,'UpperArm.L':-.55,'UpperArm.R':-.55,'LowerArm.L':-.75,'LowerArm.R':-.75}};
const ARMBONE=/Arm|Shoulder|Wrist|Index|Middle|Ring|Pinky|Thumb/;
function charWorld(M,clip,t,pose,armClip){const ov={};if(pose)for(const k in pose)if(M.nameIx[k]!=null)ov[M.nameIx[k]]=pose[k];const L=M.N.map(n=>({t:(n.translation||[0,0,0]).slice(),r:(n.rotation||[0,0,0,1]).slice(),s:(n.scale||[1,1,1]).slice(),m:n.matrix}));
 if(!M.armNode)M.armNode=M.N.map(n=>ARMBONE.test(n.name||''));
 const sampleClip=(clip,t,arms)=>{if(clip)for(const c of clip.ch){if(arms!=null&&M.armNode[c.node]!==arms)continue;const T=c.t,n=T.length;let i=0;const tt=Math.min(t,T[n-1]);while(i<n-2&&T[i+1]<tt)i++;const f=c.step||n<2?0:clamp((tt-T[i])/((T[i+1]-T[i])||1),0,1),k=c.v.n,a=c.v.d.subarray(i*k,i*k+k),b=c.v.d.subarray(Math.min(n-1,i+1)*k,Math.min(n-1,i+1)*k+k),o=L[c.node];o.m=null;
  if(c.path==='rotation'){const d=a[0]*b[0]+a[1]*b[1]+a[2]*b[2]+a[3]*b[3],sg=d<0?-1:1,q=[0,1,2,3].map(j=>a[j]*(1-f)+b[j]*f*sg),l=Math.hypot(...q)||1;o.r=q.map(x=>x/l)}else{const v=[0,1,2].map(j=>a[j]+(b[j]-a[j])*f);if(c.path==='translation')o.t=v;else o.s=v}}};
 sampleClip(clip,t,armClip?false:null);if(armClip)sampleClip(armClip,0,true);
 const W=new Array(M.N.length);for(const i of M.order){const l=L[i],m=l.m?Float64Array.from(l.m):qMat(l.t,l.r,l.s);W[i]=M.par[i]<0?m:mul(W[M.par[i]],m);
  if(ov[i]!=null){const o=typeof ov[i]==='number'?[ov[i],0,0]:ov[i],p=[W[i][12],W[i][13],W[i][14]];W[i]=mul(mul(tr(p[0],p[1],p[2]),mul(mul(rX(o[0]),mul(rY(o[1]),rZ(o[2]))),tr(-p[0],-p[1],-p[2]))),W[i])}}return W}
function charJoints(M,W){return M.joints.map((j,k)=>M.ibm?mul(W[j],Float64Array.from(M.ibm.subarray(k*16,k*16+16))):W[j])}
function skinInto(M,jm,pos,nor){const P=M.P,Nn=M.Nr,J=M.Jn,Wt=M.Wt;for(let v=0;v<M.n;v++){let x=0,y=0,z=0,a=0,b=0,c=0;const px=P[v*3],py=P[v*3+1],pz=P[v*3+2],nx=Nn[v*3],ny=Nn[v*3+1],nz=Nn[v*3+2];
 for(let k=0;k<4;k++){const w=Wt[v*4+k];if(!w)continue;const m=jm[J[v*4+k]];x+=w*(m[0]*px+m[4]*py+m[8]*pz+m[12]);y+=w*(m[1]*px+m[5]*py+m[9]*pz+m[13]);z+=w*(m[2]*px+m[6]*py+m[10]*pz+m[14]);if(nor){a+=w*(m[0]*nx+m[4]*ny+m[8]*nz);b+=w*(m[1]*nx+m[5]*ny+m[9]*nz);c+=w*(m[2]*nx+m[6]*ny+m[10]*nz)}}
 pos[v*3]=x;pos[v*3+1]=y;pos[v*3+2]=z;if(nor){const l=Math.hypot(a,b,c)||1;nor[v*3]=a/l;nor[v*3+1]=b/l;nor[v*3+2]=c/l}}}
/* the clip for a pose: walking, carrying, bending, sitting or standing, by the names given in CONFIG.characters.clips */
function charClip(M,q){const C=(CONFIG.characters||{}).clips||{},get=k=>C[k]&&M.clips[C[k]]?M.clips[C[k]]:null,walk=get('walk')||M.clips[M.names[0]];
 if(q.sit){const c=get('idle')||walk;return{c,t:get('idle')?(T/c.dur)%1:0,pose:CHAR_POSES.sit}}
 const held=q.armPose&&CHAR_POSES[q.armPose],arm=held?get(held.armsFrom)||walk:null,wrap=r=>held?Object.assign(r,{pose:held,arm}):r;
 if((q.amt||0)>.3)return wrap({c:get('carryWalk')&&(q.carry||0)>.5?get('carryWalk'):walk,t:((q.phase||0)/TAU%1+1)%1});const k=!held&&(q.bend||0)>.4&&get('pick')?'pick':(q.carry||0)>.5&&get('carry')?'carry':get('idle')?'idle':null;
 return wrap(k?{c:get(k),t:(T/get(k).dur)%1}:{c:walk,t:0})}
/* vertices for one character this frame, in the engine's layout, cached per frame */
function charMesh(m){const M=m.cModel;if(m.cFrame===NOW&&m.cMesh)return m.cMesh;const q=m.cq||{},sel=charClip(M,q),W=charWorld(M,sel.c,sel.t*sel.c.dur,sel.pose,sel.arm),jm=charJoints(M,W).map(j=>mul(M.fit,j));
 if(!m.cPos||m.cPos.length!==M.n*3){m.cPos=new Float32Array(M.n*3);m.cNor=new Float32Array(M.n*3);m.cArr=new Float32Array(M.n*12);m.cMesh={b:m.cMesh?m.cMesh.b:gl.createBuffer(),n:M.n}}
 skinInto(M,jm,m.cPos,m.cNor);
 /* clips move the hips up and down; put the lowest point (a foot) on the ground every frame so feet neither sink nor float */
 let lo=0;if(!q.sit){lo=1e9;for(let v=1;v<M.n*3;v+=3)if(m.cPos[v]<lo)lo=m.cPos[v];for(let v=1;v<M.n*3;v+=3)m.cPos[v]-=lo}
 /* hand attachment points: the middle of each palm, in the worker's own frame and in the world, for objects held this frame */
 if(M.nameIx['Wrist.L']!=null){m.cHandsL=['L','R'].map(s=>{const w=mul(M.fit,W[M.nameIx['Wrist.'+s]]),k=M.nameIx['Middle1.'+s],f=k!=null?mul(M.fit,W[k]):w;return[(w[12]+f[12])/2,(w[13]+f[13])/2-lo,(w[14]+f[14])/2]});m.cHands=m.cHandsL.map(h=>xp(m.m,h));m.cHandsAt=NOW}
 const A=m.cArr,pid=m.pid;for(let v=0;v<M.n;v++){const o=v*12;A[o]=m.cPos[v*3];A[o+1]=m.cPos[v*3+1];A[o+2]=m.cPos[v*3+2];A[o+3]=m.cNor[v*3];A[o+4]=m.cNor[v*3+1];A[o+5]=m.cNor[v*3+2];A[o+6]=M.Co[v*3];A[o+7]=M.Co[v*3+1];A[o+8]=M.Co[v*3+2];A[o+9]=pid;A[o+10]=0;A[o+11]=0}
 gl.bindBuffer(gl.ARRAY_BUFFER,m.cMesh.b);gl.bufferData(gl.ARRAY_BUFFER,A,gl.DYNAMIC_DRAW);m.cFrame=NOW;return m.cMesh}
/* which loaded model a worker role uses (CONFIG.characters.models[name].roles), and whether the camera is close enough */
function charModelFor(role){for(const n in CHAR.models){const e=CHAR.models[n];if(e.M&&!e.M.err&&(!e.roles||!e.roles.length||e.roles.includes(role)))return e.M}return null}
const charNear=k=>PRIM&&PRIM.k===k&&X.d<((CONFIG.characters||{}).lodDistance||320);
function initCharacters(){const C=CONFIG.characters||{};let models=C.models||{};try{const q=new URLSearchParams(location.search).get('characters');if(q&&/^[\w\/.\-]+\.glb$/i.test(q))models={test:{url:q}}}catch(e){}
 for(const n in models){const e=CHAR.models[n]={roles:models[n].roles,M:null};loadCharacterModel(models[n].url,models[n].heightM).then(M=>{e.M=M})}}
