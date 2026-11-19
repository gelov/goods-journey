'use strict';
/* ================= loop ================= */
let last=0,scrubbing=false;
function frame(t){requestAnimationFrame(frame);const dt=Math.min(.1,(t-last)/1000||.016);last=t;NOW=t;T=t/1000;stepTweens();
 if(STATE.started&&STATE.playing&&!STATE.hold){STATE.t+=dt*spd()*warp(STATE.idx);const D=SCRIPT[STATE.idx].dur;if(STATE.t>=D){STATE.t=D;if(STATE.mode==='guided'&&STATE.att&&STATE.idx<STAGES.length-1)goStage(STATE.idx+1);else{STATE.playing=false;syncCtl()}}}
 for(const m of MOV)m.upd(m);legPost();legRoadsTick();trackTick(dt);
 resize();stepCam(dt);render();updateLabels();updateTrack();if(document.activeElement!==$('#scrub'))$('#scrub').value=STATE.t}
/* draw every mesh once off-screen: some drivers only finish uploading a buffer on first use, which shows as a hitch when a site first appears */
function warmGPU(){const F=FB.pick,p=PR.pick;if(!F)return;gl.bindFramebuffer(gl.FRAMEBUFFER,F.f);gl.viewport(0,0,F.w,F.h);gl.useProgram(p.p);gl.uniformMatrix4fv(p.u.uVP,false,f32(ID));gl.uniformMatrix4fv(p.u.uM,false,f32(ID));
 for(const S of SITES)for(const n in S.meshes){bindMesh(p,S.meshes[n]);gl.drawArrays(gl.TRIANGLES,0,S.meshes[n].n)}for(const m of MOV)for(const n in m.meshes){bindMesh(p,m.meshes[n]);gl.drawArrays(gl.TRIANGLES,0,m.meshes[n].n)}gl.bindFramebuffer(gl.FRAMEBUFFER,null)}
function main(){gl=cv.getContext('webgl',{antialias:true,alpha:false})||cv.getContext('experimental-webgl');if(!gl){$('#nogl').hidden=false;cv.hidden=true;return}
 gl.enable(gl.DEPTH_TEST);gl.depthFunc(gl.LEQUAL);
 PR.main=prog(VS,FS);PR.sh=prog(VS,FSH);PR.pick=prog(VS,FPK);PR.pt=prog(VP,FP);PR.gl=prog(VG,FG);PR.sp=prog(VSP,FSP);initMelons();SPB=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,SPB);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),gl.STATIC_DRAW);
 addEventListener('pointermove',e=>{if(REDUCED)return;SPT[0]=e.clientX/innerWidth-.5;SPT[1]=.5-e.clientY/innerHeight});PR.rb=prog(VR,FR);PR.tl=prog(VT,FT);FB.sh=fbo(2048,2048);
 setStyle(STYLE);buildData();buildGlobe();buildUI();initTrackUI();initSettings();
 /* build the other style in the background so the first switch is instant */
 setTimeout(()=>{for(const n in STYLES)buildStyle(n);warmGPU()},300);initControls();resize();
 initManifestUI();initCharacters();APPLY_READY=true;if(DATA.man)applyManifest(DATA.man);flyTo(()=>introView(),2800);syncTL();
 let h='';try{h=location.hash.slice(1)}catch(e){}const m=/^s(\d+)(?:@([\d.]+))?$/.exec(h);
 if(m){start('guided');goStage(+m[1]-1);if(m[2]){STATE.t=+m[2];STATE.playing=false;STATE.hold=false;FLY=null;STATE.att=true;syncCtl()}}else if(h==='free')$('#bExplore').click();
 requestAnimationFrame(t=>{last=t;frame(t)})}
initManifests().then(main);
window.__mj={POSE,STATE,STAGES,SCRIPT,SITES,goStage,ENT,focusEnt,setMode,flyTo,follow};
