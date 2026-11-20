'use strict';
/* ================= picking / focus ================= */
let FOCUS=0,HOVER=0,hovT=0;
function pickAt(cx,cy){if(!PRIM||FADE<.5)return 0;const F=FB.pick;gl.bindFramebuffer(gl.FRAMEBUFFER,F.f);gl.viewport(0,0,F.w,F.h);gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);gl.enable(gl.DEPTH_TEST);gl.disable(gl.BLEND);drawSite(PR.pick,PRIM,PRIM.vp);
 const px=clamp(Math.floor(cx/GLS.cw*F.w),0,F.w-1),py=clamp(Math.floor((1-cy/GLS.ch)*F.h),0,F.h-1),o=new Uint8Array(4);gl.readPixels(px,py,1,1,gl.RGBA,gl.UNSIGNED_BYTE,o);gl.bindFramebuffer(gl.FRAMEBUFFER,null);const id=o[0]+o[1]*256;return ENT[id]?id:0}
function hoverAt(x,y){if(NOW-hovT<110||!STATE.started)return;hovT=NOW;HOVER=pickAt(x,y);cv.classList.toggle('hov',!!HOVER)}
function focusEnt(id,close){const e=ENT[id];if(!e)return;FOCUS=id;const b=e.bb,m=e.mover,size=m?16:Math.max(b[3]-b[0],b[5]-b[2],8),d=clamp(size*(close?1.5:2.1),22,260),pos=()=>m?geoOf(e.site,m.p[0],m.p[2]):geoOf(e.site,(b[0]+b[3])/2,(b[2]+b[5])/2);
 userTook();const ry=POSE.ry,rx=clamp(POSE.rx,.4,.9);flyTo(()=>{const g=pos();return{lon:g[0],lat:g[1],ry,rx,ld:Math.log(d)}},1100,()=>{FOLLOW=m?pos:null});showPanel(e.stage,e)}
function clickAt(x,y){const id=pickAt(x,y);if(id){focusEnt(id);if(typeof shipOnPick==='function')shipOnPick(ENT[id])}else{FOCUS=0;if(STATE.mode==='free')hidePanel()}}
