'use strict';
/* ================= loop ================= */
let last=0,scrubbing=false;
function frame(t){requestAnimationFrame(frame);const dt=Math.min(.1,(t-last)/1000||.016);last=t;NOW=t;T=t/1000;stepTweens();
 if(STATE.started&&STATE.playing&&!STATE.hold){STATE.t+=dt;const D=SCRIPT[STATE.idx].dur;if(STATE.t>=D){STATE.t=D;if(STATE.mode==='guided'&&STATE.att&&STATE.idx<STAGES.length-1)goStage(STATE.idx+1);else{STATE.playing=false;syncCtl()}}}
 for(const m of MOV)m.upd(m);
 resize();stepCam(dt);render();updateLabels();if(document.activeElement!==$('#scrub'))$('#scrub').value=STATE.t}
function main(){gl=cv.getContext('webgl',{antialias:true,alpha:false})||cv.getContext('experimental-webgl');if(!gl){$('#nogl').hidden=false;cv.hidden=true;return}
 gl.enable(gl.DEPTH_TEST);gl.depthFunc(gl.LEQUAL);
 PR.main=prog(VS,FS);PR.sh=prog(VS,FSH);PR.pick=prog(VS,FPK);PR.pt=prog(VP,FP);PR.gl=prog(VG,FG);PR.rb=prog(VR,FR);PR.tl=prog(VT,FT);FB.sh=fbo(2048,2048);
 buildWorld();SITES.forEach((S,k)=>{S.mesh=upload(VV[k]);VV[k]=null});V=[];buildMovers();buildData();buildGlobe();buildUI();initControls();resize();
 flyTo(()=>({lon:-30,lat:10,ry:0,rx:1.45,ld:Math.log(44000)}),2800);syncTL();
 let h='';try{h=location.hash.slice(1)}catch(e){}const m=/^s(\d+)(?:@([\d.]+))?$/.exec(h);
 if(m){start('guided');goStage(+m[1]-1);if(m[2]){STATE.t=+m[2];STATE.playing=false;STATE.hold=false;FLY=null;STATE.att=true;syncCtl()}}else if(h==='free')$('#bExplore').click();
 requestAnimationFrame(t=>{last=t;frame(t)})}
main();
window.__mj={POSE,STATE,STAGES,SCRIPT,SITES,goStage,ENT,focusEnt,setMode,flyTo,follow};
