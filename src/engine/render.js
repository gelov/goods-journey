'use strict';
/* ================= render ================= */
const KEY=nrm([-.45,.8,.5]),BG=[.035,.04,.06],VIEW={data:true};
function resize(){const r=cv.getBoundingClientRect();GLS.cw=Math.max(1,r.width);GLS.ch=Math.max(1,r.height);const dpr=Math.min(window.devicePixelRatio||1,2),w=Math.round(GLS.cw*dpr),h=Math.round(GLS.ch*dpr);if(w!==GLS.w||h!==GLS.h){GLS.w=w;GLS.h=h;cv.width=w;cv.height=h;if(FB.pick){gl.deleteFramebuffer(FB.pick.f);gl.deleteTexture(FB.pick.t);gl.deleteRenderbuffer(FB.pick.d)}FB.pick=fbo(Math.max(2,w>>1),Math.max(2,h>>1))}}
function drawSite(p,S,vp){gl.useProgram(p.p);gl.uniformMatrix4fv(p.u.uVP,false,f32(vp));gl.uniform1f(p.u.uT,T);gl.uniform1f(p.u.uGrow,Math.max(.02,out(FADE)));
 gl.uniformMatrix4fv(p.u.uM,false,f32(ID));const sm=S.meshes[STYLE];bindMesh(p,sm);gl.drawArrays(gl.TRIANGLES,0,sm.n);
 if(VIEW.data&&p===PR.main){bindMesh(p,DSITE[S.k].mesh);gl.drawArrays(gl.TRIANGLES,0,DSITE[S.k].mesh.n)}
 for(const m of MOV){if(m.k!==S.k||!m.vis)continue;gl.uniformMatrix4fv(p.u.uM,false,f32(m.m));const mm=m.meshes[STYLE];bindMesh(p,mm);gl.drawArrays(gl.TRIANGLES,0,mm.n)}}
function render(){let LVP=ID;
 gl.bindFramebuffer(gl.FRAMEBUFFER,FB.sh.f);gl.viewport(0,0,2048,2048);gl.clearColor(1,1,1,1);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);gl.enable(gl.DEPTH_TEST);gl.disable(gl.BLEND);gl.disable(gl.CULL_FACE);
 if(PRIM){const S=clamp(X.d*.62,60,460),c=[PRIM.tgt[0],0,PRIM.tgt[2]];LVP=mul(ortho(-S,S,-S,S,500-S*1.7,500+S*1.7),lookAt([c[0]+KEY[0]*500,KEY[1]*500,c[2]+KEY[2]*500],c,[0,1,0]));gl.useProgram(PR.sh.p);gl.uniformMatrix4fv(PR.sh.u.uL,false,f32(LVP));drawSite(PR.sh,PRIM,LVP)}
 gl.bindFramebuffer(gl.FRAMEBUFFER,null);gl.viewport(0,0,GLS.w,GLS.h);gl.clearColor(BG[0],BG[1],BG[2],1);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
 /* globe */
 const g=PR.gl;gl.useProgram(g.p);gl.disable(gl.DEPTH_TEST);gl.enable(gl.CULL_FACE);gl.bindBuffer(gl.ARRAY_BUFFER,GMESH.b);gl.enableVertexAttribArray(g.a.aP);gl.vertexAttribPointer(g.a.aP,3,gl.FLOAT,false,12,0);
 const up=llu(POSE.lon,POSE.lat),east=[Math.cos(POSE.lon*RAD),0,-Math.sin(POSE.lon*RAD)];gl.uniform3fv(g.u.uSun,nrm([up[0]+east[0]*.45,up[1]+.35,up[2]+east[2]*.45]));gl.uniform3fv(g.u.uEye,X.eyeG);gl.uniform1f(g.u.uDet,.16*(1-ss(2500,14000,X.d)));
 gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,GTEX);gl.uniform1i(g.u.uTex,0);
 gl.cullFace(gl.FRONT);gl.enable(gl.BLEND);gl.blendFunc(gl.ONE,gl.ONE);gl.uniform1f(g.u.uAtm,1);gl.uniformMatrix4fv(g.u.uVP,false,f32(mul(X.gvp,sc(1.045,1.045,1.045))));gl.drawArrays(gl.TRIANGLES,0,GMESH.n);
 gl.cullFace(gl.BACK);gl.disable(gl.BLEND);gl.uniform1f(g.u.uAtm,0);gl.uniformMatrix4fv(g.u.uVP,false,f32(X.gvp));gl.drawArrays(gl.TRIANGLES,0,GMESH.n);gl.disable(gl.CULL_FACE);drawTiles();
 /* routes */
 const ra=ss(700,2400,X.d);if(ra>.01){buildRibbons();const r=PR.rb;gl.useProgram(r.p);gl.uniformMatrix4fv(r.u.uVP,false,f32(X.gvp));gl.uniform3fv(r.u.uEye,X.eyeG);gl.uniform1f(r.u.uT,T);gl.uniform1f(r.u.uA,ra);
  gl.enableVertexAttribArray(r.a.aP);gl.vertexAttribPointer(r.a.aP,3,gl.FLOAT,false,32,0);gl.enableVertexAttribArray(r.a.aC);gl.vertexAttribPointer(r.a.aC,4,gl.FLOAT,false,32,12);gl.enableVertexAttribArray(r.a.aT);gl.vertexAttribPointer(r.a.aT,1,gl.FLOAT,false,32,28);
  gl.enable(gl.BLEND);gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);gl.uniform1f(r.u.uCull,1);gl.uniform1f(r.u.uPul,0);gl.drawArrays(gl.TRIANGLES,0,RN[0]);gl.uniform1f(r.u.uPul,1);gl.drawArrays(gl.TRIANGLES,RN[0],RN[1]-RN[0]);gl.uniform1f(r.u.uCull,0);gl.drawArrays(gl.TRIANGLES,RN[1],RN[2]-RN[1]);gl.disableVertexAttribArray(r.a.aC);gl.disableVertexAttribArray(r.a.aT)}
 /* sites and the travelling vehicle */
 gl.enable(gl.DEPTH_TEST);gl.clear(gl.DEPTH_BUFFER_BIT);gl.enable(gl.BLEND);gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);
 const p=PR.main;gl.useProgram(p.p);gl.uniform3fv(p.u.uKey,KEY);gl.uniform1f(p.u.uFocus,FOCUS);gl.uniform1f(p.u.uSty,STYLE==='industrial'?1:0);gl.uniform1f(p.u.uHover,HOVER);gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,FB.sh.t);gl.uniform1i(p.u.uSh,0);gl.uniformMatrix4fv(p.u.uL,false,f32(LVP));
 const mk=activeMarker(),ma=ss(1300,2800,X.d);MARK=null;
 if(mk>=0&&ma>.01){const r=routeAt(mk,MKU[mk]()),Qg=Qm(r.g[0],r.g[1]),Mm=mul(tr(0,-RS,0),mul(mul(X.Qf,tp(Qg)),tr(0,RS,0))),n=xp(Qg,r.nx),yaw=Math.atan2(n[0],n[2]),ship=mk===1,k=X.d*(ship?.0011:.0032);MARK={g:r.g,mk};
  gl.uniform3fv(p.u.uEye,X.eye);gl.uniform2f(p.u.uCen,0,0);gl.uniform2f(p.u.uR,1e9,2e9);gl.uniform1f(p.u.uFade,ma);gl.uniform1f(p.u.uBias,10);gl.uniformMatrix4fv(p.u.uVP,false,f32(mul(X.PV,Mm)));gl.uniform1f(p.u.uT,T);gl.uniform1f(p.u.uGrow,1);
  gl.uniformMatrix4fv(p.u.uM,false,f32(trs(0,ship?1.6*k:0,0,yaw,k)));const m=(ship?SHBR:LORF).meshes[STYLE];bindMesh(p,m);gl.drawArrays(gl.TRIANGLES,0,m.n)}
 for(const S of SITES){if(!S.on)continue;gl.useProgram(p.p);gl.uniform3fv(p.u.uEye,S.eye);gl.uniform2f(p.u.uCen,S.c[0],S.c[1]);gl.uniform2f(p.u.uR,S.r0,S.r1);gl.uniform1f(p.u.uFade,FADE);gl.uniform1f(p.u.uBias,S===PRIM?.0016:10);drawSite(p,S,S.vp)}
 if(VIEW.data&&PRIM&&FADE>.3){const n=stepData(PRIM.k),q=PR.pt;gl.useProgram(q.p);gl.uniformMatrix4fv(q.u.uVP,false,f32(PRIM.vp));gl.uniform1f(q.u.uPx,GLS.h/.51);gl.uniform1f(q.u.uA,FADE);gl.bindBuffer(gl.ARRAY_BUFFER,PVBO);gl.bufferData(gl.ARRAY_BUFFER,PARR.subarray(0,n*7),gl.DYNAMIC_DRAW);
  gl.enableVertexAttribArray(q.a.aP);gl.vertexAttribPointer(q.a.aP,3,gl.FLOAT,false,28,0);gl.enableVertexAttribArray(q.a.aA);gl.vertexAttribPointer(q.a.aA,4,gl.FLOAT,false,28,12);gl.depthMask(false);gl.drawArrays(gl.POINTS,0,n);gl.depthMask(true)}
 gl.disable(gl.BLEND)}
let MARK=null;
